import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { getProductById } from "../data/catalogData";
import { GalleryMainImage, GalleryThumbnails } from "../components/catalog/ProductGallery";
import PDPHeader from "../components/pdp/PDPHeader";
import SkuFilterPanel, {
  type SkuFilters,
  applySkuFilters,
} from "../components/product-family/SkuFilterPanel";
import SkuGroupedTables from "../components/product-family/SkuGroupedTables";

export default function ProductDetailPage() {
  const config = activeBrandConfig;
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getProductById(decodeURIComponent(productId)) : null;

  // SKU filter state
  const [activeFilters, setActiveFilters] = useState<SkuFilters>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allVariants = product?.variants || [];
  const variantAttributes = product?.variantAttributes || [];

  const filteredVariants = useMemo(
    () => applySkuFilters(allVariants, activeFilters),
    [allVariants, activeFilters],
  );

  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [key]: values }));
    setExpandedId(null);
  }, []);

  const handleRemoveFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => {
      const values = (prev[key] || []).filter((v) => v !== value);
      const next = { ...prev };
      if (values.length === 0) delete next[key];
      else next[key] = values;
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setActiveFilters({});
    setExpandedId(null);
  }, []);

  if (!product) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Product Not Found
        </h1>
        <p className="text-sm mb-4" style={{ color: config.secondaryColor }}>
          The product you are looking for does not exist.
        </p>
        <Link to="/catalog" className="text-sm font-medium no-underline" style={{ color: config.primaryColor }}>
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const hasVariants = variantAttributes.length > 0 && allVariants.length > 0;
  const galleryImages = product.galleryImages || [product.imageUrl];

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <Link to="/catalog" className="text-xs no-underline mb-4 block" style={{ color: config.secondaryColor }}>
        &larr; Back to Catalog
      </Link>

      {/* Top Section: Gallery + Product Family Info + Specifications + Thumbnails */}
      <ProductTopSection product={product} galleryImages={galleryImages} />

      {/* SKU Tables Section */}
      {hasVariants && (
        <div>
          <div
            className="mb-6 pb-2"
            style={{ borderBottom: `2px solid ${config.borderColor}` }}
          >
            <h2 className="text-base font-semibold" style={{ color: config.primaryColor }}>
              Available SKUs
            </h2>
          </div>

          <div className="flex gap-6">
            {/* Left: Filter Panel (sticky) */}
            <aside
              className="shrink-0 sticky self-start overflow-y-auto pr-4"
              style={{
                width: 220,
                top: "calc(var(--header-height) + var(--nav-height) + 24px)",
                maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
                borderRight: `1px solid ${config.borderColor}`,
              }}
            >
              <SkuFilterPanel
                variants={allVariants}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </aside>

            {/* Right: Grouped SKU Tables */}
            <div className="flex-1 min-w-0">
              <SkuGroupedTables
                product={product}
                variants={filteredVariants}
                variantAttributes={variantAttributes}
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAll}
                expandedId={expandedId}
                onToggleExpand={setExpandedId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Product Top Section (Gallery + Info + Specs + Thumbnails) ────────

function ProductTopSection({
  product,
  galleryImages,
}: {
  product: ReturnType<typeof getProductById> & {};
  galleryImages: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Left: Main Image */}
      <GalleryMainImage images={galleryImages} alt={product.name} activeIndex={activeIndex} />

      {/* Right: Info + Specs + Thumbnails */}
      <div>
        <PDPHeader product={product} />
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-6">
            <SpecificationsSection specifications={product.specifications} />
          </div>
        )}
        <div className="mt-4">
          <GalleryThumbnails
            images={galleryImages}
            alt={product.name}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      </div>
    </div>
  );
}

// ── Specifications ──────────────────────────────────────────────────

function SpecificationsSection({
  specifications,
}: {
  specifications: Array<{ label: string; value: string }>;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h2 className="text-sm font-semibold mb-3" style={{ color: config.primaryColor }}>
        Specifications
      </h2>
      <div className="divide-y" style={{ borderColor: config.borderColor }}>
        {specifications.map((spec) => (
          <div key={spec.label} className="flex items-center py-2.5 text-xs" style={{ borderColor: config.borderColor }}>
            <span className="w-36 shrink-0 font-medium" style={{ color: config.secondaryColor }}>
              {spec.label}
            </span>
            <span style={{ color: config.primaryColor }}>{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
