---
title: Pinmux 与设备树
outline: deep
---

# Pinmux 与设备树

本文说明 Jetson Orin Nano / NX 在开发调试与量产固件中的 Pinmux、设备树与 Overlay 工作流。本文不替代具体载板 BSP：修改前必须确认核心卡 SKU、载板型号及硬件版本、JetPack / L4T 版本和启动介质。

::: danger 修改错误可能导致设备无法启动
开始前请先备份 DTB、DTBO 和 `/boot/extlinux/extlinux.conf`，并准备 Recovery 刷机宿主机环境。严禁将其他 JetPack 版本、核心卡或载板的 DTB 直接复制到当前设备。
:::

## 选择正确方法

| 目标 | 推荐方法 | 是否适合量产 |
|---|---|---|
| 配置标准 40-pin 上的 SPI / I2C / UART / PWM / I2S | [Jetson-IO](/orin-nano-series/expansion-header) | 开发验证为主 |
| JetPack 6 临时将引脚切换为 GPIO | PADCTL 寄存器 + `libgpiod` | 否，重启后失效 |
| 固化引脚复用、电平与上电初始状态 | Pinmux Spreadsheet → MB1 BCT DTSI | 是 |
| 在 I2C / SPI 等总线上描述外设节点 | Linux DTS / DTSI 或 DTBO | 是 |
| USB / PCIe / UPHY 高速通道适配 | 板级 DTS、UPHY / ODMDATA 与 BSP 配置 | 是，需板级验证 |

## 各配置文件的作用

- **Pinmux Spreadsheet**：配置引脚复用功能、方向、上下拉、三态、上电初始状态与电压容限。
- **`pinmux.dtsi` / `gpio.dtsi` / `padvoltage.dtsi`**：由表格导出的早期引导配置，供 T234 Bootloader / MB1 使用。
- **Linux DTS / DTSI**：描述控制器、总线和外设的寄存器地址、中断、时钟、复位及 `status` 状态。
- **DTB**：编译生成的完整二进制设备树。
- **DTBO**：叠加到基础设备树上的局部修改片段，适合扩展子板与开发阶段验证。
- **载板 `.conf`**：指定核心卡、载板、BCT、DTB、分区布局及刷机参数。

Pinmux 决定“物理引脚连接到哪个控制器以及电气状态”，Linux 设备树决定“内核启用哪个控制器和外设驱动”。若仅修改其中一侧，外设仍可能无法正常工作。

## 备份与安全回滚

在 Jetson 开发板终端执行以下命令，备份当前引导配置与设备树文件：

```bash
mkdir -p "$HOME/jetson-dt-backup"
cp -a /boot/extlinux/extlinux.conf "$HOME/jetson-dt-backup/"
cp -a /boot/dtb "$HOME/jetson-dt-backup/" 2>/dev/null || true
find /boot -maxdepth 1 -name '*.dtb*' -exec cp -a {} "$HOME/jetson-dt-backup/" \;
```

建议在 `extlinux.conf` 中保留一个已知可正常启动的原 DTB 菜单项，而非直接覆盖唯一启动文件。首次重启验证时请连接 UART 调试串口；若所有启动项均失败，请进入 Recovery 模式重新刷入匹配的 BSP。

::: warning Secure Boot 签名要求
启用 Secure Boot 的设备可能要求对 DTB / DTBO 进行加密签名。请勿直接替换未签名文件，签名步骤应与产品密钥管理及量产刷机流程同步设计。
:::

## 路径一：40-pin 开发调试

配备标准 40-pin 扩展排针的载板（官方 DevKit、C1901、C1902 及 C1902 V2）在开发验证阶段优先在 Jetson 开发板终端运行 Jetson-IO：

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

该工具会生成叠加后的 DTB / DTBO 并更新 `/boot/extlinux/extlinux.conf`。交互菜单用法、命令行参数及 C1901 / C1902 / C1902 V2 引脚兼容说明参见 [40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)。

::: info 非 40-pin 载板说明
**C1903**（采用 GH1.25 外设连接器）与 **C2401**（采用 30-pin 扩展排母）未配备标准 40-pin 排针，不适用 Jetson-IO 的 40-pin 交互菜单，请采用下文路径三与路径四完成引脚及设备树配置。此外，Jetson-IO 的修改在重新刷机或整包替换 DTB 后会被覆盖，不应作为量产 BSP 的唯一来源。
:::

## 路径二：JetPack 6 临时修改 GPIO

在 JetPack 6 下，可通过 `busybox devmem` 临时读写 PADCTL 寄存器进行验证，再配合 `gpiod`（`libgpiod`）工具读写电平。寄存器物理地址必须根据当前 SoC TRM 手册中的 PADCTL 基址与对应引脚偏移量计算，切勿盲目套用其他引脚的数值。

在 Jetson 开发板终端执行：

```bash
sudo apt install busybox gpiod
sudo busybox devmem <32-bit-register-address>
gpioinfo
```

此方法在系统重启后立即失效，且会绕过内核驱动的资源管理机制，仅限于核实寄存器地址与位定义后的快速实验。40-pin 常用寄存器示例参见 [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)。

## 路径三：量产 Pinmux 配置

### 1. 准备匹配版本

在宿主机准备与目标 Jetson Orin Nano / NX 及 JetPack / L4T 版本严格对应的 Pinmux Spreadsheet，以及相同版本的 `Linux_for_Tegra` BSP 目录。打开电子表格时需启用宏（Macros）。

### 2. 配置并检查引脚

在表格中逐项核对以下参数：

- `Function` 与硬件原理图信号定义一致。
- `Pin Direction` 与外设信号方向一致（I2C 时钟与数据线通常设为双向 `Bidirectional`）。
- 输出或双向引脚的上电初始状态符合外设时序与安全要求。
- 上下拉、三态及驱动强度（drive setting）符合电路电气设计。
- 仅在引脚硬件支持且外部电路需要时开启 3.3V 耐压（3.3V tolerance）；开启后引脚按开漏（open-drain）模式工作。
- 未使用引脚按低漏电与防悬空安全策略配置。

### 3. 生成并放置 DTSI

点击表格中的 **Generate DT File** 按钮，将生成以下三个文件（文件名前缀取决于表格中填写的板卡名称）：

```text
pinmux.dtsi
gpio.dtsi
padvoltage.dtsi
```

在 Jetson Linux r36（JetPack 6）宿主机目录中，标准放置位置如下：

```text
Linux_for_Tegra/bootloader/generic/BCT/  <- pinmux.dtsi, padvoltage.dtsi
Linux_for_Tegra/bootloader/              <- gpio.dtsi
```

随后在对应载板的 `.conf` 配置文件中引用上述文件名。不同 L4T 大版本的目录结构与变量名可能存在差异，请以目标版本的 NVIDIA Developer Guide 及实际 `.conf` 文件为准。

### 4. 随 BSP 刷入

Pinmux BCT 属于早期启动固件配置，必须在 Ubuntu 宿主机上通过经过验证的载板刷机配置整包或按分区刷入目标机，仅将 `.dtsi` 文件复制到开发板 `/boot` 目录不会生效。

## 路径四：修改 Linux 设备树

### 1. 定位节点

Jetson Linux r36 的 T23x 设备树源码位于宿主机 BSP 源码树的 `hardware/nvidia/t23x/` 目录体系下。修改前应顺着现有载板顶层 DTS 的 `#include` 引用链定位目标控制器节点，避免仅凭寄存器地址猜测节点名。

以下仅展示语法结构，`&i2cX`、`compatible`、寄存器地址、时钟与中断号均需替换为实际硬件参数：

```text
&i2cX {
    status = "okay";

    example@3c {
        compatible = "vendor,example";
        reg = <0x3c>;
        status = "okay";
    };
};
```

### 2. 构建与部署原则

1. 在与目标机 L4T 版本完全一致的宿主机 BSP 源码树中修改，交叉编译流程参见 [内核与基础镜像构建](/hardware-bsp/kernel-and-bsp-build)。
2. 使用 NVIDIA 针对该版本规定的内核与设备树编译流程生成 `.dtb` / `.dtbo`。
3. 切勿覆盖唯一可启动的 DTB 文件；使用独立文件名并在 `extlinux.conf` 中新增测试启动项。
4. 重启后从 `/proc/device-tree`、内核驱动日志与外设总线工具三个维度交叉确认。

## Device Tree Overlay

DTBO 适合描述外接扩展子板或局部增量修改。若需让 Jetson-IO 自动识别自定义 Overlay，需在源码中包含相应的头部元数据，例如：

```text
/dts-v1/;
/plugin/;

/ {
    overlay-name = "Example expansion board";
    jetson-header-name = "Jetson 40pin Header";
    compatible = "nvidia,p3768-0000+p3767-0000";

    fragment@0 {
        target-path = "/";
        __overlay__ {
            /* 在此添加具体硬件外设节点 */
        };
    };
};
```

`compatible` 字符串必须根据实际核心卡与载板组合填写，上例不可直接通用于全部 SKU。若外设同时依赖特定 SFIO 引脚复用，还需确保对应的 Pinmux 配置已同步包含。

## 验证清单

在 Jetson 开发板终端执行以下命令逐项核验：

```bash
# 启动配置与当前生效设备树
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
sudo dmesg -T | grep -iE 'dtb|device tree|probe|failed|error'

# GPIO / I2C / SPI / UART
gpioinfo
i2cdetect -l
ls -l /dev/spidev* /dev/ttyTHS* 2>/dev/null

# USB / PCIe
lsusb -t
lspci -nnk
```

除本次修改的目标外设外，量产前还应回归验证冷启动、软重启、USB、NVMe、有线/无线网卡、CSI 相机、PWM 风扇及功耗模式切换，并按“载板硬件版本 × 核心卡 SKU × JetPack / L4T 版本”维护回归测试矩阵。

## 常见问题

- **DTB 已复制到 `/boot` 但未生效**：检查 `/boot/extlinux/extlinux.conf` 中实际选中的启动项及运行时 `/proc/device-tree/nvidia,dtsfilename`，不要仅确认文件是否存在。
- **GPIO 读写无效**：目标引脚可能仍处于 SFIO 复用状态，或输入/三态属性被 MB1 Pinmux BCT 锁定。
- **外设驱动未触发 `probe`**：检查 `compatible`、节点 `status`、父总线状态、器件地址、时钟、复位引脚及内核模块配置。
- **升级 JetPack 后外设失效**：切勿跨版本复用旧 DTB；请在新版本 BSP 源码上重新合并修改并编译验证。
- **加载 Overlay 后无法启动**：通过串口在启动菜单切换至保留的原启动项进入系统并移除 Overlay，或进入 Recovery 模式重新刷机。

更多现场诊断方法参见 [FAQ 与故障排查](/faq/)。

## LinkZee 板级适配资料说明

上述通用工作流适用于全系 Jetson Orin Nano / NX 载板。针对控元科技(KYtech)各款载板正式发布的板级 BSP 包，配套资料逐步涵盖以下内容：

- **C1901、C1902、C1902 V2、C1903、C2401** 各硬件版本的载板 `.conf` 配置与设备树源码路径。
- Pinmux 表格、导出 DTSI 与编译后 DTB / DTBO 的版本映射及 SHA-256 校验值。
- 载板 EEPROM 配置策略、Board ID / SKU 识别方式与 ODMDATA 说明。
- 原理图网络名、SoC 引脚名、Linux 设备节点与外部连接器引脚的对应表。
- 各核心卡 SKU 与 JetPack 组合的兼容性验证结论及已知注意事项。

已公开的尺寸图、引脚定义与预编译设备树入口汇总于 [硬件资源下载](/resources/downloads)；内核与基础镜像编译步骤参见 [内核与基础镜像构建](/hardware-bsp/kernel-and-bsp-build)。

## 官方参考

- [NVIDIA — Jetson Orin NX and Nano Series Bring-Up](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html)
- [NVIDIA — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA — Jetson Linux Developer Guide r36.4.4](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/)
