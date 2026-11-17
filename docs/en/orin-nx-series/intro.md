---
title: Orin NX Series Overview
outline: deep
---

# Jetson Orin NX Series Overview

## Module Overview

The **NVIDIA Jetson Orin NX** series delivers high-performance edge AI computing in a compact form factor, available in **8GB** and **16GB** memory configurations. It provides **70 TOPS / 100 TOPS** (INT8) in standard mode and up to **117 TOPS / 157 TOPS** in **SUPER mode**, making it ideal for embodied robotics, autonomous drones, multimodal large AI models, and multi-stream industrial vision inspection.

## Module Specifications

The table below lists the hardware specifications of the **Jetson Orin NX module (260-pin SO-DIMM SoM)** itself:

| Specification | Orin NX 8GB | Orin NX 16GB |
|---|---|---|
| **AI Performance (INT8 Sparse)** | Standard **70 TOPS** / SUPER **117 TOPS** | Standard **100 TOPS** / SUPER **157 TOPS** |
| **GPU** | NVIDIA Ampere architecture, **1024** CUDA cores, **32** Tensor Cores (up to **918 MHz** standard / **1173 MHz** SUPER) | NVIDIA Ampere architecture, **1024** CUDA cores, **32** Tensor Cores (up to **918 MHz** standard / **1173 MHz** SUPER) |
| **CPU** | **6-core** Arm Cortex-A78AE v8.2 64-bit (up to **2.0 GHz**) | **8-core** Arm Cortex-A78AE v8.2 64-bit (up to **2.0 GHz**) |
| **Memory** | **8GB** 128-bit LPDDR5 | **16GB** 128-bit LPDDR5 |
| **Storage Support** | No onboard eMMC, no microSD slot; external **NVMe SSD** / **USB storage** only | No onboard eMMC, no microSD slot; external **NVMe SSD** / **USB storage** only |
| **Power Modes** | Standard: `10W \| 15W \| 25W`<br/>SUPER: `10W \| 15W \| 25W \| 40W (MAXN SUPER)` | Standard: `10W \| 15W \| 25W`<br/>SUPER: `10W \| 15W \| 25W \| 40W (MAXN SUPER)` |
| **Form Factor** | 260-pin SO-DIMM | 260-pin SO-DIMM |

::: warning Carrier Board Support for Orin NX 40W SUPER Mode
- **Power Delivery Requirement**: Unlocking the `40W / MAXN SUPER` power budget on Orin NX requires upgraded carrier board power delivery. Among KYtech carrier boards, **only C1902 (V1.1+), C1902 V2, and C1903** support Orin NX `40W` SUPER mode. The Official Developer Kit carrier board, C1901, and C2401 support Orin NX standard power modes only (`10W / 15W / 25W`). See [Product Comparison](/en/products/compare) for full details.
- **External Storage Required**: Jetson Orin NX modules have **neither onboard eMMC nor a microSD card slot**. An external **M.2 NVMe SSD** (recommended) or USB storage drive is required to flash and boot the system.
:::

## Appearance

Jetson Orin NX shares the same **260-pin SO-DIMM** footprint as Orin Nano and mounts onto compatible carrier boards with an active heatsink. The photos below illustrate a typical reference-compatible kit assembly:

![Jetson Orin reference kit front view](/img/wiki-dvS0q7a9024.webp)

*260-pin SO-DIMM reference-compatible kit front view*

![Jetson Orin reference kit rear view](/img/wiki-0q7a9030.webp)

*260-pin SO-DIMM reference-compatible kit rear view*

## Reference Carrier Board Interfaces

NVIDIA does not sell a standalone "Orin NX Developer Kit"; Orin NX modules are deployed on compatible carrier boards. Carrier boards differ in footprint, display connectors, Ethernet ports, and industrial headers — see [Product Comparison](/en/products/compare) to compare options.

Using the KYtech **[C1902 V2](/en/c1902v2/c1902v2)** industrial carrier board (which fully supports Orin NX `40W` SUPER mode) as an example, typical interfaces include:

| Interface Category | Typical Carrier Board Specifications (C1902 V2 Example) |
|---|---|
| **CSI Camera** | 2 × MIPI CSI-2 (22-pin, 0.5 mm pitch) |
| **PCIe Storage & Wireless** | 1 × M.2 Key M (2280, PCIe x4, for single-sided NVMe SSD boot drive)<br/>1 × M.2 Key M (2230, PCIe x2)<br/>1 × M.2 Key E (2230, for Wi-Fi / Bluetooth module) |
| **USB** | 4 × USB 3.2 Type-A<br/>1 × USB Type-C (for firmware flashing and USB Device virtual Ethernet) |
| **Ethernet** | 1 × Gigabit Ethernet (RJ45; C2401 offers dual 2.5GbE + GbE ports) |
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
- **Never hot-plug hardware**: Always disconnect main power completely before installing or removing the Jetson Orin NX module, NVMe SSD, or CSI camera ribbon cables.
- **Use a sufficiently rated power supply**: Match the connector and voltage range of your carrier board (for example, `12V` (`9V–19V` compatible) DC5525 on C1902 V2 / C1903, or `12V` (`10V–30V` compatible) XT30 on C2401 / C2402). A power adapter rated at **60W or higher** is recommended for Orin NX systems, especially in `40W` SUPER mode.
- **Active cooling is required**: Orin NX generates significantly more heat than Orin Nano under sustained workloads and in `40W` mode. Always mount an active PWM fan heatsink with proper thermal contact and unobstructed airflow.
- **Install an NVMe SSD before flashing**: Because Orin NX **does not support microSD cards and has no onboard eMMC**, install a **single-sided M.2 NVMe SSD** (or high-speed USB 3.2 drive) before flashing and booting.
:::

## Next Steps

- Compare carrier boards and SUPER mode compatibility: [Product Comparison](/en/products/compare)
- Flash JetPack OS onto Orin NX: [Flash Orin NX](/en/orin-nx-series/flashing)
- First-boot login and peripheral tutorials: [Connect to the Jetson System](/en/orin-nano-series/connect-jetson) (software and peripheral guides apply equally to Orin Nano and Orin NX)
