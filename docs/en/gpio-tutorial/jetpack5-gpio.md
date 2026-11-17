---
title: JetPack 5 GPIO Configuration (Orin Nano / NX)
outline: deep
---

# JetPack 5 GPIO Configuration (Orin Nano / NX)

::: info Applicable JetPack Version
This guide covers command-line GPIO control via the legacy Linux **sysfs** interface (`/sys/class/gpio`) and **applies only to JetPack 5.x (L4T R35.x, Ubuntu 20.04)**.

NVIDIA removed the sysfs GPIO interface starting in JetPack 6. If you are running **JetPack 6 or JetPack 7**, refer to [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio), [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header), or [GPIO Control](/en/orin-nano-series/gpio).
:::

::: warning 3.3V Logic Level Safety & Carrier Board Compatibility
- **3.3V Logic Level Only**: All GPIO pins on Jetson Orin Nano / NX operate at **3.3V logic levels**. Never apply 5V signals directly to any GPIO pin or short an output pin to power or `GND`, as doing so will permanently damage the Jetson module.
- **Carrier Board Compatibility**: The standard 40-pin physical pin numbers below apply to the official NVIDIA Developer Kit, **C1901**, **C1902**, and **C1902 V2** (note: Pins 12 / 35 / 38 / 40 are unavailable on C1901 V1.0–V1.2 and C1902 V1.0). **C1903** ([GH1.25 Peripheral Connectors](/en/c1903/c1903#gh1-25-peripheral-connectors)) and **C2401** ([30-pin Expansion Socket](/en/c2401/c2401)) do not have a standard 40-pin header — check their respective product pages for pin mappings.
:::

## 1. Identify GPIO Pin Names and Sysfs Numbers

### 1.1 40-pin Expansion Header Pinout

![Jetson Orin Nano / NX 40-pin expansion header pinout](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin expansion header pinout*

### 1.2 Common GPIO Pin Mapping

The table below maps physical pin numbers, silkscreen names, sysfs GPIO numbers, and Tegra SoC pin node names for the common default GPIO pins on the 40-pin header:

| Physical Pin | Pinout Name | Sysfs Number | SoC Pin Node Name |
|---|---|---|---|
| 7 | `GPIO09` | `492` | `PAC.06` |
| 15 | `GPIO12` | `433` | `PN.01` |
| 29 | `GPIO01` | `453` | `PQ.05` |
| 31 | `GPIO11` | `454` | `PQ.06` |
| 32 | `GPIO07` | `389` | `PG.06` |
| 33 | `GPIO13` | `391` | `PH.00` |

::: tip Query All GPIO Mappings
To inspect the sysfs numbers and node names of all GPIOs on a running JetPack 5 system, run `sudo cat /sys/kernel/debug/gpio` in the Jetson terminal.
:::

## 2. Control GPIO from the Command Line (sysfs)

The steps below use **Physical Pin 31** (sysfs number `454`, SoC node name `PQ.06`) as an example. **Run all commands in the Jetson terminal.**

### 2.1 Open a Root Shell and Export the GPIO Pin

Writing directly to `/sys/class/gpio/*` via shell redirection requires root privileges (running `sudo echo ... > /sys/...` as an unprivileged user fails with `Permission denied` because the output redirection is handled by the caller's shell). Start an interactive root shell with `sudo bash`, and **run the remaining commands in Sections 2.2–2.4 within the same root shell session**.

Run in the Jetson terminal:

```bash
sudo bash
echo 454 > /sys/class/gpio/export
```

::: info L4T Sysfs Node Naming Mechanism
In the NVIDIA L4T (JetPack 5) kernel, `/sys/class/gpio/export` and `unexport` **accept only the numeric GPIO ID** (such as `454`). Once `454` is exported, the kernel exposes the sysfs directory using the Tegra SoC port name `/sys/class/gpio/PQ.06` (instead of a generic `gpio454` folder). Subsequent reads and writes to `direction` and `value` therefore use `/sys/class/gpio/PQ.06/`.
:::

### 2.2 Configure Input Mode and Read Level

In the same root shell session, configure the pin as an input:

```bash
echo in > /sys/class/gpio/PQ.06/direction
```

Read the current GPIO input state (`1` indicates logic high at 3.3V; `0` indicates logic low at 0V):

```bash
cat /sys/class/gpio/PQ.06/value
```

### 2.3 Configure Output Mode and Drive Level

In the same root shell session, configure the pin as an output:

```bash
echo out > /sys/class/gpio/PQ.06/direction
```

Drive the GPIO output state (`1` drives logic high at 3.3V; `0` drives logic low at 0V):

```bash
# Drive logic high (3.3V)
echo 1 > /sys/class/gpio/PQ.06/value

# Drive logic low (0V)
echo 0 > /sys/class/gpio/PQ.06/value
```

### 2.4 Release the GPIO Pin

When finished, write the numeric ID `454` to `unexport` to release the GPIO pin, then type `exit` to leave the root shell:

```bash
echo 454 > /sys/class/gpio/unexport
exit
```

## 3. Related Documentation

- **Python (`Jetson.GPIO`) and C (`libgpiod`) Programming Guide**: [GPIO Control](/en/orin-nano-series/gpio)
- **40-pin Pinmux Configuration (SPI / I2C / PWM / I2S / GPIO)**: [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header)
- **GPIO Configuration on JetPack 6 and Later**: [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio)
