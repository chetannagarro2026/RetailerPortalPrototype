import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import { fetchPurchaseOrders, mapPOToUpdate } from "../../services/poService";
import POCard from "./cards/POCard";
import ReturnCard from "./cards/ReturnCard";
import CriticalActionCard from "./cards/CriticalActionCard";

export interface POUpdate {
  type: "po";
  poNumber: string;
  orderDate: string;
  totalValue: number;
  currentStep: number; // 0-4: Placed, Confirmed, Billed, Shipped, Delivered
}

export interface ReturnUpdate {
  type: "return";
  returnId: string;
  status: "Pending" | "In Review" | "Approved" | "Rejected";
  submissionDate: string;
}

export interface CriticalUpdate {
  type: "critical";
  title: string;
  description: string;
  severity: "warning" | "urgent";
}

export type UpdateItem = POUpdate | ReturnUpdate | CriticalUpdate;

// Mock data for returns and critical updates
const mockStaticUpdates: UpdateItem[] = [
  {
    type: "critical",
    title: "Payment Due",
    description: "Invoice #INV-44821 of $12,400 is due in 3 days.",
    severity: "warning",
  },
  {
    type: "critical",
    title: "Credit Near Limit",
    description: "Utilization at 87%. Contact your account manager to request an increase.",
    severity: "urgent",
  },
  {
    type: "return",
    returnId: "RTN-006214",
    status: "In Review",
    submissionDate: "Jan 8, 2026",
  },
];

export default function UpdatesSection() {
  const config = activeBrandConfig;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch POs from API
  const { data: poRecords = [], isLoading } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => fetchPurchaseOrders(0, 5),
  });

  // Combine PO updates with static updates
  const updates: UpdateItem[] = useMemo(() => {
    const poUpdates = poRecords.map(mapPOToUpdate);
    return [...poUpdates, ...mockStaticUpdates];
  }, [poRecords]);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 300;
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
    setTimeout(updateScrollState, 350);
  };

  const renderCard = (item: UpdateItem, index: number) => {
    switch (item.type) {
      case "po":
        return <POCard key={index} data={item} />;
      case "return":
        return <ReturnCard key={index} data={item} />;
      case "critical":
        return <CriticalActionCard key={index} data={item} />;
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden p-3"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: config.primaryColor }}>
          Updates
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="text-xs font-medium cursor-pointer bg-transparent border-none"
            style={{ color: config.secondaryColor }}
          >
            View All
          </button>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-default"
              style={{
                border: `1px solid ${config.borderColor}`,
                color: config.secondaryColor,
                backgroundColor: "#fff",
              }}
            >
              <LeftOutlined className="text-[10px]" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-default"
              style={{
                border: `1px solid ${config.borderColor}`,
                color: config.secondaryColor,
                backgroundColor: "#fff",
              }}
            >
              <RightOutlined className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      {isLoading ? (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            border: `1px dashed ${config.borderColor}`,
            minHeight: 160,
            backgroundColor: config.cardBg,
          }}
        >
          <Spin />
        </div>
      ) : updates.length === 0 ? (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            border: `1px dashed ${config.borderColor}`,
            minHeight: 160,
            backgroundColor: config.cardBg,
          }}
        >
          <span className="text-sm" style={{ color: config.secondaryColor }}>
            No recent updates.
          </span>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto pb-1"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
        >
          {updates.map((item, i) => (
            <div
              key={i}
              className="shrink-0"
              style={{ width: 280, scrollSnapAlign: "start" }}
            >
              {renderCard(item, i)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
