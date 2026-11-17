---
title: Orin NX Flashing Overview
outline: deep
---

# Orin NX Flashing Overview

This page summarizes external storage requirements, power modes, the **SUPER mode** carrier board compatibility matrix, and host Ubuntu requirements for **Jetson Orin NX (8GB / 16GB)** modules, with direct links to the step-by-step flashing guide for each carrier board.

::: warning Hardware Requirement: Orin NX Has No microSD Slot or eMMC
**All Jetson Orin NX (8GB / 16GB) modules lack both a microSD card slot and onboard eMMC storage.** Before flashing, you must install an **NVMe SSD** (single-sided M.2 Key M strongly recommended) or connect a **USB storage drive** as the boot drive. Booting from a microSD card is not supported.
:::

## 1. Supported Storage Media

| Module SKU | Onboard microSD Slot | Onboard eMMC | Supported Boot Storage | Recommendation |
| --- | --- | --- | --- | --- |
| **Jetson Orin NX 8GB** | **No** | **No** | **`NVMe SSD`** / **`USB drive`** | Install a **single-sided M.2 Key M NVMe SSD** (2280 or 2230 depending on carrier board) |
| **Jetson Orin NX 16GB** | **No** | **No** | **`NVMe SSD`** / **`USB drive`** | Install a **single-sided M.2 Key M NVMe SSD**; double-sided drives may interfere with board components |

## 2. Power Modes and SUPER Carrier Compatibility

Unlike Orin Nano (standard `7W / 15W`, SUPER `25W`), **Jetson Orin NX operates at higher power budgets and delivers substantially higher AI compute**:

| Operating Mode | Available Power Profiles | Orin NX 8GB Peak AI | Orin NX 16GB Peak AI | L4T Target Config |
| --- | --- | --- | --- | --- |
| **Standard Mode** | `10W` / `15W` / `25W` | 70 TOPS | 100 TOPS | `jetson-orin-nano-devkit` |
| **SUPER Mode** | `10W` / `15W` / `25W` / **`40W`** / **`MAXN SUPER`** | **117 TOPS** | **157 TOPS** | `jetson-orin-nano-devkit-super` |

::: warning Orin NX SUPER Mode Carrier Power Restrictions (Important)
Running Orin NX at **`40W` / `MAXN SUPER`** places significantly higher transient current demands on the carrier board's power delivery network:
- **Carrier boards supporting Orin NX SUPER mode**: **`C1902 (V1.1 and later)`**, **`C1902 V2`**, and **`C1903`** only (use a **`≥ 60W`** 12V DC power supply with active cooling).
- **Carrier boards NOT supporting Orin NX SUPER mode**: **NVIDIA Official Developer Kit carrier board**, **`C1901`**, **`C1902 V1.0`**, and **`C2401`**. When pairing Orin NX with these boards, **always flash the standard firmware** (`10W / 15W / 25W`) and do not flash SUPER firmware to avoid over-current protection trips or unexpected reboots under heavy load.
:::

Compatibility summary for **Jetson Orin NX** across all carrier boards:

| Carrier Board | Orin NX Standard (`10W / 15W / 25W`) | Orin NX SUPER (`40W / MAXN SUPER`) | Recommended Power Supply |
| --- | --- | --- | --- |
| **C1902 V2** | Supported | **Supported** | 12V (9V–19V) DC5525, `≥ 60W` |
| **C1903** | Supported | **Supported** | 12V (9.5V–19V) DC5525, `≥ 60W` |
| **C1902 (V1.1 / V1.1.1)** | Supported | **Supported** | 12V (9V–19V) DC5525, `≥ 60W` |
| **C1902 (V1.0)** | Supported | Not supported (use standard firmware) | 12V (9V–19V) DC5521, `≥ 45W` |
| **NVIDIA Official Developer Kit** | Supported | Not supported (use standard firmware) | Bundled 19V DC adapter |
| **C1901** | Supported | Not supported (use standard firmware) | 12V (9V–19V) DC5521, `≥ 45W` |
| **C2401** | Supported | Not supported (use standard firmware) | 12V (10V–30V) XT30, `≥ 60W` |

## 3. JetPack and Host Ubuntu Compatibility

When flashing with NVIDIA SDK Manager or the `l4t_initrd_flash.sh` script, the **x86_64 Ubuntu Desktop** version on your host PC (native Linux or VMware VM) must match the target JetPack release:

| Target JetPack Release | L4T Version | Jetson Target OS | Host Ubuntu Requirement | Recommended Method |
| --- | --- | --- | --- | --- |
| **JetPack 5.1.x** (e.g., 5.1.4 / 5.1.5) | R35.x | Ubuntu 20.04 | **Ubuntu 20.04 LTS** | SDK Manager / CLI `initrd` flash |
| **JetPack 6.x** (e.g., 6.2 / 6.2.1) | R36.x | Ubuntu 22.04 | **Ubuntu 20.04 / 22.04 LTS** | SDK Manager / CLI `initrd` flash |
| **JetPack 7.x** (e.g., 7.2) | R39.x | Ubuntu 24.04 | **Ubuntu 22.04 / 24.04 LTS** (or no VM needed) | **Jetson ISO bootable USB installer** (requires UEFI firmware `≥ 36.0`), or SDK Manager / CLI flash |

::: tip Host Directory and VM Setup Tips
- For a VMware virtual machine on Windows, we recommend **Ubuntu 22.04 Desktop** with **`≥ 120 GB`** of virtual disk space (**`≥ 200 GB`** if you plan to back up full system images). See [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager).
- When running command-line flash or backup/restore scripts on the host, note that SDK Manager creates the target cache directory as `~/nvidia/nvidia_sdk/JetPack_<version>_Linux_JETSON_ORIN_NX_TARGETS/Linux_for_Tegra` when an Orin NX module is selected (instead of `JETSON_ORIN_NANO_TARGETS`). Adjust your `cd` path to match the actual folder under `~/nvidia/nvidia_sdk/`.
:::

## 4. Choose Your Flashing Guide by Carrier Board

Select the guide matching your carrier board for step-by-step flashing instructions:

| Carrier Board | How to Enter Force Recovery Mode | Orin NX Firmware Guidance | Flashing Guide |
| --- | --- | --- | --- |
| **Host Environment Setup (Prerequisite)** | — | — | [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager) |
| **C1902 V2** | Power off, press and hold the onboard **`REC` button**, then apply power (12-pin header jumper also supported) | Standard & **SUPER firmware** supported | [Flash C1902 / C1902 V2](/en/flashing-guide/c1902-flashing) |
| **C1902 (V1.x)** | Short `FC REC` (Pin 10) and `GND` (Pin 9 / 11) on the top 12-pin header, then power on | V1.1+ supports **SUPER firmware**; V1.0 standard only | [Flash C1902 / C1902 V2](/en/flashing-guide/c1902-flashing) |
| **C1903** | Power off and hold the front **`REC` button** while powering on, or set rear **DIP switch 3** to `ON` (set back to `OFF` once detected) | Standard & **SUPER firmware** supported | [Flash C1903](/en/flashing-guide/c1903-flashing) |
| **NVIDIA Official Developer Kit** | Short `FC REC` (Pin 10) and `GND` (Pin 9 / 11) on the 12-pin header under the module, then power on | Flash standard firmware (Section 1) | [Flash Official Developer Kit](/en/flashing-guide/devkit-flashing) |
| **C1901** | Short `FC REC` (Pin 10) and `GND` (Pin 9 / 11) on the 12-pin header, then power on | Flash standard firmware (Section 1) | [Flash C1901](/en/flashing-guide/c1901-flashing) |
| **C2401** | Power off and hold the front **`REC` button** while powering on, or set rear **DIP switch 3** to `ON` (set back to `OFF` once detected) | Flash standard firmware (Section 1) | [Flash C2401](/en/flashing-guide/c2401-flashing) |
| **JetPack 7 USB ISO Installer (All Boards)** | Boot from a JetPack 7 ISO USB drive to install onto NVMe SSD (requires UEFI firmware `≥ 36.0`) | Enable SUPER power mode only on supported boards | [Flash JetPack 7 (ISO Installer)](/en/flashing-guide/jetpack7-flashing) |

## 5. Post-Flash Configuration

- **USB 3.2 & Device Tree Setup**: On `C1901`, `C1902`, `C1903` (front `#6` 10Gbps USB port), and `C2401` (30-pin expansion USB port), install the device tree matching your module SKU (`Orin NX 8GB` / `16GB`) and JetPack version. See [Orin Nano / NX USB Configuration](/en/orin-nano-series/usb-config).
- **Ethernet & Wi-Fi Drivers**: To enable the onboard RTL8125 2.5GbE port on `C2401` or Intel AX200 / AX210 Wi-Fi cards on JetPack 6+, see [Network Card Driver](/en/orin-nano-series/network-driver).
- **System & Power Monitoring**: Install `jtop` to inspect clocks, temperatures, and active power profiles (`10W` / `15W` / `25W` / `40W` / `MAXN SUPER`). See [Install jtop](/en/orin-nano-series/jtop).
- **Troubleshooting**: If the NVMe SSD is not detected, USB recovery enumeration fails, or boot stalls, see [FAQ & Troubleshooting](/en/faq/).
