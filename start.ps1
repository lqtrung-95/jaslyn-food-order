# 异国小助手 PowerShell 启动脚本
Write-Host "🍜 启动异国小助手服务器..." -ForegroundColor Green
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""

# 检查后端依赖是否安装
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 正在安装后端依赖..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
        Read-Host "按任意键退出"
        exit 1
    }
    Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
}

# 检查前端依赖
if (-not (Test-Path "client\node_modules")) {
    Write-Host "📦 正在安装前端依赖..." -ForegroundColor Blue
    Set-Location client
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
        Set-Location ..
        Read-Host "按任意键退出"
        exit 1
    }
    Set-Location ..
    Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 启动服务器..." -ForegroundColor Green
Write-Host "后端服务器: http://localhost:3000" -ForegroundColor Cyan
Write-Host "前端开发服务器: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动后端服务器
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.js
}

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端开发服务器
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\client
    npm run dev
}

Write-Host ""
Write-Host "✅ 服务器启动完成！" -ForegroundColor Green
Write-Host "🌐 请在浏览器中访问: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📧 请配置 .env 文件中的邮箱设置以启用邮件通知功能" -ForegroundColor Yellow
Write-Host ""

# 显示实时输出
try {
    while ($true) {
        Receive-Job $backendJob -ErrorAction SilentlyContinue | Write-Host
        Receive-Job $frontendJob -ErrorAction SilentlyContinue | Write-Host
        Start-Sleep -Milliseconds 100
    }
} finally {
    # 清理后台任务
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    Write-Host "服务器已停止" -ForegroundColor Yellow
}