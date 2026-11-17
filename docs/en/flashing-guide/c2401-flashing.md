---
title: Flash C2401
outline: deep
---

# Flash C2401

::: tip Host Environment and Power Setup
- We recommend flashing from a native x86_64 Ubuntu PC or a VMware Ubuntu virtual machine. See [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) for host setup instructions, or [Flash JetPack 7 (Orin Nano / NX)](/en/flashing-guide/jetpack7-flashing) if your board already has JetPack 6.x (`≥ 36.0`) UEFI firmware and you want to install JetPack 7 via USB.
- **Power Supply Note**: The USB Type-C port on the C2401 is data-only for firmware flashing and cannot power the board. Always supply external DC power (`12V` recommended, `10V–30V` supported) through the **XT30 power connector**.
:::

## 1. Flash with NVIDIA SDK Manager

### 1.1 Configure the VMware USB Mode

In VMware Workstation, open **Edit → Preferences → USB** and set the new USB device rule to **"Connect the device to the foreground virtual machine"**. Click **OK**, start the Ubuntu VM, and launch SDK Manager so the board stays connected to the VM when re-enumerating during flashing.

![Open VMware Preferences](/img/wiki-4.png)

![Set USB connection mode to the foreground virtual machine](/img/wiki-5.png)

### 1.2 Enter Recovery Mode

Before flashing, verify that a **single-sided 2230 NVMe SSD** is installed in the rear M.2 Key M slot. The C2401 provides two ways to enter Force Recovery mode:

#### Method 1: Front REC Button (Recommended for Single Flashes)

1. With power disconnected, **first connect the C2401's USB Type-C port (`#3`) to your host computer** using a data-capable USB cable.
2. **Press and hold the front `REC` button**, then connect XT30 power to enter Force Recovery mode.
3. Release the `REC` button once SDK Manager detects the recovery device.

::: info 60-Second Auto-Boot Timeout
Force Recovery mode triggered by the `REC` button stays active for approximately **60 seconds**. If no flashing communication is detected within that window, the board automatically continues into the normal boot sequence.
:::

![Front REC button on the C2401 carrier board](/img/wiki-0q7a2475-1.webp)

*C2401 front `REC` button (connect the Type-C cable first while powered off, then hold the highlighted `REC` button and connect XT30 power)*

#### Method 2: Rear DIP Switch 3

1. With power disconnected, slide **DIP switch 3** on the back of the carrier board to **`ON`**. The system will automatically enter Force Recovery mode on each power-up.
2. Connect the **USB Type-C** cable to your host computer first, then connect XT30 power.

![Rear DIP switch 3 on the C2401 carrier board](/img/c2401-switch-rec.png)

*C2401 rear DIP switch 3 (sliding switch 3 to `ON` enters recovery mode automatically on power-up)*

::: warning Set DIP Switch 3 Back to OFF Once Detected (Critical)
If you use rear **DIP switch 3** to enter Force Recovery mode, **you must slide DIP switch 3 back to `OFF` once SDK Manager detects the board and begins flashing (or before rebooting after the flash finishes)!**
While flashing an NVMe SSD, the board automatically reboots into `initrd` midway through the process. Leaving DIP switch 3 in the `ON` position forces the board back into recovery mode on reboot, causing the flash to time out or preventing normal boot.
:::

Once Force Recovery mode is active, SDK Manager automatically detects the module and displays the target hardware selection prompt. Select **`developer kit version`**, click **OK**, and click **CONTINUE**:

![SDK Manager detects the module in recovery mode](/img/wiki-14.png)

### 1.3 Configure the SDK Components

- In **STEP 01**, uncheck **Host Machine** and click **CONTINUE**:

![Uncheck Host Machine in Step 01](/img/flash-jp721-cancel-host-machine.png)

- In **STEP 02**, select only **Jetson Linux** (SDK libraries such as CUDA and TensorRT can be installed over `apt` after booting, making the flash much faster), accept the license terms, and click **CONTINUE**:

![Select only Jetson Linux in Step 02](/img/flash-jp721-jetson-linux-only.png)

### 1.4 Wait for the Download to Complete

Wait for SDK Manager to download and unpack the Jetson Linux packages.

![Wait for JetPack OS download to complete](/img/flash-jp721-wait-download.png)

### 1.5 Configure the Flash Parameters

In the flash configuration dialog:

- **OEM Configuration**:
  - **Pre-Config**: Pre-set the Ubuntu username and password (recommended if you do not have a Mini HDMI cable attached).
  - **Runtime**: Complete initial user setup interactively on first boot using a Mini HDMI monitor and USB keyboard.
- **Storage Device**: Select **`NVMe`** (2230 NVMe SSD) or **`USB`**.

![Configure OEM account mode and target storage device](/img/wiki-XjOimage.png)

If prompted again to confirm the board variant, select **`developer kit version`**:

![Confirm Developer Kit Version](/img/wiki-JBF12.png)

Click **Flash** and wait 10–20 minutes for flashing to finish.

::: warning Keep Connections Stable and Verify DIP Switch 3 Is OFF
- The board reconnects over USB several times during flashing. **Do not unplug the USB Type-C cable or disconnect XT30 power.**
- If you used rear **DIP switch 3**, confirm that it has been returned to the **`OFF`** position.
:::

When **INSTALLATION COMPLETED SUCCESSFULLY** appears, click **FINISH**. After booting into Ubuntu, proceed to Section 4 below to install the 2.5GbE network driver and USB device tree.

![SDK Manager installation completed (Details tab)](/img/wiki-ftEimage.png)

![SDK Manager installation completed (Terminal tab)](/img/wiki-6.png)

![Successfully booted into the Jetson Linux desktop](/img/wiki-7.webp)

## 2. Flash SUPER Firmware from the Command Line

::: warning Prerequisites and Orin Nano SUPER Compatibility
- Command-line flashing requires the `Linux_for_Tegra` firmware cache created by SDK Manager. Complete at least one SDK Manager download or flash (Section 1) first.
- **The C2401 supports SUPER mode (`25W` / `MAXN SUPER`) for Jetson Orin Nano (4GB / 8GB) modules only.** When using a **Jetson Orin NX (8GB / 16GB)** module on the C2401, flash the standard firmware from Section 1 (`10W / 15W / 25W`) — Orin NX `40W` SUPER mode is not supported on this board.
:::

### 2.1 Enter Recovery Mode

With power disconnected, **first connect the USB Type-C cable between the C2401 and your Ubuntu host**, then hold the front **`REC` button** while connecting XT30 power (if using rear DIP switch 3 instead, flip switch 3 back to `OFF` immediately after `lsusb | grep 0955` detects the device).

### 2.2 Run the Command-Line Flash Script

::: warning Close SDK Manager First
**Close any running SDK Manager window** before executing the script below. Flashing takes approximately 10–20 minutes.
:::

Update the **JetPack version** in the `cd` path below (such as `JetPack_6.2.1_...` or `JetPack_7.2_...`) to match the actual folder inside `~/nvidia/nvidia_sdk/`.

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

After booting and completing initial setup, click the power icon in the top-right corner of the desktop to check **Power Mode**:

- **Orin Nano Standard Mode**: Offers **`7W`** and **`15W`** only.
- **Orin Nano SUPER Mode**: Unlocks **`25W`** and **`MAXN SUPER`**.

![Verify 25W and MAXN SUPER in the desktop power menu](/img/wiki-9.png)

If **`25W`** and **`MAXN SUPER`** appear, SUPER firmware is active. Otherwise, verify that your flash command ended with `jetson-orin-nano-devkit-super` and perform a complete reflash.

## 3. Back Up and Restore Existing Firmware

::: tip Host Disk Space and Path Notes
Full-disk backups require ample host disk space (**`≥ 200 GB`** VM disk recommended). Adjust the JetPack version and target module directory (`JETSON_ORIN_NANO_TARGETS` or `JETSON_ORIN_NX_TARGETS`) in the `cd` path to match your local setup.
:::

### 3.1 Back Up Firmware

1. Put the C2401 into Force Recovery mode while connected to the Ubuntu host over USB Type-C:
   - **Hardware method**: With power off, connect the Type-C cable first, then hold the front **`REC` button** while connecting XT30 power.
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

1. Put the target C2401 board into Force Recovery mode (same as Section 3.1) and connect it to the Ubuntu host over USB Type-C.

::: warning Required Script Edit for Third-Party Carrier Boards
Before restoring a backup onto the C2401, edit `tools/backup_restore/nvrestore_partitions.sh` and comment out lines **292–296** (`BOARD_MATCH` verification block, shown below) so the restore does not exit on board EEPROM mismatch.
:::

![Comment out lines 292 to 296 in nvrestore_partitions.sh](/img/wiki-VXwimage.png)

2. Run the restore command to write the backup image onto the target NVMe SSD:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. Post-Flash Configuration (Important)

After flashing stock NVIDIA firmware onto the C2401, complete the following driver and device-tree steps:

- **Onboard 2.5GbE Network Driver (Required)**: The C2401 features dual RJ45 ports — Gigabit Ethernet (RTL8111, supported out of the box) and **2.5GbE (Realtek RTL8125)**. To enable the 2.5GbE port (or Intel AX200 / AX210 Wi-Fi modules on JetPack 6+), install the `r8125` driver per [Network Card Driver](/en/orin-nano-series/network-driver).
- **USB 3.2 & Expansion Header Device Tree**: To enable full-speed USB 3.2 routing, USB 3.0 on the rear 30-pin expansion connector (Pins 13 / 15 / 19 / 21), and `UART1` (routed from M.2 Key E), install the matching device tree per [Orin Nano / NX USB Configuration](/en/orin-nano-series/usb-config) and [C2401 Introduction](/en/c2401/c2401).
