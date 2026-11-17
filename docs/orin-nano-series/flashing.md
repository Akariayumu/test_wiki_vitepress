---
title: Orin Nano 刷机导览
outline: deep
---

# Orin Nano 刷机导览

本页汇总 **Jetson Orin Nano（4GB / 8GB）** 核心卡的启动存储介质支持、功耗档位与 **SUPER 模式**载板兼容矩阵、JetPack 与宿主机系统匹配关系，并按载板型号提供分步刷机教程入口。

::: tip 快速开始建议
如果您是首次刷机，请先依次确认下方第 1～3 节的存储介质与宿主机环境要求，再在第 4 节选择手中对应的载板型号进入图文刷机教程。
:::

## 1. 存储介质支持对比

Jetson Orin Nano 存在 **官方开发者套件版核心卡** 与 **商业量产版核心卡** 两种硬件形态，二者板载存储接口不同，刷机前请先确认核心卡与载板组合支持的启动介质：

| 核心卡版本 | 板载 microSD 卡槽 | 板载 eMMC | 支持的系统刷入介质 | 选型建议 |
| --- | --- | --- | --- | --- |
| **Orin Nano Developer Kit 核心卡**（仅随官方套件附带，8GB） | 有（位于核心卡背面） | 无 | `microSD 卡` / `NVMe SSD` / `USB 存储` | 强烈推荐使用 **NVMe SSD**，读写速度与稳定性远优于 microSD 卡 |
| **Orin Nano 量产版核心卡**（4GB / 8GB 独立模组） | **无** | **无** | **`NVMe SSD`** / **`USB 存储`** | 必须安装外部 **NVMe SSD**（推荐单面 M.2 Key M 固态硬盘）或 U 盘 |

::: warning 存储介质注意事项
控元科技（KYtech）全系载板（`C1901`、`C1902`、`C1902 V2`、`C1903`、`C2401`）均不设载板级 microSD 卡槽，请提前在载板 M.2 Key M 插槽安装**单面 NVMe SSD** 作为系统盘。双面颗粒 SSD 可能与载板元器件发生干涉。
:::

## 2. 功耗档位与 SUPER 模式载板兼容矩阵

通过刷入不同的官方配置固件，Jetson Orin Nano 可运行在标准模式或 **SUPER 模式**下：

| 运行模式 | 可选功耗档位 | Orin Nano 4GB 峰值算力 | Orin Nano 8GB 峰值算力 | 固件配置名（L4T） |
| --- | --- | --- | --- | --- |
| **标准模式** | `7W` / `15W` | 20 TOPS | 40 TOPS | `jetson-orin-nano-devkit` |
| **SUPER 模式** | `7W` / `15W` / **`25W`** / **`MAXN SUPER`** | **34 TOPS** | **67 TOPS** | `jetson-orin-nano-devkit-super` |

Jetson Orin Nano 的满载功耗相对温和，**官方开发者套件及控元科技全系在售载板均完整支持 Orin Nano 开启 SUPER 模式**：

| 载板型号 | Orin Nano 标准模式（`7W / 15W`） | Orin Nano SUPER 模式（`25W / MAXN SUPER`） | 推荐供电规格 |
| --- | --- | --- | --- |
| **NVIDIA 官方开发者套件** | 支持 | 支持 | 原装 19V DC 电源 |
| **C1901** | 支持 | 支持 | 12V（9V–19V）DC5521，`≥ 36W` |
| **C1902（V1.x）** | 支持 | 支持 | 12V（9V–19V）DC5525，`≥ 45W` |
| **C1902 V2** | 支持 | 支持 | 12V（9V–19V）DC5525，`≥ 45W` |
| **C1903** | 支持 | 支持 | 12V（9.5V–19V）DC5525，`≥ 45W` |
| **C2401** | 支持 | 支持 | 12V（10V–30V）XT30，`≥ 45W` |

## 3. JetPack 版本与宿主机 Ubuntu 匹配表

使用 NVIDIA SDK Manager 或命令行 `l4t_initrd_flash.sh` 烧录系统时，宿主机（物理机或 VMware 虚拟机）的 **x86_64 Ubuntu Desktop** 版本必须与目标 JetPack 版本匹配：

| 目标 JetPack 版本 | 对应 L4T 版本 | Jetson 目标系统 | 宿主机 Ubuntu 版本要求 | 推荐安装方式 |
| --- | --- | --- | --- | --- |
| **JetPack 5.1.x**（如 5.1.4 / 5.1.5） | R35.x | Ubuntu 20.04 | **Ubuntu 20.04 LTS** | SDK Manager / 命令行 `initrd` 烧录 |
| **JetPack 6.x**（如 6.2 / 6.2.1） | R36.x | Ubuntu 22.04 | **Ubuntu 20.04 / 22.04 LTS** | SDK Manager / 命令行 `initrd` 烧录 |
| **JetPack 7.x**（如 7.2） | R39.x | Ubuntu 24.04 | **Ubuntu 22.04 / 24.04 LTS**（或免虚拟机） | **Jetson ISO 启动 U 盘直装**（需板载固件 `≥ 36.0`），或 SDK Manager / 命令行烧录 |

::: tip 宿主机环境准备建议
- 如需在 Windows 电脑上通过虚拟机刷机，推荐安装 **Ubuntu 22.04 Desktop**（可同时覆盖主流的 JetPack 6 与 JetPack 7），并预留 **`≥ 120 GB`** 磁盘空间（如需整机备份建议 **`≥ 200 GB`**）。详见 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。
- 若设备已刷有 JetPack 6.x 固件（UEFI 版本 `≥ 36.0`）且希望升级至 JetPack 7，可直接在任意电脑上用 U 盘制作启动盘安装，无需配置 Ubuntu 虚拟机，详见 [JetPack 7 刷入系统](/flashing-guide/jetpack7-flashing)。
:::

## 4. 按载板选择刷机教程

请根据您手中的载板型号，点击进入对应的完整刷机、SUPER 固件烧录及备份恢复教程：

| 载板型号 | 进入恢复模式（Force Recovery）方式 | 适用刷机教程 |
| --- | --- | --- |
| **宿主机环境搭建（必读前置）** | — | [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager) |
| **NVIDIA 官方开发者套件** | 跳线帽短接核心卡下方 12-pin 排针的 `FC REC`（Pin 10）与 `GND`（Pin 9 / 11）后上电 | [官方开发者套件刷入系统](/flashing-guide/devkit-flashing) |
| **C1901** | 跳线帽短接 12-pin 排针的 `FC REC`（Pin 10）与 `GND`（Pin 9 / 11）后上电 | [C1901 刷入系统](/flashing-guide/c1901-flashing) |
| **C1902 V2** | 断电按住板载 **`REC` 按钮**再上电（亦兼容 12-pin 排针短接） | [C1902 / C1902 V2 刷入系统](/flashing-guide/c1902-flashing) |
| **C1902（V1.x）** | 跳线帽短接顶部 12-pin 排针的 `FC REC`（Pin 10）与 `GND`（Pin 9 / 11）后上电 | [C1902 / C1902 V2 刷入系统](/flashing-guide/c1902-flashing) |
| **C1903** | 断电按住正面 **`REC` 按钮**上电，或将背面**拨码开关 3** 拨至 `ON` 上电（识别后务必拨回 `OFF`） | [C1903 刷入系统](/flashing-guide/c1903-flashing) |
| **C2401** | 断电按住正面 **`REC` 按钮**上电，或将背面**拨码开关 3** 拨至 `ON` 上电（识别后务必拨回 `OFF`） | [C2401 刷入系统](/flashing-guide/c2401-flashing) |
| **全系载板升级 JetPack 7（免虚拟机 ISO 法）** | 设备需已具备 JetPack 6.x（`≥ 36.0`）UEFI 固件，通过 U 盘引导安装 | [JetPack 7 刷入系统（Orin Nano / NX）](/flashing-guide/jetpack7-flashing) |

## 5. 刷机后常用配置指引

完成系统烧录并首次进入 Ubuntu 桌面后，建议按载板型号完成以下外设驱动与环境配置：

- **USB 3.2 与设备树配置**：使用 `C1901`、`C1902`、`C1903`（正面 `#6` 10Gbps USB 口）或 `C2401`（30-pin 扩展 USB 口）刷入官方固件后，请参考 [Orin Nano / NX USB 配置](/orin-nano-series/usb-config) 安装对应版本的设备树文件。
- **有线与无线网卡驱动**：`C2401` 板载 RTL8125 2.5G 网口，或在 JetPack 6+ 上使用 Intel AX200 / AX210 无线网卡时，请参考 [网卡驱动](/orin-nano-series/network-driver) 安装驱动。
- **系统状态与功耗模式监控**：参考 [安装 jtop](/orin-nano-series/jtop) 查看实时 CPU / GPU 负载、温度及当前功耗模式（`7W` / `15W` / `25W` / `MAXN SUPER`）。
- **故障排查**：如遇无法识别恢复模式设备、USB 降速或启动黑屏，请查阅 [FAQ 与故障排查](/faq/)。
