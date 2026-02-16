import { Row, Col, Card } from "antd";
import {
  RocketOutlined,
  DollarOutlined,
  AppstoreOutlined,
  GiftOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import HeroBanner from "../components/home/HeroBanner";
import { activeBrandConfig } from "../config/brandConfig";

interface SectionPlaceholderProps {
  label: string;
  icon: React.ReactNode;
  minHeight: number;
}

function SectionPlaceholder({ label, icon, minHeight }: SectionPlaceholderProps) {
  const config = activeBrandConfig;

  return (
    <Card
      style={{
        minHeight,
        borderColor: config.borderColor,
        borderStyle: "dashed",
        borderWidth: 2,
        backgroundColor: config.cardBg,
        borderRadius: 10,
      }}
      styles={{
        body: {
          height: "100%",
          minHeight,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <div
        className="text-2xl mb-3 opacity-20"
        style={{ color: config.primaryColor }}
      >
        {icon}
      </div>
      <span
        className="text-sm font-medium tracking-wide uppercase opacity-40"
        style={{ color: config.primaryColor }}
      >
        {label}
      </span>
    </Card>
  );
}

export default function Index() {
  return (
    <div className="max-w-content mx-auto px-6 py-8">
      <Row gutter={[24, 32]}>
        {/* Hero Banner — Full Width */}
        <Col xs={24}>
          <HeroBanner />
        </Col>

        {/* Quick Actions — 8 cols (2/3 width) */}
        <Col xs={24} lg={16}>
          <SectionPlaceholder
            label="Quick Actions"
            icon={<RocketOutlined />}
            minHeight={200}
          />
        </Col>

        {/* Financial Snapshot — 4 cols (1/3 width) */}
        <Col xs={24} lg={8}>
          <SectionPlaceholder
            label="Financial Snapshot"
            icon={<DollarOutlined />}
            minHeight={200}
          />
        </Col>

        {/* Active Collections — Full Width */}
        <Col xs={24}>
          <SectionPlaceholder
            label="Active Collections"
            icon={<AppstoreOutlined />}
            minHeight={240}
          />
        </Col>

        {/* Promotions — Two Column */}
        <Col xs={24} md={12}>
          <SectionPlaceholder
            label="Promotions"
            icon={<GiftOutlined />}
            minHeight={200}
          />
        </Col>
        <Col xs={24} md={12}>
          <SectionPlaceholder
            label="Promotions"
            icon={<GiftOutlined />}
            minHeight={200}
          />
        </Col>

        {/* Recent Purchase Orders — Full Width */}
        <Col xs={24}>
          <SectionPlaceholder
            label="Recent Purchase Orders"
            icon={<FileTextOutlined />}
            minHeight={240}
          />
        </Col>
      </Row>
    </div>
  );
}
