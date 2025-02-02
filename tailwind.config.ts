import type { Config } from 'tailwindcss'

export default {
  content: ['./{app,components}/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'primary': 'hsl(var(--primary) / <alpha-value>)',
        'background': 'hsl(var(--background) / <alpha-value>)',
        'on-background': 'hsl(var(--on-background) / <alpha-value>)',
        'outline': 'hsl(var(--outline) / <alpha-value>)',
        'error': 'hsl(var(--error) / <alpha-value>)',
        'on-error': 'hsl(var(--on-error) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config
