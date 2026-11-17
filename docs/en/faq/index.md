---
title: FAQ & Troubleshooting
outline: deep
---

# FAQ & Troubleshooting

This page collects common questions and diagnostic workflows for Jetson Orin Nano / NX modules and KYtech **C1901, C1902, C1902 V2, C1903, and C2401** carrier boards and kits. Before running commands that modify system or boot configurations, confirm your carrier-board model and PCB revision, module SKU, JetPack release, and boot storage device.

## Collect System Information First

When requesting technical support, run the following commands on the Jetson terminal and attach the output along with clear photos of your hardware setup (you may redact serial numbers, usernames, or private IP addresses beforehand):

```bash
cat /etc/nv_tegra_release
uname -a
cat /proc/device-tree/model
cat /proc/device-tree/compatible | tr '\0' '\n'
cat /proc/cmdline
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
lsusb
lsusb -t
ip -br link
sudo dmesg -T | tail -n 200
```

## Flashing and Boot

### SDK Manager Cannot Detect the Jetson

Run the following command on your Ubuntu host terminal to check USB enumeration:

```bash
lsusb | grep 0955
```

If nothing is returned, the Ubuntu host has not detected an NVIDIA Force Recovery device. Verify each item in order:

1. Confirm that the USB Type-C cable supports **data transfer** (not a charge-only cable) and is plugged into the board's flashing Type-C port.
2. Enter Force Recovery mode using the procedure for your specific carrier board:
   - **Official DevKit, C1901, and C1902 (V1.x)**: with power disconnected, place a jumper across `FC REC` and `GND` on the 12-pin header, then apply power (remove the jumper once `0955` appears on the host).
   - **C1902 V2, C1903, and C2401**: with power disconnected, connect the Type-C cable, hold down the onboard `REC` button, and apply power. On the **C1903 and C2401**, you can alternatively set DIP switch `3` to `ON` before powering on (**important: return DIP switch `3` to `OFF` once detected and before the board reboots into `initrd` during flashing**).
3. Plug the cable directly into a motherboard USB port on the host PC, bypassing external USB hubs or adapters.
4. If flashing from a virtual machine (such as VMware), pass the `NVIDIA Corp. APX` USB device through to the Ubuntu guest and set it to auto-connect.

If `0955` appears in `lsusb` but SDK Manager still does not detect the board, restart SDK Manager and verify that the selected JetPack release supports your module SKU. See [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) for details.

### Flashing Disconnects or Stalls Midway

The Jetson USB interface re-enumerates multiple times during RCM boot and `initrd` flashing:

- **Virtual machine hosts**: configure VMware or VirtualBox so re-enumerated NVIDIA USB devices automatically reconnect to the Ubuntu guest; otherwise the flash script will time out waiting for the target.
- **Native Ubuntu hosts**: prefer rear motherboard USB ports and a short, well-shielded Type-C data cable.
- Verify that the host has sufficient free disk space (`≥ 120 GB` recommended), stable network access, and no power interruption during writes. On the C1903 / C2401, ensure DIP switch `3` has been returned to `OFF`.

### Flash Succeeds but the Board Does Not Boot or Show Video

1. Disconnect optional USB peripherals, camera ribbons, and expansion modules, keeping only the power supply, boot drive, and display (note that converting DP on the C1902 / C1902 V2 to an HDMI monitor requires an **active DP-to-HDMI adapter**).
2. Verify that power supply voltage, wattage, and polarity match the specifications on your board's product page.
3. Connect a serial console (`UART` pins on the 12-pin header, or the dedicated GH1.25 `UART DEBUG` port on the C1903 / C2401, `115200 8N1`) to capture the complete boot log.
4. If the issue started after replacing a DTB, select the preserved fallback entry from the serial boot menu or reflash the matching board BSP.

### SUPER / MAXN Power Modes Are Missing

Run the following commands on the Jetson terminal to inspect the installed L4T release and active power profiles:

```bash
cat /etc/nv_tegra_release
sudo nvpmodel -q --verbose
```

SUPER mode availability depends on the JetPack / L4T release, module SKU, carrier-board power delivery, and the flashing `.conf` profile used — it cannot be enabled from the desktop power menu alone. Flash the board with the SUPER configuration documented in its flashing guide (such as [Flash C1902 / C1902 V2](/en/flashing-guide/c1902-flashing) or [Flash C1903](/en/flashing-guide/c1903-flashing)) and confirm Orin NX SUPER support in [Product Comparison](/en/products/compare).

Example output from an Orin Nano Super running JetPack 7.2.1 in `25W` mode:

![Checking nvpmodel, CPU, GPU, EMC, and fan state](/img/power-01-nvpmodel-and-clocks.webp)

### JetPack 7 ISO Installer Has No Install Option

Onboard QSPI boot firmware (UEFI) must meet the minimum version required by the JetPack 7 ISO installer. Modules with older factory firmware must first be updated via JetPack 6.x from an Ubuntu flashing host; see [Flash JetPack 7 Troubleshooting](/en/flashing-guide/jetpack7-flashing#troubleshooting).

## Storage, USB, and Device Tree

### NVMe SSD Is Not Detected

Run the following commands on the Jetson terminal to check block devices and PCIe link logs:

```bash
lsblk
sudo lspci -nn
sudo dmesg -T | grep -iE 'nvme|pcie'
```

If no NVMe controller appears in `lspci`, power off completely, reseat the SSD, and check M.2 slot form-factor support (2280 vs. 2230) and **single-sided SSD clearance requirements** (double-sided SSDs can mechanically interfere on several carrier boards). If the controller enumerates but logs PCIe link or timeout errors, save the `dmesg` output and cross-test with a known-good single-sided NVMe SSD and an adequately rated power supply.

The following example verifies the NVMe drive model, partition layout, and root filesystem mount point:

![Verifying the NVMe drive and root filesystem](/img/storage-01-nvme-and-rootfs.webp)

### USB Device Runs Only at USB 2.0 Speed

Run the following commands on the Jetson terminal to inspect negotiated USB link speeds:

```bash
lsusb -t
sudo dmesg -T | grep -iE 'usb|xhci'
```

`480M` indicates USB 2.0, while `5000M` / `10000M` indicates USB 3.2 SuperSpeed. After ruling out cables, external hubs, and the peripheral itself, note that the **C1901, C1902, C1902 V2**, **C1903** (port #6 direct 10Gbps USB 3.2 Type-A), and **C2401** (USB 3.0 routed to the 30-pin expansion header) require their matching carrier-board device tree to enable SuperSpeed lanes. See [USB Configuration](/en/orin-nano-series/usb-config).

### How Do I Identify the Active Device Tree?

Run on the Jetson terminal:

```bash
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
grep -nE '^[[:space:]]*(FDT|OVERLAYS)' /boot/extlinux/extlinux.conf
find /boot -maxdepth 2 \( -name '*.dtb' -o -name '*.dtbo' \) -print
```

The presence of a `.dtb` file under `/boot` does not guarantee that the kernel loaded it — always check both `/boot/extlinux/extlinux.conf` and `/proc/device-tree/nvidia,dtsfilename` at runtime. See [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree) for the full workflow.

### System Fails to Boot After Replacing a DTB

Do not overwrite additional boot files. Connect a UART serial console, select your preserved known-good boot entry in the bootloader menu, and restore the original configuration. If no fallback entry is available, enter Force Recovery mode and reflash the matching BSP. Always back up your DTB and `extlinux.conf` before editing.

### Can an Old DTB Be Reused After a JetPack Upgrade?

No — reusing a DTB across major L4T releases is not recommended. Device-tree binaries are tightly coupled to the L4T kernel/BSP version, module SKU, and carrier-board revision. After upgrading JetPack, rebuild your changes against the matching BSP source tree or install the board files released for that specific JetPack version.

## Network and Remote Access

### SSH Cannot Connect

Run the following commands from a local Jetson session (display or UART console):

```bash
ip -br address
systemctl status ssh --no-pager
ss -lntp | grep ':22'
```

Confirm IP reachability between the host PC and Jetson, the login username, and that the `ssh` service is active and listening on port `22`. The USB Type-C virtual Ethernet interface typically uses `192.168.55.1`, which requires USB Device mode to be supported and active on that port. See [Connect to the Jetson System](/en/orin-nano-series/connect-jetson).

### Wired or Wireless Network Adapter Is Missing

Run on the Jetson terminal:

```bash
lspci -nnk
ip -br link
sudo dmesg -T | grep -iE 'ethernet|r8125|iwlwifi|firmware'
```

Identify the chipset by its PCI ID in `lspci -nnk` (for example, the 2.5GbE port on the C2401 uses a Realtek `RTL8125` controller, while M.2 wireless cards commonly use Intel or Realtek chipsets) rather than relying solely on retail product names, then install the matching driver or firmware. See [Network Card Driver](/en/orin-nano-series/network-driver).

## GPIO, UART, CAN, and Camera

### `/sys/class/gpio` Is Unavailable on JetPack 6 / 7

JetPack 6 and later replace the deprecated `sysfs` GPIO interface with the character-device interface and `libgpiod` (`gpiod` utilities). After confirming the pin's Pinmux state, run on the Jetson terminal:

```bash
sudo apt install gpiod
gpioinfo
```

See [GPIO Control](/en/orin-nano-series/gpio) and [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio) for usage examples, and [40-pin Expansion Header (Jetson-IO)](/en/orin-nano-series/expansion-header) to switch pins between GPIO and SFIO.

### SPI, PWM, or UART Nodes Are Missing

The corresponding pads may still be configured as `unused` or GPIO rather than their SFIO peripheral function:

- **40-pin carrier boards (Official DevKit, C1901, C1902, and C1902 V2)**: use [Jetson-IO](/en/orin-nano-series/expansion-header) during development, or generate production settings from the Pinmux spreadsheet and flash them with the BSP.
- **Non-40-pin carrier boards (C1903 and C2401)**: the C1903 uses GH1.25 peripheral connectors and the C2401 uses a 30-pin expansion header plus GH1.25 connectors (and `UART1` on the C2401 requires its dedicated device tree). Neither uses the standard 40-pin header layout — check the board's product page and [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree).

### CAN Fails to Communicate or Enters BUS-OFF

Run the following command on the Jetson terminal to inspect `can0` state and error counters:

```bash
ip -details -statistics link show can0
```

Verify matching bitrates, sample points, `CAN_H / CAN_L` polarity, common ground reference, and `120Ω` bus termination at both ends:

- **C1901, C1902, and C1902 V2**: expose 3.3V logic-level `CAN_TX / CAN_RX` signals only and **require an external CAN transceiver** before connecting to a differential CAN bus.
- **C1903 and C2401**: include an **onboard CAN transceiver** outputting differential `CAN_H / CAN_L` on the GH1.25-2P connector, and allow switching in an onboard `120Ω` termination resistor by setting **DIP switch 1** to `ON`.

For setup and `BUS-OFF` recovery commands, see [Other Peripherals — CAN Bus](/en/orin-nano-series/peripherals#_4-can-bus).

### CSI Camera Produces No Image

**Power off the board completely** before reseating the CSI FPC ribbon cable (never hot-plug CSI cables), verify contact orientation and that the sensor overlay is enabled in `jetson-io.py` (note that the C2401 provides 1 CSI port while the other boards provide 2 CSI ports), then run on the Jetson terminal:

```bash
v4l2-ctl --list-devices
sudo dmesg -T | grep -iE 'camera|tegra-capture|vi5|csi'
```

If no `/dev/video*` node exists, the root cause is typically ribbon seating, sensor power, I2C probe, or device-tree/driver configuration rather than the viewer application. See [Camera](/en/orin-nano-series/camera).

## AI Software

### `nvcc` or Other CUDA Commands Are Not Found

Run the following commands on the Jetson terminal to check installed packages:

```bash
cat /etc/nv_tegra_release
dpkg -l | grep -E 'cuda|nvidia-jetpack'
```

If `nvidia-jetpack` is installed but `nvcc` is not found, add `/usr/local/cuda/bin` to your `PATH`. Remember that CUDA releases on Jetson are tied to specific JetPack / L4T versions — never install generic x86 Ubuntu GPU drivers or CUDA packages. See [Install CUDA](/en/orin-nano-series/cuda).

### TensorRT Engine Fails After Changing Hardware or Upgrading

Serialized TensorRT `.engine` files are bound to the exact TensorRT version, GPU SM architecture (for example, Orin Nano vs. Orin NX), and builder flags used when compiling them. Rebuild the engine from your `.onnx` model on the target device whenever you switch modules or upgrade JetPack; see [TensorRT Troubleshooting](/en/orin-nano-series/tensorrt#_5-troubleshooting).

## Requesting Technical Support

To help our engineering team diagnose issues quickly, please include:

1. **Hardware details**: carrier-board model and silkscreen revision (e.g., `C1902 V2.0`, `C1903 V1.0`), Jetson module SKU, boot storage device, and power supply voltage/wattage rating.
2. **Software environment**: JetPack / L4T release, flashing method, and whether any custom DTB / DTBO files are active (with filenames).
3. **Diagnostic data**: step-by-step reproduction instructions, photos of wiring, the full output from [Collect System Information First](#collect-system-information-first), and `dmesg` or UART serial boot logs.
