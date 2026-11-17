---
title: Orin NX 刷机导览
outline: deep
---

# Orin NX 刷机导览

本页汇总 **Jetson Orin NX（8GB / 16GB）** 核心卡的外部存储介质要求、功耗档位与 **SUPER 模式**载板供电兼容矩阵、JetPack 与宿主机系统匹配关系，并按载板型号提供分步刷机教程入口。

::: warning 重要硬件前提：Orin NX 无 microSD 卡槽与板载 eMMC
**Jetson Orin NX（8GB / 16GB）全系核心卡均未配备 microSD 卡槽，也不含板载 eMMC 存储。** 刷机前必须在载板的 M.2 Key M 插槽安装 **NVMe SSD**（强烈推荐单面颗粒固态硬盘）或接入 **USB 存储设备**作为系统盘，无法使用 microSD 卡启动。
:::

## 1. 存储介质支持说明

| 核心卡型号 | 板载 microSD 卡槽 | 板载 eMMC | 支持的系统刷入介质 | 选型与安装建议 |
| --- | --- | --- | --- | --- |
| **Jetson Orin NX 8GB** | **无** | **无** | **`NVMe SSD`** / **`USB 存储`** | 推荐使用 **单面 M.2 Key M NVMe SSD**（2280 或 2230 规格视载板而定） |
| **Jetson Orin NX 16GB** | **无** | **无** | **`NVMe SSD`** / **`USB 存储`** | 推荐使用 **单面 M.2 Key M NVMe SSD**；双面 SSD 可能与载板背部元器件干涉 |

## 2. 功耗档位与 SUPER 模式载板兼容矩阵

与 Orin Nano（标准 `7W / 15W`、SUPER `25W`）不同，**Jetson Orin NX 拥有更高的功耗档位与峰值算力**：

| 运行模式 | 可选功耗档位 | Orin NX 8GB 峰值算力 | Orin NX 16GB 峰值算力 | 固件配置名（L4T） |
| --- | --- | --- | --- | --- |
| **标准模式** | `10W` / `15W` / `25W` | 70 TOPS | 100 TOPS | `jetson-orin-nano-devkit` |
| **SUPER 模式** | `10W` / `15W` / `25W` / **`40W`** / **`MAXN SUPER`** | **117 TOPS** | **157 TOPS** | `jetson-orin-nano-devkit-super` |

::: warning Orin NX SUPER 模式载板供电限制（必看）
Orin NX 开启 **`40W` / `MAXN SUPER`** 时整板瞬态功耗显著高于标准模式，对载板核心供电电路与外接电源功率有严格要求：
- **支持 Orin NX SUPER 模式的载板**：仅限 **`C1902（V1.1 及以上）`**、**`C1902 V2`**、**`C1903`**（请搭配 **`≥ 60W`** 的 12V DC 电源并确保主动散热风扇正常运转）。
- **不支持 Orin NX SUPER 模式的载板**：**NVIDIA 官方开发者套件载板**、**`C1901`**、**`C1902 V1.0`**、**`C2401`**。在这些载板上搭配 Orin NX 时，**请务必刷入标准固件**（使用 `10W / 15W / 25W` 档位），切勿刷入 SUPER 固件，以免高负载下触发供电保护或异常断电重启。
:::

各载板搭配 **Jetson Orin NX** 时的模式支持汇总如下：

| 载板型号 | Orin NX 标准模式（`10W / 15W / 25W`） | Orin NX SUPER 模式（`40W / MAXN SUPER`） | 推荐供电规格 |
| --- | --- | --- | --- |
| **C1902 V2** | 支持 | **支持** | 12V（9V–19V）DC5525，`≥ 60W` |
| **C1903** | 支持 | **支持** | 12V（9.5V–19V）DC5525，`≥ 60W` |
| **C1902（V1.1 / V1.1.1）** | 支持 | **支持** | 12V（9V–19V）DC5525，`≥ 60W` |
| **C1902（V1.0）** | 支持 | 不支持（请刷标准固件） | 12V（9V–19V）DC5521，`≥ 45W` |
| **NVIDIA 官方开发者套件** | 支持 | 不支持（请刷标准固件） | 原装 19V DC 电源 |
| **C1901** | 支持 | 不支持（请刷标准固件） | 12V（9V–19V）DC5521，`≥ 45W` |
| **C2401** | 支持 | 不支持（请刷标准固件） | 12V（10V–30V）XT30，`≥ 60W` |

## 3. JetPack 版本与宿主机 Ubuntu 匹配表

使用 NVIDIA SDK Manager 或命令行 `l4t_initrd_flash.sh` 烧录系统时，宿主机（物理机或 VMware 虚拟机）的 **x86_64 Ubuntu Desktop** 版本必须与目标 JetPack 版本匹配：

| 目标 JetPack 版本 | 对应 L4T 版本 | Jetson 目标系统 | 宿主机 Ubuntu 版本要求 | 推荐安装方式 |
| --- | --- | --- | --- | --- |
| **JetPack 5.1.x**（如 5.1.4 / 5.1.5） | R35.x | Ubuntu 20.04 | **Ubuntu 20.04 LTS** | SDK Manager / 命令行 `initrd` 烧录 |
| **JetPack 6.x**（如 6.2 / 6.2.1） | R36.x | Ubuntu 22.04 | **Ubuntu 20.04 / 22.04 LTS** | SDK Manager / 命令行 `initrd` 烧录 |
| **JetPack 7.x**（如 7.2） | R39.x | Ubuntu 24.04 | **Ubuntu 22.04 / 24.04 LTS**（或免虚拟机） | **Jetson ISO 启动 U 盘直装**（需板载固件 `≥ 36.0`），或 SDK Manager / 命令行烧录 |

::: tip 宿主机目录与环境提示
- 如需新建虚拟机，推荐安装 **Ubuntu 22.04 Desktop** 并分配 **`≥ 120 GB`** 磁盘空间（如需整机备份建议 **`≥ 200 GB`**），详见 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。
- 在宿主机执行命令行刷机或备份恢复时，若此前在 SDK Manager 中选择的目标设备为 Orin NX，其缓存路径中的目标目录通常为 `~/nvidia/nvidia_sdk/JetPack_<版本>_Linux_JETSON_ORIN_NX_TARGETS/Linux_for_Tegra`（而非 `JETSON_ORIN_NANO_TARGETS`），请以 `~/nvidia/nvidia_sdk/` 下的实际目录名为准。
:::

## 4. 按载板选择刷机教程

请根据您手中的载板型号，点击进入对应的完整刷机教程：

| 载板型号 | 进入恢复模式（Force Recovery）方式 | Orin NX 固件建议 | 适用刷机教程 |
| --- | --- | --- | --- |
| **宿主机环境搭建（必读前置）** | — | — | [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager) |
| **C1902 V2** | 断电按住板载 **`REC` 按钮**再上电（亦兼容 12-pin 排针短接） | 支持标准固件与 **SUPER 固件** | [C1902 / C1902 V2 刷入系统](/flashing-guide/c1902-flashing) |
| **C1902（V1.x）** | 跳线帽短接顶部 12-pin 排针的 `FC REC`（Pin 10）与 `GND`（Pin 9 / 11）后上电 | V1.1+ 支持 **SUPER 固件**；V1.0 请刷标准固件 | [C1902 / C1902 V2 刷入系统](/flashing-guide/c1902-flashing) |
| **C1903** | 断电按住正面 **`REC` 按钮**上电，或将背面**拨码开关 3** 拨至 `ON` 上电（识别后务必拨回 `OFF`） | 支持标准固件与 **SUPER 固件** | [C1903 刷入系统](/flashing-guide/c1903-flashing) |
| **NVIDIA 官方开发者套件** | 跳线帽短接核心卡下方 12-pin 排针的 `FC REC`（Pin 10）与 `GND`（Pin 9 / 11）后上电 | 请刷标准固件（第 1 节） | [官方开发者套件刷入系统](/flashing-guide/devkit-flashing) |
| **C1901** | 跳线帽短接 12-pin 排针的 `FC REC`（Pin 10）与 `GND`（Pin 9 / 11）后上电 | 请刷标准固件（第 1 节） | [C1901 刷入系统](/flashing-guide/c1901-flashing) |
| **C2401** | 断电按住正面 **`REC` 按钮**上电，或将背面**拨码开关 3** 拨至 `ON` 上电（识别后务必拨回 `OFF`） | 请刷标准固件（第 1 节） | [C2401 刷入系统](/flashing-guide/c2401-flashing) |
| **全系载板升级 JetPack 7（免虚拟机 ISO 法）** | 设备需已具备 JetPack 6.x（`≥ 36.0`）UEFI 固件，通过 U 盘引导写入 NVMe SSD | 视载板供电能力启用 SUPER 档位 | [JetPack 7 刷入系统（Orin Nano / NX）](/flashing-guide/jetpack7-flashing) |

## 5. 刷机后常用配置指引

- **USB 3.2 与设备树配置**：使用 `C1901`、`C1902`、`C1903`（正面 `#6` 10Gbps USB 口）或 `C2401`（30-pin 扩展 USB 口）刷入官方固件后，请参考 [Orin Nano / NX USB 配置](/orin-nano-series/usb-config) 安装匹配核心卡 SKU（`Orin NX 8GB` / `16GB`）与 JetPack 版本的设备树。
- **有线与无线网卡驱动**：`C2401` 板载 RTL8125 2.5G 网口，或在 JetPack 6+ 上使用 Intel AX200 / AX210 无线网卡时，请参考 [网卡驱动](/orin-nano-series/network-driver)。
- **系统状态与功耗模式监控**：参考 [安装 jtop](/orin-nano-series/jtop) 查看实时频率、温升及当前功耗模式（`10W` / `15W` / `25W` / `40W` / `MAXN SUPER`）。
- **故障排查**：如遇 NVMe 未识别、恢复模式无法枚举或启动异常，请查阅 [FAQ 与故障排查](/faq/)。
