export const Colors = {
  // ── Backgrounds (marca: #0a0e1a "Space") ──────────────────────────────
  bg:       '#0a0e1a',
  surface:  '#13151c',
  surface2: '#1a1d24',
  border:   'rgba(240,240,237,0.10)',

  // ── Texto ─────────────────────────────────────────────────────────────
  text:      '#f0f0ed',
  textMuted: '#9b9ea6',
  textDim:   '#5a5e68',

  // ── Cyan primário — interação, navegação (marca: "Pulse Cyan") ─────────
  cyan:    '#22d3ee',
  cyanDim: 'rgba(34,211,238,0.12)',

  // ── Score / saúde ambiental ───────────────────────────────────────────
  bom:         '#3ddc84', bomDim:     'rgba(61,220,132,0.12)',
  moderado:    '#f5a623', moderadoDim:'rgba(245,166,35,0.12)',
  ruim:        '#ff8c42', ruimDim:    'rgba(255,140,66,0.12)',
  critico:     '#ff4757', criticoDim: 'rgba(255,71,87,0.10)',

  // ── Mapa de calor ─────────────────────────────────────────────────────
  heatLow: '#3ddc84', heatMid: '#f5a623', heatHigh: '#ff4757',
} as const;

export type ColorToken = keyof typeof Colors;
