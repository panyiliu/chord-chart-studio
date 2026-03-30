# Build linux/arm64 images and export a single tar for: docker load -i <file>
# Run from repo root: .\scripts\export-docker-arm64.ps1 [output.tar]
#
# Windows: by default skips buildx (Docker Desktop gRPC / sharedkey bugs) and uses "docker build".
# Set CHORD_STUDIO_EXPORT_BUILDX_FIRST=1 to try buildx before docker build.
$ErrorActionPreference = "Continue"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

$Out = if ($args[0]) { $args[0] } else { "chord-chart-studio-stack-linux-arm64.tar" }
if (-not [IO.Path]::IsPathRooted($Out)) {
    $Out = Join-Path $Root $Out
}

$Platform = "linux/arm64"
$AppTag = "chord-chart-studio:local"
$ProxyTag = "chord-chart-studio-backup-proxy:local"
$IsWin = ($PSVersionTable.PSPlatform -eq "Win32NT") -or ($env:OS -eq "Windows_NT")
$BuildxFirst = ($env:CHORD_STUDIO_EXPORT_BUILDX_FIRST -eq "1")

function Invoke-Docker {
    param([string[]]$DockerArgv)
    & docker @DockerArgv
    return $LASTEXITCODE
}

function Pull-WithRetries {
    param(
        [string]$Image,
        [int]$MaxAttempts = 4
    )
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        Write-Host "==> docker pull --platform $Platform $Image (attempt $i/$MaxAttempts)"
        Invoke-Docker -DockerArgv @("pull", "--platform", $Platform, $Image)
        if ($LASTEXITCODE -eq 0) {
            return
        }
        Write-Warning "pull failed; waiting before retry..."
        Start-Sleep -Seconds (5 * $i)
    }
    Write-Error "Giving up on pull: $Image (exit $LASTEXITCODE). Try: Docker Desktop restart, vpn off, or docker pull manually."
    exit $LASTEXITCODE
}

function Pull-BasesForMainApp {
    Pull-WithRetries "node:20-alpine"
    Pull-WithRetries "nginx:1.27-alpine"
}

function Build-WithFallback {
    param(
        [string]$Tag,
        [string[]]$BuildArgs
    )
    Write-Host "==> buildx: $Tag ($Platform)"
    $buildxArgs = @("buildx", "build", "--platform", $Platform, "-t", $Tag, "--load") + $BuildArgs
    Invoke-Docker -DockerArgv $buildxArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "buildx failed for $Tag; falling back to docker build"
        Build-DockerWithRetries -Tag $Tag -BuildArgs $BuildArgs
    }
}

function Build-DockerWithRetries {
    param(
        [string]$Tag,
        [string[]]$BuildArgs,
        [int]$MaxAttempts = 3
    )
    for ($a = 1; $a -le $MaxAttempts; $a++) {
        Write-Host "==> docker build (attempt $a/$MaxAttempts): $Tag"
        $dockerArgs = @("build", "--platform", $Platform, "--pull", "-t", $Tag) + $BuildArgs
        Invoke-Docker -DockerArgv $dockerArgs
        if ($LASTEXITCODE -eq 0) {
            return
        }
        Write-Warning "docker build failed (exit $LASTEXITCODE); retry after delay..."
        Start-Sleep -Seconds (8 * $a)
    }
    Write-Error "docker build failed for $Tag after $MaxAttempts attempts."
    exit $LASTEXITCODE
}

function Require-LocalImage {
    param([string]$Tag)
    Invoke-Docker -DockerArgv @("image", "inspect", $Tag, "--format", "{{.Id}}") 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Image not found after build: $Tag"
        exit 1
    }
}

Write-Host "==> Prefer default buildx builder (ignore errors if unavailable)"
Invoke-Docker -DockerArgv @("buildx", "use", "default") 2>$null

if ($IsWin -and -not $BuildxFirst) {
    Write-Host "==> Windows: skipping buildx; using docker pull + docker build (set CHORD_STUDIO_EXPORT_BUILDX_FIRST=1 to try buildx first)"
    Pull-BasesForMainApp
    Build-DockerWithRetries -Tag $AppTag -BuildArgs @("-f", "Dockerfile", ".")
    # backup-proxy uses same node base; refresh to avoid corrupt manifest
    Pull-WithRetries "node:20-alpine"
    Build-DockerWithRetries -Tag $ProxyTag -BuildArgs @("-f", "packages/backup-proxy/Dockerfile", "packages/backup-proxy")
} else {
    Build-WithFallback -Tag $AppTag -BuildArgs @("-f", "Dockerfile", ".")
    Build-WithFallback -Tag $ProxyTag -BuildArgs @("-f", "packages/backup-proxy/Dockerfile", "packages/backup-proxy")
}

Write-Host "==> Verifying images exist"
Require-LocalImage -Tag $AppTag
Require-LocalImage -Tag $ProxyTag

Write-Host "==> Saving to $Out"
Invoke-Docker -DockerArgv @("save", "-o", $Out, $AppTag, $ProxyTag)
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker save failed (exit $LASTEXITCODE)"
    exit $LASTEXITCODE
}

$abs = (Resolve-Path -LiteralPath $Out).Path
Write-Host ""
Write-Host "============================================================"
Write-Host "OK: tar saved at:"
Write-Host "    $abs"
Write-Host "============================================================"
Write-Host "On target ARM64 host:"
Write-Host "    docker load -i $(Split-Path -Leaf $Out)"
Write-Host "    docker compose --env-file .env.example up -d"
