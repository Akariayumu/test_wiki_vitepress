import { defineConfig } from 'vitepress'

// ===== Chinese (root locale) sidebar =====
const rootSidebar = [
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
    text: 'C2401 迷你套件',
    items: [
      { text: 'C2401 产品介绍', link: '/c2401/c2401' },
    ]
  },
  {
    text: 'Orin Nano 系列',
    collapsed: false,
    items: [
      {
        text: '入门教程',
        items: [
          { text: '一、产品介绍', link: '/orin-nano-series/intro' },
          { text: '二、刷机教程', link: '/orin-nano-series/flashing' },
          { text: '三、摄像头', link: '/orin-nano-series/camera' },
          { text: '四、GPIO 控制', link: '/orin-nano-series/gpio' },
          { text: '五、其他外设', link: '/orin-nano-series/peripherals' },
          { text: 'USB 配置说明', link: '/orin-nano-series/usb-config' },
          { text: '连接到 Jetson 系统', link: '/orin-nano-series/connect-jetson' },
        ]
      },
      {
        text: '进阶教程',
        items: [
          { text: '安装 jtop', link: '/orin-nano-series/jtop' },
          { text: '安装 CUDA', link: '/orin-nano-series/cuda' },
          { text: '编译 OpenCV with CUDA', link: '/orin-nano-series/opencv' },
          { text: 'PyTorch 和 Torchvision', link: '/orin-nano-series/pytorch' },
          { text: '安装使用 Ollama', link: '/orin-nano-series/ollama' },
          { text: 'Jetson-container', link: '/orin-nano-series/jetson-container' },
          { text: '网卡驱动', link: '/orin-nano-series/network-driver' },
          { text: '4G 模块使用说明', link: '/orin-nano-series/4g-module' },
          { text: '基础镜像制作', link: '/orin-nano-series/base-image' },
          { text: '自定义启动 LOGO', link: '/orin-nano-series/boot-logo' },
        ]
      },
    ]
  },
  {
    text: 'Orin NX 系列',
    collapsed: false,
    items: [
      {
        text: '入门教程',
        items: [
          { text: '一、产品介绍', link: '/orin-nx-series/intro' },
          { text: '二、刷机教程', link: '/orin-nx-series/flashing' },
          { text: '三、摄像头', link: '/orin-nx-series/camera' },
          { text: '四、GPIO 控制', link: '/orin-nx-series/gpio' },
          { text: '五、其他外设', link: '/orin-nx-series/peripherals' },
          { text: 'USB 配置说明', link: '/orin-nx-series/usb-config' },
          { text: '连接到 Jetson 系统', link: '/orin-nx-series/connect-jetson' },
        ]
      },
      {
        text: '进阶教程',
        items: [
          { text: '安装 jtop', link: '/orin-nx-series/jtop' },
          { text: '安装 CUDA', link: '/orin-nx-series/cuda' },
          { text: '编译 OpenCV with CUDA', link: '/orin-nx-series/opencv' },
          { text: 'PyTorch 和 Torchvision', link: '/orin-nx-series/pytorch' },
          { text: '安装使用 Ollama', link: '/orin-nx-series/ollama' },
          { text: 'Jetson-container', link: '/orin-nx-series/jetson-container' },
          { text: '使用 TensorRT 加速', link: '/orin-nx-series/tensorrt' },
          { text: '网卡驱动', link: '/orin-nx-series/network-driver' },
          { text: '4G 模块使用说明', link: '/orin-nx-series/4g-module' },
        ]
      },
    ]
  },
  {
    text: 'Orin Nano 指南',
    collapsed: false,
    items: [
      {
        text: '入门教程',
        items: [
          { text: '连接到 Jetson 系统', link: '/orin-nano-guide/connect-jetson' },
          { text: '摄像头', link: '/orin-nano-guide/camera' },
          { text: 'GPIO 控制', link: '/orin-nano-guide/gpio' },
          { text: '其他外设', link: '/orin-nano-guide/peripherals' },
        ]
      },
      {
        text: 'JetPack 配置说明',
        items: [
          { text: '安装 jtop', link: '/orin-nano-guide/jtop' },
          { text: '安装 CUDA', link: '/orin-nano-guide/cuda' },
          { text: 'C1901/C1902 USB 配置', link: '/orin-nano-guide/usb-config' },
          { text: '自定义启动 LOGO', link: '/orin-nano-guide/boot-logo' },
          { text: '网卡驱动', link: '/orin-nano-guide/network-driver' },
          { text: '4G 模块使用说明', link: '/orin-nano-guide/4g-module' },
          { text: '基础镜像制作', link: '/orin-nano-guide/base-image' },
        ]
      },
      {
        text: 'AI 视觉教程',
        items: [
          { text: '编译 OpenCV with CUDA', link: '/orin-nano-guide/opencv' },
          { text: 'PyTorch 和 Torchvision', link: '/orin-nano-guide/pytorch' },
          { text: 'Jetson-container + Comfy-UI', link: '/orin-nano-guide/comfyui' },
        ]
      },
      {
        text: '大模型教程',
        items: [
          { text: '安装使用 Ollama', link: '/orin-nano-guide/ollama' },
        ]
      },
    ]
  },
  {
    text: 'GPIO 教程',
    items: [
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
    ]
  },
]

// ===== English locale sidebar (only pages with EN content) =====
const enSidebar = [
  {
    text: 'C1902 Carrier Board',
    items: [
      { text: 'C1902 Introduction', link: '/en/c1902/c1902-introduction' },
    ]
  },
  {
    text: 'C2401 Mini Kit',
    items: [
      { text: 'C2401 Introduction', link: '/en/c2401/c2401-introduction' },
    ]
  },
]

// ===== Chinese Nav =====
const rootNav = [
  { text: '首页', link: '/' },
  { text: 'C1902', link: '/c1902/c1902' },
  { text: 'C2401', link: '/c2401/c2401' },
  { text: 'Orin Nano', link: '/orin-nano-series/intro' },
  { text: 'Orin NX', link: '/orin-nx-series/intro' },
  { text: 'GPIO', link: '/gpio-tutorial/jetpack6-gpio' },
  { text: '刷机', link: '/flashing-guide/ubuntu-sdkmanager' },
]

// ===== English Nav =====
const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'C1902', link: '/en/c1902/c1902-introduction' },
  { text: 'C2401', link: '/en/c2401/c2401-introduction' },
]

export default defineConfig({
  base: '/test_wiki_vitepress/',
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
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Akariayumu/test_wiki' }
    ],
  },

  // Route rewrites: c1902-introduction.md → /c1902/c1902-introduction
  rewrites: {
    'c1902/c1902-introduction.md': 'en/c1902/c1902-introduction.md',
    'c2401/c2401-introduction.md': 'en/c2401/c2401-introduction.md',
  }
})
