# LinkLoom

LinkLoom is a networking assistant that helps founders map and manage warm introductions. It combines a searchable target directory, introducer insights, and Farcaster Mini app wallet connectivity to provide a lightweight workflow for relationship-driven outreach.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [Working with Cloudflare Tunnel](#working-with-cloudflare-tunnel)
8. [Architecture Notes](#architecture-notes)

## Features

- **Target & Introducer modes** – Switch between people you want to meet and potential introducers, with sortable tables, relevance scores, and connection counts sourced from typed mock data.
- **Debounced global search** – Instant feedback as you type with a debounced search bar that shares state with surrounding components for future expansion.
- **Secure auth persistence** – Access, guest, and user IDs are AES-encrypted before hitting `localStorage`, keeping session state durable across refreshes.
- **Farcaster Mini App integration** – Built-in Wagmi configuration and Farcaster connectors make it ready for on-chain authentication and wallet-aware flows.
- **API-ready Axios client** – Global interceptors automatically attach whichever token the auth slice is currently tracking.

## Tech Stack

- React 19, Vite, and TypeScript
- Tailwind CSS 4 utility classes
- Redux Toolkit for auth state and session management
- React Router for routing, with lazy loaded route definitions
- TanStack Query for future async data fetching
- Wagmi + Farcaster Mini App connector for wallet support
- Sonner for toast notifications

## Project Structure

```
src/
├─ App.tsx                # App shell delegating to route container
├─ main.tsx               # Providers (Redux, QueryClient, Wagmi, Router, Toaster)
├─ config/
│  ├─ Axios.ts            # Axios instance with token interceptors
│  ├─ Store.ts            # Redux store configuration
│  ├─ wagmi.ts            # Wagmi + Farcaster connector setup
│  └─ routes/             # Route list, protected routes, layout wrapper
├─ features/home/         # Target & introducer UI, hooks, mock data
├─ components/            # Re-usable UI primitives (Button, Table, Typography, etc.)
└─ utils/EncryptedLocalStorage.ts
```

## Getting Started

### Prerequisites

- Node.js ≥ 18 (Vite 7 requirement)
- npm (or your preferred package manager)
- Optional: [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) for tunneling

### Installation

```bash
git clone https://github.com/your-org/LinkLoom.git
cd LinkLoom
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print a local URL (default: `http://localhost:5173`).

## Environment Variables

Create a `.env` (or `.env.local`) file at the project root and add the following keys:

```bash
VITE_APP_API_URL= # Optional, base URL for remote API requests
VITE_SECRET_KEY=  # Required, AES secret for encrypting auth data in localStorage
```

> The encryption helpers expect `VITE_SECRET_KEY` to be non-empty; use a strong, random string in production.

## Available Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start the Vite dev server with HMR |
| `npm run build`    | Type-check and bundle for production |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Run ESLint against the codebase |

## Working with Cloudflare Tunnel

Use Cloudflare Tunnel to share your local Vite server without exposing ports.

1. Install `cloudflared` (Homebrew example):
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```
2. Start your dev server: `npm run dev`
3. In a new terminal, launch a quick tunnel pointing at the Vite port:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
4. Cloudflare will provision a public `https://*.trycloudflare.com` URL you can share. Quick tunnels are ephemeral—restart the command if the session drops.

> For production usage, create a named tunnel in your Cloudflare dashboard to control routing, certificates, and uptime.

## Architecture Notes

- **Routing** – Routes are defined centrally and rendered via a `RoutesContainer` with lazy-loaded pages and guarded fallbacks.
- **State & networking** – The Redux auth slice stores tokens, mirrored in encrypted local storage; the Axios instance consumes that slice before each request.
- **Data layer** – TanStack Query is configured but network calls are mocked today. Replace the static data in `features/home/constant` with live queries when ready.
- **UI** – Tailwind-powered layout components (`Header`, `Page`) wrap feature modules. Primitive components like `Button` manage styling variants and loading states.

Feel free to open an issue or submit a pull request as you expand LinkLoom.



https://client.farcaster.xyz/v2/search-channels?q=dwr&prioritizeFollowed=false&forComposer=false&limit=2

https://client.farcaster.xyz/v2/search-users?q=dwr&excludeSelf=false&limit=2&includeDirectCastAbility=false

https://client.farcaster.xyz/v2/search-casts?q=dwr&limit=20
