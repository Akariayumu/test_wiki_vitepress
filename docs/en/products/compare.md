---
title: Product Comparison
---

# Product Comparison

A single table covering the differences between the C1901 / C1902 / C1903 / C2401 and the official Developer Kit, so you can pick the right board quickly.

## Module Specifications (Official NVIDIA Data)

All four carrier boards support the four Orin modules below; compute performance depends on the module you choose:

| Spec | Orin Nano 4GB | Orin Nano 8GB | Orin NX 8GB | Orin NX 16GB |
|------|--------------|--------------|------------|-------------|
| AI performance | 20 TOPS | 40 TOPS | 70 TOPS | 100 TOPS |
| SUPER mode | 34 TOPS | 67 TOPS | 117 TOPS | 157 TOPS |
| GPU | 512 CUDA + 16 Tensor | 1024 CUDA + 32 Tensor | 1024 CUDA + 32 Tensor | 1024 CUDA + 32 Tensor |
| CPU | 6-core A78AE @1.5GHz | 6-core A78AE @1.5GHz | 8-core A78AE @2GHz | 8-core A78AE @2GHz |
| Memory | 4GB 64-bit LPDDR5 | 8GB 128-bit LPDDR5 | 8GB 128-bit LPDDR5 | 16GB 128-bit LPDDR5 |
| Memory bandwidth | 34 GB/s | 68 GB/s | 102.4 GB/s | 102.4 GB/s |
| Power | 7-15W | 7-15W | 10-25W | 10-25W |
| Video decode | 1x 4K60 / 5x 1080p60 (H.265) | Same | Up to 12x 1080p30 | Up to 12x 1080p60 |

> SUPER mode is supported on JetPack 5.1.5 and JetPack 6.1 or later; use SUPER firmware that matches the module and carrier board.

## Main Comparison Table

| Spec | Official DevKit | C1901 | C1902 | C1903 | C2401 |
|------|----------------|-------|-------|-------|-------|
| Supported modules | Orin Nano / NX | Orin Nano 4GB/8GB, Orin NX 8GB/16GB | Same | Same | Same |
| Positioning | Reference design | Cost-optimized | Fully compatible | Industrial-grade carrier board / kit | High-density mini kit |
| Power input | 19V / DC5525 | 12V (9-19V) / DC5521 | 12V (9-19V) / DC5525 | 12V (9.5-19V) / DC5525 | 12V (9.5-30V) / XT30 |
| Ethernet | 1x GbE | 1x GbE | 1x GbE | 1x GbE | 1x GbE + 1x 2.5G (PTP, 16KB jumbo frames) |
| USB | 4x USB 3.0 + Type-C (3.0) | 3x USB 3.0 + 1x USB 2.0, Type-C 2.0 (flashing only) | 4x USB 3.2 (10Gbps) + Type-C 3.0 | 4x USB 3.0 (5Gbps) + 1x USB 3.0 (10Gbps), Type-C 2.0 (flashing only) | 2x USB 3.2 (10Gbps) + 1x USB 2.0, Type-C 2.0 (flashing only) |
| M.2 storage | 2x Key M | 2x Key M (2280 + 2230) | 2x Key M (2280 4-lane + 2230 2-lane) | 2x Key M (2280 + 2230) | 1x Key M (2230, same-side layout) |
| M.2 wireless | 1x Key E | 1x Key E | 1x Key E | 1x Key E (2230) | 1x Key E (2230) |
| Camera | 2x CSI-2 | 2x CSI-2 22P | 2x CSI-2 22P | 2x CSI-2 22P | 1x CSI-2 22P |
| Display | 1x DP 1.2 | 1x HDMI (1080P, DP-converted) | 1x DP 1.2 | 1x HDMI 2.1 | 1x Mini HDMI 2.1 |
| CAN | Yes (unpopulated) | Yes | Yes (unpopulated) | Yes (GH1.25-2P) | Yes (GH1.25-2P) |
| GPIO / expansion | 40-pin | 40-pin + 12-pin debug | 40-pin + 12-pin debug | GH1.25 (UART / I2C / SPI / GPIO) | 30-pin expansion header (UART / I2C / CAN) |
| RTC battery | No | Yes | Yes | Yes | Yes |
| PoE | Yes (unpopulated) | No | No | No | No |
| SUPER mode | Orin Nano only | Orin Nano only | All modules (Nano + NX) | All modules (Nano + NX) | Orin Nano only |
| Dimensions | Reference size | Similar to reference | Similar to reference | **55 x 92 mm** carrier board | **55 x 92 mm** (8-layer PCB) |
| Operating temp. | 0~45℃ | 0~45℃ | 0~45℃ | **-20~50℃** | 0~45℃ |
| Power protection | Basic | Reverse-polarity protection | Reverse-polarity protection | Reverse-polarity protection | Automotive-grade E-fuse (OVP/UVP/SCP/OCP/reverse) |
| Best for | Evaluation | Cost-sensitive vision/AI production | Full DevKit compatibility + SUPER performance | Industrial integration requiring dual M.2 and expanded interfaces | Space-constrained embedded / robotics / mobile |

## Selection Guidance

| Priority | Suggested platform | Selection notes |
|----------|--------------------|-----------------|
| Reduce system cost with GbE, USB, dual M.2, and a 40-pin header as the main interface requirements | [C1901](/en/c1901/c1901) | Omits some reference-board interfaces; confirm the PCB revision, module, and matching device tree before deployment. |
| Reuse the official Developer Kit firmware and interface layout, or enable SUPER mode on Orin NX | [C1902](/en/c1902/c1902) | Its interface configuration follows the NVIDIA reference carrier and supports the corresponding official firmware; its footprint remains in the reference-board class. |
| Require industrial-grade component selection, dual M.2, expanded USB/GH1.25 interfaces, and SUPER mode across Orin Nano/NX | [C1903](/en/c1903/c1903) | Uses 9.5–19V DC5525 input and provides UART, I2C, SPI, and GPIO peripheral connectors. |
| Minimize board area or require dual Ethernet, 2.5GbE, 9.5–30V input, and a compact layout | [C2401](/en/c2401/c2401) | The 55 × 92 mm board uses XT30 power and a 30-pin expansion connector; it does not use the standard 40-pin layout, so verify the pinout before integrating peripherals. |
| Establish a software and hardware baseline against NVIDIA documentation | Official Developer Kit | The official reference platform is appropriate for compatibility baselines; product integration still requires a separate review of size, power, interfaces, and production constraints. |

The final choice should also account for module SKU, JetPack release, camera count, storage, thermal design, and available enclosure space.

## Purchase & Support

- Product pages: [C1901](/en/c1901/c1901) · [C1902](/en/c1902/c1902) · [C1903](/en/c1903/c1903) · [C2401](/en/c2401/c2401)
- Hardware resources: [Downloads](/en/resources/downloads)
- Website: [LinkZee Labs](https://www.linkzeelabs.com)
