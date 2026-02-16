import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";

export default function PlaceholderPage() {
  const location = useLocation();
  const config = activeBrandConfig;

  // Derive page title from the pathname
  const pageTitle = location.pathname
    .replace("/", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <div
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-24"
        style={{ borderColor: config.borderColor }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold mb-6"
          style={{ backgroundColor: config.primaryColor, opacity: 0.15 }}
        />
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: config.primaryColor }}
        >
          {pageTitle || "Page"}
        </h1>
        <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
          This section is under development. Continue prompting to fill in the
          content for this page.
        </p>
        <Link to="/">
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            size="middle"
          >
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
