# speek MySQL init (Windows native 8.0.40 ZIP)
$zip   = "E:\mysql.zip"
$root  = "E:\mysql-8.0.40-winx64"
$bin   = Join-Path $root "bin"
$data  = Join-Path $root "data"
$myini = Join-Path $root "my.ini"

if (-not (Test-Path $root)) {
    Write-Output "[1/6] extracting"
    Expand-Archive -Path $zip -DestinationPath "E:\" -Force
} else {
    Write-Output "[1/6] already extracted"
}

Write-Output "[2/6] write my.ini"
$lines = @(
  "[mysqld]",
  "basedir=E:/mysql-8.0.40-winx64",
  "datadir=E:/mysql-8.0.40-winx64/data",
  "port=3306",
  "character-set-server=utf8mb4",
  "collation-server=utf8mb4_general_ci",
  "default_authentication_plugin=mysql_native_password",
  "enable-named-pipe",
  "shared-memory"
)
Set-Content -Path $myini -Value ($lines -join "`n") -Encoding ASCII

if (-not (Test-Path $data)) {
    Write-Output "[3/6] init data dir (insecure)"
    & "$bin\mysqld.exe" --defaults-file="$myini" --initialize-insecure
} else {
    Write-Output "[3/6] data exists, skip"
}

Write-Output "[4/6] install service MySQL80"
& "$bin\mysqld.exe" --defaults-file="$myini" --install MySQL80
Start-Sleep -Seconds 2

Write-Output "[5/6] start service"
net start MySQL80
Start-Sleep -Seconds 4

Write-Output "[6/6] create db + user"
$sql = "CREATE DATABASE IF NOT EXISTS speek CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; CREATE USER IF NOT EXISTS 'speek'@'localhost' IDENTIFIED WITH mysql_native_password BY 'speek_pass'; CREATE USER IF NOT EXISTS 'speek'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'speek_pass'; GRANT ALL PRIVILEGES ON speek.* TO 'speek'@'localhost'; GRANT ALL PRIVILEGES ON speek.* TO 'speek'@'127.0.0.1'; FLUSH PRIVILEGES;"
& "$bin\mysql.exe" -u root --protocol=PIPE -e $sql
if ($LASTEXITCODE -eq 0) {
    Write-Output "MySQL ready: db=speek user=speek pass=speek_pass on 127.0.0.1:3306"
} else {
    Write-Output "root PIPE failed, retry TCP"
    & "$bin\mysql.exe" -u root -h 127.0.0.1 --protocol=TCP -e $sql
}
