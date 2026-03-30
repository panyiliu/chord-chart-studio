#!/usr/bin/env bash
# Build linux/arm64 images and export a single tar for: docker load -i <file>
# Usage: from repo root: bash scripts/export-docker-arm64.sh [output.tar]
# If docker buildx fails (e.g. Docker Desktop gRPC issues), falls back to docker build.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="${1:-chord-chart-studio-stack-linux-arm64.tar}"
PLATFORM="linux/arm64"
APP_TAG="chord-chart-studio:local"
PROXY_TAG="chord-chart-studio-backup-proxy:local"

echo "==> Prefer default buildx builder (ignore errors if unavailable)"
docker buildx use default 2>/dev/null || true

try_buildx_then_docker() {
	local tag="$1"
	shift
	if docker buildx build --platform "${PLATFORM}" -t "${tag}" --load "$@"; then
		return 0
	fi
	echo "WARN: buildx failed for ${tag}; falling back to docker build" >&2
	docker build --platform "${PLATFORM}" -t "${tag}" "$@"
}

require_local_image() {
	local tag="$1"
	if ! docker image inspect "${tag}" >/dev/null 2>&1; then
		echo "ERROR: image not found after build: ${tag}" >&2
		exit 1
	fi
}

echo "==> Building ${APP_TAG} (${PLATFORM})"
try_buildx_then_docker "${APP_TAG}" -f Dockerfile .

echo "==> Building ${PROXY_TAG} (${PLATFORM})"
try_buildx_then_docker "${PROXY_TAG}" -f packages/backup-proxy/Dockerfile packages/backup-proxy

echo "==> Verifying images exist"
require_local_image "${APP_TAG}"
require_local_image "${PROXY_TAG}"

echo "==> Saving to ${OUT}"
docker save -o "${OUT}" "${APP_TAG}" "${PROXY_TAG}"

echo "==> Done. Copy ${OUT} to the target ARM64 host, then:"
echo "    docker load -i $(basename "${OUT}")"
echo "    docker compose --env-file .env.example up -d"
echo "==> Verify architecture:"
echo "    docker image inspect ${APP_TAG} --format '{{.Architecture}}'"
