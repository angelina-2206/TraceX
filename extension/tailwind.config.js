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
        background: '#0A0A0A',
        card: '#121518',
        border: '#2A2E33',
        critical: '#E10600',
        warning: '#F59E0B',
        success: '#22C55E',
        cyanAccent: '#00D2BE'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Space Mono', 'Consolas', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
