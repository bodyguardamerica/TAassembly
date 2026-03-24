import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#1C1A18',
        surface: '#272320',
        border:  '#3D3530',
        tan:     '#B89878',
        brown:   '#5C2A08',
        steel:   '#C0BDB8',
        text:    '#F0EDE8',
        muted:   '#8A8078',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body:    ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
