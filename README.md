# Pulso Urbano — Frontend

> Global Solution 2026/1 · FIAP · Análise e Desenvolvimento de Sistemas

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Expo SDK](https://img.shields.io/badge/Expo-SDK_56-black)]()
[![React Native](https://img.shields.io/badge/React_Native-0.85-61dafb)]()

App mobile que transforma dados de satélites orbitais (NO₂ do Sentinel-5P e temperatura do ECOSTRESS) em um **score de saúde ambiental (0–100)** para cidadãos de São Paulo, com recomendações personalizadas por perfil de saúde.

---

## Integrantes

| Nome | RM |
|------|----|
| Felipe Ferrete Soares Lemes | RM562999 |
| Guilherme Sola Garcia | RM563674 |
| Nikolas Henrique de Souza Lemes Brisola | RM564371 |
| Gustavo Bosak Santos | RM566315 |
| Clayton Alves dos Santos | RM562285 |

---

## Estrutura do repositório

```
frontend/
└── pulso-mobile/   ← app React Native / Expo
    ├── app/        ← telas (Expo Router file-based)
    ├── src/        ← lógica reutilizável
    │   ├── components/
    │   ├── constants/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── services/
    │   ├── types/
    │   └── utils/
    └── assets/     ← ícones e splash screen
```

## Como rodar

```bash
cd pulso-mobile
npm install --legacy-peer-deps
cp .env.example .env
npx expo start --clear
```

Consulte o [README do app](pulso-mobile/README.md) para instruções completas, solução de problemas e detalhes de integração com a API.

---

## API de produção

| Recurso | URL |
|---------|-----|
| Base URL | `https://hearty-adaptation-production-6de3.up.railway.app` |
| Health | `/actuator/health` |
| Swagger | `/swagger-ui.html` |
| OpenAPI | `/api-docs` |
