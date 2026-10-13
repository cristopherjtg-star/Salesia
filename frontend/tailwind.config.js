/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- Activa la lectura de la clase "dark" en el HTML
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}