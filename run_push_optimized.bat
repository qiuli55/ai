@echo off
cd /d "%~dp0"
echo ========================================
echo  上传优化后的代码到 GitHub
echo ========================================
echo.
python push_optimized.py
echo.
echo 上传完成！按任意键退出...
pause >nul
