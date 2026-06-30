/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "secondary-fixed": "#ffdf90",
        "on-secondary-container": "#6f5600",
        "secondary-fixed-dim": "#f0c12c",
        "primary-fixed": "#ffdad4",
        "on-primary-fixed-variant": "#8f0f07",
        "inverse-on-surface": "#f3f0f0",
        "inverse-primary": "#ffb4a8",
        "on-primary-fixed": "#410000",
        "on-primary-container": "#ff8371",
        "outline-variant": "#e2bfb9",
        "surface-container-low": "#f6f3f2",
        "inverse-surface": "#303030",
        background: "#fbf9f8",
        "on-tertiary-container": "#4e3d00",
        "on-error": "#ffffff",
        "on-secondary": "#ffffff",
        "secondary-container": "#fccc38",
        "tertiary-container": "#cba72f",
        "on-secondary-fixed": "#241a00",
        "surface-container-high": "#eae8e7",
        "tertiary-fixed": "#ffe088",
        "on-tertiary-fixed": "#241a00",
        secondary: "#755b00",
        "on-secondary-fixed-variant": "#584400",
        "surface-tint": "#b22b1d",
        outline: "#8e706c",
        surface: "#fbf9f8",
        "on-tertiary-fixed-variant": "#574500",
        primary: "#570000",
        error: "#ba1a1a",
        "surface-container-highest": "#e4e2e1",
        "surface-dim": "#dcd9d9",
        "on-surface-variant": "#5a413d",
        "tertiary-fixed-dim": "#e9c349",
        "surface-bright": "#fbf9f8",
        "on-surface": "#1b1c1c",
        "on-primary": "#ffffff",
        "on-background": "#1b1c1c",
        "surface-variant": "#e4e2e1",
        "primary-fixed-dim": "#ffb4a8",
        "on-error-container": "#93000a",
        "surface-container-lowest": "#ffffff",
        "error-container": "#ffdad6",
        tertiary: "#735c00",
        "surface-container": "#f0eded",
        "primary-container": "#800000",
        "on-tertiary": "#ffffff"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        gutter: "24px",
        "section-gap": "80px",
        unit: "8px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        "container-max": "1200px"
      },
      fontFamily: {
        "headline-md": ["Playfair Display", "serif"],
        display: ["Playfair Display", "serif"],
        "stats-display": ["Playfair Display", "serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "label-caps": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        display: ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "stats-display": ["24px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "700" }]
      }
    }
  },
  plugins: []
};
