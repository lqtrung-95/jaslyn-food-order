@echo off
echo 🍜 启动异国小助手...
echo.

REM 启动后端服务器
echo 🚀 启动后端服务器 (端口 3000)...
start "后端服务器" cmd /k "cd /d %~dp0 && node server.js"

REM 等待3秒
timeout /t 3 /nobreak >nul

REM 启动前端服务器
echo 🚀 启动前端服务器 (端口 3001)...
start "前端服务器" cmd /k "cd /d %~dp0\client && npm run dev"

echo.
echo ✅ 服务器启动完成！
echo 🌐 前端地址: http://localhost:3001
echo 🔧 后端API: http://localhost:3000
echo.
echo 💡 提示: 请配置 .env 文件中的邮箱设置以启用邮件通知
echo.
pause