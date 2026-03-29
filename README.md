<div align="center">
  <img src="public/lumihub-mascot.png" alt="LumiHub mascot" width="260" />
  <h1>LumiHub</h1>
  <p>The community hub for Lumiverse — discover, share, and install characters and worldbooks.</p>
  <p>
    <img src="https://img.shields.io/badge/status-active%20development-cc6f86?style=for-the-badge" alt="Status: Active development" />
    <img src="https://img.shields.io/badge/version-0.5.0-8d6cab?style=for-the-badge" alt="Version 0.5.0" />
  </p>
</div>

LumiHub is the community hub for [Lumiverse](https://github.com/Sillyfrogster/Lumiverse). Creators upload and share characters and worldbooks, users browse and install them directly into a linked Lumiverse instance. It also pulls from third party sources such as [Chub.ai](https://chub.ai) so users can discover and install content from more sources in one place.

## Features
- **Lumiverse linking** — connect a local Lumiverse instance via PKCE and install assets over WebSocket
- **Charx support** — full import and export of charx packages with embedded images, expressions, and multi-index lorebooks
- **Creator profiles** — customizable profile pages with an in-browser HTML/CSS editor and asset uploads
- **Discord authentication** — sign in with Discord, session management with JWT + refresh token rotation

## Project Structure

```
src/                → React frontend
  components/       → UI components
  pages/            → Route pages
  api/              → API client and endpoint wrappers
  hooks/            → Data fetching, auth, install manifest, Lumiverse linking
  store/            → Zustand stores
  types/            → TypeScript types for characters, worldbooks, Chub API
backend/src/        → Hono API server
  routes/           → REST endpoints + WebSocket
  services/         → Business logic
  middleware/       → Auth, moderation, file upload, charx parsing, OpenGraph
  entities/         → TypeORM entities
```

## Getting Started

```bash
bun install
cd backend && bun install && cd ..
bun run dev:all
```

The backend expects a `DATABASE_URL` (PostgreSQL), `DISCORD_CLIENT_ID`, `DISCORD_SECRET_ID`, and `JWT_SECRET` in the environment. See `backend/src/config.ts` for the full list.

| Command | Description |
|---------|-------------|
| `bun run dev:all` | Start frontend + backend |
| `bun run dev:frontend` | Vite dev server only |
| `bun run dev:backend` | Backend in watch mode |
| `bun run build` | Production frontend build |
| `bun run lint` | ESLint |

## Roadmap

- Themes and presets (pages exist, content upload not yet wired up)
- NSFW detection (service exists but currently stubbed)
- Moderation tools