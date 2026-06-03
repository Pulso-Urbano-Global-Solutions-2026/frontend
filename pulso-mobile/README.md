# Pulso Urbano — Mobile App

> Global Solution 2026/1 · FIAP

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Expo](https://img.shields.io/badge/Expo-SDK_56-black)]()

## Integrantes

| Nome | RM |
|------|----|
| Guilherme Sola | [PREENCHER] |
| Felipe [sobrenome] | [PREENCHER] |
| Clayton [sobrenome] | [PREENCHER] |
| Gustavo Bosak | [PREENCHER] |

## 🎬 Vídeo Demo

[PREENCHER após gravação — link YouTube, máx 5 min]

## Solução

Pulso Urbano transforma dados de satélites orbitais (NO₂ do Sentinel-5P e
temperatura de superfície do ECOSTRESS) em um score de saúde ambiental (0–100)
para cidadãos de São Paulo. O app entrega recomendações personalizadas com base
no perfil do usuário (exercício físico, crianças em casa, problemas respiratórios).

## Stack

| Tecnologia | Uso |
|-----------|-----|
| React Native + Expo Router | Navegação file-based |
| TypeScript strict | Tipagem completa |
| Axios + expo-secure-store | HTTP + JWT seguro |
| react-native-gifted-charts | Gráfico de histórico |
| WebView + Leaflet.js | Mapa GeoJSON |
| Java API (Spring Boot) | Backend principal |

## Como rodar

```bash
git clone <repo>
cd pulso-mobile
npm install
cp .env.example .env
# Edite .env: EXPO_PUBLIC_API_URL=http://<IP-LAN-da-sua-maquina>:8080
# (no macOS/Linux: ifconfig | grep "inet " — no Windows: ipconfig)
npx expo start
# Abra o Expo Go no celular (mesma rede wi-fi) e escaneie o QR
```

> **Android:** se usar http (não https), o `usesCleartextTraffic: true` já está
> configurado no app.json para dev.

## CRUD com a API Java (30pts GS)

| Verbo HTTP | Endpoint | Tela |
|-----------|----------|------|
| POST | /api/v1/auth/register | Register |
| GET | /api/v1/score/current | Home |
| GET | /api/v1/score/historico | Histórico |
| GET | /api/v1/usuario/{id} | Perfil |
| PUT | /api/v1/usuario/{id} | Perfil |
| DELETE | /api/v1/usuario/{id} | Perfil |

## Telas (5 telas — 10pts GS)

| Tela | Arquivo | API |
|------|---------|-----|
| Home | app/(tabs)/index.tsx | GET /score/current + /recomendacao |
| Mapa | app/(tabs)/mapa.tsx | GET /mapa/camadas |
| Histórico | app/(tabs)/historico.tsx | GET /score/historico |
| Perfil | app/perfil.tsx | GET/PUT/DELETE /usuario |
| Detalhes | app/detalhes.tsx | — (estático) |

## Screenshots

*(adicionar após validação em docs/screenshots/)*
