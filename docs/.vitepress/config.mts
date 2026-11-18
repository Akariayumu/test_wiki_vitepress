import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// ===== Chinese (root locale) sidebar =====
const rootSidebar = [
  {
    text: '快速开始',
    items: [
      { text: '平台与教程概览', link: '/quick-start' },
    ]
  },
  {
    text: '产品与选型',
    items: [
      { text: '产品选型对比', link: '/products/compare' },
      { text: '硬件资源下载', link: '/resources/downloads' },
    ]
  },
  {
    text: '载板适配开发',
    items: [
      { text: 'Pinmux 与设备树', link: '/hardware-bsp/pinmux-device-tree' },
      { text: '内核与基础镜像构建', link: '/hardware-bsp/kernel-and-bsp-build' },
    ]
  },
  {
    text: 'C1901 载板',
    items: [
      { text: 'C1901 产品介绍', link: '/c1901/c1901' },
    ]
  },
  {
    text: 'C1902 载板',
    items: [
      { text: 'C1902 产品介绍', link: '/c1902/c1902' },
      { text: 'C1902 V2 产品介绍', link: '/c1902v2/c1902v2' },
    ]
  },
  {
    text: 'C1903 载板 / 套件',
    items: [
      { text: 'C1903 产品介绍', link: '/c1903/c1903' },
    ]
  },
  {
    text: 'C2401 迷你套件',
    items: [
      { text: 'C2401 产品介绍', link: '/c2401/c2401' },
    ]
  },
  {
    text: 'C2402 载板',
    items: [
      { text: 'C2402 产品介绍（预发布）', link: '/c2402/c2402' },
    ]
  },
  {
    text: 'Jetson Orin 使用教程',
    collapsed: false,
    items: [
      {
        text: '产品介绍',
        items: [
          { text: 'Orin Nano 系列说明', link: '/orin-nano-series/intro' },
          { text: 'Orin NX 系列说明', link: '/orin-nx-series/intro' },
        ]
      },
      {
        text: '入门教程',
        items: [
          { text: '连接到 Jetson 系统', link: '/orin-nano-series/connect-jetson' },
          { text: '摄像头', link: '/orin-nano-series/camera' },
          { text: 'GPIO 控制', link: '/orin-nano-series/gpio' },
          { text: '其他外设', link: '/orin-nano-series/peripherals' },
          { text: 'USB 配置说明', link: '/orin-nano-series/usb-config' },
        ]
      },
      {
        text: '进阶教程',
        items: [
          { text: '安装 jtop', link: '/orin-nano-series/jtop' },
          { text: '安装 CUDA', link: '/orin-nano-series/cuda' },
          { text: '编译 OpenCV with CUDA', link: '/orin-nano-series/opencv' },
          { text: 'PyTorch 与 Torchvision', link: '/orin-nano-series/pytorch' },
          { text: '使用 TensorRT 加速', link: '/orin-nano-series/tensorrt' },
          { text: '安装使用 Ollama', link: '/orin-nano-series/ollama' },
          { text: '部署 OpenClaw', link: '/orin-nano-series/openclaw' },
          { text: '使用 Jetson Containers 部署 ComfyUI', link: '/orin-nano-series/jetson-container' },
          { text: '网卡驱动', link: '/orin-nano-series/network-driver' },
          { text: 'GMSL 摄像头使用说明', link: '/orin-nano-series/gmsl-camera' },
          { text: '4G 模块使用说明', link: '/orin-nano-series/4g-module' },
          { text: '自定义启动 LOGO', link: '/orin-nano-series/boot-logo' },
        ]
      },
      {
        text: '核心卡刷机导览',
        items: [
          { text: 'Orin Nano 刷机导览', link: '/orin-nano-series/flashing' },
          { text: 'Orin NX 刷机导览', link: '/orin-nx-series/flashing' },
        ]
      },
    ]
  },
  {
    text: 'GPIO 教程',
    items: [
      { text: '40-pin 扩展头配置（Jetson-IO）', link: '/orin-nano-series/expansion-header' },
      { text: 'JetPack 6 GPIO 配置说明', link: '/gpio-tutorial/jetpack6-gpio' },
      { text: 'JetPack 5 GPIO 配置说明', link: '/gpio-tutorial/jetpack5-gpio' },
    ]
  },
  {
    text: '刷机教程',
    items: [
      { text: '安装 Ubuntu 虚拟机和 SDK Manager', link: '/flashing-guide/ubuntu-sdkmanager' },
      { text: '官方开发者套件刷入系统', link: '/flashing-guide/devkit-flashing' },
      { text: 'C1901 刷入系统', link: '/flashing-guide/c1901-flashing' },
      { text: 'C1902 / C1902 V2 刷入系统', link: '/flashing-guide/c1902-flashing' },
      { text: 'C1903 刷入系统', link: '/flashing-guide/c1903-flashing' },
      { text: 'C2401 刷入系统', link: '/flashing-guide/c2401-flashing' },
      { text: 'JetPack 7 刷入系统（ISO 安装）', link: '/flashing-guide/jetpack7-flashing' },
    ]
  },
  {
    text: 'FAQ / 故障排查',
    items: [
      { text: 'FAQ 与故障排查', link: '/faq/' },
    ]
  },
]

// ===== English locale sidebar =====
const enSidebar = [
  {
    text: 'Quick Start',
    items: [
      { text: 'Overview', link: '/en/quick-start' },
    ]
  },
  {
    text: 'Products & Selection',
    items: [
      { text: 'Product Comparison', link: '/en/products/compare' },
      { text: 'Hardware Resources', link: '/en/resources/downloads' },
    ]
  },
  {
    text: 'Carrier Board Development',
    items: [
      { text: 'Pinmux & Device Tree', link: '/en/hardware-bsp/pinmux-device-tree' },
      { text: 'Kernel & Base Image Build', link: '/en/hardware-bsp/kernel-and-bsp-build' },
    ]
  },
  {
    text: 'C1901 Carrier Board',
    items: [
      { text: 'C1901 Introduction', link: '/en/c1901/c1901' },
    ]
  },
  {
    text: 'C1902 Carrier Board',
    items: [
      { text: 'C1902 Introduction', link: '/en/c1902/c1902' },
      { text: 'C1902 V2 Introduction', link: '/en/c1902v2/c1902v2' },
    ]
  },
  {
    text: 'C1903 Carrier Board / Kit',
    items: [
      { text: 'C1903 Introduction', link: '/en/c1903/c1903' },
    ]
  },
  {
    text: 'C2401 Mini Kit',
    items: [
      { text: 'C2401 Introduction', link: '/en/c2401/c2401' },
    ]
  },
  {
    text: 'C2402 Carrier Board',
    items: [
      { text: 'C2402 Introduction (Pre-release)', link: '/en/c2402/c2402' },
    ]
  },
  {
    text: 'Jetson Orin Tutorials',
    collapsed: false,
    items: [
      {
        text: 'Product Overview',
        items: [
          { text: 'Orin Nano Series Overview', link: '/en/orin-nano-series/intro' },
          { text: 'Orin NX Series Overview', link: '/en/orin-nx-series/intro' },
        ]
      },
      {
        text: 'Getting Started',
        items: [
          { text: 'Connect to the Jetson System', link: '/en/orin-nano-series/connect-jetson' },
          { text: 'Camera', link: '/en/orin-nano-series/camera' },
          { text: 'GPIO Control', link: '/en/orin-nano-series/gpio' },
          { text: 'Other Peripherals', link: '/en/orin-nano-series/peripherals' },
          { text: 'USB Configuration', link: '/en/orin-nano-series/usb-config' },
        ]
      },
      {
        text: 'Advanced Tutorials',
        items: [
          { text: 'Install jtop', link: '/en/orin-nano-series/jtop' },
          { text: 'Install CUDA', link: '/en/orin-nano-series/cuda' },
          { text: 'Build OpenCV with CUDA', link: '/en/orin-nano-series/opencv' },
          { text: 'PyTorch and Torchvision', link: '/en/orin-nano-series/pytorch' },
          { text: 'TensorRT Acceleration', link: '/en/orin-nano-series/tensorrt' },
          { text: 'Install and Use Ollama', link: '/en/orin-nano-series/ollama' },
          { text: 'Deploy OpenClaw', link: '/en/orin-nano-series/openclaw' },
          { text: 'Deploy ComfyUI with Jetson Containers', link: '/en/orin-nano-series/jetson-container' },
          { text: 'Network Card Driver', link: '/en/orin-nano-series/network-driver' },
          { text: 'GMSL Camera Guide', link: '/en/orin-nano-series/gmsl-camera' },
          { text: '4G Module Guide', link: '/en/orin-nano-series/4g-module' },
          { text: 'Custom Boot Logo', link: '/en/orin-nano-series/boot-logo' },
        ]
      },
      {
        text: 'Module Flashing Overview',
        items: [
          { text: 'Orin Nano Flashing Overview', link: '/en/orin-nano-series/flashing' },
          { text: 'Orin NX Flashing Overview', link: '/en/orin-nx-series/flashing' },
        ]
      },
    ]
  },
  {
    text: 'GPIO Tutorials',
    items: [
      { text: '40-pin Expansion Header (Jetson-IO)', link: '/en/orin-nano-series/expansion-header' },
      { text: 'JetPack 6 GPIO Configuration', link: '/en/gpio-tutorial/jetpack6-gpio' },
      { text: 'JetPack 5 GPIO Configuration', link: '/en/gpio-tutorial/jetpack5-gpio' },
    ]
  },
  {
    text: 'Flashing Guide',
    items: [
      { text: 'Install Ubuntu VM and SDK Manager', link: '/en/flashing-guide/ubuntu-sdkmanager' },
      { text: 'Flash Official Developer Kit', link: '/en/flashing-guide/devkit-flashing' },
      { text: 'Flash C1901', link: '/en/flashing-guide/c1901-flashing' },
      { text: 'Flash C1902 / C1902 V2', link: '/en/flashing-guide/c1902-flashing' },
      { text: 'Flash C1903', link: '/en/flashing-guide/c1903-flashing' },
      { text: 'Flash C2401', link: '/en/flashing-guide/c2401-flashing' },
      { text: 'Flash JetPack 7 (ISO Installer)', link: '/en/flashing-guide/jetpack7-flashing' },
    ]
  },
  {
    text: 'FAQ & Troubleshooting',
    items: [
      { text: 'FAQ & Troubleshooting', link: '/en/faq/' },
    ]
  },
]

// ===== Chinese Nav =====
const rootNav = [
  { text: '首页', link: '/' },
  { text: '快速开始', link: '/quick-start' },
  { text: '选型对比', link: '/products/compare' },
  {
    text: '载板与套件',
    items: [
      { text: 'C1901 载板', link: '/c1901/c1901' },
      { text: 'C1902 V2 载板', link: '/c1902v2/c1902v2' },
      { text: 'C1902 (V1.x) 载板', link: '/c1902/c1902' },
      { text: 'C1903 载板 / 套件', link: '/c1903/c1903' },
      { text: 'C2401 迷你套件', link: '/c2401/c2401' },
      { text: 'C2402 载板（预发布）', link: '/c2402/c2402' },
    ]
  },
  { text: 'Jetson 教程', link: '/orin-nano-series/intro' },
  { text: 'GPIO', link: '/gpio-tutorial/jetpack6-gpio' },
  { text: '刷机', link: '/flashing-guide/ubuntu-sdkmanager' },
  { text: 'FAQ', link: '/faq/' },
]

// ===== English Nav =====
const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Quick Start', link: '/en/quick-start' },
  { text: 'Compare', link: '/en/products/compare' },
  {
    text: 'Boards & Kits',
    items: [
      { text: 'C1901 Carrier Board', link: '/en/c1901/c1901' },
      { text: 'C1902 V2 Carrier Board', link: '/en/c1902v2/c1902v2' },
      { text: 'C1902 (V1.x) Carrier Board', link: '/en/c1902/c1902' },
      { text: 'C1903 Carrier Board / Kit', link: '/en/c1903/c1903' },
      { text: 'C2401 Mini Kit', link: '/en/c2401/c2401' },
      { text: 'C2402 Carrier Board (Pre-release)', link: '/en/c2402/c2402' },
    ]
  },
  { text: 'Tutorials', link: '/en/orin-nano-series/intro' },
  { text: 'GPIO', link: '/en/gpio-tutorial/jetpack6-gpio' },
  { text: 'Flashing', link: '/en/flashing-guide/ubuntu-sdkmanager' },
  { text: 'FAQ', link: '/en/faq/' },
]

export default withMermaid(defineConfig({
  // GitHub Pages 用仓库名作 base；自托管(nginx 根路径)构建时用 DEPLOY_BASE=/ 覆盖
  base: process.env.DEPLOY_BASE || '/test_wiki_vitepress/',
  title: 'LinkZee Wiki',
  description: '控元科技(KYtech) LinkZee NVIDIA Jetson Orin 载板与套件技术文档',
  srcExclude: ['**/orin-nano-series/comfyui.md', '**/orin-nano-series/base-image.md'],

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: rootNav,
        sidebar: rootSidebar,
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'KYtech LinkZee NVIDIA Jetson Orin Carrier Board & Kit Documentation',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
      }
    }
  },

  themeConfig: {
    logo: '/img/logo-icon.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Akariayumu/test_wiki' }
    ],
  },

  // Mermaid：默认字体 "trebuchet ms" 不含中文字形，会回退到系统衬线字体，导致中英文粗细不一，
  // 且宽度测量偏小、中文被节点边框遮挡。指定与正文一致的无衬线中文字体栈，并放宽节点内边距/间距。
  mermaid: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Segoe UI", Roboto, sans-serif',
    flowchart: {
      htmlLabels: true,
      padding: 12,
      nodeSpacing: 55,
      rankSpacing: 55,
      useMaxWidth: true,
    },
  }
}))
