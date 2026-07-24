# Ollama 实时监控（每3秒自动刷新）
# 右键 -> 用 PowerShell 运行

while ($true) {
    Clear-Host
    
    # ======== 头部 ========
    $time = Get-Date -Format "HH:mm:ss"
    Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     Ollama 本地模型实时监控  [$time]    ║" -ForegroundColor Cyan
    Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Cyan

    # ======== 模型状态 ========
    try {
        $ps = Invoke-RestMethod -Uri "http://localhost:11434/api/ps" -TimeoutSec 3
        if ($ps.models -and $ps.models.Count -gt 0) {
            foreach ($m in $ps.models) {
                $vramGB = [math]::Round($m.size_vram / 1GB, 2)
                $exp = [datetime]::Parse($m.expires_at)
                $remaining = $exp - (Get-Date)
                $minLeft = [math]::Round($remaining.TotalMinutes, 1)
                Write-Host "║  📦 $($m.name)  ●  ${vramGB}GB  │ ${minLeft}min 剩余" -ForegroundColor Green
            }
        } else {
            Write-Host "║  💤 模型未加载" -ForegroundColor Gray
        }
    } catch {
        Write-Host "║  ❌ Ollama 未连接" -ForegroundColor Red
    }

    # ======== GPU ========
    try {
        $gpu = & nvidia-smi --query-gpu=temperature.gpu,utilization.gpu,memory.used,memory.total,utilization.memory --format=csv,noheader,nounits 2>$null
        if ($gpu) {
            $p = $gpu -split ', ' | ForEach-Object { $_.Trim() }
            $t = $p[0]; $gu = $p[1]; $mu = $p[2]; $mt = $p[3]; $mgu = $p[4]
            $mp = [math]::Round([int]$mu/[int]$mt*100,1)
            $fg = if ($mp -gt 80) { "Red" } elseif ($mp -gt 60) { "Yellow" } else { "White" }
            Write-Host "║  🌡️  ${t}°C  ⚡${gu}%  💾${mu}/$($mt)MB (${mp}%)" -ForegroundColor $fg
        }
    } catch {}

    Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
    
    # 显存条
    try {
        $gpu2 = & nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader,nounits 2>$null
        if ($gpu2) {
            $p2 = $gpu2 -split ', '
            $umem = [int]$p2[0]; $tmem = [int]$p2[1]
            $barLen = 30
            $filled = [math]::Round($umem / $tmem * $barLen)
            $bar = ""
            $bar += "#" * $filled
            $bar += "." * ($barLen - $filled)
            $pct = [math]::Round($umem / $tmem * 100, 1)
            Write-Host "[$bar]" -NoNewline -ForegroundColor $(if ($pct -gt 80){"Red"}elseif($pct -gt 60){"Yellow"}else{"Green"})
            Write-Host " ${pct}%  ($umem / $tmem MB)" -ForegroundColor Gray
        }
    } catch {}

    Write-Host ""
    Write-Host "  Ctrl+C 退出  |  每3秒自动刷新" -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
}
