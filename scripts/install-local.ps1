<#
.SYNOPSIS
    构建 Gemineko Hive Bundle 并部署至 Google Antigravity 全局插件目录。
#>
param(
    [string]$TargetDir = $(Join-Path $env:USERPROFILE ".gemini\config\plugins\gemineko-hive")
)

$ErrorActionPreference = "Stop"
$SourceDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Write-Host "[gemineko-hive] 正在构建单文件运行时 dist/gemineko-hive.js..."
Push-Location $SourceDir
try {
    node scripts/build-bundle.mjs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "[gemineko-hive] 正在部署至 $TargetDir ..."
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$rootFiles = @("plugin.json", "agy-market.json", "package.json", "LICENSE", "README.md", "CHANGELOG.md")
foreach ($file in $rootFiles) {
    $src = Join-Path $SourceDir $file
    if (Test-Path $src) {
        Copy-Item -Force $src (Join-Path $TargetDir $file)
    }
}

$copyDirs = @("assets", "bin", "dist", "docs", "rules", "scripts", "sidecars", "skills", "src", "themes")
foreach ($dir in $copyDirs) {
    $srcSub = Join-Path $SourceDir $dir
    $dstSub = Join-Path $TargetDir $dir
    if (-not (Test-Path $srcSub)) { continue }
    New-Item -ItemType Directory -Force -Path $dstSub | Out-Null
    Get-ChildItem -Path $srcSub -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($srcSub.Length).TrimStart('\', '/')
        $dstFile = Join-Path $dstSub $rel
        $dstParent = Split-Path -Parent $dstFile
        if (-not (Test-Path $dstParent)) {
            New-Item -ItemType Directory -Force -Path $dstParent | Out-Null
        }
        Copy-Item -Force $_.FullName $dstFile
    }
}

Write-Host "[gemineko-hive] 部署完成！可执行 node `"$TargetDir\bin\gemineko-hive.mjs`" apply 为原生 Swarm 换肤。"
