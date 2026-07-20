import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',
          soft: 'rgb(var(--color-paper-soft) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
        line: 'rgb(var(--color-line) / <alpha-value>)',
        forest: 'rgb(var(--color-forest) / <alpha-value>)',
        bronze: 'rgb(var(--color-bronze) / <alpha-value>)',
        terracotta: 'rgb(var(--color-terracotta) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"EB Garamond"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"EB Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      maxWidth: {
        measure: '700px',
      },
      transitionTimingFunction: {
        quiet: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.10)',
        lift: '0 2px 6px rgb(0 0 0 / 0.05), 0 16px 40px -16px rgb(0 0 0 / 0.16)',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -2%)' },
          '30%': { transform: 'translate(2%, 1%)' },
          '50%': { transform: 'translate(-2%, 2%)' },
          '70%': { transform: 'translate(1%, -1%)' },
          '90%': { transform: 'translate(-1%, 1%)' },
        },
      },
      animation: {
        grain: 'grain 8s steps(10) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
