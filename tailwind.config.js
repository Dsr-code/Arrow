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
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'soft-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.5), 0 2px 8px -1px rgba(0, 0, 0, 0.3)',
        'card': '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'card-dark': '0 10px 35px -5px rgba(0, 0, 0, 0.55), 0 4px 14px -2px rgba(0, 0, 0, 0.35)',
        'spatial': '0 12px 36px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
        'spatial-dark': '0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'spatial-elevated': '0 20px 50px -10px rgba(15, 23, 42, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.9)',
        'spatial-elevated-dark': '0 20px 50px -10px rgba(0, 0, 0, 0.75), inset 0 1px 2px 0 rgba(255, 255, 255, 0.15)',
        'glow': '0 0 25px -3px rgba(59, 130, 246, 0.4)',
        'glow-sky': '0 0 25px -3px rgba(56, 189, 248, 0.4)',
        'glow-emerald': '0 0 25px -3px rgba(16, 185, 129, 0.35)',
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#131b2e',
          900: '#0b1120',
          950: '#060911',
        }
      }
    },
  },
  plugins: [],
}
