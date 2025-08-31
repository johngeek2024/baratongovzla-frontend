import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/**/*.html',
    './src/**/*.ts',
  ],
  theme: {
    extend: {
      aspectRatio: {
        '3/2': '3 / 2',
      },
      colors: {
        'primary-accent': 'hsl(var(--color-primary-accent) / <alpha-value>)',
        'primary-accent-darker': 'hsl(var(--color-primary-accent-darker) / <alpha-value>)',
        'secondary-accent': 'hsl(var(--color-secondary-accent) / <alpha-value>)',
        'dark-bg': 'hsl(var(--color-dark-bg) / <alpha-value>)',
        'dark-bg-secondary': 'hsl(var(--color-dark-bg-secondary) / <alpha-value>)',
        'dark-bg-tertiary': 'hsl(var(--color-dark-bg-tertiary) / <alpha-value>)',
        'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--color-text-secondary) / <alpha-value>)',
        'text-on-dark': 'hsl(var(--color-text-on-dark) / <alpha-value>)',
        'border-color': 'hsl(var(--color-border) / <alpha-value>)',
        'flash-accent': '#ff3b3b',
        'success': 'hsl(var(--color-success) / <alpha-value>)',
        'warning': 'hsl(var(--color-warning) / <alpha-value>)',
        'danger': 'hsl(var(--color-danger) / <alpha-value>)',
        'badge-new': '#0ea5e9',
        'badge-exclusive': '#8b5cf6',
        'badge-offer': '#ef4444',
        'profit': 'hsl(var(--color-profit) / <alpha-value>)',
        'dark-surface-1': 'hsl(var(--color-dark-surface-1) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Sora', {
          fontVariationSettings: '"wght" 700',
        }],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--color-primary-accent) / 0.5)' },
          '70%': { boxShadow: '0 0 0 15px hsl(var(--color-primary-accent) / 0)' },
        },
        drive: {
          '0%, 100%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
        },
        'button-close-effect': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drive': 'drive 1.5s ease-in-out infinite',
        'button-close': 'button-close-effect 0.4s ease-in-out',
      },
      boxShadow: {
        // ✅ INICIO: CORRECCIÓN QUIRÚRGICA DEL EFECTO NEÓN
        'neon-primary': '0 0 10px hsl(var(--color-primary-accent) / 0.7), 0 0 25px hsl(var(--color-primary-accent) / 0.5)',
        'neon-secondary': '0 0 10px hsl(var(--color-secondary-accent) / 0.7), 0 0 25px hsl(var(--color-secondary-accent) / 0.5)',
        // ✅ FIN: CORRECCIÓN QUIRÚRGICA
      },
      textShadow: {
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.5)',
        md: '0 2px 10px rgba(0, 0, 0, 0.5)',
        lg: '0 4px 12px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'select-arrow': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant, matchUtilities, theme }) {
      addVariant('is-active', '&.is-active');
      addVariant('open', '&.open');
      addVariant('active', '&.active');

      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      );
    }),
    require('tailwindcss-animate'),
  ],
};

export default config;
