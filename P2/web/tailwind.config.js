/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0A7B4B', // vert Gandal (inspiré du drapeau guinéen)
          dark: '#065f39',
          light: '#e6f5ee',
        },
        accent: '#F5B700', // jaune
        flag: '#CE1126', // rouge — touches ponctuelles uniquement
        sand: '#FBF7EE', // fond chaleureux
        ink: '#14201B', // texte principal
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
