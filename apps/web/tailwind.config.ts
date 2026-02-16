import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Scans your signup page and layout
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}", // Critical for monorepo shared UI
  ],
  theme: {
    extend: {
      colors: {
        // You can add your brand colors here for the 'NoteBook' theme
        brand: "#F59E0B", 
      },
    },
  },
  plugins: [],
};
export default config;