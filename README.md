# Chord Chart Studio

Chord Chart Studio is a tool to create, manage and format chord charts - e.g. song transcriptions made of chords and lyrics - for printing and viewing on screen. It can import and export songs from popular formats and websites, such as ChordPro and Ultimate Guitar.

Chord Chart Studio leverages the ChordMark format, which is the most powerful syntax to write chord charts.

See it in action here: https://chord-chart-studio.netlify.app

**Docker deployment (full detail: stack, data locations, troubleshooting):** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Run with Docker

### 1) Local Docker run (app + backup proxy)

Recommended (uses `.env.example` for Compose variables without creating `.env` first):

```bash
docker compose --env-file .env.example up -d --build
```

Alternatively, copy the template and edit values (ports, image tags, proxy CORS):

```bash
cp .env.example .env
docker compose up -d --build
```

- App: `http://localhost:${APP_HOST_PORT}` (default `8080`)
- Backup proxy: `http://localhost:${BACKUP_PROXY_HOST_PORT}` (default `8787`)

For Docker deployment, frontend backup requests are reverse-proxied by Nginx from `/api/backup/*` to the backup-proxy container, so users usually do not need to set `Node proxy URL` manually in Settings.

Stop:

```bash
docker compose down
```

Both services use `restart: unless-stopped` in `docker-compose.yml`: after a Docker daemon restart or an unexpected container exit, they are started again automatically. They stay stopped if you run `docker compose down` or `docker stop` (until you start them again).

### Docker: containers “stopping on a schedule” (SIGTERM / graceful shutdown)

If logs show nginx `gracefully shutting down` with exit code `0`, or Node/npm `signal SIGTERM`, that usually means **something outside the app** asked Docker to stop the container (normal shutdown), not an application crash.

**1) See who stopped containers around a given time** (on the host; adjust the time window):

```bash
docker events --since '2026-03-26T19:15:00' --until '2026-03-26T19:25:00' --filter 'type=container'
```

```bash
journalctl -u docker --since "2026-03-26 19:00" --until "2026-03-26 19:30"
```

Correlate with host reboots:

```bash
journalctl --list-boots
journalctl -b -1 | head
```

**2) Check common causes of periodic stops or recreates**

| Area | What to check |
|------|----------------|
| Watchtower / similar | Any container that auto-pulls images and recreates stacks |
| Portainer / UI | Scheduled stacks, stack updates, or manual stop |
| Cron | `crontab -l` (root and deploy user); `/etc/cron.*`; scripts calling `docker compose` or `docker stop` |
| CI/CD | Pipelines that deploy and run `docker compose up --force-recreate` |
| Host maintenance | `unattended-upgrades`, scheduled reboots |

The application images in this repo do not implement a “timed shutdown”; investigate the host and orchestration layer instead.

### 2) Build images manually

```bash
# App image
docker build -t chord-chart-studio:local .

# Backup proxy image
docker build -t chord-chart-studio-backup-proxy:local ./packages/backup-proxy
```

### 3) Publish Docker images to GHCR

```bash
# Login (PAT needs write:packages)
echo <GH_PAT> | docker login ghcr.io -u <github-username> --password-stdin

# Tag (replace YOUR_GITHUB_USER with your GitHub username or org)
docker tag chord-chart-studio:local ghcr.io/YOUR_GITHUB_USER/chord-chart-studio:latest
docker tag chord-chart-studio-backup-proxy:local ghcr.io/YOUR_GITHUB_USER/chord-chart-studio-backup-proxy:latest

# Push
docker push ghcr.io/YOUR_GITHUB_USER/chord-chart-studio:latest
docker push ghcr.io/YOUR_GITHUB_USER/chord-chart-studio-backup-proxy:latest
```

You can replace `latest` with a version tag such as `v0.14.0-ui-refactor`.

## Available packages

| Package name                                                                                                 | Desription                                                                        |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [chord-chart-studio](https://github.com/no-chris/chord-chart-studio/tree/master/packages/chord-chart-studio) | The main application source code                                                  |
| [documentation](https://github.com/no-chris/chord-chart-studio/tree/master/packages/documentation)           | The documentation website                                                         |
| [webextension](https://github.com/no-chris/chord-chart-studio/tree/master/packages/webextension)             | Highly experimental browser extension to import chord charts from other websites. |
| `backup-proxy`                                                                                                  | Local Node proxy for Backblaze B2 private-bucket backup (S3-compatible API).     |
