import { Drawer, Menu } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const config = activeBrandConfig;
  const location = useLocation();

  const menuItems: MenuProps["items"] = config.navItems.map((item) => {
    if (item.hasMegaMenu) {
      return {
        key: item.key,
        label: item.label,
        children: [
          {
            key: `${item.key}-view-all`,
            label: (
              <Link to={item.path} onClick={onClose}>
                View All {item.label}
              </Link>
            ),
          },
          {
            key: `${item.key}-placeholder`,
            label: (
              <span className="text-xs text-gray-400 italic">
                More categories coming soon
              </span>
            ),
            disabled: true,
          },
        ],
      };
    }
    return {
      key: item.key,
      label: (
        <Link to={item.path} onClick={onClose}>
          {item.label}
        </Link>
      ),
    };
  });

  const activeKey = config.navItems.find(
    (item) => item.path === location.pathname
  )?.key;

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={onClose}
      width={280}
      styles={{
        header: {
          borderBottom: `1px solid ${config.borderColor}`,
        },
        body: {
          padding: 0,
        },
      }}
      title={
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.brandName.charAt(0)}
          </div>
          <span
            className="text-sm font-semibold"
            style={{ color: config.primaryColor }}
          >
            {config.brandName}
          </span>
        </div>
      }
    >
      <Menu
        mode="inline"
        selectedKeys={activeKey ? [activeKey] : ["home"]}
        items={menuItems}
        style={{ border: "none" }}
      />
    </Drawer>
  );
}
