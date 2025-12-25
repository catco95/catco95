/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222, 47%, 11%)",
        foreground: "hsl(210, 40%, 98%)",
        card: {
          DEFAULT: "hsl(217, 33%, 17%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        popover: {
          DEFAULT: "hsl(222, 47%, 11%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        primary: {
          DEFAULT: "hsl(43, 74%, 66%)",
          foreground: "hsl(222, 47%, 11%)"
        },
        secondary: {
          DEFAULT: "hsl(217, 19%, 27%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        muted: {
          DEFAULT: "hsl(217, 19%, 27%)",
          foreground: "hsl(215, 20%, 65%)"
        },
        accent: {
          DEFAULT: "hsl(217, 19%, 27%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        destructive: {
          DEFAULT: "hsl(0, 62%, 30%)",
          foreground: "hsl(210, 40%, 98%)"
        },
        border: "hsl(217, 19%, 27%)",
        input: "hsl(217, 19%, 27%)",
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