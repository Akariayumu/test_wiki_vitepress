# Jetson Wiki 高优先级截图需求

## 1. 目标

从现有 Wiki 全部说明中，只采集最能帮助读者判断“是否成功”、最容易因文字描述产生误操作、且必须由真实 Jetson 环境提供的截图。

本清单不追求每条命令都配图。以下内容不重复采集：

- 已有完整截图的 SDK Manager、刷机、JetPack 7 ISO、Jtop、Ollama、ComfyUI、jetson-containers 和 Expansion Header 流程。
- 纯安装命令、软件下载页、代码全文和普通终端下载进度。
- 产品外观、接口布局、接线和 Pinout；这些应使用产品照片或工程图，不属于系统截图。
- FAQ 中与正文重复的命令输出。

优先完成 P0。P1 只在对应硬件和软件已经具备、无需临时改动系统时采集。

## 2. 通用执行规则

### 2.1 安全边界

- 截图任务默认是只读验证，不要为了截图安装驱动、刷机、替换 DTB、改 Pinmux、写寄存器或改变启动配置。
- 只有设备本来已经配置好相关功能时，才采集功能结果。
- GPIO、UART、I2C、CAN、RTC 等涉及外设的项目，必须先确认接线、电压和接口定义正确。
- 不执行破坏性存储测试，不格式化磁盘，不覆盖系统镜像。
- 不展示 API Key、Wi-Fi 密码、IP、公网地址、序列号、用户名、主机名或私人模型对话。
- 实际环境与文档版本不同没有关系，必须记录真实 JetPack、L4T、模组与载板，不能伪造输出。
- 无法完成的项目标记为 `BLOCKED`，说明缺少的硬件、软件或配置，不用其他图片代替。

### 2.2 图片规范

- 原图统一保存为 PNG，后续由 Wiki 侧无损裁切并转换为 WebP。
- 终端窗口建议 120 列以上，使用同一主题、字体和字号。
- 截图前执行 `clear`，只保留本项命令和关键输出。
- 窗口内文字必须清晰，不能裁掉命令、表头、错误提示或结果摘要。
- 终端输出较长时，优先截取最终结果摘要；必要时用 `-a`、`--no-pager` 或工具自身过滤参数减少无关输出。
- GUI 截图只保留目标应用窗口，不包含桌面图标、通知、Dock 或其他应用。
- 原图不加箭头、文字、水印或拼接效果。
- 不把大片空白当成有效画面；截图窗口应在执行前调整到合适大小。

### 2.3 输出目录

```text
artifacts/wiki-priority-screenshots/
├── raw/
├── environment.txt
├── checksums.sha256
└── REPORT.md
```

环境记录至少包含：

```bash
date --iso-8601=seconds
cat /etc/nv_tegra_release
uname -a
tr -d '\0' </proc/device-tree/model; printf '\n'
tr '\0' '\n' </proc/device-tree/compatible
dpkg-query -W nvidia-jetpack 2>/dev/null || true
sudo nvpmodel -q 2>/dev/null || true
```

## 3. P0：必须优先采集

### P0-01 TensorRT 环境与 FP16 性能摘要

对应页面：`docs/orin-nano-series/tensorrt.md`

价值：TensorRT 页面目前没有真实结果图；构建成功、延迟和吞吐量是读者最关心的验证证据。

前提：已有可用的 ONNX 模型和由当前设备生成的 TensorRT engine。

建议采集两张：

1. TensorRT 版本和 `trtexec` 路径。
2. `trtexec` 最终性能摘要，必须包含 Latency、Throughput 和 GPU Compute Time；无需截取完整构建日志。

可参考页面现有命令，使用实际模型路径，不要伪造模型名称：

```bash
dpkg -l | grep -E 'tensorrt|nvinfer'
which trtexec
/usr/src/tensorrt/bin/trtexec --loadEngine=<实际 engine 路径> --iterations=200
```

文件名：

```text
raw/tensorrt-01-environment.png
raw/tensorrt-02-fp16-benchmark-summary.png
```

验收重点：第二张必须显示测试正常结束，而不是只有启动参数或报错。

### P0-02 PyTorch CUDA 可用性

对应页面：`docs/orin-nano-series/pytorch.md`

价值：这是判断 PyTorch wheel、CUDA 和 torchvision 是否匹配的最短证据。

运行页面中的验证脚本，输出至少包含：

- `torch.__version__`
- `torchvision.__version__`
- `torch.cuda.is_available()`
- `torch.version.cuda`
- 当前 GPU 名称

文件名：

```text
raw/pytorch-01-cuda-verification.png
```

验收重点：CUDA 必须为 `True`；如果为 `False`，作为故障素材单独标注，不得当作成功示例。

### P0-03 USB 链路速度与设备树生效验证

对应页面：`docs/orin-nano-series/usb-config.md`

价值：USB 端口“能识别”不等于运行在 USB 3.x，`lsusb -t` 是最直观的验收依据。

前提：测试端口已连接确认支持 SuperSpeed 的 USB 3.x 设备。

运行：

```bash
lsusb
lsusb -t
sudo dmesg -T | grep -iE 'usb|xhci' | tail -n 30
```

文件名：

```text
raw/usb-01-superspeed-verification.png
```

验收重点：截图应同时让读者看见目标设备和 `5000M` / `10000M` 链路；只有 `480M` 不能作为成功图。

### P0-04 当前加载的设备树

对应页面：

- `docs/hardware-bsp/pinmux-device-tree.md`
- `docs/orin-nano-series/usb-config.md`
- `docs/faq/index.md`

价值：很多故障来自“文件复制到了 `/boot`，但实际没有加载”。

运行：

```bash
tr -d '\0' </proc/device-tree/nvidia,dtsfilename 2>/dev/null || true
grep -nE '^[[:space:]]*(FDT|OVERLAYS)' /boot/extlinux/extlinux.conf 2>/dev/null || true
find /boot -maxdepth 2 \( -name '*.dtb' -o -name '*.dtbo' \) -print | sort
```

文件名：

```text
raw/device-tree-01-active-dtb.png
```

验收重点：保留运行时 DTB 和启动配置两部分；如果 JetPack 版本不再使用 `extlinux.conf`，如实保留结果并在报告解释实际启动机制。

### P0-05 CSI 摄像头探测与实时预览

对应页面：`docs/orin-nano-series/camera.md`

价值：同时证明 Sensor 驱动、设备树、VI/CSI 链路和 GStreamer pipeline 正常。

前提：已接入并确认支持当前 JetPack 的 CSI 摄像头。

建议采集两张：

1. `v4l2-ctl --list-devices` 与目标节点格式信息。
2. 页面 `gst-launch-1.0` 命令成功打开的实时预览窗口。

文件名：

```text
raw/camera-01-v4l2-detection.png
raw/camera-02-csi-live-preview.png
```

验收重点：预览图必须来自摄像头实时画面；避免拍摄人员、人脸、工位文件或带序列号的设备标签，可对准普通静物测试卡。

### P0-06 GPIO 识别与输入读取

对应页面：

- `docs/orin-nano-series/gpio.md`
- `docs/gpio-tutorial/jetpack6-gpio.md`

价值：证明目标引脚已经处于 GPIO 模式，并展示 JetPack 新版 `libgpiod` 的真实使用方式。

前提：明确目标物理引脚、GPIO line 名称和安全输入电平。优先只做输入读取，不驱动未知负载。

运行与页面版本相匹配的只读命令，例如：

```bash
gpioinfo
gpiofind '<已确认的 line 名称>'
gpioget $(gpiofind '<已确认的 line 名称>')
```

文件名：

```text
raw/gpio-01-line-identification.png
raw/gpio-02-input-read.png
```

验收重点：画面需显示目标 line 名称、所属 gpiochip/offset 和读取值。不要为了截图执行 `gpioset`；输出测试另行安排接线与电气验收。

### P0-07 I2C 总线与设备地址

对应页面：`docs/orin-nano-series/peripherals.md`

价值：I2C 地址矩阵能直观看出控制器和外设是否存在。

前提：已确认要扫描的总线，且该总线上没有禁止使用通用探测的敏感设备。

运行：

```bash
i2cdetect -l
sudo i2cdetect -y -r <已确认的总线编号>
```

文件名：

```text
raw/i2c-01-bus-and-address.png
```

验收重点：截图同时包含总线列表和地址矩阵；在报告中说明测试外设型号与预期地址。

### P0-08 CAN 回环或双节点收发

对应页面：`docs/orin-nano-series/peripherals.md`

价值：仅显示 `can0` 存在不能证明波特率、收发器、终端电阻和实际收发正常。

前提：使用已经验证的 CAN 接线；双节点测试需共地并正确配置终端电阻。不要在真实车辆或运行中的工业总线上发送测试帧。

建议采集一张并排终端图：

- 左侧：`candump can0`
- 右侧：`cansend can0 123#DEADBEEF`
- 同时保留 `ip -details -statistics link show can0` 的 UP 状态和 bitrate

文件名：

```text
raw/can-01-send-receive.png
```

验收重点：接收端必须看到与发送端一致的 ID 和 payload；报告注明是回环还是真实双节点。

### P0-09 OpenClaw 服务状态与控制面板

对应页面：`docs/orin-nano-series/openclaw.md`

价值：该页面目前没有截图，读者需要确认守护进程、Gateway 和控制面板确实可用。

前提：OpenClaw 已经完成初始化；截图前隐藏 token、API Key、聊天内容、渠道账号和公网地址。

建议采集两张：

1. 服务或 Gateway 的健康状态输出。
2. 控制面板首页，只显示非敏感的连接状态与版本信息。

文件名：

```text
raw/openclaw-01-gateway-status.png
raw/openclaw-02-dashboard.png
```

验收重点：控制面板不得出现密钥、二维码、私人消息或用户标识。

### P0-10 基础镜像构建成功结果

对应页面：`docs/orin-nano-series/base-image.md`

价值：内核、设备树和树外模块编译是长流程，最终产物与成功状态比中间日志更有证明力。

前提：在既有、可复现的 BSP 工作区中完成；不要为了截图临时修改或覆盖生产 BSP。

建议采集两张：

1. 编译最终成功摘要，以及生成的 kernel、DTB/DTBO、模块产物路径。
2. 目标设备刷入该镜像后的系统版本、设备树和关键驱动加载结果。

文件名：

```text
raw/base-image-01-build-artifacts.png
raw/base-image-02-boot-verification.png
```

验收重点：不能只截取编译进行中画面；报告必须记录源码版本、L4T、载板和构建命令。

## 4. P1：条件具备时采集

### P1-01 网卡驱动加载状态

对应页面：`docs/orin-nano-series/network-driver.md`

采集 `lspci -nnk`、目标驱动、`dkms status`（如使用 DKMS）和 `ip -br link`，放在同一干净终端画面中。

```text
raw/network-01-driver-loaded.png
```

重点：必须看见 PCI ID、`Kernel driver in use` 和对应网口；IP 地址应打码或通过命令只展示 link 状态。

### P1-02 UART 回环

对应页面：`docs/orin-nano-series/peripherals.md`

使用已经正确短接 TX/RX 的目标 UART，通过 CuteCom 或页面 Python 示例发送唯一测试字符串并收到完全相同的回显。

```text
raw/uart-01-loopback.png
```

重点：截图注明设备节点和波特率；不得短接不同电压域的接口。

### P1-03 RTC 掉电保持验证

对应页面：`docs/orin-nano-series/peripherals.md`

只有已经安装 RTC 电池并安排了可控断电测试时执行。截图应包含 `timedatectl`、`hwclock --show` 及断电重启后的时间保持结果。

```text
raw/rtc-01-hwclock-verification.png
```

重点：不能只展示一次当前时间；报告注明断电时长和网络时间同步是否关闭。

### P1-04 NVMe 与启动盘识别

对应页面：

- `docs/faq/index.md`
- 各刷机说明

运行：

```bash
lsblk -o NAME,SIZE,MODEL,TYPE,FSTYPE,MOUNTPOINTS
findmnt /
sudo nvme list 2>/dev/null || true
```

```text
raw/storage-01-nvme-and-rootfs.png
```

重点：证明 NVMe 型号、容量和根文件系统实际所在设备；序列号字段不要显示。

### P1-05 功耗模式与降频状态

对应页面：现有 FAQ、Jtop 与后续电源性能管理专章。

运行：

```bash
sudo nvpmodel -q --verbose
jetson_clocks --show 2>/dev/null || sudo jetson_clocks --show
```

如设备正在运行已验证的压力测试，可再截取 Jtop 中功耗、温度、频率和是否 throttling 的同屏结果。

```text
raw/power-01-nvpmodel-and-clocks.png
raw/power-02-load-temperature.png
```

重点：记录环境温度、散热器/风扇和负载；不能把空闲温度当作满载数据。

### P1-06 OpenCV CUDA 验证

对应页面：`docs/orin-nano-series/opencv.md`

当前页面已有相关图片，仅当需要替换旧图时采集。画面应显示 OpenCV 版本、CUDA device count、构建信息中的 CUDA 状态，以及示例程序成功运行结果。

```text
raw/opencv-01-cuda-build-info.png
raw/opencv-02-cuda-sample.png
```

## 5. 明确不建议截图的内容

以下内容用文字、代码块、表格或工程图表达更好：

- `apt install`、`git clone`、`pip install` 的普通过程。
- 完整编译滚屏日志。
- FAQ 每个诊断命令的输出。
- 产品规格表、选型矩阵和资源下载列表。
- Python/C/C++ 源码。
- 固定 IP、SSH 登录信息或包含账号的远程桌面画面。
- 单纯显示“命令执行完没有报错”的空终端。
- 已有清晰截图且界面没有显著变化的流程。

## 6. 建议执行批次

### 第一批：不增加硬件、最容易完成

1. TensorRT 环境与性能摘要
2. PyTorch CUDA 可用性
3. 当前加载的设备树
4. OpenClaw 服务状态与控制面板
5. 网卡驱动状态
6. NVMe 与根文件系统
7. 功耗模式与频率

### 第二批：需要对应外设

1. USB 3.x 链路
2. CSI 摄像头
3. GPIO 输入
4. I2C 地址
5. CAN 收发
6. UART 回环
7. RTC 掉电保持

### 第三批：需要完整工程流程

1. 基础镜像编译与启动验证
2. OpenCV CUDA 替换图（仅旧图不再适用时）

## 7. REPORT.md 要求

```markdown
# Wiki 高优先级截图执行报告

## 环境

- 载板：
- 模组：
- JetPack：
- L4T：
- 散热方案：
- 截图工具：

## 结果

| 编号 | 文件 | DONE / BLOCKED / SKIPPED | 环境与备注 |
|------|------|--------------------------|------------|
| P0-01 | tensorrt-01-environment.png | | |

## 系统改动确认

- [ ] 本次只采集既有环境，没有为截图刷机或替换 DTB
- [ ] 没有暴露密码、Token、序列号、IP 或私人数据
- [ ] 涉及外设的测试已确认电压、接线和终端配置
- [ ] 所有截图均来自真实设备，未伪造输出

## BLOCKED 项

- 编号：
- 原因：
- 完成所需硬件或前置条件：
```

完成后执行：

```bash
sha256sum raw/*.png > checksums.sha256
```

最终将整个 `artifacts/wiki-priority-screenshots/` 打包回传。不要直接修改 Wiki 页面或把未经审核的原图复制到 `docs/public/img/`。
