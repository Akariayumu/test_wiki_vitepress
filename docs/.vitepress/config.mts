import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// ===== Chinese (root locale) sidebar =====
const rootSidebar = [
  {
    text: '快速开始',
    items: [
      { text: '快速开始', link: '/quick-start' },
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
    ]
  },
  {
    text: 'C1903 载板/套件',
    items: [
      { text: 'C1903 规格书', link: '/c1903/c1903' },
    ]
  },
  {
    text: 'C2401 迷你套件',
    items: [
      { text: 'C2401 产品介绍', link: '/c2401/c2401' },
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
          { text: 'PyTorch 和 Torchvision', link: '/orin-nano-series/pytorch' },
          { text: '使用 TensorRT 加速', link: '/orin-nano-series/tensorrt' },
          { text: '安装使用 Ollama', link: '/orin-nano-series/ollama' },
          { text: '部署 OpenClaw', link: '/orin-nano-series/openclaw' },
          { text: 'Jetson-container', link: '/orin-nano-series/jetson-container' },
          { text: 'Jetson-container + Comfy-UI', link: '/orin-nano-series/comfyui' },
          { text: '网卡驱动', link: '/orin-nano-series/network-driver' },
          { text: '4G 模块使用说明', link: '/orin-nano-series/4g-module' },
          { text: '基础镜像制作', link: '/orin-nano-series/base-image' },
          { text: '自定义启动 LOGO', link: '/orin-nano-series/boot-logo' },
        ]
      },
      {
        text: '刷机教程',
        items: [
          { text: 'Orin Nano 刷机', link: '/orin-nano-series/flashing' },
          { text: 'Orin NX 刷机', link: '/orin-nx-series/flashing' },
        ]
      },
    ]
  },
  {
    text: 'GPIO 教程',
    items: [
      { text: '40-pin 扩展头配置 (Jetson-IO)', link: '/orin-nano-series/expansion-header' },
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
      { text: 'C1902 刷入系统', link: '/flashing-guide/c1902-flashing' },
      { text: 'C2401 刷入系统', link: '/flashing-guide/c2401-flashing' },
      { text: 'JetPack 7 刷入系统 (ISO 安装)', link: '/flashing-guide/jetpack7-flashing' },
    ]
  },
  {
    text: 'FAQ / 故障排查',
    items: [
      { text: '常见问题与诊断', link: '/faq/' },
    ]
  },
]

// ===== English locale sidebar (only pages with EN content) =====
const enSidebar = [
  {
    text: 'Quick Start',
    items: [
      { text: 'Quick Start', link: '/en/quick-start' },
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
          { text: 'jetson-container', link: '/en/orin-nano-series/jetson-container' },
          { text: 'jetson-container + ComfyUI', link: '/en/orin-nano-series/comfyui' },
          { text: 'Network Card Driver', link: '/en/orin-nano-series/network-driver' },
          { text: '4G Module Guide', link: '/en/orin-nano-series/4g-module' },
          { text: 'Build a Base Image', link: '/en/orin-nano-series/base-image' },
          { text: 'Custom Boot Logo', link: '/en/orin-nano-series/boot-logo' },
        ]
      },
      {
        text: 'Flashing',
        items: [
          { text: 'Flash Orin Nano', link: '/en/orin-nano-series/flashing' },
          { text: 'Flash Orin NX', link: '/en/orin-nx-series/flashing' },
        ]
      },
    ]
  },
  {
    text: 'GPIO Tutorial',
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
      { text: 'Flash the Official Developer Kit', link: '/en/flashing-guide/devkit-flashing' },
      { text: 'Flash the C1901', link: '/en/flashing-guide/c1901-flashing' },
      { text: 'Flash the C1902', link: '/en/flashing-guide/c1902-flashing' },
      { text: 'Flash the C2401', link: '/en/flashing-guide/c2401-flashing' },
      { text: 'Flash JetPack 7 (ISO Installer)', link: '/en/flashing-guide/jetpack7-flashing' },
    ]
  },
  {
    text: 'FAQ & Troubleshooting',
    items: [
      { text: 'Common Issues & Diagnostics', link: '/en/faq/' },
    ]
  },
]

// ===== Chinese Nav =====
const rootNav = [
  { text: '首页', link: '/' },
  { text: '选型对比', link: '/products/compare' },
  { text: 'C1902', link: '/c1902/c1902' },
  { text: 'C1903', link: '/c1903/c1903' },
  { text: 'C2401', link: '/c2401/c2401' },
  { text: 'Jetson 教程', link: '/orin-nano-series/intro' },
  { text: 'GPIO', link: '/gpio-tutorial/jetpack6-gpio' },
  { text: '刷机', link: '/flashing-guide/ubuntu-sdkmanager' },
]

// ===== English Nav =====
const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Compare', link: '/en/products/compare' },
  { text: 'C1902', link: '/en/c1902/c1902' },
  { text: 'C1903', link: '/en/c1903/c1903' },
  { text: 'C2401', link: '/en/c2401/c2401' },
  { text: 'Tutorials', link: '/en/orin-nano-series/intro' },
  { text: 'GPIO', link: '/en/gpio-tutorial/jetpack6-gpio' },
  { text: 'Flashing', link: '/en/flashing-guide/ubuntu-sdkmanager' },
]

export default withMermaid(defineConfig({
  // GitHub Pages 用仓库名作 base；自托管(nginx 根路径)构建时用 DEPLOY_BASE=/ 覆盖
  base: process.env.DEPLOY_BASE || '/test_wiki_vitepress/',
  title: 'LinkZee Wiki',
  description: '控元科技 Jetson Orin 载板产品文档',

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
