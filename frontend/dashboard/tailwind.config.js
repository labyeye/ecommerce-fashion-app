/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ds: {
          100: '#C6DEC6',
          200: '#B8D2B3',
          300: '#A9C5A0',
          400: '#8FA38A',
          500: '#758173',
          600: '#647A67',
          700: '#3C433B',
          800: '#1F241F',
          900: '#020402'
        }
      }
    },
  },
  plugins: [],
};
