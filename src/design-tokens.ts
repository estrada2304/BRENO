/** Tokens para la dirección de superficies escultóricas salvia, marfil y terracota de BRENO. */
export const designTokens = {
  color: {
    canvas: '#E2E9E3',
    sage: '#DCE5DF',
    sageDeep: '#718F82',
    surface: '#F4F2E8',
    surfaceRaised: '#EAF0E9',
    line: '#D4DDD5',
    text: '#35433C',
    soft: '#5C6D63',
    muted: '#7E8C82',
    terracotta: '#B97856',
    clayLight: '#D49970',
    mint: '#79968A',
    cyan: '#7B9E99',
    turquoise: '#AFC5B1',
    violet: '#A68170',
    magenta: '#C78379',
    amber: '#C98762',
    alert: '#BA665C',
  },
  surface: {
    card: 'linear-gradient(145deg, #F7F5EC 0%, #F0F1E8 53%, #E7EDE5 100%)',
    raised: 'linear-gradient(145deg, #EFF3E9, #DCE7DE)',
    sunken: 'linear-gradient(180deg, #E7ECE4, #F5F4E9)',
  },
  glass: {
    v5: { background: 'rgba(247, 246, 237, 0.84)', border: 'rgba(255, 255, 255, 0.94)', blur: '12px', noiseOpacity: 0.015 },
    v18: { background: 'rgba(232, 238, 229, 0.94)', border: 'rgba(255, 255, 255, 0.9)', blur: '18px', noiseOpacity: 0.02 },
  },
  shadow: {
    panel: '9px 12px 26px rgba(59, 79, 64, 0.1), 2px 3px 6px rgba(59, 79, 64, 0.045), inset 2px 2px 4px rgba(255, 255, 255, 0.96), inset -2px -2px 5px rgba(117, 140, 122, 0.12)',
    panelStrong: '12px 16px 32px rgba(51, 74, 57, 0.2), inset 2px 2px 4px rgba(255, 255, 255, 0.96), inset -2px -2px 5px rgba(117, 140, 122, 0.14)',
    buttonRaised: '0 7px 13px rgba(149, 95, 65, 0.16), inset 0 1px rgba(255, 255, 255, 0.6), inset 0 -2px rgba(106, 62, 40, 0.2)',
    buttonPressed: '0 2px 5px rgba(95, 70, 51, 0.14), inset 0 3px 6px rgba(90, 77, 58, 0.18), inset 0 1px rgba(255, 255, 255, 0.38)',
  },
  gradient: {
    background: 'radial-gradient(ellipse at 8% 8%, rgba(250, 249, 239, 0.92), transparent 35%), radial-gradient(ellipse at 91% 9%, rgba(173, 196, 183, 0.42), transparent 34%), linear-gradient(140deg, #DCE5DF 0%, #E9EDE4 52%, #D9E3DC 100%)',
    button: 'linear-gradient(180deg, #D49970, #B97856)',
    surfaceBorder: 'linear-gradient(145deg, #FFFFFF, #D4DDD5 65%, #CAD7CC)',
    activeSurfaceBorder: 'linear-gradient(145deg, #FFFFFF, #C5D7C9 48%, #BD815E)',
  },
  led: {
    cyan: { color: '#7B9E99', glow: '0 0 0 3px rgba(123, 158, 153, 0.16)' },
    green: { color: '#79968A', glow: '0 0 0 3px rgba(121, 150, 138, 0.16)' },
    amber: { color: '#C98762', glow: '0 0 0 3px rgba(201, 135, 98, 0.16)' },
    red: { color: '#BA665C', glow: '0 0 0 3px rgba(186, 102, 92, 0.16)' },
  },
  motion: { hoverDuration: '180ms', pressDuration: '140ms', easing: 'ease-out' },
} as const

export type DesignTokens = typeof designTokens

