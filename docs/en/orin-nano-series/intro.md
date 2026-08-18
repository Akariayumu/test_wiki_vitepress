---
title: Jetson Orin Nano Series Overview
---

# Jetson Orin Nano Series Overview

## 1. Introduction

**Jetson Orin Nano** is the entry-level product in the **Jetson Orin** series, available in **4GB** and **8GB** memory configurations, delivering up to 20 TOPS / 40 TOPS of AI performance, and up to **34 TOPS / 67 TOPS** in SUPER mode. With rich interface resources and full compatibility with the **NVIDIA** software ecosystem, it is a powerful tool for AI robotics, AI large models, and computer vision development.

| | Orin Nano 4GB | Orin Nano 8GB |
|---|---|---|
| AI Performance (INT8) | **34** TOPS | **67** TOPS |
| GPU | **512** CUDA cores, **16** Tensor Cores, GPU@1020MHz | **1024** CUDA cores, **32** Tensor Cores, GPU@1020MHz |
| CPU | 6x A78 @ 1.7GHz | 6x A78 @ 1.7GHz |
| Memory | LPDDR5 **4GB** | LPDDR5 **8GB** |
| Power | 7W \| 15W \| 25W | 7W \| 15W \| 25W |

---

## 2. Appearance

![Jetson Orin Nano appearance](/img/wiki-dvS0q7a9024.jpg)

![Jetson Orin Nano appearance](/img/wiki-0q7a9030.jpg)

---

## 3. Interfaces

| Interface Type | Specifications |
|---------|---------|
| **CSI Camera Interface** | 2x MIPI CSI-2 22-pin camera connectors |
| **PCIe Interface** | M.2 Key M slot, supports x4 PCIe 3.0<br/>M.2 Key M slot, supports x2 PCIe 3.0<br/>M.2 Key E slot (pre-installed with network card) |
| **USB Interface** | 4x USB 3.2 Gen 2 (10Gbps)<br/>USB Type-C UFP |
| **Network Interface** | 1x Gigabit Ethernet (GbE) port |
| **Display Output** | 1x DisplayPort 1.2 (+MST) connector |
| **Storage Interface** | Supports external NVMe storage<br/>Supports SD card |
| **Expansion Interface** | 40-pin expansion header: 3x UART, 2x SPI, 2x I2S (audio), 4x I2C, 1x CAN, DMIC, DSPK, PWM, GPIO<br/>12-pin debug interface<br/>4-pin fan header<br/>DC power jack |
| **Wireless Connectivity** | Supports WLAN 802.11ac<br/>Supports Bluetooth 5.0 |

![Jetson Orin Nano front](/img/wiki-2.jpg)

![Jetson Orin Nano back (labeled)](/img/wiki-HX6zVlu0Qt.jpg)

The 12-pin debug interface is defined as follows:

![12-pin debug interface definition](/img/wiki-Mwgimage.png)

---

## 4. Precautions

:::warning Note
- The board accepts a power supply of **9~19V 5A MAX**. Please use the official original power adapter to power the board to avoid damaging the carrier board and the core module.
- Please confirm the working condition of the core module's heatsink to prevent performance degradation caused by module overheating. Make sure the heatsink is securely mounted and free of obstructions; clean off dust regularly if necessary.
- Before powering on, make sure a storage medium such as a USB drive / SSD / eMMC / memory card is connected to the board.
:::

---

> Source: [KYtech (LinkZee Labs)](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano)
