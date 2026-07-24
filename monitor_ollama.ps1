# Ollama + GPU 实时监控脚本
# 右键 -> 用 PowerShell 运行

# 清屏
Clear-Host

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       Ollama 本地模型监控面板" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Ollama 进程
$ollamaProc = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if ($ollamaProc) {
    Write-Host "✅ Ollama 进程: 运行中 (PID $($ollamaProc.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Ollama 进程: 未运行" -ForegroundColor Red
}

# 端口 11434
try {
    $portCheck = netstat -ano | Select-String ":11434.*LISTENING"
    if ($portCheck) {
        Write-Host "✅ 端口 11434: 监听中" -ForegroundColor Green
    } else {
        Write-Host "❌ 端口 11434: 未监听" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  端口检查失败" -ForegroundColor Yellow
}

Write-Host ""

# Ollama 已加载的模型
Write-Host "--- 当前加载的模型 ---" -ForegroundColor Yellow
try {
    $ps = Invoke-RestMethod -Uri "http://localhost:11434/api/ps" -TimeoutSec 5
    if ($ps.models -and $ps.models.Count -gt 0) {
        foreach ($m in $ps.models) {
            $vramGB = [math]::Round($m.size_vram / 1GB, 2)
            Write-Host "📦 $($m.name)  |  显存: ${vramGB}GB  |  上下文: $($m.context_length)" -ForegroundColor Green
        }
    } else {
        Write-Host "   (无模型加载在显存中)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 无法连接 Ollama API（可能未运行）" -ForegroundColor Red
}

Write-Host ""

# 可用模型列表
Write-Host "--- 已安装的模型 ---" -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 5
    if ($tags.models -and $tags.models.Count -gt 0) {
        foreach ($m in $tags.models) {
            $sizeGB = [math]::Round($m.size / 1GB, 2)
            Write-Host "   $($m.name)  ($($m.details.parameter_size), $($m.details.quantization_level), ${sizeGB}GB)"
        }
    } else {
        Write-Host "   (无模型)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 无法获取模型列表" -ForegroundColor Red
}

Write-Host ""

# GPU 状态
Write-Host "--- GPU 状态 (NVIDIA RTX 4060) ---" -ForegroundColor Yellow
try {
    $gpu = & nvidia-smi --query-gpu=temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits 2>$null
    if ($gpu) {
        $parts = $gpu -split ', ' | ForEach-Object { $_.Trim() }
        $temp = $parts[0]
        $util = $parts[1]
        $memUsed = [int]$parts[2]
        $memTotal = [int]$parts[3]
        $memPct = [math]::Round($memUsed / $memTotal * 100, 1)
        $memUsedGB = [math]::Round($memUsed / 1024, 1)
        $memTotalGB = [math]::Round($memTotal / 1024, 1)

        Write-Host "🌡️  温度: ${temp}°C" -ForegroundColor $(if ([int]$temp -gt 75) { "Red" } else { "White" })
        Write-Host "⚡  使用率: ${util}%" -ForegroundColor $(if ([int]$util -gt 80) { "Yellow" } else { "White" })
        Write-Host "💾 显存: ${memUsedGB}/${memTotalGB} GB (${memPct}%)" -ForegroundColor $(if ($memPct -gt 85) { "Red" } elseif ($memPct -gt 60) { "Yellow" } else { "Green" })
    } else {
        Write-Host "   (无法获取 GPU 信息)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   (nvidia-smi 不可用)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "按任意键刷新，关闭窗口退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
