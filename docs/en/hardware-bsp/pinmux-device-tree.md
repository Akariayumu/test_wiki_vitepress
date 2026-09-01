---
title: Pinmux & Device Tree
---

# Pinmux & Device Tree

This guide covers Pinmux, Device Tree, and overlay workflows for Jetson Orin Nano / NX in development and production firmware. It does not replace a board-specific BSP. Confirm the module SKU, board model and revision, JetPack/L4T release, and boot device before making changes.

:::danger An incorrect configuration can prevent boot
Back up DTB, DTBO, and `/boot/extlinux/extlinux.conf`, and prepare a Recovery flashing host. Never copy a DTB from a different JetPack release, module, or carrier board.
:::

## Choose the correct method

| Goal | Recommended method | Production-ready? |
|---|---|---|
| Configure SPI/I2C/UART/PWM/I2S on the official 40-pin header | [Jetson-IO](/en/orin-nano-series/expansion-header) | Mainly development |
| Temporarily switch a JetPack 6 pin to GPIO | PADCTL register + `libgpiod` | No; lost on reboot |
| Fix mux, electrical, and boot state | Pinmux Spreadsheet → MB1 BCT DTSI | Yes |
| Describe a device on I2C/SPI or another bus | Linux DTS/DTSI or DTBO | Yes |
| Adapt USB/PCIe/UPHY high-speed lanes | Board DTS, UPHY/ODMDATA, and BSP config | Yes, with board validation |

## What each artifact controls

- **Pinmux Spreadsheet:** pin function, direction, pull, tristate, initial state, and voltage tolerance.
- **`pinmux.dtsi`, `gpio.dtsi`, `padvoltage.dtsi`:** generated boot configuration consumed by T234 Bootloader/MB1.
- **Linux DTS/DTSI:** controllers and devices, including addresses, interrupts, clocks, resets, and `status`.
- **DTB:** compiled full device tree.
- **DTBO:** a partial overlay on the base tree.
- **Board `.conf`:** selects the module, carrier, BCT, DTB, partitions, and flashing parameters.

Pinmux controls which controller reaches a pin and its electrical state; the Linux tree controls which controller and device the kernel enables. Peripherals may fail if only one side is configured.

## Back up and recover safely

```bash
mkdir -p "$HOME/jetson-dt-backup"
cp -a /boot/extlinux/extlinux.conf "$HOME/jetson-dt-backup/"
cp -a /boot/dtb "$HOME/jetson-dt-backup/" 2>/dev/null || true
find /boot -maxdepth 1 -name '*.dtb*' -exec cp -a {} "$HOME/jetson-dt-backup/" \;
```

Keep a known-good DTB as a separate `extlinux.conf` boot entry instead of overwriting the only copy. Keep UART attached for the first boot. If all entries fail, enter Recovery and reflash the matching BSP.

:::warning Secure Boot
Secure Boot systems may require signed DTB/DTBO files. Do not install unsigned files; integrate signing with the product key and production flashing process.
:::

## Path 1: 40-pin development

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

Jetson-IO creates DTB/DTBO files and updates boot configuration. See [40-pin Header Configuration](/en/orin-nano-series/expansion-header) for menus, CLI tools, and C1901/C1902 notes. Its changes may be lost after flashing or replacing the DTB and should not be the sole production BSP source.

## Path 2: Temporary GPIO changes on JetPack 6

JetPack 6 can use `busybox devmem` for PADCTL debugging and `libgpiod` for GPIO. Calculate each register address from the current SoC TRM PADCTL base and pin offset; never copy a value from another pin.

```bash
sudo apt install busybox gpiod
sudo busybox devmem <32-bit-register-address>
gpioinfo
```

This bypasses normal resource management and is lost on reboot. Use it only after validating the address and bit fields. See [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio) for 40-pin examples.

## Path 3: Production Pinmux

### Prepare matching sources

Download the Orin NX/Nano Pinmux Spreadsheet that matches the target L4T and use the same-release `Linux_for_Tegra`. Enable spreadsheet macros.

### Configure and review

- Match `Function` to the schematic signal.
- Match `Pin Direction` to the peripheral; I2C clock/data are normally bidirectional.
- Set a safe initial state for output and bidirectional signals.
- Validate pull, tristate, and drive settings against the circuit.
- Enable 3.3V tolerance only on supported pins when required; it makes the pin open-drain.
- Give unused pins a safe low-leakage configuration.

### Generate and place DTSI files

**Generate DT File** produces names based on spreadsheet input for:

```text
pinmux.dtsi
gpio.dtsi
padvoltage.dtsi
```

For Jetson Linux r36, the standard locations are:

```text
Linux_for_Tegra/bootloader/generic/BCT/  <- pinmux.dtsi, padvoltage.dtsi
Linux_for_Tegra/bootloader/              <- gpio.dtsi
```

Reference them from the carrier-board `.conf`, then generate and flash the image with the validated board configuration. Directory names and variables can change between releases; follow the matching NVIDIA guide and actual `.conf`.

## Path 4: Linux Device Tree

In Jetson Linux r36, T23x device-tree sources live under the BSP source tree's `hardware/nvidia/t23x/` hierarchy. Trace includes from the existing top-level board DTS instead of guessing controller addresses.

This is structural only; replace the label, compatible string, address, clocks, and interrupts with real hardware data:

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

Build with the NVIDIA process for the exact target L4T, deploy under a new filename with a fallback boot entry, and verify the runtime tree, driver logs, and bus device after reboot.

## Device Tree Overlay

A DTBO is suitable for expansion hardware or local changes. An overlay intended for Jetson-IO includes metadata such as:

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
            /* Add only hardware-specific nodes here. */
        };
    };
};
```

Set `compatible` for the actual module/carrier combination; the example is not universal. If the hardware also needs an SFIO mux, include or apply the matching pinmux configuration.

## Validation checklist

```bash
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
sudo dmesg -T | grep -iE 'dtb|device tree|probe|failed|error'
gpioinfo
i2cdetect -l
ls -l /dev/spidev* /dev/ttyTHS* 2>/dev/null
lsusb -t
lspci -nnk
```

Regression-test cold boot, reboot, USB, NVMe, Ethernet, CSI, fan, and power modes. Maintain a board revision × module SKU × JetPack/L4T test matrix.

## Common failures

- **Copied DTB is inactive:** check `extlinux.conf`, the selected entry, and runtime `nvidia,dtsfilename`.
- **GPIO has no effect:** the pad may still be SFIO, tristated, or fixed by MB1 Pinmux BCT.
- **Driver does not probe:** check `compatible`, `status`, parent bus, address, clock, reset, and kernel configuration.
- **Upgrade breaks the change:** do not reuse the old DTB; rebuild the change on the new BSP.
- **Overlay prevents boot:** select the preserved original entry and remove it, or recover by flashing.

See [FAQ & Troubleshooting](/en/faq/) for field diagnostics.

## LinkZee board-specific data still required

The generic workflow is usable, but a formal BSP release should add:

- Board `.conf` names and source paths for every C1901/C1902/C2401 revision.
- Version mapping and SHA-256 for spreadsheet, generated DTSI, and DTB/DTBO files.
- Carrier EEPROM presence, Board ID/SKU, and detection policy.
- Schematic net ↔ SoC pin ↔ Linux node ↔ connector mapping.
- Validation results and limitations for every supported module/JetPack combination.

Published files belong in [Hardware Resources](/en/resources/downloads).

## Official references

- [NVIDIA — Jetson Orin NX and Nano Series Bring-Up](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html)
- [NVIDIA — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA — Jetson Linux Developer Guide r36.4.4](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/)
