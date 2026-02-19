import { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface FooterSection {
  title: string;
  items: string[];
}

const sections: FooterSection[] = [
  {
    title: "Company",
    items: ["About Us", "FAQ", "Media"],
  },
  {
    title: "Order & Support",
    items: ["Order Support", "Returns, Warranty & Cancellation", "Invoices"],
  },
  {
    title: "Contact & Resources",
    items: ["Call us at: 1234567890", "Branch Locations", "Catalog", "Feedback"],
  },
];

const legalLinks = ["Terms of Service", "Privacy Policy"];

function MobileAccordion({ section }: { section: FooterSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3.5 px-0 text-sm font-semibold text-white bg-transparent cursor-pointer"
      >
        {section.title}
        <DownOutlined
          className="text-[10px] text-gray-400 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <ul className="list-none m-0 p-0 pb-3 flex flex-col gap-2">
          {section.items.map((item) => (
            <li key={item}>
              <span className="text-sm text-gray-400 cursor-default">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Footer() {
  const config = activeBrandConfig;

  return (
    <footer
      className="mt-12"
      style={{ backgroundColor: config.primaryColor }}
    >
      {/* Main footer columns */}
      <div className="max-w-content-wide mx-auto px-6 pt-10 pb-8">
        {/* Desktop / Tablet grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {section.items.map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-300 cursor-default hover:text-gray-100 transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div className="sm:hidden">
          {sections.map((section) => (
            <MobileAccordion key={section.title} section={section} />
          ))}
        </div>
      </div>

      {/* Legal strip */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div className="max-w-content-wide mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-400">
            © 2026 Retailer Portal
          </span>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <span
                key={link}
                className="text-xs text-gray-400 cursor-default hover:text-gray-300 transition-colors"
              >
                {link}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
