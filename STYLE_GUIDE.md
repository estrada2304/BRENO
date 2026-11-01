# BRENO · Guía visual Glassy-Skeu Hybrid

## Dirección visual

BRENO se presenta como un panel de instrumentos de estudio: una consola oscura y flotante, con vidrio frío, biseles físicos y luces de estado legibles. El fondo da profundidad a los módulos y el brillo sirve para indicar jerarquía o actividad, no para decorar cada elemento.

## Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `canvas` | `#050A12` | Base oscura de la aplicación |
| `midnight` | `#07152A` | Azul profundo del gradiente |
| `teal-night` | `#061418` | Cian tenue del extremo del fondo |
| `surface` | `#0E1925` | Superficie oscura de paneles |
| `surface-raised` | `#132231` | Elementos elevados y controles |
| `text` | `#E6F2F8` | Texto principal |
| `soft` | `#B5C8D4` | Texto secundario destacado |
| `muted` | `#8295A4` | Etiquetas y metadatos |
| `line` | `#BCE2F2` | Color de referencia para bordes de baja opacidad |
| `cyan` | `#69D8FF` | LED cian, foco y actividad |
| `mint` | `#75FFD3` | Acción principal y estado activo |
| `turquoise` | `#44CBB9` | Degradado de control principal |
| `violet` | `#A9C9FF` | Fase Backend y datos auxiliares |
| `magenta` | `#F1A7D7` | Fase Frontend |
| `amber` | `#FFC27A` | Pendiente y fase de Diseño |
| `alert` | `#FF858D` | Error o alerta |

**Asignación de LEDs:** activo = verde menta; pendiente = ámbar; alerta = rojo. Las fases del Gantt usan Diseño cian, Backend violeta, Frontend magenta y QA verde neón. Cada LED combina un núcleo claro con halo del color correspondiente.

## Escala de blur

| Nivel | Blur | Aplicación |
| --- | ---: | --- |
| `glass-v5` | `14px` | Tarjetas de datos, filas elevadas, tablas y contenido secundario |
| `glass-v18` | `28px` | Sidebar, calendario, chat y capas de navegación principales |
| `hud` | `32px` | Backdrop o superficie flotante sobre otra vista |

Mantener la saturación moderada (`130–150%`) para que el fondo se refracte sin perder contraste. Añadir prefijos `-webkit-backdrop-filter` cuando se escriba CSS manual.

## Sombras skeuomórficas

Todas las sombras combinan profundidad externa con reflejo y sombra interna. Evitar sombras genéricas sin componente inset.

**Marco Glassy V5:**

```css
box-shadow:
  0 16px 38px rgba(0, 0, 0, .28),
  inset 0 1px 0 rgba(255, 255, 255, .18),
  inset 0 -1px 0 rgba(0, 0, 0, .58),
  inset 0 0 24px rgba(106, 204, 241, .04);
```

**Marco Glassy V18:**

```css
box-shadow:
  0 18px 40px rgba(0, 0, 0, .38),
  inset 0 1px 0 rgba(255, 255, 255, .23),
  inset 0 -2px 0 rgba(0, 0, 0, .58),
  inset 0 0 30px rgba(89, 201, 227, .07);
```

**Botón elevado:** usar sombra externa oscura, brillo inset superior y canto inferior sombreado. **Botón hundido:** reducir la sombra exterior y profundizar el inset inferior para que el control parezca entrar en su carcasa.

## Gradientes de borde para cristal

Aplicar el borde como una capa independiente con `background-clip: padding-box, border-box` o pseudo-elemento:

```css
/* Cristal normal */
linear-gradient(145deg,
  rgba(230, 250, 255, .32),
  rgba(161, 212, 235, .09) 42%,
  rgba(30, 73, 94, .44))

/* Foco o selección */
linear-gradient(145deg,
  rgba(117, 255, 211, .62),
  rgba(105, 216, 255, .18) 48%,
  rgba(40, 125, 153, .48))
```

El canto superior debe recibir más luz que el inferior. Mantener un segundo borde interno fino (`inset 0 1px`) para dar sensación de cristal pulido.

## Botones y estados

- **Reposo:** gradiente vertical de reflejo blanco a sombra oscura sobre el color de acción; sombra elevada de dos o tres capas.
- **Hover:** elevar el brillo y el halo de color con suavidad; no cambiar de forma ni aumentar el contraste de golpe.
- **Active/pressed:** `transform: translateY(1px)` y sombra inset más profunda; la luz superior se reduce.
- **Focus-visible:** contorno cian o menta de 1px con separación de 2px. Mantener visible en teclado.
- Transición recomendada: `130–180ms ease-out` para presión y `180–220ms ease` para hover.

## Noise y reflejos

Aplicar una textura fractal monocromática a **3–5% de opacidad** sobre el vidrio (`3.5%` para V5 y `4%` para V18). El ruido va en una capa `pointer-events: none`, con `mix-blend-mode: screen` o `soft-light`; no debe reducir la legibilidad ni simular grano fuerte.

## Movimiento HUD

- Fondo: gradiente azul profundo → negro → cian tenue, con deriva lenta de `30s`, `ease-in-out`, y desplazamiento de baja amplitud.
- Línea de escaneo: cian translúcido, de `1–2px`, opacidad inferior a `0.6`, recorrido vertical de `11s` y sin bloquear interacción.
- Reducir o detener ambas animaciones bajo `prefers-reduced-motion: reduce`.
- Reservar el pulso para un estado activo o un punto focal; no animar todos los indicadores al mismo tiempo.

## Recetas Tailwind

- Tarjeta V5: `backdrop-blur-glass-v5 bg-white/5 border border-white/10 shadow-glass-v5`.
- Capa V18: `backdrop-blur-glass-v18 bg-white/10 border border-white/20 shadow-glass-v18`.
- Botón físico: `bg-button-bevel shadow-button-raised active:translate-y-px active:shadow-button-pressed`.
- LED: `rounded-full bg-led-core shadow-led-cyan` (cambiar el color del halo según estado).
- Fondo HUD animado: `bg-hud-background animate-background-drift`.

Las recetas son punto de partida; mantener siempre contraste suficiente para texto y controles.
