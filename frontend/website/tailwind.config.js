/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Global palette mapped to your requested colors
        dark: '#000000',
        primary: '#E4A95D', // light warm
        secondary: '#C17237', // mid
        tertiary: '#914D26', // deep
        background: '#FFF2E1',
        // Fashion tokens mapped to the palette (keeps some neutrals for layout)
        fashion: {
          'cream': '#F8F6F0',
          'warm-white': '#FEFCF8',
          'light-beige': '#F5F2ED',
          'soft-gray': '#E8E5E0',
          'warm-gray': '#D4CFC7',
          'charcoal': '#000000',
          'dark-gray': '#914D26',
          'accent-brown': '#C17237',
          'light-brown': '#E4A95D',
          'nude': '#E4A95D',
          'rose-dust': '#E8D5D5',
          'sage': '#B8C5A6',
        }
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
      /* colors block removed - fashion tokens moved to the primary colors block above */
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