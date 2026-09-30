/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#14274E',
        ink: '#394867',
        mist: '#9BA4B4',
        canvas: '#F1F6F9',
        surface: '#FFFFFF',
        line: {
          DEFAULT: '#DCE3EC',
          strong: '#B9C2D0',
        },
        success: '#1E8449',
        warning: '#9A7B0A',
        danger: '#C0392B',
        info: '#21618C',
      },
      borderRadius: {
        card: '10px',
        panel: '14px',
        hero: '18px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(20, 39, 78, 0.06), 0 6px 18px rgba(20, 39, 78, 0.08)',
        md: '0 2px 6px rgba(20, 39, 78, 0.06), 0 16px 36px rgba(20, 39, 78, 0.11)',
        lg: '0 8px 24px rgba(20, 39, 78, 0.10), 0 28px 64px rgba(20, 39, 78, 0.16)',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
