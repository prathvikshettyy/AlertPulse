/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          900: '#0a0e14',
          850: '#0d1218',
          800: '#111722',
          750: '#151c28',
          700: '#1a2230',
          600: '#232d3d',
        },
        line: '#1f2937',
        brand: {
          50: '#ecfdff',
          100: '#cff7fe',
          200: '#a4eefc',
          300: '#6ee0f9',
          400: '#36ccf0',
          500: '#0bb5d8',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'flash': {
          '0%': { backgroundColor: 'rgba(11,181,216,0.22)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'scan': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'flash': 'flash 1.2s ease-out',
        'scan': 'scan 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
