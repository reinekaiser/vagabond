/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        softBlue: "#eff4f9",
        primary: "#00A4FF",
        secondary: "#9ca3af",
        orangee: "#FF7E1B",
        orange_primary: "#FC9D26",
        primary_bold: "#262DFC",
        blue_medium: '#27b5fc',
        gray_primary: "#757575"
      },
      container: {
        screens: {
          xl: "1220px",
        },
      },
      gridTemplateColumns: {
        footer: "1.3fr 1fr 1fr 1fr",
        three_col_custom: "48% 4% 48%",
      },
      boxShadow: {
        custom: "0 5px 15px rgba(0, 0, 0, 0.15) ",
        dropdown: "0 4px 20px 0 rgba(0, 0, 0, 0.1)"
      },
    },
  },
  plugins: [],
}

