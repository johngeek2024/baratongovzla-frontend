/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0D1017', // <-- Tono de azul más oscuro del PLP
        'dark-bg-secondary': '#111827',
        'primary-accent': '#00A9FF', // <-- Nuevo azul primario del PLP
        'primary-accent-darker': '#0077B3',
        'secondary-accent': '#ffd724',
        'flash-accent': '#ff3b3b',
        'text-primary': '#E5E7EB',
        'text-on-dark': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'border-color': '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        'neon-primary': '0 0 25px rgba(0, 169, 255, 0.4)', // <-- Sombra ajustada al nuevo azul
        'neon-secondary': '0 0 25px rgba(255, 215, 36, 0.5)',
      },
      animation: {
        'drive': 'drive 2s ease-in-out infinite',
      },
      keyframes: {
        drive: {
          '0%, 100%': { transform: 'translateX(-10px)' },
          '50%': { transform: 'translateX(10px)' },
        }
      }
    },
  },
  plugins: [],
};
