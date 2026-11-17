---
title: GPIO 控制
outline: deep
---

# GPIO 控制

本文是 **Jetson Orin Nano / NX 系列 GPIO 编程与控制指南**，涵盖在 JetPack 5 与 JetPack 6+ 系统下通过 **命令行**、**Python（`Jetson.GPIO`）** 及 **C 语言（`libgpiod`）** 控制 GPIO 引脚的完整方法。

GPIO（General-Purpose Input/Output，通用输入/输出）接口可由用户通过软件编程配置为数字输入（读取高低电平）或数字输出（驱动高低电平），常用于按键检测、状态指示、传感器触发及继电器控制等场景。

::: info 相关指南与快速导航
- **40-pin 引脚复用持久化配置（启用 GPIO / SPI / I2C / PWM / I2S）**：[40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)
- **JetPack 6+ PADCTL 寄存器对照表与命令行速查**：[JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)
- **JetPack 5 sysfs 引脚编号对照表与命令行速查**：[JetPack 5 GPIO 配置说明](/gpio-tutorial/jetpack5-gpio)
- **量产固件固化 Pinmux BCT 与设备树**：[Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)
:::

::: warning 逻辑电平安全与载板适用范围
- **3.3V 逻辑电平限制**：Jetson Orin Nano / NX 的所有 GPIO 引脚均为 **3.3V 逻辑电平**。严禁直接输入 5V 信号，也切勿将处于输出模式的引脚直接对电源或 `GND` 短接，否则会永久损坏核心卡。
- **各载板接口形态差异**：
  - **C1902 V2 / C1902（V1.1+）/ C1901（V1.3+）/ 官方开发者套件**：提供完整标准 **40-pin** 扩展排针，可直接使用下文物理引脚编号（注：早期 **C1901 V1.0–V1.2** 与 **C1902 V1.0** 的 12 / 35 / 38 / 40 号引脚不可用）。
  - **C1903**：未配备 40-pin 排针，通过 **GH1.25 连接器**引出 GPIO，引脚定义详见 [C1903 产品介绍 — GH1.25 外设接口](/c1903/c1903#gh1-25-外设接口)。
  - **C2401**：未配备 40-pin 排针，通过 **30-pin 扩展排母**引出 GPIO，引脚定义详见 [C2401 产品介绍](/c2401/c2401)。
:::

标准 40-pin 扩展排针引脚定义如下：

![Jetson Orin Nano / NX 40-pin 扩展排针引脚定义](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin 扩展排针引脚定义*

## 1. 在 JetPack 5 系统中使用 GPIO

JetPack 5.x（L4T R35.x，Ubuntu 20.04）同时支持传统 `/sys/class/gpio`（sysfs）、Python `Jetson.GPIO` 以及 C 语言 `libgpiod` v1 接口。下文均在 **Jetson 开发板终端**中执行，并以 **31 号物理引脚**（sysfs 编号 `454`，SoC 节点名 `PQ.06`，`gpiochip0` 行号 `106`）为例。

### 1.1 使用命令行控制 GPIO（sysfs）

更多引脚的 sysfs 编号对照表见 [JetPack 5 GPIO 配置说明](/gpio-tutorial/jetpack5-gpio)。

先在 Jetson 开发板终端切换至 root Shell 会话并导出 `454` 号引脚（L4T 内核导出 `454` 后会自动生成 `/sys/class/gpio/PQ.06` 目录）：

```bash
sudo bash
echo 454 > /sys/class/gpio/export
```

在同一 root Shell 会话中设置输入模式并读取电平（`1` = 3.3V 高电平，`0` = 0V 低电平）：

```bash
echo in > /sys/class/gpio/PQ.06/direction
cat /sys/class/gpio/PQ.06/value
```

切换为输出模式并设置输出电平，使用完毕后通过 `454` 释放引脚：

```bash
echo out > /sys/class/gpio/PQ.06/direction
echo 1 > /sys/class/gpio/PQ.06/value  # 输出高电平（3.3V）
echo 0 > /sys/class/gpio/PQ.06/value  # 输出低电平（0V）

# 测试结束后释放引脚并退出 root 会话
echo 454 > /sys/class/gpio/unexport
exit
```

完整的周期翻转测试脚本（保存为 `blink_sysfs.sh`，通过 `sudo bash blink_sysfs.sh` 运行，按 `Ctrl+C` 停止并自动释放）：

```bash
#!/bin/bash
GPIO_NUM=454
GPIO_NODE="/sys/class/gpio/PQ.06"

trap 'echo "$GPIO_NUM" > /sys/class/gpio/unexport 2>/dev/null; echo "GPIO PQ.06 (454) is released"' EXIT

echo "Setting up GPIO PQ.06 (sysfs $GPIO_NUM)"
if [ ! -d "$GPIO_NODE" ]; then
    echo "$GPIO_NUM" > /sys/class/gpio/export
fi
echo out > "$GPIO_NODE/direction"

while true; do
    echo 0 > "$GPIO_NODE/value"
    sleep 0.5
    cat "$GPIO_NODE/value"
    sleep 0.5
    echo 1 > "$GPIO_NODE/value"
    sleep 0.5
    cat "$GPIO_NODE/value"
    sleep 0.5
done
```

### 1.2 使用 Python 控制 GPIO（Jetson.GPIO）

在 Jetson 开发板终端安装官方 `Jetson.GPIO` 库：

```bash
sudo apt update
sudo apt install -y python3-jetson-gpio
```

`Jetson.GPIO` 提供四种引脚编号模式：

| 编号模式 | 说明 |
|---|---|
| `GPIO.BOARD` | 40-pin 扩展排针的物理引脚编号（如 `31`） |
| `GPIO.BCM` | 兼容树莓派的 Broadcom SoC GPIO 编号 |
| `GPIO.CVM` | CVM / CVB 连接器信号名称 |
| `GPIO.TEGRA_SOC` | Tegra SoC 信号名称 |

将以下示例保存为 `gpio_blink.py`（推荐使用原生模块名 `import Jetson.GPIO as GPIO`）：

```python
import time
import Jetson.GPIO as GPIO

output_pin = 31  # 40-pin 物理引脚号（BOARD 模式）

GPIO.setmode(GPIO.BOARD)
GPIO.setup(output_pin, GPIO.OUT, initial=GPIO.HIGH)

print("Blinking Pin 31... Press Ctrl+C to exit")
curr_value = GPIO.HIGH
try:
    while True:
        time.sleep(1)
        print(f"Pin {output_pin} output -> {curr_value}")
        GPIO.output(output_pin, curr_value)
        curr_value ^= GPIO.HIGH
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
```

在 Jetson 开发板终端运行脚本：

```bash
sudo python3 gpio_blink.py
```

::: tip 兼容性与免 sudo 权限说明
- 若从树莓派迁移旧代码，`Jetson.GPIO` 同样兼容 `import RPi.GPIO as GPIO` 别名，但新项目建议统一使用 `import Jetson.GPIO as GPIO`。
- 更多中断检测、PWM 等 API 用法请参阅 [NVIDIA jetson-gpio 官方仓库](https://github.com/NVIDIA/jetson-gpio)。
:::

### 1.3 使用 C 语言控制 GPIO（libgpiod）

在 Jetson 开发板终端安装 C 编译工具链与 `libgpiod-dev` 开发库：

```bash
sudo apt update
sudo apt install -y build-essential libgpiod-dev
```

以 `gpiochip0` 的 **line 106**（即 40-pin 排针上的 31 号脚 `PQ.06`）为例，创建 `gpio_out.c`，完整演示打开控制器、获取引脚行、申请输出模式、循环翻转电平及释放资源的流程：

```c
#include <gpiod.h>
#include <stdio.h>
#include <unistd.h>

#define GPIO_CHIP_NAME "gpiochip0"
#define GPIO_LINE_OFFSET 106  /* Pin 31 (PQ.06) on gpiochip0 */

int main(void) {
    struct gpiod_chip *chip = NULL;
    struct gpiod_line *line = NULL;
    int val = 0;

    chip = gpiod_chip_open_by_name(GPIO_CHIP_NAME);
    if (!chip) {
        perror("gpiod_chip_open_by_name failed");
        return 1;
    }

    line = gpiod_chip_get_line(chip, GPIO_LINE_OFFSET);
    if (!line) {
        perror("gpiod_chip_get_line failed");
        gpiod_chip_close(chip);
        return 1;
    }

    if (gpiod_line_request_output(line, "gpio_out", 0) < 0) {
        perror("gpiod_line_request_output failed");
        gpiod_chip_close(chip);
        return 1;
    }

    for (int i = 0; i < 10; i++) {
        val = !val;
        if (gpiod_line_set_value(line, val) < 0) {
            perror("gpiod_line_set_value failed");
            break;
        }
        printf("Pin 31 (PQ.06, line %u) -> %d\n", GPIO_LINE_OFFSET, val);
        sleep(1);
    }

    gpiod_line_release(line);
    gpiod_chip_close(chip);
    return 0;
}
```

在 Jetson 开发板终端编译并运行：

```bash
gcc gpio_out.c -lgpiod -o gpio_out
sudo ./gpio_out
```

## 2. 在 JetPack 6 系统中使用 GPIO

::: info JetPack 6+ 架构变化说明
在 JetPack 6（L4T R36.x，Ubuntu 22.04）及更高版本中，NVIDIA 已移除传统的 `/sys/class/gpio`（sysfs）接口，且多数 40-pin 引脚上电默认为 `unused` 或输入高阻状态。使用前需先通过 [Jetson-IO](/orin-nano-series/expansion-header)（持久化）或 `busybox devmem`（临时调试）配置引脚复用方向，再通过 **`libgpiod`** 或 **`Jetson.GPIO`** 控制引脚。
:::

### 2.1 使用命令行控制 GPIO（libgpiod）

在 Jetson 开发板终端安装 `busybox`（提供 `devmem`）与 `gpiod`（提供 `gpioinfo`、`gpiofind`、`gpioget`、`gpioset` 工具）：

```bash
sudo apt update
sudo apt install -y busybox gpiod
```

验证安装并查看系统识别到的全部 GPIO 控制器与引脚名称：

```bash
gpioinfo
```

::: warning `devmem` 临时修改提示
以下 `busybox devmem` 直接修改物理寄存器仅在**当前开机周期内有效，重启后即失效**。各引脚寄存器地址与位定义速查表详见 [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)；如需重启后持久生效，请使用 [40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header) 或 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。
:::

**读取输入状态**（以 31 号脚 `PQ.06`，PADCTL 地址 `0x02430070` 为例，写入 `0x58` 设为 GPIO 输入 + 内部上拉）：

```bash
sudo busybox devmem 0x02430070 w 0x58
gpioget $(gpiofind "PQ.06")
```

**配置输出模式并保持输出电平**（写入 `0x00` 设为 GPIO 推挽输出 + 无上下拉，`--mode=wait` 会在前台阻塞以维持输出电平，按 `Enter` 或 `Ctrl+C` 结束）：

```bash
# 将 Pin 31 (PQ.06) 设为 GPIO 输出模式
sudo busybox devmem 0x02430070 w 0x00

# 输出高电平（3.3V）并保持
gpioset --mode=wait $(gpiofind "PQ.06")=1

# 输出低电平（0V）并保持
gpioset --mode=wait $(gpiofind "PQ.06")=0
```

::: info JetPack 7（Ubuntu 24.04）命令差异
JetPack 7 升级至 `libgpiod` v2，移除了 `gpiofind` 与 `--mode=wait` 参数（默认持续保持电平），请改用 `gpioset -c gpiochip0 PQ.06=1` 与 `gpioget --numeric -c gpiochip0 PQ.06`。
:::

### 2.2 使用 Python 控制 GPIO（Jetson.GPIO）

在 JetPack 6 中，先确保目标引脚已通过 [Jetson-IO](/orin-nano-series/expansion-header) 配置为 GPIO，或临时通过寄存器开启输出模式：

```bash
sudo busybox devmem 0x02430070 w 0x00
```

通过标准包管理器安装或升级 `Jetson.GPIO`（切勿使用 `sudo rm -rf` 直接删除系统 `dist-packages` 目录，以免破坏 `dpkg` 包管理数据库）：

```bash
# 推荐：直接安装或升级官方 apt 软件包
sudo apt update
sudo apt install -y python3-jetson-gpio
```

若需要从 PyPI 安装最新上游版本，请先通过 `apt` 干净卸载系统包，再在 Python 虚拟环境中安装：

```bash
sudo apt remove -y python3-jetson-gpio
python3 -m venv ~/venvs/gpio
source ~/venvs/gpio/bin/activate
python -m pip install --upgrade Jetson.GPIO
```

Python 控制代码与「1.2 使用 Python 控制 GPIO（Jetson.GPIO）」完全相同（使用 `import Jetson.GPIO as GPIO`）。

### 2.3 使用 C 语言控制 GPIO（libgpiod）

先确认目标引脚已设为 GPIO 输出模式（使用 [Jetson-IO](/orin-nano-series/expansion-header) 或执行临时寄存器命令），并安装 `libgpiod-dev` 开发包：

```bash
sudo busybox devmem 0x02430070 w 0x00
sudo apt update
sudo apt install -y build-essential libgpiod-dev
```

通过 `gpioinfo` 查询目标引脚所在的控制器与行号（例如 `PQ.06` 位于 `gpiochip0` 的 `line 106`）：

```bash
gpioinfo | grep "PQ.06"
```

随后直接使用「1.3 使用 C 语言控制 GPIO（libgpiod）」中的完整 `gpio_out.c` 源码编译并运行：

```bash
gcc gpio_out.c -lgpiod -o gpio_out
sudo ./gpio_out
```

::: info JetPack 7（Ubuntu 24.04）C API 版本说明
上述 `gpio_out.c` 基于 JetPack 5 / JetPack 6 搭载的 **`libgpiod` v1.x** C API（`gpiod_chip_open_by_name` / `gpiod_chip_get_line`）。JetPack 7（Ubuntu 24.04）将 `libgpiod-dev` 升级到了 **v2.x**，C 接口改为 `gpiod_chip_open("/dev/gpiochip0")` 配合 `gpiod_line_settings` 与 `gpiod_chip_request_lines` 请求句柄。
:::

## 3. 相关文档

- [40-pin 扩展头配置（Jetson-IO）](/orin-nano-series/expansion-header)：通过菜单或命令行持久化切换 40-pin 引脚的 GPIO / SFIO 功能。
- [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)：Orin Nano / NX 完整 PADCTL 基地址、引脚偏移量对照表与寄存器调试步骤。
- [JetPack 5 GPIO 配置说明](/gpio-tutorial/jetpack5-gpio)：JetPack 5 系统下 sysfs 引脚编号对照表与命令行操作说明。
- [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)：量产镜像的 Pinmux 电子表格、MB1 BCT 与设备树叠加层开发指南。
