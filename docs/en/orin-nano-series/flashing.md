---
title: Flashing Tutorial
---

# Flashing Tutorial

## 1. Install an Ubuntu Virtual Machine

See [Install Ubuntu Virtual Machine and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) for details.

### 1.1 Download VMware Workstation

Baidu Netdisk: `VMware-workstation-full-16.2.5-20904516.exe`
Link: https://pan.baidu.com/s/1xopblFgG29dYZXoNfwa5ZA Extraction code: frjy

### 1.2 Install VMware

Keep the default options and enter the activation code (search online for: vmware16 key).

![Install VMware](/img/wiki-snipaste-2025-06-09-14-51-05.png)

![Install VMware](/img/wiki-snipaste-2025-06-09-14-56-52.png)

![Install VMware](/img/wiki-snipaste-2025-06-09-14-59-23.png)

### 1.3 Install Ubuntu

Version **20.04** or **22.04** is recommended. Download `ubuntu20.04_desktop_amd64.iso`; if the download is slow, it is recommended to use the [Tsinghua mirror](https://mirrors.tuna.tsinghua.edu.cn/) or the [USTC mirror](https://mirrors.ustc.edu.cn/).

1. Open VMware → New Virtual Machine → Typical configuration
2. Select the downloaded ISO image
3. Enter a username and password
4. Choose a storage location; at least 300 GB of storage space is recommended
5. Wait for the installation to complete

![New virtual machine](/img/wiki-snipaste-2025-06-11-15-21-48.png)

![New virtual machine](/img/wiki-snipaste-2025-06-11-15-32-12.png)

![Select ISO image](/img/wiki-snipaste-2025-06-11-15-33-59.png)

![Configure account](/img/wiki-snipaste-2025-06-11-15-37-32.png)

![Choose storage location](/img/wiki-snipaste-2025-06-11-15-38-12.png)

![Configure disk](/img/wiki-snipaste-2025-06-11-15-40-38.png)

![Finish configuration](/img/wiki-snipaste-2025-06-11-15-41-54.png)

![Waiting for installation](/img/wiki-snipaste-2025-06-11-15-51-19.png)

![Installation complete](/img/wiki-snipaste-2025-06-11-15-58-36.png)

---

## 2. Install NVIDIA SDK Manager

### 2.1 Download the Installer

Open the browser inside the virtual machine, visit [Jetson SDK](https://developer.nvidia.com/sdk-manager), and download the `.deb` Ubuntu installer.

![Download the SDK Manager installer](/img/wiki-1.png)

### 2.2 Install SDK Manager

```bash
sudo apt update
sudo dpkg -i sdkmanager_2.3.0-12617_amd64.deb  # adjust the package name to the actual version
sudo apt install --fix-broken
```

![Install SDK Manager](/img/wiki-12.png)

![Log in to your NVIDIA account](/img/wiki-ZDbimage.png)

![SDK Manager main interface](/img/wiki-f6Eimage.png)

---

## 3. Flashing with NVIDIA SDK Manager

### 3.1 Set the VMware USB Mode

Set the USB connection mode to "Connect the device to the foreground virtual machine" to avoid flashing failure caused by the board rebooting midway.

![Set USB connection mode](/img/wiki-4.png)

![Set USB connection mode](/img/wiki-5.png)

### 3.2 Enter Recovery Mode

- Use a jumper cap to short the **FC REC** and **GND** pins on the board
- Connect the board to the computer with a USB to Type-C cable
- Connect the board's DC power supply
- After successfully entering recovery mode, SDK Manager will automatically detect the SoM type

> If no operation is performed for a while after entering recovery mode, the board will reboot into the system, so pay attention to the timing of your operations.

![Short FC REC and GND](/img/wiki-0q7a9416.jpg)

![SoM detected](/img/wiki-14.png)

### 3.3 Configure the SDK

- Uncheck **Host Machine** and click **CONTINUE**
- Check only **Jetson Linux**

![Uncheck Host Machine](/img/wiki-B3Uimage.png)

![Check only Jetson Linux](/img/wiki-15.png)

### 3.4 Wait for the Download to Complete

![Wait for the download to complete](/img/wiki-3k6image.png)

### 3.5 Configure Flashing Parameters

- **Pre-Config**: preset account and password
- **Runtime**: configure the account and password yourself after booting
- **Storage Device**: the medium the system is flashed to (SD card / SSD / USB drive)
- Select **Developer Kit Version**

> Please wait patiently for the flashing to complete (10–20 minutes). Do not unplug the data cable or cut the board's power during the process.

![Configure flashing parameters](/img/wiki-XjOimage.png)

![Configure flashing parameters](/img/wiki-JBF12.png)

![Select storage medium](/img/wiki-ftEimage.png)

![Flashing in progress](/img/wiki-6.png)

![Flashing complete](/img/wiki-7.png)

---

## 4. Flash SUPER Firmware via Command Line

> You must complete at least one full flash with SDK Manager first to create the firmware cache.

### 4.1 Enter Recovery Mode

Short FC REC and GND with a jumper cap, connect to the computer via Type-C, and connect the power supply.

### 4.2 Command-Line Flashing

> Close any running SDK Manager application. The flashing process takes about 10–20 minutes.

**JetPack 6.2:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1   -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml"   --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

**JetPack 5.1.5:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1   -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml"   --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

![Command-line flashing](/img/wiki-8.png)

### 4.3 Verify SUPER Mode

After booting, select the power mode in the top-right corner of the desktop. **25W & MAXN SUPER** are exclusive to SUPER mode; the normal mode only offers 7W and 15W.

![Verify SUPER mode](/img/wiki-9.png)

---

## 5. Back Up and Restore Existing Firmware

### 5.1 Back Up Firmware

Enter recovery mode (short FC REC + GND with a jumper cap and connect via Type-C), or run the following in the system:

```bash
sudo reboot -f forced-recovery
```

```bash
cd ~/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get install qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
```

![Back up firmware](/img/wiki-VXwimage.png)

**Backup:**
```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

**Restore:**
```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

> If you use a third-party carrier board to restore a backup, you need to edit `nvrestore_partitions.sh` and comment out lines 292–296.
