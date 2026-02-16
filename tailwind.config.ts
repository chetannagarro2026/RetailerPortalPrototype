import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
          border: "var(--brand-border)",
          "card-bg": "var(--brand-card-bg)",
        },
      },
      fontFamily: {
        sans: ["var(--brand-font)"],
      },
      spacing: {
        "header": "var(--header-height)",
        "nav": "var(--nav-height)",
      },
      maxWidth: {
        "content": "1280px",
      },
    },
  },
  plugins: [],
} satisfies Config;
