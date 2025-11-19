/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary orange palette (EzMart-inspired)
        primary: {
          50: '#FFF7F2',
          100: '#FFE8D9',
          200: '#FFD2B5',
          300: '#FFB98A',
          400: '#FF9C57',
          500: '#FF7F23',
          600: '#DB6516',
          700: '#B74E0E',
          800: '#933C0A',
          900: '#7A3008',
        },

        // Backwards-compatible 'ds' token used across the dashboard
        // Map ds shades to the new primary palette (keeps existing classes working)
        ds: {
          100: '#FFF7F2',
          200: '#FFE8D9',
          300: '#FFD2B5',
          400: '#FFB98A',
          500: '#FF9C57',
          600: '#FF7F23',
          // keep darker/heading tokens neutral for text readability
          700: '#4A4A4A',
          800: '#2D3748',
          900: '#1A1A1A',
        },

        // Neutral tokens for text, borders and background
        heading: '#1A1A1A',
        body: '#4A4A4A',
        subtle: '#808080',
        neutral: {
          background: '#FDFDFD',
          card: '#FFFFFF',
          border: '#E8E8E8',
        },

        // Status colors
        success: '#27C28A',
        warning: '#FFC107',
        danger: '#F25767',
        // Map common semantic colors to the new design system so existing
        // classes like `bg-blue-100`, `text-green-600`, `bg-red-100` pick
        // up the new palette without editing every component.
        blue: {
          50: '#FFF7F2',
          100: '#FFE8D9',
          200: '#FFD2B5',
          300: '#FFB98A',
          400: '#FF9C57',
          500: '#FF7F23',
          600: '#DB6516',
          700: '#B74E0E',
          800: '#933C0A',
          900: '#7A3008',
        },
        green: {
          50: '#E6FBF2',
          100: '#D6F7EC',
          200: '#C6F3E6',
          500: '#27C28A',
          600: '#27C28A',
          700: '#1FA66B',
        },
        yellow: {
          50: '#FFF9EB',
          100: '#FFF3D6',
          500: '#FFC107',
          600: '#FFC107',
        },
        red: {
          50: '#FFF1F2',
          100: '#FFE6E8',
          500: '#F25767',
          600: '#F25767',
        },
      }
    },
  },
  plugins: [],
};
