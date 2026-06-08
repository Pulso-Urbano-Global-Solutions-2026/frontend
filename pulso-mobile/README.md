# Pulso Urbano — App Mobile

> Global Solution 2026/1 · FIAP · Turma de Análise e Desenvolvimento de Sistemas

[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict%20%2B%20noUncheckedIndexedAccess-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Expo SDK 56](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo)](https://docs.expo.dev/versions/v56.0.0/)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61dafb?logo=react)](https://reactnative.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-0%20warnings-4b32c3?logo=eslint)](https://eslint.org/)

---

## O que você vai encontrar aqui

Você abre o app de manhã antes de sair de casa. A primeira coisa que vê é um número grande no centro da tela — **o Pulso do dia**: um score de 0 a 100 que resume a qualidade ambiental de São Paulo naquele momento. Abaixo dele, dois cartões mostram a concentração de NO₂ no ar (em ppb, com a barra que indica quanto falta para cruzar o limite da OMS) e a temperatura real do asfalto medida de satélite — não do termômetro, mas do chão onde seu cachorro vai colocar as patas.

Se você marcou no cadastro que tem um pet, o app avisa quando a temperatura do asfalto passa de 35 °C. Se você tem asma, as recomendações são mais conservadoras. Se você vai malhar ao ar livre, o score é usado para sugerir se vale o risco.

Esses dados não vêm de sensores de rua ou estimativas — vêm do satélite **Sentinel-5P** da Agência Espacial Europeia (órbita diária sobre São Paulo, canal TROPOMI, resolução de 3,5 km) e do **ECOSTRESS** da NASA (imageamento termal infravermelho instalado na ISS, resolução de 70 m). O backend processa as imagens orbitais, calcula o score e entrega via API REST. Este app consome essa API e transforma números científicos em algo que qualquer pessoa entende.

---

## Equipe

| Integrante | RM | Papel principal |
|---|---|---|
| Felipe Ferrete Soares Lemes | RM 562999 | Tech Lead · Arquitetura geral · DevOps (Fly.io) |
| Guilherme Sola Garcia | RM 563674 | Mobile · Frontend — entrega desta sprint |
| Clayton Alves dos Santos | RM 562285 | Database · Pipeline de dados orbitais |
| Gustavo Bosak Santos | RM 566315 | QA · Arquitetura TOGAF · validação de telas e endpoints |
| Nikolas Henrique Brisola | RM 564371 | IoT · Integração ESP32 |

---

## Vídeo de demonstração

> **Link:** [https://youtu.be/PLACEHOLDER](#) — demonstração completa das 7 telas (máx. 5 min)

---

## As 7 telas

### 1. Login

Formulário com e-mail e senha. O JWT retornado é gravado no **Keychain** (iOS) ou **Android Keystore** via `expo-secure-store` — nunca no `AsyncStorage`. Erros da API são exibidos em linha, com mensagem do servidor quando disponível. Depois de autenticado, o Expo Router redireciona para `/(tabs)` sem piscar a tela de login.

### 2. Cadastro

Quatro toggles de perfil de saúde logo no formulário de registro:

- **Pratico exercícios regularmente** — personaliza alertas de qualidade do ar para atividade ao ar livre
- **Tenho crianças em casa** — crianças são mais sensíveis à poluição, alertas mais preventivos
- **Tenho problema respiratório** — asma, bronquite, DPOC — recomendações mais conservadoras
- **Tenho pet em casa** — alertas de temperatura do asfalto nos horários de passeio

Cada toggle tem um hint explicativo abaixo do label, para que o usuário entenda por que está fornecendo a informação.

### 3. Home (tela principal)

É onde acontece a maior parte da experiência do usuário. De cima para baixo:

```
┌─────────────────────────────────────────┐
│  PULSO URBANO          São Paulo · SP   │
├─────────────────────────────────────────┤
│                                         │
│          ╭──────────────╮               │
│          │      72      │   Gauge SVG   │
│          │   ● ● ● ○    │   animado     │
│          ╰──────────────╯               │
│                                         │
│    [ BOM ]   ↗ +8 desde ontem          │
│    Atualizado 07/06/2026 · Sentinel-5P  │
│                                         │
│    [CRÍTICO]──[RUIM]──[MOD.]──[BOM▲]   │  ← régua de score
│                                         │
├──────────────┬──────────────────────────┤
│  NO₂         │  Superfície              │
│  18.3 ppb    │  34.1 °C                 │
│  Limite OMS: │  Ilha de calor +6.1°C   │
│  [████░░░░]  │  [███░░░░░]              │
├──────────────┴──────────────────────────┤
│  🐾 Atenção com seu pet                 │  ← só aparece se temp > 35°C
│  Patas queimam a 34°C. Passeio         │    e usuário tem pet
│  antes das 10h ou após as 18h.         │
├─────────────────────────────────────────┤
│  💡 Recomendação personalizada          │
│  "Score moderado — recomendamos         │
│   atividades leves em áreas arborizadas"│
├─────────────────────────────────────────┤
│  → Ver mapa de calor por bairro        │
│  → Zonas de vulnerabilidade            │
│  → Entender os dados                   │
└─────────────────────────────────────────┘
```

O gauge é um SVG desenhado à mão com animação de preenchimento via `Animated.Value`. A régua de score abaixo mostra onde o valor atual se encaixa na escala cromática da app (vermelho → laranja → amarelo → verde). O delta "↗ +8 desde ontem" é calculado no cliente comparando o score atual com o penúltimo item do histórico.

Pull-to-refresh recarrega tudo. Notificação diária às 7h é agendada automaticamente via `expo-notifications`.

### 4. Mapa

Mapa escuro gerado dentro de um `WebView` com **Leaflet.js 1.9.4**. O tile do OpenStreetMap tem `filter: brightness(0.55) saturate(0.5)` para combinar com a paleta space do app. Os dados chegam da API como **GeoJSON** e são renderizados como círculos coloridos sobre São Paulo:

```
┌─────────────────────────────────────────┐
│  [ NO₂ ]  [ Temperatura ]              │  ← toggle de camada
│  ⚠ Ver urgência por bairro             │
│  Sentinel-5P · 07/06/2026              │
├─────────────────────────────────────────┤
│                                         │
│        🗺 Mapa escuro de SP            │
│                                         │
│    ●  ●  ●  ●    ← círculos           │
│   ●  ●  ●  ●     coloridos por        │
│    ●  ●  ●       intensidade          │
│                                         │
│    Popup ao tocar:                      │
│    ┌──────────────┐                     │
│    │ Vila Madalena│                     │
│    │ 21.4 ppb     │                     │
│    └──────────────┘                     │
├─────────────────────────────────────────┤
│  ● Baixo  ● Médio  ● Alto  (ppb)       │
└─────────────────────────────────────────┘
```

A comunicação entre React Native e o Leaflet acontece via `webviewRef.current.postMessage()` / `window.ReactNativeWebView.postMessage()`. O mapa só recebe os dados depois que o Leaflet dispara o evento `leaflet_ready` — sem corrida de condição. Zonas com valor zero recebem cor cinza e popup "Dados em processamento" em vez de confundir com valor real.

### 5. Histórico

```
┌─────────────────────────────────────────┐
│  Últimos 7 dias          ↗ melhorando  │
│  01/06 – 07/06                          │
├──────────┬──────────┬───────────────────┤
│  Média   │  Melhor  │  Pior             │
│    68    │    81    │    52             │
├──────────┴──────────┴───────────────────┤
│                                         │
│  LineChart — react-native-gifted-charts │
│                                         │
│  100 ─────────────────────────── ─ ─   │
│   75 ──────●─────────●──────────────   │
│   50 ─●────────●────────●──────────   │
│   25 ───────────────────────────────   │
│    Seg  Ter  Qua  Qui  Sex  Sab  Dom   │
│                                         │
├─────────────────────────────────────────┤
│  07/06/2026  [BOM]                 81   │
│  06/06/2026  [MODERADO]            67   │
│  05/06/2026  [BOM]                 74   │
│  ...                                   │
└─────────────────────────────────────────┘
```

A largura do gráfico é calculada dinamicamente com `useWindowDimensions()` para funcionar em qualquer tamanho de tela. O spacing entre pontos se ajusta ao número de dados disponíveis. Tocar em um ponto exibe um tooltip flutuante com data, score e classificação. A tendência ("↗ melhorando" / "↘ piorando") compara os últimos 3 pontos e exige variação maior que 3 pontos para evitar falsos positivos.

### 6. Perfil

CRUD completo do usuário:

- **Leitura (GET):** dados carregados ao entrar na tela — nome, e-mail, toggles de perfil, RM, data de cadastro
- **Edição (PUT):** campo de nome editável + 4 toggles sincronizados com a API
- **Exclusão (DELETE):** botão "Excluir conta" com confirmação via `Alert.alert` — destrói o token local e redireciona para login
- **Preferências locais:** pet e notificações ficam no `expo-secure-store` (não vão para a API, são específicas do dispositivo)

O avatar mostra a inicial do nome sobre um gradiente `cyan → #3ddc84`. O RM é exibido com padding de 6 dígitos (ex: `RM 562999`).

### 7. Detalhes

Tela educativa estática. Explica em linguagem acessível o que é NO₂, o que é temperatura de superfície, e mostra a fórmula real do score em um bloco de código estilizado com JetBrains Mono:

```javascript
// parcela ar
ar   = (1 − NO₂ / 50) × 60

// parcela calor
cal  = (1 − max(0, Temp − 30) / 20) × 40
──────────────────────────────────────────
score  = ar + cal
```

Abaixo da fórmula há cards clicáveis com link para os sites oficiais do Sentinel-5P (ESA), ECOSTRESS (NASA) e Open-Meteo (fallback de temperatura do ar).

---

## Pré-requisitos

| Requisito | Versão mínima |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| Expo Go no celular | SDK 56 ([baixar APK direto](https://expo.dev/go)) |

> Se a versão da Play Store / App Store não suportar SDK 56, baixe o APK em [expo.dev/go](https://expo.dev/go).

---

## Como rodar — passo a passo desde o zero

### 1. Clonar o repositório

```bash
git clone https://github.com/Pulso-Urbano-Global-Solutions-2026/frontend.git
cd frontend/pulso-mobile
```

### 2. Instalar dependências

```bash
npm install --legacy-peer-deps
```

A flag `--legacy-peer-deps` é **obrigatória**. O Expo SDK 56 usa React 19, e algumas libs ainda declaram peer deps de React 18 — a flag resolve sem quebrar nada. Use-a também ao adicionar novos pacotes:

```bash
npx expo install <pacote> -- --legacy-peer-deps
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

O `.env.example` já aponta para o backend de produção no Fly.io:

```
EXPO_PUBLIC_API_URL=https://pulso-urbano-562999.fly.dev
```

Não precisa alterar nada para rodar contra produção. Se quiser rodar contra API local, veja a seção de variáveis de ambiente abaixo.

### 4. Iniciar o servidor Metro

```bash
npx expo start --clear
```

O `--clear` é necessário após qualquer mudança no `.env` — o Metro não faz hot-reload de variáveis de ambiente.

Escaneie o QR code com o Expo Go. O celular e o computador precisam estar na **mesma rede Wi-Fi**.

### 5. Abrir em emulador (opcional)

```bash
npx expo start --clear
# pressione "a" para Android (requer Android Studio com AVD configurado)
# pressione "i" para iOS (requer Xcode + Simulator, apenas macOS)
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Sim | URL base da API Java (sem barra final) |

### Por que não pode ser `localhost`?

Em dispositivo físico, `localhost` resolve para o próprio celular — não para a máquina onde o servidor está rodando. Se você está desenvolvendo com backend local, use o **IP de LAN** da sua máquina:

```bash
# macOS/Linux
ipconfig getifaddr en0
# Windows
ipconfig | findstr "IPv4"
```

E então configure:

```
EXPO_PUBLIC_API_URL=http://192.168.1.42:8080
```

O próprio `src/services/api.ts` falha em build time se a variável não estiver definida:

```typescript
const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL não definida. Edite .env com o IP de LAN da máquina — NÃO localhost.'
  );
}
```

### Problemas comuns

**"Project is incompatible with this version of Expo Go"**
Expo Go desatualizado. Baixe o APK para SDK 56 em [expo.dev/go](https://expo.dev/go).

**Conflito de peer deps no install**
```bash
npm install --legacy-peer-deps
```

**Mudei o `.env` e o app não atualizou**
```bash
npx expo start --clear   # sempre use --clear após .env
```

---

## Autenticação — como funciona de ponta a ponta

```
┌──────────────┐     POST /api/v1/auth/login      ┌──────────────┐
│   App        │ ─────────────────────────────────► │  Java API    │
│  (login.tsx) │ ◄──────── { token: "eyJ..." } ─── │  Spring Boot │
└──────┬───────┘                                    └──────────────┘
       │
       │  expo-secure-store.setItemAsync("jwt_token", token)
       ▼
┌──────────────┐
│ iOS Keychain │  ou  Android Keystore
│ (hardware)   │
└──────┬───────┘
       │
       │  a cada request:
       │  getItemAsync("jwt_token") → Authorization: Bearer eyJ...
       ▼
┌──────────────┐     401 em endpoint não-auth      ┌──────────────┐
│  api.ts      │ ──────────────────────────────────► │  Java API    │
│ interceptor  │  removeToken() + authEvents.emit() │              │
└──────┬───────┘                                    └──────────────┘
       │
       │  _layout.tsx escuta 'unauthorized'
       ▼
┌──────────────┐
│  router      │  replace('/(auth)/login')
│  .replace()  │  sem flash, sem loop
└──────────────┘
```

**Pontos importantes:**
- O token nunca toca o `AsyncStorage` — vai direto para o hardware de segurança do dispositivo
- O interceptor de 401 **não dispara** para `/auth/login` e `/auth/register` — um 401 nesses endpoints é credencial inválida, não sessão expirada
- `AuthContext` restaura o token na inicialização e expõe `{ isAuthenticated, isLoaded, userId, login, register, logout }`
- O `_layout.tsx` aguarda `isLoaded` antes de aplicar o guard, evitando o flash da tela de login durante o boot

---

## CRUD completo

O app cobre todas as operações CRUD contra a API Java. A tabela abaixo mapeia cada operação à tela e ao endpoint real:

| Operação | Método | Endpoint | Tela | Descrição |
|---|---|---|---|---|
| Create — usuário | `POST` | `/api/v1/auth/register` | Cadastro | Cria conta com perfil de saúde |
| Create — sessão | `POST` | `/api/v1/auth/login` | Login | Autentica e retorna JWT |
| Read — score atual | `GET` | `/api/v1/score/current?lat=-23.55&lon=-46.63` | Home | Score do dia para São Paulo |
| Read — histórico | `GET` | `/api/v1/score/historico?lat=-23.55&lon=-46.63` | Histórico | Últimos 7 dias de scores |
| Read — recomendação | `GET` | `/api/v1/recomendacao?scoreId={id}&userId={id}` | Home | Texto personalizado por perfil |
| Read — mapa | `GET` | `/api/v1/mapa/camadas?camada=no2\|temperatura` | Mapa | GeoJSON com zonas de SP |
| Read — vulnerabilidade | `GET` | `/api/v1/vulnerabilidade/zonas` | Vulnerabilidade | Zonas prioritárias por risco |
| Read — usuário | `GET` | `/api/v1/usuario/{id}` | Perfil | Dados do usuário logado |
| Update — usuário | `PUT` | `/api/v1/usuario/{id}` | Perfil | Edita nome e toggles de perfil |
| Delete — usuário | `DELETE` | `/api/v1/usuario/{id}` | Perfil | Remove conta permanentemente |

Todos os paths são centralizados em `src/constants/api.constants.ts` — nenhuma URL hardcoded nas telas ou hooks:

```typescript
export const ApiPaths = {
  auth:    { login: '/api/v1/auth/login', register: '/api/v1/auth/register' },
  score:   { current: '/api/v1/score/current', historico: '/api/v1/score/historico', zonas: '/api/v1/score/zonas' },
  recomendacao: '/api/v1/recomendacao',
  mapa:    { camadas: '/api/v1/mapa/camadas' },
  usuario: { base: '/api/v1/usuario', byId: (id: number) => `/api/v1/usuario/${id}` },
  vulnerabilidade: { zonas: '/api/v1/vulnerabilidade/zonas' },
} as const;
```

---

## Stack — versões reais

| Tecnologia | Versão | Para quê serve |
|---|---|---|
| React Native | 0.85.3 | Runtime móvel |
| Expo SDK | 56.0.8 | Toolchain e APIs nativas |
| Expo Router | 56.2.8 | Navegação file-based (v3) |
| TypeScript | 6.0.3 | Tipagem estática, modo strict |
| React | 19.2.3 | Camada de UI |
| Axios | 1.16.1 | HTTP com interceptores |
| expo-secure-store | 56.0.4 | JWT no Keychain/Keystore |
| expo-linear-gradient | 56.0.4 | Gradientes (avatar, componentes) |
| expo-notifications | 56.0.16 | Push local diário às 7h |
| react-native-webview | 13.16.1 | Mapa Leaflet dentro do app |
| react-native-gifted-charts | 1.4.77 | LineChart do histórico |
| react-native-svg | 15.15.4 | Gauge SVG animado |
| @expo-google-fonts/space-grotesk | 0.4.1 | Fonte principal da UI |
| @expo-google-fonts/jetbrains-mono | 0.4.1 | Fonte de dados e código |
| ESLint + eslint-config-expo | 8.57 / 56.0.4 | Lint com --max-warnings 0 |

---

## Arquitetura — estrutura de pastas explicada

```
pulso-mobile/
├── app/                    ← Expo Router: cada arquivo = uma rota
│   ├── _layout.tsx         ← Root layout: AuthProvider, fontes, guard, intro overlay
│   ├── (auth)/             ← Stack não autenticada
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/             ← Tab navigator autenticado
│   │   ├── _layout.tsx     ← Define as 3 abas e ícones
│   │   ├── index.tsx       ← Home (score, gauge, métricas, recomendação)
│   │   ├── mapa.tsx        ← Mapa Leaflet com WebView
│   │   └── historico.tsx   ← LineChart 7 dias
│   ├── perfil.tsx          ← Tela de perfil (CRUD usuário)
│   ├── detalhes.tsx        ← Educativo: NO₂, temperatura, fórmula do score
│   └── vulnerabilidade.tsx ← Zonas de risco de SP
│
└── src/                    ← Alias @/ configurado no tsconfig e babel
    ├── services/           ← Toda comunicação de rede fica aqui
    │   ├── api.ts          ← Axios + interceptor JWT + emissor de 401
    │   ├── authService.ts  ← login(), register()
    │   ├── scoreService.ts ← getCurrent(), getHistorico()
    │   ├── usuarioService.ts  ← getById(), update(), remove()
    │   ├── mapaService.ts  ← getCamadas()
    │   ├── secureStore.ts  ← getToken(), setToken(), removeToken()
    │   ├── authEvents.ts   ← EventEmitter mínimo para o evento 'unauthorized'
    │   └── notificationService.ts  ← agendarNotificacaoDiaria()
    │
    ├── hooks/              ← Data-fetching hooks que consomem os services
    │   ├── useScore.ts     ← Busca score atual, expõe { data, loading, error, refetch }
    │   ├── useHistorico.ts ← Últimos 7 dias, mesma interface
    │   ├── useMapa.ts      ← GeoJSON + toggle de camada
    │   └── useRecomendacao.ts  ← Recomendação personalizada por scoreId + userId
    │
    ├── contexts/           ← Estado global de autenticação
    │   └── AuthContext.tsx ← isAuthenticated, isLoaded, userId, login, register, logout
    │
    ├── components/         ← Componentes reutilizáveis sem lógica de negócio
    │   ├── ScoreGauge/     ← Gauge SVG animado — o coração visual do app
    │   ├── ClassificacaoBadge/  ← Badge colorido: BOM / MODERADO / RUIM / CRÍTICO
    │   ├── RecomendacaoCard/    ← Card de recomendação personalizada
    │   ├── LoadingSkeleton/     ← Skeleton para loading states
    │   ├── ErrorState/          ← Tela de erro com retry
    │   ├── EmptyState/          ← Estado vazio (ex: sem histórico ainda)
    │   ├── Button/              ← Botão com variantes primary / secondary / danger
    │   ├── Toast/               ← Notificação inline success/error
    │   └── Logo/                ← Wordmark + versão animada do intro
    │
    ├── constants/          ← Valores estáticos compartilhados
    │   ├── colors.ts       ← Paleta completa do design system (tokens com nome semântico)
    │   ├── typography.ts   ← Fontes e tamanhos centralizados
    │   └── api.constants.ts  ← Todos os paths de API + coordenadas de São Paulo
    │
    ├── types/              ← Interfaces TypeScript compartilhadas entre camadas
    │   ├── score.types.ts  ← ScoreAtual, ScoreHistoricoItem, ClassificacaoScore
    │   ├── usuario.types.ts  ← UsuarioResponse, UsuarioUpdateRequest
    │   ├── mapa.types.ts   ← MapaFeature, MapaFeatureCollection
    │   └── api.types.ts    ← AsyncState<T> genérico para hooks
    │
    └── utils/              ← Funções puras sem efeitos colaterais
        ├── scoreUtils.ts   ← getClassificacaoColor(), getClassificacaoLabel()
        ├── dateUtils.ts    ← formatDate(), formatDayLabel()
        └── tokenUtils.ts   ← parseUserId() a partir do JWT
```

### Por que essa separação?

A separação entre `services` e `hooks` é intencional. Um `service` sabe como chamar a API — apenas isso. Um `hook` sabe quando chamar, como gerenciar estado de loading/error e como expor os dados para a tela. Uma tela **nunca** chama um service diretamente — sempre passa por um hook. Isso facilita testar serviços isolados e trocar a implementação de dados (ex: cache local) sem tocar nas telas.

`constants/` centraliza valores que, se dispersos pelo código, criariam strings mágicas e números mágicos difíceis de manter. Mudar a URL de um endpoint é uma linha em `api.constants.ts`, não uma busca global por string.

`types/` é uma camada de contrato: se o backend mudar um campo, TypeScript aponta exatamente onde o app vai quebrar em compile time — antes de chegar em produção.

---

## Design system

### Paleta de cores

```typescript
export const Colors = {
  // Backgrounds — "Space Dark" (#0a0e1a é o nome interno)
  bg:       '#0a0e1a',   // fundo principal
  surface:  '#13151c',   // cards e painéis
  surface2: '#1a1d24',   // superfície elevada (tooltip)
  border:   'rgba(240,240,237,0.10)',

  // Texto
  text:      '#f0f0ed',  // texto principal
  textMuted: '#9b9ea6',  // texto secundário
  textDim:   '#5a5e68',  // labels e metadados

  // Cyan primário — interação e navegação
  cyan:    '#22d3ee',
  cyanDim: 'rgba(34,211,238,0.12)',

  // Score de saúde ambiental
  bom:      '#3ddc84',   // score 80–100
  moderado: '#f5a623',   // score 60–79
  ruim:     '#ff8c42',   // score 40–59
  critico:  '#ff4757',   // score 0–39
} as const;
```

Cada cor de score tem uma variante `Dim` (ex: `bomDim`) com opacidade 12% para fundos de badges e alertas, mantendo o contraste sem saturar a tela.

### Tipografia

```typescript
export const Typography = {
  font: {
    heading:    'SpaceGrotesk_700Bold',    // títulos, scores grandes
    subheading: 'SpaceGrotesk_600SemiBold', // labels de seção
    body:       'SpaceGrotesk_400Regular',  // texto corrido
    mono:       'JetBrainsMono_400Regular', // dados, unidades, código
  },
  size: { xs: 11, sm: 13, md: 15, lg: 18, xl: 22 },
} as const;
```

`JetBrainsMono` é usada para todos os dados numéricos (score, NO₂, temperatura) porque fontes mono têm largura fixa — o número não "pula" quando muda de valor, eliminando layout shift na tela Home.

---

## Comandos de desenvolvimento

```bash
# Checar tipos sem compilar
npm run typecheck

# Lint com zero warnings tolerados
npm run lint

# Start limpo (sempre após .env ou installs)
npx expo start --clear

# Instalar nova dependência (sempre com a flag)
npx expo install <pacote> -- --legacy-peer-deps
```

---

## API — endpoints do backend

| Recurso | URL de produção |
|---|---|
| Base URL | `https://pulso-urbano-562999.fly.dev` |
| Health check | `/actuator/health` |
| Swagger UI | `/swagger-ui.html` |
| OpenAPI JSON | `/api-docs` |

O backend é um **Spring Boot** hospedado no Fly.io. Os dados orbitais do Sentinel-5P e ECOSTRESS são processados em um pipeline separado (Clayton/Clayton pipeline) e persistidos no banco Oracle antes de serem servidos via REST.

---

## Perguntas da defesa

### Navegação

**P: Como funciona a navegação entre telas autenticadas e não autenticadas?**

R: Expo Router v3 usa roteamento por sistema de arquivos. A pasta `(auth)/` agrupa as telas de login e cadastro em um stack sem barra de navegação (`headerShown: false`). A pasta `(tabs)/` agrupa as três abas autenticadas. O `_layout.tsx` raiz lê `isAuthenticated` do `AuthContext` e redireciona entre os grupos:

```typescript
useEffect(() => {
  if (!isLoaded) return;
  const inAuth = segments[0] === '(auth)';
  if (!isAuthenticated && !inAuth) router.replace('/(auth)/login');
  if (isAuthenticated && inAuth)  router.replace('/(tabs)');
}, [isAuthenticated, isLoaded, segments, router]);
```

O guard espera `isLoaded` para que o token seja restaurado do `SecureStore` antes de qualquer decisão de rota — evitando o flash da tela de login durante o boot.

**P: Como funciona a navegação de telas de tabs para telas de stack (Perfil, Detalhes)?**

R: As tabs ficam dentro de `(tabs)/_layout.tsx`. `perfil.tsx` e `detalhes.tsx` ficam na raiz do `app/` e são registradas no `Stack` do `_layout.tsx` raiz. A navegação é:

```typescript
router.push('/perfil')      // de qualquer tab
router.push('/detalhes')    // de Home, via QuickActionCard
router.push('/vulnerabilidade')
```

O Expo Router usa segment-based routing — o Stack pai gerencia o botão "Voltar" automaticamente.

---

### CRUD

**P: Como o app atualiza os dados do usuário?**

R: A tela `perfil.tsx` faz `PUT /api/v1/usuario/{id}` com o corpo:

```typescript
await usuarioService.update(userId, {
  nome, fazExercicio, temCrianca, temProblemaRespiratorio: temProblema,
});
```

O campo `temPet` é propositalmente excluído da chamada API — o backend não tem esse campo. O pet é uma preferência local armazenada no `SecureStore` porque é específica do dispositivo (o mesmo usuário pode ter dois celulares com preferências diferentes).

**P: O que acontece quando o usuário deleta a conta?**

R: `DELETE /api/v1/usuario/{id}` é chamado. Em caso de sucesso, o app remove o token e a preferência de pet do `SecureStore` e redireciona para login:

```typescript
await usuarioService.remove(userId);
await SecureStore.deleteItemAsync(petKey(userId));
await logout();
router.replace('/(auth)/login');
```

---

### Estilização

**P: Por que JetBrains Mono para dados numéricos?**

R: Fontes monospace têm glifos de largura fixa. Quando o score muda de 72 para 68, o layout não se recalcula — `7` e `6` ocupam a mesma largura. Em `SpaceGrotesk` (proporcional), `1` e `8` têm larguras diferentes e o texto "salta" ao mudar de valor. Dados que mudam em tempo real ficam mais estáveis visualmente em fonte mono.

**P: Como a paleta de cores foi definida?**

R: As cores de score são semânticas — verde/amarelo/laranja/vermelho mapeiam diretamente para a percepção de "bom" e "ruim" em qualidade do ar. A paleta do fundo é "space dark" (`#0a0e1a`) inspirada em imagens de satélite noturnas, reforçando a narrativa de dados orbitais. O cyan `#22d3ee` é a cor de interação — tabs ativas, botões primários, bordas de elementos selecionados.

---

### Arquitetura

**P: Por que separar hooks de services se os dois fazem chamadas de API?**

R: Services são funções puras que fazem uma chamada e retornam o resultado (ou jogam erro). Hooks gerenciam ciclo de vida React: `useEffect`, `useState`, loading, retry. Essa separação permite reutilizar a mesma lógica de `scoreService.getCurrent()` em contextos diferentes — um hook de tela, um hook de background, um test unitário — sem duplicar o código HTTP.

**P: Por que `noUncheckedIndexedAccess` no TypeScript?**

R: Com essa flag, qualquer acesso por índice (`array[0]`) retorna `T | undefined` em vez de `T`. Isso força o código a verificar explicitamente se o item existe antes de usar, eliminando uma classe inteira de bugs de `undefined is not an object`. É mais verboso — `sorted[sorted.length - 1]?.score ?? 0` em vez de `sorted[sorted.length - 1].score` — mas muito mais seguro em dados que podem chegar vazios da API.

---

## Links

| Recurso | URL |
|---|---|
| Vídeo demo (5 min) | [YouTube — aguardando upload](#) |
| Repositório frontend | [github.com/Pulso-Urbano-Global-Solutions-2026/frontend](https://github.com/Pulso-Urbano-Global-Solutions-2026/frontend) |
| API de produção | [https://pulso-urbano-562999.fly.dev](https://pulso-urbano-562999.fly.dev) |
| Swagger UI | [https://pulso-urbano-562999.fly.dev/swagger-ui.html](https://pulso-urbano-562999.fly.dev/swagger-ui.html) |
| Sentinel-5P (ESA) | [esa.int/...Sentinel-5P](https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-5P) |
| ECOSTRESS (NASA) | [ecostress.jpl.nasa.gov](https://ecostress.jpl.nasa.gov/) |
| Expo SDK 56 docs | [docs.expo.dev/versions/v56.0.0](https://docs.expo.dev/versions/v56.0.0/) |

---

## Licença

Projeto acadêmico — Global Solution 2026/1 · FIAP. Todos os direitos reservados aos autores.
