---
title: Orin NX 系列说明
outline: deep
---

# Jetson Orin NX 系列说明

## 核心卡简介

**NVIDIA Jetson Orin NX** 是面向高性能紧凑型边缘计算场景的中高端 AI 模组，提供 **8GB** 与 **16GB** 两种内存配置。在标准模式下可提供 **70 TOPS / 100 TOPS**（INT8）AI 算力，开启 **SUPER 模式**后跃升至 **117 TOPS / 157 TOPS**，支持多路高清视频编解码与高并发深度学习推理，非常适合具身智能机器人、无人机机载计算、多模态大模型与工业视觉检测。

## 核心卡规格

下表为 **Jetson Orin NX 核心卡（260-pin SO-DIMM 模组）** 本身的硬件参数：

| 规格项 | Orin NX 8GB | Orin NX 16GB |
|---|---|---|
| **AI 算力（INT8 稀疏）** | 标准 **70 TOPS** / SUPER **117 TOPS** | 标准 **100 TOPS** / SUPER **157 TOPS** |
| **GPU** | NVIDIA Ampere 架构，**1024** 个 CUDA 核心，**32** 个 Tensor Core（标准最高 **918 MHz** / SUPER 最高 **1173 MHz**） | NVIDIA Ampere 架构，**1024** 个 CUDA 核心，**32** 个 Tensor Core（标准最高 **918 MHz** / SUPER 最高 **1173 MHz**） |
| **CPU** | **6 核** Arm Cortex-A78AE v8.2 64-bit（最高 **2.0 GHz**） | **8 核** Arm Cortex-A78AE v8.2 64-bit（最高 **2.0 GHz**） |
| **显存 / 内存** | **8GB** 128-bit LPDDR5 | **16GB** 128-bit LPDDR5 |
| **存储支持** | 无板载 eMMC、无 microSD 卡槽；仅支持外部 **NVMe SSD** / **USB 存储** | 无板载 eMMC、无 microSD 卡槽；仅支持外部 **NVMe SSD** / **USB 存储** |
| **功耗档位** | 标准：`10W \| 15W \| 25W`<br/>SUPER：`10W \| 15W \| 25W \| 40W (MAXN SUPER)` | 标准：`10W \| 15W \| 25W`<br/>SUPER：`10W \| 15W \| 25W \| 40W (MAXN SUPER)` |
| **模组接口** | 260-pin SO-DIMM | 260-pin SO-DIMM |

::: warning Orin NX 40W SUPER 模式载板支持说明
- **载板供电要求**：Orin NX 开启 `40W / MAXN SUPER` 模式对载板供电链路要求较高，目前控元载板中仅 **C1902（V1.1 及以上版本）、C1902 V2、C1903** 支持 Orin NX 开启 `40W` SUPER 模式；官方开发者套件载板、C1901 及 C2401 仅支持 Orin NX 标准功耗模式（`10W / 15W / 25W`）。详细对比请参见 [产品选型对比](/products/compare)。
- **外部存储必配**：Orin NX 全系核心卡**既无板载 eMMC，也无 microSD 卡槽**，必须搭配 **M.2 NVMe SSD**（推荐）或 USB 存储设备烧录与运行系统。
:::

## 外观展示

Jetson Orin NX 采用与 Orin Nano 相同的 **260-pin SO-DIMM** 封装尺寸，可安装于兼容的载板与主动散热模组上。下图为公版兼容开发套件形态参考图：

![Jetson Orin 开发套件正面外观参考](/img/wiki-dvS0q7a9024.webp)

*260-pin SO-DIMM 公版兼容套件正面形态参考*

![Jetson Orin 开发套件背面外观参考](/img/wiki-0q7a9030.webp)

*260-pin SO-DIMM 公版兼容套件背面形态参考*

## 参考载板接口示例

NVIDIA 未单独发售“Orin NX 官方开发者套件”，工程与开发通常将 Orin NX 核心卡安装于兼容的第三方载板上。不同载板在尺寸、视频接口、网口数量及工业扩展口上有所差异，选型请查阅 [产品选型对比](/products/compare)。

下表与配图以完整支持 Orin NX `40W` SUPER 模式的控元 **[C1902 V2](/c1902v2/c1902v2)** 工业级载板为例，展示典型接口资源：

| 接口类型 | 典型载板规格（以 C1902 V2 为例） |
|---|---|
| **CSI 摄像头接口** | 2 × MIPI CSI-2（22-pin，0.5 mm 间距） |
| **PCIe 存储与无线扩展** | 1 × M.2 Key M（2280，PCIe x4，用于安装单面 NVMe SSD 系统盘）<br/>1 × M.2 Key M（2230，PCIe x2）<br/>1 × M.2 Key E（2230，支持 Wi-Fi / 蓝牙无线网卡） |
| **USB 接口** | 4 × USB 3.2 Type-A<br/>1 × USB Type-C（支持固件烧录与 USB Device 虚拟网卡） |
| **有线网络** | 1 × 千兆以太网（RJ45；C2401 另提供 2.5G + 千兆双网口） |
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
- **严禁带电插拔**：必须在完全断开电源后，方可插拔 Jetson Orin NX 核心卡、NVMe SSD 或 CSI 摄像头排线。
- **确保充足供电功率**：请按所用载板的电源接口（如 C1902 V2 / C1903 的 DC5525 `12V`（兼容 `9V–19V`），或 C2401 / C2402 的 XT30 `12V`（兼容 `10V–30V`））选用高品质适配器。搭配 Orin NX（尤其开启 `40W` SUPER 模式或挂载多外设时）推荐使用 **≥ 60W** 的电源。
- **配备主动散热器**：Orin NX 满载及 `40W` 模式下发热量显著高于 Orin Nano，必须安装带 PWM 风扇的主动散热器，并确保散热硅脂贴合良好、进出风口畅通。
- **提前安装 NVMe SSD**：Orin NX **不支持 microSD 卡且无内置 eMMC**，刷机与上电前必须在载板 M.2 Key M 插槽安装好 **单面 NVMe SSD**（或接入大容量 USB 3.2 存储设备）。
:::

## 下一步

- 对比各款控元载板（含 SUPER 模式支持矩阵）：[产品选型对比](/products/compare)
- 为 Orin NX 烧录 JetPack 系统：[Orin NX 刷机教程](/orin-nx-series/flashing)
- 首次开机登录与外设开发：[连接到 Jetson 系统](/orin-nano-series/connect-jetson)（软件与外设教程与 Orin Nano 通用）
