/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1D9E75',
          'green-light': '#E1F5EE',
          'green-dark': '#0F6E56',
          red: '#E24B4A',
          'red-light': '#FCEBEB',
          amber: '#BA7517',
          'amber-light': '#FAEEDA',
          blue: '#185FA5',
          'blue-light': '#E6F1FB',
          wa: '#25D366',
          'wa-hover': '#1DA851',
          bg: '#F5F3EF',
          surface: '#FFFFFF',
          surface2: '#F0EDE7',
          border: '#E5E2DC',
          text: '#1A1816',
          text2: '#6B6760',
          text3: '#A8A59F'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
        modal: '0 8px 40px rgba(0,0,0,0.14)'
      },
      borderRadius: {
        card: '14px'
      }
    },
  },
  plugins: [],
}
