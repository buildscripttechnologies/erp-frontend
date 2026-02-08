// tailwind.config.js
export default {
    darkMode: 'class',
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                secondary: "#292927",
                primary: "#d6b46b",
            },
            spacing: {
                72: "18rem",
                84: "21rem",
            },
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui"],
            },
        },
    },
};