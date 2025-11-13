# 异国小助手依赖安装脚本
Write-Host "🍜 异国小助手 - 依赖安装" -ForegroundColor Green
Write-Host ""

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 安装后端依赖
Write-Host "📦 安装后端依赖..." -ForegroundColor Blue
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
    exit 1
}

# 安装前端依赖
Write-Host "📦 安装前端依赖..." -ForegroundColor Blue
Set-Location client
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "🎉 所有依赖安装完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在可以运行以下命令启动服务器：" -ForegroundColor Cyan
Write-Host "PowerShell: .\start.ps1" -ForegroundColor White
Write-Host "或者双击: start.bat" -ForegroundColor White
Write-Host ""
Read-Host "按任意键退出"