import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        brass: '0 18px 45px rgba(18, 52, 64, 0.12)',
      },
      colors: {
        parchment: '#f6efe2',
        ink: '#173442',
        brass: '#a6642a',
        rust: '#b14a2f',
        moss: '#55765c',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [forms],
}
