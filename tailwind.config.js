/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#111827',
        'surface-dark': '#1F2937',
        'primary-accent': '#0055ff',
        'primary-accent-darker': '#003bda',
        'secondary-accent': '#ffd724',
        'flash-accent': '#ff3b3b',
        'text-on-dark': '#E5E7EB',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        'neon-primary': '0 0 25px rgba(0, 85, 255, 0.6)',
        'neon-secondary': '0 0 25px rgba(255, 215, 36, 0.5)',
      },
      // AÑADIMOS ESTA SECCIÓN PARA LA ANIMACIÓN
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
