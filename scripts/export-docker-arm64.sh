#!/usr/bin/env bash
# Build linux/arm64 images and export a single tar for: docker load -i <file>
# Usage: from repo root: bash scripts/export-docker-arm64.sh [output.tar]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="${1:-chord-chart-studio-stack-linux-arm64.tar}"
PLATFORM="linux/arm64"
APP_TAG="chord-chart-studio:local"
PROXY_TAG="chord-chart-studio-backup-proxy:local"

echo "==> Building ${APP_TAG} (${PLATFORM})"
docker buildx build --platform "${PLATFORM}" -t "${APP_TAG}" --load -f Dockerfile .

echo "==> Building ${PROXY_TAG} (${PLATFORM})"
docker buildx build --platform "${PLATFORM}" -t "${PROXY_TAG}" --load -f packages/backup-proxy/Dockerfile packages/backup-proxy

echo "==> Saving to ${OUT}"
docker save -o "${OUT}" "${APP_TAG}" "${PROXY_TAG}"

echo "==> Done. Copy ${OUT} to the target ARM64 host, then:"
echo "    docker load -i $(basename "${OUT}")"
echo "    docker compose --env-file .env.example up -d"
echo "==> Verify architecture:"
echo "    docker image inspect ${APP_TAG} --format '{{.Architecture}}'"
