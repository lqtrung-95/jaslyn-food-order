# 🆓 Deploy for FREE

## Option 1: Render.com (Recommended - Easiest)

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click **"New +"** → **"Web Service"**
   - Connect your repository
   - Configure:
     - **Name**: foodorder
     - **Build Command**: `npm install && cd client && npm install && cd .. && npm run build:client`
     - **Start Command**: `npm start`
     - **Instance Type**: Free
   
3. **Add Environment Variables**
   - Click **"Environment"** tab
   - Add:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token
     TELEGRAM_USER_ID=your_user_id
     NODE_ENV=production
     ```

4. **Add Persistent Storage** (Important!)
   - Click **"Disks"** tab
   - Add disk:
     - **Name**: orders-data
     - **Mount Path**: `/opt/render/project/src/data`
     - **Size**: 1 GB
   
5. **Deploy!** 
   - Click **"Create Web Service"**
   - Wait 5-10 minutes
   - Your app will be live! 🎉

### ⚠️ Free Tier Limitations:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 750 hours/month (enough for 24/7 if only one service)

---

## Option 2: Fly.io (More Complex, Better Performance)

### Steps:

1. **Install Fly CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login & Launch**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set Environment Variables**
   ```bash
   fly secrets set TELEGRAM_BOT_TOKEN=your_bot_token
   fly secrets set TELEGRAM_USER_ID=your_user_id
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Free Tier:
- 3 shared-cpu VMs
- 3GB persistent storage
- 160GB outbound data transfer
- Requires credit card (won't be charged unless you upgrade)

---

## Option 3: Vercel (Requires Database Migration)

Vercel is serverless and has read-only filesystem. To use Vercel, you need to:

1. Replace `orders.json` with a database (MongoDB, Supabase, etc.)
2. Convert Express app to serverless functions
3. Deploy

**This requires significant code changes. Not recommended unless you want to learn serverless.**

---

## 🎯 Recommendation

**Use Render.com** - It's the easiest free option that works with your current code without any changes!

Just follow the steps above and you'll be live in 10 minutes! 🚀

