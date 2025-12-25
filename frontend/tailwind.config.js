/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(160, 90%, 8%)",
        foreground: "hsl(210, 40%, 98%)",
        card: {
          DEFAULT: "hsl(160, 70%, 12%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        popover: {
          DEFAULT: "hsl(160, 90%, 8%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        primary: {
          DEFAULT: "hsl(43, 74%, 66%)",
          foreground: "hsl(160, 90%, 8%)"
        },
        secondary: {
          DEFAULT: "hsl(160, 50%, 18%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        muted: {
          DEFAULT: "hsl(160, 50%, 18%)",
          foreground: "hsl(160, 20%, 65%)"
        },
        accent: {
          DEFAULT: "hsl(160, 50%, 18%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        destructive: {
          DEFAULT: "hsl(0, 62%, 30%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        border: "hsl(160, 50%, 18%)",
        input: "hsl(160, 50%, 18%)",
        ring: "hsl(43, 74%, 66%)"
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}