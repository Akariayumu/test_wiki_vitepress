---
title: Flash the C1902
---

# Flash the C1902

> We recommend flashing from Linux or a Linux VM. See [Install a VMware VM](/en/flashing-guide/ubuntu-sdkmanager) for instructions on installing the VM and SDK Manager.

## 1. Flash with NVIDIA SDK Manager

### 1.1 Configure the VMware USB Mode

Set the USB connection mode to "Connect the device to the foreground virtual machine" to prevent the flash from failing when the board reboots during the process.

![1.1 Configure the VMware USB mode](/img/wiki-4.png)

![1.1 Configure the VMware USB mode](/img/wiki-5.png)

### 1.2 Enter Recovery Mode

- Short the board's **FC REC** and **GND** pins with a jumper cap
- Connect the board to the computer with a USB-to-Type-C data cable
- Connect DC power to the board
- After recovery mode is entered, SDK Manager detects the module type automatically and the heatsink fan does not run

> If no action is taken for a while after entering recovery mode, the board reboots into the system. Be mindful of the timing.

![1.2 Enter recovery mode](/img/wiki-0q7a9416.webp)

![1.2 Enter recovery mode](/img/wiki-14.png)

### 1.3 Configure the SDK

- Uncheck **Host Machine**, then click **CONTINUE**
- Select only **Jetson Linux**

![1.3 Configure the SDK: uncheck Host Machine](/img/flash-jp721-cancel-host-machine.png)

![1.3 Configure the SDK: select only Jetson Linux](/img/flash-jp721-jetson-linux-only.png)

### 1.4 Wait for the Download to Complete

![1.4 Wait for the download to complete](/img/flash-jp721-wait-download.png)

### 1.5 Configure the Flash Parameters

- **Pre-Config**: Set the username and password in advance
- **Runtime**: Configure the username and password after first boot
- **Storage Device**: Select the target medium (microSD card / SSD / USB drive)
- Select **Developer Kit Version**

> Wait patiently for the flash to finish; it takes about 10–20 minutes. The board may reconnect to the host several times. Do not disconnect the data cable or power off the board. You can remove the jumper cap after the board type has been detected.
>
> After flashing, remove the jumper cap and power on the board. The flash was successful if it boots into the desktop or initial setup screen.

![1.5 Configure the flash parameters](/img/wiki-XjOimage.png)

![1.5 Configure the flash parameters](/img/wiki-JBF12.png)

![1.5 Configure the flash parameters](/img/wiki-ftEimage.png)

![1.5 Configure the flash parameters](/img/wiki-6.png)

![1.5 Configure the flash parameters](/img/wiki-7.webp)

## 2. Flash SUPER Firmware from the Command Line

> This operation requires the official firmware environment. First complete at least one full flash with SDK Manager to create the firmware cache.

### 2.1 Enter Recovery Mode

Short FC REC and GND with a jumper cap, connect the board to the computer with a Type-C data cable, and connect board power.

### 2.2 Flash with the Official Firmware

> Close SDK Manager before proceeding. Flashing takes about 10–20 minutes.

**Command for JetPack 6/7:**

> The command parameters are identical; only the firmware directory differs. Use `JetPack_6.2.1_Linux_...` for JetPack 6.2.1 and `JetPack_7.2_Linux_...` for JetPack 7.2. The following example uses JetPack 7.2.

```bash
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

**Command for JetPack 5.1.5:**

```bash
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

![2.2 Flash with the official firmware](/img/wiki-8.png)

### 2.3 Verify SUPER Mode

After powering on the board and completing user setup, select a power mode from the upper-right corner of the desktop. **25W & MAXN SUPER** is available only in SUPER mode; standard mode provides only 7W and 15W.

![2.3 Verify SUPER mode](/img/wiki-9.png)

## 3. Back Up and Restore Existing Firmware

### 3.1 Back Up the Firmware

Short FC REC and GND with a jumper cap, connect the board to the computer over Type-C, and connect power to enter recovery mode.

Alternatively, while the board is running normally and connected to the host, run:

```bash
sudo reboot -f forced-recovery
```

Enter the command-line directory in the firmware cache used for the original flash:

```bash
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
```

Install the dependencies:

```bash
sudo apt-get install qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
```

**Backup command:**

```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

**Restore command:**

```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

> When restoring a backup on a third-party carrier board, edit `nvrestore_partitions.sh` and comment out lines 292–296.

![3.1 Back up the firmware](/img/wiki-VXwimage.png)
