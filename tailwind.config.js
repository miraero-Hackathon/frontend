// Tailwind CSS 설정: 브랜드 primary 컬러 및 콘텐츠 경로
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', 'sans-serif'],
      },
      colors: {
        primary: '#0066FF',
        accent: '#D3E5FF',
        'accent-light': '#EAF2FF',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 320ms ease-out both',
        'fade-in': 'fade-in 320ms ease-out both',
      },
    },
  },
  plugins: [],
}
