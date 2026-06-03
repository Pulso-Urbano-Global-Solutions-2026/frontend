export const Colors = {
  bg: '#0e0f11', surface: '#161719', surface2: '#1c1e21',
  border: '#252729', text: '#f0f0ed', textMuted: '#9b9ea6', textDim: '#5a5e68',
  bom: '#3ddc84', bomDim: 'rgba(61,220,132,0.12)',
  moderado: '#f5a623', moderadoDim: 'rgba(245,166,35,0.12)',
  ruim: '#ff8c42', ruimDim: 'rgba(255,140,66,0.12)',
  critico: '#ff4757', criticoDim: 'rgba(255,71,87,0.10)',
  heatLow: '#3ddc84', heatMid: '#f5a623', heatHigh: '#ff4757',
} as const;
export type ColorToken = keyof typeof Colors;
