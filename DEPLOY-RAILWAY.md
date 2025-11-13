# 🚂 Deploy to Railway

## Quick Deploy Steps

### 1. Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `foodorder` repository
5. Railway will auto-detect Node.js and deploy

### 3. Set Environment Variables

In Railway dashboard:
1. Go to your project
2. Click **"Variables"** tab
3. Add these variables:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_USER_ID=your_user_id_here
   PORT=3000
   ```

### 4. Get Your URL

Railway will give you a URL like: `https://foodorder-production.up.railway.app`

---

## Alternative: Deploy to Render

### 1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: foodorder
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables (same as above)
6. Click **"Create Web Service"**

---

## Important Notes

⚠️ **File Storage Issue**: Both Railway and Render have ephemeral filesystems. Your `orders.json` file will be lost on restart.

### Solution: Use a Database

For production, you should migrate from `orders.json` to a database:
- **MongoDB Atlas** (free tier)
- **PostgreSQL** (Railway/Render provide free DB)
- **Supabase** (free tier)

Would you like me to help you migrate to a database?

