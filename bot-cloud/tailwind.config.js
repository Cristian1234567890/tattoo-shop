/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atelier: {
          bg: '#090a0f',
          surface: '#12141c',
          border: '#1e2230',
          accent: '#d97706',
          gold: '#f59e0b',
          neon: '#8b5cf6',
          emerald: '#10b981',
          crimson: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
