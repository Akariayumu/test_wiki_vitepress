---
title: Orin Nano/NX USB 配置
---

# Orin Nano/NX USB 配置

在 Jetson Orin Nano/NX 刷入 NVIDIA 官方系统后，安装与 JetPack 版本、核心卡型号匹配的设备树，可使 C1901、C1902、C1903、C2401 底板上的 3 个 USB 3.2 端口和 Type-C 端口正常工作。

本文使用的 DTB 和版本信息来自 [Akariayumu/board_dts](https://github.com/Akariayumu/board_dts/tree/master/orin-nano-nx-usb-config)。

:::danger 操作前必读
- DTB 与 JetPack 版本、核心卡型号严格绑定，不可跨版本或跨型号混用。
- 写错 DTB 或启动配置可能导致系统无法启动。操作前请备份重要数据和原配置，并准备好 Recovery 模式刷机环境。
- 下文只列出 `board_dts` 仓库中标记为已验证的组合。表格中的“—”表示仓库目前没有对应文件，请勿拿其他版本代替。
:::

## 1. 确认核心卡和系统版本

在 Jetson 上执行：

```bash
cat /proc/device-tree/model; echo
head -1 /etc/nv_tegra_release
```

版本和文件对应关系如下：

| JetPack | L4T | Orin Nano 4GB | Orin Nano 8GB | Orin NX 8GB | Orin NX 16GB |
| --- | --- | --- | --- | --- | --- |
| 5.1.4 | R35.6.0 | `kernel_tegra234-p3767-0004-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0003-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0001-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0000-p3768-0000-a0.dtb` |
| 5.1.5 (super) | R35.6.1 | `kernel_tegra234-p3767-0004-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0003-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0001-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0000-super-p3768-0000-a0.dtb` |
| 6.2 | R36.4.3 | `orin_nano_4g.dtb` | `orin_nano_8g.dtb` | `orin_nx_8g.dtb` | `orin_nx_16g.dtb` |
| 7.2 | R39.x | — | `orin_nano_8gb.dtb` | — | — |

:::tip
如果还没有安装对应版本的官方系统，请先参考 [Ubuntu 主机使用 SDK Manager 刷机](/flashing-guide/ubuntu-sdkmanager)。
:::

## 2. 下载设备树仓库

设备正常启动并联网后，在 Jetson 终端执行：

```bash
git clone https://github.com/Akariayumu/board_dts.git
cd board_dts/orin-nano-nx-usb-config
```

后续命令均假设当前目录为 `orin-nano-nx-usb-config`。

## 3. JetPack 5.1.4

JetPack 5.x 会按核心卡 SKU 自动加载 `/boot/dtb/` 中的同名文件，因此需要替换原 DTB。先进入对应目录：

```bash
cd jetpack-5.1.4
```

根据核心卡选择且只设置一个文件名：

```bash
# Orin Nano 4GB
dtb=kernel_tegra234-p3767-0004-p3768-0000-a0.dtb

# Orin Nano 8GB
# dtb=kernel_tegra234-p3767-0003-p3768-0000-a0.dtb

# Orin NX 8GB
# dtb=kernel_tegra234-p3767-0001-p3768-0000-a0.dtb

# Orin NX 16GB
# dtb=kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
```

确认文件存在，备份原 DTB，再安装并重启：

```bash
test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
test -f "/boot/dtb/$dtb" || { echo "系统中找不到 /boot/dtb/$dtb"; exit 1; }
sudo cp -a "/boot/dtb/$dtb" "/boot/dtb/$dtb.backup-$(date +%Y%m%d-%H%M%S)"
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo reboot
```

## 4. JetPack 5.1.5 (super)

进入 5.1.5 (super) 目录：

```bash
cd jetpack-5.1.5-super
```

根据核心卡选择且只设置一个文件名：

```bash
# Orin Nano 4GB
dtb=kernel_tegra234-p3767-0004-super-p3768-0000-a0.dtb

# Orin Nano 8GB
# dtb=kernel_tegra234-p3767-0003-super-p3768-0000-a0.dtb

# Orin NX 8GB
# dtb=kernel_tegra234-p3767-0001-super-p3768-0000-a0.dtb

# Orin NX 16GB
# dtb=kernel_tegra234-p3767-0000-super-p3768-0000-a0.dtb
```

备份、安装并重启：

```bash
test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
test -f "/boot/dtb/$dtb" || { echo "系统中找不到 /boot/dtb/$dtb"; exit 1; }
sudo cp -a "/boot/dtb/$dtb" "/boot/dtb/$dtb.backup-$(date +%Y%m%d-%H%M%S)"
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo reboot
```

## 5. JetPack 6.2

JetPack 6.2 需要把新 DTB 安装到 `/boot/dtb/`，并在 `/boot/extlinux/extlinux.conf` 的 `LABEL primary` 启动项中指定 `FDT`。

进入对应目录：

```bash
cd jetpack-6.2
```

根据核心卡选择且只设置一个文件名：

```bash
# Orin Nano 4GB
dtb=orin_nano_4g.dtb

# Orin Nano 8GB
# dtb=orin_nano_8g.dtb

# Orin NX 8GB
# dtb=orin_nx_8g.dtb

# Orin NX 16GB
# dtb=orin_nx_16g.dtb
```

安装 DTB 并备份启动配置：

```bash
test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo cp -a /boot/extlinux/extlinux.conf \
  "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"
sudo nano /boot/extlinux/extlinux.conf
```

在 `LABEL primary` 段落中新增一行 `FDT`。不要修改或复制其他设备的 `APPEND` 内容：

```text
LABEL primary
      MENU LABEL primary kernel
      LINUX /boot/Image
      INITRD /boot/initrd
      APPEND ...保留设备原有内容...
      FDT /boot/dtb/orin_nano_4g.dtb
```

将示例文件名换成刚才选择的 `$dtb`。保存后检查配置并重启：

```bash
grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf
sudo reboot
```

## 6. JetPack 7.2

`board_dts` 当前只提供并验证了 **Orin Nano 8GB**，文件名为 `orin_nano_8gb.dtb`。其他核心卡请等待仓库提供对应文件，不要使用 JetPack 6.2 的 DTB。

```bash
cd jetpack-7.2
dtb=orin_nano_8gb.dtb
test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo cp -a /boot/extlinux/extlinux.conf \
  "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"
sudo nano /boot/extlinux/extlinux.conf
```

在 `LABEL primary` 段落中增加：

```text
      FDT /boot/dtb/orin_nano_8gb.dtb
```

保存后检查并重启：

```bash
grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf
sudo reboot
```

## 7. 验证 USB 3.2

重启后接入 USB 3.x 设备，查看 USB 拓扑：

```bash
lsusb -t
```

`5000M` 或 `10000M` 表示设备工作在 SuperSpeed 链路；`480M` 仍是 USB 2.0。

![使用 lsusb 验证 USB SuperSpeed 链路](/img/usb-01-superspeed-verification.webp)

如果设备仍未识别，可查看 USB 控制器日志：

```bash
sudo dmesg | grep -i -e xusb -e tegra-xudc
```

## 8. 配置 Type-C Device 模式

查看当前角色：

```bash
cat /sys/class/usb_role/usb2-0-role-switch/role
```

临时切换为 Device 模式（重启后失效）：

```bash
sudo bash -c 'echo device > /sys/class/usb_role/usb2-0-role-switch/role'
```

连接 PC 后可提供串口终端、默认地址为 `192.168.55.1` 的虚拟网卡，以及 Linux/macOS 主机上的 NCM 联网功能。

如需开机自动切换，可按上游仓库的方式修改 NVIDIA 启动脚本：

```bash
sudo cp -a /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh \
  /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh.backup
sudo sed -i 's#exit 0#echo device > /sys/class/usb_role/usb2-0-role-switch/role\nexit 0#g' \
  /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh
```

## 9. 故障恢复

- JetPack 5.x：恢复 `/boot/dtb/` 中备份的同名 DTB；若无法启动，进入 Recovery 模式重新刷机。
- JetPack 6.2/7.2：从备用启动项或串口进入系统，删除 `extlinux.conf` 中新增的 `FDT` 行；必要时恢复带时间戳的备份。
- USB 3.2 正常但 Type-C 无反应：确认角色文件存在，并重新执行 Device 模式切换命令。
