import {
  UserOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { accountInfo } from "../../data/dashboardData";

export default function AccountInfo() {
  const config = activeBrandConfig;
  const info = accountInfo;

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Title + Edit */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-lg" style={{ color: config.primaryColor }} />
            <h2 className="text-sm font-semibold m-0 uppercase tracking-wider" style={{ color: config.primaryColor }}>
              Account Information
            </h2>
          </div>
          <Link
            to="/account/settings"
            className="flex items-center gap-1.5 text-xs font-medium no-underline px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: config.primaryColor,
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.cardBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
          >
            <EditOutlined className="text-[11px]" />
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <InfoField
            icon={<IdcardOutlined />}
            label="Business Name"
            value={info.businessName}
            config={config}
          />
          <InfoField
            icon={<EnvironmentOutlined />}
            label="Billing Address"
            value={info.billingAddress}
            config={config}
          />
          <InfoField
            icon={<IdcardOutlined />}
            label="Tax ID"
            value={info.taxId}
            config={config}
          />
          <InfoField
            icon={<MailOutlined />}
            label="Contact Email"
            value={info.contactEmail}
            config={config}
          />
          <InfoField
            icon={<PhoneOutlined />}
            label="Phone"
            value={info.contactPhone}
            config={config}
          />
          <InfoField
            icon={<TeamOutlined />}
            label="Account Representative"
            value={info.accountRep}
            config={config}
          />
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
  config,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  config: typeof activeBrandConfig;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs" style={{ color: config.secondaryColor }}>{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          {label}
        </span>
      </div>
      <p className="text-sm font-medium m-0" style={{ color: config.primaryColor }}>
        {value}
      </p>
    </div>
  );
}
