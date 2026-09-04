---
title: USB Configuration
---

# USB Configuration

## 1. Jetson Orin Nano Configuration

### 1. JetPack 5.1.5 Configuration

#### 1.1 Flash the JetPack 5.1.5 System

Refer to the [official firmware flashing guide](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 1.2 Download the Device Tree File to the Board

After the device boots normally, open a terminal and download the modified device tree file to the board.

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/5.1.4/
```

#### 1.3 Replace the Device Tree from the Command Line

Run the following commands to replace the DTB device tree file and reboot the device.

- **Jetson Orin Nano 4G**: use the following commands

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb.backup # back up the original DTB file
sudo cp kernel_tegra234-p3767-0004-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0004-p3768-0000-a0.dtb
sudo reboot
```

- **Jetson Orin Nano 8G**: use the following commands

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb.backup # back up the original DTB file
sudo cp kernel_tegra234-p3767-0003-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0003-p3768-0000-a0.dtb
sudo reboot
```

### 2. JetPack 6.2.1 Configuration

#### 2.1 Flash the JetPack 6.2.1 System

Refer to the [official firmware flashing guide](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 2.2 Download the Device Tree File to the Board

After the device boots normally, open a terminal and download the modified device tree file to the board.

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

#### 2.3 Replace the Device Tree from the Command Line

Run the following commands to add the DTB device tree file and reboot the device.

- **Jetson Orin Nano 4G**: run the following commands

```shell
sudo cp orin_nano_4g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nano_4g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

- **Jetson Orin Nano 8G**: run the following commands

```shell
sudo cp orin_nano_8g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nano_8g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

## 2. Jetson Orin NX Configuration

### 1. JetPack 5.1.5 Configuration

#### 1.1 Flash the JetPack 5.1.5 System

Refer to the [official firmware flashing guide](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 1.2 Download the Device Tree File to the Board

After the device boots normally, open a terminal and download the modified device tree file to the board.

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/5.1.4/
```

#### 1.3 Replace the Device Tree from the Command Line

Run the following commands to replace the DTB device tree file and reboot the device.

- **Jetson Orin NX 8G**: run the following commands

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb.backup # back up the original DTB file
sudo cp kernel_tegra234-p3767-0001-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0001-p3768-0000-a0.dtb
sudo reboot
```

- **Jetson Orin NX 16G**: run the following commands

```shell
sudo cp /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb.backup # back up the original DTB file
sudo cp kernel_tegra234-p3767-0000-p3768-0000-a0.dtb /boot/dtb
sudo chown 0:0 /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
sudo chmod 644 /boot/dtb/kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
sudo reboot
```

### 2. JetPack 6.2.1 Configuration

#### 2.1 Flash the JetPack 6.2.1 System

Refer to the [official firmware flashing guide](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/75887)

#### 2.2 Download the Device Tree File to the Board

After the device boots normally, open a terminal and download the modified device tree file to the board.

```shell
git clone https://gitee.com/kongyuantech/document.git
cd document/AN002\ Orin\ Nano\ NX\ USB配置/6.2/
```

#### 2.3 Replace the Device Tree from the Command Line

Run the following commands to add the DTB device tree file and reboot the device.

- **Jetson Orin NX 8G**: use the following commands

```shell
sudo cp orin_nx_8g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nx_8g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

- **Jetson Orin NX 16G**: use the following commands

```shell
sudo cp orin_nx_16g.dtb /boot/dtb
sudo sed -i 's#console=tty0#console=tty0\n      FDT /boot/dtb/orin_nx_16g.dtb#g' /boot/extlinux/extlinux.conf
sudo reboot
```

## Verifying the Configuration

After replacing the device tree, all 4 USB 3.0 ports (3 on the C1901) work properly. The Type-C port is disabled by default.
You can use the following command to check the status of the USB ports.

```shell
lsusb -t
```

- Before replacing the device tree:

![1](/img/wiki-1-1.png)

- After successfully replacing the device tree:

![2](/img/wiki-Bsa2.png)

On the JetPack 7.2.1 system below, `5000M` or `10000M` indicates a SuperSpeed link. The USB 3.0 hub in this example has a `10000M` upstream link:

![Verifying a USB SuperSpeed link with lsusb](/img/usb-01-superspeed-verification.webp)

You can also use the DISK tool or the `dd` command yourself to test whether the read/write speeds meet the USB 3.0 standard.

## 3. Configuring the Type-C Port Mode

- Configure the Type-C port as Device mode

Note: this command only enables the mode temporarily; it will be lost after a reboot.

```shell
sudo bash -c 'echo device > /sys/class/usb_role/usb2-0-role-switch/role'
```

Once set, connecting the device to a PC host via the Type-C port provides the following functions:
- COM port, the device's terminal command line
- Virtual network interface, the device's default IP address is: 192.168.55.1
- NCM (Network Control Model), the device can access the network through the PC host; only supported on Linux and Mac

- Configure the Type-C port as Device mode by default at boot (permanent)

```shell
sudo sed -i 's#exit 0#echo device > /sys/class/usb_role/usb2-0-role-switch/role\nexit 0#g' /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh
```
