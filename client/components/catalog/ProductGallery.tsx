import { useState } from "react";
import { activeBrandConfig } from "../../config/brandConfig";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const config = activeBrandConfig;
  const [activeIndex, setActiveIndex] = useState(0);
  const mainImage = images[activeIndex] || images[0];

  return (
    <div>
      {/* Main Image */}
      <div
        className="w-full rounded-xl overflow-hidden mb-3"
        style={{ aspectRatio: "4/5", border: `1px solid ${config.borderColor}` }}
      >
        <img
          src={mainImage}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 transition-all"
              style={{
                border: i === activeIndex
                  ? `2px solid ${config.primaryColor}`
                  : `1px solid ${config.borderColor}`,
                opacity: i === activeIndex ? 1 : 0.6,
              }}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
