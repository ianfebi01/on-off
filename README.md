# on-off

A small web app to control a smart bulb — read its current state and toggle it on/off through a remote API.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **TanStack Router** — file-based routing (`src/routes/`)
- **TanStack Query** — data fetching & mutations
- **Tailwind CSS v4** — theming via CSS variables (`@theme` in `src/index.css`)
- **Headless UI** — accessible `Switch` component

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with HMR |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |

## Project structure

```
src/
├── routes/           # File-based routes (auto-generates routeTree.gen.ts)
│   ├── __root.tsx    # Root layout
│   ├── index.tsx     # Home — bulb state + toggle
│   └── about.tsx
├── components/
│   ├── Buttons/      # Polymorphic Button (Link / anchor / button)
│   ├── Inputs/       # Switch
│   ├── Icons/        # Spinner
│   └── RootComponents.tsx
├── lib/utils.ts      # cn() — clsx + tailwind-merge
├── index.css         # Tailwind theme, base typography, button styles
└── main.tsx          # Router + QueryClient providers
```

## Theming

Colors, fonts, and other design tokens are defined as CSS variables in the `@theme` block of `src/index.css`. The palette is white + navy blue, with **Work Sans** as the primary font (loaded in `index.html`).

## API

The bulb is controlled via a remote API:

- `GET /bulb` — returns the current state, e.g. `{ "is_on": true }`
- `PUT /bulb` — sets the state, body `{ "is_on": boolean }`

Base URL: `https://bulb-api.ianfebisastrataruna.my.id`

## Path alias

`@` resolves to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`):

```ts
import Button from '@/components/Buttons/Button'
```
