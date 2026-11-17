---
title: JetPack 5 GPIO 配置说明（Orin Nano / NX）
outline: deep
---

# JetPack 5 GPIO 配置说明（Orin Nano / NX）

::: info 适用范围说明
本文介绍基于传统 Linux **sysfs** 接口（`/sys/class/gpio`）的命令行 GPIO 控制方法，**仅适用于 JetPack 5.x（L4T R35.x，Ubuntu 20.04）**。

自 JetPack 6 起，NVIDIA 已移除 sysfs GPIO 接口。若您使用的是 **JetPack 6 或 JetPack 7**，请参阅 [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)、[40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header) 或 [GPIO 控制](/orin-nano-series/gpio)。
:::

::: warning 逻辑电平安全警告与载板适用范围
- **3.3V 逻辑电平限制**：Jetson Orin Nano / NX 的所有 GPIO 引脚均为 **3.3V 逻辑电平**。严禁直接接入 5V 信号，也请勿将输出模式下的引脚直接对电源或 `GND` 短接，否则将永久损坏核心卡。
- **载板兼容性**：下文的 40-pin 物理引脚编号适用于 NVIDIA 官方开发者套件、**C1901**、**C1902** 及 **C1902 V2**（注：C1901 V1.0–V1.2 与 C1902 V1.0 的 12 / 35 / 38 / 40 号引脚不可用）。**C1903**（[GH1.25 外设接口](/c1903/c1903#gh1-25-外设接口)）与 **C2401**（[30-pin 扩展排母](/c2401/c2401)）未配备标准 40-pin 排针，请先对照对应产品页确认引脚定义。
:::

## 1. 查询 GPIO 引脚编号与节点名称

### 1.1 40-pin 扩展排针位置图

![Jetson Orin Nano / NX 40-pin 扩展排针引脚定义](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin 扩展排针引脚定义*

### 1.2 常用 GPIO 引脚对照表

40-pin 扩展排针上常用默认 GPIO 引脚的物理引脚号、板面丝印名、sysfs 编号与 Tegra SoC 节点名对照如下：

| 物理引脚号 | 板面丝印名 | sysfs 编号 | SoC 引脚节点名 |
|---|---|---|---|
| 7 | `GPIO09` | `492` | `PAC.06` |
| 15 | `GPIO12` | `433` | `PN.01` |
| 29 | `GPIO01` | `453` | `PQ.05` |
| 31 | `GPIO11` | `454` | `PQ.06` |
| 32 | `GPIO07` | `389` | `PG.06` |
| 33 | `GPIO13` | `391` | `PH.00` |

::: tip 查询全部 GPIO 映射
如需查询其他引脚在当前系统中的 sysfs 编号与节点名，可在 Jetson 开发板终端执行 `sudo cat /sys/kernel/debug/gpio` 查看完整映射列表。
:::

## 2. 使用命令行控制 GPIO

本节以 **31 号物理引脚**（sysfs 编号 `454`，SoC 节点名 `PQ.06`）为例演示输入与输出控制。**以下命令均在 Jetson 开发板终端执行。**

### 2.1 切换 root 会话并导出 GPIO 引脚

由于向 `/sys/class/gpio/*` 重定向写入需要 root 权限（直接在普通用户下执行 `sudo echo ... > /sys/...` 会因输出重定向仍由普通用户 Shell 处理而报权限不足），请先执行 `sudo bash` 进入 root Shell 会话，**并在同一终端会话中继续执行后续 2.2～2.4 节命令**。

在 Jetson 开发板终端执行：

```bash
sudo bash
echo 454 > /sys/class/gpio/export
```

::: info L4T 节点命名机制说明
在 NVIDIA L4T（JetPack 5）内核中，`export` 与 `unexport` 接口**仅接受数字编号**（如 `454`）；导出成功后，内核会自动以 Tegra SoC 端口名创建目录 `/sys/class/gpio/PQ.06`（而非标准 Linux 常见的 `gpio454`），因此后续读写方向与电平时需访问 `/sys/class/gpio/PQ.06/`。
:::

### 2.2 配置为输入模式并读取电平

在已开启的 root Shell 会话中将引脚设为输入模式：

```bash
echo in > /sys/class/gpio/PQ.06/direction
```

读取 GPIO 引脚当前电平状态（返回 `1` 表示 3.3V 高电平，返回 `0` 表示 0V 低电平）：

```bash
cat /sys/class/gpio/PQ.06/value
```

### 2.3 配置为输出模式并驱动电平

在 root Shell 会话中将引脚设为输出模式：

```bash
echo out > /sys/class/gpio/PQ.06/direction
```

设置 GPIO 引脚输出电平（写入 `1` 输出 3.3V 高电平，写入 `0` 输出 0V 低电平）：

```bash
# 输出高电平（3.3V）
echo 1 > /sys/class/gpio/PQ.06/value

# 输出低电平（0V）
echo 0 > /sys/class/gpio/PQ.06/value
```

### 2.4 释放 GPIO 引脚

测试完成后，向 `unexport` 写入数字编号 `454` 释放该 GPIO 引脚，并输入 `exit` 退出 root Shell 会话：

```bash
echo 454 > /sys/class/gpio/unexport
exit
```

## 3. 相关文档

- **Python（`Jetson.GPIO`）与 C 语言（`libgpiod`）编程示例**：[GPIO 控制](/orin-nano-series/gpio)
- **40-pin 引脚功能切换（SPI / I2C / PWM / I2S / GPIO）**：[40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)
- **JetPack 6 及以上版本 GPIO 配置**：[JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)
