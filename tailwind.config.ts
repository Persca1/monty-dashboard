import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0C0E",
        panel: "#141619",
        panel2: "#1B1E22",
        line: "#2A2F35",
        accent: "#E8542A",
        green: "#5BBF7A",
        amber: "#E0A33C",
        txt: "#E8EAED",
        txt2: "#9BA1A9",
        muted: "#6B7078",
      },
      fontFamily: {
        serif: ["var(--font-spectral)", "Spectral", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
