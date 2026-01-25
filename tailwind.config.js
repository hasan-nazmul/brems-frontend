/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#006A4E', // BR Primary Green
          700: '#047857', // Hover state
          800: '#065f46', // Darker accents
        },
        danger: '#F42A41', // Signal Red
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Bengali', 'sans-serif'],
      },
    },
  },
  plugins: [],
}