@echo off
echo 🍜 启动异国小助手服务器...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本:
node --version
echo.

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 📦 正在安装后端依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查前端依赖
if not exist "client\node_modules" (
    echo 📦 正在安装前端依赖...
    call cd client
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
    call cd ..
)

echo.
echo 🚀 启动服务器...
echo 后端服务器: http://localhost:3000
echo 前端开发服务器: http://localhost:3001
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动后端服务器
start "异国小助手-后端" cmd /k "node server.js"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端开发服务器
call cd client
start "异国小助手-前端" cmd /k "npm run dev"

echo.
echo ✅ 服务器启动完成！
echo 🌐 请在浏览器中访问: http://localhost:3001
echo 📧 请配置 .env 文件中的邮箱设置以启用邮件通知功能
echo.
pause