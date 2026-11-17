---
title: Orin Nano Flashing Overview
outline: deep
---

# Orin Nano Flashing Overview

This page summarizes boot storage compatibility, power modes, the **SUPER mode** carrier board compatibility matrix, and host Ubuntu requirements for **Jetson Orin Nano (4GB / 8GB)** modules, with direct links to the step-by-step flashing guide for each carrier board.

::: tip Quick Start Recommendation
If you are flashing for the first time, review Sections 1–3 to verify your storage media and host Ubuntu setup, then select your carrier board in Section 4 to open the matching step-by-step tutorial.
:::

## 1. Supported Storage Media

Jetson Orin Nano is available in two hardware variants — the **Developer Kit module** and **production modules** — which differ in onboard storage interfaces:

| Module Variant | Onboard microSD Slot | Onboard eMMC | Supported Boot Storage | Recommendation |
| --- | --- | --- | --- | --- |
| **Orin Nano Developer Kit Module** (bundled with official DevKit, 8GB) | Yes (underside of module) | No | `microSD card` / `NVMe SSD` / `USB drive` | **NVMe SSD** is strongly recommended for higher throughput and reliability |
| **Orin Nano Production Module** (standalone 4GB / 8GB SoM) | **No** | **No** | **`NVMe SSD`** / **`USB drive`** | Requires an external **NVMe SSD** (single-sided M.2 Key M recommended) or USB drive |

::: warning Storage Notes
KYtech carrier boards (`C1901`, `C1902`, `C1902 V2`, `C1903`, `C2401`) do not include a carrier-board microSD slot. Install a **single-sided M.2 Key M NVMe SSD** before flashing. Double-sided SSDs may mechanically interfere with components on the carrier board.
:::

## 2. Power Modes and SUPER Carrier Compatibility

Depending on the flashed L4T board configuration, Jetson Orin Nano operates in either standard mode or **SUPER mode**:

| Operating Mode | Available Power Profiles | Orin Nano 4GB Peak AI | Orin Nano 8GB Peak AI | L4T Target Config |
| --- | --- | --- | --- | --- |
| **Standard Mode** | `7W` / `15W` | 20 TOPS | 40 TOPS | `jetson-orin-nano-devkit` |
| **SUPER Mode** | `7W` / `15W` / **`25W`** / **`MAXN SUPER`** | **34 TOPS** | **67 TOPS** | `jetson-orin-nano-devkit-super` |

Because Jetson Orin Nano has a modest peak power envelope, **both the official NVIDIA Developer Kit and all KYtech carrier boards fully support Orin Nano SUPER mode**:

| Carrier Board | Orin Nano Standard (`7W / 15W`) | Orin Nano SUPER (`25W / MAXN SUPER`) | Recommended Power Supply |
| --- | --- | --- | --- |
| **NVIDIA Official Developer Kit** | Supported | Supported | Bundled 19V DC adapter |
| **C1901** | Supported | Supported | 12V (9V–19V) DC5521, `≥ 36W` |
| **C1902 (V1.x)** | Supported | Supported | 12V (9V–19V) DC5525, `≥ 45W` |
| **C1902 V2** | Supported | Supported | 12V (9V–19V) DC5525, `≥ 45W` |
| **C1903** | Supported | Supported | 12V (9.5V–19V) DC5525, `≥ 45W` |
| **C2401** | Supported | Supported | 12V (10V–30V) XT30, `≥ 45W` |

## 3. JetPack and Host Ubuntu Compatibility

When flashing with NVIDIA SDK Manager or the `l4t_initrd_flash.sh` script, the **x86_64 Ubuntu Desktop** version on your host PC (native Linux or VMware VM) must match the target JetPack release:

| Target JetPack Release | L4T Version | Jetson Target OS | Host Ubuntu Requirement | Recommended Method |
| --- | --- | --- | --- | --- |
| **JetPack 5.1.x** (e.g., 5.1.4 / 5.1.5) | R35.x | Ubuntu 20.04 | **Ubuntu 20.04 LTS** | SDK Manager / CLI `initrd` flash |
| **JetPack 6.x** (e.g., 6.2 / 6.2.1) | R36.x | Ubuntu 22.04 | **Ubuntu 20.04 / 22.04 LTS** | SDK Manager / CLI `initrd` flash |
| **JetPack 7.x** (e.g., 7.2) | R39.x | Ubuntu 24.04 | **Ubuntu 22.04 / 24.04 LTS** (or no VM needed) | **Jetson ISO bootable USB installer** (requires UEFI firmware `≥ 36.0`), or SDK Manager / CLI flash |

::: tip Host Setup Tips
- If you are setting up a virtual machine on Windows, we recommend **Ubuntu 22.04 Desktop** (which supports both JetPack 6 and JetPack 7) with **`≥ 120 GB`** of virtual disk space (**`≥ 200 GB`** if you plan to create full system backups). See [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager).
- If your device already has JetPack 6.x UEFI firmware (`≥ 36.0`) and you want to install JetPack 7, you can create a bootable USB installer on any PC without an Ubuntu VM. See [Flash JetPack 7 (Orin Nano / NX)](/en/flashing-guide/jetpack7-flashing).
:::

## 4. Choose Your Flashing Guide by Carrier Board

Select the guide matching your carrier board for complete SDK Manager flashing, command-line SUPER firmware flashing, and backup/restore instructions:

| Carrier Board | How to Enter Force Recovery Mode | Flashing Guide |
| --- | --- | --- |
| **Host Environment Setup (Prerequisite)** | — | [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) |
| **NVIDIA Official Developer Kit** | Short `FC REC` (Pin 10) and `GND` (Pin 9 / 11) on the 12-pin header under the module, then power on | [Flash Official Developer Kit](/en/flashing-guide/devkit-flashing) |
| **C1901** | Short `FC REC` (Pin 10) and `GND` (Pin 9 / 11) on the 12-pin header, then power on | [Flash C1901](/en/flashing-guide/c1901-flashing) |
| **C1902 V2** | Power off, press and hold the onboard **`REC` button**, then apply power (12-pin header jumper also supported) | [Flash C1902 / C1902 V2](/en/flashing-guide/c1902-flashing) |
| **C1902 (V1.x)** | Short `FC REC` (Pin 10) and `GND` (Pin 9 / 11) on the top 12-pin header, then power on | [Flash C1902 / C1902 V2](/en/flashing-guide/c1902-flashing) |
| **C1903** | Power off and hold the front **`REC` button** while powering on, or set rear **DIP switch 3** to `ON` (set back to `OFF` once detected) | [Flash C1903](/en/flashing-guide/c1903-flashing) |
| **C2401** | Power off and hold the front **`REC` button** while powering on, or set rear **DIP switch 3** to `ON` (set back to `OFF` once detected) | [Flash C2401](/en/flashing-guide/c2401-flashing) |
| **JetPack 7 USB ISO Installer (All Boards)** | Boot from a JetPack 7 ISO USB drive (requires existing JetPack 6.x UEFI firmware `≥ 36.0`) | [Flash JetPack 7 (ISO Installer)](/en/flashing-guide/jetpack7-flashing) |

## 5. Post-Flash Configuration

After flashing and completing initial Ubuntu setup, review the following guides based on your carrier board:

- **USB 3.2 & Device Tree Setup**: On `C1901`, `C1902`, `C1903` (front `#6` 10Gbps USB port), and `C2401` (30-pin expansion USB port), install the matching device tree after flashing official firmware. See [Orin Nano / NX USB Configuration](/en/orin-nano-series/usb-config).
- **Ethernet & Wi-Fi Drivers**: To enable the onboard RTL8125 2.5GbE port on `C2401` or Intel AX200 / AX210 Wi-Fi cards on JetPack 6+, see [Network Card Driver](/en/orin-nano-series/network-driver).
- **System & Power Monitoring**: Install `jtop` to monitor CPU/GPU clocks, temperatures, and active power profiles (`7W` / `15W` / `25W` / `MAXN SUPER`). See [Install jtop](/en/orin-nano-series/jtop).
- **Troubleshooting**: If SDK Manager cannot detect the board, USB ports run at USB 2.0 speed, or video output is missing, see [FAQ & Troubleshooting](/en/faq/).
