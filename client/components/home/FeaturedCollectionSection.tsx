import { Row, Col } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import ProductCard, { type Product } from "./cards/ProductCard";

// Mock data — would come from API / admin-defined featured collection
const featuredProducts: Product[] = [
  {
    id: "1",
    brandName: "Calvin Klein Kids",
    productName: "Quilted Puffer Jacket with Detachable Hood",
    itemCode: "CKK-FT26-101",
    wholesalePrice: 85.0,
    imageUrl: "https://images.pexels.com/photos/4260394/pexels-photo-4260394.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "New",
  },
  {
    id: "2",
    brandName: "IZOD",
    productName: "Classic Fit Performance Polo Shirt",
    itemCode: "IZD-FT26-204",
    wholesalePrice: 32.5,
    imageUrl: "https://images.pexels.com/photos/10952730/pexels-photo-10952730.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "Bestseller",
  },
  {
    id: "3",
    brandName: "Buffalo David Bitton",
    productName: "Slim Straight Stretch Denim Jean",
    itemCode: "BDB-FT26-312",
    wholesalePrice: 48.0,
    imageUrl: "https://images.pexels.com/photos/7764611/pexels-photo-7764611.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "4",
    brandName: "Calvin Klein",
    productName: "Wool Blend Structured Overcoat",
    itemCode: "CK-FT26-088",
    wholesalePrice: 145.0,
    imageUrl: "https://images.pexels.com/photos/19354617/pexels-photo-19354617.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "Limited",
  },
  {
    id: "5",
    brandName: "Tommy Hilfiger",
    productName: "Cable Knit Crewneck Sweater",
    itemCode: "TH-FT26-157",
    wholesalePrice: 62.0,
    imageUrl: "https://images.pexels.com/photos/15615051/pexels-photo-15615051.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "New",
  },
  {
    id: "6",
    brandName: "Jessica Simpson",
    productName: "Floral Print Midi Wrap Dress",
    itemCode: "JS-FT26-411",
    wholesalePrice: 54.0,
    imageUrl: "https://images.pexels.com/photos/27992044/pexels-photo-27992044.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "7",
    brandName: "Frye",
    productName: "Heritage Lace-Up Leather Boot",
    itemCode: "FRY-FT26-078",
    wholesalePrice: 128.0,
    imageUrl: "https://images.pexels.com/photos/30229957/pexels-photo-30229957.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "Bestseller",
  },
  {
    id: "8",
    brandName: "Hervé Léger",
    productName: "Bandage Bodycon Knit Top",
    itemCode: "HL-FT26-519",
    wholesalePrice: 96.0,
    imageUrl: "https://images.pexels.com/photos/7256158/pexels-photo-7256158.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const collectionLabel = "Fall 2026";

export default function FeaturedCollectionSection() {
  const config = activeBrandConfig;
  const products = featuredProducts.slice(0, 8);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: config.secondaryColor }}
          >
            Collection: {collectionLabel}
          </p>
          <h2 className="text-lg font-semibold" style={{ color: config.primaryColor }}>
            Featured Collection
          </h2>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer pb-0.5"
          style={{ color: config.secondaryColor }}
        >
          View Collection <RightOutlined className="text-[9px]" />
        </button>
      </div>

      {/* Product Grid or Empty State */}
      {products.length === 0 ? (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            border: `1px dashed ${config.borderColor}`,
            minHeight: 160,
            backgroundColor: config.cardBg,
          }}
        >
          <span className="text-sm" style={{ color: config.secondaryColor }}>
            No featured collection available at this time.
          </span>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {products.map((product) => (
            <Col xs={24} sm={12} lg={6} key={product.id}>
              <ProductCard data={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
