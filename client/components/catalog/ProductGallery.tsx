import { useState } from "react";
import { activeBrandConfig } from "../../config/brandConfig";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <GalleryMainImage images={images} alt={alt} activeIndex={activeIndex} />
      <GalleryThumbnails images={images} alt={alt} activeIndex={activeIndex} onSelect={setActiveIndex} />
    </div>
  );
}

// ── Standalone sub-components (used when layout needs them separated) ──

export function GalleryMainImage({
  images,
  alt,
  activeIndex,
}: {
  images: string[];
  alt: string;
  activeIndex: number;
}) {
  const config = activeBrandConfig;
  const mainImage = images[activeIndex] || images[0];

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{ aspectRatio: "16/15", border: `1px solid ${config.borderColor}` }}
    >
      <img src={mainImage} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

export function GalleryThumbnails({
  images,
  alt,
  activeIndex,
  onSelect,
}: {
  images: string[];
  alt: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const config = activeBrandConfig;

  if (images.length <= 1) return null;

  return (
    <div className="flex gap-2">
      {images.map((img, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
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
  );
}
