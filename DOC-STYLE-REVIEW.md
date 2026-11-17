# LinkZee Wiki 全量文档风格统一性与表述优化审查报告

> **审查范围**：`docs/` 全量 **85 篇 Markdown 文档**（43 篇中文 + 42 篇英文）+ 站点配置 `docs/.vitepress/config.mts`  
> **审查日期**：2026-11-17  
> **审查目标**：建立全站统一的写作与排版基线，逐篇定位行号级风格差异、表述瑕疵、中英同步缺口以及交叉核对出的硬件/命令准确性隐患，并给出可直接落地的改写方案。

---

## 目录

1. [全站审查结论总览与代际特征](#一全站审查结论总览与代际特征)
2. [建议确立的全站统一风格规范（Style Guide 基线）](#二建议确立的全站统一风格规范style-guide-基线)
3. [最高优先级（P0）跨页硬伤与架构问题速览](#三最高优先级p0跨页硬伤与架构问题速览)
4. [模块一：站点配置与全局入口页（7 组，13 个文件）](#四模块一站点配置与全局入口页7-组13-个文件)
5. [模块二：载板硬件产品页（6 组，11 个文件）](#五模块二载板硬件产品页6-组11-个文件)
6. [模块三：刷机指南与系列刷机页（8 组，16 个文件）](#六模块三刷机指南与系列刷机页8-组16-个文件)
7. [模块四：GPIO 专题与扩展排针页（4 组，8 个文件）](#七模块四gpio-专题与扩展排针页4-组8-个文件)
8. [模块五：Orin 系列说明与外设连接教程（8 组，16 个文件）](#八模块五orin-系列说明与外设连接教程8-组16-个文件)
9. [模块六：AI / 容器 / 系统软件进阶教程及孤立页（11 组，22 个文件）](#九模块六ai--容器--系统软件进阶教程及孤立页11-组22-个文件)
10. [建议整改路线图（Phased Rollout）](#十建议整改路线图phased-rollout)

---

## 一、全站审查结论总览与代际特征

当前 Wiki 明显处于**两代文档并存**的过渡期：

1. **新近重构/新增标杆稿**（代表作：载板页 `c1902v2/c1902v2.md`、教程页 `orin-nano-series/pytorch.md`、`tensorrt.md`、`hardware-bsp/pinmux-device-tree.md`）：
   - 结构清晰（前置条件 → 分步操作 → 验证结果 → 排障建议），采用语义化 `.webp` 配图、VitePress 原生容器（`::: tip` / `::: warning` / `::: danger`）、规范的中西文空格与命令输出分离。
2. **早期 BookStack 迁移遗留稿**（集中在 `c1901`、`c1902`、`orin-nano-series/` 早期教程、`orin-nx-series/` 及部分刷机页）：
   - 残留旧站 `> 来源 / Source` 死链页脚、Docusaurus 字段（`sidebar_position`）、离线 Word 规格书居中图注（`<div align="center">图 X / 表 X</div>`）；
   - 标题编号体例混乱（甚至单篇内混用 `1.`、`2.` 与 `三、`），大量使用普通引用块 `>` 或无格式粗体代替警告框；
   - 代码块混用 `shell` / `bash` / 无语言标记，将终端提示符 `jetson@ubuntu:~$` 与数十行输出直接塞进可复制命令块；
   - 新主力产品 **`C1902 V2`** 与 **`C1903`** 尚未同步写入选型对比、快速开始、资源下载、刷机指南、FAQ 及外设兼容性说明。

---

## 二、建议确立的全站统一风格规范（Style Guide 基线）

建议以 **`docs/c1902v2/c1902v2.md`**（硬件产品页模板）与 **`docs/orin-nano-series/pytorch.md`**（软件/外设教程页模板）作为全站基准，统一以下 8 条规范：

### 2.1 Frontmatter、标题与章节编号规范
- **YAML Frontmatter**：所有内页统一包含 `title` 与 `outline: deep`（补齐 `quick-start.md`、`openclaw.md` 及各刷机/GPIO 页）。页面 `title`、`# H1` 与 `config.mts` 侧边栏文案保持一致（例如将 `C1903 载板/套件规格书` 统一为 `C1903 产品介绍`）。
- **H2 / H3 编号规则**：
  - **产品规格与公共参考页**（产品介绍、选型对比、资源下载、FAQ）：二级标题**不加序号**（如 `## 产品简介`、`## 产品规格`、`## 接口布局`）。
  - **分步操作教程页**：二级标题统一使用**阿拉伯数字 + 英文句点 + 空格**（`## 1. 环境准备`、`### 1.1 检查版本`），彻底淘汰中文汉字序号（`## 一、`）、无点号序号（`## 1 安装jtop`）、缺空格序号（`## 1.使用...`）及顿号列表（`1、`）。
  - **标题句式**：使用精炼动宾或名词短语（如 `## 1. 安装 Ollama`），避免整句操作口令作标题（如 `## 3. 成功运行后命令行窗口输出如下`）；英文版 H2/H3 统一采用 **Title Case**，操作步骤标题统一用祈使动词原形（`Install ...` / `Configure ...`，不混用 `Installing ...`）。

### 2.2 专有名词、型号与计量单位词表

| 类别 | 推荐统一写法（正例） | 应淘汰的不一致写法（反例） |
|---|---|---|
| **核心卡与系统** | `Jetson Orin Nano`、`Jetson Orin NX`、`Orin Nano / NX`、`JetPack 6.2` | `ORIN NANO`、`orin nano`、`Nano&NX`、`Jetpack6`、`5.1.4 版本的固件` |
| **硬件统称** | 中文：`载板`、`核心卡`、`套件`、`扩展`；英文：`carrier board`、`Jetson module` (`SoM`) | 中文混称 `底板`/`开发板`/`核心板`/`拓展`；英文直译 `core module` |
| **控元型号** | `C1901`、`C1902`（或 `C1902 (V1.x)`）、`C1902 V2`、`C1903`、`C2401`、`C2402` | `C1902V2`（无空格）、`1902`（漏 `C`） |
| **品牌名称** | 中文：`控元科技(KYtech)`；英文：`KYtech`（产品线/文档站名可用 `LinkZee`） | 混用 `Kytech` / `KYtech` / 未译中文公司名 |
| **内存/存储容量** | `4GB / 8GB`、`8GB / 16GB`、`120 GB`、`NVMe SSD`、`microSD 卡` | `4G/8G`（易与 `4G LTE` 通信模组混淆）、`300G`、`NVME`、`TF 卡`/`内存卡` |
| **接口与协议** | `USB 3.2`、`USB 2.0`、`USB Type-C`、`USB Type-A`、`40-pin`、`12-pin`、`PoE`、`I2C`（或全站统一 `I²C`）、`GMSL2`、`SUPER 模式` | `USB3.0`、`USB C`、`TYPE-C`、`40Pin`/`40PIN`/`40 针`、`POE`、`GSML`、`super模式` |
| **数量、范围与温度** | 接口数量统一 `2 ×`（或全站统一 `2x` 但切忌同页混用）；尺寸 `100 × 79 mm`；电压 `12V（兼容 9V–19V）`；中文温度 `-20℃–55℃`，**英文温度 `-20 °C to 55 °C`** | 同页混用 `1x` / `2 x` / `2 ×` / `M2.5X4`；英文页误用中文全角单字符 `℃` 和 `~` |
| **AI / 软件工具** | `jtop`、`CUDA`、`cuDNN`、`OpenCV`、`PyTorch`、`Torchvision`、`TensorRT`、`Ollama`、`ComfyUI`、`jetson-containers`、`Docker`、`UEFI`、`EDK2`、`Arm64` | `Jtop`、`CUDA JETSON SDK`、`opencv`、`Comfy-UI`、`Jetson-container`、`docker`、`edk2`、`ARM64` |

### 2.3 中西文混排与标点规范
- 中文与英文单词、数字之间保留 **1 个半角空格**（如 `安装 CUDA`、`支持 4 路 GMSL2 摄像头`；度数/百分比符号紧贴数字如 `55℃`）。
- 中文正文与中文侧栏统一使用**全角标点**（`（）`、`：`、`、`、`。`），不在中文句尾误用英文句点 `.` 或漏写句末句号；英文正文严禁残留中文全角引号 `“”`、全角括号或 `℃`。

### 2.4 提示框（Callout）语法规范
- 全站统一采用 VitePress 容器语法（统一约定 `:::` 后带 1 个空格，如 `::: tip`、`::: info`、`::: warning`、`::: danger`）：
  - `::: danger`：带电插拔核心卡/CSI 排线、物理引脚短路、覆盖宿主机内核模块、Secure Boot 不可逆烧录等高危损坏风险；
  - `::: warning`：拨码开关复位、跳线帽取下时机、版本强绑定、非持久化修改（如 `devmem` 重启失效）等易踩坑事项；
  - `::: tip` / `::: info`：效率技巧、背景说明、跨页推荐阅读。
- 淘汰用普通引用块 `>` 堆砌多条注意事项或用 HTML `<u>` 下划线强调的做法。

### 2.5 代码块与执行环境标识规范
- **明确执行端**：凡涉及宿主机与开发板切换的文档（刷机、备份恢复、BSP 编译、SSH 隧道），必须在代码块前显式标注 **「在 Ubuntu 宿主机终端执行：」** 或 **「在 Jetson 开发板终端执行：」**。
- **语言标记**：Shell 命令统一使用 ```` ```bash ````（淘汰 `shell` 与无标记裸代码块）；预期输出、日志、伪表格统一放入独立的 ```` ```text ```` 块。
- **纯净可复制**：严禁在 `bash` 命令块内混入 `jetson@ubuntu:~$` 提示符、`[sudo] password` 或运行输出；多行长命令统一用 ` \`（反斜杠前必留空格）折行；宿主机路径统一使用 `$HOME/...` 或 `~/...` 替代写死的 `/home/ubuntu/...`。

### 2.6 图片、图注与站内链接规范
- **图片资源**：统一转为 `.webp`，采用 `<板卡或专题>-<语义描述>.webp` 命名；淘汰 `![image.png]`、`![image]`、`![1.png]` 等无意义 Alt 文本；英文版不得直接复用带大段中文标注或中文系统 UI 的截图。
- **图注格式**：统一使用图片下方空一行后的斜体单行 `*正面接口布局*`（或自解释型段落导语），移除 `c1902.md` 的 `### 正面` 标题图注及 `c1903.md` 的 `<div align="center">图 X / 表 X</div>`。
- **站内链接**：一律使用 VitePress 根相对路径（中文 `/orin-nano-series/...`，英文 `/en/orin-nano-series/...`，不带域名、不写死 `https://www.linkzeelabs.com/wiki-new/...html`、不使用未经 `withBase` 包装的原生 `<a href="...">`）。

---

## 三、最高优先级（P0）跨页硬伤与架构问题速览

在推进全文润色前，建议最优先修复以下 **12 项影响硬件选型、接线安全或命令执行的 P0 级问题**：

| 编号 | 严重度 | 涉及文件与行号 | 问题概述 |
|---|---|---|---|
| **P0-1** | 致命接线 | `orin-nano-series/peripherals.md` L100（及英文版） | SPI 回环测试写“使用条线短接 **19，20 号针脚**”——**20 号脚是 `GND`**（21 号脚才是 `SPI0_MISO`），照做会将 MOSI 对地短路且测试必败。 |
| **P0-2** | 选型错配 | `products/compare.md` L31,38,44,46,47,55（及英文版 L44）；`index.md` L50 | 误从 C2401 复制粘贴，将 **C1903** 尺寸写成 `55 x 92 mm`（实为 **`100 × 79 mm`**）、显示写成 `Mini HDMI 2.1`（实为标准 `HDMI 2.1`）、保护写成 `车规级 E-fuse`（实为反接保护）。 |
| **P0-3** | 标号错位 | `c1902/c1902.md` L114–120（及英文版）；`c2401/c2401.md` L73–74 vs L141–142（及英文版） | **C1902** 正面布局表 `#8~#15` 与图片蓝圈完全错位（重复两次 40-pin、漏掉 `#15` 电源灯）；**C2401** 的 `#8` 与 `#9` 网口在布局表和正文中 **2.5G 与千兆完全颠倒**；**C1903** Type-C 在规格表写 `USB 2.0` 而在布局表写 `USB 3.0 10Gbps`。 |
| **P0-4** | 页面破损 | `orin-nx-series/flashing.md` L80–106, L134, L169（及英文版） | **14 张刷机配图全部错堆在 `2.2` 节末尾**，第 3~5 章无图、`3.4` 空标题；且照抄 Orin Nano 误称 Orin NX 支持 SD 卡、误写普通功耗为 `7W/15W`（实为 `10W/15W/25W`，SUPER 解锁 `40W`）。 |
| **P0-5** | 裂图断尾 | `orin-nano-series/boot-logo.md` L41,63,66,71,74,89,91–93（及英文版） | 全部 **4 张 PNG 配图均为 22 字节损坏文本文件**（线上裂图）；`## 四、替换` 与 `## 五、刷入` **完全空白**；L71 对普通文件执行 `cd ...NVIDIA.fvmain.fdf.inc` 报错。 |
| **P0-6** | 残稿报错 | `orin-nano-series/4g-module.md` L14–23, L184, L193, L199, L236, L250（及英文版） | `方法一` 下 `1.1~1.4` 全部空白；`方法二` 中 `cd ../../` 跳错目录、未导出 `INSTALL_MOD_PATH` 即 `sudo -E make install` 污染宿主机、`cp` 多一层目录、刷机进错 `source/` 目录且 `flash.sh ... internal` 不适用于 Orin Nano NVMe。 |
| **P0-7** | 命令报错 | `gpio-tutorial/jetpack6-gpio.md` L41,44；`orin-nano-series/gpio.md` L51,54,134,158（及英文版） | JetPack 6 教程均**漏装 `gpiod` 包**（`libgpiod2` 或 `autoconf` 不含 `gpioget/gpioset/gpioinfo`）；`gpio.md` 向 `export` 误写字符串 `PQ.06`（只接受 `454`），C 语言示例为空壳注释，且两页 `devmem` 输出值（`0x0` vs `0x004`）不一致。 |
| **P0-8** | 命令报错 | `orin-nano-series/jetson-container.md` L24–25, L49（及英文版） | `cd jetson-containers` 后执行 `bash jetson-containers/install.sh` 路径重复必报不存在；挂载模型目录漏写 `-v` 参数必报错。 |
| **P0-9** | 配图张冠李戴 | `flashing-guide/devkit-flashing.md` ZH L34 / EN L28；`c1901-flashing.md` L28 | 官方套件刷机中文配了 C1902 图、英文配了 C2401 按键图；C1901 刷机配了 C1902 顶部排针图（C1901 排针在右侧竖置）；`devkit-flashing.md` ZH L111 `nvme0n1p1\` 漏空格。 |
| **P0-10** | 预发布残留 | `c2402/c2402.md` L21,29,30,47,138–141,153,185–189 | 残留 C2401 的“双 USB”/“`55x92mm`”/30Pin 排母 `VCC_IN` 与 `13/15/19/21 脚` 说明；相机规格留空；L153 半截话断尾；6 处硬编码 `linkzeelabs.com/wiki-new` 外链；无英文页导致点右上角切英文 404。 |
| **P0-11** | 死链漏链 | `en/index.md` L53–59；`en/faq/index.md` L61,177；`en/c2401.md` L178–183；`en/c1901.md` L155–159；`tensorrt.md` L65；`quick-start.md` 原生 `<a>` | 英文首页底部 3 卡片无链接；英文 FAQ 2 处失效锚点；`en/c2401` 刷机跳回中文页且 4 条支持无链接；`tensorrt.md` 指向 `pytorch.md` 失效锚点；`quick-start` 38 处原生 `<a href>` 未经 `withBase` 处理。 |
| **P0-12** | 新型号断档 & 孤立页泄露 | 全站公共页漏 `C1902 V2` / `C1903`；`comfyui.md` & `base-image.md` | `C1902 V2` 在选型、下载、快速开始、刷机、FAQ 等 10+ 页面全部缺席，`C1903` 无专属刷机说明；未挂侧栏的 `comfyui.md`（重复废稿）与 `base-image.md`（残缺笔记）仍被编译发布进 `dist/`，且 FAQ 截图暴露内部 QA 窗口标题栏。 |

---

## 四、模块一：站点配置与全局入口页（7 组，13 个文件）

### 1. `docs/.vitepress/config.mts`
- **风格与命名不一致**：
  - **L7–10 & L132–135**：分组名与子项完全同名（`快速开始` → `快速开始`、`Quick Start` → `Quick Start`），其余单页分组均做了父子区分，建议子项改为 `平台与教程概览` / `Overview`。
  - **L39–42 vs L28,34,35,47,53**：唯独 C1903 子项叫 `C1903 规格书`（其余均叫 `CXXX 产品介绍`，英文版 L166 已统一为 `C1903 Introduction`）；L39 `C1903 载板/套件` 斜杠无空格，L122 `FAQ / 故障排查` 有空格。
  - **L53 vs L105, L118**：中文侧栏混用全角括号 `（预发布）` 与半角括号 `(Jetson-IO)`、`(ISO 安装)`，建议统一为全角括号。
  - **L103 vs L222**：英文 `GPIO Tutorial` 用单数，而 `Jetson Orin Tutorials` / `Advanced Tutorials` 用复数，建议统一为 `GPIO Tutorials`。
  - **L124 & L243**：侧栏名 `常见问题与诊断` / `Common Issues & Diagnostics` 与页面 H1 `FAQ 与故障排查` / `FAQ & Troubleshooting` 不一致。
  - **L215–216 vs L234–237**：英文动词短语冠词不一（`Flash Orin Nano` 无 `the` vs `Flash the C1901` 有 `the`）。
- **导航结构与站点配置隐患**：
  - **L94–99 vs L111–120**：侧栏出现**两个同名“刷机教程”**分组，建议将系列刷机收敛或更名为 `核心卡刷机导览` vs `载板刷机指南`，并在 `C1902 刷入系统` 标明含 `V2`，补充 `C1903` 刷机入口。
  - **L249–283（顶栏 `nav`）**：漏掉了在售入门款 `C1901`；且 L261 将无英文版的预发布页 `C2402` 挂在中文顶栏，用户在 C2402 页切换英文会直接 404（建议合并为 `载板与套件` 下拉菜单，并为 C2402 建英文占位页或预发布期隐藏）。
  - **孤立页未排除**：未配置 `srcExclude`，导致未挂载侧栏的 `comfyui.md` 和 `base-image.md` 仍被打包进 `dist/`。
  - **L289 & L300–308**：`locales.en` 未配置英文 `description`，导致所有 `/en/*` 页面 `<meta name="description">` 输出中文。
  - **L314**：`socialLinks` 仍指向个人测试仓库 `https://github.com/Akariayumu/test_wiki`。

### 2. `docs/index.md` 与 `docs/en/index.md`
- **中文版 (`docs/index.md`)**：
  - **L7–8**：`控元科技产品文档` / `Jetson Orin 载板完整文档站`（“文档”重复）→ 建议 `tagline` 改为 `NVIDIA Jetson Orin Nano / NX 系列载板与套件技术中心`。
  - **L12–16**：Hero 区仅有 `快速开始` 单按钮，建议增补次按钮 `产品选型对比`（`/products/compare`）。
  - **L17–56**：卡片顺序 `C2401` 排在 `C1903` 前（与侧栏/选型表相反）；L52 按钮写 `查看规格书`（其余均为 `查看产品介绍`）；**L53–56 `C2402` 卡片漏配 `icon` 产品图**（可配 `/img/c2402-banner.webp`），造成三列卡片网格高低错位。
  - **L29 表述优化**：自称“第三方载板”略显生硬 → 建议改为 `Jetson Orin Nano / NX 公版兼容载板（V1.x），可直接刷入官方 DevKit 固件`。
  - **L36 表述优化**：`新增 REC 恢复按钮` 语义重复且漏核心指标 → 建议改为 `C1902 工业宽温升级版（-20℃–55℃），8 层 PCB，新增独立 REC 按键`。
  - **L50 事实错误**：将 `100 × 79 mm` 的 C1903 写成 `小尺寸高密度载板` → 建议改为 `工业级宽温载板/套件，支持全系列 SUPER 模式，提供双 M.2、多路 USB 与 GH1.25 扩展接口`。
- **英文版 (`docs/en/index.md`)**：
  - **L5–16 同步脱节**：漏掉了 Hero 右侧品牌 Logo 图（`logo.png`）；主副按钮跳 `/en/c1902/c1902` 和刷机页，**缺失 `/en/quick-start` 与 `/en/products/compare` 入口**；L7 `Kytech` 与中文页 `KYtech` 大小写不一。
  - **L24,31,38,45,52**：`View product intro` 中 `intro` 偏口语 → 建议改为 `View details`；L29 `4G/8G` 改为 `4GB/8GB`；L47 C1903 配图与中文版不一致。
  - **L53–59 严重漏链**：底部 `AI Development`、`Flashing Guide`、`Bilingual` **三张卡片全部漏写 `link` 和 `linkText`**，无法点击跳转。

### 3. `docs/quick-start.md` 与 `docs/en/quick-start.md`
- **中文版 (`docs/quick-start.md`)**：
  - **L1**：缺少 YAML Frontmatter（`title: 快速开始`）。
  - **L16 口语化**：`靠谱的售后服务：工程师三对一沟通` → 建议改为 `完善的技术支持：三对一工程师专属对接`。
  - **L22 事实过宽 & 术语不一**：`核心板` → 统一为 `核心卡`；“与原厂开发者套件完全兼容”不适用于接口形态不同的 C2401/C1903 → 建议改为 `我们提供多款基于 NVIDIA Jetson Orin Nano / Orin NX 核心卡的载板与整机套件，涵盖公版全兼容、高性价比量产、工业宽温及紧凑型嵌入式等方案：`。
  - **L24–31 遗漏型号**：产品表**漏列 `C1902 V2`**，缺少链向 `[产品选型对比](/products/compare)` 的引导；L26“删减优化”建议改为“精简优化”；L27 `USB3.0` 补空格。
  - **L46–94 路由隐患（共 19 处）**：`<div class="qs-step-links">` 内手写原生 `<a href="flashing-guide/...">`，VitePress 不会为其注入 `base` 或 `.html` 后缀，带尾斜杠 `/quick-start/` 访问时必 404 → 建议改用 `withBase` 或标准 Markdown 链接；同时补入漏掉的 `C1903 刷机`、`OpenClaw`、`ComfyUI`、`40-pin 扩展头配置`、`Pinmux 与设备树` 及 `FAQ`。
- **英文版 (`docs/en/quick-start.md`)**：
  - 同样缺 Frontmatter、漏 `C1902 V2`、存在 19 处无 `/en/` 前缀的原生 `<a href>` 相对路径隐患；L26–29 链接文字 `C1901 Product Introduction` 多了 `Product`。
  - **Chinglish 优化**：L11 重复两次 `edge computing` 和 `product` → `**KYtech (LinkZee Labs)** specializes in NVIDIA Jetson edge computing hardware, delivering high-performance, cost-effective carrier boards and embedded AI systems.`；L16 `three engineers dedicated to each customer` 歧义 → `3-on-1 engineering support team`；L22/31 `core modules` → `Jetson modules`；L26 `High cost-performance` → `Cost-effective`。

### 4. `docs/products/compare.md` 与 `docs/en/products/compare.md`
- **中文版 (`docs/products/compare.md`)**：
  - **全篇漏掉主力升级款 `C1902 V2`**（8 层板、`-20℃–55℃`、5Gbps 工业 Hub、独立 REC 键）。
  - **C1903 三处严重参数错写**：① **L44** 尺寸误写 `**55 x 92 mm**`（实测图纸为 **`100 × 79 mm` 载板 / `134.6 × 83 × 47.5 mm` 套件**），连带导致 L31/47/55 误称“小尺寸/紧凑”；② **L38** 显示误写 `1x Mini HDMI 2.1`（实为标准 `1 × HDMI 2.1`）；③ **L46** 保护误写 `车规级 E-fuse`（`c1903.md` 与英文版均为 `反接保护`）；④ **L34** 漏计 `2 × USB 2.0 (GH1.25-4P)`。
  - **其他技术细节校准**：**L18** Orin NX 8GB CPU 写成了 `8核`（NVIDIA 官方规格 Orin NX 8GB 为 **6 核**，16GB 为 8 核）；**L39** CAN 行建议区分 `仅引出 TX/RX（需外接收发器）`（C1901/C1902）与 `板载收发器（CAN_H/L）`（C1903/C2401）；**L40** C2401 30-pin 漏列 `GPIO / SPI / USB 3.0` 且误把独立 GH1.25 上的 `CAN` 混入其中。
  - **风格与病句**：**L7**“一张表看清……帮你快速决定买哪块”过于口语且实际有 3 张表；**L13 vs L30** 混用 `4GB` 与 `4G`；**L18** `6核 A78AE @1.5GHz` 缺空格；同页范围符混用 `-` / `~` / `–`，乘号混用 `1x` / `x` / `×`，括号全半角混用；**L42** `POE` → `PoE`；**L47** 病句 `成本敏感的量产的视觉/AI 项目` → `成本敏感的视觉 / AI 量产项目`。
- **英文版 (`docs/en/products/compare.md`)**：
  - 同样漏 `C1902 V2`、L18 Orin NX 8GB 核数笔误、L34 漏 C1903 USB 2.0、L40 C2401 30-pin 不准、**L44 C1903 尺寸误写 `55 x 92 mm`**。
  - **L7 语法残缺**：`A single table covering..., so you can...` 前半句无谓语动词；**L45** 英文页误用中文全角 `℃` 与 `~`（应改为 `0 to 45 °C` / `-20 to 50 °C`）。

### 5. `docs/resources/downloads.md` 与 `docs/en/resources/downloads.md`
- **中文版 (`docs/resources/downloads.md`)**：
  - **漏掉 `C1902 V2` 专节**；章节顺序 `C2401` 排在 `C1903` 前；**L7** 导语提及“原理图”但下方所有表格均无原理图行。
  - **L38 资料漏链**：C2401 接口布局图仅链了背面图 `/img/c2401-layout.png`，漏掉正面图 `/img/c2401-layout-front.png`。
  - **L47–50 C1903 漏项**：机械尺寸图仅链了套件外壳图，**漏掉最关键的 PCB 载板尺寸图 `/img/c1903-dimensions-board.webp`**；漏掉 `GH1.25 外设引脚图` 行与 `[USB 配置说明](/orin-nano-series/usb-config)`。
  - **细节**：全半角括号混用；L37 `拓展` → `扩展`；L50 `见 [刷机...` 纯中文间多余空格。
- **英文版 (`docs/en/resources/downloads.md`)**：
  - 同步存在漏 `C1902 V2`、C2401 漏正面图、C1903 漏载板尺寸图与 GH1.25 引脚图问题；
  - **L13,17,24,28,35,39,49** `In preparation, contact us` 存在英文逗号粘连（Comma Splice），建议改为 `Available upon request — contact us`；**L14,25** 相比中文版丢掉了 `#尺寸` 锚点；**L52** `## General` 建议改为 `## General Resources`。

### 6. `docs/hardware-bsp/pinmux-device-tree.md` 与 `docs/en/hardware-bsp/pinmux-device-tree.md`
- **中文版 (`docs/hardware-bsp/pinmux-device-tree.md`)**：
  - **L7 vs L75**：`Jetson Orin Nano / NX` 与 `Orin NX/Nano` 顺序及斜杠空格不一致；**L9, L45** `:::danger` 无空格。
  - **L57 & L195 型号漏项**：漏列 `C1902 V2` 与 `C1903`（且需注明 C1903/C2401 非 40-pin 不适用 Jetson-IO 40-pin 菜单）；**L73–107 vs L113–131** 同级 H3 编号有无不一。
  - **表述优化**：L18“把引脚切为”→“将引脚切换为”；L84–85 `drive setting`、`3.3V tolerance`、`open-drain` 建议补中文译名（驱动强度、3.3V 耐压、开漏）；**L90** 翻译腔长定语 `表格的 **Generate DT File** 会生成名称取决于表格输入的三个文件：` → `点击表格中的 **Generate DT File** 按钮，将生成以下三个文件（文件名前缀取决于表格中填写的板卡名称）：`。
- **英文版 (`docs/en/hardware-bsp/pinmux-device-tree.md`)**：
  - **标题大小写中途突变**：前文与末尾用 Sentence case，L109 `### Locate the Node`、L127、L134 突变为 Title Case；
  - **L49–53** 漏译中文版过渡导语；**L71–103** 丢了步骤序号 `1.~4.`；**L160–168** 丢了代码块内的分类注释；
  - **L182 & L192 内部催稿口吻外泄**：`## LinkZee board-specific data still required` 与 `Published files belong in Hardware Resources` 像对内编撰备注，建议改为 `## LinkZee Board-Specific BSP Status` 与 `Published files are available in [Hardware Resources](/en/resources/downloads).`。

### 7. `docs/faq/index.md` 与 `docs/en/faq/index.md`
- **中文版 (`docs/faq/index.md`)**：
  - **L2/L5** 与侧栏标题不一致；**L7, L39, L98, L155, L163** 全面漏列 `C1902 V2` 与 `C1903`（尤其 **L39** 只写“短接 FC REC 与 GND”，忽略了 C1902 V2 / C1903 / C2401 按 `REC` 键或拨码开关进入恢复模式；**L98** USB 降速排障漏 C1903；**L163** CAN 收发器漏 C1903）。
  - **L69 & L89 内部 QA 痕迹泄露**：截图 `/img/power-01-nvpmodel-and-clocks.webp` 与 `/img/storage-01-nvme-and-rootfs.webp` 顶部窗口栏暴露内部任务名 `Wiki Priority QA Corrections - Authentication`，且 **L87** 正文把内部脱敏自检语 `，未显示设备序列号` 直接写进了用户文档（应裁掉窗口顶栏并删去该句）。
  - **细节**：L30 孤立出现一次 `**诊断：**`；L47 默认假定必用 VMware；L144/155 `pinmux` 小写与 L108 `Pinmux` 不一。
- **英文版 (`docs/en/faq/index.md`)**：
  - **2 处失效锚点死链**：**L61** `#common-issues`（目标页实为 `#troubleshooting`）、**L177** `#_5-common-issues`（目标页实为 `#_5-troubleshooting`）；
  - **L75** 同样暴露内部备注 `without exposing the drive serial number` 及 QA 窗口标题截图；**L36 & L44** 将中文版清晰的 `1.2.3.4.` 排障列表压成密集长段落，且 8 个 H3 标题下无引导语直接贴代码块。

---

## 五、模块二：载板硬件产品页（6 组，11 个文件）

### 8. `docs/c1901/c1901.md` 与 `docs/en/c1901/c1901.md`
- **中文版 (`docs/c1901/c1901.md`)**：
  - **L11 累赘与混称**：同句混称“载板/底板”，三次重复“进行”→ 建议精简为 `**C1901**（Jetson Orin Nano Lite）是一款面向 **Jetson Orin Nano / Orin NX** 核心卡的高性价比载板。该载板基于官方参考设计精简并优化部分外围功能，在保留核心接口体验的同时显著降低整机成本。`
  - **L25–28, L45–65 格式分裂**：同页电压出现 3 种写法（`12V（兼容9-19V）` / `12V(9V~19V)` / `12V (兼容9-19V)`）；`NVME` → `NVMe`；`POE` → `PoE`；`4G/8G` → `4GB/8GB`；同页混用 `1x` 与 `2 x`；L60–65 注意事项漏了“禁止带电插拔核心卡”。
  - **L35–39 语病与歧义**：L35“调整了功耗墙，该问题曾导致……的问题”句式杂糅；L37 六条更新挤成单行未用 `<br/>`，且第 5 条“不再支持旧核心卡”与 L67 兼容性表冲突；L39“5.1.4 版本的固件”应明确为 **JetPack 5.1.4** 并附刷机/设备树链接。
  - **L67–92 规格遗漏与过时**：**L71–72 兼容性表漏掉主力款 `Orin NX (16GB)`**；**L82 功能对比表误将 C1902 电源接口写成旧版 `DC5521`**（V1.1.1+ 已改为 `DC5525`）。
  - **L93–141 布局表核查**：L99 `序号` vs L117 `#` 表头不一；**L107** 写 40Pin 含 `3 x I2C`（实图仅 Pin 3/5 与 Pin 27/28 共 **2 路 I2C**）；**L119 & L121** 背面 `#1`（M.2 Key M）与 `#3`（M.2 Key E）对照实图防呆口与 L65“对称布局”说明**疑似写反**，请核实板面丝印；L130 与 L136 `RTC 电池` 重复立节，且 L140 漏链 `/orin-nano-series/peripherals#_5-rtc接口`。
- **英文版 (`docs/en/c1901/c1901.md`)**：
  - **L152–163 严重漏链与残留**：`## Support` 标题与其他页 `## Technical Support` 不一；**L155–159 连续 5 条教程全部是纯文本未加超链接**，且漏译 `Hardware Resources`；**L163** 残留旧 BookStack 外链页脚。
  - **误译与格式**：L35/37 将“功耗墙”直译成 `power wall`（应为 `hardware power limit`）；L39 将 JetPack 5.1.4 误译成 `firmware V5.1.4`；L46 误用全角 `℃`。

### 9. `docs/c1902/c1902.md` 与 `docs/en/c1902/c1902.md`
- **中文版 (`docs/c1902/c1902.md`)**：
  - **L2** 残留 Docusaurus 字段 `sidebar_position: 1`；**L188** 残留旧 BookStack 来源页脚。
  - **L18–23 vs L35–40 整段重复**：`:::tip 核心特性` 与下方 `## 产品特点` 四条内容几乎一字不差重复；**L25, L29** 用 `### 正面` / `### 背面` 作外观图图注，与布局区标题重名污染目录。
  - **L62 vs L93 vs L110 规格自相矛盾**：同页分别写成 `4x USB3.2 (10Gbps)` 与 `4x USB 3.0`；L96–98 对比表局部混用 `✅/❌` Emoji；L76“对称相反”语病、L80“后果自负”措辞生硬。
  - **L114–120 重大标号错位事故**：正面接口表 `#8~#15` 与 `/img/c1902-layout-front.png` 蓝圈数字**整体错位**（在 `#8` 和 `#15` 重复列了两次 40-pin，导致 CSI `8–9`、启动按钮 `10`、12-pin `11`、CAN `12`、风扇 `13`、40-pin `14` 全部顺延错 1 位，并漏掉了 `#15` 电源指示灯）；背面 L129–131 `#17` 与 `#19` 同样疑似把 Key E 与 Key M 2230 写反。
- **英文版 (`docs/en/c1902/c1902.md`)**：
  - 同步继承了特性重复、USB 3.2/3.0 矛盾、**L113–119 `#8~#15` 标号整体错位**、L54 全角 `℃`、H2 大小写混用及 **L187** 含未译中文公司名的旧站页脚。

### 10. `docs/c1902v2/c1902v2.md` 与 `docs/en/c1902v2/c1902v2.md`
- **整体评价**：全站质量最高的硬件标杆页，仅需微调细节：
- **中文版 (`docs/c1902v2/c1902v2.md`)**：
  - **L11**：“该底板……对芯片进行工业级优化……兼容官方设计套件” → 改为“该载板基于官方参考设计重构，选用工业级关键元器件并优化供电架构，在完整兼容官方开发者套件功能的同时具备更高的稳定性与可靠性。”
  - **L29 vs L70**：`基础工业级` 与 `工业级` 口径微调统一；**L35 vs L72** `9V–19V` vs `9–19V` 统一单位。
  - **L43 vs L79 对比表误导**：原厂与 V1.1.1 写 `Type-C（USB 3.0）`，而 V2 加粗写 `**1 × Type-C（USB 3.2）**`——实际三者 Type-C 通道速率相同（均为 10Gbps），仅更换了 Type-A 的 Hub，建议取消差异化加粗。
  - **L126–130**：V2 将原板载 PWR 键改为 `REC` 键，建议补一句提示“如需外接开关机按键，可通过 12-pin 接口 Pin 12 (`PWR BTN`) 与 Pin 11 (`GND`) 引出”；**L154** 尺寸图前补文字外廓尺寸 `100 × 79 mm`。
- **英文版 (`docs/en/c1902v2/c1902v2.md`)**：
  - 100% 同步；建议将 L29 `Basic industrial` 优化为 `Entry-level industrial`，L48/71 全角 `℃` 改为 `°C`，并同步取消 L79 Type-C 误导加粗。

### 11. `docs/c1903/c1903.md` 与 `docs/en/c1903/c1903.md`
- **中文版 (`docs/c1903/c1903.md`)**：
  - **L2, L5, L7–13 离线规格书残留**：标题孤立叫 `规格书`；L7–13 `<div class="cover-subtitle/version">` 在全站 CSS 中未定义，渲染为裸文本；全篇 **25 处 `<div align="center">图 X / 表 X</div>`** 与其他所有页面斜体图注格格不入；L21–38 将注意事项和版本记录置于 `产品简介` 之前，且混称“开发板”。
  - **L41 明显错字与语病**：`是一款针基于官方方案` 多出“针”字，连用三次“载板”，`Super模式` 未大写且缺空格。
  - **L65 误导表述**：将 2 路 GH1.25-4P 线对板插座写成 `2个普通USB2.0座子`，极易被误认为标准 Type-A 母座。
  - **L80–83 vs L115 硬件参数自相矛盾**：① **L81 规格表写 `1x Type C (USB2.0) 烧录固件用`，L115 布局表 `#18` 却写 `USB Type-C (USB 3.0 10Gbps)`**；② L80 规格表漏计 `2 × USB 2.0 (GH1.25-4P)`；③ L83 漏列 `GPIO`。
  - **L155–200 功能漏项**：拨码开关只写了 2 和 3，**漏写丝印 `1: CAN 120R`（120Ω 终端电阻）与 `4: 预留`**；GH1.25 表未提示信号引脚为 **3.3V 电平**；漏写 `#27` RTC 电池说明小节；`## 技术支持` 漏链必配的 `[USB 配置说明](/orin-nano-series/usb-config)`。
- **英文版 (`docs/en/c1903/c1903.md`)**：
  - **L46 严重误导译法**：将 GH1.25 USB 2.0 译成 `two standard USB 2.0 connectors`（应改为 `two 4-pin GH1.25 USB 2.0 connectors`）；
  - 同步存在 **L60 vs L90 Type-C 速率矛盾**、L64 全角 `℃`、漏拨码 1 `CAN 120R`、漏 3.3V 电平提示及漏 `/en/orin-nano-series/usb-config` 链接。

### 12. `docs/c2401/c2401.md` 与 `docs/en/c2401/c2401.md`
- **中文版 (`docs/c2401/c2401.md`)**：
  - **L73–74 vs L141–142 重大标号颠倒**：接口布局表写 `8: 2.5G / 9: 千兆`，而 `### RJ45 网口` 正文写 `千兆网口 (8): RTL8111 / 2.5G网口 (9): RTL8125`，**完全相反**（且 L142 漏链 `/orin-nano-series/network-driver`）。
  - **L35/49 (`9.5V-30V`) vs L83 (`10V-30V`)**：同页输入电压下限不一（`9.5V` 实为欠压保护点）。
  - **L85–88 供电歧义**：板载 Type-C 仅能刷机，但电源表列 `USBC-PD 需支持 | 20V...` 未解释需配合 **PD 转 XT30 诱骗线**接入 XT30 口，极易误导用户往 Type-C 口插 PD 充电器。
  - **其他细节**：L45 `其余接口` 漏列 30-pin 上的 `SPI / GPIO / USB 3.0`；L66–73 中文布局表夹杂 `REC Button`、`4Pin Switch` 等英文名；L90–107 漏写拨码开关 1 的 CAN `120Ω` 终端电阻功能；L148 重复贴背面图；L154 建议注明含外凸连接器总尺寸 `94 × 56 mm`。
- **英文版 (`docs/en/c2401/c2401.md`)**：
  - **L178 跨语言错链**：`/flashing-guide/c2401-flashing` 漏写 `/en` 前缀，点击跳回中文站！
  - **L179–183 连续 4 行技术支持漏加链接**，漏译 `Hardware Resources`；**L186** 残留含拼写错误 `c2401-inroduction` 与中文公司名的旧站页脚；同步存在 `#8/#9` 网口颠倒、电压不一、全角 `℃` 等问题。

### 13. `docs/c2402/c2402.md`（预发布，暂无英文版）
- **跨板卡复制粘贴残留（上线前必清）**：
  - **L21 & L30 vs L45 & L69**：简介和特点照抄 C2401 写 `双 USB 接口` / `双 USB3.0`，与实板 **4 × USB 3.2 Type-A（双层堆叠 × 2）+ 2 × GH1.25 USB 2.0** 严重矛盾；
  - **L29**：`外围尺寸仅 **55x92mm**` 极可能照抄自 C2401（实拍图比例约 `1.43:1` 且容下 2280 SSD + 纵向双 M.2，请核实真实尺寸并在 `## 产品尺寸` 补图纸与数值）；
  - **L138–141**：在 `### GH1.25 外设接口` 下方原样残留了 **C2401 30Pin 拓展排母的 4 条说明**（`VCC_IN`、`PG 信号`、`13/15/19/21 脚的 USB 3.0`），与 C2402 硬件完全无关，仅应保留第 2 条 `3.3V` 电平说明！
- **空项、断句与链接问题**：
  - **L47**：规格表 `| 相机接口 |  |` 完全留空，L48 漏 `GPIO`；L98 `XT30 (2+2)` 缺少 2 根 CAN 信号针极性定义图；L102 `USBC-PD` 需加诱骗线说明；
  - **L143**：含草稿标记 `（待修改）`；**L153** `具体的模块驱动设置方法参考` **半截话未写完**（应补完并链向 `/orin-nano-series/4g-module`）；L157 需明确双层 RJ45 上下口分别对应 `RTL8111` 还是 `Intel I210`；
  - **L179–181**：`*背面 GH1.25 外设接口平视图*` 方位词有误（实为正面上沿的**后侧**平视图，非 PCB 背面）；
  - **L141 & L185–189**：**6 处硬编码绝对域名 `https://www.linkzeelabs.com/wiki-new/...html`**，应全部改为站内根相对路径 `/orin-nano-series/...` 与 `/resources/downloads`，并在正式发布时补齐英文版 `docs/en/c2402/c2402.md`。

---

## 六、模块三：刷机指南与系列刷机页（8 组，16 个文件）

> **模块级架构建议**：将 `orin-nano-series/flashing.md` 与 `orin-nx-series/flashing.md` 精简为**核心卡刷机导览分流页**（说明各自核心卡支持的存储介质、功耗模式与 SUPER 兼容载板，再分流跳转到 `flashing-guide/*`），消除 90% 重复内容；同时在 `c1902-flashing.md` 补入 **C1902 V2** 按键恢复法，并为 **C1903** 新增专属刷机说明。

### 14. `docs/flashing-guide/ubuntu-sdkmanager.md` 与 `docs/en/flashing-guide/ubuntu-sdkmanager.md`
- **中文版**：
  - **合规与外链问题（L13, L21）**：提供百度网盘 `.exe` 裸链并引导“自行百度搜索：vmware16密钥”，官方技术文档存在版权合规风险（VMware Workstation Pro 现已对个人免费，建议对齐英文版引导官网下载）。
  - **宿主版本冲突（L31）**：“这里以 20.04 为例”与后续各刷机页的 **JetPack 7.2（要求 Ubuntu 22.04 / 24.04，不支持 20.04）** 冲突 → 建议明确宿主矩阵并主推 **Ubuntu 22.04 Desktop**。
  - **排版与缺漏**：L9 未点明在 Windows 宿主机操作（或原生 Ubuntu 主机可跳过第 1 章）；L17–51 连续 12 行单句无句号、未用有序列表；L55 `15-32-12.png` 与 L57 `15-33-59.png` 顺序颠倒；L45 `300G` 改为 `≥ 120 GB`；L75“进入 Jetson SDK”漏掉官方下载超链接；L89–93 贴了登录图却漏写 `sdkmanager` 启动命令与账号登录说明。
- **英文版**：
  - 结构比中文版更清晰，但 **L11/L45 写 `disk ≥ 60GB`**（与中文 300G 冲突且缓存固件+备份必满盘，建议统一改为 `≥ 120 GB`）；L69 `apt install ./sdkmanager_*.deb` 漏写 `cd ~/Downloads`；L73 网页截图位置错后；L89 `Next Steps` 漏 `JetPack 7` 与 `C1903`；**L94** 残留旧 BookStack 外链。

### 15. `docs/flashing-guide/devkit-flashing.md` 与 `docs/en/flashing-guide/devkit-flashing.md`
- **中文版**：
  - **L8 旧站外链残留**：`[vmware虚拟机安装说明](https://www.linkzeelabs.com/wiki/books/...)` 应改为站内 `/flashing-guide/ubuntu-sdkmanager`。
  - **L34 配图张冠李戴**：使用了 C1902 载板图 `/img/wiki-0q7a9416.webp`（排针在顶部），而官方套件 `FC REC` 排针位于核心卡正下方！
  - **L111–112 命令拼接隐患**：`nvme0n1p1\` 与 `flash_t234_qspi.xml"\` 反斜杠前**漏了空格**；全篇代码块用 `shell`（其余篇用 `bash`），路径写死 `/home/ubuntu/...`（应改 `~/...`）。
  - **L132–160 宿主/目标机未区分（高危）**：未说明 `sudo reboot -f forced-recovery` 在 **Jetson 终端**执行，极易被误敲进 Ubuntu 宿主机导致宿主机重启；`3.1 备份固件` 未将恢复命令拆出 `3.2 恢复固件`。
  - **排版细节**：L10,80,126,128 标题 `1.使用...` 句点后漏空格；全文 20+ 处漏中西文空格；`SDK manager` / `super` 大小写不一；L69 应强化为“识别后**请及时取下跳线帽**”；图片 Alt 全是原始文件名。
- **英文版**：
  - **L28 配图更严重错配**：放了 C2401 微动按键 + XT30 照片 `/img/wiki-0q7a2475-1.webp`，与正文“短接 FC REC 跳线帽 + DC 电源”完全矛盾；所有 `::: warning` 被降级为 `>`；L126 漏译“在主机上”。

### 16. `docs/flashing-guide/c1901-flashing.md` 与 `docs/en/flashing-guide/c1901-flashing.md`
- **中英文共性问题**：
  - **L28 严重配图错误**：用了 **C1902** 照片 `/img/wiki-0q7a9416.webp`（顶部横排针），而 **C1901** 的 12-pin 排针在右侧边缘竖置，极易误导短接针脚！
  - **L49 硬件失实**：写支持刷入 `内存卡 / microSD card`（C1901 及量产卡无 SD 卡槽，应改为 `NVMe 固态硬盘 / U 盘`）。
  - **ZH L84, L91 命令折行丢失**：单行长达 231 字符且夹杂连续 3 空格（英文版折行正常）；路径写死 `/home/ubuntu/...`；`3.1` 未拆 `3.2`；L110 `forced-recovery` 未标注执行终端。
  - **缺失 C1901 专属提示**：未说明 SUPER 模式仅支持 Orin Nano，未引导刷机后查阅 C1901 V1.3 专用设备树与 [USB 配置说明](/orin-nano-series/usb-config)。

### 17. `docs/flashing-guide/c1902-flashing.md` 与 `docs/en/flashing-guide/c1902-flashing.md`
- **中英文共性问题**：
  - **核心缺漏——完全未覆盖 `C1902 V2`**：`c1902v2.md` 技术支持直接链到本页，但本页 `1.2 / 2.1 / 3.1` 只讲了 V1.x 跳线帽短接法，**只字未提 C1902 V2 新增的独立 `REC` 按键法**（断电按住 REC 键上电，可配 `/img/c1902v2-rec-button.webp`）。
  - **L49 硬件失实**：误列 `内存卡 / microSD card`；`U盘` 缺空格；路径写死 `/home/ubuntu/...`；`3.1` 未拆 `3.2`；L114 未区分 Jetson 终端与宿主机终端；文末缺 `/orin-nano-series/usb-config` 下一步指引。

### 18. `docs/flashing-guide/c2401-flashing.md` 与 `docs/en/flashing-guide/c2401-flashing.md`
- **中英文共性问题**：
  - **L25 & L55 严重操作隐患**：介绍了将背面**拨码开关 3** 拨至 `ON` 进入恢复模式，但**全文漏写刷机识别后/完成后必须将拨码开关 3 拨回 `OFF`**（否则刷机中途重启进入 initrd 阶段会再次锁死在恢复模式导致超时失败）！且 L29 漏配背面拨码图 `/img/c2401-switch-rec.png`。
  - **L73, L113 动作顺序别扭**：“按住 REC 按钮，使用 Type-C 连接电脑并接通电源”单手难操作 → 改为“断电下先连好 Type-C 数据线，再按住 `REC` 按钮接通电源”。
  - **缺失后续引导**：未提醒 C2401 刷完系统后需安装 **2.5G 网卡驱动（RTL8125）** 与 **USB/UART1 设备树**，未注明 SUPER 模式仅限 Orin Nano；同样存在 `/home/ubuntu/...` 写死与终端未区分问题。

### 19. `docs/flashing-guide/jetpack7-flashing.md` 与 `docs/en/flashing-guide/jetpack7-flashing.md`
- **中文版**：
  - **L55,79,97,112,124 编号孤立**：全模块唯一使用汉字序号 `## 一、~ ## 五、` 的文档（且与同页无编号 H2 及英文版 `1.~5.` 冲突）。
  - **L29–53 流程与章节错序**：Mermaid 流程图 Step 1 对应正文第 2 节，不得不加 L53 映射补丁 → 建议将「确认当前固件版本」调为第 1 节即可自然对齐。
  - **L10, L23, L150 型号漏项**：只提 `C1901/C1902` 跳线帽，漏掉 **`C1902 V2 / C1903 / C2401` 按 `REC` 按钮进入恢复模式**。
  - **L84 串口参数缺失**：漏写波特率 `115200 8N1`、TX/RX 交叉接法，且未说明 Pin 3/4/7 仅适用于 12-pin 载板（C1903/C2401 应接独立 GH1.25 `UART DEBUG` 口）；L67 通配符 URL 不可直接点击下载；L153 写死 `/home/ubuntu/...`。
- **英文版**：
  - **L159** 引用的章节名 `"Flash SUPER firmware via command line"` 与目标页实际标题 `2. Flash SUPER Firmware from the Command Line` 不一致且缺锚点；其余同中文版。

### 20. `docs/orin-nano-series/flashing.md` 与 `docs/en/orin-nano-series/flashing.md`
- **中英文共性问题**：
  - **高度冗余**：与 `ubuntu-sdkmanager.md` + `c1902-flashing.md` 90% 重复；标题泛化为 `# 刷机教程`（与 NX 页完全同名）。
  - **L66** `dpkg -i sdkmanager_...deb` 漏写 `cd ~/Downloads`；**L153, L160** 丢失 `\` 折行（单行超 215 字符）；**L179–186** 将 Jetson 端 `forced-recovery` 代码块与宿主机 `cd/apt` 代码块零文字紧挨排列，极易敲错终端！
  - **L188 配图错位**：`wiki-VXwimage.png`（注释 292~296 行代码图）错插在备份命令之前，应移至 L200 末尾；L123 漏掉拔跳线帽警告；未覆盖 C1902 V2/C1903/C2401 的 REC 按键与 JetPack 7。
  - **英文版特有问题**：在英文页向海外读者提供 **Baidu Netdisk（百度网盘）** 与 `search online for: vmware16 key`（L13–18）；L80/145 标题词性不平行；L97 Chinglish `pay attention to the timing of your operations`。

### 21. `docs/orin-nx-series/flashing.md` 与 `docs/en/orin-nx-series/flashing.md`
- **中英文灾难级问题（P0-4）**：
  1. **L80–106 配图批量错位事故**：原本属于第 3、4 章的 **14 张配图全部错堆在 `2.2 安装 SDK Manager` 末尾**，导致第 3~5 章一张图都没有、`### 3.4 等待下载完成` 沦为空白标题！
  2. **L134 硬件错误**：Orin NX 无 SD 卡槽，却照抄 Nano 写 `内存卡 / SD card`！
  3. **L169 功耗档位全错**：照抄 Orin Nano 写“25W & MAXN SUPER 为 SUPER 独有，普通模式只有 7W 和 15W”——实则 **Orin NX 普通模式为 `10W / 15W / 25W`，SUPER 模式解锁的是 `40W / MAXN SUPER`**！
  4. **漏标 SUPER 载板供电限制**：未警告官方 DevKit、C1901、C2401 不支持 Orin NX 开启 SUPER 模式（仅 C1902 V1.1+/V2 与 C1903 支持）；且固件路径写死 `ORIN_NANO_TARGETS`。
  - 其余百度网盘、漏 `cd ~/Downloads`、紧挨代码块等问题同第 20 篇。

---

## 七、模块四：GPIO 专题与扩展排针页（4 组，8 个文件）

> **模块级架构建议**：明确四篇 GPIO 相关文档的职责边界——`expansion-header.md` 负责 **40-pin 引脚复用配置（Jetson-IO）**；`orin-nano-series/gpio.md` 作为**编程与选型总入口**（介绍 Python `Jetson.GPIO` 与 C `libgpiod` 例程，命令行底层操作直接分流链接至 `jetpack5-gpio` / `jetpack6-gpio`），消除重复与寄存器数值冲突。

### 22. `docs/orin-nano-series/expansion-header.md` 与 `docs/en/orin-nano-series/expansion-header.md`
- **中文版**：
  - **L15–26 默认引脚表与本页实机截图矛盾**：表格把默认处于 `unused` 未启用状态的 `SPI1`、`I2S`、`PWM` 列为“默认占用”，且 L25 写 `其余 | 默认 GPIO`（在 JetPack 6/7 下实为 `unused`），同时混用三套功能名（丝印 `SPI0` vs 表格 `SPI1` vs Jetson-IO `spi1`）→ 建议改为「硬件丝印名 | Jetson-IO 功能名 | 物理引脚 | 默认状态」四列表。
  - **L45 配图位置错前 & L60 按键说明过时**：L45 `header-menu` 图应移至 L47 `### 接头界面` 下；**L60** 仍按旧版单列复选框写“未启用的功能对应引脚即作为 GPIO 使用”，而 L64 的 **JetPack 7.2.1 截图已变为 `[*] unused  [ ] gpio  [ ] <sfio>` 三列单选**（必须手动切到中间 `gpio` 列才启用 GPIO）！
  - **L152 `gpioset` 版本陷阱**：在 Ubuntu 24.04（`libgpiod` v2）与 Ubuntu 22.04（`libgpiod` v1）下 `gpioset` 语法不同（v1 需 `--mode=wait`，v2 移除了 `gpiofind`），需区分标注。
  - **L158–164 载板兼容性漏项**：漏列 `C1902 V2`、漏提 `C1902 V1.0` 同样存在 12/35/38/40 脚不可用问题、**漏列 `C1903`（采用 GH1.25 无 40-pin）**。
  - **风格细节**：L2 半角括号 vs L5 全角括号；L27/39 `>` 与 L74/136 `:::` 混用；L7“当普通 GPIO”、L80“不想进菜单时”略口语化。
- **英文版**：翻译地道、截图纯英文、内链全部准确；需同步修正上述默认表、三列 `unused/gpio/sfio` 说明、`gpioset` 版本差异与 C1902 V2/C1903 兼容说明。

### 23. `docs/gpio-tutorial/jetpack5-gpio.md` 与 `docs/en/gpio-tutorial/jetpack5-gpio.md`
- **中文版**：
  - **L2, L5 标题缺空格**：`Orin Nano&NX JetPack5 GPIO教程` → 建议改为 `JetPack 5 GPIO 配置说明（Orin Nano / NX）`；缺 `outline: deep`。
  - **L7, L13, L28 标题高度重复**：三个标题几乎同名（“获取 GPIO 口的引脚名称与编号”），且全文“GPIO 口”偏口语 → 统一改为“GPIO 引脚”；L15–24 空格伪表格应改为标准 Markdown 表格。
  - **权限上下文与清理漏项**：L26 未注明在 Jetson 终端执行；`2.2` 执行 `sudo bash` 后未提醒 `2.3/2.4` 必须在同一 root shell 中运行，文末漏写释放引脚 `echo 454 > /sys/class/gpio/unexport`；顶部缺“仅适用 JetPack 5，JetPack 6+ 请转阅……”提示框与 **3.3V 电平安全警告**。
- **英文版**：L2/L5 同样缺空格；L7/L28 `Get the Pin Names and Numbers of the GPIO Pins` 句式啰嗦（建议 `Identify GPIO Pin Names and Sysfs Numbers`）；L47/59 `high level` → `logic high (3.3V)`。

### 24. `docs/gpio-tutorial/jetpack6-gpio.md` 与 `docs/en/gpio-tutorial/jetpack6-gpio.md`
- **中文版**：
  - **L41 & L44 装错软件包（必报错）**：`sudo apt install busybox libgpiod2` 仅安装动态库，**不包含 `gpioget` / `gpioset` / `gpiofind` 命令行工具**！必须改为安装 **`gpiod`**（`sudo apt install busybox gpiod`）。
  - **L72 跨页寄存器值冲突**：输出模式写 `sudo busybox devmem 0x02430070 w 0x0`，而 `orin-nano-series/gpio.md` L176 写 `0x2430070 w 0x004`，需全站统一格式并加注释说明位含义。
  - **L78 挂起行为未解释**：`gpioset --mode=wait ...=1` 会前台阻塞维持电平（不返回提示符属正常现象，按 `Enter` 或 `Ctrl+C` 结束），不说明会导致新手误判死机。
  - **安全警告缺失**：缺少 `::: warning` 说明 **`devmem` 直写物理寄存器在重启后失效**（持久化请用 Jetson-IO 或 Pinmux 设备树）及 3.3V 电平限制；L2/L5 标题缺空格；L17–33 两段 `text` 伪表宜改为 Markdown 表格。
- **英文版**：同步修正 `gpiod` 包名、`--mode=wait` 说明、标题空格与 `devmem` 非持久化警告；L55 句式可精炼。

### 25. `docs/orin-nano-series/gpio.md` 与 `docs/en/orin-nano-series/gpio.md`
- **中英文共性代码 Bug（P0-7）**：
  1. **L51 & L54 sysfs 脚本必败**：向 `/sys/class/gpio/export` 和 `unexport` 写了字符串 `echo PQ.06`（内核只接受数字编号 **`echo 454`**，甚至用 `2>/dev/null` 吞掉了报错）！
  2. **L121–145 C 语言例程为空壳残稿**：核心逻辑仅一行注释 `// Set gpio direction...`，打开芯片后直接退出，无任何读写操作。
  3. **L158 JetPack 6 装错包**：写了源码编译依赖 `automake autoconf libtool`，**漏装 `gpiod`**，导致 L164 `gpioinfo` 直接报错未找到命令！
  4. **L204–209 高危删除系统包目录**：`sudo rm -rf /usr/lib/python3*/dist-packages/Jetson` 会破坏 `apt/dpkg` 数据库，应改用 `sudo apt remove python3-jetson-gpio`。
- **风格与范围问题**：H2 编号首尾不一、冗余 `---`、提示全用 `>`、`40PIN`/`40针` 混写、`apt` 与 `apt-get` 混用、反引号命令替换与 `$()` 混用；漏标 Orin NX 适用性与 C1901 旧版/C1903/C2401 引脚差异；文末漏链 `jetpack5-gpio` 与 `expansion-header`。

---

## 八、模块五：Orin 系列说明与外设连接教程（8 组，16 个文件）

### 26. `docs/orin-nano-series/intro.md` 与 `docs/en/orin-nano-series/intro.md`
- **中文版**：
  - **核心卡、公版 DevKit 与 C1902 混为一谈（L23–45）**：L23–25 贴公版套件图、L31–40 列公版参数（预装网卡、DP 1.2、无 RTC），但 **L42/L44 标注图实拍的却是控元 `C1902 V1.1`（印有 `RTC接口`）**，应明确区分“核心卡规格”与“参考载板示例”并链向 `/products/compare`。
  - **技术细节**：**L57** 误写支持 **`eMMC`**（Orin Nano 全系无板载 eMMC，且仅套件版核心卡带 SD 卡槽）；L13 算力表未注明 `34/67 TOPS` 为 SUPER 模式；L14“512 核 CUDA 核心”词语重复（改为“512 个 CUDA 核心”）；L55“使用官方原装电源”对 DC5521（C1901）和 XT30（C2401）不适用。
  - **风格**：H2 叠加多余 `---`；`22 针` 与 `12Pin` 混用；L23/25 重复 Alt；**L62** 残留旧 BookStack 外链尾注。
- **英文版**：**L42 & L44 直接使用了全中文红字引线标注图**（`12Pin调试接口`、`千兆网口` 等），英文读者无法阅读；L9 `AI large models` → `large AI models`；同步存在 `eMMC` 错误与 L62 旧站尾注。

### 27. `docs/orin-nx-series/intro.md` 与 `docs/en/orin-nx-series/intro.md`
- **中文版（照抄 Orin Nano 引发多处硬件事实错误）**：
  1. **L38 & L57 严重事实错误**：写 `支持 SD 卡` 与 `eMMC / 内存卡`——**Orin NX 核心卡既无 microSD 卡槽也无 eMMC**，必须外接 NVMe SSD 或 USB 存储！
  2. **L14 GPU 频率抄错**：写 `GPU@1020MHz`（Nano 数值），Orin NX 标准模式最高为 **918MHz**、SUPER 模式为 **1173MHz**。
  3. **L15 CPU 核数笔误**：Orin NX 8GB 写成了 `8x A78`，实为 **6 核 Arm Cortex-A78AE**（16GB 为 8 核）。
  4. **L17 漏标 SUPER 载板限制**：未提示 Orin NX 40W SUPER 模式仅在 **C1902 V1.1+/V2 与 C1903** 上支持（公版 DevKit / C1901 / C2401 不支持）。
  5. **L23–25** 拿 Orin Nano DevKit 图改 Alt 冒充 Orin NX 外观；末尾缺跳转入门教程与选型对比的导引。
- **英文版**：**L42 & L44 同样残留全中文标注图**，并 100% 继承上述四项硬件参数错误与 L62 旧站尾注。

### 28. `docs/orin-nano-series/connect-jetson.md` 与 `docs/en/orin-nano-series/connect-jetson.md`
- **中文版**：
  - **L7 导语承诺落空**：明确列出四种方式含 **UART 调试接口**，正文却只有显示器、局域网 SSH、Type-C SSH、远程桌面，**彻底漏写了 UART 串口连接章节**！
  - **L59 主从概念写反**：“Jetson 默认作为主机，其 IP 为 192.168.55.1”——此时 PC 是 Host，Jetson 工作在 **USB Device（从机虚拟网卡）模式**！且需提示第三方载板刷纯净固件后可能需先按 `/orin-nano-series/usb-config` 启用设备树。
  - **L118–136 版本失效**：`vino-server` 与 `org.gnome.Vino` **仅适用于 JetPack 5（Ubuntu 20.04）**，在 JetPack 6/7（Ubuntu 22.04/24.04）中已被移除，照敲必报错！
  - **排版问题**：`2.1` 为空标题，`2.4~2.7` 把单次鼠标点击拆成带 `**加粗**` 的 H3；L92–108 连续堆砌 9 张同名 Alt 的 NoMachine 截图；L31 `Putty` → `PuTTY`；漏说明 DP 转 HDMI 需主动式转换线。
- **英文版**：**L25（路由器后台）、L27（IP 扫描器）、L61（Windows 网络属性）共 3 张截图全为中文界面**；L59 照译了 `After connecting to the host..., the Jetson acts as the host` 自相矛盾句。

### 29. `docs/orin-nano-series/camera.md` 与 `docs/en/orin-nano-series/camera.md`
- **中英文共性问题**：
  - **L46–54 配图位置全乱**：把属于 `Cheese`、`Guvcview`、`nvgstcapture` 三个子节的 **5 张截图全部提前堆在了 H3 子标题之前**，且 Alt 全叫 `2. USB 摄像头`。
  - **L80 命令参数缺失 Bug**：`sudo nvgstcapture --cap-dev-node 2` 漏了 **`--camsrc=0`**（默认 `--camsrc=1` 只找 CSI 相机，无法打开 USB 摄像头），命令名宜用 `nvgstcapture-1.0` 且无需 `sudo`，注释中的 `<N>` 与写死的 `2` 不一致。
  - **前置与兼容性漏项**：未提醒使用 IMX219/IMX477 前需先通过 `jetson-io.py` 启用对应 CSI 相机叠加层；未说明 **C2401 仅有 1 路 CSI** 及 C1901 V1.2 前旧版线序差异；L17“尽量避免带电操作”语气过弱，必须改为 **`::: danger` 严禁带电插拔 CSI 排线**；L38 `format:NV12` 与命令 `format=(string)NV12` 不一。

### 30. `docs/orin-nano-series/peripherals.md` 与 `docs/en/orin-nano-series/peripherals.md`
- **中文版**：
  - **L100 致命硬件短接错误（P0-1）**：“以 SPI0 为例，使用条线短接 **19，20 号针脚**”（且两处把“跳线”错写成“条线”）——40-pin 的 **20 号脚是 `GND`，21 号脚才是 `SPI0_MISO`**！必须改为**短接 19 号与 21 号引脚**，并补充前置步骤：先通过 [Jetson-IO](/orin-nano-series/expansion-header) 启用 `spi1` 复用！
  - **技术与载板缺口**：① L19 `/dev/ttyTHS1` 仅适用 JetPack 6（JetPack 5 为 `ttyTHS0`）；② **CAN 章节（L204）漏了 `C1902 V2`（无收发器）与 `C1903`（板载收发器输出 `CAN_H/L`）**，L255 用 `ifconfig` 看不到下文讲的 `Error-Active/Bus-Off` 状态（应改用 `ip -details -statistics link show can0`）；③ **RTC 章节**硬编码 `/dev/rtc0`（外扩 RTC 常为 `rtc1`），且 L317 将自定义服务写进系统包目录 `/lib/systemd/system/`（应改 `/etc/systemd/system/` 并加 `daemon-reload`）。
  - **风格重灾区**：28 个代码块全用 `shell` 且多处混入终端提示符与大段输出；30+ 处中英文无空格；代码拼写错误 `recived` → `received`；`cutecom` / `spi` / `i2c` 小写；L204/275/277 关键防烧毁警告全无 `:::` 容器；L208 图片名残留 `wiki-gemini-generated-image-...webp`。
- **英文版**：**L208 直接使用了全中文 CAN 总线拓扑图**（`节点1`、`CAN收发器` 等全中文）；L291/297 写死 `cn.pool.ntp.org` 与 `Asia/Shanghai`；完整继承了 **短接 19–20 (GND)** 的致命错误。

### 31. `docs/orin-nano-series/usb-config.md` 与 `docs/en/orin-nano-series/usb-config.md`
- **中英文共性问题（整体质量较高，少量结构优化）**：
  - **H2 层级误导**：第 `3、4、5、6` 节是四个**四选一互斥**的 JetPack 版本分支，却与前后顺序步骤混编为连续的 `## 1. ~ ## 9.`，新手极易顺着往下连敲 → 建议归拢为 `## 3. 安装对应 JetPack 版本的设备树` 下的子标题或 VitePress Tabs。
  - **L7 物理端口表述过窄**：写死“3 个 USB 3.2 端口和 Type-C”，与 C1902（4 个）、C1903（5 个）、C2401（板载 2 个）不完全相符，且漏列 **`C1902 V2`**。
  - **L154, L186**：修改 `extlinux.conf` 时需说明“若已有 `FDT` 行则替换路径，避免重复定义两行 `FDT`”，并提醒替换整包 DTB 会覆盖 `Jetson-IO` 叠加配置；EN L14 残留中文弯引号 `“—”`。

### 32. `docs/orin-nano-series/network-driver.md` 与 `docs/en/orin-nano-series/network-driver.md`
- **中文版**：
  - **同页新旧拼接分裂**：前半无线网卡用 `1. 2.`，后半有线网卡 L64–80 却用中文顿号 `1、2、3、4、`（无法渲染为有序列表）；`shell` 代码块混入 `[sudo] password` 与 20 行 `lshw` 输出；L51 教程讲 JetPack 6 但输出示例却是 JetPack 5 的 `5.10.216-tegra` 内核；L9/17/60 大量漏空格；L66 `![image](/img/wiki-MIZimage.png)`。
  - **载板适用范围漏标**：未点明在控元载板中**仅 C2401 板载了需装驱动的 RTL8125 (2.5GbE)**（C1901/C1902/C1902 V2/C1903/C2402 板载千兆口均为免驱芯片），也未交代 L103 出现的 `RTL8852CE` 与前文 Intel `iwlwifi` 的区别。
- **英文版**：**L66 (`/img/wiki-MIZimage.png`) 使用了全中文 Realtek 下载网页截图**；同样存在 `shell` 块混入输出、L51 内核版本穿帮与载板适用范围缺失问题。

### 33. `docs/orin-nano-series/4g-module.md` 与 `docs/en/orin-nano-series/4g-module.md`
- **中英文共性重度问题（P0-6）**：
  1. **L14–23 空章节残稿直发线上**：`## 方法一：替换新内核` 下 `1.1 ~ 1.4` **四个子标题内容全部空白**！
  2. **L183–251 编译与刷机命令连环必败**：
     - **L184** `cd ../../` 从 `Linux_for_Tegra/source` 跳到了 `Linux_for_Tegra` 的父目录，后续 `make -C kernel` 必报找不到目录；
     - **L193** 未导出 `INSTALL_MOD_PATH` 就执行 `sudo -E make install -C kernel`，**有将 arm64 模块装进 x86 宿主机 `/lib/modules` 的高危风险**（`INSTALL_MOD_PATH` 写晚到了 L213）！
     - **L199** `cp ... ../Linux_for_Tegra/kernel/Image` 多套了一层 `Linux_for_Tegra/`；
     - **L236** 刷机却进了 `.../Linux_for_Tegra/source`（找不到 `flash.sh`），且 **L250** `sudo ./flash.sh jetson-orin-nano-devkit-nvme internal` 配置名不存在且 `internal` 无法刷写 Orin Nano 外部 NVMe！
  3. **资料与硬件断档**：L166 `qmi_wwan_q.c` 与 L255 `Quectel_QConnectManager...zip` **无任何下载链接**；未说明现售 C1901~C2401 无原生 M.2 Key B + SIM 槽（需转接板，仅 C2402 原生支持）；未说明 `quectel-CM` 需前台驻留或加 `&` 后台运行。
  - **文字细节**：型号混写 `EM05` 与 `EM-05`；ZH L63 拼错 `Andriod`；L30 重复两次 `git`；L266 无语言标记代码块；25+ 处漏中西文空格。

---

## 九、模块六：AI / 容器 / 系统软件进阶教程及孤立页（11 组，22 个文件）

### 34. `docs/orin-nano-series/jtop.md` 与 `docs/en/orin-nano-series/jtop.md`
- **中文版**：
  - **L8 事实错误**：称 `jtop` 由英伟达开发（实为开源社区 Raffaello Bonghi 开发的 `jetson-stats`）；且 `**交互式系统监控工具。**` 标点错包在加粗内、外侧多空格。
  - **L18 vs L24 vs L47 自相矛盾**：用了名为 `install_jtop_torun_without_sudo.sh`（免 sudo）的脚本却让用户敲 `sudo jtop`，L47 又把免 sudo 与需 sudo 的对应关系写反；在 JetPack 7（Ubuntu 24.04）下 `sudo pip3 install` 会触发 PEP 668 报错，且 `sudo pip3 install -U pip` 易损坏系统 pip。
  - **排版**：`## 1 安装jtop` 漏点号与空格；**L51 `### 2.1 监视各个模块的工作信息` 为空章节**；图片 Alt 全为 `![image.png]` / `![1.png]`。
- **英文版**：同步继承 `developed by NVIDIA` 事实错误、`sudo` 逻辑矛盾、`2.1` 空章节，且 **L40–41 向海外用户硬编码了清华 PyPI 镜像源**（英文版应使用默认官方源）。

### 35. `docs/orin-nano-series/cuda.md` 与 `docs/en/orin-nano-series/cuda.md`
- **中文版**：
  - **核心环节缺失**：被 `pytorch.md` 引用为前置页，但装完 `nvidia-jetpack` 后**漏写将 `/usr/local/cuda/bin` 加入 `PATH` 及 `nvcc --version` 验证步骤**，用户照做后回 `pytorch.md` 仍报找不到 `nvcc`！
  - **L28 硬件功耗误导**：`sudo nvpmodel -m 2 #nano 模式2为super`——在 **Orin NX** 上 `-m 2` 实为 **15W 降频档**（Orin NX 最高性能档是 `-m 0`）！应引导先用 `sudo nvpmodel -q --verbose` 确认档位。
  - **压测与排版**：L36 `stress --hdd` 循环擦写 1GB 伤闪存且无超时说明，L45 `./gpu_burn 100000` 未说明长达 27.8 小时；L10 `CUDA JETSON SDK` 术语不规范；L8 `低**功耗高性能**` 错位加粗；L56/58 中文句尾误用英文句点 `.`。
- **英文版**：L8 照译为突兀的 `low **power consumption**`；L10 `Install the CUDA JETSON SDK` → `## 1. Install JetPack CUDA Components`；同样缺 `PATH` 配置与存在 `-m 2` 误导。

### 36. `docs/orin-nano-series/opencv.md` 与 `docs/en/orin-nano-series/opencv.md`
- **中文版**：
  - **标题体例严重分裂**：H2 混用 `## 1. 脚本一键安装`、`## 2. 手动安装` 与汉字 `## 三、验证测试`；**L236,244,254,266,283 的 `2.1~2.5` 全部漏写 `### `** 退化成了普通段落；L268–274 连续堆叠两个 `::: info`；大量全小写 `opencv` / `cuda`。
  - **脚本与命令隐患**：① L66/239 `purge *libopencv*` 通配符未加引号；② L161 依赖 `nvidia-smi` 检测算力架构在 JetPack 5 或部分驱动下失效，回退编译全架构会耗时数小时并 OOM；③ 硬编码 `libtbb2` 与 `python3.10` 在 JetPack 7（Ubuntu 24.04 / Python 3.12）不可用；④ Orin Nano 4GB/8GB 直接 `make -j$(nproc)` 极易内存溢出被杀（需提示加 Swap 或 `-j2/-j4`）；⑤ L354 注释病句 `// 计算误差(一般为空)`，且 L381 示例输出与上方 C++ 源码打印字符串不一致、混入终端提示符。
- **英文版**：L236–283 同样漏写 `### `；**L354 Chinglish 直译病句** `// Compute the error (generally empty/zero)`；同样存在输出不匹配与脚本隐患。

### 37. `docs/orin-nano-series/pytorch.md` 与 `docs/en/orin-nano-series/pytorch.md`
- **整体评价**：全站软件教程标杆页，仅需修复 1 处实机报错点与少量细节：
- **中英文共性问题**：
  - **L53 实机必报错点**：在第 3 节**尚未创建/进入虚拟环境 `venv`** 时执行了 `python3 -m pip install --upgrade pip`，在本页主推的 **JetPack 7（Ubuntu 24.04）** 上直接触发 PEP 668 `externally-managed-environment` 报错！（而第 4、5 节进入 `venv` 后本就已有升级 `pip` 步骤，**直接删去 L53 即可**）。
  - **细节**：ZH L2 `PyTorch 与 Torchvision` vs 侧栏 `PyTorch 和 Torchvision`；L100 验证脚本建议顺带校验 `import torchvision`；L171 `cv2.imshow` 建议补一句“SSH 无头模式无桌面会报错”提示；EN L70 弯引号建议改为锚点链接。

### 38. `docs/orin-nano-series/tensorrt.md` 与 `docs/en/orin-nano-series/tensorrt.md`
- **中文版**：
  - **L65 失效锚点死链**：`[YOLO 推理例程](/orin-nano-series/pytorch#_2-运行yolo11)` 指向重构前旧锚点，应更新为 `#_7-运行-yolo11-摄像头推理`。
  - **L71–77 `venv` 隔离与 PEP 668 双重陷阱**：`apt install python3-libnvinfer` 装在系统目录，若在 `pytorch.md` 创建的隔离 `venv` 中会报找不到 `tensorrt`（需 `--system-site-packages`），若不在 `venv` 中则 `pip install pycuda` 在 JP7 触发 PEP 668 且需 `nvcc` 在 `PATH` 中。
  - **L153 & L211 代码健壮性**：C++ 读取引擎文件未检查 `if (!file)`（路径错误会抛 `std::bad_array_new_length`）；CMake 使用了已废弃的 `find_package(CUDA)`（建议升级为 `find_package(CUDAToolkit REQUIRED)`）。
  - **风格**：L2 `title: 使用TensorRT加速` 缺空格；L65 用 `>` 与 L12 `:::tip` 不统一。
- **英文版**：L65 建议补上 `#_7-run-yolo11-camera-inference` 锚点；同步优化 `venv` 说明与 `CMakeLists.txt`。

### 39. `docs/orin-nano-series/ollama.md` 与 `docs/en/orin-nano-series/ollama.md`
- **中英文共性问题**：
  - **内容过薄（全文仅 27 行）**：5 款载板主页均以“Jetson 大模型教程”链入本页，但本页无一句简介，缺国内网络拉取提示、缺 `ollama ps` 确认 GPU 加速（`100% GPU`）、缺 4GB/8GB/16GB 核心卡模型参数量选型建议与 `/bye` 退出说明。
  - **风格失范**：ZH 标题与正文全小写无空格（`安装使用ollama`、`deepseek-r1 1.5b模型`）；祈使句作标题（`## 1. 运行以下指令安装ollama`）；**L16 代码块无语言标记且混入 `jetson@jetson-desktop:~$` 提示符与输出**；EN 标题 `Installing and Using Ollama` 与侧栏 `Install and Use Ollama` 词性不一。

### 40. `docs/orin-nano-series/openclaw.md` 与 `docs/en/orin-nano-series/openclaw.md`
- **中文版**：
  - **L1–3**：缺少 `outline: deep`；**L14 & L22** 型号漏列 `C1902 V2 / C1903`，系统漏列 `JetPack 7`。
  - **L65–69 守护进程断连回收隐患**：`systemd --user` 用户级服务在无头 SSH 退出登录后默认会被系统终止，需补充执行 `sudo loginctl enable-linger $USER` 方可实现断连驻留。
  - **L98** 建议提前提示无显示器 SSH 用户跳过 `openclaw dashboard` 直接看第 7 节隧道转发；**L124, L126** 排障表述偏口语（“用 nvm 的话…”、“服务在跑”、“记得走 SSH 隧道”）；L61/131 引用块与分隔线可统一为 `::: tip` 与 `## 参考`。
- **英文版**：**L131 外链未去中文化**：英文页 `[OpenClaw Official Documentation](https://docs.openclaw.ai/zh-CN)` 误链中文路径 `/zh-CN`（应改为 `https://docs.openclaw.ai/`）；L122 `## 9. FAQ` 建议与同组新稿统一为 `## 9. Troubleshooting`。

### 41. `docs/orin-nano-series/jetson-container.md` 与 `docs/en/orin-nano-series/jetson-container.md`
- **中英文共性阻断级问题（P0-8）**：
  1. **L24–25 路径重复报错**：`cd jetson-containers` 后又写 `bash jetson-containers/install.sh`，必报 `No such file or directory`！
  2. **L49 挂载模型漏写 `-v`**：`jetson-containers run ~/models/:/opt/ComfyUI/models/checkpoints ...` 缺少 `-v` 标志，目录会被当成镜像名直接报错！
  3. **镜像版本与存储空间提示缺失**：写死 `r36.4.3` Tag 建议改用或补充 `$(autotag comfyui)`，并警告需预留 **20–40 GB+ NVMe SSD** 空间；L40 `http://0.0.0.0:8188` 本机浏览器访问应改为 `http://127.0.0.1:8188`；L42 HTML 实体 `&lt;` 改为反引号代码块。
  - **风格混乱**：同一篇混现 `Jetson Containers` / `Jetson-container` / `jetson-container` / `jetson-containers` 四种写法，以及错误连字符 `Comfy-UI`、小写 `docker`、长句作 H2 标题（L34,46,52）、多处缺句号与空格。
- **英文版特有错误**：**L56 `[ComfyUI...](https://www.comfy.org/zh-cn/)` 误链中文官网 `/zh-cn/`**！

### 42. `docs/orin-nano-series/comfyui.md` 与 `docs/en/orin-nano-series/comfyui.md`【未挂载孤立页】
- **审查诊断与处理建议**：
  - 与 `jetson-container.md` 重合度 >95% 的旧迁移重复稿（全仓 0 引用，但仍被静默编译进线上 `dist/`）；自身还缺失 `# H1` 一级标题、代码块用 `shell`、图片 Alt 全为 `![image]`，并同样带有上述 2 处命令报错与英文版 `/zh-cn/` 错链。
  - **建议直接删除**中英文两文件及其独占的 4 张重复旧图（`wiki-1uQimage.png`、`wiki-wDnimage.png`、`wiki-52qimage.png`、`wiki-1Naimage.png`）与零引用的 `jetson-container-01..04.png`。

### 43. `docs/orin-nano-series/base-image.md` 与 `docs/en/orin-nano-series/base-image.md`【未挂载孤立页】
- **审查诊断与处理建议**：
  - 控元定制出厂镜像（网卡/4G/HDMI 4K/USB 设备树/内核交叉编译）内部工程笔记，因尚未完善从侧边栏隐藏，但仍暴露在 `dist/` 中：
    - **代码残缺**：**L79–116** USB 设备树代码在 `usb3-2 {` 处直接截断未闭合；
    - **高危错误**：未声明在 Ubuntu 宿主机执行；**L69** 疑似误写 AGX Orin 的 `p3737` DTSI；**L129** `cd ../../` 跳错目录；**L138** 未导出 `INSTALL_MOD_PATH` 即执行 `sudo -E make install -C kernel`；**L199/205** 使用了 JetPack 6 已废弃的 `bootloader/t186ref/...` 旧路径；**L46 & L63** 指向已下线的旧 BookStack 死链；**L120** 孤立残留 `### 2.3 编译内核` 编号。
  - **去留建议**：短期在 `config.mts` 配置 `srcExclude` 阻止发布；中期修复完整后**迁移至 `docs/hardware-bsp/kernel-and-bsp-build.md`** 挂入「载板适配开发」栏目，并与 `4g-module.md` 第 2 章合并公共内核编译流程。

### 44. `docs/orin-nano-series/boot-logo.md` 与 `docs/en/orin-nano-series/boot-logo.md`
- **中英文共性重度线上缺陷（P0-5）**：
  1. **全部 4 张 PNG 配图文件损坏（L41, L66, L74, L89）**：`/img/boot-logo-{docker,assets,config,build}.png` 在仓库中实际全是 **22 字节的纯文本日志**（`OK: boot-logo-1.png -`），线上页面 4 张图全部裂开！
  2. **末尾两章完全空白（L91–93）**：`## 四、替换` 与 `## 五、刷入`（EN: `## 4. Replace` / `## 5. Flash`）仅有标题无任何正文与刷写命令，教程半途而废！
  3. **目录跳转命令连续报错（L63, L71, L85）**：L63 `cd` 进入 5 层 `Assets/` 子目录后，L71 又用相对路径且**对普通文件执行 `cd ...NVIDIA.fvmain.fdf.inc`**（必报 `Not a directory`）！
  4. **前置约束缺失**：未说明必须在 Ubuntu 宿主机执行，未说明替换 Logo **必须是未压缩 24/32 位 `.bmp` 格式**（`1920×1080` / `1280×720` / `640×480`），不可直接改 `.png` 后缀；L22 无需 `sudo reboot` 宿主机（`newgrp docker` 即可），且重启后下文 `alias edk2_docker` 会注意保留在同一会话定义。
  - **风格问题**：中文用 `## 一、~ 五、` 与英文 `1.~5.` 不一；`docker`/`edk2`/`uefi`/`git` 小写；全文引导句末尾漏句号；英文版 L60/68 突兀混用全大写 `LOGO`。

---

## 十、建议整改路线图（Phased Rollout）

为避免一次性大改难以验收，建议分 **三个阶段** 推进落地：

### 阶段一：止血修错与清理（P0，建议优先立即执行，约 1～2 天）
1. **修正硬件参数与接线安全错误**：
   - 修复 `peripherals.md` SPI 短接引脚（`19–20` → **`19–21`**）；
   - 修复 `products/compare.md` 与 `index.md` 中 **C1903** 的错误尺寸（`100 × 79 mm`）、显示接口（`HDMI 2.1`）与电源保护；
   - 核对硬件原理图/丝印修正 `c1902.md` `#8~#15` 错位表、`c2401.md` `#8/#9` 双网口颠倒、`c1903.md` Type-C 速率矛盾、`orin-nx-series/intro.md` 与 `flashing.md` 的 SD 卡/eMMC/功耗档位错误；
   - 清理 `c2402.md` 残留的 C2401 30Pin 说明、半截话与 6 处硬编码外链。
2. **修复页面破损、阻断命令与死链**：
   - 修复 `orin-nx-series/flashing.md` 错堆的 14 张配图（或直接重构为分流导览页）；
   - 补全 `boot-logo.md` 第 4/5 节、修复 `cd` 命令并替换/移除 4 张 22 字节损坏图片；
   - 修复 `jetson-container.md`（路径与 `-v`）、`pytorch.md`（删除 L53 虚拟环境外升级 pip）、`jetpack6-gpio.md` 与 `gpio.md`（改裝 `gpiod` 包、修复 `echo 454` 与 C 代码）、`camera.md`（5 张图归位 + `--camsrc=0`）、`4g-module.md`（隐藏空的 `方法一` 并修正 `方法二` 编译/刷机路径）；
   - 修复 `en/index.md` 底部无链接卡片、`en/faq/index.md` 失效锚点、`en/c2401.md` 跳中文错链、`en/c1901.md` 无链接列表、`tensorrt.md` 失效锚点、`quick-start.md` 原生 `<a>` 链接；
   - 删除重复孤立页 `comfyui.md`，对未完工的 `base-image.md` 先配置 `srcExclude` 屏蔽发布；裁切 FAQ 两张暴露内部 QA 标题栏的截图。

### 阶段二：新型号全站对齐与架构去重（P1）
1. **全站补齐 `C1902 V2` 与 `C1903`**：同步更新 `products/compare.md`、`quick-start.md`、`resources/downloads.md`、`c1902-flashing.md`（补 V2 按键法）、新增/合入 `C1903` 刷机说明，并在 `faq/index.md`、`pinmux-device-tree.md`、`peripherals.md`、`expansion-header.md`、`usb-config.md` 补齐两款载板的兼容矩阵。
2. **收敛重复架构**：精简合并两套刷机入口（`orin-nano/nx-series/flashing.md` 改为轻量化分流页）与四篇重叠 GPIO 文档；替换 `devkit-flashing.md` 与 `c1901-flashing.md` 张冠李戴的配图，移除 `ubuntu-sdkmanager.md` 百度网盘与密钥合规隐患。
3. **补齐关键工程文档**：完善 `base-image.md` 并正式迁入 `docs/hardware-bsp/`；扩充过于单薄的 `ollama.md`；在 `connect-jetson.md` 补齐 UART 串口登录并更新 JetPack 6/7 远程桌面方法。

### 阶段三：全站风格与双语精修（P2）
1. 按本文 **第二节（Style Guide 基线）** 统一全部页面的 Frontmatter（`outline: deep`）、标题序号（`## 1. ` vs 无序号）、提示框（`::: tip/warning/danger`）、代码块（`bash` 命令与 `text` 输出彻底分离，明确标注宿主机/开发板终端）、中西文空格与标点。
2. 统一载板产品页章节顺序与 3 列接口布局表（改造 `c1903.md` 的离线规格书 `<div align="center">` 图表注与 `c2401.md` 的双栏中英混排表），将剩余 `.png/.jpg` 历史图片压缩迁移为语义化 `.webp`。
3. 替换英文站 6 处含中文标注/中文 UI 的截图，统一英文温度单位 `°C`、容量单位 `GB` 与 Title Case 标题规范，清理全部旧版 BookStack 来源尾注。
