---
title: Quick Start
outline: deep
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Quick Start

## Company Profile

<div class="qs-logo">

![KYtech](/img/logo.png)

</div>

**KYtech** (LinkZee) specializes in NVIDIA Jetson edge computing hardware, delivering high-performance, cost-effective carrier boards and embedded AI systems.

- **Experienced engineering team**: 10+ years of hardware design and embedded development experience
- **Cost-effective solutions**: reliable hardware engineered for production cost efficiency
- **Agile customization**: rapid project kickoff and response to custom requirements
- **Dedicated technical support**: 3-on-1 engineering support team

Official website: [www.linkzeelabs.com](https://www.linkzeelabs.com/)

## Product Overview

We offer a range of carrier boards and complete kits for NVIDIA Jetson Orin Nano / Orin NX modules, covering reference-compatible, cost-effective production, industrial wide-temperature, and compact embedded deployments:

| Product | Positioning | Documentation |
| --- | --- | --- |
| **C1901** | Cost-effective production carrier board streamlined from the reference design | [C1901 Introduction](/en/c1901/c1901) |
| **C1902** | Reference-compatible carrier board (V1.x) with direct DevKit firmware support and USB 3.2 / Type-C | [C1902 Introduction](/en/c1902/c1902) |
| **C1902 V2** | Industrial wide-temperature upgrade (-20 °C to 55 °C) with 8-layer PCB and dedicated REC button | [C1902 V2 Introduction](/en/c1902v2/c1902v2) |
| **C1903** | Industrial wide-temperature carrier board / kit with full-lineup SUPER mode, dual M.2, and GH1.25 interfaces | [C1903 Introduction](/en/c1903/c1903) |
| **C2401** | Compact 55 × 92 mm high-density mini kit with GbE + 2.5GbE dual Ethernet and 9.5V–30V input | [C2401 Introduction](/en/c2401/c2401) |
| **C2402** (Pre-release) | Multi-interface carrier board supporting GMSL2 cameras, dual GbE, and 4G/5G expansion | [C2402 Introduction](/en/c2402/c2402) |

For detailed board-by-board specifications, see [Product Comparison](/en/products/compare). For Jetson module specifications, refer to the [Orin Nano Series Overview](/en/orin-nano-series/intro) and [Orin NX Series Overview](/en/orin-nx-series/intro).

## Tutorial Overview

Follow the learning path step by step:

<div class="qs-path">

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">1</span>
    <span class="qs-step-title">Flashing Guide</span>
  </div>
  <p class="qs-step-desc">Prepare an Ubuntu host with SDK Manager, flash JetPack onto each carrier board, and enable SUPER mode.</p>
  <div class="qs-step-links">
    <a :href="withBase('/en/flashing-guide/ubuntu-sdkmanager')">Ubuntu VM &amp; SDK Manager</a>
    <a :href="withBase('/en/flashing-guide/devkit-flashing')">Official Developer Kit</a>
    <a :href="withBase('/en/flashing-guide/c1901-flashing')">C1901</a>
    <a :href="withBase('/en/flashing-guide/c1902-flashing')">C1902 / C1902 V2</a>
    <a :href="withBase('/en/flashing-guide/c1903-flashing')">C1903</a>
    <a :href="withBase('/en/flashing-guide/c2401-flashing')">C2401</a>
    <a :href="withBase('/en/flashing-guide/jetpack7-flashing')">JetPack 7 (ISO Installer)</a>
  </div>
</div>

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">2</span>
    <span class="qs-step-title">Getting Started</span>
  </div>
  <p class="qs-step-desc">Log in to the system, test cameras and peripherals, and apply carrier-board USB device trees.</p>
  <div class="qs-step-links">
    <a :href="withBase('/en/orin-nano-series/connect-jetson')">Connect to the Jetson System</a>
    <a :href="withBase('/en/orin-nano-series/camera')">Camera</a>
    <a :href="withBase('/en/orin-nano-series/gpio')">GPIO Control</a>
    <a :href="withBase('/en/orin-nano-series/peripherals')">Other Peripherals</a>
    <a :href="withBase('/en/orin-nano-series/usb-config')">USB Configuration</a>
  </div>
</div>

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">3</span>
    <span class="qs-step-title">Advanced Tutorials</span>
  </div>
  <p class="qs-step-desc">Set up AI frameworks, LLMs, containerized workflows, Ethernet drivers, and 4G cellular modules.</p>
  <div class="qs-step-links">
    <a :href="withBase('/en/orin-nano-series/jtop')">Install jtop</a>
    <a :href="withBase('/en/orin-nano-series/cuda')">Install CUDA</a>
    <a :href="withBase('/en/orin-nano-series/opencv')">OpenCV with CUDA</a>
    <a :href="withBase('/en/orin-nano-series/pytorch')">PyTorch and Torchvision</a>
    <a :href="withBase('/en/orin-nano-series/tensorrt')">TensorRT Acceleration</a>
    <a :href="withBase('/en/orin-nano-series/ollama')">Ollama</a>
    <a :href="withBase('/en/orin-nano-series/openclaw')">Deploy OpenClaw</a>
    <a :href="withBase('/en/orin-nano-series/jetson-container')">ComfyUI (Jetson Containers)</a>
    <a :href="withBase('/en/orin-nano-series/network-driver')">Network Card Driver</a>
    <a :href="withBase('/en/orin-nano-series/gmsl-camera')">GMSL Camera</a>
    <a :href="withBase('/en/orin-nano-series/4g-module')">4G Module</a>
    <a :href="withBase('/en/orin-nano-series/boot-logo')">Custom Boot Logo</a>
  </div>
</div>

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">4</span>
    <span class="qs-step-title">GPIO, BSP &amp; Troubleshooting</span>
  </div>
  <p class="qs-step-desc">Configure 40-pin multiplexing, build production Pinmux and kernel BSPs, and consult hardware downloads and FAQs.</p>
  <div class="qs-step-links">
    <a :href="withBase('/en/orin-nano-series/expansion-header')">40-pin Header (Jetson-IO)</a>
    <a :href="withBase('/en/gpio-tutorial/jetpack6-gpio')">JetPack 6 GPIO</a>
    <a :href="withBase('/en/gpio-tutorial/jetpack5-gpio')">JetPack 5 GPIO</a>
    <a :href="withBase('/en/hardware-bsp/pinmux-device-tree')">Pinmux &amp; Device Tree</a>
    <a :href="withBase('/en/hardware-bsp/kernel-and-bsp-build')">Kernel &amp; Base Image Build</a>
    <a :href="withBase('/en/resources/downloads')">Hardware Resources</a>
    <a :href="withBase('/en/faq/')">FAQ &amp; Troubleshooting</a>
  </div>
</div>

</div>
