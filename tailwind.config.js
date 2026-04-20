/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'comfortaa': ['Comfortaa', 'sans-serif'],
        'comic-neue': ['"Comic Neue"', 'cursive'],
        'shadows-into-light': ['Shadows Into Light', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        dark: 'var(--color-dark)', 
        light: 'var(--color-light)',
      },
      backgroundColor: {
        primary: 'var(--color-primary)',
        dark: 'var(--color-dark)',
        light: 'var(--color-light)',
      },
      textColor: {
        primary: 'var(--color-primary)',
        dark: 'var(--color-dark)',
        light: 'var(--color-light)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}