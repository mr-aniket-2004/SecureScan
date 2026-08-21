# 1. Target directory inside User AppData
$installDir = "$env:LOCALAPPDATA\SecScan"
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# 2. Download compiled binary directly from your v1 release asset
$exeUrl = "https://github.com/mr-aniket-2004/SecureScan/releases/download/v1/securescan.exe"
$exePath = Join-Path $installDir "securescan.exe"

Write-Host "📥 Downloading SecScan CLI..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $exeUrl -OutFile $exePath

# 3. Append folder to User System PATH automatically
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
    Write-Host "✅ SecScan installed successfully!" -ForegroundColor Green
    Write-Host "💡 Restart your terminal and run 'securescan' inside any project directory." -ForegroundColor Yellow
} else {
    Write-Host "✅ SecScan updated to the latest version!" -ForegroundColor Green
}