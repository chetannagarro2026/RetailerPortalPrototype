import { activeBrandConfig } from "../../../config/brandConfig";

interface PurchasedProduct {
  itemCode: string;
  name: string;
  lastQty: number;
  imageUrl: string;
}

const recentlyOrdered: PurchasedProduct[] = [
  { itemCode: "CKK-FT26-101", name: "Quilted Puffer Jacket", lastQty: 120, imageUrl: "https://images.pexels.com/photos/4260394/pexels-photo-4260394.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "IZD-FT26-204", name: "Performance Polo Shirt", lastQty: 200, imageUrl: "https://images.pexels.com/photos/10952730/pexels-photo-10952730.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "BDB-FT26-312", name: "Slim Straight Denim", lastQty: 150, imageUrl: "https://images.pexels.com/photos/7764611/pexels-photo-7764611.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "TH-FT26-157", name: "Cable Knit Sweater", lastQty: 80, imageUrl: "https://images.pexels.com/photos/15615051/pexels-photo-15615051.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "JS-FT26-411", name: "Floral Midi Wrap Dress", lastQty: 95, imageUrl: "https://images.pexels.com/photos/27992044/pexels-photo-27992044.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "FRY-FT26-078", name: "Heritage Leather Boot", lastQty: 60, imageUrl: "https://images.pexels.com/photos/30229957/pexels-photo-30229957.jpeg?auto=compress&cs=tinysrgb&w=100" },
];

const frequentlyPurchased: PurchasedProduct[] = [
  { itemCode: "IZD-SS25-110", name: "Classic Fit Oxford Shirt", lastQty: 450, imageUrl: "https://images.pexels.com/photos/10952730/pexels-photo-10952730.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "CK-FW25-088", name: "Wool Blend Overcoat", lastQty: 320, imageUrl: "https://images.pexels.com/photos/19354617/pexels-photo-19354617.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "BDB-SS25-220", name: "Stretch Chino Pant", lastQty: 380, imageUrl: "https://images.pexels.com/photos/7764611/pexels-photo-7764611.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "NAU-FT26-055", name: "Windbreaker Jacket", lastQty: 290, imageUrl: "https://images.pexels.com/photos/4260394/pexels-photo-4260394.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "TH-SS25-301", name: "Pique Polo Classic", lastQty: 510, imageUrl: "https://images.pexels.com/photos/15615051/pexels-photo-15615051.jpeg?auto=compress&cs=tinysrgb&w=100" },
  { itemCode: "ARW-FT26-140", name: "Wrinkle-Free Dress Shirt", lastQty: 275, imageUrl: "https://images.pexels.com/photos/27992044/pexels-photo-27992044.jpeg?auto=compress&cs=tinysrgb&w=100" },
];

function ProductRow({ product }: { product: PurchasedProduct }) {
  const config = activeBrandConfig;

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = config.cardBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-10 h-10 rounded object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: config.primaryColor }}
        >
          {product.name}
        </p>
        <p className="text-[10px]" style={{ color: config.secondaryColor }}>
          {product.itemCode} · Qty {product.lastQty}
        </p>
      </div>
      <button
        className="text-[10px] font-medium px-2.5 py-1 rounded cursor-pointer shrink-0 transition-colors"
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
        Reorder
      </button>
    </div>
  );
}

export default function PurchasedPanel() {
  const config = activeBrandConfig;
  const hasData = recentlyOrdered.length > 0 || frequentlyPurchased.length > 0;

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No purchase history available.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Recently Ordered */}
      <div className="mb-6">
        <h4
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: config.secondaryColor }}
        >
          Recently Ordered
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {recentlyOrdered.map((p) => (
            <ProductRow key={p.itemCode} product={p} />
          ))}
        </div>
      </div>

      {/* Frequently Purchased */}
      <div>
        <h4
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: config.secondaryColor }}
        >
          Frequently Purchased
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {frequentlyPurchased.map((p) => (
            <ProductRow key={p.itemCode} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
