---
title: Flash Official Developer Kit
outline: deep
---

# Flash Official Developer Kit

::: tip Host Environment Setup
We recommend flashing from a native x86_64 Ubuntu PC or a VMware Ubuntu virtual machine. For VMware and SDK Manager setup instructions, see [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager). If your kit already has JetPack 6.x (`≥ 36.0`) UEFI firmware and you want to install JetPack 7, you can also use a USB drive directly via [Flash JetPack 7 (Orin Nano / NX)](/en/flashing-guide/jetpack7-flashing).
:::

## 1. Flash with NVIDIA SDK Manager

### 1.1 Configure the VMware USB Mode

In VMware Workstation, open **Edit → Preferences → USB** and set the new USB device rule to **"Connect the device to the foreground virtual machine"**. Click **OK**, start the Ubuntu VM, and launch SDK Manager. This prevents the flash from failing when the board reboots and re-enumerates over USB midway through flashing.

![Open VMware Preferences](/img/wiki-4.png)

![Set USB connection mode to the foreground virtual machine](/img/wiki-5.png)

### 1.2 Enter Recovery Mode

1. Disconnect power from the Developer Kit. Locate the **12-pin Button Header** positioned directly **underneath the Jetson module** on the carrier board (the pin silkscreen is printed on the underside of the board), and use a jumper cap or female-to-female jumper wire to short **`FC REC` (Pin 10)** and **`GND` (Pin 9 or Pin 11)**.
2. Connect the board's **USB Type-C** port to your host computer with a data-capable USB cable.
3. Connect the 19V DC power supply to the Developer Kit.

When Force Recovery mode is active, the heatsink fan stays off and SDK Manager automatically detects the connected module and prompts you to select the target hardware type.

::: warning Recovery Mode Timeout
If no flashing communication occurs for an extended period after entering Force Recovery mode, certain firmware versions automatically time out and reboot into the normal OS. Proceed promptly once SDK Manager detects the device.
:::

![Underside silkscreen of the Official Developer Kit 12-pin Button Header](/img/wiki-0q7a9030.webp)

*Underside silkscreen of the 12-pin Button Header under the module (`FC REC` and `GND`)*

![12-pin Button Header pinout diagram](/img/c1901-12pin.png)

*12-pin Button Header pinout (short Pin 10 `Force Recovery` and Pin 9 or Pin 11 `GND`)*

In the SDK Manager detection dialog, select the **`developer kit version`** entry, click **OK**, and click **CONTINUE**:

![SDK Manager detects the module in recovery mode](/img/wiki-14.png)

### 1.3 Configure the SDK Components

- In **STEP 01**, uncheck **Host Machine** and click **CONTINUE**:

![Uncheck Host Machine in Step 01](/img/flash-jp721-cancel-host-machine.png)

- In **STEP 02**, select only **Jetson Linux** (optional SDK packages such as CUDA and TensorRT can be installed over `apt` after booting, making the initial flash much faster and more reliable), accept the license terms, and click **CONTINUE**:

![Select only Jetson Linux in Step 02](/img/flash-jp721-jetson-linux-only.png)

### 1.4 Wait for the Download to Complete

Wait for SDK Manager to download and extract the OS packages. A flash configuration dialog opens automatically once the download finishes.

![Wait for JetPack OS download to complete](/img/flash-jp721-wait-download.png)

### 1.5 Configure the Flash Parameters

Set the flash options in the dialog:

- **OEM Configuration**:
  - **Pre-Config**: Pre-create the Ubuntu username and password so the board boots straight to the desktop.
  - **Runtime**: Complete user account setup interactively on first boot with a monitor and keyboard.
- **Storage Device**: Select the target boot medium. The Orin Nano Developer Kit module supports **`NVMe` (recommended)**, **`SDCard` (microSD card)**, or **`USB`**; if you installed an Orin NX or production Orin Nano module (which has no microSD slot), select **`NVMe`** or **`USB`**.

![Configure OEM account mode and target storage device](/img/wiki-XjOimage.png)

If prompted again to confirm the hardware variant, select **`developer kit version`**:

![Confirm Developer Kit Version](/img/wiki-JBF12.png)

Click **Flash** and wait about 10–20 minutes for the installation to finish.

::: warning Remove the Jumper Cap Promptly and Keep Power Connected
- **Once SDK Manager detects the board and starts flashing, promptly remove the jumper cap** from `FC REC` and `GND` so the board does not re-enter recovery mode when rebooting during the flash process.
- The board disconnects and reconnects over USB multiple times while flashing — this is expected. **Do not unplug the USB Type-C cable or disconnect DC power.**
:::

When **INSTALLATION COMPLETED SUCCESSFULLY** appears, click **FINISH**. Confirm that the jumper cap has been removed; the board will boot into the Ubuntu desktop or initial setup wizard.

![SDK Manager installation completed (Details tab)](/img/wiki-ftEimage.png)

![SDK Manager installation completed (Terminal tab)](/img/wiki-6.png)

![Successfully booted into the Jetson Linux desktop](/img/wiki-7.webp)

## 2. Flash SUPER Firmware from the Command Line

::: warning Prerequisites and Carrier Power Compatibility
- Command-line flashing requires the `Linux_for_Tegra` directory created by SDK Manager. Complete at least one SDK Manager download or flash (Section 1) first to populate the local firmware cache.
- **The Official Developer Kit carrier board supports SUPER mode (`25W` / `MAXN SUPER`) for Jetson Orin Nano modules only.** It does **not** support `40W` SUPER mode on **Jetson Orin NX** modules due to carrier power limits — use the standard firmware from Section 1 for Orin NX.
:::

### 2.1 Enter Recovery Mode

With power disconnected, short **`FC REC` (Pin 10)** and **`GND` (Pin 9 or Pin 11)** on the 12-pin Button Header under the module, connect the **USB Type-C** data cable to your Ubuntu host, and connect DC power (you may remove the jumper cap once `lsusb | grep 0955` shows the NVIDIA recovery device).

### 2.2 Run the Command-Line Flash Script

::: warning Close SDK Manager First
**Close any running SDK Manager window** before running the command-line flash script so it does not contend for the USB recovery device. Flashing takes approximately 10–20 minutes.
:::

Adjust the **JetPack version** in the `cd` path below (for example `JetPack_6.2.1_...` or `JetPack_7.2_...`) to match your local cache under `~/nvidia/nvidia_sdk/`.

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

After booting and completing initial user setup, click the power icon in the top-right corner of the Ubuntu desktop to inspect **Power Mode**:

- **Orin Nano Standard Mode**: Offers only **`7W`** and **`15W`**.
- **Orin Nano SUPER Mode**: Unlocks **`25W`** and **`MAXN SUPER`**.

![Verify 25W and MAXN SUPER in the desktop power menu](/img/wiki-9.png)

If **`25W`** and **`MAXN SUPER`** appear in the list, SUPER firmware is active. If only **`7W`** and **`15W`** appear, verify that your flash command used the `jetson-orin-nano-devkit-super` target and run a complete reflash.

## 3. Back Up and Restore Existing Firmware

::: tip Host Disk Space Requirement
Full-disk backups save partition images under `Linux_for_Tegra/tools/backup_restore/images`. Ensure your Ubuntu host has ample free disk space (**`≥ 200 GB`** total VM disk capacity recommended). Adjust the JetPack version and `JETSON_ORIN_NANO_TARGETS` / `JETSON_ORIN_NX_TARGETS` folder name in the `cd` path to match your local environment.
:::

### 3.1 Back Up Firmware

1. Put the Jetson board into Force Recovery mode while connected to the Ubuntu host over USB Type-C:
   - **Hardware method**: Power off, short **`FC REC`** and **`GND`**, connect Type-C, and apply power (remove the jumper cap once detected).
   - **Software method**: If Jetson Linux is currently running and connected over Type-C, reboot directly into recovery mode.

**Run on the Jetson terminal:**

```bash
sudo reboot -f forced-recovery
```

::: warning Check Which Terminal You Are Using
Run `sudo reboot -f forced-recovery` **only on the Jetson board**, never on your Ubuntu host PC, or your host system will reboot.
:::

2. Navigate to the `Linux_for_Tegra` directory on your Ubuntu host, install the backup dependencies, and run the backup script:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get update
sudo apt-get install -y qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

### 3.2 Restore Firmware

1. Put the target Jetson board into Force Recovery mode (same as Section 3.1) and connect it to the Ubuntu host via USB Type-C.

::: warning Restoring onto Third-Party Carrier Boards
If you restore a backup image onto a third-party carrier board (or across boards with different EEPROM IDs), open `tools/backup_restore/nvrestore_partitions.sh` and comment out lines **292–296** (`BOARD_MATCH` check, as shown below) before running the restore command.
:::

![Comment out lines 292 to 296 in nvrestore_partitions.sh](/img/wiki-VXwimage.png)

2. Run the restore script to write the backup image to the target NVMe SSD:

**Run on the Ubuntu host terminal:**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```
