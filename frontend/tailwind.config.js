/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — deep forest green (backward-compatible)
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Deep forest — main brand dark anchor
        forest: {
          50:  '#f0fdf4',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Leaf — mid greens
        leaf: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Crop — brighter accent green
        crop: {
          50:  '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
        },
        // Soil — warm off-white backgrounds
        soil: {
          50:  '#faf8f4',
          100: '#f5f0e8',
          200: '#ebe1d1',
          300: '#d4c5ad',
          400: '#bfa88a',
          500: '#a68c6a',
          600: '#8a7254',
          700: '#6e5a41',
        },
        // Bark — earthy accent
        bark: {
          50:  '#fdf8f2',
          100: '#f9ede0',
          200: '#f1d9bc',
          300: '#e7be90',
          400: '#d9995f',
          500: '#cc7c3a',
          600: '#b5632a',
          700: '#964e23',
        },
        // Legacy earth scale
        earth: {
          50:  '#faf6f1',
          100: '#f0e8db',
          200: '#e0cfb8',
          300: '#cdb08f',
          400: '#b8916a',
          500: '#a67c52',
          600: '#8f6644',
          700: '#755239',
          800: '#614433',
          900: '#523a2e',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':      '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover':'0 4px 12px 0 rgb(0 0 0 / 0.08), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'topbar':    '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        'sidebar':   '1px 0 3px 0 rgb(0 0 0 / 0.04)',
      },
      animation: {
        'pulse-ring':  'pulse-ring 1.5s ease-out infinite',
        'fade-in':     'fade-in 0.2s ease-out',
        'slide-up':    'slide-up 0.25s ease-out',
        'step-check':  'step-check 0.3s ease-out forwards',
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',    opacity: '0.8' },
          '70%':  { transform: 'scale(1.35)', opacity: '0.2' },
          '100%': { transform: 'scale(1.35)', opacity: '0'   },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        'step-check': {
          '0%':   { transform: 'scale(0.6)', opacity: '0' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
