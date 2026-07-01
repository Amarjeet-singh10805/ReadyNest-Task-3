/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2f8",
          500: "#dc2743",
          600: "#c4263d",
        },
      },
    },
  },
  plugins: [],
};
