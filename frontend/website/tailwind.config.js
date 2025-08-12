/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#2D2D2D',
        primary: '#A79277',
        secondary: '#D1BB9E',
        tertiary: '#EAD8C0',
        background: '#FFF2E1',
      },
      fontFamily: {
        'sans': ['Playfair Display', 'Cormorant Garamond', 'Baskerville', 'Georgia', 'serif'],
        'serif': ['Playfair Display', 'Cormorant Garamond', 'Baskerville', 'Georgia', 'serif'],
        'display': ['Playfair Display', 'serif'],
        'body': ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      colors: {
        // Zara-inspired color palette
        fashion: {
          'cream': '#F8F6F0',
          'warm-white': '#FEFCF8',
          'light-beige': '#F5F2ED',
          'soft-gray': '#E8E5E0',
          'warm-gray': '#D4CFC7',
          'charcoal': '#2D2D2D',
          'dark-gray': '#444444',
          'accent-brown': '#8B7355',
          'light-brown': '#B5A084',
          'nude': '#E6D7C3',
          'rose-dust': '#E8D5D5',
          'sage': '#B8C5A6',
        }
      },
      height: {
        '100': '25rem',   // 400px
        '112': '28rem',   // 448px
        '120': '30rem',   // 480px
        '128': '32rem',   // 512px
        '140': '35rem',   // 560px
        '160': '40rem',   // 640px
        '180': '45rem',   // 720px
        '200': '50rem',   // 800px
      },
      borderRadius: {
        'fashion': '2rem',
        'soft': '1.5rem',
        'gentle': '0.75rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'gentle': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'fashion': '0 8px 32px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
};