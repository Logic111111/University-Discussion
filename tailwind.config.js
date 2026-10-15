/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050608',
          900: '#090A0F',
          850: '#0E1118',
          800: '#141824',
          700: '#1C2233',
          600: '#2A334B',
        },
        cyber: {
          cyan: '#00F0FF',
          'cyan-dim': 'rgba(0, 240, 255, 0.15)',
          amber: '#FFB800',
          'amber-dim': 'rgba(255, 184, 0, 0.15)',
          emerald: '#10B981',
          'emerald-dim': 'rgba(16, 185, 129, 0.15)',
          purple: '#A855F7',
          pink: '#EC4899',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'blueprint-grid': "radial-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px)",
        'dot-matrix': "radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)",
        'cyber-gradient': 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(9, 10, 15, 0.95) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
