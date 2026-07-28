/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        primaryHover: '#3730A3',
        secondary: '#0ea5e9',
        secondaryHover: '#0284c7',
        background: '#FAFAFC',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        textPrimary: 'var(--text-black)',
        textSecondary: 'var(--text-grey)',
        textCharcoal: 'var(--text-black)',
        success: '#10B981',
        successLight: '#EAFBF3',
        successBorder: '#D1F7E4',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        warningBorder: '#FDE68A',
        danger: '#EF4444',
        dangerLight: '#FEF2F2',
        dangerBorder: '#FEE2E2',
        
        // Retained legacy animation colors for compatibility
        animCharcoal: '#2D2D2D',
        animOrange: '#FF9B6B',
        animYellow: '#E8D754',
        socialIndigo: '#6C3FF5',
      },
      borderRadius: {
        'card-lg': '24px',
        'card-xl': '32px',
      },
      fontSize: {
        '4xs': '8px',
        '3xs': '9px',
        '2xs': '10px',
        '11px': '11px',
      }
    },
  },
  plugins: [],
}
