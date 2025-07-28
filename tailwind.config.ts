import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // =================================================================
        // CORRECCIÓN: Se usa la sintaxis HSL con <alpha-value> para
        // compatibilidad con TypeScript y opacidad.
        // =================================================================
        'primary-accent': 'hsl(var(--color-primary-accent) / <alpha-value>)',
        'primary-accent-darker': 'hsl(var(--color-primary-accent-darker) / <alpha-value>)',
        'secondary-accent': 'hsl(var(--color-secondary-accent) / <alpha-value>)',
        'dark-bg': 'hsl(var(--color-dark-bg) / <alpha-value>)',
        'dark-bg-secondary': 'hsl(var(--color-dark-bg-secondary) / <alpha-value>)',
        'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--color-text-secondary) / <alpha-value>)',
        'text-on-dark': '#E5E7EB',
        'border-color': 'hsl(var(--color-border) / <alpha-value>)',
        'flash-accent': '#ff3b3b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Sora', 'sans-serif'],
      },
      // Keyframes y Animation se mantienen igual...
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(var(--color-primary-accent-glow), 0.5)' },
          '70%': { boxShadow: '0 0 0 15px rgba(var(--color-primary-accent-glow), 0)' },
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
        'neon-primary': '0 0 8px hsl(var(--color-primary-accent)), 0 0 20px hsl(var(--color-primary-accent))',
        'neon-secondary': '0 0 8px hsl(var(--color-secondary-accent)), 0 0 20px hsl(var(--color-secondary-accent))',
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
