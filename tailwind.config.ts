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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          DEFAULT: "#B8925A",
          light: "#C9A876",
          // Darker than the brand accent — only for white text on a gold
          // fill (badges, active tab pills), where #B8925A fails WCAG AA
          // contrast for small text.
          dark: "#7A5C33",
        },
        ivory: {
          DEFAULT: "#F7F3EC",
          soft: "#FAF7F2",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#6B6B6B",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
