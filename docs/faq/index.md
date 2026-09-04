---
title: FAQ 与故障排查
---

# FAQ 与故障排查

本页汇总 Jetson Orin Nano / NX 与 C1901、C1902、C2401 的高频问题。执行会修改系统的命令前，请先确认载板型号、硬件版本和 JetPack 版本。

## 先收集环境信息

提交技术支持问题时，请附上命令输出和故障照片。序列号、用户名、IP 等信息可先打码。

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

**诊断：** 在 Ubuntu 主机执行：

```bash
lsusb | grep 0955
```

没有输出表示主机未识别到 NVIDIA Recovery 设备。请依次确认：

1. Type-C 线支持数据传输，而不是仅充电。
2. 按对应载板文档短接 FC REC 与 GND，再上电或复位。
3. 直接连接主机 USB 口，暂时移除 HUB 和转接器。
4. 使用虚拟机时，将 NVIDIA USB 设备连接到虚拟机，并设置为始终连接。

有 `0955` 设备但 SDK Manager 仍检测不到时，重启 SDK Manager，并确认所选 JetPack 支持当前核心卡。参见[刷机教程](/flashing-guide/ubuntu-sdkmanager)。

### 刷机过程中 USB 断开或卡住

Recovery 设备在刷机期间会重新枚举。VMware 必须将重新出现的 USB 设备继续交给 Ubuntu 虚拟机。还应检查主机磁盘余量、网络和刷机日志；不要在写入期间断电。

### 刷机成功后没有画面或无法启动

1. 断开非必要 USB、摄像头和扩展模块，只保留显示器、启动盘与电源。
2. 确认电源规格及极性符合产品页要求。
3. 连接 UART DEBUG，保留完整启动日志。
4. 如果故障发生在替换 DTB 后，优先恢复原 DTB 或重新刷机。

### SUPER / MAXN 功耗模式没有出现

先确认系统版本和功耗模式：

```bash
cat /etc/nv_tegra_release
sudo nvpmodel -q --verbose
```

SUPER 模式取决于 JetPack/L4T、核心卡、载板和所刷配置，不能仅靠桌面菜单开启。请使用相应载板刷机页提供的配置，并核对[产品选型对比](/products/compare)中的支持范围。

JetPack 7.2.1、Orin Nano Super 处于 25W 模式时的查询示例：

![查询 nvpmodel、CPU、GPU、EMC 与风扇状态](/img/power-01-nvpmodel-and-clocks.webp)

### JetPack 7 ISO 没有 Install 选项

设备固件必须满足 ISO 安装器要求。旧固件应先通过 JetPack 6.x 升级；参见 [JetPack 7 刷机教程](/flashing-guide/jetpack7-flashing#常见问题)。

## 存储、USB 与设备树

### NVMe SSD 不识别

```bash
lsblk
sudo lspci -nn
sudo dmesg -T | grep -iE 'nvme|pcie'
```

完全没有 PCIe/NVMe 记录时，断电后重新安装 SSD，确认槽位、长度和单双面限制；有控制器但出现超时或链路错误时，保留 `dmesg` 并换已验证 SSD、电源交叉测试。

下面的实机示例同时确认了 NVMe 型号、分区和根文件系统位置，未显示设备序列号：

![确认 NVMe 与根文件系统位置](/img/storage-01-nvme-and-rootfs.webp)

### USB 设备只有 USB 2.0 速度

```bash
lsusb -t
sudo dmesg -T | grep -iE 'usb|xhci'
```

`480M` 表示 USB 2.0，`5000M/10000M` 才是 SuperSpeed。排除线缆、HUB 和设备本身后，C1901/C1902 或特定 C2401 扩展端口可能需要匹配的设备树，参见 [USB 配置](/orin-nano-series/usb-config)。

### 如何确认当前加载的设备树

```bash
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
grep -nE '^[[:space:]]*(FDT|OVERLAYS)' /boot/extlinux/extlinux.conf
find /boot -maxdepth 2 \( -name '*.dtb' -o -name '*.dtbo' \) -print
```

`/boot` 中存在文件不代表它已加载，应同时检查启动配置和运行时设备树。完整流程见 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。

### 替换 DTB 后无法启动

不要继续覆盖文件。使用启动菜单选择保留的原配置；没有可用配置时进入 Recovery 模式重新刷入匹配的 BSP。修改前应备份 DTB 和 `extlinux.conf`，并保留一个已知可启动项。

### JetPack 升级后能否继续使用旧 DTB

不建议。DTB 与 L4T/BSP、核心卡 SKU、载板版本相关，升级后应使用目标版本源码重新合并和构建，或下载该版本对应的载板文件。

## 网络与远程连接

### SSH 无法连接

```bash
ip -br address
systemctl status ssh --no-pager
ss -lntp | grep ':22'
```

确认 PC 与 Jetson 网络可达、用户名正确且 SSH 服务监听。Type-C 虚拟网卡通常使用 `192.168.55.1`，但需要 USB Device 模式正常工作，参见[连接 Jetson](/orin-nano-series/connect-jetson)。

### 网卡未出现或无线网络不可用

```bash
lspci -nnk
ip -br link
sudo dmesg -T | grep -iE 'ethernet|r8125|iwlwifi|firmware'
```

先根据 PCI ID 判断芯片，再安装对应驱动或固件。不要只按网卡商品名选择驱动；参见[网卡驱动](/orin-nano-series/network-driver)。

## GPIO、串口、CAN 与摄像头

### JetPack 6 中 `/sys/class/gpio` 不可用

JetPack 6 使用 `libgpiod`。先确认 pinmux，再执行：

```bash
sudo apt install gpiod
gpioinfo
```

使用方式见 [GPIO 控制](/orin-nano-series/gpio)；SFIO/GPIO 切换见 [40-pin 扩展头配置](/orin-nano-series/expansion-header)。

### SPI、PWM 或串口节点不存在

这些引脚可能仍被配置为 GPIO 或其他 SFIO。40-pin 开发调试可使用 Jetson-IO；量产配置应由 pinmux 表生成并随 BSP 烧录。C2401 使用 30-pin 扩展口，不能套用 40-pin 配置。

### CAN 无法收发或进入 BUS-OFF

```bash
ip -details -statistics link show can0
```

核对双方波特率、CAN_H/CAN_L、共地和终端电阻。C1901/C1902 只引出 TX/RX，需要外接收发器；C2401 带收发器，可通过拨码接入 120Ω 终端。配置与恢复方法见 [CAN 总线](/orin-nano-series/peripherals#_4-can总线)。

### CSI 摄像头没有画面

断电后重新连接 FPC，确认方向和相机驱动支持当前 JetPack，然后检查：

```bash
v4l2-ctl --list-devices
sudo dmesg -T | grep -iE 'camera|tegra-capture|vi5|csi'
```

没有 `/dev/video*` 通常不是播放器问题，而是探测、供电、设备树或驱动未成功。参见[摄像头教程](/orin-nano-series/camera)。

## AI 软件

### CUDA 命令不存在

```bash
cat /etc/nv_tegra_release
dpkg -l | grep -E 'cuda|nvidia-jetpack'
```

JetPack/L4T 与 CUDA 版本有固定对应关系，不要直接照搬 x86 Ubuntu 的安装命令。参见[安装 CUDA](/orin-nano-series/cuda)。

### TensorRT engine 换设备或升级后不能使用

TensorRT engine 与 TensorRT 版本、GPU 架构和构建参数相关。换核心卡或升级 JetPack 后应从 ONNX 重新构建；参见 [TensorRT 常见问题](/orin-nano-series/tensorrt#_5-常见问题)。

## 提交技术支持工单

请至少提供：载板型号与版本、核心卡型号、JetPack/L4T、启动介质、电源规格、复现步骤、环境信息命令输出，以及 UART 或 `dmesg` 日志。涉及设备树时，再附当前 DTB/DTBO 名称和修改来源。
