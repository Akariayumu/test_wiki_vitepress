---
title: 产品选型对比
---

# 产品选型对比

一张表看清 C1901 / C1902 / C2401 与官方 Developer Kit 的差异，帮你快速决定买哪块。

## 核心卡规格对比（NVIDIA 官方数据）

三块载板均支持下列四种 Orin 核心卡，算力取决于所选核心卡：

| 规格 | Orin Nano 4GB | Orin Nano 8GB | Orin NX 8GB | Orin NX 16GB |
|------|--------------|--------------|------------|-------------|
| AI 算力 | 20 TOPS | 40 TOPS | 70 TOPS | 100 TOPS |
| SUPER 模式算力 | 34 TOPS | 67 TOPS | 117 TOPS | 157 TOPS |
| GPU | 512 CUDA + 16 Tensor | 1024 CUDA + 32 Tensor | 1024 CUDA + 32 Tensor | 1024 CUDA + 32 Tensor |
| CPU | 6核 A78AE @1.5GHz | 6核 A78AE @1.5GHz | 8核 A78AE @2GHz | 8核 A78AE @2GHz |
| 内存 | 4GB 64-bit LPDDR5 | 8GB 128-bit LPDDR5 | 8GB 128-bit LPDDR5 | 16GB 128-bit LPDDR5 |
| 内存带宽 | 34 GB/s | 68 GB/s | 102.4 GB/s | 102.4 GB/s |
| 功耗 | 7-15W | 7-15W | 10-25W | 10-25W |
| 视频解码 | 1x 4K60 / 5x 1080p60 (H.265) | 同左 | 最高 12x 1080p30 | 最高 12x 1080p60 |

> SUPER 模式需 JetPack 6.2+ 固件支持。

## 主对比表

| 规格 | 官方 DevKit | C1901 | C1902 | C2401 |
|------|------------|-------|-------|-------|
| 支持模块 | Orin Nano / NX | Orin Nano 4G/8G、Orin NX 8G/16G | 同左 | 同左 |
| 定位 | 官方参考设计 | 高性价比精简版 | 全功能兼容版 | 高密度迷你套件 |
| 供电 | 19V / DC5525 | 12V（兼容 9-19V）/ DC5521 | 12V（兼容 9-19V）/ DC5525 | 12V（兼容 9.5-30V）/ XT30 |
| 以太网 | 1x 千兆 | 1x 千兆 | 1x 千兆 | 1x 千兆 + 1x 2.5G（PTP、16KB 巨型帧） |
| USB | 4x USB 3.0 + Type-C (3.0) | 3x USB 3.0 + 1x USB 2.0，Type-C 2.0（仅烧录） | 4x USB 3.2 (10Gbps) + Type-C 3.0 | 2x USB 3.2 (10Gbps) + 1x USB 2.0，Type-C 2.0（仅烧录） |
| M.2 存储 | 2x Key M | 2x Key M（2280 + 2230） | 2x Key M（2280 4-lane + 2230 2-lane） | 1x Key M（2230，同面设计免拆核心卡） |
| M.2 无线 | 1x Key E | 1x Key E | 1x Key E | 1x Key E（2230） |
| 摄像头 | 2x CSI-2 | 2x CSI-2 22P | 2x CSI-2 22P | 1x CSI-2 22P |
| 显示 | 1x DP 1.2 | 1x HDMI（1080P，DP 转接） | 1x DP 1.2 | 1x Mini HDMI 2.1 |
| CAN | 有（未焊接） | 有 | 有（未焊接） | 有（GH1.25-2P） |
| GPIO / 扩展 | 40-pin | 40-pin + 12-pin 调试 | 40-pin + 12-pin 调试 | 30-pin 拓展母座（UART / I2C / CAN） |
| RTC 电池 | 不支持 | 支持 | 支持 | 支持 |
| POE | 支持（未焊接） | 不支持 | 不支持 | 不支持 |
| SUPER 模式 | 仅 Orin Nano | 仅 Orin Nano | 全系列（Nano + NX） | 仅 Orin Nano |
| 尺寸 | 公版尺寸 | 与公版相近 | 与公版相近 | **55 x 92 mm**（8 层板） |
| 工作温度 | 0~45℃ | 0~45℃ | 0~45℃ | 0~45℃ |
| 电源保护 | 基础 | 反接保护 | 反接保护 | 车规级 E-fuse（过压/欠压/短路/过流/反接） |
| 适用场景 | 评估参考 | 成本敏感的量产的视觉/AI 项目 | 需要完整公版兼容与 SUPER 性能 | 空间受限的嵌入式/机器人/移动设备 |

## 按场景选

- **预算优先、跑标准视觉/AI 应用** → [C1901](/c1901/c1901)：保留公版核心功能，性价比最高。
- **要完整公版兼容、Orin NX 也要开 SUPER 模式** → [C1902](/c1902/c1902)：可直接烧录 Developer Kit 固件，接口与原厂一致。
- **空间紧张、要双网口 / 宽压输入 / 4G-5G 扩展**（机器人、无人机、车载边缘盒） → [C2401](/c2401/c2401)：55x92mm 迷你尺寸，2.5G 网口 + XT30 宽压供电。
- **只是评估学习** → 官方 DevKit 或 C1902（固件完全兼容公版教程）。

## 购买与支持

- 产品详情：[C1901](/c1901/c1901) · [C1902](/c1902/c1902) · [C2401](/c2401/c2401)
- 硬件资料下载：[资源下载](/resources/downloads)
- 官网：[控元科技 LinkZee Labs](https://www.linkzeelabs.com)
