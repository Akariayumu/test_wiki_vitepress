---
title: Pinmux 与设备树
---

# Pinmux 与设备树

本文说明 Jetson Orin Nano / NX 在开发调试和量产固件中的 Pinmux、设备树与 Overlay 工作流。它不替代具体载板 BSP：修改前必须确认核心卡 SKU、载板型号及版本、JetPack/L4T 和启动介质。

:::danger 修改错误可能导致设备无法启动
开始前备份 DTB、DTBO 和 `/boot/extlinux/extlinux.conf`，并准备 Recovery 刷机环境。不要将其他 JetPack、核心卡或载板的 DTB 直接复制到当前设备。
:::

## 选择正确方法

| 目标 | 推荐方法 | 是否适合量产 |
|---|---|---|
| 配置官方 40-pin 上的 SPI/I2C/UART/PWM/I2S | [Jetson-IO](/orin-nano-series/expansion-header) | 开发验证为主 |
| JetPack 6 临时把引脚切为 GPIO | PADCTL 寄存器 + `libgpiod` | 否，重启后失效 |
| 固化引脚复用、电平和上电状态 | Pinmux Spreadsheet → MB1 BCT DTSI | 是 |
| 在 I2C/SPI 等总线上描述外设 | Linux DTS/DTSI 或 DTBO | 是 |
| USB/PCIe/UPHY 高速通道适配 | 板级 DTS、UPHY/ODMDATA 与 BSP 配置 | 是，需板级验证 |

## 文件分别控制什么

- **Pinmux Spreadsheet**：配置引脚功能、方向、上下拉、三态、初始状态和电压容限。
- **`pinmux.dtsi` / `gpio.dtsi` / `padvoltage.dtsi`**：表格生成的启动配置，由 T234 Bootloader/MB1 使用。
- **Linux DTS/DTSI**：描述控制器、总线和外设的地址、中断、时钟、复位及 `status`。
- **DTB**：编译后的完整设备树。
- **DTBO**：叠加到基础设备树上的局部修改，适合扩展硬件与开发验证。
- **载板 `.conf`**：选择核心卡、载板、BCT、DTB、分区和刷机参数。

Pinmux 决定“引脚接到哪个控制器以及电气状态”，Linux 设备树决定“内核启用哪个控制器和设备”。只完成其中一边，外设仍可能不可用。

## 备份与安全回滚

```bash
mkdir -p "$HOME/jetson-dt-backup"
cp -a /boot/extlinux/extlinux.conf "$HOME/jetson-dt-backup/"
cp -a /boot/dtb "$HOME/jetson-dt-backup/" 2>/dev/null || true
find /boot -maxdepth 1 -name '*.dtb*' -exec cp -a {} "$HOME/jetson-dt-backup/" \;
```

推荐在 `extlinux.conf` 中保留一个已知可启动的原 DTB 菜单项，而不是覆盖唯一文件。修改后先保留本地串口；若启动失败，从备用项启动并恢复，或进入 Recovery 重新刷入匹配 BSP。

:::warning Secure Boot
启用 Secure Boot 的设备可能要求对 DTB/DTBO 签名。不要直接复制未签名文件，具体流程应与产品密钥和量产刷机方案一起设计。
:::

## 路径一：40-pin 开发调试

官方 40-pin 排针优先使用 Jetson-IO：

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

它会生成 DTB/DTBO 并更新启动配置。详细菜单、命令行工具和 C1901/C1902 兼容说明见 [40-pin 扩展头配置](/orin-nano-series/expansion-header)。Jetson-IO 的结果可能在刷机或替换 DTB 后丢失，不应作为量产 BSP 的唯一来源。

## 路径二：JetPack 6 临时修改 GPIO

JetPack 6 可用 `busybox devmem` 修改 PADCTL 寄存器进行调试，再用 `libgpiod` 控制 GPIO。寄存器地址必须由当前 SoC TRM 的 PADCTL 基址加对应 pin offset 计算，不能复制其他引脚的数值。

```bash
sudo apt install busybox gpiod
sudo busybox devmem <32-bit-register-address>
gpioinfo
```

此方法重启后失效，也可能绕过驱动的资源管理，仅用于已确认地址和位定义后的实验。具体 40-pin 地址示例见 [JetPack 6 GPIO 配置](/gpio-tutorial/jetpack6-gpio)。

## 路径三：量产 Pinmux 配置

### 1. 准备匹配版本

下载与目标 Orin NX/Nano 和 JetPack/L4T 对应的 Pinmux Spreadsheet，并使用与目标固件相同版本的 `Linux_for_Tegra`。表格需要启用宏。

### 2. 配置并检查引脚

逐项确认：

- `Function` 与原理图信号一致。
- `Pin Direction` 与外设方向一致；I2C 时钟和数据通常为双向。
- 输出/双向引脚的初始状态符合外设上电要求。
- 上下拉、三态和 drive setting 符合电气设计。
- 仅在引脚支持且电路需要时开启 3.3V tolerance；开启后引脚按 open-drain 工作。
- 未使用引脚设置满足漏电和安全要求。

### 3. 生成并放置 DTSI

表格的 **Generate DT File** 会生成名称取决于表格输入的三个文件：

```text
pinmux.dtsi
gpio.dtsi
padvoltage.dtsi
```

Jetson Linux r36 的标准放置关系为：

```text
Linux_for_Tegra/bootloader/generic/BCT/  <- pinmux.dtsi, padvoltage.dtsi
Linux_for_Tegra/bootloader/              <- gpio.dtsi
```

随后在本载板的 `.conf` 中引用这些文件。不同 L4T 版本目录和变量名可能变化，应以对应版本 NVIDIA Developer Guide 及实际 `.conf` 为准。

### 4. 随 BSP 刷入

Pinmux BCT 属于启动固件配置。使用已验证的载板刷机配置生成并刷入镜像，不要只把生成的 `.dtsi` 复制到目标机 `/boot`。

## 路径四：修改 Linux 设备树

### 定位节点

Jetson Linux r36 的 T23x 设备树源码位于 BSP source tree 的 `hardware/nvidia/t23x/` 体系中。先从现有载板顶层 DTS 的 include 链定位控制器，避免凭地址猜节点。

以下仅展示结构，`&i2cX`、`compatible`、地址、时钟和中断必须替换为真实硬件值：

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

### 构建与部署原则

1. 在与目标 L4T 完全匹配的 BSP 源码中修改。
2. 使用 NVIDIA 对该版本规定的内核/设备树构建流程生成 DTB/DTBO。
3. 不覆盖唯一可启动 DTB；用新文件名和备用启动项验证。
4. 重启后从 `/proc/device-tree`、驱动日志和总线工具三方面确认。

## Device Tree Overlay

DTBO 适合附加扩展硬件或做局部配置。供 Jetson-IO 识别的 Overlay 需要声明对应元数据，例如：

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
            /* Add only hardware-specific nodes here. */
        };
    };
};
```

`compatible` 必须按实际模块与载板组合设置，示例不能直接用于所有 SKU。Overlay 若同时依赖 SFIO pinmux，应确保 pinmux 配置也已包含。

## 验证清单

```bash
# 启动与设备树
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

除目标功能外，还要回归冷启动、软重启、USB、NVMe、网卡、CSI、风扇和功耗模式。至少按“载板版本 × 核心卡 SKU × JetPack/L4T”维护测试矩阵。

## 常见问题

- **DTB 已复制但没有生效**：检查 `extlinux.conf`、实际启动项和运行时 `nvidia,dtsfilename`，不要只检查文件是否存在。
- **GPIO 控制无效**：引脚可能仍是 SFIO，或方向/三态由 MB1 Pinmux BCT 固化。
- **驱动没有 probe**：检查 `compatible`、节点 `status`、父总线、地址、时钟、复位和内核配置。
- **升级 JetPack 后失效**：不要复用旧 DTB；在新 BSP 源码上重新合并、构建和验证。
- **Overlay 应用后启动失败**：从保留的原启动项进入系统，移除 Overlay；否则进入 Recovery 恢复。

更多现场问题见 [FAQ 与故障排查](/faq/)。

## LinkZee 板级资料状态

通用流程已经可用，但下列信息需要随正式 BSP 发布后继续补充：

- C1901/C1902/C2401 各版本的 board `.conf` 与源码路径。
- Pinmux 表、生成 DTSI、最终 DTB/DTBO 的版本对应和 SHA-256。
- 载板 EEPROM 的有无、Board ID/SKU 和读取策略。
- 原理图网名、SoC pin、Linux 节点和外部连接器引脚映射。
- 各核心卡与 JetPack 组合的验证结果和已知限制。

发布文件见[硬件资源下载](/resources/downloads)。

## 官方参考

- [NVIDIA — Jetson Orin NX and Nano Series Bring-Up](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html)
- [NVIDIA — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA — Jetson Linux Developer Guide r36.4.4](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/)
