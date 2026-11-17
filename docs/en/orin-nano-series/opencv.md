---
title: Build OpenCV with CUDA
outline: deep
---

# Build OpenCV with CUDA

::: info Target Release Note
The OpenCV package preinstalled with JetPack does not have CUDA acceleration enabled (`CUDA: NO`). To use `cv::cuda` GPU-accelerated vision operators, build OpenCV alongside `opencv_contrib` from source.

Both the one-click script and manual steps below are verified on **JetPack 6.x (Ubuntu 22.04)**. On **JetPack 7 (Ubuntu 24.04)**, omit the legacy `libtbb2` package from `apt install` (`libtbb-dev` automatically pulls the newer runtime); all other CMake options remain identical.
:::

::: warning Out-of-Memory (OOM) Risk on Orin Nano 4GB / 8GB
Compiling OpenCV's CUDA C++ templates is memory-intensive (each compiler job can peak at 1.5–2 GB of RAM). Running `make -j$(nproc)` at full concurrency on **Orin Nano 4GB / 8GB** modules frequently triggers OOM kills or system freezes! Configure **at least 8 GB of Swap space** beforehand, or limit parallel build jobs to **`make -j4`** (`make -j2` on 4GB modules).
:::

![Checking CUDA support status of preinstalled OpenCV](/img/wiki-g2Timage.png)

## 1. Install via Script

Save the script below as `opencv_install.sh`, then run `chmod +x opencv_install.sh && ./opencv_install.sh` to automate dependency installation, source download, Orin GPU architecture detection, and compilation:

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

## 2. Build and Install Manually

### 2.1 Remove Preinstalled OpenCV

To prevent header and library conflicts with the non-CUDA OpenCV shipped in JetPack, purge the system packages first (enclose the wildcard in single quotes so the shell does not expand local filenames):

```bash
sudo apt purge '*libopencv*'
sudo apt autoremove -y
sudo apt update
```

### 2.2 Install Build Dependencies

The package list below targets **JetPack 6.x (Ubuntu 22.04)** (ensure `nvcc` is already configured via [Install CUDA](/en/orin-nano-series/cuda)):

```bash
sudo apt update
sudo apt install -y build-essential cmake git libgtk2.0-dev pkg-config \
  libavcodec-dev libavformat-dev libswscale-dev \
  libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev python3-dev python3-numpy \
  libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libv4l-dev v4l-utils qv4l2 \
  curl unzip wget
```

### 2.3 Download OpenCV Source Code

Using **OpenCV 4.10.0** as an example, download and unpack both the main `opencv` repository and `opencv_contrib` (their versions must match):

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

### 2.4 Configure and Build

::: info Build Duration and Network Access
- During the CMake configuration step, third-party assets (such as ADE and WeChat QRCode models) are fetched from GitHub; ensure internet connectivity before running `cmake`.
- Compilation typically takes **30–90 minutes**. On **Orin Nano 4GB / 8GB**, use `make -j4` (or `make -j2`) instead of `make -j$(nproc)` unless sufficient Swap is enabled.
:::

All Jetson Orin GPUs use compute capability **`8.7`** (`CUDA_ARCH_BIN="8.7"`). Configure and build OpenCV:

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

# You may increase to make -j$(nproc) on 16GB modules or when >= 8 GB Swap is active
make -j4
```

### 2.5 Install and Configure Environment Variables

Install the built libraries into `/usr/local` and dynamically detect the active Python `site-packages` path for `~/.bashrc`:

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

## 3. Verify the Installation

Open the `INFO` tab in [`jtop`](/en/orin-nano-series/jtop) to confirm that OpenCV now reports **`compiled CUDA: YES`**:

![Verifying OpenCV with CUDA status in jtop](/img/wiki-bA0image.png)

You can also compile and run the following C++ test program `test_cuda.cpp` to benchmark CPU vs. CUDA GPU matrix multiplication and verify numerical accuracy:

```cpp
// test_cuda.cpp

#include <opencv2/opencv.hpp>
#include <opencv2/core/cuda.hpp>
#include <opencv2/cudaarithm.hpp>
#include <iostream>
#include <chrono>

// CPU matrix multiplication
void cpu_matrix_mult(cv::Mat& a, cv::Mat& b, cv::Mat& result) {
    for (int i = 0; i < 50; i++) {
        result = a * b;
    }
}

// GPU matrix multiplication
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

        // Create two 1000x1000 random matrices
        cv::Mat mat_a(1000, 1000, CV_32FC1);
        cv::Mat mat_b(1000, 1000, CV_32FC1);
        cv::randu(mat_a, 0.0f, 1.0f);
        cv::randu(mat_b, 0.0f, 1.0f);

        cv::Mat cpu_result;

        // CPU test
        auto start_cpu = std::chrono::high_resolution_clock::now();
        cpu_matrix_mult(mat_a, mat_b, cpu_result);
        auto end_cpu = std::chrono::high_resolution_clock::now();
        double cpu_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_cpu - start_cpu).count();

        // GPU test
        cv::cuda::GpuMat d_mat_a, d_mat_b, d_result;
        d_mat_a.upload(mat_a);
        d_mat_b.upload(mat_b);

        auto start_gpu = std::chrono::high_resolution_clock::now();
        gpu_matrix_mult(d_mat_a, d_mat_b, d_result);
        auto end_gpu = std::chrono::high_resolution_clock::now();
        double gpu_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_gpu - start_gpu).count();

        // Download the result for verification
        cv::Mat gpu_result;
        d_result.download(gpu_result);

        // Compute L2 norm error (near zero within floating-point precision)
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

Compile and run the benchmark on the Jetson terminal:

```bash
g++ test_cuda.cpp -o test_cuda $(pkg-config --cflags --libs opencv4)
./test_cuda
```

Expected output:

```text
--- OpenCV CUDA Matrix Multiplication Test ---
Result difference: 0.00142815
Performance Results:
 - CPU time: 2451 ms
 - GPU time: 186 ms
 - Speedup: 13.1774x

✅ CUDA matrix multiplication test completed
```
