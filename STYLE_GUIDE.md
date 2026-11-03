# BRENO · Superficies escultóricas

## Dirección visual

BRENO usa una interfaz de operaciones cálida y táctil. Las tarjetas parecen piezas de cerámica mate sobre un fondo de salvia; el relieve nace de luces superiores suaves, sombras verdosas amplias y detalles de terracota. La referencia guía la personalidad visual, mientras la navegación, tablas y formularios conservan lectura rápida y controles familiares.

Evitar fondos negros, neón, cristal frío y sombras grises duras. Reservar terracota para acciones y puntos de atención; salvia para estructura, selección y estados tranquilos.

## Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `canvas` | `#E2E9E3` | Fondo general salvia |
| `sage` | `#DCE5DF` | Variación del gradiente de fondo |
| `sage-deep` | `#718F82` | Iconos y superficies verdes |
| `surface` | `#F4F2E8` | Marfil principal de paneles |
| `surface-raised` | `#EAF0E9` | Controles y tarjetas elevadas |
| `line` | `#D4DDD5` | Bordes sobre fondos claros |
| `text` | `#35433C` | Títulos y cifras principales |
| `soft` | `#5C6D63` | Texto secundario destacado |
| `muted` | `#7E8C82` | Ayuda y metadatos |
| `terracotta` | `#B97856` | Botón principal y acción activa |
| `clay-light` | `#D49970` | Luz superior de controles cálidos |
| `cyan` | `#7B9E99` | Datos informativos y LED suave |
| `violet` | `#A68170` | Datos auxiliares de tono arcilla |
| `magenta` | `#C78379` | Acento rosa cálido |
| `amber` | `#C98762` | Pendiente y atención |
| `alert` | `#BA665C` | Error o alerta |

El calendario usa verde salvia para diseño y reuniones normales, terracota para descubrimientos, y acentos moderados para fases. No codificar significado solo con color: acompañar con texto o icono.

## Materiales y sombras

El nivel de transparencia es bajo; la forma se percibe por gradientes mate y biseles, no por desenfoque fuerte.

| Nivel | Blur | Aplicación |
| --- | ---: | --- |
| `surface-v5` | `12px` | Tarjetas, filas, tablas y contenido secundario |
| `surface-v18` | `18px` | Sidebar, calendario y panel del agente |
| `overlay` | `22px` | Modal de perfil y capas sobre la aplicación |

**Tarjeta cerámica:**

```css
background: linear-gradient(145deg, #F7F5EC, #F0F1E8 53%, #E7EDE5);
border: 1px solid rgba(255, 255, 255, .94);
box-shadow:
  9px 12px 26px rgba(59, 79, 64, .10),
  2px 3px 6px rgba(59, 79, 64, .045),
  inset 2px 2px 4px rgba(255, 255, 255, .96),
  inset -2px -2px 5px rgba(117, 140, 122, .12);
```

**Control hundido:** usar gradiente de `#E7ECE4` a `#F5F4E9`, borde `#D9E0D7` y sombra inset verdosa tenue. No oscurecer el texto ni el placeholder.

**Botón de acción:**

```css
background: linear-gradient(180deg, #D49970, #B97856);
box-shadow: 0 7px 13px rgba(149, 95, 65, .16),
  inset 0 1px rgba(255, 255, 255, .6),
  inset 0 -2px rgba(106, 62, 40, .2);
```

## Bordes y formas

Usar radios entre `12px` y `20px` en paneles; controles pequeños entre `8px` y `12px`. Los marcos combinan un borde blanco arriba con una línea salvia abajo. Las superficies importantes pueden llevar un doble gradiente:

```css
linear-gradient(145deg, #FFFFFF, #D4DDD5 65%, #CAD7CC)
```

La selección usa fondo salvia claro y un borde o carril lateral terracota. Mantener visible el nombre de la sección seleccionada y usar el mismo patrón en filtros.

## Estados

- **Reposo:** gradiente mate y relieve suave, sin halo fuerte.
- **Hover:** elevar entre `1px` y `2px`, aumentar ligeramente la sombra y conservar el color del texto.
- **Pressed:** `translateY(1px)` y sombra inset más profunda.
- **Focus-visible:** contorno de `2px` en salvia oscuro con separación de `2px`.
- **Activo:** fondo verde salvia pálido, texto verde profundo y una marca terracota; no usar negro.
- **Éxito / pendiente / alerta:** salvia / terracota / rojo arcilla, siempre con etiqueta de texto.

Transiciones recomendadas: `180ms ease-out` para hover y `140ms ease-out` para la presión.

## Ruido e iluminación

El estilo es mate: no aplicar grano visible a las tarjetas. Si se usa una textura en el fondo, mantenerla bajo `1.5%` de opacidad. Usar reflejos blancos internos al `60–95%` dentro de sombras inset, nunca como brillo exterior intenso.

## Gráficos y tablas

Mantener ejes y encabezados en salvia medio; usar terracota para series primarias y salvia profundo para comparativas. Las filas separan con `#DCE3DA`, sin una tabla gris o blanca superpuesta. Las tarjetas pueden alojar gráficos circulares o áreas suaves, pero conservan cifras y leyendas legibles.

## Accesibilidad y movimiento

- Mantener contraste suficiente para etiquetas pequeñas y controles.
- Los botones de foto, perfil y navegación deben tener nombre accesible y foco visible.
- No depender únicamente del color para explicar estados.
- Respetar `prefers-reduced-motion: reduce`; los movimientos de panel son cortos y discretos.

