/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./popup/**/*.html",
    "./sidepanel/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        critical: '#DC2626',
        warning: '#D97706',
        success: '#16A34A',
        tealAccent: '#0D9488'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Space Mono', 'Consolas', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
