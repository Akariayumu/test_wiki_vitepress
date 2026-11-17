---
title: Product Comparison
outline: deep
---

# Product Comparison

This page compares NVIDIA Jetson Orin module specifications alongside KYtech carrier boards and kits (C1901, C1902, C1902 V2, C1903, and C2401) and the official NVIDIA Developer Kit to help you select the right hardware platform.

## Module Specifications (Official NVIDIA Data)

All carrier boards below support the following four Jetson Orin modules; AI compute and media decoding capabilities depend on the selected module:

| Specification | Orin Nano 4GB | Orin Nano 8GB | Orin NX 8GB | Orin NX 16GB |
|---------------|--------------|--------------|------------|-------------|
| AI performance (standard) | 20 TOPS | 40 TOPS | 70 TOPS | 100 TOPS |
| AI performance (SUPER mode) | 34 TOPS | 67 TOPS | 117 TOPS | 157 TOPS |
| GPU | 512 CUDA + 16 Tensor | 1024 CUDA + 32 Tensor | 1024 CUDA + 32 Tensor | 1024 CUDA + 32 Tensor |
| CPU | 6-core Arm Cortex-A78AE @ 1.5 GHz | 6-core Arm Cortex-A78AE @ 1.5 GHz | **6-core** Arm Cortex-A78AE @ 2.0 GHz | 8-core Arm Cortex-A78AE @ 2.0 GHz |
| Memory | 4GB 64-bit LPDDR5 | 8GB 128-bit LPDDR5 | 8GB 128-bit LPDDR5 | 16GB 128-bit LPDDR5 |
| Memory bandwidth | 34 GB/s | 68 GB/s | 102.4 GB/s | 102.4 GB/s |
| Power envelope | 7W–15W (up to 25W in SUPER) | 7W–15W (up to 25W in SUPER) | 10W–25W (up to 40W in SUPER) | 10W–25W (up to 40W in SUPER) |
| Video decode | 1 × 4K60 / 5 × 1080p60 (H.265) | Same | Up to 12 × 1080p30 (H.265) | Up to 12 × 1080p60 (H.265) |

::: info SUPER Mode Requirements
SUPER mode is supported on JetPack 5.1.5 and JetPack 6.1 or later (including JetPack 7), and requires flashing the SUPER firmware configuration matched to your module and carrier board. **Orin NX SUPER mode (40W)** requires higher power delivery headroom and is supported only on the **C1902 (V1.1+), C1902 V2, and C1903**.
:::

## Carrier Board & Kit Comparison

| Specification | Official DevKit | C1901 | C1902 (V1.x) | C1902 V2 | C1903 | C2401 |
|---------------|----------------|-------|--------------|----------|-------|-------|
| Supported modules | Orin Nano / NX | Orin Nano 4GB/8GB, Orin NX 8GB/16GB | Same | Same | Same | Same |
| Positioning | Official reference design | Cost-optimized production | Reference-compatible | Industrial wide-temp upgrade | Industrial multi-I/O board / kit | Compact high-density mini kit |
| Power input | 19V / DC5525 | 12V (9V–19V) / DC5521 | 12V (9V–19V) / DC5525 | 12V (9V–19V) / DC5525 | 12V (9.5V–19V) / DC5525 | 12V (9.5V–30V) / XT30 |
| Ethernet | 1 × GbE | 1 × GbE | 1 × GbE | 1 × GbE | 1 × GbE | 1 × GbE + 1 × 2.5GbE (PTP, 16KB jumbo frames) |
| USB | 4 × USB 3.2 (10Gbps) + 1 × Type-C (10Gbps) | 3 × USB 3.2 + 1 × USB 2.0; 1 × Type-C (USB 2.0, flashing) | 4 × USB 3.2 (10Gbps) + 1 × Type-C (10Gbps) | 4 × USB 3.2 (5Gbps, industrial hub) + 1 × Type-C (10Gbps) | 4 × USB 3.2 (5Gbps) + 1 × USB 3.2 (10Gbps) + 2 × USB 2.0 (GH1.25); 1 × Type-C (flashing) | 2 × USB 3.2 (10Gbps) + 1 × USB 2.0 (GH1.25); 1 × Type-C (USB 2.0, flashing) |
| M.2 storage | 2 × Key M (2280 + 2230) | 2 × Key M (2280 4-lane + 2230 2-lane) | 2 × Key M (2280 4-lane + 2230 2-lane) | 2 × Key M (2280 4-lane + 2230 2-lane) | 2 × Key M (2280 + 2230) | 1 × Key M (2230, same-side layout) |
| M.2 wireless | 1 × Key E (2230) | 1 × Key E (2230) | 1 × Key E (2230) | 1 × Key E (2230) | 1 × Key E (2230) | 1 × Key E (2230) |
| Camera | 2 × CSI-2 (22-pin) | 2 × CSI-2 (22-pin) | 2 × CSI-2 (22-pin) | 2 × CSI-2 (22-pin) | 2 × CSI-2 (22-pin) | 1 × CSI-2 (22-pin) |
| Display | 1 × DP 1.2 | 1 × HDMI (1080p, DP-converted) | 1 × DP 1.2 | 1 × DP 1.2 | **1 × HDMI 2.1** | 1 × Mini HDMI 2.1 |
| CAN bus | TX/RX only (unpopulated, external transceiver required) | TX/RX only (external transceiver required) | TX/RX only (unpopulated, external transceiver required) | TX/RX only (unpopulated, external transceiver required) | **Onboard transceiver** (GH1.25-2P CAN_H/L, switchable 120Ω) | **Onboard transceiver** (GH1.25-2P CAN_H/L, switchable 120Ω) |
| GPIO & expansion | 40-pin + 12-pin debug | 40-pin + 12-pin debug | 40-pin + 12-pin debug + PWR button | 40-pin + 12-pin debug + dedicated REC button | GH1.25 (UART × 3 / I2C / SPI / GPIO) + PWR/REC buttons + DIP switch | 30-pin expansion header (UART / I2C / SPI / GPIO / USB 3.0) + GH1.25 (UART × 2) + PWR/REC buttons + DIP switch |
| Recovery mode | Jumper on 12-pin FC REC & GND | Jumper on 12-pin FC REC & GND | Jumper on 12-pin FC REC & GND | Dedicated REC button (or 12-pin jumper) | Dedicated REC button or DIP switch 3 | Dedicated REC button or DIP switch 3 |
| RTC battery | No | Yes | Yes | Yes | Yes | Yes |
| PoE | Yes (unpopulated) | No | No | No | No | No |
| SUPER mode | Orin Nano only | Orin Nano only | Full lineup (Orin Nano + Orin NX) | Full lineup (Orin Nano + Orin NX) | Full lineup (Orin Nano + Orin NX) | Orin Nano only |
| Dimensions | 100 × 79 mm (carrier board) | 100 × 79 mm (6-layer PCB) | 100 × 79 mm (6-layer PCB) | 100 × 79 mm (8-layer PCB, optional kit) | **100 × 79 mm (board) / 134.6 × 83 × 47.5 mm (kit)** | **55 × 92 mm** (8-layer PCB) |
| Operating temp. | 0 °C to 45 °C | 0 °C to 45 °C | 0 °C to 45 °C | **-20 °C to 55 °C** | **-20 °C to 50 °C** | 0 °C to 45 °C |
| Power protection | Basic | Reverse-polarity protection | Reverse-polarity protection | Reverse-polarity protection | **Reverse-polarity protection** | Automotive-grade E-fuse (OVP / UVP / SCP / OCP / reverse) |
| Best for | Prototype evaluation & reference | Cost-sensitive vision / AI production | Standard deployments needing DevKit compatibility & SUPER mode | Industrial wide-temp projects needing 40-pin DevKit compatibility | Industrial sites needing wide temp, HDMI 2.1, dual M.2 & locking GH1.25 I/O | Space-constrained robotics, UAVs & dual-NIC mobile devices |

## Selection Guidance

| Priority | Recommended Platform | Selection Notes |
|----------|----------------------|-----------------|
| Minimize system BOM cost with GbE, USB, dual M.2, and a 40-pin header | [C1901](/en/c1901/c1901) | Streamlines non-essential reference circuitry; verify the PCB revision, module SKU, and matching device tree before production deployment. |
| Reuse official Developer Kit firmware and the 40-pin layout in standard indoor temperatures with full-lineup SUPER mode | [C1902](/en/c1902/c1902) | Matches the official reference interface layout and supports flashing official DevKit firmware directly; for new industrial designs, prefer the C1902 V2. |
| Combine full 40-pin DevKit compatibility with **-20 °C to 55 °C** wide-temperature reliability, an 8-layer PCB, and button-based Recovery | [C1902 V2](/en/c1902v2/c1902v2) | Upgrades the USB hub and power delivery to industrial grade, adds a dedicated REC button, and offers an optional aluminum enclosure kit. |
| Require industrial wide temperature, full-size HDMI 2.1, 5 × USB 3.2 + 2 × USB 2.0, dual M.2, and locking GH1.25 connectors with an onboard CAN transceiver | [C1903](/en/c1903/c1903) | 100 × 79 mm carrier board (134.6 × 83 × 47.5 mm enclosure kit) with full-lineup SUPER mode; port #6 direct 10Gbps USB 3.2 requires the matching device tree. |
| Minimize footprint or require GbE + 2.5GbE dual Ethernet, 9.5V–30V XT30 power input, and automotive-grade E-fuse protection | [C2401](/en/c2401/c2401) | Compact 55 × 92 mm board with a 30-pin expansion header and GH1.25 UART / CAN; does not use the standard 40-pin layout, so verify the pinout before wiring peripherals. |
| Establish a hardware and software compatibility baseline against NVIDIA reference documentation | Official Developer Kit | Ideal for initial bring-up and reference testing; production deployment still requires evaluating enclosure dimensions, wide-voltage power, and thermal margins. |

::: tip Upcoming Platform
For applications requiring **4-channel GMSL2 cameras, dual GbE (including Intel I210), and an onboard M.2 Key B 4G/5G cellular slot**, preview the [C2402 Introduction (Pre-release)](/en/c2402/c2402). Always confirm module SKU, JetPack version, camera count, storage capacity, thermal design, and mechanical clearance before finalizing hardware selection.
:::

## Purchase & Support

- Product pages: [C1901](/en/c1901/c1901) · [C1902](/en/c1902/c1902) · [C1902 V2](/en/c1902v2/c1902v2) · [C1903](/en/c1903/c1903) · [C2401](/en/c2401/c2401) · [C2402 (Pre-release)](/en/c2402/c2402)
- Hardware resources: [Hardware Resources](/en/resources/downloads)
- Official website: [KYtech (LinkZee) — www.linkzeelabs.com](https://www.linkzeelabs.com/)
