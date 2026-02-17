import { activeBrandConfig } from "../../../config/brandConfig";

interface Department {
  name: string;
  brands: string[];
}

const departments: Department[] = [
  {
    name: "Women",
    brands: ["Buffalo David Bitton", "Joe's Jeans", "Favorite Daughter", "Hervé Léger", "Jessica Simpson", "Zac Posen", "Hudson Jeans", "Laundry by Shelli Segal", "CeCe", "Curvy Couture", "Bebe", "Rachel Roy"],
  },
  {
    name: "Men",
    brands: ["IZOD", "Nautica", "Arrow", "Van Heusen", "Geoffrey Beene", "Perry Ellis", "Calvin Klein", "Tommy Hilfiger", "GH Bass", "Spike Needleman"],
  },
  {
    name: "Kids",
    brands: ["Calvin Klein Kids", "Tommy Hilfiger Kids", "Nautica Kids", "IZOD Kids", "Limited Too", "Freestyle Revolution", "Jessica Simpson Girls", "Joe's Jeans Kids", "Hudson Kids", "Buffalo Kids"],
  },
  {
    name: "Accessories",
    brands: ["Calvin Klein Accessories", "Tommy Hilfiger Bags", "Nautica Watches", "Kenneth Cole Reaction", "Anne Klein", "DKNY Accessories", "Karl Lagerfeld Paris", "Elie Tahari", "AllSaints", "Ted Baker"],
  },
  {
    name: "Entertainment",
    brands: ["Under Armour Lifestyle", "Tretorn", "Spyder", "Frye", "Avirex", "Reebok Classics", "Nautica Competition", "Buffalo Heritage", "IZOD Performance", "Champion Legacy"],
  },
];

export default function DepartmentPanel() {
  const config = activeBrandConfig;

  return (
    <div>
      <h4
        className="text-[10px] font-semibold uppercase tracking-widest mb-5"
        style={{ color: config.secondaryColor }}
      >
        Shop by Department
      </h4>
      <div className="grid grid-cols-3 gap-x-10 gap-y-6">
        {departments.map((dept) => (
          <div key={dept.name}>
            <h5
              className="text-sm font-semibold mb-2.5"
              style={{ color: config.primaryColor }}
            >
              {dept.name}
            </h5>
            <ul className="space-y-1.5">
              {dept.brands.map((brand) => (
                <li key={brand}>
                  <button
                    className="text-xs cursor-pointer bg-transparent border-none p-0 transition-colors"
                    style={{ color: "#6B7280" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = config.primaryColor;
                      e.currentTarget.style.fontWeight = "500";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#6B7280";
                      e.currentTarget.style.fontWeight = "400";
                    }}
                  >
                    {brand}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
