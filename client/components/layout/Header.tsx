import { Input, Badge, Dropdown, Avatar } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";

const profileMenuItems: MenuProps["items"] = [
  { key: "profile", label: "My Profile", icon: <UserOutlined /> },
  { key: "settings", label: "Settings", icon: <SettingOutlined /> },
  { type: "divider" },
  { key: "logout", label: "Sign Out", icon: <LogoutOutlined /> },
];

export default function Header() {
  const config = activeBrandConfig;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      style={{
        height: "var(--header-height)",
        borderBottom: `1px solid ${config.borderColor}`,
      }}
    >
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 lg:px-8">
        {/* Left — Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.brandName}
              className="h-8 w-auto"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: config.primaryColor }}
              >
                {config.brandName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <span
                  className="text-base font-semibold tracking-tight"
                  style={{ color: config.primaryColor }}
                >
                  {config.brandName}
                </span>
                <span className="text-xs text-gray-400 ml-2 font-normal tracking-wide uppercase">
                  {config.portalTitle}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center — Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Input
            placeholder={config.searchPlaceholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            size="middle"
            className="rounded-lg"
            style={{
              backgroundColor: "#F8F9FA",
              borderColor: "transparent",
            }}
          />
        </div>

        {/* Right — User Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Mobile search icon */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <SearchOutlined className="text-lg" />
          </button>

          <span
            className="hidden lg:block text-sm font-medium"
            style={{ color: config.secondaryColor }}
          >
            {config.partnerName}
          </span>

          <Badge dot size="small" offset={[-2, 2]}>
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
              <BellOutlined className="text-lg" />
            </button>
          </Badge>

          <Dropdown
            menu={{ items: profileMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Avatar
                size={32}
                style={{
                  backgroundColor: config.primaryColor,
                  fontSize: 13,
                }}
                icon={<UserOutlined />}
              />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
