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

## 🎬 Vídeo Demo

> Em breve — link YouTube (máx 5 min)

## Solução

Pulso Urbano transforma dados de satélites orbitais (NO₂ do Sentinel-5P e
temperatura de superfície do ECOSTRESS) em um score de saúde ambiental (0–100)
para cidadãos de São Paulo. O app entrega recomendações personalizadas com base
no perfil do usuário (exercício físico, crianças em casa, problemas respiratórios).

## Stack

| Tecnologia | Uso |
|-----------|-----|
| React Native + Expo Router v3 | Navegação file-based |
| TypeScript strict | Tipagem completa |
| Axios + expo-secure-store | HTTP + JWT seguro |
| react-native-gifted-charts | Gráfico de histórico |
| WebView + Leaflet.js | Mapa GeoJSON |
| Java API (Spring Boot) — Fly.io | Backend principal |

---

## Pré-requisitos

Antes de clonar, certifique-se de ter instalado:

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm 9+** — vem junto com o Node
- **Expo Go** no celular — [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Precisa ser a versão mais recente (SDK 56 compatível)
  - Se a Play Store não atualizar, baixe o APK direto em [expo.dev/go](https://expo.dev/go)

---

## Como rodar

### 1. Clonar o repositório

```bash
git clone <url-do-repo>
cd pulso-mobile
```

### 2. Instalar dependências

```bash
npm install -- --legacy-peer-deps
```

> **Atenção:** use sempre `-- --legacy-peer-deps` nos installs deste projeto.
> O Expo SDK 56 tem conflitos de peer dependencies com algumas libs — a flag
> resolve sem quebrar nada.

Se aparecer erro de pacote faltando, instale assim:

```bash
npx expo install <nome-do-pacote> -- --legacy-peer-deps
```

### 3. Configurar o ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

O `.env` já está configurado para usar a API de produção no Fly.io.
Não precisa editar nada — só copiar o `.env.example`.

Conteúdo do `.env`:

```
EXPO_PUBLIC_API_URL=https://pulso-urbano-562999.fly.dev
```

> **Importante:** o Metro (bundler do Expo) não recarrega variáveis de ambiente
> automaticamente. Sempre que alterar o `.env`, reinicie com `npx expo start --clear`.

### 4. Instalar pacotes adicionais (se necessário)

Caso algum pacote esteja faltando após o `npm install`, instale manualmente:

```bash
npx expo install expo-linking -- --legacy-peer-deps
npx expo install expo-linear-gradient -- --legacy-peer-deps
npx expo install babel-preset-expo -- --legacy-peer-deps
```

### 5. Iniciar o projeto

```bash
npx expo start --clear
```

### 6. Abrir no celular

1. Abra o **Expo Go** no celular
2. Escaneie o QR code que aparece no terminal
3. O celular e o PC precisam estar na **mesma rede wi-fi**

---

## Problemas comuns

### "Project is incompatible with this version of Expo Go"
O Expo Go está desatualizado. Atualize pela Play Store ou baixe o APK em [expo.dev/go](https://expo.dev/go).

### "EXPO_PUBLIC_API_URL não definida"
O arquivo `.env` não existe ou está vazio. Crie manualmente com o conteúdo:
```
EXPO_PUBLIC_API_URL=https://pulso-urbano-562999.fly.dev
```
Depois reinicie com `npx expo start --clear`.

### "Cannot find module 'babel-preset-expo'"
```bash
npm install babel-preset-expo -- --legacy-peer-deps
npx expo start --clear
```

### "Unable to resolve expo-linking"
```bash
npx expo install expo-linking -- --legacy-peer-deps
npx expo start --clear
```

### "Gradient package was not found"
```bash
npx expo install expo-linear-gradient -- --legacy-peer-deps
npx expo start --clear
```

### npm install trava com conflito de peer deps
Sempre use a flag:
```bash
npm install -- --legacy-peer-deps
```

---

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

## API

Base URL: `https://pulso-urbano-562999.fly.dev`

- Health check: `/actuator/health`
- Swagger: `/swagger-ui.html`
- OpenAPI: `/api-docs`

## Screenshots

*(adicionar após validação em docs/screenshots/)*
