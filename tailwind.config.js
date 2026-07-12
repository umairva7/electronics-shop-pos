/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          blue: '#1d4ed8',
          light: '#eff6ff',
        }
      }
    },
  },
  plugins: [],
}
