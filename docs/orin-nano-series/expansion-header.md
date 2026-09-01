---
title: 40-pin 扩展头配置 (Jetson-IO)
---

# 40-pin 扩展头配置（Jetson-IO）

Jetson Orin Nano / NX 的 40-pin 扩展头上，大部分引脚既可以当普通 **GPIO**，也可以配置为 **SFIO**（特殊功能 IO，如 I2C / SPI / UART / PWM / I2S）。

引脚配置（pinmux）在刷机时静态写入设备。要直接修改，需要改动官方 pinmux 表格并重新烧录——这适合量产，但开发阶段非常不便。因此 NVIDIA 提供了 **Jetson Expansion Header Tool（Jetson-IO）**：一个运行在设备上的 Python 工具，通过图形界面修改引脚配置，原理是生成新的设备树（DTB / DTBO）并在重启后生效。

## 默认引脚功能

![Jetson Orin Nano 40PIN GPIO 引脚定义](/img/wiki-j12-pinout.jpeg)

默认状态下各功能占用的引脚（物理引脚号）：

| 功能 | 引脚 |
|------|------|
| I2C1 | 3 (SDA) / 5 (SCL) |
| I2C2 | 27 (SDA) / 28 (SCL) |
| UART1 | 8 (TX) / 10 (RX) |
| SPI1 | 19 (MOSI) / 21 (MISO) / 23 (SCK) / 24 (CS0) / 26 (CS1) |
| I2S | 12 / 35 / 38 / 40 |
| PWM | 32 / 33 |
| 其余 | 默认 GPIO |

> 具体每个引脚当前是 GPIO 还是 SFIO，以下文 `config-by-pin.py` 的查询结果为准。

## 图形界面：jetson-io.py

在设备上执行：

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

### 主界面（选择接头）

启动后显示主界面，列出本设备支持的扩展接头（40-pin Header、CSI 接头、M.2 Key E 等）。选择 **Configure 40-pin Header** 进入接头界面。

### 接头界面

接头界面显示当前配置，并提供两个选项：

- **Configure for compatible hardware**：从官方预置的硬件模块（如某些音频子卡）配置列表中选择，自动启用所需功能。
- **Configure header pins manually**：手动指定要启用哪些功能（最常用）。

### 手动配置引脚功能

手动配置界面列出该接头支持的所有特殊功能，括号内标注对应引脚：

- 用 ↑ / ↓ 方向键移动，**回车或空格**切换某个功能的启用状态；未启用的功能对应引脚即作为 GPIO 使用。
- 选好后选 **Back** 返回，再选 **Save pin changes** 保存。
- 也可以选 **Export as Device-Tree Overlay**，把当前配置导出为 DTBO 文件（保存在 `/boot/`，供量产或自定义镜像复用）。

### 保存并生效

回到主界面后：

- **Save and reboot to reconfigure pins**：生成新 DTB、更新 `/boot/extlinux/extlinux.conf` 并立即重启。
- **Save and exit without rebooting**：只写入配置，稍后自行重启生效。
- **Discard all pin changes**：放弃全部修改。

:::tip 多配置共存
Jetson-IO 会保留所有已保存的配置。保存过多个配置后，每次开机会出现启动菜单，可选择任意一份历史配置启动。
:::

## 命令行工具

不想进菜单时，可以用三个等效的命令行工具（同样需要 sudo）。

### 查询当前配置：config-by-pin.py

```bash
# 列出支持的接头及编号
sudo /opt/nvidia/jetson-io/config-by-pin.py -l

# 查看整个 40-pin 接头（默认 header 1）的逐引脚配置
sudo /opt/nvidia/jetson-io/config-by-pin.py

# 查看单个引脚（如 7 号脚）
sudo /opt/nvidia/jetson-io/config-by-pin.py -p 7
```

### 按功能配置：config-by-function.py

```bash
# 列出全部可配置功能 / 当前已启用的功能
sudo /opt/nvidia/jetson-io/config-by-function.py -l all
sudo /opt/nvidia/jetson-io/config-by-function.py -l enabled

# 启用功能并生成新 DTB（写入启动项）
sudo /opt/nvidia/jetson-io/config-by-function.py -o dt spi1

# 同时启用多个功能
sudo /opt/nvidia/jetson-io/config-by-function.py -o dt 1="i2s2 spi1"

# 只导出 DTBO 叠加层（不改启动项）
sudo /opt/nvidia/jetson-io/config-by-function.py -o dtbo spi1
```

### 按硬件模块配置：config-by-hardware.py

```bash
# 列出预置的硬件模块配置
sudo /opt/nvidia/jetson-io/config-by-hardware.py -l

# 应用某个模块的配置（示例为官方文档所用模块名）
sudo /opt/nvidia/jetson-io/config-by-hardware.py -n "Adafruit SPH0645LM4H"
```

:::warning 两个限制（官方说明）
- `config-by-hardware.py` 和 `config-by-function.py` **不能混用**（一次配置会话里只能选一种方式）；两者都要配时请改用 `jetson-io.py`。
- 重启后再运行 Jetson-IO，上一次会话中的硬件模块（hardware module）选择不会被保留，需重新选择。
:::

## 配置为 GPIO 后如何使用

引脚设为 GPIO 模式后，用 gpiod 操作（JetPack 6 已移除 sysfs GPIO 接口）：

```bash
sudo apt install gpiod

# 查看所有 GPIO 名称与状态
gpioinfo

# 按名称操作，例如 PQ.06（31 号脚）
gpioset $(gpiofind "PQ.06")=1   # 输出高电平
gpioget $(gpiofind "PQ.06")     # 读取输入
```

更多命令行 / Python / C 的 GPIO 用法见 [GPIO 控制](/orin-nano-series/gpio)；寄存器级操作见 [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)。

## 载板兼容性说明

- **C1902**：直接烧录官方 Developer Kit 固件，Jetson-IO 开箱即用。
- **C1901 V1.3**：40Pin GPIO 功能正常，引脚定义及 Jetson-IO 使用方式与 C1902 通用。引脚 12/35/38/40 在 V1.3 已修复，历史版本不可用。
- **C2401**：无标准 40-pin 排针，扩展走 30-pin 母座，引脚图见[产品介绍](/c2401/c2401)。
- Jetson-IO 修改的是 `/boot/` 下的 DTB 与 `extlinux.conf`，刷机/替换 DTB（如 [USB 设备树替换](/orin-nano-series/usb-config)）后需重新配置。
- **量产建议**：Jetson-IO 适合开发调试；量产镜像应使用官方 pinmux 表格生成配置并随固件烧录，参考 [NVIDIA 官方 Pinmux and GPIO Configuration](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html#changing-the-pinmux)。

完整的表格生成、BCT、DTS/DTB/DTBO、验证与回滚流程见 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。

## 参考

- [NVIDIA 官方 — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA jetson-gpio 项目](https://github.com/NVIDIA/jetson-gpio)
