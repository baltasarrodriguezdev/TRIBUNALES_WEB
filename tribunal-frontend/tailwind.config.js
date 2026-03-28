/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          active: '#1e40af',
        },
        primary: {
          DEFAULT: '#1e40af',
          light: '#3b82f6',
          lighter: '#60a5fa',
          dark: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f8fafc',
          hover: '#f1f5f9',
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
        success: {
          DEFAULT: '#059669',
          light: '#10b981',
          bg: '#d1fae5',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#f59e0b',
          bg: '#fef3c7',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          bg: '#fee2e2',
        },
        info: {
          DEFAULT: '#0284c7',
          light: '#0ea5e9',
          bg: '#e0f2fe',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
      },
    },
  },
  plugins: [],
}
