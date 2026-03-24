[![build](https://github.com/no-chris/chord-chart-studio/actions/workflows/build.yml/badge.svg)](https://github.com/no-chris/chord-chart-studio/actions/workflows/build.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/798258e3-e398-445f-aab0-3ebed107a749/deploy-status)](https://app.netlify.com/sites/chord-chart-studio/deploys)

# Chord Chart Studio

https://chord-chart-studio.netlify.app/

### Installation

From the repository root:

```
$ yarn install
```

### Build

From the repository root:

```
$ yarn run build
```

### Tests

In this package folder:

```
$ yarn test
```

### Local Development

In this package folder:

```
$ yarn run dev
```

This command starts a local development server on http://127.0.0.1:8084

### Cloud Backup (Backblaze B2 via Node proxy)

This project now supports private-bucket cloud backup by routing requests through a local Node proxy (to avoid browser CORS limitations on Backblaze native auth endpoints).

1. Start frontend app:

```bash
yarn workspace chord-chart-studio dev
```

2. Start backup proxy in another terminal:

```bash
yarn workspace backup-proxy dev
```

Proxy default: `http://localhost:8787`

3. Open app Settings -> Backup and fill:

- Account ID
- Application key
- Bucket name
- S3 Endpoint URL (example: `https://s3.us-east-005.backblazeb2.com`)
- Region (example: `us-east-005`)
- Node proxy URL (default: `http://localhost:8787`)
- Backup object key (example: `chord-chart-studio/backups/latest.json`)

4. Use buttons:

- Test connection
- Backup
- Restore (choose append or overwrite)

Single-version policy: backup writes to one fixed object key and proxy removes older versions for that key.

Tip: start both proxy + app together from repository root:

```bash
yarn dev:backup
```

### Manual Translation Editing (Chinese / English)

All UI translation pairs are centralized in:

- `packages/chord-chart-studio/src/ui/i18n/translations.js`

How to edit:

1. Open `translations.js`
2. Add or update key-value pairs in the export object:
   - key: source text (usually Chinese)
   - value: target text (usually English)
3. Keep keys quoted when they contain punctuation or special symbols.
4. Save and refresh dev page.

Example:

```js
{
  "备份": "Backup",
  "恢复默认": "Restore defaults"
}
```

Runtime language logic is in:

- `packages/chord-chart-studio/src/ui/i18n/I18nProvider.jsx`

It handles browser language detection, localStorage persistence, and the `t()` helper.
