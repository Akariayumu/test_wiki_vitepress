# 控元 Wiki 内容补全 Roadmap（文档大纲）

> 目的：对标 Seeed Studio、创乐博/CSDN、Ultralytics 官方 Jetson 文档，梳理**别人有、我们暂时没有**的内容板块，并为每个板块给出可直接落地的章节大纲。
>
> 调研日期：2026-07（对比对象见文末「参考来源」）。

---

## 一、现状与差距结论

**我们已覆盖（较强）：**
- 载板产品介绍（C1901 / C1902 / C2401）
- Jetson 使用教程：入门（连接 / 摄像头 / GPIO / 外设 / USB）、进阶（CUDA / OpenCV / PyTorch / TensorRT / Ollama / ComfyUI / jetson-container / OpenClaw / 网卡 / 4G / 基础镜像 / 启动 LOGO）
- 刷机指南（devkit / C1901 / C1902 / C2401 / JetPack 7 ISO）、GPIO 配置

**核心差距（一句话）：** 「工具怎么装」覆盖得好，但缺三类内容——
1. **拿工具做成什么**（端到端应用案例）
2. **性能到底多强**（基准数据）
3. **该买哪块 / 怎么选**（选型决策）

对手正是靠这三类拉开差距。下表为优先级总览，详细大纲见第三节。

---

## 二、优先级总览

| 优先级 | 板块 | 价值 | 落地成本 | 依赖素材 |
|--------|------|------|---------|---------|
| 🔴 P0 | 1. 性能基准 Benchmark 中心 | 选型硬通货、体现 SUPER 价值 | 中 | 需实测数据 |
| 🔴 P0 | 2. 产品选型对比矩阵 | 促成购买决策 | 低 | 已有规格即可整理 |
| 🔴 P0 | 3. 应用案例库（端到端 Demo） | 证明产品能干活、转化力最强 | 高 | 需完整跑通+录屏 |
| 🟠 P1 | 4. 硬件资源下载区 | 工程师刚需（原理图/尺寸/pinout） | 低 | 需汇总现有资料 |
| 🟠 P1 | 5. 配件与兼容性列表 | 减少售前售后咨询 | 中 | 需实测兼容性 |
| 🟠 P1 | 6. FAQ / 故障排查中心 | 降低支持工单 | 低 | 汇总散落问题 |
| 🟠 P1 | 7. Getting Started 快速上手总入口 | 新手不迷路 | 低 | 串联现有页面 |
| 🟠 P1 | 8. 系统备份 / 恢复 / 批量克隆 | 量产客户刚需 | 中 | 需验证流程 |
| 🟡 P2 | 9. DeepStream 视频分析 | 边缘视觉主力、差异化 | 高 | 需实测 |
| 🟡 P2 | 10. 一键部署项目集 | 提升「开箱即用」观感 | 中 | 整理 container |
| 🟡 P2 | 11. 视频教程 | 小白友好（对标创乐博） | 中 | 录制剪辑 |

---

## 三、各板块文档大纲

### 🔴 P0-1　性能基准 Benchmark 中心
- **建议路径**：`/benchmark/`（顶层分组）
- **价值**：客户选型最看重的硬数据；同时是展示 SUPER / MAXN 模式收益的最佳位置。
- **页面大纲**（对标 Ultralytics 官方 Jetson 基准）：
  1. 测试方法与环境说明（JetPack 版本、功耗模式、`jetson_clocks`、输入尺寸 640、warmup 说明）
  2. 视觉模型基准表 —— 字段：`模型(YOLO11 n/s/m/l/x)` × `格式(PyTorch/ONNX/TensorRT)` × `精度(FP32/FP16/INT8)` × `mAP50-95` × `延迟(ms/张)` × `FPS` × `显存占用`
  3. 多路视频容量表（如「Orin NX 16GB + YOLOv8s INT8 ≈ 40 路 @5fps」）
  4. LLM / 生成式基准（Ollama 上 deepseek / llama 的 token/s、首字延迟、内存）
  5. **功耗模式对比**（15W vs 25W vs MAXN SUPER 的 FPS / 功耗 / 温度）—— 把现有「SUPER 模式」教程数据化
  6. 跨设备对比（C1901/C1902/C2401 各自 Orin Nano/NX 档位横向对比）
- **落地要点**：先做 1 个模型（YOLOv8s）跑通全字段，形成模板，再横向铺开。

### 🔴 P0-2　产品选型对比矩阵
- **建议路径**：首页显著位置 + `/products/compare`
- **价值**：把散落的载板介绍页整合成一张决策表。
- **页面大纲**：
  1. 一张主对比表 —— 行=产品(C1901 / C1902 / C2401 / 官方 DevKit)，列=`支持模块` `尺寸` `供电` `以太网` `USB` `M.2(NVMe/WiFi)` `摄像头接口` `CAN/GPIO` `工作温度` `适用场景` `购买链接`
  2. 「按场景选」引导（跑 LLM / 多路视觉 / 低功耗嵌入 / 工业宽温 → 推荐型号）
  3. 与官方 DevKit 的差异说明（引脚兼容、SUPER 固件差异）
  4. 每行「查看详情 / 立即购买」链接
- **落地要点**：成本最低、见效快，**建议第一个做**。

### 🔴 P0-3　应用案例库（端到端 Demo）
- **建议路径**：`/applications/`（顶层分组）
- **价值**：从「装好工具」跨到「跑出成果」，最能证明产品价值。
- **单篇案例大纲**（对标 Seeed「训练+部署 YOLOv8」）：
  1. Introduction（要做什么、最终效果预览图/视频）
  2. 环境准备（依赖、PyTorch/torchvision、Tmux 管理长任务）
  3. 数据集（公开数据集下载 + Label Studio 自标注两条路径）
  4. 训练（train.py、batch/epoch/imgsz 参数、进度监控）
  5. 验证（单图推理看效果）
  6. 部署优化（导出 `.engine` TensorRT、量化 FP16/INT8）
  7. 推理与结果（实时 FPS 显示、量化前后对比：如 21.9 → XX FPS）
- **首批案例建议**：① YOLO 目标检测 ② 本地 LLM 问答(Ollama) ③ ComfyUI 出图 ④ 视觉分割/姿态。前两个可复用现有进阶教程扩展成完整案例。

### 🟠 P1-4　硬件资源下载区
- **建议路径**：各载板介绍页底部统一「Resources」区块 + `/resources/downloads` 汇总页
- **内容清单**：Datasheet PDF、原理图、机械尺寸图 / 3D 模型(STEP)、**pinout 引脚图**、驱动包、固件包、认证文件(CE/FCC，如有)。
- **落地要点**：把现有分散资料集中，统一命名与版本号。

### 🟠 P1-5　配件与兼容性列表
- **建议路径**：`/accessories/`
- **页面大纲**：
  1. 摄像头兼容表（型号 / 接口 CSI/USB / 驱动 / 分辨率帧率 / 是否即插即用）
  2. M.2 兼容表（NVMe SSD 单/双面、无线网卡型号、驱动状态）—— 呼应刷机页「单面 SSD」提示
  3. 散热方案（风扇 / 散热片 / 外壳，安装说明）
  4. 天线 / 4G / 5G 模块（型号、安装、拨号配置，扩展现有「4G 模块」页）
  5. 电源适配器规格建议

### 🟠 P1-6　FAQ / 故障排查中心
- **建议路径**：`/faq/`
- **页面大纲**：按主题分组 —— 刷机类 / 启动无显示 / NVMe 不识别 / 网络驱动 / SUPER 档位不出现 / 串口无输出 / 摄像头无画面 / 散热与降频。每条：现象 → 原因 → 解决。汇总现有各页尾部的零散问题。

### 🟠 P1-7　Getting Started 快速上手总入口
- **建议路径**：`/getting-started`（首页第一入口）
- **页面大纲**：开箱清单 → 硬件接线（供电/显示/网络）→ 选择刷机方式（链到刷机指南）→ 首次开机设置 → 跑第一个程序(jtop / 一个 demo) → 下一步去哪（进阶 / 应用案例）。一页把新手路径串起来。

### 🟠 P1-8　系统备份 / 恢复 / 批量克隆
- **建议路径**：`/flashing-guide/backup-restore`
- **页面大纲**：为什么要备份 → 备份整机镜像（`l4t` 克隆 / dd）→ 恢复到同型号 → **量产批量克隆**（母盘制作、多台烧录）→ 常见坑。对标创乐博「备份与恢复」专章，服务量产客户。

### 🟡 P2-9　DeepStream 视频分析
- **建议路径**：`/orin-nano-series/deepstream`（进阶教程内）
- **页面大纲**：DeepStream 简介与适用场景 → 安装 → 跑官方 sample → 接入自己的 TensorRT 模型 → 多路 RTSP 摄像头 pipeline → 性能观测（联动 Benchmark 中心）。补齐边缘视觉主力工具。

### 🟡 P2-10　一键部署项目集
- **建议路径**：`/applications/one-line-deploy`
- **内容**：把 jetson-container / Ollama / ComfyUI 整理成「一行命令跑起来」的项目卡片列表（项目 / 命令 / 效果 / 所需模块）。对标 Seeed one-line deploy。

### 🟡 P2-11　视频教程
- **建议路径**：各教程页内嵌 + `/videos` 汇总
- **内容**：刷机、恢复模式接线、SUPER 模式开启、第一个 AI demo。对标创乐博手把手视频。可先从已有 GIF 扩展。

---

## 四、对标 NVIDIA 官方文档：载板厂「必须有」的板块

> **依据**：NVIDIA 把载板适配的责任交给 OEM / 第三方载板厂。官方 [Jetson Linux Developer Guide](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/index.html) 里整块的「Platform Adaptation and Bring-Up」「Hardware References」，正是**我们作为载板厂必须向客户交付对应文档**的领域。第三节（对标 Seeed/创乐博）多是营销与体验；本节这些是**技术刚需与产品交付的一部分**——缺了客户就没法把我们的板子接上他自己的外设，优先级实际上不低于甚至高于部分 P0。

### 4.1 🔴 必须有（载板厂核心职责）

| 板块 | 官方对应章节 | 我们现状 | 为什么必须 |
|------|-------------|---------|-----------|
| **载板适配 / Pinmux / 设备树** | Platform Adaptation and Bring-Up；Pinmux and GPIO Configuration；EEPROM Layout；Adaptation Checklists | 仅「GPIO 配置说明」 | 客户改引脚复用/加外设，必须有 pinmux 表 → DTB 的完整流程 |
| **40-pin 扩展头配置** | Configuring the Jetson Expansion Headers（jetson-io） | ✅ 已完成（[40-pin 扩展头配置](/orin-nano-series/expansion-header)，中英双语） | 配 SPI / I2C / UART / PWM / I2S 的标准动作 |
| **相机 / Sensor 驱动移植** | Camera Development；Sensor Driver Programming；GMSL；Camera Driver Porting | 仅入门「摄像头」 | 载板常接第三方 MIPI/GMSL sensor，接入与驱动移植必问 |
| **电源与性能管理** | Platform Power and Performance；Clocks（nvpmodel / jetson_clocks） | 仅 SUPER 模式开关 | 自定义功耗档、DVFS、散热/降频策略 |
| **多媒体硬件编解码** | Multimedia APIs；Accelerated GStreamer；ffmpeg 硬解 | 无 | 视觉 / 流媒体客户刚需 |
| **OTA / A-B 冗余更新** | Software Packages and Update Mechanism；Update and Redundancy | 无 | 量产设备现场升级必须 |
| **Bootloader / UEFI 适配 / 分区** | Bootloader；UEFI Adaptation；Partition Configuration | 刷机页仅覆盖烧录操作 | 定制启动、分区、冗余；已有「启动 LOGO」是其一角 |
| **CAN 总线** | Controller Area Network (CAN) | 无 | 工业 / 车载载板标配接口 |

### 4.2 🟠 建议有（进阶 / 商用客户）

| 板块 | 官方对应章节 | 说明 |
|------|-------------|------|
| 内核定制 / BYOK / 实时内核 | Kernel Customization；Bring Your Own Kernel；Real-Time Kernel | 加驱动、RT 实时需求 |
| 安全启动 / 磁盘加密 | Secure Boot；Disk Encryption；Secure Storage | 商用 / 工业合规 |
| 显示配置 Bring-Up | Display Configuration and Bring-Up | 定制屏、多屏 |
| 启动时间优化 | Boot Time Optimization | 快速启动场景 |
| 调试工具 | Tegrastats；Debugging on Jetson；TCU | 已有 jtop，可补 tegrastats / 串口调试 |

### 4.3 对标 Jetson AI Lab（生成式 AI 教程体系）

官方 [Jetson AI Lab](https://www.jetson-ai-lab.com/tutorials/) 已是事实标准，我们的「进阶教程」与 P0-3 应用案例库应直接对齐选题：

| 主题 | 官方有 | 我们现状 |
|------|-------|---------|
| LLM 推理 | Ollama + **vLLM** | ✅ 有 Ollama，缺 vLLM |
| VLM 视觉语言 | Gemma / Cosmos / Live VLM WebUI | ❌ 无 |
| VLA 具身智能 | OpenPi π₀.₅ | ❌ 无（已有 OpenClaw agent） |
| 语音 ASR/TTS | 多模态 AI 工作室 | ❌ 无 |
| 视觉检测 | NanoOWL | ❌ 无 |
| Agent | OpenClaw / NemoClaw | ✅ 有 OpenClaw |
| 模型微调 | LLM Fine-tuning | ❌ 无 |
| 推理优化 | TensorRT Edge-LLM | ⚠️ 有 TensorRT 基础 |
| GenAI 基准 | LLM/VLM Benchmarking | ❌ 无（并入 P0-1 Benchmark） |

> 结论：**应用案例库（P0-3）直接按 AI Lab 选题来做**，既对标官方又转化力强。

---

## 五、信息架构（侧栏）调整建议

在 `docs/.vitepress/config.mts` 的 `rootSidebar` 建议新增/调整顶层分组：

```
首页
├─ 🆕 快速上手 (Getting Started)          ← P1-7
├─ 产品与选型
│   ├─ 🆕 选型对比矩阵                      ← P0-2
│   ├─ C1901 / C1902 / C2401 介绍
│   └─ 🆕 资源下载 (Datasheet/原理图/pinout) ← P1-4
├─ 🆕 载板适配开发 (Hardware / BSP)         ← §4.1 必须有
│   ├─ Pinmux 与设备树定制
│   ├─ 40-pin 扩展头配置 (jetson-io)
│   ├─ 相机 / Sensor 驱动移植 (MIPI/GMSL)
│   ├─ 电源与性能管理 (nvpmodel/clocks)
│   ├─ 多媒体硬件编解码 (GStreamer/ffmpeg)
│   ├─ CAN 总线
│   ├─ OTA / A-B 冗余更新
│   └─ 内核定制 / 安全启动 / 磁盘加密        ← §4.2
├─ Jetson 使用教程（现有：入门/进阶/刷机）
│   ├─ 🆕 vLLM / VLM / 语音 / 微调          ← §4.3 对标 AI Lab
│   └─ 🆕 DeepStream                        ← P2-9
├─ 🆕 应用案例 (Applications)              ← P0-3 / P2-10（按 AI Lab 选题）
├─ 🆕 性能基准 (Benchmark)                 ← P0-1
├─ 🆕 配件与兼容性                          ← P1-5
├─ 刷机教程（现有）+ 🆕 备份/恢复/克隆       ← P1-8
└─ 🆕 FAQ / 故障排查                        ← P1-6
```

英文站同步补齐（现状：英文只覆盖载板介绍 + 刷机，进阶/入门教程尚无 EN）。

---

## 六、建议实施节奏

内容分两条线并行：**营销/体验线**（第三节，帮客户选与用）和 **技术交付线**（第四节，官方要求载板厂必须有）。

- **里程碑 1（快速见效 + 补硬缺口）**
  - 营销线：P0-2 选型对比矩阵 + P1-4 资源下载 + P1-6 FAQ + P1-7 Getting Started（成本低、无需实测）。
  - 技术线：§4.1 **载板适配 / Pinmux / 设备树** + **40-pin 扩展头配置**（这是载板厂立身之本，客户询单率最高，优先级等同 P0）。
- **里程碑 2（体现实力）**：P0-1 Benchmark（先 1 个模型跑通模板）+ P0-3 应用案例首篇（对标 AI Lab：YOLO / Ollama）+ §4.1 **相机 Sensor 驱动移植**、**电源与性能管理**。
- **里程碑 3（差异化 + 商用能力）**：§4.1 多媒体编解码 / OTA 更新 / CAN + §4.2 内核定制 / 安全启动 + P1-5 配件兼容、P1-8 备份克隆 + P2 系列。

> 判断标准：**§4.1 的每一项都是「客户会拿官方文档来问我们」的题目**，缺失等于把适配工作全推给客户，应优先于纯营销内容。

---

## 参考来源

- Seeed Studio Wiki — [reComputer 刷机与产品页（Resources / 兼容矩阵 / 技术支持结构）](https://wiki.seeedstudio.com/reComputer_J4012_Flash_Jetpack/)
- Seeed Studio Wiki — [YOLOv8 训练与部署（端到端应用案例骨架）](https://wiki.seeedstudio.com/How_to_Train_and_Deploy_YOLOv8_on_reComputer/)
- Seeed Studio Wiki — [reComputer Super vs Classic 性能对比](https://wiki.seeedstudio.com/recomputer_jetson_super_performance/)
- Seeed Studio Wiki — [YOLOv8 + TensorRT + DeepStream 部署](https://wiki.seeedstudio.com/YOLOv8-DeepStream-TRT-Jetson/)
- Ultralytics — [NVIDIA Jetson 官方指南（Benchmark 字段与章节骨架）](https://docs.ultralytics.com/guides/nvidia-jetson/)
- 创乐博 / CSDN — [Jetson Orin Nano 手把手刷机、备份与恢复系列](https://blog.csdn.net/qq_30637245/article/details/148693028)
- **NVIDIA 官方** — [Jetson Linux Developer Guide（载板适配 / 相机 / 电源 / 多媒体 / 安全 完整目录）](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/index.html)
- **NVIDIA 官方** — [Jetson AI Lab Tutorials（生成式 AI 教程体系）](https://www.jetson-ai-lab.com/tutorials/)
- **NVIDIA 官方** — [Platform Adaptation and Bring-Up（Orin NX/Nano 载板适配）](https://docs.nvidia.com/jetson/archives/r36.4.4/DeveloperGuide/HR/JetsonModuleAdaptationAndBringUp/JetsonAgxOrinSeries.html)
