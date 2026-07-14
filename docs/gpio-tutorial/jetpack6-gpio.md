---
title: Orin Nano&NX JetPack6 GPIO教程
---

# Orin Nano&NX JetPack6 GPIO教程

## 1. 获取 GPIO 口的寄存器地址

### 1.1 GPIO 口位置图

![Jetson Orin Nano Expansion Header J12 Pinout](/img/wiki-j12-pinout.jpeg)

### 1.2 PADCTL 基地址与 GPIO 口偏移量

PADCTL 基地址：

```text
PADCTL_A0(PADCTL_G3)    0x02430000
PADCTL_A4(PADCTL_G4)    0x02434000
PADCTL_A16(PADCTL_EDP)  0x02440000
PADCTL_A24(PADCTL_G7)   0x02448000
```

各引脚对应的寄存器地址（引脚号 / GPIO / PADCTL 名称 / 偏移量 / gpio 编号 / 引脚名 / 寄存器地址）：

```text
7号  GPIO09 PADCTL_G7_SOC_GPIO59_0  0x30 gpio-492 PAC.06 0x02448030
15号 GPIO12 PADCTL_EDP_SOC_GPIO39_0 0x20 gpio-433 PN.01  0x02440020
29号 GPIO01 PADCTL_G3_SOC_GPIO32_0  0x68 gpio-453 PQ.05  0x02430068
31号 GPIO11 PADCTL_G3_SOC_GPIO33_0  0x70 gpio-454 PQ.06  0x02430070
32号 GPIO07 PADCTL_G4_SOC_GPIO19_0  0x80 gpio-389 PG.06  0x02434080
33号 GPIO13 PADCTL_G4_SOC_GPIO21_0  0x40 gpio-391 PH.00  0x02434040
```

### 1.3 （可选）参考官方教程

[NVIDIA Jetson Orin NX/Nano Series — Changing the Pinmux](https://docs.nvidia.com/jetson/archives/r36.4.3/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html#changing-the-pinmux)

## 2. 使用命令行控制 GPIO

### 2.1 安装 busybox 与 libgpiod2

```bash
sudo apt install busybox libgpiod2
```

### 2.2 获取寄存器地址与 GPIO 名称

以 31 号引脚为例，`0x02430070` 为寄存器地址，`PQ.06` 为 GPIO 名称。

具体值请通过上一节「1.2 PADCTL 基地址与 GPIO 口偏移量」查询。

### 2.3 设置 GPIO 为输入模式

上电默认为输入模式，也可以通过命令行再次设置为输入模式：

```bash
sudo busybox devmem 0x02430070 w 0x58
```

获取 GPIO 当前状态，返回值 1 为高电平，0 为低电平：

```bash
gpioget $(gpiofind "PQ.06")
```

### 2.4 设置 GPIO 为输出模式

通过命令行设置为输出模式：

```bash
sudo busybox devmem 0x02430070 w 0x0
```

设置 GPIO 输出，1 为高电平，0 为低电平：

```bash
gpioset --mode=wait $(gpiofind "PQ.06")=1
```
