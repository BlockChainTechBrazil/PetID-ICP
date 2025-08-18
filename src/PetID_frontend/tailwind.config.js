/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f4f9ff',
          100: '#e6f2ff',
          200: '#c5e4ff',
          300: '#99d0ff',
          400: '#63b4ff',
          500: '#3695ff',
          600: '#1d74e6',
          700: '#175bb4',
          800: '#164b8c',
          900: '#163f70'
        },
        accent: {
          50: '#fff7f5',
          100: '#ffe8e1',
          200: '#ffcfc2',
          300: '#ffab92',
          400: '#ff7c59',
          500: '#ff572a',
          600: '#ed3b11',
          700: '#c52d0d',
          800: '#9d270f',
          900: '#7e2310'
        }
      },
      boxShadow: {
        soft: '0 4px 12px -2px rgba(0,0,0,.08),0 2px 4px -1px rgba(0,0,0,.04)'
      }
    },
  },
  plugins: [],
}
