/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0A',
        'bg-secondary': '#111111',
        'card': '#1A1A1A',
        'border': '#2A2A2A',
        'text-primary': '#F5F5F5',
        'text-secondary': '#B0B0B0',
        'text-muted': '#6B6B6B',
        'accent-blue': '#121bde',
        'accent-green': '#1cdb19',
        'accent-orange': '#d72d02',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        silkscreen: ['Silkscreen', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        aharoni: ['Aharoni', 'sans-serif'],
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
};
