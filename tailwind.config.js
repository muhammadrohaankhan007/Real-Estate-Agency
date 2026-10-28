/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#EFE4CD',
          300: '#E5D2AE',
          400: '#DCC18E',
          500: '#D4AF37',
          600: '#BA9427',
          700: '#94751D',
          800: '#6E5615',
          900: '#48370C',
          sand: '#E3CBA8',
          muted: '#B39750',
        },
        noir: {
          DEFAULT: '#0a0a0a',
          surface: '#121214',
          card: '#151518',
          elevated: '#1a1a1f',
        }
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        cinzel: ['var(--font-cinzel)', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'subtle-zoom': 'slowZoom 25s ease-in-out infinite alternate',
      },
      keyframes: {
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        }
      }
    },
  },
  plugins: [],
}
