/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: "#17181B",
          light: "#222429",
          lighter: "#2D3038",
        },
        paper: "#EFEDE6",
        lane: "#F2B705",
        taillight: "#D93A2B",
        steel: "#4A6FA5",
        signal: "#3FA66C",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "lane-dash":
          "repeating-linear-gradient(90deg, #F2B705 0, #F2B705 24px, transparent 24px, transparent 44px)",
      },
      letterSpacing: {
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};
