export type TipoCamada = 'no2' | 'temperatura';
export interface MapaFeatureProperties {
  zonaId: number; zonaNome: string; valor: number; unidade: string;
}
export interface MapaFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: MapaFeatureProperties;
}
export interface MapaCamada {
  type: 'FeatureCollection'; fonte: string; dtCaptura: string; features: MapaFeature[];
}
