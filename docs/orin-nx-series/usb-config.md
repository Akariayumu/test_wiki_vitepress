---
title: Orin Nano/NX USB配置说明
outline: deep
---

# Orin Nano/NX USB配置说明

### 一、Jetson Orin Nano配置方法

#### 1. JetPack 5.1.5配置方法

##### 1. 1刷入JetPack 5.1.5系统。

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

##### 1.2 将设备树文件下载到开发板

设备正常开机后，打开终端命令行，将**修改后的设备树文件**下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/5.1.4/
```

##### 1.3 使用命令行替换设备树。

选择执行以下命令替换**DTB设备树**文件并重启设备。

- **Jetson Orin Nano 4G** 请使用以下代码

```
sudo cp /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0004-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb
sudo reboot
```

- **Jetson Orin Nano 8G** 请使用以下代码

```
sudo cp /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0003-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb
sudo reboot
```

#### 2. JetPack 6.2.1配置方法

##### 2.1 刷入JetPack 6.2.1系统。

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

##### 2.2 将设备树文件下载到开发板

- 设备正常开机后，打开终端命令行，将**修改后的设备树文件**下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

##### 1.3 使用命令行替换设备树。

选择执行以下命令**增加DTB设备树**文件并重启设备。

- **Jetson Orin Nano 4G** 请执行以下代码

```
sudo cp orin_nano_4g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nano_4g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

- **Jetson Orin Nano 8G** 请执行以下代码

```
sudo cp orin_nano_8g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nano_8g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

### 二、Jetson Orin NX配置方法

#### 1. JetPack 5.1.5配置方法

##### 1. 1刷入JetPack 5.1.5系统。

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

##### 1.2 将设备树文件下载到开发板

- 设备正常开机后，打开终端命令行，将**修改后的设备树文件**下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/5.1.4/
```

##### 1.3 使用命令行替换设备树。

选择执行以下命令替换**DTB设备树**文件并重启设备。

- **Jetson Orin NX 8G** 请执行以下代码

```
sudo cp /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0001-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb
sudo reboot
```

- **Jetson Orin NX 16G** 请执行以下代码

```
sudo cp /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb.backup # 备份原设备树文件
sudo cp kernel_tegra234-p3767-0000-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
sudo reboot
```

#### 2. JetPack 6.2.1配置方法

##### 2.1 刷入JetPack 6.2.1系统。

参考[官方固件刷机流程](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

##### 2.2 将设备树文件下载到开发板

- 设备正常开机后，打开终端命令行，将**修改后的设备树文件**下载到开发板。

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

##### 2.3 使用命令行替换设备树。

选择执行以下命令**增加DTB设备树**文件并重启设备。

- **Jetson Orin NX 8G** 请使用以下代码

```
sudo cp orin_nx_8g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nx_8g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

- **Jetson Orin NX 16G** 请使用以下代码

```
sudo cp orin_nx_16g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nx_16g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

---

#### 检测配置结果

替换设备树后，4个USB3.0端口（C1901为3个）可正常工作，Type-C端口系统默认处于关闭状态。

可使用以下命令查看USB端口工作情况。

```shell
lsusb -t
```

- 未替换设备树前：

[![1-1.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/1-1.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/1-1.png)

- 替换设备树成功后：

[![2.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/Bsa2.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/Bsa2.png)

您也可以自行使用DISK工具或dd指令测试读写速率是否达到USB3.0的标准。

### 三、配置Type-C端口模式

- 配置**Type-C端口**为**Device**模式

::: warning
注意：此命令为临时启用，重启会失效。
:::

```
sudo bash -c 'echo device > /sys/class/usb_role/usb2-0-role-switch/role'
```

设置后，使用Type-C端口连接到PC主机时，具有以下功能

1. COM口，设备的终端命令行
2. 虚拟网卡，设备ip地址默认为：192.168.55.1
3. NCM (Network Control Model)，设备可通过PC主机联网，仅支持Linux、Mac

- 开机默认配置**Type-C端口**为**Device**模式（永久有效）

```
sudo sed -i 's#exit 0#echo device > /sys/class/usb_role/usb2-0-role-switch/role\nexit 0#g' /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh
```
