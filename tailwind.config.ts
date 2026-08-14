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
        // Dedicated Theme variables mapping
        theme: {
          bg: 'var(--bg-background)',
          surface: 'var(--bg-surface)',
          card: 'var(--bg-card)',
          elevated: 'var(--bg-card-elevated)',
          border: 'var(--border-color)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          btn: {
            primaryBg: 'var(--btn-primary-bg)',
            primaryText: 'var(--btn-primary-text)',
            secondaryBg: 'var(--btn-secondary-bg)',
            secondaryText: 'var(--btn-secondary-text)',
            secondaryBorder: 'var(--btn-secondary-border)',
          },
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
