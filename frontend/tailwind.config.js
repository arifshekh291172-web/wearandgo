/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C5A059',
          hover: '#B38B3F',
          light: '#F8F4EA',
          dark: '#8E6B2C',
        },
        gold: {
          50: '#FAF8F3',
          100: '#F5F0E4',
          200: '#EBDDC1',
          300: '#DEC59A',
          400: '#D2AF74',
          500: '#C5A059',
          600: '#B38B3F',
          700: '#8E6B2C',
          800: '#6A4F20',
          900: '#4A3614',
        },
        obsidian: {
          50: '#F6F6F7',
          100: '#E2E3E5',
          800: '#1A1C23',
          900: '#0F1015',
          DEFAULT: '#0A0B0E',
        },
        brand: {
          50: '#FAF8F3',
          100: '#F5F0E4',
          200: '#EBDDC1',
          300: '#DEC59A',
          400: '#D2AF74',
          500: '#C5A059',
          600: '#B38B3F',
          700: '#8E6B2C',
          800: '#6A4F20',
          900: '#4A3614',
          dark: '#0F1015',
          charcoal: '#1A1C23',
          muted: '#64748b',
          light: '#FAFAF9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
