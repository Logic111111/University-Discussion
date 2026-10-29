/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Engineering computation pad: green-grey paper, blue-black technical-pen ink.
        paper: { DEFAULT: '#F1F4EC', deep: '#E5EBDE', line: '#D5DFCD' },
        ink: { DEFAULT: '#16212B', 2: '#3E4B48', 3: '#5C6A64', rule: '#C3CEC0' },
        accent: { DEFAULT: '#E2500C', ink: '#B53C05', wash: '#FBE3D6' },
        ok: { DEFAULT: '#2E7650', wash: '#DCEBDD' },
        danger: { DEFAULT: '#A3261B', wash: '#F6DEDA' },
        // Instrument panels; channel colours follow bench-scope convention.
        scope: {
          bg: '#10171D',
          panel: '#172129',
          line: '#2A3742',
          text: '#D3DCE1',
          dim: '#8797A2',
          ch1: '#F2D40C',
          ch2: '#3CC6EE',
          ch3: '#E25CC7',
          ok: '#5BD18B',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Barlow Semi Condensed"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
