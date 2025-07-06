/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'trebuchet': ['"Trebuchet MS"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        stargreen: {
          dark: '#295A12',       // Deep Green
          medium: '#398908',     // Olive/Leaf Green
          light: '#87DC3F',      // Lime/Spring Green
          neon: '#C6E90E',       // Chartreuse/Neon Yellow-Green
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        bounceIn: 'bounceIn 0.8s ease',
        fade: 'fade 0.5s ease-in',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
