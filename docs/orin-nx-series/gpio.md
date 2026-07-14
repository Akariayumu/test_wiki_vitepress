---
title: GPIO 控制
---

# GPIO 控制

GPIO（General-purpose input/output）是一种通用型输入输出接口，其脚位可由使用者编程控制，可设置为输入（GPI）、输出（GPO）或双向（GPIO）。

## 1. JetPack 5 系统中使用 GPIO

### 1.1 使用命令行控制 GPIO

以 31 号引脚为例（GPIO 编号 454，引脚名称 PQ.06）：

**提升至 root 权限，启用 GPIO：**

```bash
sudo bash
echo 454 > /sys/class/gpio/export
```

**设置 GPIO 为输入模式：**
```bash
echo in > /sys/class/gpio/PQ.06/direction
```

**获取 GPIO 当前状态（1=高电平, 0=低电平）：**
```bash
cat /sys/class/gpio/PQ.06/value
```

**设置 GPIO 为输出模式：**
```bash
echo out > /sys/class/gpio/PQ.06/direction
```

**设置输出电平：**
```bash
echo 1 > /sys/class/gpio/PQ.06/value  # 高电平
echo 0 > /sys/class/gpio/PQ.06/value  # 低电平
```

**闪烁测试脚本：**

```bash
#!/bin/bash
trap 'echo PQ.06 > /sys/class/gpio/unexport; echo "GPIO PQ.06 is released"' EXIT

echo "setting GPIO PQ.06"
echo PQ.06 > /sys/class/gpio/export 2>/dev/null
echo out > /sys/class/gpio/PQ.06/direction

while true; do
    echo 0 > /sys/class/gpio/PQ.06/value
    sleep 0.5
    cat /sys/class/gpio/PQ.06/value
    sleep 0.5
    echo 1 > /sys/class/gpio/PQ.06/value
    sleep 0.5
    cat /sys/class/gpio/PQ.06/value
    sleep 0.5
done
```

### 1.2 使用 Python 控制 GPIO

安装 Jetson.GPIO 库：

```bash
pip install Jetson.GPIO
```

Jetson GPIO 库提供四种引脚编号模式：

| 模式 | 说明 |
|------|------|
| `BOARD` | 物理引脚编号（40针接口顺序） |
| `BCM` | Broadcom SoC GPIO 编号 |
| `CVM` | CVM/CVB 连接器信号名称 |
| `TEGRA_SOC` | Tegra SoC 信号名称 |

**示例代码：**

```python
import time
import RPi.GPIO as GPIO

output_pin = 31  # BOARD mode

GPIO.setmode(GPIO.BOARD)
GPIO.setup(output_pin, GPIO.OUT)

print("Press CTRL+C to exit")
curr_value = GPIO.HIGH
try:
    while True:
        time.sleep(1)
        print("pin {} now is {}".format(output_pin, curr_value))
        GPIO.output(output_pin, curr_value)
        curr_value ^= GPIO.HIGH  # blink
finally:
    GPIO.cleanup()
```

> 更多用法参考 [项目官网](https://github.com/NVIDIA/jetson-gpio)

### 1.3 使用 C/C++ 控制 GPIO

安装 `libgpiod-dev`：

```bash
sudo apt install libgpiod-dev
```

**参考例程：**

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <gpiod.h>

#define GPIO_CHIP   "/dev/gpiochip0"
#define GPIO_LED    3

int main() {
    struct gpiod_chip *gpiochip = gpiod_chip_open(GPIO_CHIP);
    struct gpiod_line *gpioline = gpiod_chip_get_line(gpiochip, GPIO_LED);

    // Set gpio direction...
    gpiod_chip_close(gpiochip);
    return 0;
}
```

编译运行：

```bash
g++ test_gpio.cc -o test_gpio -lgpiod
./test_gpio
```

---

## 2. JetPack 6 系统中使用 GPIO

> 在 JetPack 6.2/r36.4.3 中，NVIDIA 已移除传统的 sysfs GPIO 接口（`/sys/class/gpio`），推荐使用 Linux 统一的 **libgpiod** 管理 GPIO。

### 2.1 使用 libgpiod 控制 GPIO

安装前置软件包：

```bash
sudo apt-get install busybox automake autoconf libtool
```

验证安装：

```bash
gpioinfo
```

**读取 GPIO 状态：**

```bash
gpioget $(gpiofind "PQ.06")
```

**将 GPIO 设置为输出模式（运行时 pinmux）：**

```bash
sudo busybox devmem 0x2430070 w 0x004
```

> 各引脚寄存器地址可查询 [NVIDIA 官方文档](https://docs.nvidia.com/jetson/)

**保持高电平：**

```bash
gpioset --mode=wait `gpiofind "PQ.06"`=1
```

**保持低电平：**

```bash
gpioset --mode=wait `gpiofind "PQ.06"`=0
```

### 2.2 使用 Python 控制 GPIO

在 JetPack 6 中需先修改寄存器以更改引脚 GPIO 模式：

```bash
sudo busybox devmem 0x2430070 w 0x004
```

安装/重装 Jetson.GPIO：

```bash
sudo rm -rf /usr/lib/python3*/dist-packages/Jetson
sudo rm -rf /usr/local/lib/python3*/dist-packages/Jetson
git clone https://github.com/NVIDIA/jetson-gpio.git
cd jetson-gpio
sudo pip3 install .
```

Python API 与 JetPack 5 相同，参考 1.2 节。

### 2.3 使用 C/C++ 控制 GPIO

先设置 pinmux：

```bash
sudo busybox devmem 0x2430070 w 0x004
```

```bash
sudo apt install libgpiod-dev
```

代码与 JetPack 5 相同，GPIO line 编号需从 `gpioinfo` 查询对应的 line 号（如 PQ.06 = line 106）。

---

## 引脚定义参考

详见 [Orin Nano/NX GPIO 教程](/gpio-tutorial/jetpack6-gpio) 获取完整引脚映射和 PADCTL 寄存器地址。
