/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ MUST be 'class'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
