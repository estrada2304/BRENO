/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        breno: {
          canvas: '#050A12',
          midnight: '#07152A',
          'teal-night': '#061418',
          surface: '#0E1925',
          'surface-raised': '#132231',
          line: '#BCE2F2',
          text: '#E6F2F8',
          soft: '#B5C8D4',
          muted: '#8295A4',
          cyan: '#69D8FF',
          mint: '#75FFD3',
          turquoise: '#44CBB9',
          violet: '#A9C9FF',
          magenta: '#F1A7D7',
          amber: '#FFC27A',
          alert: '#FF858D',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'glass-v5': '0 16px 38px rgb(0 0 0 / 28%), inset 0 1px 0 rgb(255 255 255 / 18%), inset 0 -1px 0 rgb(0 0 0 / 58%), inset 0 0 24px rgb(106 204 241 / 4%)',
        'glass-v18': '0 18px 40px rgb(0 0 0 / 38%), inset 0 1px 0 rgb(255 255 255 / 23%), inset 0 -2px 0 rgb(0 0 0 / 58%), inset 0 0 30px rgb(89 201 227 / 7%)',
        'button-raised': '0 6px 15px rgb(0 0 0 / 38%), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 3px rgb(5 59 72 / 46%)',
        'button-pressed': '0 2px 5px rgb(0 0 0 / 43%), inset 0 3px 6px rgb(0 0 0 / 42%), inset 0 1px 0 rgb(255 255 255 / 8%)',
        'led-cyan': '0 0 8px 2px rgb(0 255 220 / 58%), inset 0 1px 2px rgb(255 255 255 / 90%)',
        'led-green': '0 0 8px 2px rgb(0 255 180 / 52%), inset 0 1px 2px rgb(255 255 255 / 90%)',
        'led-amber': '0 0 8px 2px rgb(255 184 62 / 58%), inset 0 1px 2px rgb(255 255 255 / 82%)',
        'led-red': '0 0 8px 2px rgb(255 65 91 / 58%), inset 0 1px 2px rgb(255 255 255 / 82%)',
        'text-glow': '0 1px 14px rgb(100 214 238 / 11%)',
      },
      backgroundImage: {
        'hud-background': 'radial-gradient(ellipse at 4% 0%, rgb(27 111 178 / 25%), transparent 38%), radial-gradient(ellipse at 89% 84%, rgb(17 182 192 / 11%), transparent 35%), linear-gradient(133deg, #07152A 0%, #050A12 54%, #061418 100%)',
        'glass-v5': 'linear-gradient(147deg, rgb(218 241 255 / 7.5%), rgb(85 138 166 / 3.5%) 38%, rgb(4 13 22 / 46%))',
        'glass-v18': 'linear-gradient(152deg, rgb(38 81 105 / 44%), rgb(7 20 31 / 79%) 55%, rgb(18 51 61 / 55%))',
        'button-bevel': 'linear-gradient(180deg, rgb(255 255 255 / 31%), rgb(0 0 0 / 18%)), linear-gradient(135deg, #72F6D2, #44CBBB 60%, #1B829D)',
        'glass-border': 'linear-gradient(145deg, rgb(230 250 255 / 32%), rgb(161 212 235 / 9%) 42%, rgb(30 73 94 / 44%))',
        'glass-border-active': 'linear-gradient(145deg, rgb(117 255 211 / 62%), rgb(105 216 255 / 18%) 48%, rgb(40 125 153 / 48%))',
        'led-core': 'radial-gradient(circle at 35% 28%, #F4FFFC 0 12%, #78FFDA 28%, #20C99E 72%)',
      },
      backdropBlur: {
        'glass-v5': '14px',
        'glass-v18': '28px',
        'hud': '32px',
      },
      keyframes: {
        'background-drift': {
          from: { transform: 'translate3d(-1.2%, 0, 0) scale(1)' },
          to: { transform: 'translate3d(1.2%, 1%, 0) scale(1.04)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '5%': { opacity: '.6' },
          '86%': { opacity: '.48' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        'background-drift': 'background-drift 30s ease-in-out infinite alternate',
        'scan-line': 'scan-line 11s linear infinite',
      },
    },
  },
}
