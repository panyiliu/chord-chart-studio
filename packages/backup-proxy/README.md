# backup-proxy

Node proxy for Chord Chart Studio cloud backup on Backblaze B2 (S3-compatible API).

## Why this exists

Browser direct requests to `api.backblazeb2.com/b2api/...` are blocked by CORS in dev/prod for private buckets.
This proxy runs server-side and talks to Backblaze using S3-compatible APIs, then exposes local HTTP endpoints for the frontend.

## Start

From repository root:

```bash
yarn workspace backup-proxy dev
```

Default URL: `http://localhost:8787`

Optional env vars:

- `BACKUP_PROXY_PORT` (default `8787`)
- `BACKUP_PROXY_CORS_ORIGIN` (default `*`)

See `.env.example` for a starting point.

## API endpoints

- `GET /health`
- `POST /api/backup/test`
- `POST /api/backup/count`
- `POST /api/backup/upload`
- `POST /api/backup/download`

All `POST` endpoints accept JSON body:

```json
{
  "accountId": "B2/S3 key id",
  "applicationKey": "B2/S3 app key",
  "bucketName": "bucket name",
  "objectKey": "chord-chart-studio/backups/latest.json",
  "endpointUrl": "https://s3.us-east-005.backblazeb2.com",
  "regionName": "us-east-005"
}
```

For `upload`, include:

```json
{
  "jsonText": "{...state json...}"
}
```

## Single-version behavior

This proxy uses a fixed `objectKey` and, after upload, deletes older versions of the same key.
Result: cloud keeps only one latest backup version.

