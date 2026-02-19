import { Row, Col } from "antd";
import HeroCarousel from "../components/home/HeroCarousel";
import UpdatesSection from "../components/home/UpdatesSection";
import AvailableCreditSection from "../components/home/AvailableCreditSection";
import FeaturedBrandsSection from "../components/home/FeaturedBrandsSection";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      <Row gutter={[16, 24]}>
        {/* Hero Banner — Full Width */}
        <Col xs={24}>
          <HeroCarousel />
        </Col>

        {isAuthenticated ? (
          <>
            {/* Updates — 8 cols */}
            <Col xs={24} lg={16}>
              <UpdatesSection />
            </Col>

            {/* Available Credit — 4 cols */}
            <Col xs={24} lg={8} className="py-2 h-auto grow-0">
              <AvailableCreditSection />
            </Col>
          </>
        ) : (
          /* Guest: Updates full width, no credit */
          <Col xs={24}>
            <UpdatesSection />
          </Col>
        )}

        {/* Featured Collection — Full Width */}
        <Col xs={24} className="mt-2">
          <FeaturedBrandsSection />
        </Col>

      </Row>
    </div>
  );
}
