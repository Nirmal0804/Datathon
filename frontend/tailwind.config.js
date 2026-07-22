/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        background: '#020617',   // slate-950
        surface:    '#0f172a',   // slate-900
        'surface-2': '#1e293b', // slate-800
        'surface-3': '#334155', // slate-700
        // Brand
        primary:       '#4f46e5', // indigo-600
        'primary-hover':'#4338ca', // indigo-700
        'primary-muted':'#312e81', // indigo-900
        // Semantic
        success:  '#10b981',
        warning:  '#f59e0b',
        danger:   '#ef4444',
        info:     '#3b82f6',
        // Text
        'text-primary':   '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted':     '#475569',
        // Borders
        border:       '#1e293b',
        'border-subtle': '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
        'glow-primary': '0 0 20px rgba(79,70,229,0.25)',
        'glow-danger':  '0 0 20px rgba(239,68,68,0.25)',
        'glow-success': '0 0 20px rgba(16,185,129,0.25)',
        'inset-top': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        'card': '0.75rem',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
}
