# Deployment guide (Docker)

This document describes what the Docker stack in this repository does, how to run it, and where application data lives. For a shorter quick start, see the [README](../README.md) “Run with Docker” section.

## What this fork adds (vs. upstream)

| Piece | Role |
| ----- | ---- |
| Root [`Dockerfile`](../Dockerfile) | Multi-stage build: Node/Yarn builds `packages/chord-chart-studio`, then Nginx serves static files from `/usr/share/nginx/html`. |
| [`docker-compose.yml`](../docker-compose.yml) | Two services: **chord-chart-studio** (Nginx + SPA) and **backup-proxy** (Node proxy for Backblaze B2). `restart: unless-stopped` on both. |
| [`docker/nginx/chord-chart-studio.conf`](../docker/nginx/chord-chart-studio.conf) | SPA routing, `try_files` for client routing; reverse proxy `/api/backup/` and `/health` to the `backup-proxy` container (zero-config backup URL in the browser when served from the same origin). |
| [`packages/backup-proxy/`](../packages/backup-proxy/) | Small Express app; forwards S3-compatible calls to B2 using credentials sent from the **browser** in request bodies (not stored on disk by the proxy). |
| [`.env.example`](../.env.example) | Template for host ports, image tags, and backup-proxy env vars. |

## Prerequisites

- Docker Engine and **Docker Compose V2** (`docker compose`, not legacy `docker-compose` where possible).
- Network access for the **build** stage (`yarn install`, `yarn workspace chord-chart-studio bundle`).

## Fastest start (clone and run)

From the repository root, **no need to copy `.env` first** if you pass the example file to Compose:

```bash
git clone https://github.com/<YOUR_FORK>/chord-chart-studio.git
cd chord-chart-studio
docker compose --env-file .env.example up -d --build
```

This injects all variables from `.env.example` into Compose interpolation (ports, image names, etc.) and avoids empty `APP_HOST_PORT`-style errors.

Alternative (equivalent):

```bash
cp .env.example .env
# edit .env if you change ports or image tags
docker compose up -d --build
```

### URLs (defaults from `.env.example`)

| Service | Default URL |
| ------- | ----------- |
| Web app | `http://localhost:8080` (maps host `APP_HOST_PORT` → container `APP_CONTAINER_PORT` 80) |
| Backup proxy (direct) | `http://localhost:8787` (`BACKUP_PROXY_HOST_PORT`) |
| Backup via app origin | Browser calls same origin `/api/backup/*`; Nginx proxies to backup-proxy. |

Health check (through Nginx): `GET /health` on the app port (proxied to backup-proxy).

### Stop and logs

```bash
docker compose down
docker compose logs -f
```

## Environment variables

See [`.env.example`](../.env.example) for comments. Main groups:

- **Ports**: `APP_HOST_PORT`, `APP_CONTAINER_PORT`, `BACKUP_PROXY_HOST_PORT`, `BACKUP_PROXY_CONTAINER_PORT`.
- **backup-proxy runtime**: `BACKUP_PROXY_PORT` (listen port inside the proxy container), `BACKUP_PROXY_CORS_ORIGIN`.
- **Image tags**: `CHORD_STUDIO_IMAGE`, `BACKUP_PROXY_IMAGE` (used by `docker compose` when not only building locally).

Do **not** commit a real `.env` with secrets; `.env` is listed in `.gitignore`. Do **not** paste Backblaze Account ID, application keys, or other backup credentials into any tracked file—configure cloud backup only in the app (browser) or in untracked local files.

## Where data lives

| Data | Location | Notes |
| ---- | -------- | ----- |
| Song library, editor state, UI settings | **End-user browser** (`localStorage`, key `state` and related keys) | Persisted by the SPA; **not** stored in the Nginx or backup-proxy containers. |
| Raw ChordMark conversion templates / options | Browser `localStorage` | See editor settings. |
| Backblaze B2 backup credentials | **Browser** (app settings / profiles) | Sent to **backup-proxy** only when you run backup operations; proxy uses them in memory for AWS SDK calls. |
| Objects in cloud backup | **Backblaze B2** bucket | Per user configuration. |
| backup-proxy container | **No application database on disk** | Stateless HTTP proxy; no durable server-side store for your charts. |

**Implication**: Redeploying or recreating containers does **not** delete user data as long as users use the **same browser profile**. Clearing site data or another device/browser starts from an empty local state unless you restore from export or cloud backup.

## Building and publishing images

Manual local tags and GHCR push steps are documented in the [README](../README.md) (“Build images manually”, “Publish Docker images to GHCR”).

## Troubleshooting: graceful shutdown (SIGTERM)

If logs show nginx workers exiting with code `0` or `npm` reporting `signal SIGTERM`, something **outside** the app (Docker stop, host reboot, Portainer, Watchtower, CI deploy) asked the container to stop. This is not an application “crash loop.”

See the [README](../README.md) section **“Docker: containers stopping on a schedule (SIGTERM / graceful shutdown)”** for `docker events` / `journalctl` hints and a checklist (cron, Watchtower, etc.).

## Default branch and fork workflow

This repository’s Docker workflow is maintained on the fork default branch that includes `docker-compose.yml` and the files above. After cloning, if your checkout **does not** contain `docker-compose.yml`, switch to the branch that includes Docker (e.g. `feat/full-ui-ai-refactor-*` or the fork `main`/`master` that was reset to that line of work).
