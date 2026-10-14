import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#071426", brand: "#6557ff", lilac: "#eeeaff" }, boxShadow: { soft: "0 20px 60px rgba(18, 28, 60, .10)" } } },
  plugins: []
};
export default config;