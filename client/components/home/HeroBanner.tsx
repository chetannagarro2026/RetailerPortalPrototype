import { Button } from "antd";
import { ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

const HERO_IMAGE =
  "https://cdn.builder.io/api/v1/image/assets%2F0f4e56209ef24b2d922b97ec1205a84f%2Febd550cc0540439c8208cc9560cfb7fe";

export default function HeroBanner() {
  const config = activeBrandConfig;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 280, borderRadius: 10 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundPosition: "center 2%" }}
      />

      {/* Gradient Overlay — left-heavy for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(27, 42, 74, 0.88) 0%, rgba(27, 42, 74, 0.72) 45%, rgba(27, 42, 74, 0.25) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative h-full w-full flex items-center justify-start self-center" style={{ padding: "0 48px" }}>
        <div style={{ maxWidth: "58%" }}>
          {/* Eyebrow */}
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              letterSpacing: "0.2em",
            }}
          >
            Fall 2026 Collection
          </span>

          {/* Headline */}
          <h1
            className="text-2xl lg:text-3xl font-semibold leading-tight mb-3"
            style={{
              color: "#FFFFFF",
              fontFamily: config.fontFamily,
            }}
          >
            Elevated Essentials for the
            <br />
            Upcoming Season
          </h1>

          {/* Subtext */}
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: "rgba(255, 255, 255, 0.75)", maxWidth: 460 }}
          >
            Explore newly launched styles across Calvin Klein Kids, IZOD, and
            performance categories — now available for seasonal booking.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              size="middle"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              style={{
                backgroundColor: "#FFFFFF",
                color: config.primaryColor,
                border: "none",
                fontWeight: 600,
                height: 38,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 8,
              }}
            >
              Explore Fall 2026
            </Button>

            <Button
              type="text"
              size="middle"
              icon={<DownloadOutlined />}
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 500,
                height: 38,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            >
              Download Lookbook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
