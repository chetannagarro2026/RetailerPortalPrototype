import { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";

interface FilterPanelProps {
  filtersAvailable: string[];
}

const filterOptions: Record<string, string[]> = {
  brand: ["Calvin Klein", "Tommy Hilfiger", "IZOD", "Buffalo David Bitton", "Nautica", "Arrow", "Jessica Simpson", "Joe's Jeans"],
  size: ["XS", "S", "M", "L", "XL", "XXL"],
  color: ["Black", "White", "Navy", "Grey", "Red", "Blue", "Green", "Beige"],
  price: ["Under $25", "$25 – $50", "$50 – $100", "$100 – $200", "$200+"],
  fit: ["Slim", "Regular", "Relaxed", "Oversized"],
  material: ["Cotton", "Polyester", "Leather", "Denim", "Wool", "Silk"],
  age: ["0–2 yrs", "3–5 yrs", "6–8 yrs", "9–12 yrs", "13+"],
  activity: ["Running", "Training", "Outdoor", "Lifestyle", "Golf"],
};

const filterLabels: Record<string, string> = {
  brand: "Brand",
  size: "Size",
  color: "Color",
  price: "Price Range",
  fit: "Fit",
  material: "Material",
  age: "Age Group",
  activity: "Activity",
};

export default function FilterPanel({ filtersAvailable }: FilterPanelProps) {
  const config = activeBrandConfig;
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(filtersAvailable.slice(0, 2))
  );

  const toggle = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: config.secondaryColor }}
      >
        Filters
      </h4>
      {filtersAvailable.map((key) => {
        const options = filterOptions[key] || [];
        const isOpen = openSections.has(key);

        return (
          <div
            key={key}
            className="border-b"
            style={{ borderColor: config.borderColor }}
          >
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between py-3 text-xs font-medium cursor-pointer bg-transparent border-none"
              style={{ color: config.primaryColor }}
            >
              {filterLabels[key] || key}
              <DownOutlined
                className="text-[9px] transition-transform duration-200"
                style={{
                  color: config.secondaryColor,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {isOpen && (
              <div className="pb-3 space-y-2">
                {options.map((opt) => (
                  <div key={opt}>
                    <Checkbox className="text-xs">{opt}</Checkbox>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
