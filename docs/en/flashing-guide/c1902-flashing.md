---
title: Flash C1902 / C1902 V2
outline: deep
---

# Flash C1902 / C1902 V2

This guide covers both the industrial **[C1902 V2](/en/c1902v2/c1902v2)** and **[C1902 (V1.x)](/en/c1902/c1902)** carrier boards. Both models are directly compatible with NVIDIA's official Developer Kit firmware and differ primarily in how they enter Force Recovery mode.

::: tip Host Environment Setup
We recommend flashing from a native x86_64 Ubuntu PC or a VMware Ubuntu virtual machine. See [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) for host setup instructions. If your board already runs JetPack 6.x (`≥ 36.0`) UEFI firmware and you want to upgrade to JetPack 7, you can also install directly from a USB drive via [Flash JetPack 7 (Orin Nano / NX)](/en/flashing-guide/jetpack7-flashing).
:::

## 1. Flash with NVIDIA SDK Manager

### 1.1 Configure the VMware USB Mode

In VMware Workstation, open **Edit → Preferences → USB** and set the new USB device rule to **"Connect the device to the foreground virtual machine"**. Click **OK**, start the Ubuntu VM, and launch SDK Manager so the board stays attached to the VM when re-enumerating during flashing.

![Open VMware Preferences](/img/wiki-4.png)

![Set USB connection mode to the foreground virtual machine](/img/wiki-5.png)

### 1.2 Enter Recovery Mode

Before flashing, ensure a **single-sided NVMe SSD** is installed in the rear M.2 Key M slot, then enter Force Recovery mode according to your hardware version:

#### C1902 V2 (Dedicated REC Button)

1. With power disconnected, connect the **USB Type-C** port (`#6`) on the C1902 V2 to your host computer using a data-capable USB cable.
2. **Press and hold the onboard `REC` button** in the upper-left corner of the board, then connect 12V DC power (DC5525 jack).
3. Release the `REC` button once SDK Manager detects the recovery device (C1902 V2 also retains `FC REC` and `GND` on the 12-pin header, so the jumper method below works as well).

![Dedicated REC button on the C1902 V2 carrier board](/img/c1902v2-rec-button.webp)

*C1902 V2 dedicated REC button (hold `REC` while applying power)*

#### C1902 V1.x (12-Pin Jumper Method)

1. With power disconnected, place a jumper cap across **`FC REC` (Pin 10)** and **`GND` (Pin 9 or Pin 11)** on the top 12-pin header.
2. Connect the **USB Type-C** port to your host computer.
3. Connect 12V DC power to the board.

![Shorting FC REC and GND on the C1902 V1.x top 12-pin header](/img/wiki-0q7a9416.webp)

*C1902 V1.x: shorting `FC REC` and `GND` on the top 12-pin header with a jumper cap*

Once Force Recovery mode is active, the heatsink fan stays off and SDK Manager automatically detects the module and prompts you to confirm the target hardware.

::: warning Recovery Mode Timeout
If no flashing activity starts for a while after entering Force Recovery mode, certain firmware versions time out and boot into the normal OS. Proceed promptly once the detection dialog appears.
:::

In the SDK Manager dialog, select **`developer kit version`**, click **OK**, and click **CONTINUE**:

![SDK Manager detects the module in recovery mode](/img/wiki-14.png)

### 1.3 Configure the SDK Components

- In **STEP 01**, uncheck **Host Machine** and click **CONTINUE**:

![Uncheck Host Machine in Step 01](/img/flash-jp721-cancel-host-machine.png)

- In **STEP 02**, select only **Jetson Linux** (SDK libraries such as CUDA and TensorRT can be installed over `apt` after booting), accept the license terms, and click **CONTINUE**:

![Select only Jetson Linux in Step 02](/img/flash-jp721-jetson-linux-only.png)

### 1.4 Wait for the Download to Complete

Wait for SDK Manager to download and unpack the Jetson Linux image packages.

![Wait for JetPack OS download to complete](/img/flash-jp721-wait-download.png)

### 1.5 Configure the Flash Parameters

In the flash configuration dialog:

- **OEM Configuration**:
  - **Pre-Config**: Pre-set the Ubuntu username and password before flashing.
  - **Runtime**: Configure the user account on first boot with a DisplayPort monitor and keyboard.
- **Storage Device**: Because C1902 / C1902 V2 has no microSD card slot, select **`NVMe`** (single-sided M.2 NVMe SSD recommended) or **`USB`** (USB flash drive).

![Configure OEM account mode and target storage device](/img/wiki-XjOimage.png)

If prompted again to confirm the board variant, select **`developer kit version`**:

![Confirm Developer Kit Version](/img/wiki-JBF12.png)

Click **Flash** and wait 10–20 minutes for flashing to complete.

::: warning Remove the Jumper Cap Promptly and Keep Power Stable
- If you used the **jumper cap method on C1902 V1.x**, **promptly remove the jumper cap from `FC REC` and `GND` once SDK Manager detects the board and begins flashing** so intermediate reboots do not stay trapped in recovery mode.
- The board reconnects over USB multiple times while flashing. **Do not unplug the USB Type-C cable or disconnect DC power.**
:::

When **INSTALLATION COMPLETED SUCCESSFULLY** appears, click **FINISH**. The board will boot into the Ubuntu desktop or initial setup wizard.

![SDK Manager installation completed (Details tab)](/img/wiki-ftEimage.png)

![SDK Manager installation completed (Terminal tab)](/img/wiki-6.png)

![Successfully booted into the Jetson Linux desktop](/img/wiki-7.webp)

## 2. Flash SUPER Firmware from the Command Line

::: warning Prerequisites and SUPER Mode Support
- Command-line flashing requires the `Linux_for_Tegra` firmware cache created by SDK Manager. Complete at least one SDK Manager download or flash (Section 1) first.
- **`C1902 V2` and `C1902 (V1.1 and later)` support SUPER mode across all Jetson Orin Nano (4GB / 8GB) and Jetson Orin NX (8GB / 16GB) modules** (when running Orin NX `40W` SUPER mode, use a `≥ 60W` DC power supply with active cooling; early `C1902 V1.0` supports Orin Nano SUPER mode only).
:::

### 2.1 Enter Recovery Mode

- **C1902 V2**: With power off, connect the **USB Type-C** cable to the Ubuntu host first, then hold the **`REC` button** while connecting DC power; release once detected.
- **C1902 V1.x**: With power off, short **`FC REC`** and **`GND`** with a jumper cap, connect the **USB Type-C** cable, and apply DC power (remove the jumper cap once `lsusb | grep 0955` detects the device).

### 2.2 Run the Command-Line Flash Script

::: warning Close SDK Manager First
**Close any running SDK Manager window** before executing the script below. Flashing takes approximately 10–20 minutes.
:::

Adjust the **JetPack version** (such as `JetPack_6.2.1_...` or `JetPack_7.2_...`) and **target module folder** (`JETSON_ORIN_NANO_TARGETS` for Orin Nano, or `JETSON_ORIN_NX_TARGETS` for Orin NX) in the `cd` path to match your local cache under `~/nvidia/nvidia_sdk/`. Keep the board target name `jetson-orin-nano-devkit-super` unchanged.

- **Command for JetPack 6 / JetPack 7** (shown with `JetPack_7.2`):

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

- **Command for JetPack 5.1.5**:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

![Command-line SUPER firmware flash completed](/img/wiki-8.png)

### 2.3 Verify SUPER Mode

After booting and completing initial setup, click the power icon in the top-right corner of the desktop to inspect **Power Mode**:

- **Jetson Orin Nano**: **`25W`** and **`MAXN SUPER`** appear (standard mode offers `7W` / `15W` only).
- **Jetson Orin NX**: **`40W`** and **`MAXN SUPER`** appear (standard mode offers `10W` / `15W` / `25W` only).

![Verify SUPER power mode in the desktop menu](/img/wiki-9.png)

If the SUPER profiles do not appear, confirm that your flash command ended with `jetson-orin-nano-devkit-super` and perform a full reflash.

## 3. Back Up and Restore Existing Firmware

::: tip Host Disk Space and Path Notes
Full-disk backups require ample host disk space (**`≥ 200 GB`** VM disk recommended). Adjust the JetPack version and target module folder (`JETSON_ORIN_NANO_TARGETS` or `JETSON_ORIN_NX_TARGETS`) in the `cd` path to match your local setup.
:::

### 3.1 Back Up Firmware

1. Put the board into Force Recovery mode while connected to the Ubuntu host over USB Type-C:
   - **Hardware method**: Follow Section 2.1 (hold `REC` while powering on for C1902 V2, or short `FC REC` + `GND` on C1902 V1.x and remove the jumper once detected).
   - **Software method**: While Jetson Linux is running and connected over Type-C, reboot directly into recovery mode.

**Run on the Jetson terminal:**

```bash
sudo reboot -f forced-recovery
```

::: warning Check Which Terminal You Are Using
Run `sudo reboot -f forced-recovery` **only on the Jetson board**, never on your Ubuntu host PC.
:::

2. Enter the `Linux_for_Tegra` directory on the Ubuntu host, install required dependencies, and run the backup script:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get update
sudo apt-get install -y qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

### 3.2 Restore Firmware

1. Put the target C1902 / C1902 V2 board into Force Recovery mode (same as Section 3.1) and connect it to the Ubuntu host over USB Type-C.

::: warning Required Script Edit for Third-Party Carrier Boards
Before restoring a backup onto C1902 / C1902 V2 (or any third-party carrier board), edit `tools/backup_restore/nvrestore_partitions.sh` and comment out lines **292–296** (`BOARD_MATCH` verification block, shown below).
:::

![Comment out lines 292 to 296 in nvrestore_partitions.sh](/img/wiki-VXwimage.png)

2. Run the restore command to write the backup image onto the target NVMe SSD:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. Post-Flash Configuration

- **USB 3.2 Device Tree Setup**: After flashing official firmware, install the matching device tree per [Orin Nano / NX USB Configuration](/en/orin-nano-series/usb-config) to ensure all USB 3.2 Type-A and Type-C ports operate at full speed.
- **Wi-Fi Driver**: If using an Intel AX200 / AX210 Wi-Fi card on JetPack 6 or 7, see [Network Card Driver](/en/orin-nano-series/network-driver).
- **Hardware Documentation**: See [C1902 V2 Introduction](/en/c1902v2/c1902v2) and [C1902 Introduction](/en/c1902/c1902).
