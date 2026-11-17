---
title: Pinmux & Device Tree
outline: deep
---

# Pinmux & Device Tree

This guide covers Pinmux, Device Tree, and overlay workflows for Jetson Orin Nano / NX across development bring-up and production firmware. It does not replace a board-specific BSP: always confirm the module SKU, carrier-board model and hardware revision, JetPack / L4T release, and boot device before making changes.

::: danger An Incorrect Configuration Can Prevent Boot
Back up your existing DTB, DTBO, and `/boot/extlinux/extlinux.conf` files first, and keep an Ubuntu Recovery flashing host ready. Never copy a DTB from a different JetPack release, module SKU, or carrier board.
:::

## Choose the Right Method

| Goal | Recommended Method | Production-Ready? |
|---|---|---|
| Configure SPI / I2C / UART / PWM / I2S on the standard 40-pin header | [Jetson-IO](/en/orin-nano-series/expansion-header) | Primarily for development |
| Temporarily switch a pin to GPIO on JetPack 6 | PADCTL register + `libgpiod` | No; lost on reboot |
| Lock pin muxing, electrical properties, and boot-time states | Pinmux Spreadsheet → MB1 BCT DTSI | Yes |
| Describe an external peripheral on I2C / SPI or another bus | Linux DTS / DTSI or DTBO | Yes |
| Adapt USB / PCIe / UPHY high-speed lanes | Board DTS, UPHY / ODMDATA, and BSP config | Yes, with board validation |

## What Each Artifact Controls

- **Pinmux Spreadsheet**: configures pin function, direction, internal pull, tristate, initial boot state, and voltage tolerance.
- **`pinmux.dtsi` / `gpio.dtsi` / `padvoltage.dtsi`**: early-boot configuration files generated from the spreadsheet and consumed by T234 Bootloader / MB1.
- **Linux DTS / DTSI**: describes SoC controllers, buses, and attached devices, including register addresses, interrupts, clocks, resets, and `status`.
- **DTB**: compiled full binary device tree.
- **DTBO**: partial device-tree overlay applied on top of a base DTB for add-on hardware or development testing.
- **Board `.conf`**: selects the module, carrier board, BCT, DTB, partition layout, and flashing parameters.

Pinmux determines *which SoC controller is routed to a physical pad and its electrical state*, whereas the Linux device tree determines *which controllers and drivers the kernel enables*. If only one side is updated, the peripheral may still fail to operate.

## Back Up and Recover Safely

Run the following commands on the Jetson terminal to back up the active boot configuration and device-tree files before making edits:

```bash
mkdir -p "$HOME/jetson-dt-backup"
cp -a /boot/extlinux/extlinux.conf "$HOME/jetson-dt-backup/"
cp -a /boot/dtb "$HOME/jetson-dt-backup/" 2>/dev/null || true
find /boot -maxdepth 1 -name '*.dtb*' -exec cp -a {} "$HOME/jetson-dt-backup/" \;
```

Keep a known-good DTB as a separate fallback boot entry in `extlinux.conf` instead of overwriting the only bootable file. Keep a UART debug console connected during the first reboot; if all boot entries fail, enter Force Recovery mode and reflash the matching BSP.

::: warning Secure Boot Signing
Systems with Secure Boot enabled may require signed DTB / DTBO binaries. Do not deploy unsigned files on fused devices; integrate signing with your key-management and production flashing workflow.
:::

## Path 1: 40-pin Development

On carrier boards equipped with the standard 40-pin expansion header (Official DevKit, C1901, C1902, and C1902 V2), prefer running Jetson-IO on the Jetson terminal during development:

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

Jetson-IO generates updated DTB / DTBO files and writes the boot entry in `/boot/extlinux/extlinux.conf`. See [40-pin Expansion Header (Jetson-IO)](/en/orin-nano-series/expansion-header) for menu navigation, CLI usage, and C1901 / C1902 / C1902 V2 pin notes.

::: info Non-40-pin Carrier Boards
The **C1903** (which uses GH1.25 peripheral connectors) and **C2401** (which uses a 30-pin expansion header) do not feature a standard 40-pin header and cannot use the Jetson-IO 40-pin menu; use Path 3 and Path 4 below instead. Note also that Jetson-IO changes are overwritten when reflashing or replacing the full DTB, so they should not be the sole source for a production BSP.
:::

## Path 2: Temporary GPIO Changes on JetPack 6

On JetPack 6, you can temporarily inspect or modify PADCTL registers with `busybox devmem` for bring-up experiments and drive lines via `gpiod` (`libgpiod`). Always compute the exact register address from the SoC TRM PADCTL base address and pin offset — never copy an address blindly from another pin.

Run on the Jetson terminal:

```bash
sudo apt install busybox gpiod
sudo busybox devmem <32-bit-register-address>
gpioinfo
```

Changes made via `devmem` bypass kernel resource management and are reset on reboot. Use this method only for quick verification after confirming register offsets and bit fields. For 40-pin examples, see [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio).

## Path 3: Production Pinmux

### 1. Prepare Matching Sources

On your Ubuntu host, download the Jetson Orin Nano / NX Pinmux Spreadsheet matching your target JetPack / L4T release alongside the same-version `Linux_for_Tegra` BSP directory. Enable macros when opening the spreadsheet.

### 2. Configure and Review Pins

Verify each field against your hardware schematic:

- Match `Function` to the schematic net assignment.
- Match `Pin Direction` to the peripheral signal direction (I2C clock and data lines are typically `Bidirectional`).
- Choose a safe power-on initial state for output and bidirectional pins.
- Verify internal pull-up/pull-down, tristate, and drive settings against circuit requirements.
- Enable `3.3V tolerance` only on supported pads when required by external circuitry; enabling it places the pad in open-drain mode.
- Configure unused pins for safe, low-leakage states.

### 3. Generate and Place DTSI Files

Click **Generate DT File** in the spreadsheet to export three files (the filename prefix depends on the board name entered in the sheet):

```text
pinmux.dtsi
gpio.dtsi
padvoltage.dtsi
```

On the Ubuntu host under Jetson Linux r36 (JetPack 6), place them in the standard directories:

```text
Linux_for_Tegra/bootloader/generic/BCT/  <- pinmux.dtsi, padvoltage.dtsi
Linux_for_Tegra/bootloader/              <- gpio.dtsi
```

Then reference those filenames in your carrier-board `.conf` file. Directory paths and variable names can differ across major L4T releases; always verify against the matching NVIDIA Developer Guide and `.conf` file.

### 4. Flash with the BSP

Because the Pinmux BCT is consumed during early boot, generate and flash the target from the Ubuntu host using a validated board flashing configuration. Simply copying `.dtsi` files into `/boot` on the Jetson has no effect.

## Path 4: Modify the Linux Device Tree

### 1. Locate the Node

In Jetson Linux r36, T23x device-tree sources reside under `hardware/nvidia/t23x/` inside the host BSP source tree. Trace the `#include` chain starting from the top-level carrier-board DTS rather than guessing controller node names from raw addresses.

The snippet below illustrates structure only — replace `&i2cX`, `compatible`, `reg`, clocks, and interrupts with real hardware parameters:

```text
&i2cX {
    status = "okay";

    example@3c {
        compatible = "vendor,example";
        reg = <0x3c>;
        status = "okay";
    };
};
```

### 2. Build and Deploy

1. Edit sources inside a host BSP tree that matches the target L4T release; for cross-compilation steps, see [Kernel & Base Image Build](/en/hardware-bsp/kernel-and-bsp-build).
2. Compile the `.dtb` / `.dtbo` following NVIDIA's build procedure for that L4T release.
3. Never overwrite the sole bootable DTB; deploy under a distinct filename and add a test menu entry in `extlinux.conf`.
4. After rebooting, verify the active configuration via `/proc/device-tree`, kernel driver logs, and bus utilities.

## Device Tree Overlay

A DTBO is ideal for add-on expansion boards or localized node changes. Overlays intended for automatic discovery in Jetson-IO must declare header metadata such as:

```text
/dts-v1/;
/plugin/;

/ {
    overlay-name = "Example expansion board";
    jetson-header-name = "Jetson 40pin Header";
    compatible = "nvidia,p3768-0000+p3767-0000";

    fragment@0 {
        target-path = "/";
        __overlay__ {
            /* Add hardware-specific peripheral nodes here. */
        };
    };
};
```

Set `compatible` to match the actual module and carrier-board combination; the example string above does not apply to every SKU. If your hardware also requires SFIO pin multiplexing, ensure the corresponding Pinmux configuration is included.

## Validation Checklist

Run the following checks on the Jetson terminal after booting the new configuration:

```bash
# Boot & active device tree
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
sudo dmesg -T | grep -iE 'dtb|device tree|probe|failed|error'

# GPIO / I2C / SPI / UART
gpioinfo
i2cdetect -l
ls -l /dev/spidev* /dev/ttyTHS* 2>/dev/null

# USB / PCIe
lsusb -t
lspci -nnk
```

Beyond the newly enabled peripheral, regression-test cold boot, warm reboot, USB, NVMe, wired/wireless Ethernet, CSI cameras, PWM fan control, and `nvpmodel` power modes across a `board revision × module SKU × JetPack / L4T` test matrix.

## Troubleshooting

- **Copied DTB is not active**: inspect `/boot/extlinux/extlinux.conf`, the selected boot entry, and `/proc/device-tree/nvidia,dtsfilename` at runtime rather than checking file presence alone.
- **GPIO state does not change**: the pad may still be muxed as SFIO, tristated, or locked by the MB1 Pinmux BCT.
- **Peripheral driver does not probe**: verify `compatible`, `status = "okay"`, parent bus state, device address, clocks, resets, and kernel module config.
- **JetPack upgrade breaks custom nodes**: never reuse a DTB compiled for an older L4T release; port and rebuild your DTS changes on the new BSP source tree.
- **System fails to boot after applying an overlay**: select the fallback entry over UART serial console and remove the overlay, or reflash in Force Recovery mode.

For additional field diagnostics, see [FAQ & Troubleshooting](/en/faq/).

## LinkZee Board-Specific BSP Status

The generic workflow above applies to all Jetson Orin Nano / NX carrier boards. As board-level BSP packages are released for KYtech hardware, board-specific documentation and packages cover:

- Carrier-board `.conf` profiles and device-tree source paths across **C1901, C1902, C1902 V2, C1903, and C2401** hardware revisions.
- Release mapping and SHA-256 checksums for Pinmux spreadsheets, generated DTSI files, and compiled DTB / DTBO binaries.
- Carrier EEPROM configuration, Board ID / SKU handling, and UPHY / ODMDATA settings.
- Pin mapping tables linking schematic net names, SoC ball names, Linux device nodes, and external connectors.
- Validated compatibility matrices and notes across supported Jetson modules and JetPack releases.

Published drawings, pinouts, and prebuilt device-tree links are available in [Hardware Resources](/en/resources/downloads); for kernel and base image compilation workflows, see [Kernel & Base Image Build](/en/hardware-bsp/kernel-and-bsp-build).

## Official References

- [NVIDIA — Jetson Orin NX and Nano Series Bring-Up](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html)
- [NVIDIA — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA — Jetson Linux Developer Guide r36.4.4](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/)
