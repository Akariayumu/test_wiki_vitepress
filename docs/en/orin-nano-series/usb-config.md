---
title: Orin Nano/NX USB Configuration
---

# Orin Nano/NX USB Configuration

After installing an official NVIDIA system on Jetson Orin Nano/NX, install the device tree matching the JetPack version and module model to enable the three USB 3.2 ports and Type-C port on C1901, C1902, C1903, and C2401 carrier boards.

The DTB files and version information in this guide come from [Akariayumu/board_dts](https://github.com/Akariayumu/board_dts/tree/master/orin-nano-nx-usb-config).

:::danger Read Before Proceeding
- DTB files are strictly tied to the JetPack version and module model. Never mix versions or models.
- An incorrect DTB or boot configuration may prevent the system from booting. Back up important data and the original configuration, and prepare a recovery-mode flashing environment first.
- Only combinations marked as verified in `board_dts` are listed below. “—” means the repository has no matching file; do not substitute a file from another version.
:::

## 1. Identify the Module and System Version

Run on the Jetson:

```bash
cat /proc/device-tree/model; echo
head -1 /etc/nv_tegra_release
```

Use the following version-to-file mapping:

| JetPack | L4T | Orin Nano 4GB | Orin Nano 8GB | Orin NX 8GB | Orin NX 16GB |
| --- | --- | --- | --- | --- | --- |
| 5.1.4 | R35.6.0 | `kernel_tegra234-p3767-0004-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0003-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0001-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0000-p3768-0000-a0.dtb` |
| 5.1.5 (super) | R35.6.1 | `kernel_tegra234-p3767-0004-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0003-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0001-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0000-super-p3768-0000-a0.dtb` |
| 6.2 | R36.4.3 | `orin_nano_4g.dtb` | `orin_nano_8g.dtb` | `orin_nx_8g.dtb` | `orin_nx_16g.dtb` |
| 7.2 | R39.x | — | `orin_nano_8gb.dtb` | — | — |

:::tip
If the matching official system is not installed yet, first see [Flash with SDK Manager on an Ubuntu Host](/en/flashing-guide/ubuntu-sdkmanager).
:::

## 2. Download the Device Tree Repository

After the device boots normally and has network access, run in the Jetson terminal:

```bash
git clone https://github.com/Akariayumu/board_dts.git
cd board_dts/orin-nano-nx-usb-config
```

The remaining commands assume the current directory is `orin-nano-nx-usb-config`.

## 3. JetPack 5.1.4

JetPack 5.x automatically loads the matching filename from `/boot/dtb/` based on the module SKU, so the original DTB must be replaced. Enter the appropriate directory:

```bash
cd jetpack-5.1.4
```

Select the module and set exactly one filename:

```bash
# Orin Nano 4GB
dtb=kernel_tegra234-p3767-0004-p3768-0000-a0.dtb

# Orin Nano 8GB
# dtb=kernel_tegra234-p3767-0003-p3768-0000-a0.dtb

# Orin NX 8GB
# dtb=kernel_tegra234-p3767-0001-p3768-0000-a0.dtb

# Orin NX 16GB
# dtb=kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
```

Confirm the files exist, back up the original DTB, install the replacement, and reboot:

```bash
test -f "$dtb" || { echo "Cannot find $dtb"; exit 1; }
test -f "/boot/dtb/$dtb" || { echo "Cannot find /boot/dtb/$dtb on the system"; exit 1; }
sudo cp -a "/boot/dtb/$dtb" "/boot/dtb/$dtb.backup-$(date +%Y%m%d-%H%M%S)"
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo reboot
```

## 4. JetPack 5.1.5 (super)

Enter the JetPack 5.1.5 (super) directory:

```bash
cd jetpack-5.1.5-super
```

Select the module and set exactly one filename:

```bash
# Orin Nano 4GB
dtb=kernel_tegra234-p3767-0004-super-p3768-0000-a0.dtb

# Orin Nano 8GB
# dtb=kernel_tegra234-p3767-0003-super-p3768-0000-a0.dtb

# Orin NX 8GB
# dtb=kernel_tegra234-p3767-0001-super-p3768-0000-a0.dtb

# Orin NX 16GB
# dtb=kernel_tegra234-p3767-0000-super-p3768-0000-a0.dtb
```

Back up, install, and reboot:

```bash
test -f "$dtb" || { echo "Cannot find $dtb"; exit 1; }
test -f "/boot/dtb/$dtb" || { echo "Cannot find /boot/dtb/$dtb on the system"; exit 1; }
sudo cp -a "/boot/dtb/$dtb" "/boot/dtb/$dtb.backup-$(date +%Y%m%d-%H%M%S)"
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo reboot
```

## 5. JetPack 6.2

JetPack 6.2 requires installing the new DTB under `/boot/dtb/` and specifying it with `FDT` in the `LABEL primary` boot entry in `/boot/extlinux/extlinux.conf`.

Enter the appropriate directory:

```bash
cd jetpack-6.2
```

Select the module and set exactly one filename:

```bash
# Orin Nano 4GB
dtb=orin_nano_4g.dtb

# Orin Nano 8GB
# dtb=orin_nano_8g.dtb

# Orin NX 8GB
# dtb=orin_nx_8g.dtb

# Orin NX 16GB
# dtb=orin_nx_16g.dtb
```

Install the DTB and back up the boot configuration:

```bash
test -f "$dtb" || { echo "Cannot find $dtb"; exit 1; }
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo cp -a /boot/extlinux/extlinux.conf \
  "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"
sudo nano /boot/extlinux/extlinux.conf
```

Add an `FDT` line to the `LABEL primary` section. Do not modify or copy the `APPEND` contents from another device:

```text
LABEL primary
      MENU LABEL primary kernel
      LINUX /boot/Image
      INITRD /boot/initrd
      APPEND ...keep the device's existing contents...
      FDT /boot/dtb/orin_nano_4g.dtb
```

Replace the example filename with the selected `$dtb`. Save, verify the configuration, and reboot:

```bash
grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf
sudo reboot
```

## 6. JetPack 7.2

`board_dts` currently provides and verifies only **Orin Nano 8GB**, using `orin_nano_8gb.dtb`. Wait for the repository to provide files for other modules; do not use a JetPack 6.2 DTB.

```bash
cd jetpack-7.2
dtb=orin_nano_8gb.dtb
test -f "$dtb" || { echo "Cannot find $dtb"; exit 1; }
sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
sudo cp -a /boot/extlinux/extlinux.conf \
  "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"
sudo nano /boot/extlinux/extlinux.conf
```

Add the following line to the `LABEL primary` section:

```text
      FDT /boot/dtb/orin_nano_8gb.dtb
```

Save, verify, and reboot:

```bash
grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf
sudo reboot
```

## 7. Verify USB 3.2

After rebooting, connect a USB 3.x device and inspect the USB topology:

```bash
lsusb -t
```

`5000M` or `10000M` indicates a SuperSpeed link; `480M` is still USB 2.0.

![Verify a USB SuperSpeed link with lsusb](/img/usb-01-superspeed-verification.webp)

If the device is still not detected, inspect the USB controller logs:

```bash
sudo dmesg | grep -i -e xusb -e tegra-xudc
```

## 8. Configure Type-C Device Mode

Check the current role:

```bash
cat /sys/class/usb_role/usb2-0-role-switch/role
```

Temporarily switch to Device mode (reset after reboot):

```bash
sudo bash -c 'echo device > /sys/class/usb_role/usb2-0-role-switch/role'
```

When connected to a PC, the port can provide a serial terminal, a virtual network interface at the default address `192.168.55.1`, and NCM networking on Linux/macOS hosts.

To switch automatically at boot, modify NVIDIA's startup script as done by the upstream repository:

```bash
sudo cp -a /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh \
  /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh.backup
sudo sed -i 's#exit 0#echo device > /sys/class/usb_role/usb2-0-role-switch/role\nexit 0#g' \
  /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh
```

## 9. Recovery

- JetPack 5.x: Restore the same-named DTB backup under `/boot/dtb/`. If the system does not boot, enter recovery mode and reflash.
- JetPack 6.2/7.2: Boot through a fallback entry or serial console, remove the added `FDT` line from `extlinux.conf`, and restore the timestamped backup if necessary.
- USB 3.2 works but Type-C does not respond: Confirm the role file exists and run the Device-mode switching command again.
