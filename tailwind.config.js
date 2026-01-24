/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          green: '#006A4E', // Bangladesh Railway Green
          red: '#F42A41',   // Railway Red
        },
      },
    },
  },
  plugins: [],
}