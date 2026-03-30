# Build linux/arm64 images and export a single tar for: docker load -i <file>
# Run from repo root: .\scripts\export-docker-arm64.ps1 [output.tar]
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

$Out = if ($args[0]) { $args[0] } else { "chord-chart-studio-stack-linux-arm64.tar" }
$Platform = "linux/arm64"
$AppTag = "chord-chart-studio:local"
$ProxyTag = "chord-chart-studio-backup-proxy:local"

Write-Host "==> Building $AppTag ($Platform)"
docker buildx build --platform $Platform -t $AppTag --load -f Dockerfile .

Write-Host "==> Building $ProxyTag ($Platform)"
docker buildx build --platform $Platform -t $ProxyTag --load -f packages/backup-proxy/Dockerfile packages/backup-proxy

Write-Host "==> Saving to $Out"
docker save -o $Out $AppTag $ProxyTag

Write-Host "==> Done. Copy $Out to the target ARM64 host, then:"
Write-Host "    docker load -i $(Split-Path -Leaf $Out)"
Write-Host "    docker compose --env-file .env.example up -d"
