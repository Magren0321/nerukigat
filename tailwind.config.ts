import { addDynamicIconSelectors } from '@iconify/tailwind';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        sm: '580px', // => @media (min-width: 580px) { ... }
      },
      colors: {
        bgColor: 'hsl(var(--theme-bg) / <alpha-value>)',
        textColor: 'hsl(var(--theme-text) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [typography, addDynamicIconSelectors()],
};
export default config;
