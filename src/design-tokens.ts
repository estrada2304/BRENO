/** Tokens compartidos para la interfaz Glassy-Skeu Hybrid de BRENO. */
export const designTokens = {
  color: {
    canvas: '#050A12',
    midnight: '#07152A',
    tealNight: '#061418',
    surface: '#0E1925',
    surfaceRaised: '#132231',
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
  glass: {
    v5: {
      background: 'rgba(225, 244, 255, 0.055)',
      border: 'rgba(208, 236, 250, 0.17)',
      blur: '14px',
      noiseOpacity: 0.035,
    },
    v18: {
      background: 'rgba(156, 213, 239, 0.105)',
      border: 'rgba(168, 226, 245, 0.23)',
      blur: '28px',
      noiseOpacity: 0.04,
    },
  },
  shadow: {
    panel: '0 16px 38px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 rgba(0, 0, 0, 0.58), inset 0 0 24px rgba(106, 204, 241, 0.04)',
    panelStrong: '0 18px 40px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.23), inset 0 -2px 0 rgba(0, 0, 0, 0.58), inset 0 0 30px rgba(89, 201, 227, 0.07)',
    buttonRaised: '0 6px 15px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.72), inset 0 -2px 3px rgba(5, 59, 72, 0.46)',
    buttonPressed: '0 2px 5px rgba(0, 0, 0, 0.43), inset 0 3px 6px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  },
  gradient: {
    background: 'radial-gradient(ellipse at 4% 0%, rgba(27, 111, 178, 0.25), transparent 38%), radial-gradient(ellipse at 89% 84%, rgba(17, 182, 192, 0.11), transparent 35%), linear-gradient(133deg, #07152A 0%, #050A12 54%, #061418 100%)',
    button: 'linear-gradient(180deg, rgba(255, 255, 255, 0.31), rgba(0, 0, 0, 0.18)), linear-gradient(135deg, #72F6D2, #44CBBB 60%, #1B829D)',
    glassBorder: 'linear-gradient(145deg, rgba(230, 250, 255, 0.32), rgba(161, 212, 235, 0.09) 42%, rgba(30, 73, 94, 0.44))',
    activeGlassBorder: 'linear-gradient(145deg, rgba(117, 255, 211, 0.62), rgba(105, 216, 255, 0.18) 48%, rgba(40, 125, 153, 0.48))',
  },
  led: {
    cyan: { color: '#69D8FF', glow: '0 0 8px 2px rgba(0, 255, 220, 0.58)' },
    green: { color: '#75FFD3', glow: '0 0 8px 2px rgba(0, 255, 180, 0.52)' },
    amber: { color: '#FFC27A', glow: '0 0 8px 2px rgba(255, 184, 62, 0.58)' },
    red: { color: '#FF858D', glow: '0 0 8px 2px rgba(255, 65, 91, 0.58)' },
  },
  motion: {
    backgroundDuration: '30s',
    scanLineDuration: '11s',
    easing: 'ease-in-out',
  },
} as const

export type DesignTokens = typeof designTokens
