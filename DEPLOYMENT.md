# 🚀 异国小助手部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn
- Git

### 2. 服务器要求
- 1GB RAM 或更高
- 10GB 存储空间
- Ubuntu 20.04+ / CentOS 8+ / Windows Server

## 🔧 本地开发部署

### Windows 用户
```bash
# 1. 双击运行启动脚本
start.bat

# 2. 或者手动启动
npm install
cd client && npm install && cd ..
node server.js &
cd client && npm run dev
```

### macOS/Linux 用户
```bash
# 1. 给脚本执行权限
chmod +x start.sh

# 2. 运行启动脚本
./start.sh

# 3. 或者手动启动
npm install
cd client && npm install && cd ..
node server.js &
cd client && npm run dev
```

## 🌐 生产环境部署

### 1. 服务器配置
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2进程管理器
sudo npm install -g pm2

# 安装Nginx（可选，用于反向代理）
sudo apt install nginx -y
```

### 2. 项目部署
```bash
# 克隆项目
git clone <your-repo-url>
cd foodorder

# 安装依赖
npm install
cd client && npm install && cd ..

# 构建前端
npm run build

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置文件
```

### 3. 环境变量配置
```env
# 邮件配置（必需）
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 服务器配置
PORT=3000
NODE_ENV=production

# 可选：微信企业号配置
WECHAT_CORP_ID=your-corp-id
WECHAT_CORP_SECRET=your-corp-secret
WECHAT_AGENT_ID=your-agent-id
```

### 4. PM2进程管理
```bash
# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'overseas-helper',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### 5. Nginx反向代理（可选）
```nginx
# /etc/nginx/sites-available/overseas-helper
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/overseas-helper /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL证书配置（推荐）
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker部署

### 1. 创建Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package.json文件
COPY package*.json ./
COPY client/package*.json ./client/

# 安装依赖
RUN npm ci --only=production
WORKDIR /app/client
RUN npm ci --only=production
WORKDIR /app

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
```

### 2. 创建docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
```

### 3. 运行Docker
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📊 监控和维护

### 1. PM2监控
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart overseas-helper

# 查看详细信息
pm2 show overseas-helper
```

### 2. 日志管理
```bash
# 设置日志轮转
sudo nano /etc/logrotate.d/overseas-helper

# 内容如下：
/path/to/foodorder/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. 备份脚本
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/overseas-helper"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据文件
tar -czf $BACKUP_DIR/data_$DATE.tar.gz data/

# 备份配置文件
cp .env $BACKUP_DIR/env_$DATE

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete

echo "备份完成: $DATE"
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# Ubuntu/Debian
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. 应用安全
- 定期更新依赖包：`npm audit fix`
- 使用强密码和密钥
- 启用HTTPS
- 定期备份数据
- 监控异常访问

## 📱 域名和DNS配置

1. 购买域名
2. 配置DNS A记录指向服务器IP
3. 配置邮件MX记录（可选）
4. 设置CDN加速（可选）

## 🚨 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   sudo lsof -i :3000
   # 杀死进程
   sudo kill -9 <PID>
   ```

2. **邮件发送失败**
   - 检查邮箱配置
   - 确认应用密码正确
   - 检查网络连接

3. **前端无法访问后端**
   - 检查CORS配置
   - 确认代理设置
   - 查看浏览器控制台错误

4. **内存不足**
   ```bash
   # 增加swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📞 技术支持

如遇到部署问题，请：
1. 查看日志文件
2. 检查配置文件
3. 确认环境要求
4. 联系技术支持

---

🎉 **恭喜！异国小助手部署完成！**