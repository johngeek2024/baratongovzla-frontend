import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      // =================================================================
      // PALETA DE COLORES ACTUALIZADA SEGÚN TUS ESPECIFICACIONES
      // =================================================================
      colors: {
        'primary-accent': '#0055ff',
        'primary-accent-darker': '#003bda',
        'secondary-accent': '#ffd724',
        'dark-bg': '#111827',
        'dark-bg-secondary': '#1F2937', // Mapeado de --color-surface-dark
        'text-primary': '#1F2937',      // Color para texto principal sobre fondo claro
        'text-secondary': '#6B7280',    // Color para texto secundario sobre fondo claro
        'text-on-dark': '#E5E7EB',      // Color para texto sobre fondo oscuro
        'border-color': '#E5E7EB',      // Mapeado de --color-border
        'flash-accent': '#ff3b3b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Sora', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 169, 255, 0.5)' },
          '70%': { boxShadow: '0 0 0 15px rgba(0, 169, 255, 0)' },
        },
        drive: {
          '0%, 100%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drive': 'drive 1.5s ease-in-out infinite',
      },
      boxShadow: {
        'neon-primary': '0 0 5px theme(colors.primary-accent), 0 0 20px theme(colors.primary-accent)',
        'neon-secondary': '0 0 5px theme(colors.secondary-accent), 0 0 20px theme(colors.secondary-accent)',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('is-active', '&.is-active');
    }),
  ],
};

export default config;
