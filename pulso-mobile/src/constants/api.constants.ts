export const ApiPaths = {
  auth: { login: '/api/v1/auth/login', register: '/api/v1/auth/register' },
  score: {
    current: '/api/v1/score/current',
    historico: '/api/v1/score/historico',
    zonas: '/api/v1/score/zonas',
  },
  recomendacao: '/api/v1/recomendacao',
  mapa: { camadas: '/api/v1/mapa/camadas' },
  usuario: { base: '/api/v1/usuario', byId: (id: number) => `/api/v1/usuario/${id}` },
} as const;
export const SAO_PAULO = { lat: -23.5505, lon: -46.6333 } as const;
