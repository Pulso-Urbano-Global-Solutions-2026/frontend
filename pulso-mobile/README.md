# Pulso Urbano — Mobile App

> Global Solution 2026/1 · FIAP

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Expo](https://img.shields.io/badge/Expo-SDK_56-black)]()

## Integrantes

| Nome | RM |
|------|----|
| Felipe Ferrete Soares Lemes | RM562999 |
| Guilherme Sola Garcia | RM563674 |
| Nikolas Henrique de Souza Lemes Brisola | RM564371 |
| Gustavo Bosak Santos | RM566315 |
| Clayton Alves dos Santos | RM562285 |

## Vídeo Demo

> Em breve — link YouTube (máx 5 min)

## Solução

Pulso Urbano transforma dados de satélites orbitais (NO₂ do Sentinel-5P e temperatura de superfície do ECOSTRESS) em um score de saúde ambiental (0–100) para cidadãos de São Paulo. O app entrega recomendações personalizadas com base no perfil do usuário (exercício físico, crianças em casa, problemas respiratórios).

## Stack

| Tecnologia | Uso |
|-----------|-----|
| React Native + Expo Router v3 | Navegação file-based |
| TypeScript strict | Tipagem completa |
| Axios + expo-secure-store | HTTP + JWT seguro |
| react-native-gifted-charts | Gráfico de histórico |
| WebView + Leaflet.js | Mapa GeoJSON |
| Java API (Spring Boot) — Railway | Backend principal |

---

## Pré-requisitos

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm 9+** — vem junto com o Node
- **Expo Go** no celular — [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Se a versão da loja não suportar SDK 56, baixe o APK direto em [expo.dev/go](https://expo.dev/go)

---

## Como rodar

### 1. Clonar e entrar na pasta

```bash
git clone https://github.com/Pulso-Urbano-Global-Solutions-2026/frontend.git
cd frontend/pulso-mobile
```

### 2. Instalar dependências

```bash
npm install --legacy-peer-deps
```

> O Expo SDK 56 tem conflitos de peer deps com algumas libs — a flag `--legacy-peer-deps` resolve sem quebrar nada. Use-a em todos os installs.

### 3. Configurar o ambiente

```bash
cp .env.example .env
```

O `.env.example` já aponta para a API de produção no Railway — não precisa editar nada, só copiar.

> O Metro não recarrega variáveis de ambiente automaticamente. Após alterar o `.env`, sempre reinicie com `npx expo start --clear`.

### 4. Iniciar

```bash
npx expo start --clear
```

Escaneie o QR code com o Expo Go. O celular e o PC precisam estar na **mesma rede Wi-Fi**.

Para abrir direto no emulador Android (requer Android Studio com AVD configurado):

```bash
npx expo start --clear
# pressione "a" no terminal
```

---

## Problemas comuns

**"Project is incompatible with this version of Expo Go"**
Expo Go desatualizado. Baixe o APK para SDK 56 em [expo.dev/go](https://expo.dev/go).

**"EXPO_PUBLIC_API_URL não definida"**
O `.env` não existe. Crie com:
```
EXPO_PUBLIC_API_URL=https://hearty-adaptation-production-6de3.up.railway.app
```
Reinicie com `npx expo start --clear`.

**npm install trava com conflito de peer deps**
```bash
npm install --legacy-peer-deps
```

**Pacote faltando após install**
```bash
npx expo install <pacote> --legacy-peer-deps
```

---

## Telas

| Tela | Arquivo | Endpoints |
|------|---------|-----------|
| Login | `app/(auth)/login.tsx` | `POST /auth/login` |
| Cadastro | `app/(auth)/register.tsx` | `POST /auth/register` |
| Home | `app/(tabs)/index.tsx` | `GET /score/current`, `GET /recomendacao` |
| Mapa | `app/(tabs)/mapa.tsx` | `GET /mapa/camadas` |
| Histórico | `app/(tabs)/historico.tsx` | `GET /score/historico`, `GET /score/zonas` |
| Perfil | `app/perfil.tsx` | `GET/PUT/DELETE /usuario/{id}` |
| Detalhes | `app/detalhes.tsx` | — (estático) |

## CRUD com a API (GS)

| Verbo | Endpoint | Tela |
|-------|----------|------|
| POST | `/api/v1/auth/register` | Cadastro |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/score/current` | Home |
| GET | `/api/v1/score/historico` | Histórico |
| GET | `/api/v1/recomendacao` | Home |
| GET | `/api/v1/mapa/camadas` | Mapa |
| GET | `/api/v1/usuario/{id}` | Perfil |
| PUT | `/api/v1/usuario/{id}` | Perfil |
| DELETE | `/api/v1/usuario/{id}` | Perfil |

## API

| Recurso | URL |
|---------|-----|
| Base URL | `https://hearty-adaptation-production-6de3.up.railway.app` |
| Health | `/actuator/health` |
| Swagger | `/swagger-ui.html` |
| OpenAPI | `/api-docs` |

## Screenshots

*(adicionar após validação em docs/screenshots/)*
