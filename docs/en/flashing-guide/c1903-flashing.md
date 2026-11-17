---
title: Flash C1903
outline: deep
---

# Flash C1903

The **[C1903](/en/c1903/c1903)** is a wide-temperature industrial carrier board and edge AI kit with an upgraded power delivery design that supports flashing official NVIDIA Developer Kit firmware and enabling **SUPER mode** across all **Jetson Orin Nano (4GB / 8GB)** and **Jetson Orin NX (8GB / 16GB)** modules.

::: tip Host Environment Setup
We recommend flashing from a native x86_64 Ubuntu PC or a VMware Ubuntu virtual machine. See [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) for host setup instructions. If your device already runs JetPack 6.x (`≥ 36.0`) UEFI firmware and you want to upgrade to JetPack 7, you can also install directly from a USB drive via [Flash JetPack 7 (Orin Nano / NX)](/en/flashing-guide/jetpack7-flashing).
:::

## 1. Flash with NVIDIA SDK Manager

### 1.1 Configure the VMware USB Mode

In VMware Workstation, open **Edit → Preferences → USB** and set the new USB device rule to **"Connect the device to the foreground virtual machine"**. Click **OK**, start the Ubuntu VM, and launch SDK Manager so the board stays attached to the VM when re-enumerating during flashing.

![Open VMware Preferences](/img/wiki-4.png)

![Set USB connection mode to the foreground virtual machine](/img/wiki-5.png)

### 1.2 Enter Recovery Mode

Before flashing, verify that a **single-sided NVMe SSD** (2280 or 2230) is installed in a rear M.2 Key M slot. The C1903 provides two ways to enter Force Recovery mode — choose either method:

#### Method 1: Front REC Button (Recommended for Single Flashes)

1. With power disconnected, connect the rear **USB Type-C** port (`#18`) on the C1903 to your host computer using a data-capable USB cable.
2. **Press and hold the front `REC` button** (the right-hand tactile button located between the DC5525 power jack and the HDMI port), then connect 12V DC power (`≥ 45W` recommended for Orin Nano, `≥ 60W` for Orin NX).
3. Release the `REC` button once SDK Manager detects the recovery device.

![Front Power and REC buttons on the C1903](/img/c1903-buttons.webp)

*C1903 front Power and REC buttons (connect Type-C first while powered off, then hold `REC` and apply power)*

#### Method 2: Rear DIP Switch 3

1. With power disconnected, locate the 4-position DIP switch (`#23`) on the back of the carrier board and slide **DIP switch 3 (silkscreened `REC`)** to **`ON`**. The board will now enter Force Recovery mode automatically on power-up.
2. Connect the **USB Type-C** cable to your host computer and connect 12V DC power.

![C1903 rear function DIP switch](/img/c1903-switch.webp)

*C1903 rear DIP switch (sliding switch 3 `REC` to `ON` forces recovery mode on power-up)*

::: warning Set DIP Switch 3 Back to OFF Once Detected (Critical)
If you use **DIP switch 3** to enter Force Recovery mode, **you must slide DIP switch 3 back to `OFF` once SDK Manager detects the board and begins flashing (or before rebooting after the flash finishes)!**
During flashing, the board automatically reboots into `initrd` to write external NVMe partitions. Leaving DIP switch 3 in the `ON` position traps the board back in recovery mode on reboot, causing the flash to time out or preventing normal boot.
:::

Once Force Recovery mode is active, the cooling fan remains off and SDK Manager automatically detects the module and opens the target hardware prompt. Select **`developer kit version`**, click **OK**, and click **CONTINUE**:

![SDK Manager detects the module in recovery mode](/img/wiki-14.png)

### 1.3 Configure the SDK Components

- In **STEP 01**, uncheck **Host Machine** and click **CONTINUE**:

![Uncheck Host Machine in Step 01](/img/flash-jp721-cancel-host-machine.png)

- In **STEP 02**, select only **Jetson Linux** (SDK libraries such as CUDA and TensorRT can be installed over `apt` after first boot, making flashing much faster), accept the license agreement, and click **CONTINUE**:

![Select only Jetson Linux in Step 02](/img/flash-jp721-jetson-linux-only.png)

### 1.4 Wait for the Download to Complete

Wait for SDK Manager to download and unpack the Jetson Linux packages.

![Wait for JetPack OS download to complete](/img/flash-jp721-wait-download.png)

### 1.5 Configure the Flash Parameters

In the flash configuration dialog:

- **OEM Configuration**:
  - **Pre-Config**: Pre-configure the Ubuntu username and password before flashing.
  - **Runtime**: Configure the user account interactively on first boot with a standard HDMI monitor and keyboard.
- **Storage Device**: Because the C1903 has no microSD card slot, select **`NVMe`** (single-sided M.2 NVMe SSD recommended) or **`USB`** (USB flash drive).

![Configure OEM account mode and target storage device](/img/wiki-XjOimage.png)

If prompted again to confirm the board variant, select **`developer kit version`**:

![Confirm Developer Kit Version](/img/wiki-JBF12.png)

Click **Flash** and wait 10–20 minutes for flashing to finish.

::: warning Keep Connections Stable and Verify DIP Switch 3 Is OFF
- The board disconnects and re-enumerates over USB multiple times during flashing — this is normal. **Do not unplug the USB Type-C cable or disconnect DC power.**
- If you used rear **DIP switch 3**, double-check that it has been returned to the **`OFF`** position.
:::

When **INSTALLATION COMPLETED SUCCESSFULLY** appears, click **FINISH**. After the board boots into Ubuntu, be sure to complete the USB device-tree setup in Section 4 below.

![SDK Manager installation completed (Details tab)](/img/wiki-ftEimage.png)

![SDK Manager installation completed (Terminal tab)](/img/wiki-6.png)

![Successfully booted into the Jetson Linux desktop](/img/wiki-7.webp)

## 2. Flash SUPER Firmware from the Command Line

::: warning Prerequisites and Full-Lineup SUPER Support
- Command-line flashing requires the `Linux_for_Tegra` directory created by SDK Manager. Complete at least one SDK Manager download or flash (Section 1) first.
- **The C1903 fully supports SUPER mode across all Jetson Orin Nano (4GB / 8GB) and Jetson Orin NX (8GB / 16GB) modules.** When running Orin NX in `40W` SUPER mode, use a **`≥ 60W`** 12V DC power supply with active cooling.
:::

### 2.1 Enter Recovery Mode

With power disconnected, connect the **USB Type-C** cable between the C1903 and your Ubuntu host first, then hold the front **`REC` button** while applying DC power (if using rear DIP switch 3 instead, flip switch 3 back to `OFF` immediately after `lsusb | grep 0955` detects the recovery device).

### 2.2 Run the Command-Line Flash Script

::: warning Close SDK Manager First
**Close any running SDK Manager window** before executing the script below. Flashing takes approximately 10–20 minutes.
:::

Adjust the **JetPack version** (such as `JetPack_6.2.1_...` or `JetPack_7.2_...`) and **target module directory** (`JETSON_ORIN_NANO_TARGETS` for Orin Nano, or `JETSON_ORIN_NX_TARGETS` for Orin NX) in the `cd` path to match your local cache under `~/nvidia/nvidia_sdk/`. Keep the board target name `jetson-orin-nano-devkit-super` unchanged.

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

After booting and completing initial setup, click the power icon in the top-right corner of the Ubuntu desktop to check **Power Mode**:

- **Jetson Orin Nano**: **`25W`** and **`MAXN SUPER`** appear (standard mode offers `7W` / `15W` only).
- **Jetson Orin NX**: **`40W`** and **`MAXN SUPER`** appear (standard mode offers `10W` / `15W` / `25W` only).

![Verify SUPER power mode in the desktop menu](/img/wiki-9.png)

If the SUPER profiles are missing, verify that your flash command ended with `jetson-orin-nano-devkit-super` and perform a complete reflash.

## 3. Back Up and Restore Existing Firmware

::: tip Host Disk Space and Path Notes
Full-disk backups require ample host disk space (**`≥ 200 GB`** VM disk recommended). Adjust the JetPack version and target module directory (`JETSON_ORIN_NANO_TARGETS` or `JETSON_ORIN_NX_TARGETS`) in the `cd` path to match your local setup.
:::

### 3.1 Back Up Firmware

1. Put the C1903 into Force Recovery mode while connected to the Ubuntu host over USB Type-C:
   - **Hardware method**: With power off, connect Type-C first, then hold the front **`REC` button** while applying DC power.
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

1. Put the target C1903 board into Force Recovery mode (same as Section 3.1) and connect it to the Ubuntu host over USB Type-C.

::: warning Required Script Edit for Third-Party Carrier Boards
Before restoring a backup onto the C1903, edit `tools/backup_restore/nvrestore_partitions.sh` and comment out lines **292–296** (`BOARD_MATCH` verification block, shown below) so the restore does not exit on board EEPROM mismatch.
:::

![Comment out lines 292 to 296 in nvrestore_partitions.sh](/img/wiki-VXwimage.png)

2. Run the restore command to write the backup image onto the target NVMe SSD:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. Post-Flash Configuration (Important)

- **Enable the Front `#6` 10Gbps USB 3.2 Port (Required)**: Port **`#6` (USB 3.2 Type-A, 10Gbps)** on the front of the C1903 is routed directly from the Jetson module and is disabled by default under stock NVIDIA firmware. Follow [Orin Nano / NX USB Configuration](/en/orin-nano-series/usb-config) to install the matching device tree (DTB) for your module SKU and JetPack version so all USB ports operate properly.
- **Wi-Fi Driver**: The onboard Gigabit Ethernet port (RTL8111) works out of the box; if you install an Intel AX200 / AX210 M.2 Key E Wi-Fi module on JetPack 6 or 7, see [Network Card Driver](/en/orin-nano-series/network-driver).
- **GH1.25 Peripheral Pinouts**: For CAN, UART, I2C, SPI, and GPIO GH1.25 connector pinouts (3.3V logic level), refer to [C1903 Introduction](/en/c1903/c1903).
