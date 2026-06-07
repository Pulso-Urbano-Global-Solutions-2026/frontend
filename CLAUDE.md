# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Pulso Urbano** — React Native / Expo SDK 56 mobile app (FIAP Global Solution 2026/1).  
The app displays environmental health scores for São Paulo (derived from satellite data) and delivers personalized recommendations based on user profile.

The actual app lives in `pulso-mobile/`. All commands below must be run from that subdirectory.

## Commands

```bash
# Install dependencies (always use the flag — SDK 56 has peer-dep conflicts)
npm install -- --legacy-peer-deps

# Install a new package
npx expo install <package> -- --legacy-peer-deps

# Start dev server (use --clear after .env changes or after installs)
npx expo start --clear

# Type-check
npm run typecheck

# Lint (zero warnings allowed)
npm run lint
```

There are no automated tests in this project.

## Environment setup

Copy `.env.example` to `.env` before first run.  
`EXPO_PUBLIC_API_URL` is required and **must not be `localhost`** on a physical device — use the LAN IP of the dev machine or the production URL (`https://pulso-urbano-562999.fly.dev`).  
Metro does not hot-reload env changes; always restart with `--clear`.

## Architecture

### Routing (`app/`)

Expo Router v3 file-based routing:
- `app/(auth)/` — unauthenticated stack: `login.tsx`, `register.tsx`
- `app/(tabs)/` — authenticated tab navigator: `index.tsx` (Home), `mapa.tsx`, `historico.tsx`
- `app/perfil.tsx`, `app/detalhes.tsx` — stack screens pushed from tabs
- `app/_layout.tsx` — root layout: wraps everything in `<AuthProvider>`, runs the auth guard (redirect to login if not authenticated), and listens for the `unauthorized` event from the 401 interceptor

### Source tree (`src/`)

`@/` alias maps to `src/` (configured in `tsconfig.json` and `babel.config.js`).

```
src/
  services/     # API layer — all network calls live here
  hooks/        # Data-fetching hooks that consume services
  contexts/     # AuthContext (token + userId state)
  components/   # Presentational components
  constants/    # api.constants.ts (all API paths), colors.ts, typography.ts
  types/        # Shared TypeScript interfaces
  utils/        # Pure helpers (dateUtils, scoreUtils, tokenUtils)
```

### Auth flow

1. JWT stored via `expo-secure-store` (`src/services/secureStore.ts`)
2. `AuthContext` restores token on mount, exposes `login / register / logout`
3. `src/services/api.ts` — Axios instance that attaches `Bearer` token on every request and on 401 fires `authEvents.emit('unauthorized')`
4. `app/_layout.tsx` listens for `unauthorized` and redirects to `/(auth)/login`

### API

All paths centralized in `src/constants/api.constants.ts`.  
Backend: Java Spring Boot on Fly.io — Swagger at `/swagger-ui.html`, health at `/actuator/health`.

### TypeScript

Strict mode + `noUncheckedIndexedAccess`. Do not loosen these flags.

## Expo SDK version

**SDK 56** — before touching Expo-specific APIs, consult the versioned docs at  
`https://docs.expo.dev/versions/v56.0.0/`
