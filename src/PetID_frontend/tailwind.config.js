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
        },
        petPink: {
          100: '#ffe4f1',
          300: '#ff9ed1',
          500: '#ff5fb1',
          600: '#ff3fa4'
        },
        petPurple: {
          100: '#ede4ff',
          300: '#c4a5ff',
          500: '#9b6dff',
          600: '#7d47ff'
        },
        petMint: {
          100: '#d6f9f0',
          300: '#9af2db',
          500: '#48e0bb',
          600: '#22c39b'
        },
        petYellow: {
          100: '#fff9d9',
          300: '#ffe985',
          500: '#ffd438',
          600: '#ffbf00'
        },
        // Tons neutros claros para usar como "surface" em dark mode e evitar visual muito fechado
        surface: {
          50: '#0f1724',
          75: '#142131',
          100: '#192a3e',
          200: '#20344b'
        }
      },
      boxShadow: {
        soft: '0 4px 12px -2px rgba(0,0,0,.08),0 2px 4px -1px rgba(0,0,0,.04)'
      },
      backgroundSize: {
        '200%': '200% 200%'
      },
      keyframes: {
        'gradient-x': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,140,120,0.0),0 0 0 0 rgba(99,180,255,0.0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(255,140,120,0.12),0 0 0 12px rgba(99,180,255,0.08)' }
        },
        'float-soft': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'wiggle': {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' }
        }
      },
      animation: {
        'gradient-x': 'gradient-x 10s ease infinite',
        'glow-pulse': 'glow-pulse 5s ease-in-out infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'wiggle-slow': 'wiggle 8s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
