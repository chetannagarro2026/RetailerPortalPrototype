import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import BrowseCategoriesPanel from "./mega-menu/BrowseCategoriesPanel";

interface MegaMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function MegaMenu({ visible, onClose }: MegaMenuProps) {
  const config = activeBrandConfig;

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute left-0 right-0 z-40 bg-white"
        style={{
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
          borderBottom: `1px solid ${config.borderColor}`,
          maxHeight: 480,
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: "32px" }}
        >
          {/* Header Row */}
          <div
            className="flex items-center justify-between pb-4 mb-5"
            style={{ borderBottom: `1px solid ${config.borderColor}` }}
          >
            <h4
              className="text-sm font-semibold"
              style={{ color: config.primaryColor }}
            >
              Browse Categories
            </h4>
            <Link
              to="/catalog"
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm font-semibold no-underline transition-colors"
              style={{ color: "#1677FF" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#4096FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#1677FF";
              }}
            >
              View Full Catalog <RightOutlined className="text-[9px]" />
            </Link>
          </div>

          {/* Categories Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
            <BrowseCategoriesPanel onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}
