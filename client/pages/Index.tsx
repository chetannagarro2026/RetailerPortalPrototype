import { Row, Col } from "antd";
import HeroBanner from "../components/home/HeroBanner";
import UpdatesSection from "../components/home/UpdatesSection";
import AvailableCreditSection from "../components/home/AvailableCreditSection";
import FeaturedBrandsSection from "../components/home/FeaturedBrandsSection";

export default function Index() {
  return (
    <div className="max-w-content mx-auto px-6 py-8">
      <Row gutter={[16, 24]}>
        {/* Hero Banner — Full Width */}
        <Col xs={24}>
          <HeroBanner />
        </Col>

        {/* Updates — 8 cols */}
        <Col xs={24} lg={16}>
          <UpdatesSection />
        </Col>

        {/* Available Credit — 4 cols */}
        <Col xs={24} lg={8} className="py-2 h-auto grow-0">
          <AvailableCreditSection />
        </Col>

        {/* Featured Collection — Full Width */}
        <Col xs={24} className="mt-2">
          <FeaturedBrandsSection />
        </Col>

      </Row>
    </div>
  );
}
