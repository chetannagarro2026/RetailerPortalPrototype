import { Row, Col } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import ProductCard, { type Product } from "./cards/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProducts, fetchBestPrices, PriceRequestItem } from "../../services/productService";
import { ProductApiItem } from "@shared/api";

const collectionLabel = "Featured Products";

/**
 * Map API product item to Product interface
 */
function mapApiProductToProduct(item: ProductApiItem): Product {
  return {
    id: item.id,
    brandName: item.familyLabels?.en || "Unknown",
    productName: item.labels?.en || "Unnamed Product",
    itemCode: item.upcId,
    wholesalePrice: 0, // Not provided in API response
    imageUrl: item.imageIconPath
      ? `https://ndomsdevstorageacc.blob.core.windows.net${item.imageIconPath}`
      : "https://via.placeholder.com/300x400?text=No+Image",
  };
}

export default function FeaturedCollectionSection() {
  const config = activeBrandConfig;

  // Fetch products from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => fetchFeaturedProducts(0, 8),
    retry: 2,
  });

  const products: Product[] = data?.content
    ? data.content.map(mapApiProductToProduct)
    : [];

  // Fetch prices for the products we just retrieved
  const upcs = products.map((p) => p.itemCode).filter(Boolean);

  const priceQuery = useQuery({
    queryKey: ["bestPrices", upcs],
    queryFn: () => {
      const payload: PriceRequestItem[] = upcs.map((u) => ({
        upc: u,
        channelCode: "QVC_TEST_ONE",
        accoundId: "9002",
      }));

      return fetchBestPrices(payload);
    },
    enabled: upcs.length > 0,
    retry: 1,
  });

  const priceMap = priceQuery.data?.productPrice ?? {};

  // Apply prices to products
  const productsWithPrices = products.map((p) => {
    const price = priceMap[p.itemCode];
    return {
      ...p,
      wholesalePrice: price ? Number(price.basePrice) : p.wholesalePrice,
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: config.secondaryColor }}
          >
            Featured Products
          </p>
          <h2 className="text-lg font-semibold" style={{ color: config.primaryColor }}>
            {collectionLabel}
          </h2>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer pb-0.5"
          style={{ color: config.secondaryColor }}
        >
          View All <RightOutlined className="text-[9px]" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            border: `1px dashed ${config.borderColor}`,
            minHeight: 160,
            backgroundColor: config.cardBg,
          }}
        >
          <span className="text-sm" style={{ color: config.secondaryColor }}>
            Loading products...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            border: `1px dashed ${config.borderColor}`,
            minHeight: 160,
            backgroundColor: config.cardBg,
          }}
        >
          <span className="text-sm" style={{ color: "#dc2626" }}>
            Failed to load products. Please try again later.
          </span>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {!isLoading && !error && productsWithPrices.length === 0 && (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            border: `1px dashed ${config.borderColor}`,
            minHeight: 160,
            backgroundColor: config.cardBg,
          }}
        >
          <span className="text-sm" style={{ color: config.secondaryColor }}>
            No products available at this time.
          </span>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && productsWithPrices.length > 0 && (
        <Row gutter={[24, 24]}>
          {productsWithPrices.map((product) => (
            <Col xs={24} sm={12} lg={6} key={product.id}>
              <ProductCard data={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
