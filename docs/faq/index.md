---
title: FAQ 与故障排查
outline: deep
---

# FAQ 与故障排查

本页汇总 Jetson Orin Nano / NX 核心卡以及控元科技(KYtech) **C1901、C1902、C1902 V2、C1903、C2401** 载板与套件的高频问题与排查步骤。在执行会修改系统或引导配置的命令前，请先确认载板型号与硬件版本、核心卡 SKU、JetPack 版本及启动介质。

## 先收集环境信息

提交技术支持工单前，建议在 Jetson 开发板终端执行以下命令并保存输出与现场照片（设备序列号、用户名、内网 IP 等敏感信息可先行脱敏）：

```bash
cat /etc/nv_tegra_release
uname -a
cat /proc/device-tree/model
cat /proc/device-tree/compatible | tr '\0' '\n'
cat /proc/cmdline
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
lsusb
lsusb -t
ip -br link
sudo dmesg -T | tail -n 200
```

## 刷机与启动

### SDK Manager 检测不到 Jetson

在 Ubuntu 宿主机终端执行以下命令检查 USB 枚举状态：

```bash
lsusb | grep 0955
```

若无任何输出，说明宿主机未识别到 NVIDIA Force Recovery 设备。请按顺序排查：

1. 确认使用的 USB Type-C 线支持**数据传输**（非纯充电线），并连接到载板的刷机专用 Type-C 接口。
2. 按所选载板型号正确进入强制恢复（Force Recovery）模式：
   - **官方 DevKit、C1901、C1902（V1.x）**：断电状态下使用跳线帽短接 12-pin 接口的 `FC REC` 与 `GND` 引脚后再接通电源（宿主机识别到 `0955` 设备后即可取下跳线帽）。
   - **C1902 V2、C1903、C2401**：断电状态下先连好 Type-C 数据线，按住板载独立 `REC` 按键再接通电源；**C1903 与 C2401** 也可将拨码开关 `3` 拨至 `ON` 上电进入恢复模式（**注意：识别到设备或刷机重启进入 initrd 前务必将拨码开关 3 拨回 `OFF`**）。
3. 将数据线直接插入宿主机主板 USB 接口，暂时移除外接 USB Hub 或转接头。
4. 若使用虚拟机（如 VMware），请确认已将 `NVIDIA Corp. APX` USB 设备挂载到 Ubuntu 虚拟机并设为自动重连。

若 `lsusb` 已能看到 `0955` 设备但 SDK Manager 仍未显示目标板，请重启 SDK Manager 并确认所选 JetPack 版本支持当前核心卡型号。完整步骤参见 [刷机教程](/flashing-guide/ubuntu-sdkmanager)。

### 刷机过程中 USB 断开或进度卡住

Jetson 在刷机中途（如切入 RCM boot / initrd 阶段）会重新枚举 USB 设备：

- **虚拟机宿主机**：需在 VMware / VirtualBox 设置中允许重新枚举出的 NVIDIA USB 设备自动重连回 Ubuntu 客户机，否则会在等待设备阶段超时。
- **原生 Ubuntu 宿主机**：优先改插机箱后置主板直连 USB 接口，更换短且屏蔽良好的 Type-C 数据线。
- 同时检查宿主机剩余磁盘空间（建议预留 `≥ 120 GB`）、网络连接及终端刷机日志；固件写入期间严禁断电。若使用 C1903 / C2401 拨码开关进入恢复模式，请确认拨码开关 `3` 已拨回 `OFF`。

### 刷机成功后没有画面或无法启动

1. 断开非必要的 USB 外设、摄像头排线和扩展模块，仅保留电源、启动盘与显示器（注意 C1902 / C1902 V2 的 DP 口若转接 HDMI 显示器，需使用**主动式 DP 转 HDMI 线**）。
2. 核对适配器输出电压、功率及接头极性是否符合对应载板产品页要求。
3. 连接调试串口（12-pin 上的 `UART` 引脚，或 C1903 / C2401 独立的 GH1.25 `UART DEBUG` 接口，波特率 `115200 8N1`）抓取完整上电日志。
4. 若故障发生在手动修改或替换 DTB 之后，优先通过串口启动菜单切回备份启动项，或重新刷入匹配的板级固件。

### SUPER / MAXN 功耗模式没有出现

在 Jetson 开发板终端执行以下命令查看当前 L4T 版本与可用功耗档位：

```bash
cat /etc/nv_tegra_release
sudo nvpmodel -q --verbose
```

SUPER 模式受限于 JetPack / L4T 版本、核心卡型号、载板供电能力及刷机时选用的 `.conf` 配置（不能仅通过系统右上角桌面菜单凭空开启）。请按照对应载板刷机指南（如 [C1902 / C1902 V2 刷入系统](/flashing-guide/c1902-flashing)、[C1903 刷入系统](/flashing-guide/c1903-flashing) 等）刷写 SUPER 配置，并在 [产品选型对比](/products/compare) 中核对载板是否支持 Orin NX SUPER 模式。

以下为 Orin Nano Super 在 JetPack 7.2.1 下运行于 `25W` 模式时的查询示例：

![查询 nvpmodel、CPU、GPU、EMC 与风扇状态](/img/power-01-nvpmodel-and-clocks.webp)

### JetPack 7 ISO 启动盘没有 Install 选项

设备板载 QSPI 启动固件（UEFI）版本必须满足 JetPack 7 ISO 安装器要求。出厂固件较旧的核心卡请先在 Ubuntu 宿主机通过 JetPack 6.x 升级板载固件，详情参见 [JetPack 7 刷入系统常见问题](/flashing-guide/jetpack7-flashing#常见问题)。

## 存储、USB 与设备树

### NVMe SSD 不识别

在 Jetson 开发板终端执行以下命令检查块设备与 PCIe 枚举日志：

```bash
lsblk
sudo lspci -nn
sudo dmesg -T | grep -iE 'nvme|pcie'
```

若 `lspci` 完全没有 NVMe 控制器记录，请彻底断电后重新插紧 SSD，并确认 M.2 槽位规格（如 2280 / 2230）及**单面颗粒限制**（双面 SSD 在部分载板上会产生机械干涉）；若控制器已枚举但伴随链路错误或 I/O 超时，请保留完整 `dmesg` 日志并更换已验证的单面 NVMe SSD 与足额电源交叉排查。

以下实机示例展示了正常识别的 NVMe 型号、分区布局及根文件系统挂载位置：

![确认 NVMe 与根文件系统位置](/img/storage-01-nvme-and-rootfs.webp)

### USB 设备只有 USB 2.0 速度

在 Jetson 开发板终端执行以下命令查看 USB 拓扑速率：

```bash
lsusb -t
sudo dmesg -T | grep -iE 'usb|xhci'
```

输出中的 `480M` 代表 USB 2.0，`5000M` / `10000M` 代表 USB 3.2 SuperSpeed。排除线缆、外接 Hub 及外设自身速率限制后，**C1901、C1902、C1902 V2**、**C1903**（标号 6 直通核心卡的 10Gbps USB 3.2 Type-A 接口）以及 **C2401**（30-pin 扩展排母引出的 USB 3.0 通道）均需配合对应的板级设备树才能完整启用高速通道，配置步骤参见 [USB 配置说明](/orin-nano-series/usb-config)。

### 如何确认当前生效的设备树

在 Jetson 开发板终端执行：

```bash
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
grep -nE '^[[:space:]]*(FDT|OVERLAYS)' /boot/extlinux/extlinux.conf
find /boot -maxdepth 2 \( -name '*.dtb' -o -name '*.dtbo' \) -print
```

`/boot` 目录下存在某个 `.dtb` 文件并不代表内核实际加载了该文件，必须结合 `extlinux.conf` 启动项与运行时 `/proc/device-tree/nvidia,dtsfilename` 共同确认。完整工作流参见 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。

### 替换 DTB 后无法启动

请勿继续盲目覆盖其他启动文件。连接 UART 调试串口，在 UEFI / Extlinux 启动菜单中选择事先保留的原启动项进入系统并还原配置；若未保留备用启动项，请将载板置入 Force Recovery 模式重新刷入匹配的 BSP。修改设备树前务必备份原 DTB 与 `extlinux.conf`。

### JetPack 升级后能否继续使用旧版 DTB

不建议跨大版本复用。DTB 与具体 L4T / BSP 内核版本、核心卡 SKU 及载板硬件版本强耦合；升级系统后应基于目标版本的 BSP 源码重新合并编译，或使用控元科技针对该 JetPack 版本发布的专用设备树文件。

## 网络与远程连接

### SSH 无法连接

在 Jetson 开发板本地终端（显示器或串口）执行：

```bash
ip -br address
systemctl status ssh --no-pager
ss -lntp | grep ':22'
```

确认宿主机与开发板处于同一网段且路由可达、登录用户名正确、`ssh` 服务处于 `active (running)` 并监听 `22` 端口。若使用 USB Type-C 虚拟网卡（默认 IP 通常为 `192.168.55.1`），需确保该载板的 Type-C 口支持并已启用 USB Device 模式，详情参见 [连接到 Jetson 系统](/orin-nano-series/connect-jetson)。

### 有线或无线网卡未出现

在 Jetson 开发板终端执行：

```bash
lspci -nnk
ip -br link
sudo dmesg -T | grep -iE 'ethernet|r8125|iwlwifi|firmware'
```

请先根据 `lspci -nnk` 显示的芯片 PCI ID 确认网卡型号（例如 C2401 的 2.5G 网口采用 Realtek `RTL8125` 芯片，无线网卡常见为 Intel 或 Realtek M.2 模块），再按芯片型号安装对应内核驱动或固件，详情参见 [网卡驱动](/orin-nano-series/network-driver)。

## GPIO、串口、CAN 与摄像头

### JetPack 6 / 7 中 `/sys/class/gpio` 不可用

JetPack 6 及以上版本已移除旧版 `sysfs` GPIO 接口，统一改用字符设备接口与 `libgpiod`（`gpiod` 工具包）。确认目标引脚的 Pinmux 已设为 GPIO 后，在 Jetson 开发板终端执行：

```bash
sudo apt install gpiod
gpioinfo
```

Python / C / 命令行控制示例参见 [GPIO 控制](/orin-nano-series/gpio) 与 [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)；40-pin 引脚复用切换参见 [40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)。

### SPI、PWM 或串口设备节点不存在

相关物理引脚默认可能处于 `unused` 或普通 GPIO 状态，尚未切换至对应的 SFIO 外设功能：

- **40-pin 载板（官方 DevKit、C1901、C1902、C1902 V2）**：开发阶段可通过 [Jetson-IO](/orin-nano-series/expansion-header) 启用 `spi1`、`pwm` 等复用配置；量产固件建议通过 Pinmux 表格生成并随 BSP 刷写。
- **非 40-pin 载板（C1903、C2401）**：C1903 采用 GH1.25 外设连接器，C2401 采用 30-pin 扩展排母与 GH1.25 接口（且 C2401 的 `UART1` 需替换专用设备树），二者均不可直接套用标准 40-pin 配置，请核对各自产品页引脚说明与 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。

### CAN 无法收发或进入 BUS-OFF 状态

在 Jetson 开发板终端执行以下命令查看 `can0` 状态计数与错误帧：

```bash
ip -details -statistics link show can0
```

请重点核对收发双方的波特率、采样点、`CAN_H / CAN_L` 线序、共地参考以及总线两端 `120Ω` 终端电阻：

- **C1901、C1902、C1902 V2**：仅引出 `CAN_TX / CAN_RX` 3.3V 逻辑电平信号，**必须外接 CAN 收发器模块**后才能接入差分总线。
- **C1903、C2401**：**板载 CAN 收发器芯片**，通过 GH1.25-2P 接口直接输出 `CAN_H / CAN_L` 差分信号，并可将板载**拨码开关 1** 拨至 `ON` 接入 `120Ω` 终端电阻。

详细配置与 `BUS-OFF` 恢复命令参见 [其他外设 — CAN 总线](/orin-nano-series/peripherals#_4-can-总线)。

### CSI 摄像头没有画面

**务必先完全断电**后再重新插拔 CSI FPC 排线（严禁带电插拔），确认金手指朝向正确、相机型号已通过 `jetson-io.py` 启用对应驱动叠加层（注意 C2401 配备 1 路 CSI，其余载板配备 2 路 CSI），随后在 Jetson 开发板终端检查：

```bash
v4l2-ctl --list-devices
sudo dmesg -T | grep -iE 'camera|tegra-capture|vi5|csi'
```

若未生成 `/dev/video*` 节点，通常并非播放命令参数问题，而是排线接触、传感器供电、I2C 探测或设备树驱动未匹配成功。详细测试流程参见 [摄像头教程](/orin-nano-series/camera)。

## AI 软件

### `nvcc` 等 CUDA 命令提示不存在

在 Jetson 开发板终端执行以下命令检查系统包安装状态：

```bash
cat /etc/nv_tegra_release
dpkg -l | grep -E 'cuda|nvidia-jetpack'
```

若已安装 `nvidia-jetpack` 但仍提示 `nvcc: command not found`，通常只需将 `/usr/local/cuda/bin` 写入环境变量 `PATH`。请注意 Jetson 的 CUDA 版本与 JetPack / L4T 严格绑定，切勿照搬 x86 Ubuntu 的显卡驱动与 CUDA 安装包；完整配置参见 [安装 CUDA](/orin-nano-series/cuda)。

### TensorRT Engine 更换设备或升级后报错无法加载

TensorRT 序列化 `.engine` 文件与构建时的 TensorRT 版本、GPU SM 架构（如 Orin Nano vs Orin NX 硬件资源配置）及精度参数强绑定，不支持跨设备或跨 JetPack 版本直接移植。更换核心卡或升级系统后，请在目标设备上从 `.onnx` 模型重新构建 Engine，参见 [TensorRT 常见问题](/orin-nano-series/tensorrt#_5-常见问题)。

## 提交技术支持工单

联系技术支持时，请尽量一次性提供以下信息以便快速定位：

1. **硬件信息**：载板型号与丝印版本号（如 `C1902 V2.0`、`C1903 V1.0`）、核心卡具体型号、启动存储介质、电源适配器电压与功率规格。
2. **软件环境**：JetPack / L4T 版本、刷机方式、是否加载自定义 DTB / DTBO 及对应文件名。
3. **故障现场**：清晰复现步骤、接口接线照片、本页首节「收集环境信息」的完整输出，以及 `dmesg` 或 UART 串口启动日志。
