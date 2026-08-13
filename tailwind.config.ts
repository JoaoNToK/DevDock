import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme variables mapping
        devdock: {
          bg: 'var(--background)',
          surface: 'var(--surface)',
          card: 'var(--card)',
          elevated: 'var(--card-elevated)',
          border: 'var(--border)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        // Override standard colors to adapt dynamically to the theme
        black: 'var(--background)',
        zinc: {
          950: 'var(--background)',
          900: 'var(--surface)',
          800: 'var(--card)',
          700: 'var(--card-elevated)',
          600: 'var(--text-tertiary)',
          500: 'var(--text-tertiary)',
          400: 'var(--text-secondary)',
          300: 'var(--text-secondary)',
          200: 'var(--text-primary)',
          100: 'var(--text-primary)',
        },
        // Override color accents to monochrome design
        indigo: {
          50: 'var(--card-elevated)',
          100: 'var(--card-elevated)',
          400: 'var(--text-secondary)',
          500: 'var(--text-primary)',
          600: 'var(--text-primary)',
          700: 'var(--card-elevated)',
          800: 'var(--card)',
          900: 'var(--surface)',
          950: 'var(--surface)',
        },
        cyan: {
          400: 'var(--text-secondary)',
          500: 'var(--text-primary)',
          600: 'var(--text-primary)',
          700: 'var(--card-elevated)',
          950: 'var(--surface)',
        },
        purple: {
          400: 'var(--text-secondary)',
          500: 'var(--text-primary)',
          600: 'var(--card-elevated)',
          950: 'var(--surface)',
        },
        emerald: {
          400: 'var(--text-secondary)',
          500: 'var(--text-primary)',
          600: 'var(--text-primary)',
          950: 'var(--surface)',
        },
        focus: {
          50: 'var(--card-elevated)',
          100: 'var(--card-elevated)',
          500: 'var(--text-primary)',
          600: 'var(--text-primary)',
          700: 'var(--card-elevated)',
        },
        shortBreak: {
          50: 'var(--card-elevated)',
          100: 'var(--card-elevated)',
          500: 'var(--text-secondary)',
          600: 'var(--text-secondary)',
          700: 'var(--card-elevated)',
        },
        longBreak: {
          50: 'var(--card-elevated)',
          100: 'var(--card-elevated)',
          500: 'var(--text-tertiary)',
          600: 'var(--text-tertiary)',
          700: 'var(--background)',
        },
      },
      fontFamily: {
        sans: ['var(--font-cabin)', 'Cabin', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ring-bounce': 'ringBounce 0.5s ease-in-out',
      },
      keyframes: {
        ringBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
