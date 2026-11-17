---
title: Install jtop
outline: deep
---

# Install jtop

**`jtop`** is an **interactive system monitoring and management utility** provided by the open-source **[`jetson-stats`](https://github.com/rbonghi/jetson_stats)** project, designed specifically for NVIDIA Jetson edge computing devices. It displays real-time CPU, GPU, memory, power consumption, temperature, fan speed, and JetPack software stack versions.

## 1. Install jtop

### 1.1 Install via One-Click Script (Recommended)

The official script from the `jetson-stats` repository installs `jetson-stats`, enables the `jtop.service` background daemon, and adds your user to the `jtop` group so you can run `jtop` without `sudo`.

On the Jetson terminal, run:

```bash
sudo -v
curl -LsSf https://raw.githubusercontent.com/rbonghi/jetson_stats/master/scripts/install_jtop_torun_without_sudo.sh | bash
```

After installation completes, **log out and log back in** (or run `newgrp jtop` in the current shell to refresh group membership), then launch `jtop` directly without `sudo`:

```bash
newgrp jtop
jtop
```

### 1.2 Install Manually with pip

1. Install `python3` and `python3-pip`:

```bash
sudo apt update
sudo apt install -y python3 python3-pip
```

2. Install `jetson-stats` from PyPI and restart the systemd service:

```bash
sudo pip3 install jetson-stats
sudo systemctl restart jtop.service
```

::: warning JetPack 7 (Ubuntu 24.04) PEP 668 Note
Ubuntu 24.04 enforces PEP 668 (`externally-managed-environment`) on system Python packages. Because `jtop.service` runs as a system daemon, append `--break-system-packages` when installing globally with `pip3` on **JetPack 7** (do **not** run `sudo pip3 install -U pip`, which can break the `apt`-managed `pip` installation):

```bash
sudo pip3 install --break-system-packages jetson-stats
sudo systemctl restart jtop.service
```
:::

::: tip Run Without sudo
After a manual `pip` installation, either launch with `sudo jtop` or add your user to the `jtop` group and refresh your session (`newgrp jtop` or re-login) to run `jtop` without `sudo`:

```bash
sudo usermod -aG jtop "$USER"
newgrp jtop
```
:::

## 2. Use jtop

Run `jtop` in the terminal (or `sudo jtop` if your user has not been added to the `jtop` group) to open the interactive interface. Use number keys `1`–`7`, the Left/Right arrow keys, or the mouse to switch between tabs, and press `q` to quit.

### 2.1 Monitor Module Status

The default **`1ALL`** overview tab (along with the dedicated `2GPU`, `3CPU`, and `4MEM` tabs) displays real-time hardware utilization and sensor telemetry, including per-core CPU load and frequencies, GPU utilization, unified RAM and Swap usage, NVMe storage status, thermal zone temperatures, active `nvpmodel` profile, and board power draw:

![jtop main system overview interface](/img/jtop-main.png)

### 2.2 Control Fan and Power Mode

Switch to the **`5CTRL`** tab to interactively adjust the cooling fan profile (such as `auto` thermal control or `manual` PWM duty cycle), switch `nvpmodel` power modes, or toggle `jetson_clocks` maximum clock locking:

![jtop CTRL fan and power control interface](/img/jtop-fan.png)

### 2.3 View Built-in Software Information

Switch to the **`6INFO`** tab to check the module model, serial number, JetPack / L4T release, Linux kernel version, and installed versions of CUDA, cuDNN, TensorRT, OpenCV, VPI, and Vulkan:

![jtop INFO software and hardware version interface](/img/jtop-info.png)
