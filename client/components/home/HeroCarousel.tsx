import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface Slide {
  id: number;
  tagline: string;
  headline: string;
  supporting: string;
  ctaLabel: string;
  ctaRoute: string;
  backgroundImage: string;
}

const slides: Slide[] = [
  {
    id: 1,
    tagline: "FALL 2026 WHOLESALE BOOKING",
    headline: "Pre-Book Fall 2026 Inventory",
    supporting:
      "Secure high-demand outerwear and seasonal essentials early. Plan assortments, manage allocations, and place bulk orders ahead of peak demand.",
    ctaLabel: "View Fall Outerwear",
    ctaRoute: "/catalog/women/outerwear?season=fall-2026&view=table",
    backgroundImage:
      "https://images.pexels.com/photos/1488470/pexels-photo-1488470.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 2,
    tagline: "REPLENISHMENT MADE EASY",
    headline: "Quick Reorder. Faster Turnaround.",
    supporting:
      "Access your frequently purchased styles, check live stock availability, and reorder in bulk with just a few clicks. Designed for high-volume retail buyers.",
    ctaLabel: "Reorder Best Sellers",
    ctaRoute: "/catalog?purchased=true&availability=in-stock&view=table",
    backgroundImage:
      "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
];

const AUTO_ROTATE_MS = 5500;

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const config = activeBrandConfig;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slides.length) % slides.length);
    },
    [],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [goNext, isPaused]);

  const currentSlide = slides[activeIndex];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: 280, borderRadius: 10 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background slides with fade transition */}
      {slides.map((slide, i) => (
        <SlideBackground
          key={slide.id}
          image={slide.backgroundImage}
          isActive={i === activeIndex}
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to right, rgba(27, 42, 74, 0.90) 0%, rgba(27, 42, 74, 0.74) 45%, rgba(27, 42, 74, 0.28) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-[2] h-full w-full flex items-center justify-start"
        style={{ padding: "0 48px" }}
      >
        <SlideContent
          key={currentSlide.id}
          slide={currentSlide}
          config={config}
          onCtaClick={() => navigate(currentSlide.ctaRoute)}
        />
      </div>

      {/* Arrow buttons */}
      <ArrowButton direction="left" onClick={goPrev} />
      <ArrowButton direction="right" onClick={goNext} />

      {/* Pagination dots */}
      <PaginationDots
        count={slides.length}
        activeIndex={activeIndex}
        onDotClick={goTo}
      />
    </div>
  );
}

/* ─── Sub-components ─── */

function SlideBackground({ image, isActive }: { image: string; isActive: boolean }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
      style={{
        backgroundImage: `url(${image})`,
        opacity: isActive ? 1 : 0,
      }}
    />
  );
}

function SlideContent({
  slide,
  config,
  onCtaClick,
}: {
  slide: Slide;
  config: typeof activeBrandConfig;
  onCtaClick: () => void;
}) {
  return (
    <div style={{ maxWidth: "58%" }}>
      {/* Tagline */}
      <span
        className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
        style={{ color: "rgba(255, 255, 255, 0.7)" }}
      >
        {slide.tagline}
      </span>

      {/* Headline */}
      <h1
        className="text-2xl lg:text-3xl font-semibold leading-tight mb-3"
        style={{ color: "#FFFFFF", fontFamily: config.fontFamily }}
      >
        {slide.headline}
      </h1>

      {/* Supporting text */}
      <p
        className="text-sm leading-relaxed mb-6"
        style={{ color: "rgba(255, 255, 255, 0.75)", maxWidth: 460 }}
      >
        {slide.supporting}
      </p>

      {/* CTA Button */}
      <button
        onClick={onCtaClick}
        className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "#FFFFFF",
          color: config.primaryColor,
          border: "none",
          height: 38,
          paddingLeft: 20,
          paddingRight: 20,
          borderRadius: 8,
        }}
      >
        {slide.ctaLabel}
        <ArrowRightOutlined style={{ fontSize: 12 }} />
      </button>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? "Previous slide" : "Next slide"}
      className="absolute z-[3] top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-colors hover:bg-white/30"
      style={{
        [isLeft ? "left" : "right"]: 12,
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
      }}
    >
      {isLeft ? (
        <LeftOutlined style={{ fontSize: 13 }} />
      ) : (
        <RightOutlined style={{ fontSize: 13 }} />
      )}
    </button>
  );
}

function PaginationDots({
  count,
  activeIndex,
  onDotClick,
}: {
  count: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="absolute z-[3] bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to slide ${i + 1}`}
          className="cursor-pointer transition-all duration-300"
          style={{
            width: i === activeIndex ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === activeIndex ? "#fff" : "rgba(255,255,255,0.45)",
            border: "none",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}
