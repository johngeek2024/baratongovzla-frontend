import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/**/*.{html,ts}', // Analiza todos los archivos de la app en busca de clases de utilidad
  ],
  theme: {
    extend: {
      // Paleta de colores centralizada para BaratongoVzla
      colors: {
        'primary-accent': 'hsl(200, 100%, 50%)', // #00A9FF
        'primary-accent-darker': 'hsl(200, 100%, 45%)',
        'secondary-accent': 'hsl(45, 100%, 57%)', // #FFD724
        'dark-bg': 'hsl(225, 27%, 8%)', // #0D1017
        'dark-bg-secondary': 'hsl(222, 47%, 11%)', // #111827
        'text-primary': 'hsl(220, 13%, 91%)', // #E5E7EB
        'text-secondary': 'hsl(215, 9%, 65%)', // #9CA3AF
        'text-on-dark': 'hsl(220, 14%, 80%)', // #C8CDD5
        'border-color': 'hsl(215, 16%, 27%)', // #374151
      },
      // Tipografías base del proyecto
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Sora', 'sans-serif'],
      },
      // Keyframes para animaciones personalizadas
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulse: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(0, 169, 255, 0.5)',
          },
          '70%': {
            boxShadow: '0 0 0 15px rgba(0, 169, 255, 0)',
          },
        },
      },
      // Declaración de animaciones para ser usadas como clases de utilidad
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Sombras personalizadas
      boxShadow: {
        'neon-primary': '0 0 15px 0 hsl(200, 100%, 50%, 0.6)',
      },
    },
  },
  plugins: [
    // Plugin para crear variantes personalizadas, como 'is-active'
    plugin(function ({ addVariant }) {
      addVariant('is-active', '&.is-active');
    }),
  ],
};

export default config;
