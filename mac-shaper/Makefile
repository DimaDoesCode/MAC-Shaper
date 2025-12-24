include $(TOPDIR)/rules.mk

PKG_NAME:=mac-shaper
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/mac-shaper
	SECTION:=net
	CATEGORY:=Network
	TITLE:=MAC Shaper
	DEPENDS:=+tc +kmod-ifb
endef

define Package/mac-shaper/description
	Simple per-MAC bandwidth shaping using tc + ifb
endef

define Package/mac-shaper/conffiles
/etc/config/mac-shaper
endef

define Build/Compile
endef

define Package/mac-shaper/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/usr/bin/mac-shaper $(1)/usr/bin/mac-shaper

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/mac-shaper $(1)/etc/init.d/mac-shaper

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/etc/config/mac-shaper $(1)/etc/config/mac-shaper
endef

#define Package/mac-shaper/prerm
##!/bin/sh
#if [ -x "/etc/init.d/mac-shaper" ]; then
#	/etc/init.d/mac-shaper stop
#	/etc/init.d/mac-shaper disable
#fi
#exit 0
#endef

$(eval $(call BuildPackage,mac-shaper))
