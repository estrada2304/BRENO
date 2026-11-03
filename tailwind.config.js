/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        breno: {
          canvas: '#E2E9E3',
          sage: '#DCE5DF',
          'sage-deep': '#718F82',
          surface: '#F4F2E8',
          'surface-raised': '#EAF0E9',
          line: '#D4DDD5',
          text: '#35433C',
          soft: '#5C6D63',
          muted: '#7E8C82',
          terracotta: '#B97856',
          'clay-light': '#D49970',
          cyan: '#7B9E99',
          mint: '#79968A',
          turquoise: '#AFC5B1',
          violet: '#A68170',
          magenta: '#C78379',
          amber: '#C98762',
          alert: '#BA665C',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'glass-v5': '9px 12px 26px rgb(59 79 64 / 10%), 2px 3px 6px rgb(59 79 64 / 4.5%), inset 2px 2px 4px rgb(255 255 255 / 96%), inset -2px -2px 5px rgb(117 140 122 / 12%)',
        'glass-v18': '12px 16px 32px rgb(51 74 57 / 20%), inset 2px 2px 4px rgb(255 255 255 / 96%), inset -2px -2px 5px rgb(117 140 122 / 14%)',
        'button-raised': '0 7px 13px rgb(149 95 65 / 16%), inset 0 1px rgb(255 255 255 / 60%), inset 0 -2px rgb(106 62 40 / 20%)',
        'button-pressed': '0 2px 5px rgb(95 70 51 / 14%), inset 0 3px 6px rgb(90 77 58 / 18%), inset 0 1px rgb(255 255 255 / 38%)',
        'led-cyan': '0 0 0 3px rgb(123 158 153 / 16%)',
        'led-green': '0 0 0 3px rgb(121 150 138 / 16%)',
        'led-amber': '0 0 0 3px rgb(201 135 98 / 16%)',
        'led-red': '0 0 0 3px rgb(186 102 92 / 16%)',
        'text-glow': '0 1px 2px rgb(255 255 255 / 72%)',
      },
      backgroundImage: {
        'hud-background': 'radial-gradient(ellipse at 8% 8%, rgb(250 249 239 / 92%), transparent 35%), radial-gradient(ellipse at 91% 9%, rgb(173 196 183 / 42%), transparent 34%), linear-gradient(140deg, #DCE5DF 0%, #E9EDE4 52%, #D9E3DC 100%)',
        'glass-v5': 'linear-gradient(145deg, rgb(247 245 236 / 84%), rgb(240 241 232 / 70%) 53%, rgb(231 237 229 / 85%))',
        'glass-v18': 'linear-gradient(145deg, rgb(240 243 233 / 97%), rgb(225 234 226 / 96%))',
        'button-bevel': 'linear-gradient(180deg, #D49970, #B97856)',
        'glass-border': 'linear-gradient(145deg, #FFFFFF, #D4DDD5 65%, #CAD7CC)',
        'glass-border-active': 'linear-gradient(145deg, #FFFFFF, #C5D7C9 48%, #BD815E)',
        'led-core': 'radial-gradient(circle at 35% 28%, #FFFFFF 0 12%, #AFC5B1 28%, #718F82 72%)',
      },
      backdropBlur: {
        'glass-v5': '12px',
        'glass-v18': '18px',
        'hud': '22px',
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

