Param(
  [string]$ProjectRoot = "D:\ProjectBuild\projects\mpsone\mpsone",
  [string]$Container = "mpsone-db",
  [string]$User = "mpsone_dev",
  [string]$Pass = "devpass",
  [string]$Db = "mpsone_dev"
)

$MigDir = Join-Path $ProjectRoot "db\migrations"
Write-Host "Using container=$Container user=$User db=$Db"

# Ensure containers are running (auto-start compose if needed)
$composeDir = Join-Path $ProjectRoot "db"
$running = (& docker ps --format "{{.Names}}" | Select-String -SimpleMatch $Container)
if (-not $running) {
  Write-Host ">> Starting Docker compose stack..."
  Push-Location $composeDir
  try {
    & docker compose up -d
  } finally {
    Pop-Location
  }
}

# Wait for MySQL to be ready
Write-Host ">> Waiting for MySQL to be ready..."
for ($i = 0; $i -lt 60; $i++) {
  $res = & docker exec $Container mysqladmin ping -h 127.0.0.1 -u$User -p$Pass --silent 2>$null
  if ($LASTEXITCODE -eq 0) { Write-Host ">> MySQL is ready"; break }
  Start-Sleep -Seconds 2
}

Get-ChildItem -Path $MigDir -Filter *.sql | Sort-Object Name | ForEach-Object {
  Write-Host ">> Importing $($_.FullName)"
  docker exec -i $Container mysql --force -h 127.0.0.1 -u$User -p$Pass $Db < $_.FullName
}

Write-Host ">> All migrations imported successfully."
