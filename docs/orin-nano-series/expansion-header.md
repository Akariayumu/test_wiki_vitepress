---
title: 40-pin 扩展头配置（Jetson-IO）
outline: deep
---

# 40-pin 扩展头配置（Jetson-IO）

在 Jetson Orin Nano / NX 的 40-pin 扩展排针上，大部分引脚既可以作为通用 **GPIO** 使用，也可以配置为 **SFIO**（特殊功能 I/O，如 I2C、SPI、UART、PWM、I2S）。

引脚复用配置（Pinmux）在刷机时静态写入设备。若直接修改底层配置，需要编辑官方 Pinmux 表格并重新烧录——这种方式适合量产固化和自定义载板，但在开发调试阶段较为繁琐。为此，NVIDIA 提供了 **Jetson Expansion Header Tool（Jetson-IO）**：这是一个运行在 Jetson 设备上的 Python 配置工具，可通过交互式菜单或命令行修改引脚功能，其原理是生成新的设备树（DTB）或设备树叠加层（DTBO），并在重启后生效。

::: warning 逻辑电平安全提示
40-pin 扩展排针上除 `5V`（Pin 2 / 4）与 `3.3V`（Pin 1 / 17）电源脚及 `GND` 外，**所有信号引脚均为 3.3V 逻辑电平**。切勿直接接入 5V 逻辑信号，否则可能损坏核心卡。
:::

## 40-pin 可配置功能对照表

![Jetson Orin Nano / NX 40-pin 扩展排针引脚定义](/img/wiki-j12-pinout.jpeg)

*Jetson Orin Nano / NX 40-pin 扩展排针引脚定义*

下表列出 40-pin 扩展排针上板面丝印（原理图引脚名）、Jetson-IO 功能名称、物理引脚号以及在 **JetPack 6 / 7** 官方默认固件下的初始状态：

| 板面丝印名 | Jetson-IO 功能名 | 物理引脚 | 默认状态 |
|---|---|---|---|
| `I2C1_SDA / I2C1_SCL` | `i2c8` | 3 (SDA) / 5 (SCL) | **已启用**（`i2c8`） |
| `I2C0_SDA / I2C0_SCL` | `i2c2` | 27 (SDA) / 28 (SCL) | **已启用**（`i2c2`） |
| `UART1_TX / UART1_RX` | `uarta` | 8 (TX) / 10 (RX) | **已启用**（`uarta`） |
| `UART1_RTS / UART1_CTS` | `uarta-cts/rts` | 11 (RTS) / 36 (CTS) | `unused`（未启用） |
| `SPI0_MOSI / MISO / SCK / CS0 / CS1` | `spi1` | 19 / 21 / 23 / 24 / 26 | `unused`（未启用） |
| `SPI1_SCK / CS1 / CS0 / MISO / MOSI` | `spi3` | 13 / 16 / 18 / 22 / 37 | `unused`（未启用） |
| `I2S0_SCLK / FS / SDIN / SDOUT` | `i2s2` | 12 / 35 / 38 / 40 | `unused`（未启用） |
| `GPIO9 (AUDIO_MCLK)` | `aud` | 7 | `unused`（未启用） |
| `GPIO12 (Alt: PWM)` | `pwm1` | 15 | `unused`（未启用） |
| `GPIO07 (Alt: PWM)` | `pwm7`（部分版本记作 `pwm5`） | 32 | `unused`（未启用） |
| `GPIO13 (Alt: PWM)` | `pwm5`（部分版本记作 `pwm8`） | 33 | `unused`（未启用） |
| `GPIO01` | `extperiph3_clk` | 29 | `unused`（未启用） |
| `GPIO11` | `extperiph4_clk` | 31 | `unused`（未启用） |

::: info 默认状态与实时查询说明
- 在 JetPack 6 / 7 默认固件中，仅有 **`i2c8`（Pin 3/5）**、**`i2c2`（Pin 27/28）** 与 **`uarta`（Pin 8/10）** 默认处于启用状态；`spi1`、`spi3`、`i2s2`、`aud`、各路 `pwm` 以及普通 GPIO 引脚默认均为 **`unused`**。
- 下文演示截图中 31 号引脚显示为 `gpio`，是因为截图前已手动将其切换为 `gpio` 模式作为示例。当前系统中每个引脚的实际状态，请以下文 `config-by-pin.py` 与 `config-by-function.py` 的实时查询结果为准。
:::

## 图形界面：jetson-io.py

在 Jetson 开发板终端执行以下命令启动交互界面：

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

::: info 截图环境说明
以下界面与命令行截图采集于 **Jetson Orin Nano Super**、**JetPack 7.2.1（L4T R39.2.1）**。不同 JetPack 版本的菜单文案或选项布局可能略有差异，整体配置流程一致。
:::

### 主界面（选择接头）

启动后进入主界面，列出当前设备支持的扩展接头（如 `Configure Jetson 40pin Header`、`Configure Jetson 22pin CSI Connector`、`Configure Jetson M.2 Key E Slot`）。使用方向键选择 **Configure Jetson 40pin Header** 并按回车进入接头界面。

![Jetson-IO 主界面](/img/expansion-header-01-jetson-io-main.webp)

*Jetson-IO 主界面（选择扩展接头）*

### 接头界面

接头界面上方展示 40-pin 排针当前的逐脚状态视图，下方提供两个配置入口：

![Jetson 40-pin Header 配置菜单](/img/expansion-header-02-header-menu.webp)

*40-pin 接头状态与配置菜单*

- **Configure for compatible hardware**：从官方预置的兼容硬件模块列表（如特定音频子卡、麦克风阵列）中选择，自动启用对应的引脚功能组合。

![Jetson-IO 兼容硬件列表](/img/expansion-header-04-compatible-hardware.webp)

*官方预置兼容硬件模块列表*

- **Configure header pins manually**：手动指定各组引脚的工作模式（最常用）。

### 手动配置引脚功能

选择 **Configure header pins manually** 后，界面列出该接头支持的所有可配置引脚组（括号内标注对应的物理引脚号），每行提供 **`[*] unused  [ ] gpio  [ ] <sfio>` 三列单选模式**：

- 使用 `↑` / `↓` 方向键在引脚组之间移动，使用 **`←` / `→` 方向键**在三列之间切换，按 **空格键或回车键** 选中目标模式（显示为 `[*]`）：
  - **`unused`**：保持未启用状态；
  - **`gpio`**：将该组引脚配置为通用 GPIO 模式（例如截图中将 31 号脚设为 `[*] gpio`）；
  - **`<sfio>`**（第三列具体功能名，如 `spi1`、`i2s2`、`pwm1`）：启用对应的特殊外设功能。
- 配置完成后选择 **Back** 返回上一级菜单。
- 在接头或主菜单中，也可以选择 **Export as Device-Tree Overlay**，将当前配置单独导出为 `.dtbo` 叠加层文件（保存在 `/boot/` 目录下，便于批量部署或自定义镜像复用）。

![Jetson-IO 手动功能选择列表](/img/expansion-header-03-manual-functions.webp)

*手动配置引脚模式界面（JetPack 7 三列单选布局）*

::: info JetPack 5 / 6 界面差异附注
在 **JetPack 5 / JetPack 6** 旧版 `jetson-io.py` 中，手动配置界面为**单列复选框**（每行仅显示 `[ ] <sfio>` 功能名，按空格或回车切换 `[x]` 启用该 SFIO 外设，不勾选则保留引脚默认功能）。JetPack 7 升级为三列单选后，若需将 `unused` 引脚用作普通 GPIO，请显式切换到中间的 **`[*] gpio`** 列。
:::

### 保存并生效

返回主界面后选择对应的保存方式：

- **Save and reboot to reconfigure pins**：生成新 DTB、更新 `/boot/extlinux/extlinux.conf` 启动项并立即重启系统。
- **Save and exit without rebooting**：仅写入配置，稍后手动重启后生效。
- **Discard all pin changes**：放弃本次会话的全部修改。

::: tip 多配置共存
Jetson-IO 会保留历次保存的配置启动项。保存过多个配置后，系统开机引导阶段会出现启动菜单，可在串口或引导界面选择任意一份历史配置启动。
:::

## 命令行工具

除交互式菜单外，Jetson-IO 还提供三个等效的命令行脚本，适合远程 SSH 或自动化脚本配置（均需在 Jetson 开发板终端以 `sudo` 权限执行）。

### 查询当前配置：config-by-pin.py

在 Jetson 开发板终端执行：

```bash
# 列出设备支持的扩展接头及编号
sudo /opt/nvidia/jetson-io/config-by-pin.py -l

# 查看整个 40-pin 接头（默认 Header 1）的逐引脚配置
sudo /opt/nvidia/jetson-io/config-by-pin.py

# 查看单个物理引脚的配置（如 7 号脚）
sudo /opt/nvidia/jetson-io/config-by-pin.py -p 7
```

逐引脚配置查询输出示例：

![config-by-pin.py 逐引脚配置输出](/img/expansion-header-05-pin-list.webp)

*`config-by-pin.py` 逐引脚配置输出*

单引脚查询输出示例：

![config-by-pin.py 单引脚查询输出](/img/expansion-header-06-single-pin.webp)

*`config-by-pin.py -p 7` 单引脚查询输出*

### 按功能配置：config-by-function.py

在 Jetson 开发板终端执行：

```bash
# 列出全部可配置功能 / 当前已启用的功能
sudo /opt/nvidia/jetson-io/config-by-function.py -l all
sudo /opt/nvidia/jetson-io/config-by-function.py -l enabled

# 启用指定功能并生成新 DTB（自动写入启动项，重启后生效）
sudo /opt/nvidia/jetson-io/config-by-function.py -o dt spi1

# 同时启用多个功能（1 代表 Header 1，即 40-pin 排针）
sudo /opt/nvidia/jetson-io/config-by-function.py -o dt 1="i2s2 spi1"

# 仅导出 DTBO 叠加层文件（不修改当前启动项）
sudo /opt/nvidia/jetson-io/config-by-function.py -o dtbo spi1
```

全部可配置功能与当前已启用功能的查询输出示例：

![config-by-function.py 全部功能列表](/img/expansion-header-07-function-list-all.webp)

*`config-by-function.py -l all` 全部可配置功能列表*

![config-by-function.py 当前启用功能](/img/expansion-header-08-function-list-enabled.webp)

*`config-by-function.py -l enabled` 默认已启用功能列表*

### 按硬件模块配置：config-by-hardware.py

在 Jetson 开发板终端执行：

```bash
# 列出官方预置的兼容硬件模块配置
sudo /opt/nvidia/jetson-io/config-by-hardware.py -l

# 应用指定硬件模块的配置（示例为官方预置模块名）
sudo /opt/nvidia/jetson-io/config-by-hardware.py -n "Adafruit SPH0645LM4H"
```

::: warning 官方使用限制说明
- `config-by-hardware.py` 与 `config-by-function.py` **不能在同一配置步骤中混用**；若需同时启用兼容硬件预设与自定义引脚功能，请使用交互式菜单 `jetson-io.py`。
- 重启后再次运行 Jetson-IO 时，上一次会话中选择的硬件模块（Hardware Module）状态不会在菜单中保留，如需叠加修改请重新选择。
:::

## 配置为 GPIO 后如何使用

将目标引脚设为 GPIO 模式并重启生效后，推荐使用 `gpiod` 工具集（`libgpiod`）读写引脚（JetPack 6 起已移除旧版 `/sys/class/gpio` 接口）。

先在 Jetson 开发板终端安装 `gpiod` 并查看引脚名称：

```bash
sudo apt update
sudo apt install -y gpiod

# 查看所有 GPIO 控制器与引脚名称（例如 31 号脚对应 gpiochip0 下的 PQ.06）
gpioinfo
```

请注意 **JetPack 6** 与 **JetPack 7** 所带 `libgpiod` 版本不同，`gpioset` / `gpioget` 命令语法存在差异（若执行时报 `Permission denied`，请在命令前加 `sudo`）：

- **JetPack 6（Ubuntu 22.04，`libgpiod` v1）**：需使用 `gpiofind` 解析引脚，并配合 `--mode=wait` 在前台阻塞保持输出电平（按 `Enter` 或 `Ctrl+C` 结束释放）：

```bash
# 输出高电平（3.3V）并保持
gpioset --mode=wait $(gpiofind "PQ.06")=1

# 读取输入电平（返回 1 或 0）
gpioget $(gpiofind "PQ.06")
```

- **JetPack 7（Ubuntu 24.04，`libgpiod` v2）**：已移除 `gpiofind` 工具与 `--mode=wait` 参数，直接通过 `-c` 指定控制器与引脚名，默认持续保持电平（按 `Ctrl+C` 结束释放）：

```bash
# 输出高电平（3.3V）并保持
gpioset -c gpiochip0 PQ.06=1

# 读取输入电平（加 --numeric 返回 1 或 0）
gpioget --numeric -c gpiochip0 PQ.06
```

更多命令行、Python（`Jetson.GPIO`）及 C 语言（`libgpiod`）编程示例详见 [GPIO 控制](/orin-nano-series/gpio)；PADCTL 寄存器级临时调试详见 [JetPack 6 GPIO 配置说明](/gpio-tutorial/jetpack6-gpio)；JetPack 5 旧版系统请参看 [JetPack 5 GPIO 配置说明](/gpio-tutorial/jetpack5-gpio)。

## 载板兼容性说明

- **C1902 V2 / C1902（V1.1 及以上）/ C1901（V1.3 及以上）**：完整提供标准 40-pin 扩展排针，引脚定义及 Jetson-IO 配置流程与 NVIDIA 官方开发者套件一致，烧录对应固件后可直接使用。
- **C1901（V1.0–V1.2）/ C1902（V1.0）早期版本限制**：受早期硬件设计影响，40-pin 排针上的 **12 / 35 / 38 / 40 号引脚**（`i2s2` 相关引脚）不可用；该问题已分别在 **C1901 V1.3** 与 **C1902 V1.1** 硬件版本中修复。
- **C1903**：未配备标准 40-pin 排针（不适用 Jetson-IO 的 40-pin 配置菜单），GPIO、SPI、I2C、UART、CAN 等外设通过 **GH1.25 连接器**引出，具体引脚定义见 [C1903 产品介绍 — GH1.25 外设接口](/c1903/c1903#gh1-25-外设接口)。
- **C2401**：未配备标准 40-pin 排针（不适用 Jetson-IO 的 40-pin 配置菜单），扩展信号通过 **30-pin 扩展排母**与 GH1.25 接口引出，具体引脚定义见 [C2401 产品介绍](/c2401/c2401)。
- **设备树覆盖提醒**：Jetson-IO 修改的是 `/boot/` 下的 DTB/DTBO 与 `/boot/extlinux/extlinux.conf`；重新刷机或手动替换整包 DTB（例如执行 [USB 配置说明](/orin-nano-series/usb-config) 中的设备树替换）后，需重新应用 Jetson-IO 配置。
- **量产固化建议**：Jetson-IO 主要面向开发验证阶段；量产镜像建议使用官方 Pinmux 电子表格生成配置并随 BSP 固件统一烧录。完整的表格生成、BCT、DTS/DTB/DTBO、验证与回滚流程请参阅 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。

## 参考资料

- [NVIDIA 官方文档 — Configuring the Jetson Expansion Headers](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/ConfiguringTheJetsonExpansionHeaders.html)
- [NVIDIA 官方文档 — Changing the Pinmux (Orin NX / Nano Series)](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonOrinNxNanoSeries.html#changing-the-pinmux)
- [NVIDIA jetson-gpio 开源仓库](https://github.com/NVIDIA/jetson-gpio)
