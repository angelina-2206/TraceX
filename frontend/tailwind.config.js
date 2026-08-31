/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#090d16',
          900: '#0f172a',
          850: '#131e32',
          800: '#1e293b',
          700: '#334155',
        },
        forensic: {
          green: '#10b981',   // Verified / Pass
          amber: '#f59e0b',   // Suspicious / Warning
          red: '#ef4444',     // Critical / High Risk
          cyan: '#06b6d4',    // Technical Hops / Nodes
          purple: '#a855f7',  // Uncertainty / Inferences
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
