/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#c8f135',
        dark: {
          900: '#0f0f0f',
          800: '#161616',
          700: '#1e1e1e',
          600: '#2a2a2a',
          500: '#3a3a3a',
        }
      }
    }
  },
  plugins: []
}
