---
title: Connect to the Jetson System
outline: deep
---

# Connect to the Jetson System

Jetson carrier boards provide a display output (DP / HDMI), an RJ45 Ethernet port, a USB Type-C port, and a UART debug header. Depending on whether you have a monitor or local network available, you can connect to and operate the Jetson system using any of the five methods below:

1. **Connect a Monitor**: Direct desktop setup with a physical display, keyboard, and mouse.
2. **Connect via SSH over LAN**: Standard remote command-line access over Ethernet or Wi-Fi.
3. **Connect via SSH over USB Type-C**: Direct single-cable SSH access without a router or Ethernet cable.
4. **Connect to the Remote Desktop**: Graphical desktop access over the network for headless setups.
5. **Connect via UART Debug Serial**: Low-level serial console access for boot logs, headless first-boot setup, and troubleshooting without network or display.

## 1. Connect a Monitor

Connect a monitor to the carrier board's video port, plug in a USB keyboard and mouse, and apply power to boot directly into the Ubuntu desktop.

Video connector types vary by carrier board model:

- **DisplayPort 1.2**: NVIDIA Official Developer Kit, `C1902`, `C1902 V2`
- **Standard HDMI**: `C1901` (converted from DP, supports 1080p under stock firmware), `C1903` (HDMI 2.1), `C2402`
- **Mini HDMI**: `C2401` (Mini HDMI 2.1; requires a Mini HDMI to HDMI cable)

::: warning Active DP-to-HDMI Adapter Required for DisplayPort Boards
When connecting a **DisplayPort (DP)** carrier board (Official DevKit, C1902, or C1902 V2) to an HDMI monitor, **you must use an active DP-to-HDMI cable or adapter** with a built-in protocol converter chip. Passive DP-to-HDMI cables may result in a blank screen with no signal.
:::

## 2. Connect via SSH over LAN

::: info Prerequisite
SSH login requires a system user account to be configured beforehand (either pre-configured in SDK Manager before flashing, or created through the first-boot setup wizard via a monitor or UART debug console).
:::

### 2.1 Find the Board's LAN IP Address

1. Connect the carrier board's RJ45 Ethernet port to the same router or switch as your host PC (or connect both to the same Wi-Fi network), then power on the board.
2. Obtain the IPv4 address assigned to the Jetson board using either method below:
   - **Method 1 (Router Admin Console)**: Log in to your router's web admin page and check the connected client list for a device whose manufacturer is **`NVIDIA Corporation`** (or matching your configured hostname).

     ![Find the Jetson IP address in the router client list](/img/wiki-fBZimage.png)

     *Router console example: under **Client Status (`客户端状态`) → Online (`在线`)** on the right, locate the **`NVIDIA Corporation`** entry (here `192.168.50.192`).*

   - **Method 2 (LAN IP Scanner)**: Run a network scanner such as **Advanced IP Scanner** (Windows) or `nmap` on the same subnet and look for **`NVIDIA Corporation`** under the Manufacturer column.

     ![Scan the local subnet with Advanced IP Scanner](/img/wiki-image.png)

     *Advanced IP Scanner columns from left to right: **Status (`状态`)**, **Name (`名称`)**, **IP**, **Manufacturer (`制造商`: `NVIDIA Corporation`)**, and **MAC Address (`MAC 地址`)**.*

### 2.2 Log In with an SSH Client

You can run `ssh <username>@<jetson-ip>` directly in a terminal on Windows, macOS, or Linux, or use a graphical SSH client such as **MobaXterm** or **PuTTY**. Using **MobaXterm** on Windows as an example:

1. Launch MobaXterm and click **Session** in the top-left corner:

   ![Click Session in MobaXterm](/img/wiki-rBnimage.png)

2. Select **SSH**:

   ![Select SSH session type](/img/wiki-aDzimage.png)

3. Enter the Jetson's IP address in `Remote host`, check `Specify username` to enter your Ubuntu username, and click **OK**:

   ![Enter the IP address and username in MobaXterm](/img/wiki-0S0image.png)

4. Enter your password at the prompt and press `Enter` (characters are intentionally hidden while typing passwords in Linux terminals) to log in:

   ![Enter the SSH password at the prompt](/img/wiki-ryXimage.png)

   ![Logged in to the Jetson terminal via SSH](/img/wiki-L2iimage.png)

## 3. Connect via SSH over USB Type-C

When neither a router nor a monitor is available, you can establish an SSH session directly over a **USB Type-C** data cable.

1. **Boot the board and connect USB Type-C**: Power on the Jetson board normally and wait 30–60 seconds for Ubuntu to finish booting. Then connect the carrier board's USB Type-C port to your host PC using a **data-capable USB Type-C cable**.
2. **Verify the USB virtual network interface**: In normal operating mode, your PC acts as the **USB Host** while the Jetson board operates in **USB Device (virtual Ethernet / RNDIS / CDC-ECM) mode**. The PC automatically detects a virtual network adapter and receives an IP such as `192.168.55.100`, while **the Jetson board's static IP on this virtual link is always `192.168.55.1`**:

   ![Windows network properties showing the Jetson RNDIS virtual adapter](/img/wiki-5Kbimage.png)

   *Windows Network Properties example (`Unidentified network` / `未识别的网络`): **Description (`描述`)** displays `Remote NDIS Compatible Device`, **IPv4 address (`IPv4 地址`)** on the host PC is `192.168.55.100`, and the Jetson system listens at `192.168.55.1`.*

   ::: tip Virtual Network Adapter Not Appearing?
   - Ensure you are using a data-capable USB cable (not a charge-only cable) and that the board booted normally rather than into Force Recovery mode.
   - After flashing stock NVIDIA firmware onto certain KYtech carrier boards, you may need to install the board-specific device tree per [USB Configuration](/en/orin-nano-series/usb-config) for full USB functionality. (On C1901 where Type-C is wired for flashing, use LAN SSH or UART Debug Serial instead.)
   :::

3. **Connect via SSH**: Run `ssh <username>@192.168.55.1` in your host terminal, or open an SSH session to **`192.168.55.1`** in MobaXterm:

   ![Connect to 192.168.55.1 over USB Type-C SSH](/img/wiki-xOtimage.png)

## 4. Connect to the Remote Desktop

::: tip Headless Display Dummy Plug Tip
When booting without a physical monitor attached, the desktop session may fall back to a low resolution or fail to initialize a display server. Plugging a **DP / HDMI dummy plug (EDID emulator)** into the carrier board is recommended for smooth, full-resolution headless remote desktop performance.
:::

### 4.1 Use NoMachine (Recommended for JetPack 5 / 6 / 7)

**NoMachine** uses the low-latency **NX protocol**, works out of the box across **JetPack 5, JetPack 6, and JetPack 7**, and is recommended for graphical workloads:

1. Download and install the [NoMachine client](https://www.nomachine.com/) on your host computer:

   ![Download NoMachine for the host computer](/img/wiki-15-8-2025-94138-www-nomachine-com.jpeg)

2. Visit the [NoMachine for ARM download page](https://www.nomachine.com/download/arm) and download the **ARMv8 DEB (`arm64`)** package (`nomachine_*_arm64.deb`):

   ![Download the NoMachine ARM64 DEB package](/img/wiki-15-8-2025-95031-download-nomachine-com.jpeg)

3. Upload the `.deb` package to the Jetson board (for example via MobaXterm's SFTP sidebar or `scp`) and install it in the **Jetson board terminal**:

   ![Upload the NoMachine DEB package via SFTP](/img/wiki-VFBimage.png)

   ```bash
   sudo dpkg -i nomachine_*_arm64.deb
   ```

4. With the host PC and Jetson on the same LAN (or linked via USB Type-C `192.168.55.1`), launch NoMachine on your PC and double-click the auto-discovered Jetson instance (or click **Add** to connect by IP):

   ![NoMachine discovers the Jetson board on the LAN](/img/wiki-HD3image.png)

   Click **OK** when prompted to verify and trust the server's host certificate fingerprint on first connection:

   ![Verify the host certificate fingerprint in NoMachine](/img/wiki-4r1image.png)

5. Enter your Jetson username and password and click **OK** to open the remote desktop:

   ![Log in with your Jetson system credentials](/img/wiki-Anoimage.png)

   Once connected, peel the top-right corner of the window (or press `Ctrl+Alt+0`) to adjust display resolution, scaling, and encoding quality:

   ![Connected to the Jetson Ubuntu desktop via NoMachine](/img/wiki-A8Rimage.webp)

   ![NoMachine display and session settings menu](/img/wiki-1LWimage.png)

### 4.2 Use Built-in Remote Desktop or VNC

::: warning JetPack 6 / 7 vs. JetPack 5 Compatibility
- **JetPack 6 / 7 (Ubuntu 22.04 / 24.04)**: Ubuntu 22.04+ removed the legacy `vino-server` package (running the `org.gnome.Vino` commands below on JetPack 6/7 will fail with `No such schema`). **NoMachine** (Section 4.1) is recommended; alternatively, open **Settings → Sharing / System → Remote Desktop** in the GNOME desktop to enable built-in **Remote Desktop** (RDP / VNC), set a persistent password, and connect from your PC using an RDP client (such as Windows Remote Desktop Connection `mstsc` or Remmina).
- **JetPack 5 (Ubuntu 20.04)**: Includes `vino-server` out of the box and can be configured via the commands below.
:::

On **JetPack 5 (Ubuntu 20.04) only**, run the following commands in the **Jetson board terminal** to enable `vino-server` on boot:

1. Symlink `vino-server.service` into the user graphical session target:

   ```bash
   cd /usr/lib/systemd/user/graphical-session.target.wants
   sudo ln -s ../vino-server.service ./
   ```

2. Disable interactive connection prompts and encryption requirements for standard VNC clients:

   ```bash
   gsettings set org.gnome.Vino prompt-enabled false
   gsettings set org.gnome.Vino require-encryption false
   ```

3. Set a VNC password (replace `your_password` with your desired password, up to 8 characters):

   ```bash
   gsettings set org.gnome.Vino authentication-methods "['vnc']"
   gsettings set org.gnome.Vino vnc-password $(echo -n 'your_password' | base64)
   ```

4. Reboot the system to apply changes:

   ```bash
   sudo reboot
   ```

5. Open a VNC client (such as VNC Viewer) on your PC, create a connection to the Jetson's LAN IP, and enter your VNC password (see [Setting Up VNC | NVIDIA Developer](https://developer.nvidia.com/embedded/learn/tutorials/vnc-setup) for details):

   ![Create a new connection in VNC Viewer](/img/wiki-cDeimage.webp)

   ![Enter the Jetson IP address in VNC Viewer](/img/wiki-P73image.png)

   ![Authenticate with the VNC password](/img/wiki-82Rimage.png)

   ![Connected to the Jetson desktop over VNC](/img/wiki-bjaimage.webp)

## 5. Connect via UART Debug Serial

The **UART Debug Serial** console connects directly to the SoC's primary serial console without relying on Ethernet, USB networking, or display drivers. It outputs early bootloader logs (MB1 / MB2 / UEFI) and Linux kernel messages from the moment power is applied, and lets you complete headless first-boot setup (`oem-config`) or diagnose boot failures.

### 5.1 Hardware Preparation and Wiring

Prepare a **3.3V logic-level USB-to-TTL serial adapter** (such as CP2102, FT232RL, or CH340; if your adapter has a `3.3V / 5V` voltage jumper, **set it to `3.3V`**).

::: danger Serial Wiring Rules
- **Cross-connect TX and RX**: Wire the USB-TTL adapter's **`TXD`** to the carrier board's **`RXD`**, wire the adapter's **`RXD`** to the board's **`TXD`**, and connect **`GND` to `GND`** (3 wires total).
- **Never connect the power pin**: **Do not connect the adapter's `5V` or `3.3V` (`VCC`) pin** to the carrier board, as back-feeding power can damage the board or your PC's USB port!
:::

Locate the debug UART pins according to your carrier board model:

- **Carrier boards with a 12-pin header (Official DevKit / C1901 / C1902 / C1902 V2)**: Use the **12-pin button / debug header** along the board edge (see [12-pin header pinout](/img/c1902-12pin.png)):
  - **Pin 3 (`UART2_RXD`)** ↔ USB-TTL **`TXD`**
  - **Pin 4 (`UART2_TXD`)** ↔ USB-TTL **`RXD`**
  - **Pin 7 (`GND`)** (or Pin 9 / Pin 11) ↔ USB-TTL **`GND`**
- **Carrier boards with a dedicated GH1.25 debug connector (C1903 / C2401 / C2402)**: Use the dedicated 4-pin GH1.25 debug header (labeled **`UART2 Debug`** on C1903 and C2402 with Pins 1–4 left-to-right as `1: GND, 2: RX, 3: TX, 4: 5V`; labeled **`UART DEBUG`** on the back of C2401 — see the wiring diagram in [C2401 Introduction](/en/c2401/c2401)). Connect `GND`, `RX` (to adapter `TXD`), and `TX` (to adapter `RXD`), and **leave the `5V` pin unconnected**.

![Connecting a USB-TTL serial cable to the 12-pin button/debug header](/img/jp7-serial-cable.webp)

### 5.2 Serial Terminal Settings and Login

1. Plug the USB-TTL adapter into your computer and identify its serial port name (`COMx` under Device Manager on Windows, `/dev/ttyUSB0` or `/dev/ttyACM0` on Linux, `/dev/cu.usbserial-*` on macOS).
2. Open the serial port in **MobaXterm** (`Session` → `Serial`), **PuTTY**, **minicom**, or **picocom** with the following settings:
   - **Baud rate (Speed)**: `115200`
   - **Data / Parity / Stop bits**: `8N1` (`8` data bits, `None` parity, `1` stop bit)
   - **Flow control**: `None` (disable both RTS/CTS and XON/XOFF)
   - On a Linux host PC, you can connect directly with `picocom`:

     ```bash
     sudo picocom -b 115200 /dev/ttyUSB0
     ```

3. Apply power to the Jetson board. Bootloader and kernel logs will stream in real time, followed by the Ubuntu `login:` prompt (press `Enter` once if the board was already running when you attached the cable). Enter your username and password to log in.
