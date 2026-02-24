import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { getProductById } from "../data/catalogData";
import { GalleryMainImage, GalleryThumbnails } from "../components/catalog/ProductGallery";
import PDPHeader from "../components/pdp/PDPHeader";
import { fetchProductByUpc, transformProductResponse } from "../services/productService";
import { useOrder } from "../context/OrderContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

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
        Product Attributes ({specifications.length})
      </h2>
      <div 
        className="divide-y overflow-y-auto" 
        style={{ 
          borderColor: config.borderColor,
          maxHeight: "400px"
        }}
      >
        {specifications.map((spec, index) => (
          <div 
            key={`${spec.label}-${index}`} 
            className="flex items-start py-2.5 text-xs gap-3" 
            style={{ borderColor: config.borderColor }}
          >
            <span className="w-40 shrink-0 font-medium" style={{ color: config.secondaryColor }}>
              {spec.label}
            </span>
            <span className="flex-1 break-words" style={{ color: config.primaryColor }}>
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Product Top Section (Gallery + Info + Specs + Thumbnails) ────────

function ProductTopSection({
  product,
  galleryImages,
  quantity,
  onQuantityChange,
  onAddToCart,
}: {
  product: ReturnType<typeof getProductById> & {};
  galleryImages: string[];
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}) {
  const config = activeBrandConfig;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Left: Main Image */}
      <GalleryMainImage images={galleryImages} alt={product.name} activeIndex={activeIndex} />

      {/* Right: Info + Specs + Add to Cart + Thumbnails */}
      <div>
        <PDPHeader product={product} />

        {/* Add to Cart Section */}
        <div className="mb-6">
          <div className="flex gap-3 items-start">
            <div className="flex-1 max-w-[120px]">
              <label 
                className="text-xs font-medium mb-1.5 block" 
                style={{ color: config.secondaryColor }}
              >
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="h-11 text-center"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium mb-1.5 block opacity-0">Action</label>
              <Button
                onClick={onAddToCart}
                className="w-full h-11 font-semibold"
                style={{
                  backgroundColor: config.primaryColor,
                  color: "#fff",
                }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

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

// ── Main Page Component ─────────────────────────────────────────────

export default function ProductDetailPage() {
  const config = activeBrandConfig;
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useOrder();
  
  // API product state
  const [apiProduct, setApiProduct] = useState<ReturnType<typeof transformProductResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Fallback to local data
  const localProduct = productId ? getProductById(decodeURIComponent(productId)) : null;

  // Fetch product by UPC when productId changes
  useEffect(() => {
    if (!productId) return;

    const upcId = decodeURIComponent(productId);

    
    // Try to fetch from API using UPC
    setIsLoading(true);
    setApiError(null);
    
    fetchProductByUpc(upcId)
      .then((response) => {
        const transformed = transformProductResponse(response);
        setApiProduct(transformed);
      })
      .catch((err) => {
        console.warn("API fetch failed, falling back to local data:", err);
        setApiError(err.message);
        setApiProduct(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  // Use API product if available, otherwise fallback to local
  const product = apiProduct ? {
    ...localProduct,
    id: apiProduct.id,
    name: apiProduct.name,
    upc: apiProduct.upcId,
    imageUrl: apiProduct.imageUrl,
    galleryImages: apiProduct.galleryImages,
    description: apiProduct.description,
    brand: apiProduct.brand,
    specifications: apiProduct.specifications,
    price: 0, // Price not in this API response
  } : localProduct;

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      productId: product.id,
      productName: product.name,
      upc: product.upc,
      variantAttributes: {},
      quantity: quantity,
      unitPrice: product.price || 0,
      imageUrl: product.imageUrl,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: config.secondaryColor }}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

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

  const galleryImages = product.galleryImages || [product.imageUrl];

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <Link to="/catalog" className="text-xs no-underline mb-4 block" style={{ color: config.secondaryColor }}>
        &larr; Back to Catalog
      </Link>

      {/* Top Section: Gallery + Product Info + Add to Cart + Specifications + Thumbnails */}
      <ProductTopSection 
        product={product} 
        galleryImages={galleryImages}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
