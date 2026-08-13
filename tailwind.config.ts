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
        // Custom 7-Color Palette
        palette: {
          dark: '#252525',    // 1. Dark Charcoal (Background surface)
          light: '#CFCFCF',   // 2. Light Silver (Primary text & headers)
          slate: '#7D7D7D',   // 3. Medium Gray (Subtitles & muted elements)
          charcoal: '#545454',// 4. Dark Slate (Cards, borders & inputs)
          steel: '#5379AE',   // 5. Steel Blue (Soft accent badges & highlights)
          ocean: '#0474C4',   // 6. Ocean Blue (Primary CTA buttons & active states)
          navy: '#06457F',    // 7. Deep Navy (Dark card headers & gradients)
        },
        // Override standard colors to conform to the 7-color palette
        black: '#252525',
        zinc: {
          950: '#252525',
          900: '#333333',
          800: '#545454',
          700: '#545454',
          600: '#7D7D7D',
          500: '#7D7D7D',
          400: '#7D7D7D',
          300: '#CFCFCF',
          200: '#CFCFCF',
          100: '#FFFFFF',
        },
        indigo: {
          50: '#eef6ff',
          100: '#d9eaff',
          400: '#5379AE',
          500: '#0474C4',
          600: '#0474C4',
          700: '#06457F',
          800: '#06457F',
          900: '#06457F',
          950: '#06457F',
        },
        cyan: {
          400: '#5379AE',
          500: '#0474C4',
          600: '#0474C4',
          700: '#06457F',
          950: '#06457F',
        },
        purple: {
          400: '#5379AE',
          500: '#5379AE',
          600: '#06457F',
          950: '#06457F',
        },
        emerald: {
          400: '#5379AE',
          500: '#0474C4',
          600: '#0474C4',
          950: '#06457F',
        },
        focus: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#0474C4',
          600: '#0474C4',
          700: '#06457F',
        },
        shortBreak: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#5379AE',
          600: '#5379AE',
          700: '#06457F',
        },
        longBreak: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#06457F',
          600: '#06457F',
          700: '#252525',
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
