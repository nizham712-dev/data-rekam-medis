/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        frame: 'var(--frame)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        active: 'var(--active)',
        line: 'var(--border)',
        rule: 'var(--rule)',
        control: 'var(--control)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        positive: 'var(--positive)',
        negative: 'var(--negative)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        title: ['22px', { lineHeight: '28px', fontWeight: '600' }],
        section: ['16px', { lineHeight: '24px' }],
        kpi: ['28px', { lineHeight: '34px' }],
        body: ['14px', { lineHeight: '20px' }],
        small: ['12px', { lineHeight: '18px' }],
      },
      borderRadius: {
        sheet: '16px',
        card: '8px',
        control: '6px',
      },
      boxShadow: {
        sheet: 'none',
        float: '0 8px 24px rgba(16, 32, 30, 0.12)',
      },
    },
  },
  plugins: [],
};
