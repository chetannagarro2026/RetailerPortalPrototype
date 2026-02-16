import { activeBrandConfig } from "../../../config/brandConfig";

export interface Product {
  id: string;
  brandName: string;
  productName: string;
  itemCode: string;
  wholesalePrice: number;
  imageUrl: string;
  badge?: "New" | "Bestseller" | "Limited";
}

const badgeColors: Record<string, { bg: string; text: string }> = {
  New: { bg: "#EEF2FF", text: "#4338CA" },
  Bestseller: { bg: "#F0FDF4", text: "#166534" },
  Limited: { bg: "#FFF7ED", text: "#9A3412" },
};

export default function ProductCard({ data }: { data: Product }) {
  const config = activeBrandConfig;
  const badge = data.badge ? badgeColors[data.badge] : null;

  return (
    <div
      className="group rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-md cursor-pointer"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
        <img
          src={data.imageUrl}
          alt={data.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {data.badge && badge && (
          <span
            className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {data.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: config.secondaryColor }}
        >
          {data.brandName}
        </p>
        <p
          className="text-sm font-medium leading-snug mb-1 line-clamp-2"
          style={{ color: config.primaryColor }}
        >
          {data.productName}
        </p>
        <p className="text-xs mb-3" style={{ color: config.secondaryColor }}>
          {data.itemCode}
        </p>
        <p className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>
          ${data.wholesalePrice.toFixed(2)}
        </p>

        <button
          className="text-xs font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
          style={{
            border: `1px solid ${config.borderColor}`,
            color: config.primaryColor,
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = config.cardBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
