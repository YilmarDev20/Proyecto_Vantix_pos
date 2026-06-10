/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ ESTRATEGIA: Le avisa a Tailwind que busque la clase 'dark' en el HTML raíz
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", 
        secondary: "#475569", 
        accent: "#f43f5e", 
        background: "#f8fafc", 
      }
    },
  },
  plugins: [],
}