@echo off
chcp 65001 >nul
echo ==============================
echo  NOVA frp 客户端启动中...
echo ==============================
echo.
echo 访问地址: http://159.75.222.60:17860
echo 按 Ctrl+C 停止
echo.
frpc.exe -c frpc.toml
pause
