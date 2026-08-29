/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Karnataka State Police Palette
        'police-navy': '#153E75',
        'police-blue': '#2B5FB8',
        'police-gold': '#C79A2B',
        'police-gold-light': '#FDF8EC',
        'police-success': '#2E8B57',
        'police-alert': '#C0392B',
        'police-bg': '#F8F9FB',
        'police-surface': '#FFFFFF',
        'police-border': '#E6E8EC',
        'police-text-primary': '#111827',
        'police-text-secondary': '#6B7280',

        // Core backgrounds
        background: '#020617',   // slate-950
        surface: '#0f172a',   // slate-900
        'surface-2': '#1e293b', // slate-800
        'surface-3': '#334155', // slate-700
        // Brand
        primary: '#153E75', // KSP Primary Navy
        'primary-hover': '#0F2D56',
        'primary-muted': '#1E4B8A',
        // Semantic
        success: '#2E8B57',
        warning: '#C79A2B',
        danger: '#C0392B',
        info: '#2B5FB8',
        // Text
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        // Borders
        border: '#E6E8EC',
        'border-subtle': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
        'glow-primary': '0 0 20px rgba(79,70,229,0.25)',
        'glow-danger': '0 0 20px rgba(239,68,68,0.25)',
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
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
}
