---
title: JetPack 6 GPIO Configuration (Orin Nano / NX)
outline: deep
---

# JetPack 6 GPIO Configuration (Orin Nano / NX)

::: info Applicable Scope
Starting in JetPack 6.x (L4T R36.x, Ubuntu 22.04), NVIDIA removed the legacy `/sys/class/gpio` (sysfs) interface in favor of the standard Linux **`libgpiod`** character-device framework (if you are still on JetPack 5.x, see [JetPack 5 GPIO Configuration](/en/gpio-tutorial/jetpack5-gpio)).

This guide demonstrates how to temporarily switch PADCTL pinmux registers at runtime with `busybox devmem` and drive or read GPIO pins using the `gpiod` CLI tools during development.
:::

::: warning Non-Persistent Changes & Hardware Safety
- **Reset on Reboot (Non-Persistent)**: Modifying physical PADCTL registers with `busybox devmem` **takes effect only for the current boot session and resets to device-tree defaults after a reboot**. For persistent configuration, use [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header) during development, or generate and flash a Pinmux BCT per [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree) for production firmware.
- **Double-Check Physical Addresses**: Always verify the Jetson module (Orin Nano / NX, T234) and the exact 8-digit hexadecimal physical register address before running `devmem`. Writing to an incorrect physical address can disrupt peripherals or freeze the system.
- **3.3V Logic Level & Carrier Board Compatibility**: All GPIO pins use **3.3V logic levels** — never apply 5V signals or short output pins. The 40-pin physical pin numbers below apply to the official Developer Kit, **C1901**, **C1902**, and **C1902 V2** (note: Pins 12 / 35 / 38 / 40 are unavailable on C1901 V1.0–V1.2 and C1902 V1.0; for **C1903** and **C2401**, refer to [C1903 GH1.25 Peripheral Connectors](/en/c1903/c1903#gh1-25-peripheral-connectors) and [C2401 Introduction](/en/c2401/c2401)).
:::

## 1. Look Up GPIO Pins and PADCTL Register Addresses

### 1.1 40-pin Expansion Header Pinout

![Jetson Orin Nano / NX 40-pin expansion header pinout](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin expansion header pinout*

### 1.2 PADCTL Base Addresses and Pin Register Table

Base addresses of the relevant Tegra234 (Orin Nano / NX) PADCTL controller blocks:

| PADCTL Controller Block | Base Address |
|---|---|
| `PADCTL_A0 (PADCTL_G3)` | `0x02430000` |
| `PADCTL_A4 (PADCTL_G4)` | `0x02434000` |
| `PADCTL_A16 (PADCTL_EDP)` | `0x02440000` |
| `PADCTL_A24 (PADCTL_G7)` | `0x02448000` |

PADCTL register offsets and full 32-bit physical addresses for common GPIO pins on the 40-pin header:

| Physical Pin | Pinout Name | PADCTL Register Name | Offset | Legacy GPIO ID | GPIO Name | Physical Register Address |
|---|---|---|---|---|---|---|
| 7 | `GPIO09` | `PADCTL_G7_SOC_GPIO59_0` | `0x30` | `gpio-492` | `PAC.06` | `0x02448030` |
| 15 | `GPIO12` | `PADCTL_EDP_SOC_GPIO39_0` | `0x20` | `gpio-433` | `PN.01` | `0x02440020` |
| 29 | `GPIO01` | `PADCTL_G3_SOC_GPIO32_0` | `0x68` | `gpio-453` | `PQ.05` | `0x02430068` |
| 31 | `GPIO11` | `PADCTL_G3_SOC_GPIO33_0` | `0x70` | `gpio-454` | `PQ.06` | `0x02430070` |
| 32 | `GPIO07` | `PADCTL_G4_SOC_GPIO19_0` | `0x80` | `gpio-389` | `PG.06` | `0x02434080` |
| 33 | `GPIO13` | `PADCTL_G4_SOC_GPIO21_0` | `0x40` | `gpio-391` | `PH.00` | `0x02434040` |

::: info PADCTL Register Bit-Field Quick Reference
- **`Bit 10 (GPIO_SF_SEL)`**: `0` = GPIO mode, `1` = SFIO peripheral mode.
- **`Bit 6 (E_INPUT)`**: `1` (`0x40`) = input receiver enabled, `0` = input receiver disabled.
- **`Bit 4 (TRISTATE)`**: `1` (`0x10`) = tristate / high-Z (output driver disabled, used for input), `0` = push-pull output driver enabled.
- **`Bit [3:2] (PUPD)`**: `00` (`0x00`) = no pull, `01` (`0x04`) = internal pull-down, `10` (`0x08`) = internal pull-up.
:::

### 1.3 Official Technical Reference

For complete PADCTL register calculation details across all pins, see the NVIDIA Developer Guide: [Jetson Orin NX and Nano Series — Changing the Pinmux](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html#changing-the-pinmux).

## 2. Control GPIO from the Command Line

The steps below use **Physical Pin 31** (register address `0x02430070`, GPIO line name `PQ.06`) as an example. **Run all commands in the Jetson terminal.**

### 2.1 Install busybox and gpiod

Install `busybox` (provides `devmem`) and `gpiod` (provides the `gpioinfo`, `gpiofind`, `gpioget`, and `gpioset` CLI utilities — do not install `libgpiod2` alone, as the shared library package does not include CLI tools):

```bash
sudo apt update
sudo apt install -y busybox gpiod
```

### 2.2 Confirm Register Address and GPIO Name

For Pin 31, the table in Section 1.2 gives physical register address `0x02430070` and line name `PQ.06`. You can verify the chip and line offset recognized by the kernel with:

```bash
gpioinfo | grep "PQ.06"
```

### 2.3 Configure Input Mode and Read Level

Write `0x58` (`0x40 | 0x10 | 0x08`: GPIO mode + input receiver enabled + tristate high-Z + internal pull-up) to `0x02430070` to configure the pin as an input:

```bash
sudo busybox devmem 0x02430070 w 0x58
```

Read the current GPIO state (`1` = logic high at 3.3V, `0` = logic low at 0V; prepend `sudo` if permission is denied):

```bash
gpioget $(gpiofind "PQ.06")
```

### 2.4 Configure Output Mode and Drive Level

Write `0x00` (GPIO mode + push-pull output driver enabled + input receiver disabled + no pull; write `0x04` if an internal pull-down is desired) to `0x02430070` to configure the pin as an output:

```bash
sudo busybox devmem 0x02430070 w 0x00
```

Drive the output level with `gpioset` (`1` = logic high at 3.3V, `0` = logic low at 0V; prepend `sudo` if permission is denied):

```bash
# Drive logic high (3.3V) and hold
gpioset --mode=wait $(gpiofind "PQ.06")=1

# Drive logic low (0V) and hold
gpioset --mode=wait $(gpiofind "PQ.06")=0
```

::: tip Why `gpioset --mode=wait` Blocks in the Foreground
With `libgpiod`, once the calling process exits and closes the character device file descriptor, the kernel releases the GPIO line and its output level is no longer actively held. Passing `--mode=wait` intentionally **keeps `gpioset` running in the foreground (without returning to the shell prompt) so the output stays driven** at 3.3V or 0V while you measure or test your circuit. Press **`Enter`** or **`Ctrl+C`** to release the line and exit.
:::

::: info Syntax Difference on JetPack 7 (Ubuntu 24.04)
JetPack 7 ships **`libgpiod` v2**, which removes `gpiofind` and `--mode=wait` (`gpioset` holds the driven state by default until `Ctrl+C` is pressed). On JetPack 7, use the following commands instead:

```bash
# JetPack 7 (libgpiod v2): drive logic high and hold
gpioset -c gpiochip0 PQ.06=1

# JetPack 7 (libgpiod v2): read input level (--numeric returns 1 or 0)
gpioget --numeric -c gpiochip0 PQ.06
```
:::

## 3. Related Documentation

- **Python (`Jetson.GPIO`) and C (`libgpiod`) Programming Examples**: [GPIO Control](/en/orin-nano-series/gpio)
- **Persistent 40-pin Pinmux Configuration for Development**: [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header)
- **Production Pinmux BCT and Device Tree Workflow**: [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree)
