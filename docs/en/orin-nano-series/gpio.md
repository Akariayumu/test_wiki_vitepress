---
title: GPIO Control
outline: deep
---

# GPIO Control

This page is the **Jetson Orin Nano / NX GPIO Programming and Control Guide**, covering how to drive and read GPIO pins across JetPack 5 and JetPack 6+ using **CLI tools**, **Python (`Jetson.GPIO`)**, and **C (`libgpiod`)**.

GPIO (General-Purpose Input/Output) pins can be configured in software as digital inputs (reading logic high or low) or digital outputs (driving logic high or low) for button sensing, status LEDs, sensor triggers, relay control, and similar tasks.

::: info Related Guides & Quick Navigation
- **Persistent 40-pin Pinmux Configuration (GPIO / SPI / I2C / PWM / I2S)**: [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header)
- **JetPack 6+ PADCTL Register Reference & CLI Quick Guide**: [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio)
- **JetPack 5 Sysfs Pin Number Reference & CLI Quick Guide**: [JetPack 5 GPIO Configuration](/en/gpio-tutorial/jetpack5-gpio)
- **Production Pinmux BCT & Device Tree Customization**: [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree)
:::

::: warning 3.3V Logic Level Safety & Carrier Board Compatibility
- **3.3V Logic Level Only**: All GPIO pins on Jetson Orin Nano / NX operate at **3.3V logic levels**. Never connect 5V logic signals directly or short an output pin to power or `GND`, as doing so will permanently damage the Jetson module.
- **Connector Differences by Carrier Board**:
  - **C1902 V2 / C1902 (V1.1+) / C1901 (V1.3+) / Official Developer Kit**: provide the full standard **40-pin** expansion header and match the physical pin numbers below directly (note: Pins 12 / 35 / 38 / 40 are unavailable on earlier **C1901 V1.0–V1.2** and **C1902 V1.0** boards).
  - **C1903**: has no 40-pin header; GPIOs are brought out via **GH1.25 connectors** — see [C1903 Introduction — GH1.25 Peripheral Connectors](/en/c1903/c1903#gh1-25-peripheral-connectors).
  - **C2401**: has no 40-pin header; GPIOs are routed through the **30-pin expansion socket** — see [C2401 Introduction](/en/c2401/c2401).
:::

The standard 40-pin expansion header pinout is shown below:

![Jetson Orin Nano / NX 40-pin expansion header pinout](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin expansion header pinout*

## 1. Control GPIO on JetPack 5

JetPack 5.x (L4T R35.x, Ubuntu 20.04) supports the legacy `/sys/class/gpio` (sysfs) interface, Python `Jetson.GPIO`, and C `libgpiod` v1. Run all commands below in the **Jetson terminal**. The examples use **Physical Pin 31** (sysfs number `454`, SoC node name `PQ.06`, `gpiochip0` line `106`).

### 1.1 Control GPIO from the Command Line (sysfs)

For the full sysfs pin mapping table, see [JetPack 5 GPIO Configuration](/en/gpio-tutorial/jetpack5-gpio).

Open an interactive root shell in the Jetson terminal and export GPIO `454` (on L4T kernels, exporting numeric ID `454` creates `/sys/class/gpio/PQ.06`):

```bash
sudo bash
echo 454 > /sys/class/gpio/export
```

In the same root shell session, configure input mode and read the current state (`1` = logic high at 3.3V, `0` = logic low at 0V):

```bash
echo in > /sys/class/gpio/PQ.06/direction
cat /sys/class/gpio/PQ.06/value
```

Switch to output mode, drive the output level, and release the pin via numeric ID `454` when finished:

```bash
echo out > /sys/class/gpio/PQ.06/direction
echo 1 > /sys/class/gpio/PQ.06/value  # Drive logic high (3.3V)
echo 0 > /sys/class/gpio/PQ.06/value  # Drive logic low (0V)

# Release the pin and exit the root shell when done
echo 454 > /sys/class/gpio/unexport
exit
```

Complete blink test script (save as `blink_sysfs.sh`, run with `sudo bash blink_sysfs.sh`, and press `Ctrl+C` to stop and automatically unexport):

```bash
#!/bin/bash
GPIO_NUM=454
GPIO_NODE="/sys/class/gpio/PQ.06"

trap 'echo "$GPIO_NUM" > /sys/class/gpio/unexport 2>/dev/null; echo "GPIO PQ.06 (454) is released"' EXIT

echo "Setting up GPIO PQ.06 (sysfs $GPIO_NUM)"
if [ ! -d "$GPIO_NODE" ]; then
    echo "$GPIO_NUM" > /sys/class/gpio/export
fi
echo out > "$GPIO_NODE/direction"

while true; do
    echo 0 > "$GPIO_NODE/value"
    sleep 0.5
    cat "$GPIO_NODE/value"
    sleep 0.5
    echo 1 > "$GPIO_NODE/value"
    sleep 0.5
    cat "$GPIO_NODE/value"
    sleep 0.5
done
```

### 1.2 Control GPIO with Python (Jetson.GPIO)

Install the official `Jetson.GPIO` package in the Jetson terminal:

```bash
sudo apt update
sudo apt install -y python3-jetson-gpio
```

`Jetson.GPIO` supports four pin numbering modes:

| Mode | Description |
|---|---|
| `GPIO.BOARD` | Physical pin numbers on the 40-pin expansion header (e.g., `31`) |
| `GPIO.BCM` | Broadcom SoC GPIO numbers (Raspberry Pi compatibility) |
| `GPIO.CVM` | CVM / CVB module connector signal names |
| `GPIO.TEGRA_SOC` | Tegra SoC signal names |

Save the following script as `gpio_blink.py` (using the recommended `import Jetson.GPIO as GPIO` import):

```python
import time
import Jetson.GPIO as GPIO

output_pin = 31  # Physical pin number on the 40-pin header (BOARD mode)

GPIO.setmode(GPIO.BOARD)
GPIO.setup(output_pin, GPIO.OUT, initial=GPIO.HIGH)

print("Blinking Pin 31... Press Ctrl+C to exit")
curr_value = GPIO.HIGH
try:
    while True:
        time.sleep(1)
        print(f"Pin {output_pin} output -> {curr_value}")
        GPIO.output(output_pin, curr_value)
        curr_value ^= GPIO.HIGH
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
```

Run the script in the Jetson terminal:

```bash
sudo python3 gpio_blink.py
```

::: tip Compatibility Alias & Official Repository
- When migrating legacy Raspberry Pi scripts, `Jetson.GPIO` also provides the compatibility alias `import RPi.GPIO as GPIO`, though `import Jetson.GPIO as GPIO` is recommended for all new Jetson projects.
- For edge detection, interrupts, and hardware PWM examples, refer to the [NVIDIA jetson-gpio GitHub repository](https://github.com/NVIDIA/jetson-gpio).
:::

### 1.3 Control GPIO with C (libgpiod)

Install the C compiler toolchain and `libgpiod-dev` headers in the Jetson terminal:

```bash
sudo apt update
sudo apt install -y build-essential libgpiod-dev
```

Using **line 106** on `gpiochip0` (Physical Pin 31, `PQ.06`) as an example, save the following complete program as `gpio_out.c`. It opens the GPIO chip, acquires the line, requests output mode, toggles the pin 10 times, and cleanly releases resources:

```c
#include <gpiod.h>
#include <stdio.h>
#include <unistd.h>

#define GPIO_CHIP_NAME "gpiochip0"
#define GPIO_LINE_OFFSET 106  /* Pin 31 (PQ.06) on gpiochip0 */

int main(void) {
    struct gpiod_chip *chip = NULL;
    struct gpiod_line *line = NULL;
    int val = 0;

    chip = gpiod_chip_open_by_name(GPIO_CHIP_NAME);
    if (!chip) {
        perror("gpiod_chip_open_by_name failed");
        return 1;
    }

    line = gpiod_chip_get_line(chip, GPIO_LINE_OFFSET);
    if (!line) {
        perror("gpiod_chip_get_line failed");
        gpiod_chip_close(chip);
        return 1;
    }

    if (gpiod_line_request_output(line, "gpio_out", 0) < 0) {
        perror("gpiod_line_request_output failed");
        gpiod_chip_close(chip);
        return 1;
    }

    for (int i = 0; i < 10; i++) {
        val = !val;
        if (gpiod_line_set_value(line, val) < 0) {
            perror("gpiod_line_set_value failed");
            break;
        }
        printf("Pin 31 (PQ.06, line %u) -> %d\n", GPIO_LINE_OFFSET, val);
        sleep(1);
    }

    gpiod_line_release(line);
    gpiod_chip_close(chip);
    return 0;
}
```

Compile and run in the Jetson terminal:

```bash
gcc gpio_out.c -lgpiod -o gpio_out
sudo ./gpio_out
```

## 2. Control GPIO on JetPack 6

::: info Architecture Change in JetPack 6+
In JetPack 6 (L4T R36.x, Ubuntu 22.04) and later, NVIDIA removed the legacy `/sys/class/gpio` (sysfs) interface, and most 40-pin header pins boot in `unused` or high-Z input states by default. Configure the target pin's pinmux first via [Jetson-IO](/en/orin-nano-series/expansion-header) (persistent) or `busybox devmem` (runtime debug), then drive or read it via **`libgpiod`** or **`Jetson.GPIO`**.
:::

### 2.1 Control GPIO from the Command Line (libgpiod)

Install `busybox` (provides `devmem`) and `gpiod` (provides `gpioinfo`, `gpiofind`, `gpioget`, and `gpioset`) in the Jetson terminal:

```bash
sudo apt update
sudo apt install -y busybox gpiod
```

Verify the installation and list all recognized GPIO controllers and line names:

```bash
gpioinfo
```

::: warning `devmem` Changes Are Non-Persistent
Direct PADCTL register writes with `busybox devmem` **last only until the next reboot**. For the full PADCTL register table and bit definitions, see [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio); for persistent configuration across reboots, use [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header) or [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree).
:::

**Read input state** (using Pin 31 `PQ.06` at PADCTL address `0x02430070`; writing `0x58` configures GPIO input + internal pull-up):

```bash
sudo busybox devmem 0x02430070 w 0x58
gpioget $(gpiofind "PQ.06")
```

**Configure output mode and hold output level** (writing `0x00` configures push-pull GPIO output with no pull; `--mode=wait` blocks in the foreground to hold the driven level until `Enter` or `Ctrl+C` is pressed):

```bash
# Set Pin 31 (PQ.06) to GPIO output mode
sudo busybox devmem 0x02430070 w 0x00

# Drive logic high (3.3V) and hold
gpioset --mode=wait $(gpiofind "PQ.06")=1

# Drive logic low (0V) and hold
gpioset --mode=wait $(gpiofind "PQ.06")=0
```

::: info CLI Syntax on JetPack 7 (Ubuntu 24.04)
JetPack 7 upgrades to `libgpiod` v2, which removes `gpiofind` and `--mode=wait` (`gpioset` holds the line by default). Use `gpioset -c gpiochip0 PQ.06=1` and `gpioget --numeric -c gpiochip0 PQ.06` on JetPack 7.
:::

### 2.2 Control GPIO with Python (Jetson.GPIO)

On JetPack 6, first configure the target pin as GPIO via [Jetson-IO](/en/orin-nano-series/expansion-header) or apply a temporary runtime register write:

```bash
sudo busybox devmem 0x02430070 w 0x00
```

Install or upgrade `Jetson.GPIO` using standard package management commands (never run `sudo rm -rf` against `/usr/lib/python3*/dist-packages`, as that corrupts the `dpkg` package database):

```bash
# Recommended: install or upgrade via apt
sudo apt update
sudo apt install -y python3-jetson-gpio
```

If you need a newer upstream release from PyPI, remove the system package cleanly via `apt` first and install inside a Python virtual environment:

```bash
sudo apt remove -y python3-jetson-gpio
python3 -m venv ~/venvs/gpio
source ~/venvs/gpio/bin/activate
python -m pip install --upgrade Jetson.GPIO
```

The Python API is identical to Section 1.2 (`import Jetson.GPIO as GPIO`).

### 2.3 Control GPIO with C (libgpiod)

First ensure the target pin's pinmux is set to GPIO output mode (via [Jetson-IO](/en/orin-nano-series/expansion-header) or `devmem`), and install `libgpiod-dev`:

```bash
sudo busybox devmem 0x02430070 w 0x00
sudo apt update
sudo apt install -y build-essential libgpiod-dev
```

Verify the chip and line offset of your target pin with `gpioinfo` (for example, `PQ.06` is `line 106` on `gpiochip0`):

```bash
gpioinfo | grep "PQ.06"
```

Then compile and run the complete `gpio_out.c` program from Section 1.3:

```bash
gcc gpio_out.c -lgpiod -o gpio_out
sudo ./gpio_out
```

::: info C API Version on JetPack 7 (Ubuntu 24.04)
The `gpio_out.c` example above uses the **`libgpiod` v1.x** C API (`gpiod_chip_open_by_name` / `gpiod_chip_get_line`) shipped in JetPack 5 and JetPack 6. JetPack 7 (Ubuntu 24.04) upgrades `libgpiod-dev` to **v2.x**, which replaces the line API with `gpiod_chip_open("/dev/gpiochip0")`, `gpiod_line_settings`, and `gpiod_chip_request_lines`.
:::

## 3. Related Documentation

- [40-pin Expansion Header Configuration (Jetson-IO)](/en/orin-nano-series/expansion-header): persistently toggle 40-pin header pins between GPIO and SFIO via menu UI or CLI.
- [JetPack 6 GPIO Configuration](/en/gpio-tutorial/jetpack6-gpio): complete Orin Nano / NX PADCTL base addresses, pin offsets, and runtime register instructions.
- [JetPack 5 GPIO Configuration](/en/gpio-tutorial/jetpack5-gpio): sysfs GPIO number mappings and CLI instructions for JetPack 5.
- [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree): production Pinmux spreadsheet, MB1 BCT, and device tree overlay workflow.
