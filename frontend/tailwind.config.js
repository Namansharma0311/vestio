/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--c-canvas)",
        surface: "var(--c-surface)",
        ink: "var(--c-ink)",
        moss: "var(--c-accent)",
        mossdark: "var(--c-accent-hover)",
        clay: "var(--c-danger)",
        line: "var(--c-border)",
        muted: "var(--c-muted)",
      },
      fontFamily: {
        display: ["'Cabin Sketch'", "cursive"],
        body: ["'Lobster Two'", "cursive"],
      },
      borderRadius: {
        tag: "4px",
      },
    },
  },
  plugins: [],
};
