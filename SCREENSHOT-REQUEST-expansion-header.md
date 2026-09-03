# Expansion Header 页面截图任务单

## 1. 任务目标

为 Wiki 页面 `docs/orin-nano-series/expansion-header.md` 采集真实 Jetson 系统截图，验证能否由开发板上的 Codex 独立完成以下流程：

1. 识别开发板、JetPack/L4T 和 Jetson-IO 环境。
2. 打开 Jetson-IO，并依次进入页面需要讲解的菜单。
3. 在**不改变当前 Pinmux、不写入启动配置、不重启设备**的前提下截图。
4. 采集几个命令行工具的真实输出。
5. 按规定文件名交付原始 PNG、环境记录和执行报告。

本轮只处理 `expansion-header`，不要修改 Wiki、设备树、`/boot` 文件或 GPIO 输出状态。

## 2. 目标环境

优先环境：

- Jetson Orin Nano 或 Orin NX
- NVIDIA 官方 Developer Kit，或确认可使用 Jetson-IO 的 C1902 / C1901 V1.3
- JetPack 6.x
- 已进入图形桌面，能够打开终端窗口
- 终端内存在 `/opt/nvidia/jetson-io/jetson-io.py`

如果实际型号或版本不同，不要伪造目标环境。继续完成可执行部分，并在报告中写明差异。

## 3. 安全限制

必须遵守：

- 不选择 `Save pin changes`。
- 不选择 `Save and reboot to reconfigure pins`。
- 不选择任何会写入 DTB、DTBO 或 `extlinux.conf` 的操作。
- 不执行 `config-by-function.py -o dt ...` 或 `-o dtbo ...`。
- 不执行 `config-by-hardware.py -n ...`。
- 不执行 `gpioset`、寄存器写入、刷机、重启或关机。
- 不安装、卸载或升级系统软件；缺少截图工具时先报告，不要自行改变系统。
- 不覆盖已有截图。发现同名文件时，使用新的空目录重新执行。
- Jetson-IO 中只允许浏览菜单，最后通过 `Back` / `Exit` / `Discard` 安全退出。

如无法确定某个菜单动作是否会保存配置，停止该动作并在报告中说明。

## 4. 输出目录与文件

请在当前工作区创建以下目录；如果当前工作区不是 Wiki 仓库，可在一个明确的绝对路径下建立相同目录结构，并在最终回复中给出路径：

```text
artifacts/expansion-header-screenshots/
├── raw/
│   ├── expansion-header-01-jetson-io-main.png
│   ├── expansion-header-02-header-menu.png
│   ├── expansion-header-03-manual-functions.png
│   ├── expansion-header-04-compatible-hardware.png
│   ├── expansion-header-05-pin-list.png
│   ├── expansion-header-06-single-pin.png
│   ├── expansion-header-07-function-list-all.png
│   └── expansion-header-08-function-list-enabled.png
├── environment.txt
├── checksums.sha256
└── REPORT.md
```

若某张截图因当前硬件或 JetPack 不支持而无法获得，不要用别的画面顶替；在 `REPORT.md` 中将它标成 `BLOCKED` 并说明原因。

## 5. 截图统一规范

- 格式：PNG。
- 截图内容以终端窗口为主，不要截入整个杂乱桌面。
- 推荐终端窗口至少 120 列 × 36 行，正文应在 100% 缩放下清晰可读。
- 同一批截图使用相同字体、字号、窗口尺寸和配色。
- 建议使用浅色背景；若系统只有深色主题，可保持默认，但要确保对比度足够。
- 截图前清空终端，避免带入无关命令、聊天内容、令牌或历史记录。
- 不应出现用户名、主机名、IP、Wi-Fi 名称、序列号、浏览器账号等敏感信息。
- 不额外添加箭头、文字、边框或水印；本轮交付原图，后续统一标注。
- 画面不得裁掉 Jetson-IO 标题、菜单项、命令或关键输出。
- 不要为了凑齐清单伪造或编辑终端输出。

可以使用系统已有的 `gnome-screenshot`、桌面截图快捷键或其他现成截图工具。Jetson-IO 会占用当前终端，因此通常需要从另一个终端触发窗口截图，或使用桌面快捷键。

## 6. 执行前环境记录

将以下命令的原始输出写入 `environment.txt`。这部分是文字记录，不要求截图：

```bash
date --iso-8601=seconds
cat /etc/nv_tegra_release
uname -a
tr -d '\0' </proc/device-tree/model
printf '\n'
tr '\0' '\n' </proc/device-tree/compatible
dpkg-query -W nvidia-jetpack 2>/dev/null || true
test -f /opt/nvidia/jetson-io/jetson-io.py && echo 'jetson-io: present' || echo 'jetson-io: missing'
python3 --version
```

同时在 `REPORT.md` 中人工归纳：

- 载板型号与版本
- Jetson 模组型号和内存规格
- JetPack 版本
- L4T 版本
- 截图使用的工具
- 是否确认测试前后没有保存 Pinmux 修改

## 7. 必需截图清单

### 01 — Jetson-IO 主界面

运行：

```bash
sudo /opt/nvidia/jetson-io/jetson-io.py
```

截图要求：

- 显示 Jetson-IO 主界面完整标题和菜单。
- 能看到 `Configure 40-pin Header`；名称因版本不同可以略有差异。
- 如果同时列出 CSI、M.2 Key E 等接头，完整保留在画面中。
- 此时不要进入保存或重启操作。

输出：`raw/expansion-header-01-jetson-io-main.png`

### 02 — 40-pin Header 配置菜单

从主界面选择 `Configure 40-pin Header`。

截图要求：

- 完整显示接头名称和当前配置菜单。
- 画面中应尽量同时包含：
  - `Configure for compatible hardware`
  - `Configure header pins manually`
- 保留底部导航或返回提示。

输出：`raw/expansion-header-02-header-menu.png`

### 03 — 手动功能选择列表

进入 `Configure header pins manually`，只浏览，不切换任何功能。

截图要求：

- 显示可配置功能及对应物理引脚，例如 SPI、I2S、PWM。
- 如果列表超过一屏，优先截取信息最完整的一屏；在报告中注明还有哪些项目未显示。
- 不按空格或回车改变勾选状态。
- 截图后返回上一层。

输出：`raw/expansion-header-03-manual-functions.png`

### 04 — Compatible Hardware 列表

进入 `Configure for compatible hardware`，只浏览设备列表。

截图要求：

- 显示 Jetson-IO 当前提供的兼容硬件模块。
- 不选中或应用任何模块。
- 如果没有预置模块，截图保留真实的空列表或提示信息，并在报告中说明。
- 截图后返回，最终安全退出 Jetson-IO。

输出：`raw/expansion-header-04-compatible-hardware.png`

### 05 — 整个 40-pin 逐引脚配置

退出 Jetson-IO 后，在干净终端中运行：

```bash
sudo /opt/nvidia/jetson-io/config-by-pin.py
```

截图要求：

- 包含执行命令和尽量完整的表头、引脚及当前功能。
- 若输出超过一屏，先调整终端高度或减小一档字号；仍无法放下时可额外提交 `expansion-header-05b-pin-list.png`，不要过度缩小到不可读。

输出：`raw/expansion-header-05-pin-list.png`

### 06 — 单引脚查询

运行：

```bash
sudo /opt/nvidia/jetson-io/config-by-pin.py -p 7
```

截图要求：

- 包含完整命令和 7 号物理引脚的真实查询结果。
- 不要求结果必须是某个预设 GPIO 名称，以设备实际输出为准。

输出：`raw/expansion-header-06-single-pin.png`

### 07 — 全部可配置功能

运行：

```bash
sudo /opt/nvidia/jetson-io/config-by-function.py -l all
```

截图要求：

- 包含完整命令、接头编号/名称和功能列表。
- 输出过长时允许增加 `expansion-header-07b-function-list-all.png`。

输出：`raw/expansion-header-07-function-list-all.png`

### 08 — 当前已启用功能

运行：

```bash
sudo /opt/nvidia/jetson-io/config-by-function.py -l enabled
```

截图要求：

- 包含完整命令和真实结果。
- 即使结果为空也要保留截图，并在报告中说明。

输出：`raw/expansion-header-08-function-list-enabled.png`

## 8. 可选截图

只有已经安装 `gpiod` 且无需修改系统时，才执行：

```bash
gpioinfo
```

可截取能够展示 GPIO chip、line name 和 consumer 的一屏，保存为：

```text
raw/expansion-header-09-gpioinfo.png
```

不要执行 `gpioset` 或连接测试负载。本轮目标是验证截图工作流，不是验证 GPIO 电气功能。

## 9. 截图后检查

完成后逐张检查：

1. 文件确实是 PNG，能正常打开。
2. 文字清晰，无大面积遮挡或裁切。
3. 文件名与画面内容对应。
4. 没有敏感信息。
5. 没有重复截图冒充不同步骤。
6. Jetson-IO 已退出，没有保存配置，也没有触发重启。

生成校验值：

```bash
sha256sum raw/*.png > checksums.sha256
```

如果系统提供 `file` 和 ImageMagick，可额外检查：

```bash
file raw/*.png
identify raw/*.png
```

## 10. REPORT.md 模板

```markdown
# Expansion Header 截图执行报告

## 环境

- 载板：
- 模组：
- JetPack：
- L4T：
- 截图工具：

## 结果

| 文件 | 状态 | 备注 |
|------|------|------|
| expansion-header-01-jetson-io-main.png | DONE / BLOCKED | |
| expansion-header-02-header-menu.png | DONE / BLOCKED | |
| expansion-header-03-manual-functions.png | DONE / BLOCKED | |
| expansion-header-04-compatible-hardware.png | DONE / BLOCKED | |
| expansion-header-05-pin-list.png | DONE / BLOCKED | |
| expansion-header-06-single-pin.png | DONE / BLOCKED | |
| expansion-header-07-function-list-all.png | DONE / BLOCKED | |
| expansion-header-08-function-list-enabled.png | DONE / BLOCKED | |
| expansion-header-09-gpioinfo.png | DONE / SKIPPED | 可选 |

## 安全确认

- [ ] 未保存 Jetson-IO 修改
- [ ] 未写入 DTB / DTBO / extlinux.conf
- [ ] 未改变 GPIO 输出状态
- [ ] 未重启或刷机

## 异常与差异

- 与任务单不一致的菜单名称：
- 无法采集的画面及原因：
- 其他问题：
```

## 11. 最终交付要求

开发板上的 Codex 完成后，应回复：

1. 输出目录的绝对路径。
2. `DONE / BLOCKED / SKIPPED` 数量。
3. 实际设备、JetPack 和 L4T 版本。
4. 是否确认没有修改 Pinmux 或启动配置。
5. 所有 `BLOCKED` 项及原因。

不要直接把截图复制进 `docs/public/img/`，也不要修改 `expansion-header.md`。先回传 `artifacts/expansion-header-screenshots/` 原始材料，由 Wiki 侧审核、裁切、压缩、命名后再接入中英文页面。
