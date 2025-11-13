#!/bin/bash

echo "🍜 启动异国小助手服务器..."
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本:"
node --version
echo

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装后端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 后端依赖安装失败"
        exit 1
    fi
fi

# 检查前端依赖
if [ ! -d "client/node_modules" ]; then
    echo "📦 正在安装前端依赖..."
    cd client
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
    cd ..
fi

echo
echo "🚀 启动服务器..."
echo "后端服务器: http://localhost:3000"
echo "前端开发服务器: http://localhost:3001"
echo
echo "按 Ctrl+C 停止服务器"
echo

# 启动后端服务器
node server.js &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端开发服务器
cd client
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ 服务器启动完成！"
echo "🌐 请在浏览器中访问: http://localhost:3001"
echo "📧 请配置 .env 文件中的邮箱设置以启用邮件通知功能"
echo

# 等待用户中断
wait