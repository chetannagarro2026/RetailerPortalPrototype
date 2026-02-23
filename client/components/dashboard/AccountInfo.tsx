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
      className="rounded-lg"
      style={{ border: `1px dashed #E5E7EB` }}
    >
      <div className="px-6 py-5">
        {/* Title + Edit */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-sm" style={{ color: config.secondaryColor }} />
            <h2 className="text-[11px] font-semibold m-0 uppercase tracking-widest" style={{ color: config.secondaryColor }}>
              Account Information
            </h2>
          </div>
          <Link
            to="/account/settings"
            className="flex items-center gap-1.5 text-xs font-medium no-underline px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: config.secondaryColor,
              border: `1px solid #E5E7EB`,
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9FAFB";
              e.currentTarget.style.color = config.primaryColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.color = config.secondaryColor;
            }}
          >
            <EditOutlined className="text-[11px]" />
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <InfoField icon={<IdcardOutlined />} label="Business Name" value={info.businessName} />
          <InfoField icon={<EnvironmentOutlined />} label="Billing Address" value={info.billingAddress} />
          <InfoField icon={<IdcardOutlined />} label="Tax ID" value={info.taxId} />
          <InfoField icon={<MailOutlined />} label="Contact Email" value={info.contactEmail} />
          <InfoField icon={<PhoneOutlined />} label="Phone" value={info.contactPhone} />
          <InfoField icon={<TeamOutlined />} label="Account Rep" value={info.accountRep} />
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
          {label}
        </span>
      </div>
      <p className="text-sm m-0" style={{ color: "#374151" }}>
        {value}
      </p>
    </div>
  );
}
