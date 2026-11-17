---
title: 40-pin Expansion Header Configuration (Jetson-IO)
outline: deep
---

# 40-pin Expansion Header Configuration (Jetson-IO)

On Jetson Orin Nano / NX, most pins on the 40-pin expansion header can operate either as general-purpose **GPIO** or as **SFIO** (special-function I/O such as I2C, SPI, UART, PWM, and I2S).

Pin multiplexing (pinmux) is statically written when the device is flashed. Modifying it at the bootloader level requires editing the official pinmux spreadsheet and reflashing — suitable for mass production and custom carrier boards, but inconvenient during development. NVIDIA therefore provides the **Jetson Expansion Header Tool (Jetson-IO)**: an on-device Python utility that updates pin configurations through an interactive menu or CLI tools by generating a new device tree blob (DTB) or overlay (DTBO) that takes effect after reboot.

::: warning 3.3V Logic Level Safety
Except for the `5V` (Pins 2 / 4) and `3.3V` (Pins 1 / 17) power rails and `GND`, **all signal pins on the 40-pin expansion header use 3.3V logic levels**. Never connect 5V logic signals directly to any pin, or permanent damage to the Jetson module may occur.
:::

## 40-pin Configurable Functions

![Jetson Orin Nano / NX 40-pin expansion header pinout](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin expansion header pinout*

The table below maps the pinout / silkscreen names, Jetson-IO function names, physical pin numbers, and out-of-the-box default states under **JetPack 6 / 7**:

| Silkscreen / Pinout Name | Jetson-IO Function | Physical Pins | Default State |
|---|---|---|---|
| `I2C1_SDA / I2C1_SCL` | `i2c8` | 3 (SDA) / 5 (SCL) | **Enabled** (`i2c8`) |
| `I2C0_SDA / I2C0_SCL` | `i2c2` | 27 (SDA) / 28 (SCL) | **Enabled** (`i2c2`) |
| `UART1_TX / UART1_RX` | `uarta` | 8 (TX) / 10 (RX) | **Enabled** (`uarta`) |
| `UART1_RTS / UART1_CTS` | `uarta-cts/rts` | 11 (RTS) / 36 (CTS) | `unused` |
| `SPI0_MOSI / MISO / SCK / CS0 / CS1` | `spi1` | 19 / 21 / 23 / 24 / 26 | `unused` |
| `SPI1_SCK / CS1 / CS0 / MISO / MOSI` | `spi3` | 13 / 16 / 18 / 22 / 37 | `unused` |
| `I2S0_SCLK / FS / SDIN / SDOUT` | `i2s2` | 12 / 35 / 38 / 40 | `unused` |
| `GPIO9 (AUDIO_MCLK)` | `aud` | 7 | `unused` |
| `GPIO12 (Alt: PWM)` | `pwm1` | 15 | `unused` |
| `GPIO07 (Alt: PWM)` | `pwm7` (`pwm5` in some releases) | 32 | `unused` |
| `GPIO13 (Alt: PWM)` | `pwm5` (`pwm8` in some releases) | 33 | `unused` |
| `GPIO01` | `extperiph3_clk` | 29 | `unused` |
| `GPIO11` | `extperiph4_clk` | 31 | `unused` |

::: info Default States & Live Verification
- In the default JetPack 6 / 7 image, only **`i2c8` (Pins 3/5)**, **`i2c2` (Pins 27/28)**, and **`uarta` (Pins 8/10)** are enabled out of the box. All other functions (`spi1`, `spi3`, `i2s2`, `aud`, `pwm*`) and general-purpose GPIOs default to **`unused`**.
- Pin 31 appears as `gpio` in several screenshots below only because it was manually switched to `gpio` mode during the capture session as an example. Always verify the live state on your device using `config-by-pin.py` or `config-by-function.py` as shown below.
:::

## Menu UI: jetson-io.py

Run the following command in the Jetson terminal:

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

::: info Screenshot Environment
The UI and command screenshots below were captured on a **Jetson Orin Nano Super** running **JetPack 7.2.1 (L4T R39.2.1)**. Menu labels and layout may vary slightly across JetPack releases, while the overall workflow remains the same.
:::

### Main Screen (Select a Header)

On launch, the main screen lists the expansion headers supported on your device (such as `Configure Jetson 40pin Header`, `Configure Jetson 22pin CSI Connector`, and `Configure Jetson M.2 Key E Slot`). Highlight **Configure Jetson 40pin Header** and press **Enter** to open the header screen.

![Jetson-IO main screen](/img/expansion-header-01-jetson-io-main.webp)

*Jetson-IO main screen (selecting an expansion header)*

### Header Screen

The upper half of the header screen displays the current pin-by-pin assignment of the 40-pin header, and the lower menu offers two configuration paths:

![Jetson 40-pin Header configuration menu](/img/expansion-header-02-header-menu.webp)

*40-pin header pin map and configuration menu*

- **Configure for compatible hardware**: select from NVIDIA's preset hardware module profiles (such as audio HATs or microphone arrays) to automatically enable the required pin functions.

![Jetson-IO compatible hardware list](/img/expansion-header-04-compatible-hardware.webp)

*Preset compatible hardware module list*

- **Configure header pins manually**: manually choose the mode of each configurable pin group (most common).

### Configure Pins Manually

Selecting **Configure header pins manually** lists all configurable pin groups (with physical pin numbers in parentheses). Each row provides a **three-column radio selector: `[*] unused  [ ] gpio  [ ] <sfio>`**:

- Use the `↑` / `↓` arrow keys to move between rows, the **`←` / `→` arrow keys** to move across the three columns, and press **Space or Enter** to select the desired mode (`[*]`):
  - **`unused`**: leave the pin group unassigned;
  - **`gpio`**: configure the pin group as general-purpose GPIO (for example, Pin 31 set to `[*] gpio` in the screenshot);
  - **`<sfio>`** (the specific peripheral name in the third column, such as `spi1`, `i2s2`, or `pwm1`): enable that special peripheral function.
- When finished, select **Back** to return to the previous menu.
- You can also select **Export as Device-Tree Overlay** to export the current configuration as a standalone `.dtbo` overlay file under `/boot/` for custom images or batch deployment.

![Jetson-IO manual function selection](/img/expansion-header-03-manual-functions.webp)

*Manual pin configuration screen (three-column radio layout in JetPack 7)*

::: info UI Difference on JetPack 5 / 6
In earlier **JetPack 5 / JetPack 6** builds of `jetson-io.py`, the manual configuration screen uses a **single-column checkbox list** (`[ ] <sfio>`), where pressing Space or Enter toggles `[x]` to enable an SFIO function and leaving it unchecked keeps the default state. Starting with JetPack 7's three-column selector, explicitly select the middle **`[*] gpio`** column whenever you want to drive an `unused` pin as a standard GPIO.
:::

### Save and Apply Changes

After returning to the main screen, choose how to apply your changes:

- **Save and reboot to reconfigure pins**: generates a new DTB, updates `/boot/extlinux/extlinux.conf`, and reboots immediately.
- **Save and exit without rebooting**: writes the configuration without rebooting; changes take effect on the next boot.
- **Discard all pin changes**: discards all changes made in the current session.

::: tip Multiple Configurations Coexist
Jetson-IO preserves every saved configuration entry rather than overwriting previous ones. Once multiple configurations have been saved, the bootloader presents a boot menu at startup so you can boot into any historical configuration.
:::

## Command-Line Tools

Instead of the interactive menu, you can use three equivalent CLI utilities for SSH sessions or automated provisioning scripts (run in the Jetson terminal with `sudo`).

### Query Current Configuration: config-by-pin.py

Run in the Jetson terminal:

```bash
# List supported expansion headers and their header numbers
sudo /opt/nvidia/jetson-io/config-by-pin.py -l

# Show the pin-by-pin configuration of the 40-pin header (Header 1 by default)
sudo /opt/nvidia/jetson-io/config-by-pin.py

# Query a single physical pin (e.g., Pin 7)
sudo /opt/nvidia/jetson-io/config-by-pin.py -p 7
```

Example pin-by-pin output:

![config-by-pin.py pin list output](/img/expansion-header-05-pin-list.webp)

*`config-by-pin.py` pin-by-pin output*

Example single-pin query output:

![config-by-pin.py single-pin query output](/img/expansion-header-06-single-pin.webp)

*`config-by-pin.py -p 7` single-pin output*

### Configure by Function: config-by-function.py

Run in the Jetson terminal:

```bash
# List all configurable functions / currently enabled functions
sudo /opt/nvidia/jetson-io/config-by-function.py -l all
sudo /opt/nvidia/jetson-io/config-by-function.py -l enabled

# Enable a function and generate a new DTB (added to boot entries; reboot to apply)
sudo /opt/nvidia/jetson-io/config-by-function.py -o dt spi1

# Enable multiple functions at once (1 refers to Header 1, the 40-pin header)
sudo /opt/nvidia/jetson-io/config-by-function.py -o dt 1="i2s2 spi1"

# Export a DTBO overlay only (without modifying active boot entries)
sudo /opt/nvidia/jetson-io/config-by-function.py -o dtbo spi1
```

Examples showing all configurable functions and the default enabled functions:

![config-by-function.py all functions](/img/expansion-header-07-function-list-all.webp)

*`config-by-function.py -l all` output*

![config-by-function.py enabled functions](/img/expansion-header-08-function-list-enabled.webp)

*`config-by-function.py -l enabled` default enabled functions*

### Configure by Hardware Module: config-by-hardware.py

Run in the Jetson terminal:

```bash
# List preset compatible hardware module configurations
sudo /opt/nvidia/jetson-io/config-by-hardware.py -l

# Apply a hardware module configuration (example module name from NVIDIA presets)
sudo /opt/nvidia/jetson-io/config-by-hardware.py -n "Adafruit SPH0645LM4H"
```

::: warning Usage Limitations (per NVIDIA Documentation)
- `config-by-hardware.py` and `config-by-function.py` **cannot be combined** in a single CLI configuration step; use the interactive `jetson-io.py` menu if you need both a hardware preset and custom pin changes.
- After rebooting, hardware module selections from a previous session are not retained in the Jetson-IO menu and must be re-selected when making further edits.
:::

## Control Pins in GPIO Mode

Once a pin is configured as GPIO and the system has rebooted, control it with the `gpiod` utilities (`libgpiod`; the legacy `/sys/class/gpio` sysfs interface was removed starting in JetPack 6).

First install `gpiod` in the Jetson terminal and inspect available GPIO lines:

```bash
sudo apt update
sudo apt install -y gpiod

# List all GPIO chips and line names (e.g., Pin 31 maps to PQ.06 on gpiochip0)
gpioinfo
```

Note that **JetPack 6** and **JetPack 7** ship different major versions of `libgpiod` with different CLI syntax (prepend `sudo` if you encounter `Permission denied`):

- **JetPack 6 (Ubuntu 22.04, `libgpiod` v1)**: uses `gpiofind` to resolve the chip/offset and `--mode=wait` to keep holding the output level in the foreground (press `Enter` or `Ctrl+C` to release and exit):

```bash
# Drive logic high (3.3V) and hold
gpioset --mode=wait $(gpiofind "PQ.06")=1

# Read input level (returns 1 or 0)
gpioget $(gpiofind "PQ.06")
```

- **JetPack 7 (Ubuntu 24.04, `libgpiod` v2)**: removes `gpiofind` and `--mode=wait`; pass the chip with `-c` and line name directly (`gpioset` holds the line by default until you press `Ctrl+C`):

```bash
# Drive logic high (3.3V) and hold
gpioset -c gpiochip0 PQ.06=1

# Read input level (--numeric returns 1 or 0)
gpioget --numeric -c gpiochip0 PQ.06
```

For full CLI, Python (`Jetson.GPIO`), and C (`libgpiod`) programming examples, see [GPIO Control](/en/orin-nano-series/gpio). For register-level runtime pinmux debugging, see [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio); for legacy JetPack 5 systems, see [JetPack 5 GPIO Configuration](/en/gpio-tutorial/jetpack5-gpio).

## Carrier Board Compatibility

- **C1902 V2 / C1902 (V1.1 and later) / C1901 (V1.3 and later)**: provide the full standard 40-pin expansion header with the same pinout and Jetson-IO workflow as the official NVIDIA Developer Kit.
- **Earlier Hardware Revisions (C1901 V1.0–V1.2 and C1902 V1.0)**: **Pins 12 / 35 / 38 / 40** (`i2s2` group) on the 40-pin header are unavailable due to an early hardware limitation; this was resolved starting with **C1901 V1.3** and **C1902 V1.1**.
- **C1903**: does not feature a standard 40-pin header (the Jetson-IO 40-pin menu does not apply). Peripheral signals (GPIO, SPI, I2C, UART, CAN) are brought out via **GH1.25 connectors** — see [C1903 Introduction — GH1.25 Peripheral Connectors](/en/c1903/c1903#gh1-25-peripheral-connectors).
- **C2401**: does not feature a standard 40-pin header (the Jetson-IO 40-pin menu does not apply). Expansion signals are routed through the **30-pin socket** and GH1.25 headers — see the [C2401 Introduction](/en/c2401/c2401) for pinout details.
- **DTB Overwrite Notice**: Jetson-IO updates the DTB/DTBO and `/boot/extlinux/extlinux.conf` under `/boot/`. Reflashing the board or replacing the base DTB (such as applying a custom USB device tree per [USB Configuration](/en/orin-nano-series/usb-config)) will overwrite Jetson-IO changes, requiring reconfiguration.
- **Production Recommendation**: Jetson-IO is intended for development and prototyping. For production firmware, generate pinmux files from the official pinmux spreadsheet and flash them with your BSP — see [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree) for the complete BCT, DTS/DTB/DTBO, validation, and rollback workflow.

## References

- [NVIDIA Developer Guide — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA Developer Guide — Changing the Pinmux (Orin NX / Nano Series)](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html#changing-the-pinmux)
- [NVIDIA jetson-gpio GitHub Repository](https://github.com/NVIDIA/jetson-gpio)
