---
title: USB配置
---

# USB配置

## 一、Jetson Orin Nano配置方法

### 1. JetPack 5.1.5配置方法

#### 1.1 刷入JetPack 5.1.5系统

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 1.2 将设备树文件下载到开发板

设备正常开机后，打开终端命令行，将修改后的设备树文件下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/5.1.4/
```

#### 1.3 使用命令行替换设备树

选择执行以下命令替换DTB设备树文件并重启设备。

- **Jetson Orin Nano 4G** 请使用以下代码

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0004-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb
sudo reboot
```

- **Jetson Orin Nano 8G** 请使用以下代码

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0003-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb
sudo reboot
```

### 2. JetPack 6.2.1配置方法

#### 2.1 刷入JetPack 6.2.1系统

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 2.2 将设备树文件下载到开发板

设备正常开机后，打开终端命令行，将修改后的设备树文件下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

#### 2.3 使用命令行替换设备树

选择执行以下命令增加DTB设备树文件并重启设备。

- **Jetson Orin Nano 4G** 请执行以下代码

```shell
sudo cp orin_nano_4g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nano_4g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

- **Jetson Orin Nano 8G** 请执行以下代码

```shell
sudo cp orin_nano_8g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nano_8g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

## 二、Jetson Orin NX配置方法

### 1. JetPack 5.1.5配置方法

#### 1.1 刷入JetPack 5.1.5系统

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 1.2 将设备树文件下载到开发板

设备正常开机后，打开终端命令行，将修改后的设备树文件下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/5.1.4/
```

#### 1.3 使用命令行替换设备树

选择执行以下命令替换DTB设备树文件并重启设备。

- **Jetson Orin NX 8G** 请执行以下代码

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0001-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb
sudo reboot
```

- **Jetson Orin NX 16G** 请执行以下代码

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0000-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
sudo reboot
```

### 2. JetPack 6.2.1配置方法

#### 2.1 刷入JetPack 6.2.1系统

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 2.2 将设备树文件下载到开发板

设备正常开机后，打开终端命令行，将修改后的设备树文件下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

#### 2.3 使用命令行替换设备树

选择执行以下命令增加DTB设备树文件并重启设备。

- **Jetson Orin NX 8G** 请使用以下代码

```shell
sudo cp orin_nx_8g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nx_8g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

- **Jetson Orin NX 16G** 请使用以下代码

```shell
sudo cp orin_nx_16g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nx_16g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

## 三、JetPack 7.2.1 配置方法（Orin Nano/NX）

JetPack 7.2.1（Jetson Linux R39.2.1）可继续使用上文 JetPack 6.2.1 对应核心卡的 DTB 文件，文件名映射如下：

| 核心卡 | DTB 文件 |
|--------|----------|
| Jetson Orin Nano 4GB | `orin_nano_4g.dtb` |
| Jetson Orin Nano 8GB | `orin_nano_8g.dtb` |
| Jetson Orin NX 8GB | `orin_nx_8g.dtb` |
| Jetson Orin NX 16GB | `orin_nx_16g.dtb` |

### 1. 下载设备树文件

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

### 2. 安装 DTB 并配置启动项

JetPack 7 使用 UEFI 启动，但 NVIDIA Jetson Linux R39.2 仍支持通过 `/boot/extlinux/extlinux.conf` 中的 `FDT` 标签为内核指定自定义 DTB。以下方法只修改 `LABEL primary` 启动项，不匹配或改写较长的 `APPEND` 行，因此不会改变其中的 `root=PARTUUID=...`、`${cbootargs}` 或其他内核参数。

先根据核心卡设置正确的文件名；以下以 **Orin Nano 8GB** 为例：

```shell
usb_dtb_file=orin_nano_8g.dtb
test -f "$usb_dtb_file" || { echo "找不到 $usb_dtb_file"; exit 1; }

# 安装 DTB，并为当前启动配置创建带时间戳的备份
sudo install -m 0644 "$usb_dtb_file" "/boot/dtb/$usb_dtb_file"
sudo cp -a /boot/extlinux/extlinux.conf \
  "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"

# 仅在 LABEL primary 段新增 FDT；如果已有 FDT，则替换为本次文件
sudo awk -v fdt="/boot/dtb/$usb_dtb_file" '
  function add_fdt() {
    if (in_primary && !fdt_written) {
      print "      FDT " fdt
      fdt_written = 1
    }
  }
  /^LABEL[[:space:]]+primary[[:space:]]*$/ {
    in_primary = 1
    fdt_written = 0
    print
    next
  }
  in_primary && /^LABEL[[:space:]]+/ {
    add_fdt()
    in_primary = 0
  }
  in_primary && /^[[:space:]]*FDT[[:space:]]+/ {
    if (!fdt_written) {
      print "      FDT " fdt
      fdt_written = 1
    }
    next
  }
  { print }
  END { add_fdt() }
' /boot/extlinux/extlinux.conf | sudo tee /boot/extlinux/extlinux.conf.new >/dev/null

# 写入前检查生成结果；应保留原 APPEND，只新增一行 FDT
sudo grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf.new
sudo grep -qE "^[[:space:]]+FDT[[:space:]]+/boot/dtb/${usb_dtb_file}$" \
  /boot/extlinux/extlinux.conf.new && \
  sudo install -m 0644 /boot/extlinux/extlinux.conf.new /boot/extlinux/extlinux.conf || \
  { echo "FDT 配置校验失败，未修改 extlinux.conf"; exit 1; }
sudo rm -f /boot/extlinux/extlinux.conf.new
sudo reboot
```

修改后 `primary` 段应类似下面这样；`APPEND` 内容以设备原文件为准，不要手工复制示例中的 PARTUUID：

```text
LABEL primary
      MENU LABEL primary kernel
      LINUX /boot/Image
      INITRD /boot/initrd
      APPEND ${cbootargs} root=PARTUUID=<保留设备原值> rw ...
      FDT /boot/dtb/orin_nano_8g.dtb
```

:::warning
- 必须选择与核心卡容量匹配的 DTB。选错文件可能导致系统无法启动或外设异常。
- 上述流程适用于未启用 Secure Boot 的开发环境。启用 Secure Boot 后，DTB 和 `extlinux.conf` 可能需要按当前密钥重新签名。
- 重启前不要删除备份。若新 DTB 无法启动，应从保留的启动项或 Recovery 模式恢复原 `extlinux.conf` 和 DTB。
:::

NVIDIA 参考：[Jetson Linux R39.2 — UEFI Adaptation](https://docs.nvidia.com/jetson/archives/r39.2/DeveloperGuide/SD/Bootloader/UEFI.html)。

## 四、检测配置结果

替换设备树后，4个USB3.0端口（C1901为3个）可正常工作，Type-C端口系统默认处于关闭状态。
可使用以下命令查看USB端口工作情况。

```shell
lsusb -t
```

- 未替换设备树前：

![1](/img/wiki-1-1.png)

- 替换设备树成功后：

![2](/img/wiki-Bsa2.png)

在 JetPack 7.2.1 实机中，`5000M` 或 `10000M` 表示设备工作在 SuperSpeed 链路；下面示例中的 USB 3.0 Hub 上行链路为 `10000M`：

![使用 lsusb 验证 USB SuperSpeed 链路](/img/usb-01-superspeed-verification.webp)

您也可以自行使用DISK工具或dd指令测试读写速率是否达到USB3.0的标准。

## 五、配置Type-C端口模式

- 配置Type-C端口为Device模式

注意：此命令为临时启用，重启会失效。

```shell
sudo bash -c 'echo device > /sys/class/usb_role/usb2-0-role-switch/role'
```

设置后，使用Type-C端口连接到PC主机时，具有以下功能：
- COM口，设备的终端命令行
- 虚拟网卡，设备ip地址默认为：192.168.55.1
- NCM (Network Control Model)，设备可通过PC主机联网，仅支持Linux、Mac

- 开机默认配置Type-C端口为Device模式（永久有效）

```shell
sudo sed -i 's#exit 0#echo device > /sys/class/usb_role/usb2-0-role-switch/role\nexit 0#g' /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh
```
