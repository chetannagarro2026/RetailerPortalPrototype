import { useMemo } from "react";
import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { getAllBrands, type BrandInfo } from "../../data/catalogData";

/** First-letter avatar for brands without logos */
function BrandInitial({ name }: { name: string }) {
  const config = activeBrandConfig;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
      style={{ backgroundColor: config.cardBg, color: config.primaryColor }}
    >
      {initials}
    </div>
  );
}

function BrandCard({ brand }: { brand: BrandInfo }) {
  const config = activeBrandConfig;

  return (
    <Link
      to={`/catalog?brand=${encodeURIComponent(brand.slug)}`}
      className="block no-underline rounded-xl bg-white transition-shadow hover:shadow-md"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="flex flex-col items-center justify-center px-4 py-6" style={{ minHeight: 180 }}>
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} className="h-14 object-contain mb-3" />
        ) : (
          <div className="mb-3">
            <BrandInitial name={brand.name} />
          </div>
        )}
        <span
          className="text-sm font-semibold text-center"
          style={{ color: config.primaryColor }}
        >
          {brand.name}
        </span>
        <span
          className="text-[11px] mt-1"
          style={{ color: config.secondaryColor }}
        >
          View Collection
        </span>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            {brand.skuCount.toLocaleString()} SKUs
          </span>
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            {brand.categoryCount} {brand.categoryCount === 1 ? "category" : "categories"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedBrandsSection() {
  const config = activeBrandConfig;
  const brands = useMemo(() => getAllBrands(), []);

  if (brands.length === 0) {
    return (
      <div
        className="rounded-xl flex items-center justify-center"
        style={{ border: `1px dashed ${config.borderColor}`, minHeight: 160, backgroundColor: config.cardBg }}
      >
        <span className="text-sm" style={{ color: config.secondaryColor }}>
          No brands available at this time.
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: config.secondaryColor }}
          >
            Browse by Brand
          </p>
          <h2 className="text-lg font-semibold" style={{ color: config.primaryColor }}>
            Featured Brands
          </h2>
        </div>
        <Link
          to="/catalog"
          className="flex items-center gap-1.5 text-xs font-medium no-underline"
          style={{ color: config.secondaryColor }}
        >
          View All <RightOutlined className="text-[9px]" />
        </Link>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {brands.map((brand) => (
          <BrandCard key={brand.slug} brand={brand} />
        ))}
      </div>
    </div>
  );
}
