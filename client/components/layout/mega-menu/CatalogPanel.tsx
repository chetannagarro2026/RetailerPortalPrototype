import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../../config/brandConfig";

export default function CatalogPanel() {
  const config = activeBrandConfig;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <p
        className="text-lg font-semibold mb-2"
        style={{ color: config.primaryColor }}
      >
        Explore the Complete Portfolio
      </p>
      <p
        className="text-sm mb-8 max-w-md"
        style={{ color: config.secondaryColor }}
      >
        Browse the full Centric Brands catalog — filter by department, brand,
        season, or availability.
      </p>
      <button
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
        style={{
          backgroundColor: config.primaryColor,
          color: "#fff",
          border: "none",
        }}
      >
        Browse Full Catalog <RightOutlined className="text-[10px]" />
      </button>
    </div>
  );
}
