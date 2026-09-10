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
        // Remplace text-ink/40, /50 et /60 : ces opacités mesurent
        // respectivement 2,52:1, 3,35:1 et 4,58:1 sur fond blanc — les deux
        // premières sous le seuil WCAG de 4,5:1, la troisième le franchit de
        // justesse. #57534E est une couleur opaque, testée à 7,64:1 sur
        // blanc (rapport_gandall.md, audit accessibilité).
        'ink-muted': '#57534E',
      },
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Accent manuscrit (tagline accueil uniquement) — voir layout.tsx.
        hand: ['var(--font-hand)', 'cursive'],
      },
    },
  },
  plugins: [],
};
