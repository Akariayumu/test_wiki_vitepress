---
title: Orin Nano 系列说明
outline: deep
---

# Jetson Orin Nano 系列说明

## 核心卡简介

**NVIDIA Jetson Orin Nano** 是 Jetson Orin 家族的高能效入门级边缘 AI 计算模组，提供 **4GB** 与 **8GB** 两种内存配置。在标准模式下可提供 **20 TOPS / 40 TOPS**（INT8）AI 算力，开启 **SUPER 模式**后至高可达 **34 TOPS / 67 TOPS**，全面兼容 NVIDIA JetPack 软件栈，广泛适用于智能机器人、边缘视觉分析与轻量化大模型部署。

## 核心卡规格

下表为 **Jetson Orin Nano 核心卡（260-pin SO-DIMM 模组）** 本身的硬件参数：

| 规格项 | Orin Nano 4GB | Orin Nano 8GB |
|---|---|---|
| **AI 算力（INT8 稀疏）** | 标准 **20 TOPS** / SUPER **34 TOPS** | 标准 **40 TOPS** / SUPER **67 TOPS** |
| **GPU** | NVIDIA Ampere 架构，**512** 个 CUDA 核心，**16** 个 Tensor Core（最高 **1020 MHz**） | NVIDIA Ampere 架构，**1024** 个 CUDA 核心，**32** 个 Tensor Core（最高 **1020 MHz**） |
| **CPU** | 6 核 Arm Cortex-A78AE v8.2 64-bit（最高 **1.7 GHz**） | 6 核 Arm Cortex-A78AE v8.2 64-bit（最高 **1.7 GHz**） |
| **显存 / 内存** | **4GB** 64-bit LPDDR5 | **8GB** 128-bit LPDDR5 |
| **存储支持** | 无板载 eMMC；支持外部 **NVMe SSD** / **USB 存储** | 无板载 eMMC；支持外部 **NVMe SSD** / **USB 存储**（仅官方套件版核心卡带 microSD 卡槽） |
| **功耗档位** | 标准：`7W \| 15W`<br/>SUPER：`7W \| 15W \| 25W` | 标准：`7W \| 15W`<br/>SUPER：`7W \| 15W \| 25W` |
| **模组接口** | 260-pin SO-DIMM | 260-pin SO-DIMM |

::: tip 存储与 SUPER 模式说明
- **存储介质**：Orin Nano 全系列核心卡**均无板载 eMMC**；其中量产版（Production）核心卡无卡槽，仅开发者套件版（DevKit）核心卡背面带有 microSD 卡槽。实际项目强烈推荐使用 **M.2 NVMe SSD** 作为系统盘。
- **SUPER 模式**：官方开发者套件及控元全系载板（`C1901`、`C1902`、`C1902 V2`、`C1903`、`C2401`、`C2402`）均支持 Orin Nano 开启 `25W` SUPER 模式。
:::

## 外观展示

Jetson Orin Nano 核心卡需安装在兼容的载板上运行。下图为安装散热器后的公版兼容开发套件整体外观示例：

![Jetson Orin Nano 开发套件正面外观](/img/wiki-dvS0q7a9024.webp)

*开发套件正面外观示例*

![Jetson Orin Nano 开发套件背面外观](/img/wiki-0q7a9030.webp)

*开发套件背面外观示例*

## 参考载板接口示例

核心卡的高速 I/O 需通过载板引出。不同型号载板在视频接口（DP / HDMI / Mini HDMI）、USB 端口数量、双网口、板载 CAN 收发器及工业扩展接口（40-pin / GH1.25 / 30-pin）上各有侧重，详细对比请参见 [产品选型对比](/products/compare)。

下表与配图以控元公版兼容工业级载板 **[C1902 V2](/c1902v2/c1902v2)** 为例，展示标准载板的典型接口资源：

| 接口类型 | 典型载板规格（以 C1902 V2 为例） |
|---|---|
| **CSI 摄像头接口** | 2 × MIPI CSI-2（22-pin，0.5 mm 间距） |
| **PCIe 存储与无线扩展** | 1 × M.2 Key M（2280，PCIe x4，推荐单面 NVMe SSD）<br/>1 × M.2 Key M（2230，PCIe x2）<br/>1 × M.2 Key E（2230，支持 Wi-Fi / 蓝牙无线网卡） |
| **USB 接口** | 4 × USB 3.2 Type-A<br/>1 × USB Type-C（支持固件烧录与 USB Device 虚拟网卡） |
| **有线网络** | 1 × 千兆以太网（RJ45） |
| **显示输出** | 1 × DisplayPort 1.2（C1901 / C1903 / C2402 为标准 HDMI，C2401 为 Mini HDMI） |
| **低速与控制扩展** | 40-pin 扩展排针（含 UART、SPI、I2C、I2S、PWM、GPIO）<br/>12-pin 按钮 / 调试排针（含 `UART2` 调试串口、`FC REC`、`PWR BTN`）<br/>CAN 接口（3.3V `CAN_TX` / `CAN_RX`）、4-pin PWM 风扇接口、RTC 电池接口（MX1.25-2P） |

![C1902 V2 正面接口布局示例](/img/c1902v2-layout-front.webp)

*正面布局：`1` DC5525 电源、`2` DP 显示、`3–4` 4 × USB Type-A、`5` 千兆网口、`6` USB Type-C、`7` 电源灯、`8` 核心卡插槽、`9` 40-pin 排针、`10` 风扇口、`11` CAN 接口、`12` 12-pin 调试排针、`13` REC 按钮、`14–15` 双路 22-pin CSI 接口*

![C1902 V2 背面接口布局示例](/img/c1902v2-layout-back.webp)

*背面布局：`16` RTC 电池座（MX1.25-2P）、`17` M.2 Key M 2280、`18` M.2 Key M 2230、`19` M.2 Key E 2230*

公版及 C1901 / C1902 / C1902 V2 载板的 **12-pin 按钮 / 调试接口**引脚定义如下：

![12-pin 按钮与调试接口引脚定义](/img/wiki-Mwgimage.png)

## 使用注意事项

::: warning 硬件安全与使用须知
- **严禁带电插拔**：必须在完全断开电源后，方可插拔 Jetson 核心卡、NVMe SSD 或 CSI 摄像头排线。
- **匹配载板供电规格**：不同载板的供电接口与电压范围不同（例如官方套件为 `19V` DC5525；控元 C1901 为 DC5521 `12V`（兼容 `9V–19V`）；C1902 / C1902 V2 / C1903 为 DC5525 `12V`（兼容 `9V–19V`）；C2401 / C2402 为 XT30 `12V`（兼容 `10V–30V`））。请选用对应接口且功率充足（Orin Nano 建议 **≥ 45W**）的优质电源适配器。
- **确保良好散热**：运行高负载 AI 推理或开启 `25W` SUPER 模式时，请确认散热器贴合稳固、风扇运转正常且风道无遮挡。
- **准备启动存储介质**：Orin Nano 无板载 eMMC，刷机与上电前请确保已正确安装 **单面 M.2 NVMe SSD**（或 USB 存储 / 套件版 microSD 卡）。
:::

## 下一步

- 对比各款控元载板规格：[产品选型对比](/products/compare)
- 为开发板烧录 JetPack 系统：[Orin Nano 刷机教程](/orin-nano-series/flashing)
- 首次开机登录与远程连接：[连接到 Jetson 系统](/orin-nano-series/connect-jetson)
