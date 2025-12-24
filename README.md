# MAC-Shaper — Per-MAC bandwidth control for OpenWrt

<img src="https://github.com/DimaDoesCode/MAC-Shaper/blob/main/mac-shaper.jpeg" width="200" height="200" align="left"/> 
<b>mac-shaper</b> is a lightweight traffic shaping solution for OpenWrt that allows you to limit or control bandwidth <b>per MAC address</b> using Linux <code>tc</code> and <code>ifb</code>.<br><br>

It consists of:<br>
    - a backend daemon and init script<br>
    - LuCI web interface<br>
    - optional meta-package for easy installation

✅ Tested on **OpenWrt 24.10.4**. ❌ Not compatible with **OpenWrt 24.10.5**.

📦 **[Browse Packages & Documentation](https://dimadoescode.github.io/MAC-Shaper/)**  
🚀 **[Latest Release](https://github.com/DimaDoesCode/MAC-Shaper/releases/latest)**

---

## ✨ Features

- Per-MAC upload & download rate limiting
- Enable / disable individual rules without deleting them
- Fast reload without reboot
- LuCI UI with inline enable/disable checkboxes
- Clean UCI-based configuration
- Designed for embedded devices

---

## 📦 Packages

| Package | Description |
|------|------------|
| `mac-shaper` | Backend scripts, init.d service |
| `luci-app-mac-shaper` | LuCI web interface |

---

## 🧰 Requirements

- OpenWrt **24.10.4**
- Kernel support for:
  - `tc`
  - `ifb`
  - `sch_htb`

---

## 🚀 Installation

### Method 1: Using Custom Feed (Recommended)

📦 **Browse all available packages:** [https://dimadoescode.github.io/MAC-Shaper/](https://dimadoescode.github.io/MAC-Shaper/)

**Step 1:** Add the custom feed to your router

Choose your architecture from the list below (or visit the [package repository](https://dimadoescode.github.io/MAC-Shaper/) to browse all available targets):

| Architecture | Feed URL |
|-------------|----------|
| ipq806x-generic | `https://dimadoescode.github.io/MAC-Shaper/ipq806x-generic` |
| mvebu-cortexa9 | `https://dimadoescode.github.io/MAC-Shaper/mvebu-cortexa9` |

```sh
# SSH into your OpenWrt router
ssh root@192.168.1.1

# Add the feed (replace URL with your architecture)
echo "src/gz mac_shaper_feed https://dimadoescode.github.io/MAC-Shaper/ipq806x-generic" >> /etc/opkg/customfeeds.conf
```

**Step 2:** Disable signature checking

Since these packages are not officially signed, you need to temporarily disable signature verification:

```sh
# Edit the opkg configuration
vi /etc/opkg.conf

# Find the line:
#   option check_signature
# And comment it out by adding # at the beginning:
#   #option check_signature

# Or use sed to do it automatically:
sed -i 's/^option check_signature/#option check_signature/' /etc/opkg.conf
```

**Step 3:** Install packages

```sh
opkg update
opkg install mac-shaper luci-app-mac-shaper
```

**Step 4:** (Optional) Re-enable signature checking

After installation, you can re-enable signature verification for official packages:

```sh
sed -i 's/^#option check_signature/option check_signature/' /etc/opkg.conf
```

⚠️ **Security Note:** Disabling signature checks should be done carefully. Only install packages from trusted sources. You can re-enable signature verification immediately after installing these packages.

### Method 2: Manual Installation from Releases

Download the `.ipk` files for your architecture from the [Releases page](https://github.com/DimaDoesCode/MAC-Shaper/releases/latest) and install them manually:

```sh
# Transfer files to your router
scp *.ipk root@192.168.1.1:/tmp/

# SSH into router and install
ssh root@192.168.1.1
cd /tmp
opkg install mac-shaper_*.ipk
opkg install luci-app-mac-shaper_*.ipk
```

---

## ⚙️ Configuration

Configuration file: `/etc/config/mac-shaper`

Example:
```sh
config mac-shaper 'general'
    option device 'br-lan'
    option default_bw '200mbit'
    option burst 'auto'
    option cburst 'auto'

config rule
    option mac 'AA:BB:CC:DD:EE:FF'
    option rate '50mbit'
    option enabled '1'
    option comment 'Laptop'
```
Apply changes:
```sh
/etc/init.d/mac-shaper reload
```

---

## 🖥 LuCI Web Interface

LuCI interface is available under:
`Services → MAC Shaper`

<img src="https://github.com/DimaDoesCode/MAC-Shaper/blob/main/LuCI.png" width="614" height="500" align=""/>

Features:
- quick enable / disable of rules
- live status display
- safe testing of limits

---

## 🛠 Supported Targets

| Target | Architecture | Common Devices |
|--------|-------------|----------------|
| ipq806x-generic | ARM Cortex-A15 | Linksys E8350, Netgear R7800, TP-Link C2600 |
| mvebu-cortexa9 | ARM Cortex-A9 | Linksys WRT1900AC/S, WRT3200ACM |

More targets can be added easily via CI. Open an issue to request support for your device!

---

## 🔧 Troubleshooting

### Package installation fails
- Ensure you've disabled signature checking (see Installation Step 2)
- Verify your router's architecture matches the feed URL
- Check that you have enough storage space: `df -h`

### Service doesn't start
```sh
# Check service status
/etc/init.d/mac-shaper status

# View logs
logread | grep mac-shaper

# Check if required kernel modules are loaded
lsmod | grep ifb
lsmod | grep sch_htb
```

### Rules not applying
```sh
# Verify configuration syntax
uci show mac-shaper

# Reload service
/etc/init.d/mac-shaper reload

# Check traffic control rules
tc qdisc show
tc class show dev ifb0
```

---

## 📜 LICENSE

```text
GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2025

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

---

## 🤝 Contributing

Pull requests and issues are welcome! Please feel free to:
- Report bugs
- Request new features
- Submit pull requests
- Request support for additional architectures

---

## 📊 Build Status

Packages are automatically built using GitHub Actions for multiple OpenWrt targets. Check the [Actions tab](https://github.com/DimaDoesCode/MAC-Shaper/actions) for build status.

**Latest Release:** [![GitHub release](https://img.shields.io/github/v/release/DimaDoesCode/MAC-Shaper)](https://github.com/DimaDoesCode/MAC-Shaper/releases/latest)