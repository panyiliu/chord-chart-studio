# Chord Chart Studio

Chord Chart Studio is a tool to create, manage and format chord charts - e.g. song transcriptions made of chords and lyrics - for printing and viewing on screen. It can import and export songs from popular formats and websites, such as ChordPro and Ultimate Guitar.

Chord Chart Studio leverages the ChordMark format, which is the most powerful syntax to write chord charts.

See it in action here: https://chord-chart-studio.netlify.app

## Run with Docker

### 1) Local Docker run (app + backup proxy)

```bash
docker compose up -d --build
```

- App: `http://localhost:8080`
- Backup proxy: `http://localhost:8787`

Stop:

```bash
docker compose down
```

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

# Tag
docker tag chord-chart-studio:local ghcr.io/panyiliu/chord-chart-studio:latest
docker tag chord-chart-studio-backup-proxy:local ghcr.io/panyiliu/chord-chart-studio-backup-proxy:latest

# Push
docker push ghcr.io/panyiliu/chord-chart-studio:latest
docker push ghcr.io/panyiliu/chord-chart-studio-backup-proxy:latest
```

You can replace `latest` with a version tag such as `v0.14.0-ui-refactor`.

## Available packages

| Package name                                                                                                 | Desription                                                                        |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [chord-chart-studio](https://github.com/no-chris/chord-chart-studio/tree/master/packages/chord-chart-studio) | The main application source code                                                  |
| [documentation](https://github.com/no-chris/chord-chart-studio/tree/master/packages/documentation)           | The documentation website                                                         |
| [webextension](https://github.com/no-chris/chord-chart-studio/tree/master/packages/webextension)             | Highly experimental browser extension to import chord charts from other websites. |
| `backup-proxy`                                                                                                  | Local Node proxy for Backblaze B2 private-bucket backup (S3-compatible API).     |
