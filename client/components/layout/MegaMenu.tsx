import { Row, Col } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";

interface MegaMenuProps {
  menuKey: string;
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface MegaMenuSection {
  title: string;
  items: string[];
}

// Structural placeholder data — will be replaced with real data per tenant
const megaMenuData: Record<string, MegaMenuSection[]> = {
  collections: [
    { title: "By Season", items: ["Spring/Summer 2025", "Fall/Winter 2025", "Pre-Fall 2025", "Resort 2025"] },
    { title: "By Category", items: ["Apparel", "Accessories", "Footwear", "Intimates"] },
    { title: "By Status", items: ["Now Shipping", "Open for Order", "Coming Soon", "Archive"] },
    { title: "Featured", items: ["New Arrivals", "Best Sellers", "Exclusive Lines", "Capsule Collections"] },
  ],
  brands: [
    { title: "Fashion", items: ["Brand A", "Brand B", "Brand C", "Brand D"] },
    { title: "Lifestyle", items: ["Brand E", "Brand F", "Brand G", "Brand H"] },
    { title: "Premium", items: ["Brand I", "Brand J", "Brand K", "Brand L"] },
    { title: "Emerging", items: ["Brand M", "Brand N", "Brand O", "Brand P"] },
  ],
};

export default function MegaMenu({ menuKey, visible, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const config = activeBrandConfig;
  const sections = megaMenuData[menuKey];

  if (!visible || !sections) return null;

  return (
    <div
      className="absolute left-0 right-0 bg-white z-30"
      style={{
        borderBottom: `1px solid ${config.borderColor}`,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <Row gutter={[32, 24]}>
          {sections.map((section) => (
            <Col key={section.title} xs={24} sm={12} md={6}>
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: config.secondaryColor }}
              >
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
