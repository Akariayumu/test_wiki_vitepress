---
title: Jetson Orin NX 系列说明
---

# Jetson Orin NX 系列说明

## 1. 简介

**Jetson Orin NX** 是 **Jetson Orin** 系列的中端产品，提供 **8GB** 和 **16GB** 两种内存组合，AI 算力高达 70 TOPS/100 TOPS，在 SUPER 模式下至高 **117 TOPS/157 TOPS**，同时拥有丰富的接口资源，并且兼容 **NVIDIA** 的软件生态，是 AI 机器人、AI 大模型和计算机视觉开发的得力工具。

| | Orin NX 8GB | Orin NX 16GB |
|---|---|---|
| AI 算力 (INT8) | **117** TOPS | **157** TOPS |
| GPU | **1024** 核 CUDA 核心，**32** 个 Tensor Core，GPU@1020MHz | **1796** 核 CUDA 核心，**32** 个 Tensor Core，GPU@1020MHz |
| CPU | 8x A78 @ 2GHz | 8x A78 @ 2GHz |
| 内存 | LPDDR5 **8GB** | LPDDR5 **16GB** |
| 功率 | 10W \| 15W \| 25W \| 40W | 10W \| 15W \| 25W \| 40W |

---

## 2. 外观

![Jetson Orin NX 外观](/img/wiki-dvS0q7a9024.jpg)

![Jetson Orin NX 外观](/img/wiki-0q7a9030.jpg)

---

## 3. 接口

| 接口类型 | 规格详情 |
|---------|---------|
| **CSI 摄像头接口** | 2x MIPI CSI-2 22 针摄像头连接器 |
| **PCIe 接口** | M.2 Key M 插槽，支持 x4 PCIe 3.0<br/>M.2 Key M 插槽，支持 x2 PCIe 3.0<br/>M.2 Key E 插槽（已预装网卡） |
| **USB 接口** | 4x USB 3.2 Gen 2 (10Gbps)<br/>USB Type-C UFP |
| **网络接口** | 1 个千兆以太网 (GbE) 接口 |
| **显示输出** | 1x DisplayPort 1.2 (+MST) 连接器 |
| **存储接口** | 支持外部 NVMe 存储<br/>支持 SD 卡 |
| **扩展接口** | 40 针扩展接头：3x UART、2x SPI、2x I2S（音频）、4x I2C、1x CAN、DMIC、DSPK、PWM、GPIO<br/>12 针调试接口<br/>4 针风扇接头<br/>DC 电源接口 |
| **无线连接** | 支持 WLAN 802.11ac<br/>支持蓝牙 5.0 |

![Jetson Orin NX 正面](/img/wiki-2.jpg)

![Jetson Orin NX 背面（标注）](/img/wiki-HX6zVlu0Qt.jpg)

12Pin 调试接口定义如下：

![12Pin 调试接口定义](/img/wiki-Mwgimage.png)

---

## 4. 注意事项

:::warning 注意
- 开发板允许电源为 **9~19V 5A MAX**，请使用官方原装电源接入开发板，以免损坏载板和核心卡。
- 请确认核心卡散热器的工作状态，以免模组过热导致性能下降。确保散热器安装稳固且无杂物阻碍，必要时定期清理灰尘。
- 上电开机前请确保开发板已接入 USB / 固态硬盘 / eMMC / 内存卡等存储介质。
:::

---

> 来源：[控元科技（广州）有限公司 — LinkZee Labs](https://www.linkzeelabs.com/wiki/books/jetson-orin-nx)
