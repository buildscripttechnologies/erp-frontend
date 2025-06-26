// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gre: "#292927",
        golden: "#d6b46b", // custom color
      },
      spacing: {
        72: "18rem",
        84: "21rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"], // added custom font family
      },
    },
  },
};
