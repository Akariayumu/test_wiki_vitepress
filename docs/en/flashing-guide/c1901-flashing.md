---
title: Flash C1901
outline: deep
---

# Flash C1901

::: tip Host Environment Setup
We recommend flashing from a native x86_64 Ubuntu PC or a VMware Ubuntu virtual machine. For VMware and SDK Manager setup instructions, see [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager). If your board already runs JetPack 6.x (`≥ 36.0`) UEFI firmware and you want to upgrade to JetPack 7, you can also install via USB drive using [Flash JetPack 7 (Orin Nano / NX)](/en/flashing-guide/jetpack7-flashing).
:::

## 1. Flash with NVIDIA SDK Manager

### 1.1 Configure the VMware USB Mode

In VMware Workstation, open **Edit → Preferences → USB** and set the new USB device rule to **"Connect the device to the foreground virtual machine"**. Click **OK**, start the Ubuntu VM, and launch SDK Manager so the board stays attached to the VM when re-enumerating during the flash.

![Open VMware Preferences](/img/wiki-4.png)

![Set USB connection mode to the foreground virtual machine](/img/wiki-5.png)

### 1.2 Enter Recovery Mode

1. Ensure the C1901 carrier board is powered off and a **single-sided NVMe SSD** is installed in the rear M.2 Key M slot.
2. Locate the **12-pin Button Header** on the edge of the C1901 carrier board (silkscreened with `FC REC` and `GND`). Referring to the pinout diagram below, place a jumper cap across **Pin 10 (`Force Recovery` / `FC REC`)** and **Pin 9 or Pin 11 (`GND`)**.
3. Connect the board's **USB Type-C** port (`#6`) to your host computer using a data-capable USB cable.
4. Connect the 12V DC power adapter (DC5521 jack, compatible with DC5525 plugs).

Once the board enters Force Recovery mode, the heatsink fan remains off and SDK Manager automatically detects the module and displays a hardware selection prompt.

::: warning Recovery Mode Timeout
If no flashing activity starts for a while after entering Force Recovery mode, certain firmware versions automatically time out and continue booting into the OS. Proceed promptly once SDK Manager detects the module.
:::

![C1901 12-pin Button Header pinout diagram](/img/c1901-12pin.png)

*C1901 12-pin Button Header pinout (short Pin 10 `Force Recovery` and Pin 9 or Pin 11 `GND`)*

In the SDK Manager prompt, select the **`developer kit version`** entry, click **OK**, and click **CONTINUE**:

![SDK Manager detects the module in recovery mode](/img/wiki-14.png)

### 1.3 Configure the SDK Components

- In **STEP 01**, uncheck **Host Machine** and click **CONTINUE**:

![Uncheck Host Machine in Step 01](/img/flash-jp721-cancel-host-machine.png)

- In **STEP 02**, select only **Jetson Linux** (SDK libraries such as CUDA and TensorRT can be installed over `apt` after booting, significantly shortening flash time), accept the license agreement, and click **CONTINUE**:

![Select only Jetson Linux in Step 02](/img/flash-jp721-jetson-linux-only.png)

### 1.4 Wait for the Download to Complete

Wait for SDK Manager to download and unpack the Jetson Linux packages.

![Wait for JetPack OS download to complete](/img/flash-jp721-wait-download.png)

### 1.5 Configure the Flash Parameters

In the flash configuration dialog:

- **OEM Configuration**:
  - **Pre-Config**: Pre-configure the Ubuntu username and password before flashing.
  - **Runtime**: Configure the user account on first boot using an HDMI monitor (1080P output under stock firmware) and USB keyboard.
- **Storage Device**: Because the C1901 has no microSD card slot, select **`NVMe`** (single-sided M.2 NVMe SSD recommended) or **`USB`** (USB flash drive).

![Configure OEM account mode and target storage device](/img/wiki-XjOimage.png)

If prompted again to confirm the target board type, select **`developer kit version`**:

![Confirm Developer Kit Version](/img/wiki-JBF12.png)

Click **Flash** and wait 10–20 minutes for the process to finish.

::: warning Remove the Jumper Cap Promptly and Keep Power Stable
- **Once SDK Manager detects the board and begins flashing, promptly remove the jumper cap** from `FC REC` and `GND` so intermediate reboots do not lock the board back into recovery mode.
- The board reconnects over USB several times during the flash. **Do not unplug the USB Type-C cable or cut DC power.**
:::

When **INSTALLATION COMPLETED SUCCESSFULLY** appears, click **FINISH**. Confirm that the jumper cap has been removed; the board will boot into the Ubuntu desktop or initial setup screen.

![SDK Manager installation completed (Details tab)](/img/wiki-ftEimage.png)

![SDK Manager installation completed (Terminal tab)](/img/wiki-6.png)

![Successfully booted into the Jetson Linux desktop](/img/wiki-7.webp)

## 2. Flash SUPER Firmware from the Command Line

::: warning Prerequisites and Orin Nano SUPER Compatibility
- Command-line flashing requires the `Linux_for_Tegra` firmware cache created by SDK Manager. Complete at least one SDK Manager download or flash (Section 1) first.
- **The C1901 supports SUPER mode (`25W` / `MAXN SUPER`) for Jetson Orin Nano (4GB / 8GB) modules only.** When using a **Jetson Orin NX (8GB / 16GB)** module on the C1901, flash the standard firmware from Section 1 (`10W / 15W / 25W`) and do **not** flash Orin NX SUPER firmware.
:::

### 2.1 Enter Recovery Mode

With power disconnected, short **`FC REC` (Pin 10)** and **`GND` (Pin 9 or Pin 11)** on the C1901 12-pin header, connect the **USB Type-C** cable to your Ubuntu host, and apply DC power (remove the jumper cap once `lsusb | grep 0955` detects the device).

### 2.2 Run the Command-Line Flash Script

::: warning Close SDK Manager First
**Close any running SDK Manager window** before executing the command-line script. Flashing takes approximately 10–20 minutes.
:::

Update the **JetPack version** in the `cd` path below (such as `JetPack_6.2.1_...` or `JetPack_7.2_...`) to match the actual directory inside `~/nvidia/nvidia_sdk/`.

- **Command for JetPack 6 / JetPack 7** (shown with `JetPack_7.2` on NVMe SSD):

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

- **Orin Nano Standard Mode**: Provides **`7W`** and **`15W`** only.
- **Orin Nano SUPER Mode**: Unlocks **`25W`** and **`MAXN SUPER`**.

![Verify 25W and MAXN SUPER in the desktop power menu](/img/wiki-9.png)

If **`25W`** and **`MAXN SUPER`** appear in the menu, SUPER firmware is active. Otherwise, confirm that the flash command used `jetson-orin-nano-devkit-super` and reflash completely.

## 3. Back Up and Restore Existing Firmware

::: tip Host Disk Space and Path Notes
Full backups store partition images on the Ubuntu host, so ensure sufficient free disk space (**`≥ 200 GB`** VM disk recommended). Adjust the JetPack version and target module directory (`JETSON_ORIN_NANO_TARGETS` or `JETSON_ORIN_NX_TARGETS`) in the `cd` path as needed.
:::

### 3.1 Back Up Firmware

1. Put the C1901 into Force Recovery mode and keep it connected to the Ubuntu host over USB Type-C:
   - **Hardware method**: Power off, short **`FC REC`** and **`GND`**, connect Type-C, and connect DC power (remove the jumper cap once detected).
   - **Software method**: While Jetson Linux is running normally and connected over Type-C, reboot into recovery mode.

**Run on the Jetson terminal:**

```bash
sudo reboot -f forced-recovery
```

::: warning Check Which Terminal You Are Using
Run `sudo reboot -f forced-recovery` **only on the Jetson board**, never on your Ubuntu host PC.
:::

2. Enter the `Linux_for_Tegra` directory on the host, install required packages, and start the backup:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get update
sudo apt-get install -y qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

### 3.2 Restore Firmware

1. Put the target C1901 board into Force Recovery mode (same as Section 3.1) and connect it to the Ubuntu host over USB Type-C.

::: warning Required Script Edit for Third-Party Carrier Boards
Before restoring a backup onto the C1901 (or any third-party carrier board), open `tools/backup_restore/nvrestore_partitions.sh` and comment out lines **292–296** (`BOARD_MATCH` verification block, shown below) so the restore does not abort on board EEPROM mismatch.
:::

![Comment out lines 292 to 296 in nvrestore_partitions.sh](/img/wiki-VXwimage.png)

2. Run the restore command to write the image onto the target NVMe SSD:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. Post-Flash Configuration (Important)

After flashing official NVIDIA firmware, complete the following setup according to your C1901 hardware revision:

- **USB 3.2 & C1901 V1.3 Device Tree**: Install the device tree (DTB) matching your JetPack version and module SKU to enable all USB 3.2 ports — see [Orin Nano / NX USB Configuration](/en/orin-nano-series/usb-config). In particular, **C1901 V1.3** requires its dedicated device tree for updated CSI and pin routing, while **C1901 V1.2** on JetPack 5 is recommended to pair with **JetPack 5.1.4** and its matching DTB. See [C1901 Introduction](/en/c1901/c1901) and [Hardware Resources](/en/resources/downloads) for details.
- **Wi-Fi Driver**: If you install an Intel AX200 / AX210 M.2 Key E Wi-Fi module on JetPack 6 or 7, install `backport-iwlwifi-dkms` per [Network Card Driver](/en/orin-nano-series/network-driver).
