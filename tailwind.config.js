/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
        '4xl': '2rem',      // 32px
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.4), 0 2px 8px -1px rgba(0, 0, 0, 0.3)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
        'card-dark': '0 10px 35px -5px rgba(0, 0, 0, 0.45), 0 4px 14px -2px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080c16',
        }
      }
    },
  },
  plugins: [],
}
