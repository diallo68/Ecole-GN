/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#135A3D', // vert Gandal (validé via maquette AIDesigner)
          dark: '#0D402B',
          light: '#F0F7F4',
        },
        accent: '#F5B700', // jaune
        flag: '#CE1126', // rouge — touches ponctuelles uniquement
        sand: '#FBF9F6', // fond chaleureux
        ink: '#1C1917', // texte principal
      },
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
