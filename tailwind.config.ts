import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F1117",
        sidebar: "#0A0B0F",
        card: "#16181F",
        "card-hover": "#1C1E27",
        input: "#0F1117",
        overlay: "#16181F",
        border: "#232536",
        "border-hover": "#2E3047",
        accent: "#00C896",
        "accent-hover": "#00E5A8",
        "accent-muted": "#00C89615",
        "accent-border": "#00C89640",
        "text-primary": "#EEEEF0",
        "text-secondary": "#8B8FA8",
        "text-tertiary": "#454760",
        "on-accent": "#0A0B0F",
        success: "#00C896",
        warning: "#F0A500",
        danger: "#F04060",
        info: "#5B8DEF",
        "success-muted": "#00C89610",
        "warning-muted": "#F0A50010",
        "danger-muted": "#F0406010",
        "info-muted": "#5B8DEF10",
        "status-done": "#00C896",
        "status-running": "#F0A500",
        "status-waiting": "#454760",
        "chart-normal": "#00C896",
        "chart-low": "#5B8DEF",
        "chart-high": "#F04060",
        "chart-critical": "#CC1F3A",
        "summary-text": "#D8D6E8",
        "action-text": "#C8C6D8",
        "sidebar-footer": "#454760",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
        element: "10px",
      },
      letterSpacing: {
        logo: "-0.3px",
        "display-tight": "-0.5px",
      },
    },
  },
  plugins: [],
};
export default config;
