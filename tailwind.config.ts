import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cps: {
          red: "#B40010",
          redDark: "#8F000C",
          sidebar: "#2F4F5D",
          sidebarDark: "#263F4A",
          cyan: "#E9F7FB",
          ink: "#263F4A",
          muted: "#6B7880",
          line: "#DDE5E8",
          success: "#0B8F5A",
          warning: "#B7791F"
        }
      },
      boxShadow: {
        soft: "0 10px 25px rgba(38, 63, 74, 0.12)",
        card: "0 3px 12px rgba(38, 63, 74, 0.10)"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
