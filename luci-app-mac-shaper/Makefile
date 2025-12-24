include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-mac-shaper
PKG_LICENSE:=GPL-3.0-or-later
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for mac-shaper
LUCI_URL:=https://github.com/DimaDoesCode/MAC-Shaper/tree/main/luci-app-mac-shaper/
LUCI_DESCRIPTION:=Provides Web UI for mac-shaper service.
LUCI_DEPENDS:=+luci-base +mac-shaper
LUCI_PKGARCH:=all

define Package/$(PKG_NAME)/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	[ -f /usr/libexec/rpcd/luci.mac-shaper ] && chmod +x /usr/libexec/rpcd/luci.mac-shaper
	/etc/init.d/rpcd restart
fi
exit 0
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature