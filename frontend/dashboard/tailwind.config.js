/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ds: {
  100: '#F8FAFC', // very light
  200: '#D9EAFD', // light bluish-gray
  300: '#BCCCDC', // soft cool gray
  400: '#9AA6B2', // mid-gray-blue
  500: '#7B8794', // muted slate
  600: '#616E7C', // deep gray-blue
  700: '#4A5568', // dark slate gray
  800: '#2D3748', // darker steel gray
  900: '#1A202C', // near-black cool gray
}
      }
    },
  },
  plugins: [],
};
