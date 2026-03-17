import { useMemo } from "react";
import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { activeBrandConfig } from "../../config/brandConfig";
import { apiConfig } from "../../config/apiConfig";
import { fetchCategoriesByParentCode, type CategoryItem } from "../../services/categoryService";

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

interface Brand {
  id: string;
  name: string;
  code: string;
  imageUrl: string | null;
  labels: Record<string, string>;
  productIds: string[];
}

function BrandCard({ brand }: { brand: Brand }) {
  const config = activeBrandConfig;
  const imageBaseUrl = apiConfig.imageBase;
  const displayName = brand.labels?.en || brand.name;
  const productCount = brand.productIds?.length || 0;

  return (
    <Link
      to={`/catalog?brand=${encodeURIComponent(brand.id)}`}
      className="block no-underline rounded-xl bg-white transition-shadow hover:shadow-md"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="flex flex-col items-center justify-center px-4 py-6" style={{ minHeight:280 }}>
        {brand.imageUrl ? (
          <img 
            src={`${imageBaseUrl}${brand.imageUrl}`} 
            alt={displayName} 
            className="object-contain mb-3 rounded-lg" 
            style={{ height: "100%" }}
          />
        ) : (
          <div className="mb-3">
            <BrandInitial name={displayName} />
          </div>
        )}
        <span
          className="text-sm font-semibold text-center"
          style={{ color: config.primaryColor }}
        >
          {displayName}
        </span>
        <span
          className="text-[11px] mt-1"
          style={{ color: config.secondaryColor }}
        >
          View Collection
        </span>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            {productCount.toLocaleString()} {productCount === 1 ? "product" : "products"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedBrandsSection() {
  const config = activeBrandConfig;
  
  // Fetch brands from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ["brands", apiConfig.brandsCatalogCode],
    queryFn: () => fetchCategoriesByParentCode(apiConfig.brandsCatalogCode),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const brands: Brand[] = useMemo(() => {
    if (!apiData) return [];
    // Filter active brands and map to Brand interface
    return apiData
      .filter((item) => item.isActive !== false && item.isDeleted !== true)
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        imageUrl: item.imageUrl,
        labels: item.labels || {},
        productIds: item.productIds || [],
      }));
  }, [apiData]);

  if (isLoading) {
    return (
      <div
        className="rounded-xl flex items-center justify-center"
        style={{ border: `1px solid ${config.borderColor}`, minHeight: 160, backgroundColor: config.cardBg }}
      >
        <span className="text-sm" style={{ color: config.secondaryColor }}>
          Loading featured categories...
        </span>
      </div>
    );
  }

  if (error) {
    console.error("Failed to fetch brands:", error);
    return (
      <div
        className="rounded-xl flex items-center justify-center"
        style={{ border: `1px dashed ${config.borderColor}`, minHeight: 160, backgroundColor: config.cardBg }}
      >
        <span className="text-sm" style={{ color: config.secondaryColor }}>
          Unable to load featured categories at this time.
        </span>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div
        className="rounded-xl flex items-center justify-center"
        style={{ border: `1px dashed ${config.borderColor}`, minHeight: 160, backgroundColor: config.cardBg }}
      >
        <span className="text-sm" style={{ color: config.secondaryColor }}>
          No featured categories available at this time.
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
            Browse by Categories
          </p>
          <h2 className="text-lg font-semibold" style={{ color: config.primaryColor }}>
            Featured Categories
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

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <BrandCard key={brand.slug} brand={brand} />
        ))}
      </div>
    </div>
  );
}
