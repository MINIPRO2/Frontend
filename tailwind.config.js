/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          600: '#3730a3',
          700: '#312e81',
          800: '#1e1b4b',
          900: '#0f172a',
        },
        slate: {
          950: '#fffdfc',
          900: '#fff8f6',
          800: '#ffefec',
          700: '#f5d8d3',
          600: '#ddb7b1',
          500: '#92716d',
          400: '#70524f',
          300: '#553b38',
          200: '#402b29',
          100: '#2d1d1b',
        },
        indigo: {
          50: '#fff0f0',
          300: '#991b1b',
          400: '#b91c1c',
          500: '#dc2626',
          950: '#7f1d1d',
        },
        violet: {
          500: '#f87171',
          600: '#ef4444',
        },
        cyan: {
          500: '#9ddce0',
        },
        blue: {
          500: '#adcaf5',
        },
        emerald: {
          300: '#207657',
          500: '#91d7b2',
        },
        teal: {
          500: '#a6ded4',
        },
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

