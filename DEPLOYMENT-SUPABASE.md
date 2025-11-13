# 🚀 Supabase + Vercel 部署指南

## 📋 部署步骤

### 1. 设置 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在 SQL 编辑器中运行数据库迁移脚本：
   - 执行 `supabase/migrations/001_initial_schema.sql`
   - 执行 `supabase/seed.sql` 来导入支持的城市数据

3. 获取项目配置信息：
   - 项目 URL: `https://your-project-id.supabase.co`
   - 匿名密钥: 在 Settings > API 中找到 `anon` 密钥

### 2. 配置环境变量

创建 `.env` 文件（基于 `.env.example`）：

```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Telegram 配置（可选）
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_USER_ID=your-user-id

# 服务器配置
PORT=3000
NODE_ENV=production
```

### 3. 迁移现有数据

运行数据迁移脚本：
```bash
node scripts/migrate-to-supabase.js
```

### 4. 部署到 Vercel

1. **安装 Vercel CLI**：
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **部署项目**：
   ```bash
   vercel --prod
   ```

4. **设置环境变量**：
   在 Vercel 项目设置中添加：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `TELEGRAM_BOT_TOKEN` (可选)
   - `TELEGRAM_USER_ID` (可选)

### 5. 配置域名（可选）

在 Vercel 项目设置中添加自定义域名。

## 🔧 本地开发

使用 Supabase 版本：
```bash
npm run dev
```

使用旧版本（JSON 文件）：
```bash
npm run dev:legacy
```

## 📊 特性

### ✅ 已实现
- ✅ Supabase 数据库集成
- ✅ 订单管理系统
- ✅ 地址验证
- ✅ Telegram 通知
- ✅ Vercel 部署配置
- ✅ 数据迁移脚本

### 🔄 改进点
- 更好的错误处理
- 自动备份
- 实时订单状态更新
- 管理员面板
- API 限流
- 缓存优化

## 🛠️ 故障排除

### 数据库连接失败
- 检查 Supabase 环境变量
- 确认数据库是否已启动
- 检查网络连接

### Vercel 部署失败
- 检查构建日志
- 确认所有依赖已安装
- 验证 vercel.json 配置

### Telegram 通知不工作
- 检查 Bot Token 和 User ID
- 确认 Bot 有发送消息权限

## 📞 支持

如遇问题，请检查：
1. 环境变量配置
2. Supabase 项目状态
3. Vercel 部署日志
4. 数据库表结构

---

🎉 **部署完成！现在您的应用运行在云端，具有更好的可扩展性和可靠性。**