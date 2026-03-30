# Build linux/arm64 images and export a single tar for: docker load -i <file>
# Run from repo root: .\scripts\export-docker-arm64.ps1 [output.tar]
# If docker buildx fails (e.g. Docker Desktop gRPC issues), falls back to docker build.
$ErrorActionPreference = "Continue"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

$Out = if ($args[0]) { $args[0] } else { "chord-chart-studio-stack-linux-arm64.tar" }
$Platform = "linux/arm64"
$AppTag = "chord-chart-studio:local"
$ProxyTag = "chord-chart-studio-backup-proxy:local"

function Build-WithFallback {
    param(
        [string]$Tag,
        [string[]]$BuildArgs
    )
    Write-Host "==> buildx: $Tag ($Platform)"
    $buildxArgs = @("buildx", "build", "--platform", $Platform, "-t", $Tag, "--load") + $BuildArgs
    & docker @buildxArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "buildx failed for $Tag; falling back to docker build"
        $dockerArgs = @("build", "--platform", $Platform, "-t", $Tag) + $BuildArgs
        & docker @dockerArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "docker build failed for $Tag (exit $LASTEXITCODE)"
            exit $LASTEXITCODE
        }
    }
}

function Require-LocalImage {
    param([string]$Tag)
    & docker image inspect $Tag 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Image not found after build: $Tag"
        exit 1
    }
}

Write-Host "==> Prefer default buildx builder (ignore errors if unavailable)"
& docker buildx use default 2>$null

Build-WithFallback -Tag $AppTag -BuildArgs @("-f", "Dockerfile", ".")
Build-WithFallback -Tag $ProxyTag -BuildArgs @("-f", "packages/backup-proxy/Dockerfile", "packages/backup-proxy")

Write-Host "==> Verifying images exist"
Require-LocalImage -Tag $AppTag
Require-LocalImage -Tag $ProxyTag

Write-Host "==> Saving to $Out"
& docker save -o $Out $AppTag $ProxyTag
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker save failed (exit $LASTEXITCODE)"
    exit $LASTEXITCODE
}

Write-Host "==> Done. Copy $Out to the target ARM64 host, then:"
Write-Host "    docker load -i $(Split-Path -Leaf $Out)"
Write-Host "    docker compose --env-file .env.example up -d"
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace