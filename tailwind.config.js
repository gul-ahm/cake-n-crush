/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        whatsapp: '#25D366',
      },
      boxShadow: {
        glow: '0 0 30px rgba(255, 105, 180, 0.45)'
      }
    },
  },
  plugins: [],
}
