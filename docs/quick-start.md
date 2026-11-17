---
title: 快速开始
outline: deep
---

<script setup>
import { withBase } from 'vitepress'
</script>

# 快速开始

## 公司简介

<div class="qs-logo">

![控元科技(KYtech)](/img/logo.png)

</div>

**控元科技(KYtech)**（控元科技（广州）有限公司 / LinkZee）专注于 NVIDIA Jetson 系列边缘计算硬件研发，致力于为行业用户提供高性能、高性价比的载板与智能边缘计算解决方案。

- **专业的研发团队**：10 年以上硬件设计与嵌入式开发经验
- **高性价比硬件方案**：兼顾工业级稳定性与量产成本控制
- **敏捷定制开发**：快速立项响应客户客制化需求
- **完善的技术支持**：三对一工程师专属对接

官网：[www.linkzeelabs.com](https://www.linkzeelabs.com/)

## 产品简介

我们提供多款基于 NVIDIA Jetson Orin Nano / Orin NX 核心卡的载板与整机套件，涵盖公版全兼容、高性价比量产、工业宽温及紧凑型嵌入式等方案：

| 产品 | 定位 | 文档 |
| --- | --- | --- |
| **C1901** | 高性价比量产载板，基于公版方案精简优化 | [C1901 产品介绍](/c1901/c1901) |
| **C1902** | 公版兼容载板（V1.x），可直接刷入官方 DevKit 固件，配备全速 USB 3.2 与 Type-C | [C1902 产品介绍](/c1902/c1902) |
| **C1902 V2** | C1902 工业宽温升级版（-20℃–55℃），8 层 PCB，新增独立 REC 恢复按键 | [C1902 V2 产品介绍](/c1902v2/c1902v2) |
| **C1903** | 工业级宽温载板 / 套件，支持全系列 SUPER 模式，提供双 M.2、多路 USB 与 GH1.25 扩展接口 | [C1903 产品介绍](/c1903/c1903) |
| **C2401** | 55 × 92 mm 小尺寸高密度迷你套件，配备千兆 + 2.5G 双网口与 9.5V–30V 宽压供电 | [C2401 产品介绍](/c2401/c2401) |
| **C2402**（预发布） | 面向视觉与车载边缘场景的多接口载板，支持 GMSL2 相机、双千兆网口与 4G/5G 扩展 | [C2402 产品介绍](/c2402/c2402) |

各载板详细参数差异请参阅 [产品选型对比](/products/compare)；核心卡规格请参考 [Orin Nano 系列说明](/orin-nano-series/intro) 与 [Orin NX 系列说明](/orin-nx-series/intro)。

## 教程简介

按学习路径逐步深入：

<div class="qs-path">

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">1</span>
    <span class="qs-step-title">刷机教程</span>
  </div>
  <p class="qs-step-desc">从准备 Ubuntu 宿主机与 SDK Manager 开始，为各型号载板刷入系统并开启 SUPER 模式。</p>
  <div class="qs-step-links">
    <a :href="withBase('/flashing-guide/ubuntu-sdkmanager')">Ubuntu 虚拟机与 SDK Manager</a>
    <a :href="withBase('/flashing-guide/devkit-flashing')">官方开发者套件</a>
    <a :href="withBase('/flashing-guide/c1901-flashing')">C1901</a>
    <a :href="withBase('/flashing-guide/c1902-flashing')">C1902 / C1902 V2</a>
    <a :href="withBase('/flashing-guide/c1903-flashing')">C1903</a>
    <a :href="withBase('/flashing-guide/c2401-flashing')">C2401</a>
    <a :href="withBase('/flashing-guide/jetpack7-flashing')">JetPack 7（ISO 安装）</a>
  </div>
</div>

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">2</span>
    <span class="qs-step-title">入门教程</span>
  </div>
  <p class="qs-step-desc">连接系统、验证摄像头与常用外设，配置载板 USB 设备树，快速上手 Jetson 开发。</p>
  <div class="qs-step-links">
    <a :href="withBase('/orin-nano-series/connect-jetson')">连接到 Jetson 系统</a>
    <a :href="withBase('/orin-nano-series/camera')">摄像头</a>
    <a :href="withBase('/orin-nano-series/gpio')">GPIO 控制</a>
    <a :href="withBase('/orin-nano-series/peripherals')">其他外设</a>
    <a :href="withBase('/orin-nano-series/usb-config')">USB 配置说明</a>
  </div>
</div>

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">3</span>
    <span class="qs-step-title">进阶教程</span>
  </div>
  <p class="qs-step-desc">搭建 AI 推理与大模型环境，完成容器部署、网卡与 4G 模组驱动适配。</p>
  <div class="qs-step-links">
    <a :href="withBase('/orin-nano-series/jtop')">安装 jtop</a>
    <a :href="withBase('/orin-nano-series/cuda')">安装 CUDA</a>
    <a :href="withBase('/orin-nano-series/opencv')">OpenCV with CUDA</a>
    <a :href="withBase('/orin-nano-series/pytorch')">PyTorch 与 Torchvision</a>
    <a :href="withBase('/orin-nano-series/tensorrt')">TensorRT 加速</a>
    <a :href="withBase('/orin-nano-series/ollama')">Ollama</a>
    <a :href="withBase('/orin-nano-series/openclaw')">部署 OpenClaw</a>
    <a :href="withBase('/orin-nano-series/jetson-container')">ComfyUI 容器部署</a>
    <a :href="withBase('/orin-nano-series/network-driver')">网卡驱动</a>
    <a :href="withBase('/orin-nano-series/4g-module')">4G 模块</a>
    <a :href="withBase('/orin-nano-series/boot-logo')">自定义启动 LOGO</a>
  </div>
</div>

<div class="qs-step">
  <div class="qs-step-header">
    <span class="qs-step-num">4</span>
    <span class="qs-step-title">GPIO、底层适配与排障</span>
  </div>
  <p class="qs-step-desc">配置 40-pin 引脚复用、定制量产 Pinmux 与内核设备树，查阅硬件资料与常见问题排查。</p>
  <div class="qs-step-links">
    <a :href="withBase('/orin-nano-series/expansion-header')">40-pin 扩展头配置（Jetson-IO）</a>
    <a :href="withBase('/gpio-tutorial/jetpack6-gpio')">JetPack 6 GPIO</a>
    <a :href="withBase('/gpio-tutorial/jetpack5-gpio')">JetPack 5 GPIO</a>
    <a :href="withBase('/hardware-bsp/pinmux-device-tree')">Pinmux 与设备树</a>
    <a :href="withBase('/hardware-bsp/kernel-and-bsp-build')">内核与基础镜像构建</a>
    <a :href="withBase('/resources/downloads')">硬件资源下载</a>
    <a :href="withBase('/faq/')">FAQ 与故障排查</a>
  </div>
</div>

</div>
