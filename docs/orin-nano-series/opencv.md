---
title: 编译 OpenCV with CUDA
outline: deep
---

# 编译 OpenCV with CUDA

::: info 适用版本说明
JetPack 系统默认预装的 OpenCV 未开启 CUDA 加速模块（`CUDA: NO`），如需调用 `cv::cuda` 进行 GPU 图像处理加速，需结合 `opencv_contrib` 自行从源码编译安装。

本文的一键脚本与手动编译流程基于 **JetPack 6.x（Ubuntu 22.04）** 验证。若在 **JetPack 7（Ubuntu 24.04）** 上编译，`apt` 安装依赖时去掉旧包名 `libtbb2`（保留 `libtbb-dev` 即可自动拉取新版运行库），其余编译参数通用。
:::

::: warning Orin Nano 4GB / 8GB 编译内存不足警告
编译带 CUDA 支持的 OpenCV 会占用大量内存（单个编译线程峰值可达 1.5–2 GB）。在 **Orin Nano 4GB / 8GB** 核心卡上若直接满核执行 `make -j$(nproc)`，极易触发内存耗尽（OOM）导致编译器被杀或系统死机！建议提前挂载 **8 GB 以上的 Swap 交换空间**，或将并行线程数限制为 **`make -j4`**（4GB 核心卡建议 `make -j2`）。
:::

![检查预装 OpenCV 的 CUDA 支持状态](/img/wiki-g2Timage.png)

## 1. 脚本一键安装

将以下脚本内容保存为 `opencv_install.sh`，然后执行 `chmod +x opencv_install.sh && ./opencv_install.sh` 即可自动完成依赖安装、源码拉取、Orin 架构识别与编译部署：

```bash
#!/bin/bash
# opencv_install.sh
# Adapted for Jetson Orin (JetPack 6.x / Ubuntu 22.04)

version="4.10.0"
folder="workspace"
remove_old=""

set -e

# Parse command-line arguments
for arg in "$@"; do
    case $arg in
        --version=*)
            version="${arg#*=}"
            ;;
        --folder=*)
            folder="${arg#*=}"
            ;;
        --remove-old=*)
            remove_old="${arg#*=}"
            ;;
        --help|-h)
            echo "Usage: $0 [--version=4.x.x] [--folder=dir] [--remove-old=yes/no]"
            exit 0
            ;;
        *)
            echo "Unknown parameter: $arg"
            echo "Usage: $0 [--version=4.x.x] [--folder=dir] [--remove-old=yes/no]"
            exit 1
            ;;
    esac
done

mkdir -p "$folder"
cd "$folder" || exit 1

# Old OpenCV removal logic
if [ -z "$remove_old" ]; then
    read -rp "Do you want to remove system-installed OpenCV? (yes/no): " remove_old
fi

case "$remove_old" in
    [yY] | [yY][eE][sS])
        echo "** Removing system OpenCV packages"
        sudo apt-get -y purge '*libopencv*'
        sudo apt-get -y autoremove
        ;;
    *)
        echo "** Skipping system OpenCV removal"
        ;;
esac

echo "------------------------------------"
echo "** Installing dependencies (1/4)"
echo "------------------------------------"
sudo apt-get update
sudo apt-get install -y build-essential cmake git libgtk2.0-dev pkg-config \
    libavcodec-dev libavformat-dev libswscale-dev libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev python3-dev python3-numpy \
    libtbb-dev libjpeg-dev libpng-dev libtiff-dev libv4l-dev v4l-utils qv4l2 curl unzip wget

for dep in g++ cmake git pkg-config; do
    if ! command -v "$dep" > /dev/null; then
        echo "Error: $dep installation failed"
        exit 1
    fi
done

echo "------------------------------------"
echo "** Downloading OpenCV ${version} (2/4)"
echo "------------------------------------"
download_opencv=false
download_contrib=false

if [ ! -f "opencv-${version}.zip" ]; then
    wget -O "opencv-${version}.zip" "https://github.com/opencv/opencv/archive/${version}.zip"
    download_opencv=true
fi

if [ ! -f "opencv_contrib-${version}.zip" ]; then
    wget -O "opencv_contrib-${version}.zip" "https://github.com/opencv/opencv_contrib/archive/${version}.zip"
    download_contrib=true
fi

if [ ! -d "opencv-${version}" ] || $download_opencv; then
    rm -rf "opencv-${version}"
    unzip -q "opencv-${version}.zip"
fi

if [ ! -d "opencv_contrib-${version}" ] || $download_contrib; then
    rm -rf "opencv_contrib-${version}"
    unzip -q "opencv_contrib-${version}.zip"
fi

rm -f "opencv-${version}.zip" "opencv_contrib-${version}.zip"
cd "opencv-${version}" || exit 1

echo "------------------------------------"
echo "** Building OpenCV ${version} (3/4)"
echo "------------------------------------"
mkdir -p release
cd release

# Auto-detect CUDA architecture (prefer /proc/device-tree/model on Jetson)
cuda_arch=""
gpu_name=""
if [ -r /proc/device-tree/model ]; then
    dt_model=$(tr -d '\0' < /proc/device-tree/model)
    if [[ "$dt_model" == *"Orin"* ]]; then
        cuda_arch="8.7"
        gpu_name="$dt_model"
    fi
fi
if [ -z "$cuda_arch" ] && command -v nvidia-smi &> /dev/null; then
    gpu_name=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n1)
    if [[ "$gpu_name" == *"Orin"* ]]; then
        cuda_arch="8.7"
    elif [[ "$gpu_name" == *"A100"* ]]; then
        cuda_arch="8.0"
    fi
fi

py_ver=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
py_site="/usr/local/lib/python${py_ver}/site-packages"

cmake_cmd="cmake -D WITH_CUDA=ON -D WITH_CUDNN=ON -D OPENCV_GENERATE_PKGCONFIG=ON "
cmake_cmd+="-D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib-${version}/modules "
cmake_cmd+="-D WITH_GSTREAMER=ON -D WITH_LIBV4L=ON -D BUILD_opencv_python3=ON "
cmake_cmd+="-D PYTHON3_PACKAGES_PATH=${py_site} "
cmake_cmd+="-D BUILD_TESTS=OFF -D BUILD_PERF_TESTS=OFF -D BUILD_EXAMPLES=OFF "
cmake_cmd+="-D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local "

if [ -n "$cuda_arch" ]; then
    echo "Detected platform: ${gpu_name}, using CUDA_ARCH_BIN=${cuda_arch}"
    cmake_cmd+="-D CUDA_ARCH_BIN=${cuda_arch} -D CUDA_ARCH_PTX=\"\" "
else
    echo "Warning: GPU model not recognized, skipping explicit CUDA_ARCH_BIN"
fi

echo "CMake command: $cmake_cmd .."
eval "$cmake_cmd .."

# Limit parallel jobs on 4GB / 8GB boards to avoid OOM
total_mem_mb=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo)
if [ "$total_mem_mb" -le 4500 ]; then
    cpu_cores=2
elif [ "$total_mem_mb" -le 8500 ]; then
    cpu_cores=4
else
    cpu_cores=$(($(nproc) - 1))
    [ "$cpu_cores" -lt 1 ] && cpu_cores=1
fi
echo "Building with ${cpu_cores} parallel jobs (detected RAM: ${total_mem_mb} MB)"
make -j"${cpu_cores}"

echo "------------------------------------"
echo "** Installing OpenCV ${version} (4/4)"
echo "------------------------------------"
sudo make install
sudo ldconfig

bashrc=~/.bashrc
env_lines=(
    'export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH'
    "export PYTHONPATH=${py_site}:\$PYTHONPATH"
)

for line in "${env_lines[@]}"; do
    if ! grep -Fxq "$line" "$bashrc"; then
        echo "$line" >> "$bashrc"
    fi
done

echo "** OpenCV ${version} installation completed!"
echo "Run 'source ~/.bashrc' and verify with:"
echo "  pkg-config --modversion opencv4"
echo "  python3 -c 'import cv2; print(cv2.__version__, cv2.cuda.getCudaEnabledDeviceCount())'"
```

## 2. 手动编译安装

### 2.1 卸载系统预装 OpenCV

为避免多版本头文件与动态库冲突，可先卸载系统自带的无 CUDA 版 OpenCV（注意给通配符加上单引号，防止被当前目录文件名展开）：

```bash
sudo apt purge '*libopencv*'
sudo apt autoremove -y
sudo apt update
```

### 2.2 安装编译依赖包

以下依赖包以 **JetPack 6.x（Ubuntu 22.04）** 为基准（已确认先按 [安装 CUDA](/orin-nano-series/cuda) 配置好 `nvcc` 环境）：

```bash
sudo apt update
sudo apt install -y build-essential cmake git libgtk2.0-dev pkg-config \
  libavcodec-dev libavformat-dev libswscale-dev \
  libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev python3-dev python3-numpy \
  libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libv4l-dev v4l-utils qv4l2 \
  curl unzip wget
```

### 2.3 获取 OpenCV 源码

以 **OpenCV 4.10.0** 为例，下载并解压主仓库与 `opencv_contrib` 扩展模块（两者版本号必须完全一致）：

```bash
mkdir -p ~/opencv-build && cd ~/opencv-build
version=4.10.0
wget -O "opencv-${version}.zip" "https://github.com/opencv/opencv/archive/${version}.zip"
wget -O "opencv_contrib-${version}.zip" "https://github.com/opencv/opencv_contrib/archive/${version}.zip"
unzip -q "opencv-${version}.zip"
unzip -q "opencv_contrib-${version}.zip"
rm "opencv-${version}.zip" "opencv_contrib-${version}.zip"
cd "opencv-${version}"
```

### 2.4 配置与编译源码

::: info 编译与网络提示
- CMake 配置阶段会自动从 GitHub 下载 ADE、WeChat QRCode 等第三方依赖文件，请确保网络畅通。
- 整个编译过程耗时约 **30–90 分钟**。在 **Orin Nano 4GB / 8GB** 上请使用 `make -j4`（或 `make -j2`）代替 `make -j$(nproc)`，以防内存溢出。
:::

Jetson Orin 全系列 GPU 算力架构代号均为 **`8.7`**（`CUDA_ARCH_BIN="8.7"`）。执行以下命令生成构建配置并启动编译：

```bash
PY_SITE=$(python3 -c "import sys; print(f'/usr/local/lib/python{sys.version_info.major}.{sys.version_info.minor}/site-packages')")

mkdir -p build && cd build
cmake -D WITH_CUDA=ON \
  -D WITH_CUDNN=ON \
  -D CUDA_ARCH_BIN="8.7" \
  -D CUDA_ARCH_PTX="" \
  -D OPENCV_GENERATE_PKGCONFIG=ON \
  -D OPENCV_EXTRA_MODULES_PATH="../../opencv_contrib-${version}/modules" \
  -D WITH_GSTREAMER=ON \
  -D WITH_LIBV4L=ON \
  -D BUILD_opencv_python3=ON \
  -D PYTHON3_PACKAGES_PATH="${PY_SITE}" \
  -D BUILD_TESTS=OFF \
  -D BUILD_PERF_TESTS=OFF \
  -D BUILD_EXAMPLES=OFF \
  -D CMAKE_BUILD_TYPE=RELEASE \
  -D CMAKE_INSTALL_PREFIX=/usr/local ..

# 16GB 核心卡或已配置充足 Swap 时可改用 make -j$(nproc)
make -j4
```

### 2.5 安装并配置环境变量

将编译产物安装到 `/usr/local`，并动态获取当前 Python 版本的 `site-packages` 路径写入 `~/.bashrc`：

```bash
sudo make install
sudo ldconfig

PY_SITE=$(python3 -c "import sys; print(f'/usr/local/lib/python{sys.version_info.major}.{sys.version_info.minor}/site-packages')")
grep -qxF 'export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH' ~/.bashrc || \
  echo 'export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH' >> ~/.bashrc
grep -qxF "export PYTHONPATH=${PY_SITE}:\$PYTHONPATH" ~/.bashrc || \
  echo "export PYTHONPATH=${PY_SITE}:\$PYTHONPATH" >> ~/.bashrc
source ~/.bashrc
```

## 3. 验证测试

安装完成后，可在 [`jtop`](/orin-nano-series/jtop) 的 `INFO` 页面看到 OpenCV 已显示 **`compiled CUDA: YES`**：

![jtop 中确认 OpenCV 已启用 CUDA 支持](/img/wiki-bA0image.png)

也可编写以下 C++ 测试程序 `test_cuda.cpp`，对比 CPU 与 CUDA GPU 矩阵乘法的耗时与计算精度：

```cpp
// test_cuda.cpp

#include <opencv2/opencv.hpp>
#include <opencv2/core/cuda.hpp>
#include <opencv2/cudaarithm.hpp>
#include <iostream>
#include <chrono>

// CPU 矩阵乘法
void cpu_matrix_mult(cv::Mat& a, cv::Mat& b, cv::Mat& result) {
    for (int i = 0; i < 50; i++) {
        result = a * b;
    }
}

// GPU 矩阵乘法
void gpu_matrix_mult(cv::cuda::GpuMat& d_a, cv::cuda::GpuMat& d_b, cv::cuda::GpuMat& d_result) {
    cv::cuda::Stream stream;

    for (int i = 0; i < 50; i++) {
        cv::cuda::gemm(d_a, d_b, 1.0, cv::cuda::GpuMat(), 0, d_result, 0, stream);
        stream.waitForCompletion();
    }
}

int main() {
    try {
        std::cout << "--- OpenCV CUDA Matrix Multiplication Test ---\n";

        // 创建两个 1000x1000 的随机矩阵
        cv::Mat mat_a(1000, 1000, CV_32FC1);
        cv::Mat mat_b(1000, 1000, CV_32FC1);
        cv::randu(mat_a, 0.0f, 1.0f);
        cv::randu(mat_b, 0.0f, 1.0f);

        cv::Mat cpu_result;

        // CPU 测试
        auto start_cpu = std::chrono::high_resolution_clock::now();
        cpu_matrix_mult(mat_a, mat_b, cpu_result);
        auto end_cpu = std::chrono::high_resolution_clock::now();
        double cpu_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_cpu - start_cpu).count();

        // GPU 测试
        cv::cuda::GpuMat d_mat_a, d_mat_b, d_result;
        d_mat_a.upload(mat_a);
        d_mat_b.upload(mat_b);

        auto start_gpu = std::chrono::high_resolution_clock::now();
        gpu_matrix_mult(d_mat_a, d_mat_b, d_result);
        auto end_gpu = std::chrono::high_resolution_clock::now();
        double gpu_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_gpu - start_gpu).count();

        // 下载结果进行验证
        cv::Mat gpu_result;
        d_result.download(gpu_result);

        // 计算 L2 误差（浮点精度下通常接近 0）
        double diff = cv::norm(cpu_result, gpu_result, cv::NORM_L2);
        std::cout << "Result difference: " << diff << "\n";

        std::cout << "Performance Results:\n"
                  << " - CPU time: " << cpu_time << " ms\n"
                  << " - GPU time: " << gpu_time << " ms\n"
                  << " - Speedup: " << cpu_time / gpu_time << "x\n";

        std::cout << "\n✅ CUDA matrix multiplication test completed\n";
        return 0;

    } catch (const cv::Exception& e) {
        std::cerr << "OpenCV Error (" << e.err << "): " << e.what() << "\n";
        return -1;
    } catch (const std::exception& e) {
        std::cerr << "Standard Error: " << e.what() << "\n";
        return -2;
    }
}
```

在 Jetson 开发板终端编译并运行测试程序：

```bash
g++ test_cuda.cpp -o test_cuda $(pkg-config --cflags --libs opencv4)
./test_cuda
```

预期终端输出如下：

```text
--- OpenCV CUDA Matrix Multiplication Test ---
Result difference: 0.00142815
Performance Results:
 - CPU time: 2451 ms
 - GPU time: 186 ms
 - Speedup: 13.1774x

✅ CUDA matrix multiplication test completed
```
