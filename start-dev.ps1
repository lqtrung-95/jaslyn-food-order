# 同时启动前后端的 PowerShell 脚本
# 使用方法: .\start-dev.ps1

Write-Host "🚀 启动异国小助手开发环境..." -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# 检查是否存在 client 依赖
if (-not (Test-Path "client/node_modules")) {
    Write-Host "📦 首次运行，安装前端依赖..." -ForegroundColor Yellow
    cd client
    npm install
    cd ..
}

Write-Host ""
Write-Host "✅ 开始启动服务..." -ForegroundColor Green
Write-Host ""

# 启动后端
Write-Host "🔧 后端启动中 (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PWD'; npm run dev`""

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端
Write-Host "⚛️  前端启动中 (http://localhost:5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PWD/client'; npm run dev`""

Write-Host ""
Write-Host "=========================" -ForegroundColor Green
Write-Host "✨ 开发环境已启动！" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 访问应用:" -ForegroundColor Yellow
Write-Host "  前端: http://localhost:5173" -ForegroundColor White
Write-Host "  后端 API: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Yellow
Write-Host "  - 前端代码改动会自动刷新" -ForegroundColor White
Write-Host "  - 后端代码改动会自动重启" -ForegroundColor White
Write-Host "  - 按 Ctrl+C 停止任一服务" -ForegroundColor White
Write-Host ""
