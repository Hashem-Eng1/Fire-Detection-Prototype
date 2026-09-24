/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d5dde9',
          200: '#aebbcc',
          300: '#7d92ad',
          400: '#4f6a8c',
          500: '#345273',
          600: '#243d5a',
          700: '#1b2f47',
          800: '#142338',
          900: '#0e1a2b',
          950: '#08111f',
        },
        accent: {
          50: '#eaf3fb',
          100: '#cfe6f6',
          200: '#a1d0ee',
          300: '#63b4e2',
          400: '#2f95d4',
          500: '#1679bd',
          600: '#0d60a0',
          700: '#0b4d80',
          800: '#0d4068',
          900: '#0f3656',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(16,24,40,0.08), 0 4px 16px -4px rgba(16,24,40,0.06)',
        card: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
        lift: '0 8px 24px -8px rgba(16,24,40,0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.45)' },
          '70%': { boxShadow: '0 0 0 8px rgba(239,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        'pulse-ring': 'pulse-ring 1.8s infinite',
      },
    },
  },
  plugins: [],
};
