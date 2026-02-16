import type { ThemeConfig } from "antd";
import type { BrandConfig } from "../config/brandConfig";

export function createAntdTheme(config: BrandConfig): ThemeConfig {
  return {
    token: {
      colorPrimary: config.primaryColor,
      colorBgContainer: config.headerBg,
      colorBorder: config.borderColor,
      colorBorderSecondary: config.borderColor,
      borderRadius: 8,
      fontFamily: config.fontFamily,
      colorText: "#1a1a1a",
      colorTextSecondary: config.secondaryColor,
      colorBgLayout: "#ffffff",
    },
    components: {
      Menu: {
        horizontalItemSelectedColor: config.primaryColor,
        horizontalItemHoverColor: config.secondaryColor,
        itemBg: "transparent",
        activeBarBorderWidth: 2,
        itemHoverBg: "transparent",
        itemSelectedBg: "transparent",
        horizontalLineHeight: "54px",
      },
      Input: {
        borderRadius: 8,
        colorBorder: config.borderColor,
        activeBorderColor: config.primaryColor,
        hoverBorderColor: config.secondaryColor,
      },
      Card: {
        borderRadiusLG: 10,
        colorBorderSecondary: config.borderColor,
      },
      Button: {
        borderRadius: 8,
        colorPrimary: config.primaryColor,
      },
      Badge: {
        colorError: "#E5484D",
      },
    },
  };
}
