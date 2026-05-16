# Run this script as Administrator in PowerShell
# Right-click PowerShell -> "Run as administrator", then:
# cd "c:\Users\Diogo\Claude_Code\StockFramework"
# .\setup-postgres.ps1

$pgData = "C:\Program Files\PostgreSQL\17\data"
$pgBin  = "C:\Program Files\PostgreSQL\17\bin"
$hba    = "$pgData\pg_hba.conf"

Write-Host "Step 1: Temporarily enable trust auth..."
$hbaContent = Get-Content $hba -Raw
$hbaContent = $hbaContent -replace "127\.0\.0\.1/32\s+scram-sha-256", "127.0.0.1/32            trust"
$hbaContent = $hbaContent -replace "::1/128\s+scram-sha-256",          "::1/128                 trust"
Set-Content $hba $hbaContent -Encoding utf8

Write-Host "Step 2: Restarting PostgreSQL..."
Restart-Service postgresql-x64-17
Start-Sleep -Seconds 3

Write-Host "Step 3: Setting postgres password and creating database..."
$env:PGPASSWORD = ""
& "$pgBin\psql.exe" -U postgres -h 127.0.0.1 -c "ALTER USER postgres WITH PASSWORD 'stockframework';"
& "$pgBin\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE stockframework OWNER postgres;"

Write-Host "Step 4: Restoring scram-sha-256 auth..."
$hbaContent = Get-Content $hba -Raw
$hbaContent = $hbaContent -replace "127\.0\.0\.1/32\s+trust", "127.0.0.1/32            scram-sha-256"
$hbaContent = $hbaContent -replace "::1/128\s+trust",          "::1/128                 scram-sha-256"
Set-Content $hba $hbaContent -Encoding utf8

Write-Host "Step 5: Restarting PostgreSQL with secure auth..."
Restart-Service postgresql-x64-17
Start-Sleep -Seconds 3

Write-Host "Step 6: Verifying connection..."
$env:PGPASSWORD = "stockframework"
& "$pgBin\psql.exe" -U postgres -h 127.0.0.1 -d stockframework -c "SELECT 'Connected successfully' AS status;"

Write-Host ""
Write-Host "Done! Now run: cd app && npx prisma migrate deploy"
