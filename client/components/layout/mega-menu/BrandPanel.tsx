import { activeBrandConfig } from "../../../config/brandConfig";

const brands = [
  "AllSaints", "Anne Klein", "Arrow", "Avirex",
  "Bebe", "Buffalo David Bitton", "Calvin Klein", "Calvin Klein Kids",
  "CeCe", "Champion Legacy", "Curvy Couture", "DKNY",
  "Elie Tahari", "Favorite Daughter", "Freestyle Revolution", "Frye",
  "Geoffrey Beene", "GH Bass", "Hervé Léger", "Hudson Jeans",
  "IZOD", "Jessica Simpson", "Joe's Jeans", "Karl Lagerfeld Paris",
  "Kenneth Cole Reaction", "Laundry by Shelli Segal", "Limited Too", "Nautica",
  "Perry Ellis", "Rachel Roy", "Reebok Classics", "Spyder",
  "Ted Baker", "Tommy Hilfiger", "Tretorn", "Under Armour Lifestyle",
  "Van Heusen", "Zac Posen",
];

export default function BrandPanel() {
  const config = activeBrandConfig;

  return (
    <div>
      <h4
        className="text-[10px] font-semibold uppercase tracking-widest mb-5"
        style={{ color: config.secondaryColor }}
      >
        Shop by Brand
      </h4>
      <div className="grid grid-cols-4 gap-x-8 gap-y-2.5">
        {brands.map((brand) => (
          <button
            key={brand}
            className="text-left text-xs py-1.5 cursor-pointer bg-transparent border-none p-0 transition-colors rounded"
            style={{ color: "#374151" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = config.primaryColor;
              e.currentTarget.style.fontWeight = "600";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.fontWeight = "400";
            }}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}
