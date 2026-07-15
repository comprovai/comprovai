import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f86924",
        brand: "#212771",
        background: "#ebeff2",
        surface: "#ffffff",
        "text-default": "#555555",
        "text-subtle": "#8d949a",
        "border-default": "#dddddd",
        success: "#35bc7a",
        danger: "#e14c4c",
      },
      fontFamily: {
        sans: ["var(--font-open-sans)"],
      },
      borderRadius: {
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
