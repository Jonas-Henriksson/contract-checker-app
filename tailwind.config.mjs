/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3ff',
          100: '#dde3f5',
          200: '#b8c4eb',
          300: '#8a9ddb',
          400: '#6478c4',
          500: '#4a5da8',
          600: '#3a4a87',
          700: '#2d3a6b',
          800: '#1e2749',
          900: '#141b33',
          950: '#0d1229',
        },
        gold: {
          50: '#fff9eb',
          100: '#ffefc6',
          200: '#ffdf88',
          300: '#ffcc4a',
          400: '#ffba20',
          500: '#f5b800',
          600: '#d97802',
          700: '#b45406',
          800: '#92410c',
          900: '#78360d',
          950: '#451a02',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
