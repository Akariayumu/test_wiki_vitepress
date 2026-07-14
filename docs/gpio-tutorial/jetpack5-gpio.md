---
title: Orin Nano&NX JetPack5 GPIO教程
---

# Orin Nano&NX JetPack5 GPIO教程

## 1. 获取 GPIO 口的引脚名称与编号

### 1.1 GPIO 口位置图

![Jetson Orin Nano Expansion Header J12 Pinout](/img/wiki-j12-pinout.jpeg)

### 1.2 GPIO 口的引脚名称与编号

各引脚对应的编号与名称（引脚号 / GPIO / 编号 / 引脚名）：

```text
7号  GPIO09 492 PAC.06
15号 GPIO12 433 PN.01
29号 GPIO01 453 PQ.05
31号 GPIO11 454 PQ.06
32号 GPIO07 389 PG.06
33号 GPIO13 391 PH.00
```

## 2. 使用命令行控制 GPIO

### 2.1 获取 GPIO 口的引脚名称与编号

以 31 号引脚为例，`454` 为 GPIO 口编号，`PQ.06` 为引脚名称。

具体值请通过上一节「1.2 GPIO 口的引脚名称与编号」查询。

### 2.2 提升至 root 权限，启用 GPIO 口

```bash
sudo bash
echo 454 > /sys/class/gpio/export
```

### 2.3 设置 GPIO 为输入模式

```bash
echo in > /sys/class/gpio/PQ.06/direction
```

获取 GPIO 当前状态，返回值 1 为高电平，0 为低电平：

```bash
cat /sys/class/gpio/PQ.06/value
```

### 2.4 设置 GPIO 为输出模式

```bash
echo out > /sys/class/gpio/PQ.06/direction
```

设置 GPIO 输出，1 为高电平，0 为低电平：

```bash
echo 1 > /sys/class/gpio/PQ.06/value
```
