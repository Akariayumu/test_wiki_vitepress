---
title: JetPack 6 GPIO 配置说明（Orin Nano / NX）
outline: deep
---

# JetPack 6 GPIO 配置说明（Orin Nano / NX）

::: info 适用范围说明
自 JetPack 6.x（L4T R36.x，Ubuntu 22.04）起，NVIDIA 移除了传统的 `/sys/class/gpio`（sysfs）接口，改为通过 Linux 标准字符设备框架 **`libgpiod`** 管理 GPIO（若仍使用 JetPack 5.x，请参阅 [JetPack 5 GPIO 配置说明](/gpio-tutorial/jetpack5-gpio)）。

本文介绍在开发调试阶段通过 `busybox devmem` 在线修改 PADCTL 寄存器，并配合 `gpiod` 命令行工具读写引脚电平的方法。
:::

::: warning 非持久化修改与电气安全警告
- **重启后失效（非持久化）**：通过 `busybox devmem` 直接修改物理寄存器**仅在当前开机周期内有效，系统重启后会恢复为设备树默认状态**。如需持久化保存配置，开发阶段请使用 [40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)，量产固件请按 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree) 生成 Pinmux BCT 并随固件烧录。
- **核对物理寄存器地址**：执行 `devmem` 前请务必核对核心卡型号（Orin Nano / NX，T234）与目标引脚的 8 位十六进制物理地址，切勿向未确认的地址写入数据，以免引发外设异常或系统死机。
- **3.3V 逻辑电平与载板兼容性**：所有 GPIO 引脚均为 **3.3V 逻辑电平**，严禁直接接入 5V 信号或将输出脚短路。下文 40-pin 物理引脚号适用于官方套件、**C1901**、**C1902** 及 **C1902 V2**（注：C1901 V1.0–V1.2 与 C1902 V1.0 的 12 / 35 / 38 / 40 号引脚不可用；**C1903** 与 **C2401** 请分别参阅 [C1903 GH1.25 外设接口](/c1903/c1903#gh1-25-外设接口) 与 [C2401 产品介绍](/c2401/c2401)）。
:::

## 1. 查询 GPIO 引脚与 PADCTL 寄存器地址

### 1.1 40-pin 扩展排针位置图

![Jetson Orin Nano / NX 40-pin 扩展排针引脚定义](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin 扩展排针引脚定义*

### 1.2 PADCTL 基地址与常用引脚寄存器对照表

Tegra234（Orin Nano / NX）相关 PADCTL 控制器组基地址如下：

| PADCTL 控制器组 | 基地址 |
|---|---|
| `PADCTL_A0 (PADCTL_G3)` | `0x02430000` |
| `PADCTL_A4 (PADCTL_G4)` | `0x02434000` |
| `PADCTL_A16 (PADCTL_EDP)` | `0x02440000` |
| `PADCTL_A24 (PADCTL_G7)` | `0x02448000` |

40-pin 扩展排针上常用 GPIO 引脚的 PADCTL 偏移量与完整物理寄存器地址对照如下：

| 物理引脚号 | 板面丝印名 | PADCTL 寄存器名 | 偏移量 | GPIO 编号（参考） | GPIO 名称 | 寄存器物理地址 |
|---|---|---|---|---|---|---|
| 7 | `GPIO09` | `PADCTL_G7_SOC_GPIO59_0` | `0x30` | `gpio-492` | `PAC.06` | `0x02448030` |
| 15 | `GPIO12` | `PADCTL_EDP_SOC_GPIO39_0` | `0x20` | `gpio-433` | `PN.01` | `0x02440020` |
| 29 | `GPIO01` | `PADCTL_G3_SOC_GPIO32_0` | `0x68` | `gpio-453` | `PQ.05` | `0x02430068` |
| 31 | `GPIO11` | `PADCTL_G3_SOC_GPIO33_0` | `0x70` | `gpio-454` | `PQ.06` | `0x02430070` |
| 32 | `GPIO07` | `PADCTL_G4_SOC_GPIO19_0` | `0x80` | `gpio-389` | `PG.06` | `0x02434080` |
| 33 | `GPIO13` | `PADCTL_G4_SOC_GPIO21_0` | `0x40` | `gpio-391` | `PH.00` | `0x02434040` |

::: info PADCTL 寄存器关键位定义速查
- **`Bit 10 (GPIO_SF_SEL)`**：`0` = 普通 GPIO 模式，`1` = SFIO 特殊功能复用模式。
- **`Bit 6 (E_INPUT)`**：`1`（`0x40`）= 开启输入接收缓冲，`0` = 关闭输入缓冲。
- **`Bit 4 (TRISTATE)`**：`1`（`0x10`）= 三态高阻（关闭输出驱动，用于输入），`0` = 使能推挽输出驱动。
- **`Bit [3:2] (PUPD)`**：`00`（`0x00`）= 无上下拉，`01`（`0x04`）= 内部下拉，`10`（`0x08`）= 内部上拉。
:::

### 1.3 官方技术参考

更多引脚的 PADCTL 基地址与偏移量计算规则可参阅 NVIDIA 官方开发指南：[Jetson Orin NX and Nano Series — Changing the Pinmux](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html#changing-the-pinmux)。

## 2. 使用命令行控制 GPIO

本节以 **31 号物理引脚**（寄存器地址 `0x02430070`，GPIO 名称 `PQ.06`）为例。**以下命令均在 Jetson 开发板终端执行。**

### 2.1 安装 busybox 与 gpiod 工具包

在 Jetson 开发板终端执行以下命令安装 `busybox`（提供 `devmem`）与 `gpiod`（提供 `gpioinfo`、`gpiofind`、`gpioget`、`gpioset` 等命令行工具；注意不要误装为仅含动态库的 `libgpiod2`）：

```bash
sudo apt update
sudo apt install -y busybox gpiod
```

### 2.2 确认寄存器地址与 GPIO 名称

以 31 号引脚为例，由「1.2 PADCTL 基地址与常用引脚寄存器对照表」查得其物理寄存器地址为 `0x02430070`，引脚名称为 `PQ.06`。可执行以下命令核对内核识别到的控制器与行号：

```bash
gpioinfo | grep "PQ.06"
```

### 2.3 配置为输入模式并读取电平

将 `0x02430070` 寄存器写入 `0x58`（即 `0x40 | 0x10 | 0x08`：GPIO 模式 + 开启输入缓冲 + 三态高阻 + 内部上拉），将引脚设为输入模式：

```bash
sudo busybox devmem 0x02430070 w 0x58
```

读取 GPIO 引脚当前电平状态（返回 `1` 表示 3.3V 高电平，返回 `0` 表示 0V 低电平；若报权限不足请在命令前加 `sudo`）：

```bash
gpioget $(gpiofind "PQ.06")
```

### 2.4 配置为输出模式并驱动电平

将 `0x02430070` 寄存器写入 `0x00`（GPIO 模式 + 使能输出驱动 + 关闭输入缓冲 + 无上下拉；如需开启内部下拉也可写 `0x04`），将引脚设为推挽输出模式：

```bash
sudo busybox devmem 0x02430070 w 0x00
```

使用 `gpioset` 驱动引脚输出电平（`1` 为 3.3V 高电平，`0` 为 0V 低电平；若报权限不足请在命令前加 `sudo`）：

```bash
# 输出高电平（3.3V）并保持
gpioset --mode=wait $(gpiofind "PQ.06")=1

# 输出低电平（0V）并保持
gpioset --mode=wait $(gpiofind "PQ.06")=0
```

::: tip 关于 `--mode=wait` 前台阻塞保持行为
在 `libgpiod` 机制下，一旦进程退出并关闭字符设备句柄，内核便会释放该 GPIO 引脚，输出电平可能不再被主动维持。因此加上 `--mode=wait` 后，`gpioset` 会**故意在前台阻塞挂起（不返回命令提示符）以持续维持输出电平**，此时外部电路可稳定测得 3.3V 或 0V；按下 **`Enter`** 或 **`Ctrl+C`** 即可结束保持并退出命令。
:::

::: info JetPack 7（Ubuntu 24.04）命令语法说明
JetPack 7 系统中的 `gpiod` 升级为 **`libgpiod` v2**，移除了 `gpiofind` 工具与 `--mode=wait` 参数（`gpioset` 默认持续保持电平，直至按下 `Ctrl+C`）。在 JetPack 7 上请改用以下语法：

```bash
# JetPack 7 (libgpiod v2) 输出高电平并保持
gpioset -c gpiochip0 PQ.06=1

# JetPack 7 (libgpiod v2) 读取输入电平（加 --numeric 返回 1 或 0）
gpioget --numeric -c gpiochip0 PQ.06
```
:::

## 3. 相关文档

- **Python（`Jetson.GPIO`）与 C 语言（`libgpiod`）完整编程示例**：[GPIO 控制](/orin-nano-series/gpio)
- **开发阶段持久化配置 40-pin 引脚功能**：[40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)
- **量产固件固化 Pinmux 与设备树流程**：[Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)
