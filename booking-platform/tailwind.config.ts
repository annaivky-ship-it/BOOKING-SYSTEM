import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
        },
        magenta: {
          50: '#fef2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f8b4e6',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
      },
      backgroundImage: {
        'gradient-magenta': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      },
      boxShadow: {
        'magenta-glow': '0 0 20px rgba(236, 72, 153, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
