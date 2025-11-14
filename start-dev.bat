@echo off
chcp 65001 >nul
cls

echo.
echo ============================================
echo  🚀 异国小助手 - 启动开发环境
echo ============================================
echo.

REM 检查并安装前端依赖
if not exist "client\node_modules" (
    echo 📦 首次运行，安装前端依赖...
    cd client
    call npm install
    cd ..
    echo.
)

echo 正在启动服务...
echo.

REM 启动后端（新窗口）
echo 🔧 启动后端服务器 (http://localhost:3000)...
start cmd /k "npm run dev"

REM 等待2秒
timeout /t 2 /nobreak

REM 启动前端（新窗口）
echo ⚛️  启动前端开发服务器 (http://localhost:5173)...
start cmd /k "cd client && npm run dev"

timeout /t 1 /nobreak

echo.
echo ============================================
echo ✨ 开发环境已启动！
echo ============================================
echo.
echo 📱 访问地址:
echo   • 前端应用: http://localhost:5173
echo   • 后端 API: http://localhost:3000/api
echo.
echo 💡 提示:
echo   • 前端改动会自动刷新 (Hot Reload)
echo   • 后端改动会自动重启
echo   • 关闭任一窗口即可停止对应服务
echo.
pause
