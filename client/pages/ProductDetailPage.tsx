import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { getProductById } from "../data/catalogData";
import { useOrder } from "../context/OrderContext";
import ProductGallery from "../components/catalog/ProductGallery";
import VariantMatrix from "../components/catalog/VariantMatrix";
import PDPHeader from "../components/pdp/PDPHeader";
import PDPSubtotal from "../components/pdp/PDPSubtotal";
import PDPSpecifications from "../components/pdp/PDPSpecifications";

export default function ProductDetailPage() {
  const config = activeBrandConfig;
  const { productId } = useParams<{ productId: string }>();
  const { addItems } = useOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const product = productId ? getProductById(decodeURIComponent(productId)) : null;

  const handleQuantityChange = (variantId: string, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[variantId];
      else next[variantId] = qty;
      return next;
    });
  };

  const { totalUnits, totalValue, filledCount } = useMemo(() => {
    if (!product?.variants) return { totalUnits: 0, totalValue: 0, filledCount: 0 };
    let units = 0;
    let value = 0;
    let count = 0;
    for (const [vid, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
      const variant = product.variants.find((v) => v.id === vid);
      if (!variant) continue;
      units += qty;
      value += qty * variant.price;
      count++;
    }
    return { totalUnits: units, totalValue: value, filledCount: count };
  }, [quantities, product?.variants]);

  const handleAddAll = () => {
    if (!product?.variants || filledCount === 0) return;
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([vid, qty]) => {
        const variant = product.variants!.find((v) => v.id === vid)!;
        return {
          id: variant.id,
          productId: product.id,
          productName: product.name,
          sku: variant.sku,
          variantAttributes: variant.attributes,
          quantity: qty,
          unitPrice: variant.price,
          imageUrl: product.imageUrl,
        };
      });
    addItems(items);
    setQuantities({});
  };

  if (!product) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Product Not Found
        </h1>
        <p className="text-sm mb-4" style={{ color: config.secondaryColor }}>
          The product you are looking for does not exist.
        </p>
        <Link
          to="/catalog"
          className="text-sm font-medium no-underline"
          style={{ color: config.primaryColor }}
        >
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const hasVariants = config.enableMatrixOnPDP && product.variantAttributes && product.variantAttributes.length > 0;
  const galleryImages = product.galleryImages || [product.imageUrl];

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      {/* Breadcrumb-style back link */}
      <Link
        to="/catalog"
        className="text-xs no-underline mb-4 block"
        style={{ color: config.secondaryColor }}
      >
        &larr; Back to Catalog
      </Link>

      {/* Top Section: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProductGallery images={galleryImages} alt={product.name} />
        <PDPHeader product={product} />
      </div>

      {/* Variant Matrix */}
      {hasVariants && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
            Select Variants & Quantities
          </h2>
          <VariantMatrix
            product={product}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
          />
        </div>
      )}

      {/* Subtotal + Add All */}
      {hasVariants && (
        <PDPSubtotal
          totalUnits={totalUnits}
          totalValue={totalValue}
          filledCount={filledCount}
          onAddAll={handleAddAll}
          product={product}
        />
      )}

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <PDPSpecifications specifications={product.specifications} />
      )}
    </div>
  );
}
