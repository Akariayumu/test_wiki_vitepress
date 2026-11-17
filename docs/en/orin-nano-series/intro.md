---
title: Orin Nano Series Overview
outline: deep
---

# Jetson Orin Nano Series Overview

## Module Overview

The **NVIDIA Jetson Orin Nano** series delivers power-efficient entry-level edge AI computing in **4GB** and **8GB** memory configurations. It provides up to **20 TOPS / 40 TOPS** (INT8) in standard mode and up to **34 TOPS / 67 TOPS** in **SUPER mode**, with full support for the NVIDIA JetPack software stack across robotics, edge vision analytics, and lightweight large AI models.

## Module Specifications

The table below lists the hardware specifications of the **Jetson Orin Nano module (260-pin SO-DIMM SoM)** itself:

| Specification | Orin Nano 4GB | Orin Nano 8GB |
|---|---|---|
| **AI Performance (INT8 Sparse)** | Standard **20 TOPS** / SUPER **34 TOPS** | Standard **40 TOPS** / SUPER **67 TOPS** |
| **GPU** | NVIDIA Ampere architecture, **512** CUDA cores, **16** Tensor Cores (up to **1020 MHz**) | NVIDIA Ampere architecture, **1024** CUDA cores, **32** Tensor Cores (up to **1020 MHz**) |
| **CPU** | 6-core Arm Cortex-A78AE v8.2 64-bit (up to **1.7 GHz**) | 6-core Arm Cortex-A78AE v8.2 64-bit (up to **1.7 GHz**) |
| **Memory** | **4GB** 64-bit LPDDR5 | **8GB** 128-bit LPDDR5 |
| **Storage Support** | No onboard eMMC; external **NVMe SSD** / **USB storage** | No onboard eMMC; external **NVMe SSD** / **USB storage** (microSD slot only on DevKit SoM) |
| **Power Modes** | Standard: `7W \| 15W`<br/>SUPER: `7W \| 15W \| 25W` | Standard: `7W \| 15W`<br/>SUPER: `7W \| 15W \| 25W` |
| **Form Factor** | 260-pin SO-DIMM | 260-pin SO-DIMM |

::: tip Storage & SUPER Mode Notes
- **Boot & Storage Media**: No Jetson Orin Nano module includes onboard eMMC. Production modules do not have a microSD card slot (only official Developer Kit modules include a rear microSD slot). An external **M.2 NVMe SSD** is strongly recommended for system storage.
- **SUPER Mode**: Both the Official Developer Kit and all KYtech carrier boards (`C1901`, `C1902`, `C1902 V2`, `C1903`, `C2401`, `C2402`) support the `25W` SUPER mode on Orin Nano modules.
:::

## Appearance

A Jetson Orin Nano module mounts onto a compatible 260-pin SO-DIMM carrier board. The photos below show a typical reference developer kit assembly with heatsink installed:

![Jetson Orin Nano developer kit front view](/img/wiki-dvS0q7a9024.webp)

*Reference developer kit front view*

![Jetson Orin Nano developer kit rear view](/img/wiki-0q7a9030.webp)

*Reference developer kit rear view*

## Reference Carrier Board Interfaces

High-speed and low-speed I/O signals from the SoM are routed out by the carrier board. Different carrier boards vary in video output (DP / HDMI / Mini HDMI), USB port count, dual Ethernet, onboard CAN transceivers, and industrial connectors (40-pin / GH1.25 / 30-pin). See [Product Comparison](/en/products/compare) to choose the right board for your project.

Using the KYtech **[C1902 V2](/en/c1902v2/c1902v2)** industrial reference-compatible carrier board as an example, typical interfaces include:

| Interface Category | Typical Carrier Board Specifications (C1902 V2 Example) |
|---|---|
| **CSI Camera** | 2 × MIPI CSI-2 (22-pin, 0.5 mm pitch) |
| **PCIe Storage & Wireless** | 1 × M.2 Key M (2280, PCIe x4, single-sided NVMe SSD)<br/>1 × M.2 Key M (2230, PCIe x2)<br/>1 × M.2 Key E (2230, for Wi-Fi / Bluetooth module) |
| **USB** | 4 × USB 3.2 Type-A<br/>1 × USB Type-C (for firmware flashing and USB Device virtual Ethernet) |
| **Ethernet** | 1 × Gigabit Ethernet (RJ45) |
| **Display Output** | 1 × DisplayPort 1.2 (standard HDMI on C1901 / C1903 / C2402; Mini HDMI on C2401) |
| **Expansion & Control** | 40-pin expansion header (UART, SPI, I2C, I2S, PWM, GPIO)<br/>12-pin button / debug header (`UART2` debug serial, `FC REC`, `PWR BTN`)<br/>CAN header (3.3V `CAN_TX` / `CAN_RX`), 4-pin PWM fan header, RTC battery header (MX1.25-2P) |

![C1902 V2 front interface layout](/img/c1902v2-layout-front.webp)

*Front layout: `1` DC5525 Power, `2` DisplayPort, `3–4` 4 × USB Type-A, `5` Gigabit RJ45, `6` USB Type-C, `7` Power LED, `8` 260-pin SO-DIMM Slot, `9` 40-pin Expansion Header, `10` PWM Fan Header, `11` CAN Header, `12` 12-pin Button / Debug Header, `13` REC Button, `14–15` 22-pin CSI Camera Connectors (`CAM0` / `CAM1`)*

![C1902 V2 back interface layout](/img/c1902v2-layout-back.webp)

*Back layout: `16` RTC Battery Connector (MX1.25-2P), `17` M.2 Key M 2280, `18` M.2 Key M 2230, `19` M.2 Key E 2230*

The pinout of the **12-pin button / debug header** (used on the Official DevKit, C1901, C1902, and C1902 V2) is shown below:

![12-pin button and debug header pinout](/img/wiki-Mwgimage.png)

## Precautions

::: warning Hardware Safety & Operating Guidelines
- **Never hot-plug hardware**: Always disconnect main power completely before installing or removing the Jetson module, NVMe SSD, or CSI camera ribbon cables.
- **Match carrier board power requirements**: Power connectors and input voltage ranges differ across carrier boards (for example, `19V` DC5525 on the Official DevKit; `12V` (`9V–19V` compatible) DC5521 on C1901; `12V` (`9V–19V` compatible) DC5525 on C1902 / C1902 V2 / C1903; and `12V` (`10V–30V` compatible) XT30 on C2401 / C2402). Always use a quality power supply rated at **45W or higher** for Orin Nano systems.
- **Ensure proper cooling**: Verify that the heatsink and fan are securely mounted and unobstructed, especially during sustained AI inference or `25W` SUPER mode operation.
- **Install boot storage before flashing**: Because Orin Nano modules have no onboard eMMC, install a **single-sided M.2 NVMe SSD** (or USB storage / microSD card on DevKit modules) before flashing and booting.
:::

## Next Steps

- Compare KYtech carrier boards: [Product Comparison](/en/products/compare)
- Flash JetPack OS onto the board: [Flash Orin Nano](/en/orin-nano-series/flashing)
- Log in and connect for the first time: [Connect to the Jetson System](/en/orin-nano-series/connect-jetson)
