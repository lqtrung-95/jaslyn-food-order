# Backend Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd web-foodorder
npm install
```

### Step 2: Create Environment File

Create a `.env` file in the `web-foodorder` directory:

```bash
# In web-foodorder directory
touch .env
```

### Step 3: Add Your Supabase Credentials

Open `.env` and add these variables:

```env
# Required - Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Optional - Telegram Notifications
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_USER_ID=your-telegram-user-id

# Optional - Server Port (default: 3000)
PORT=3000
```

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
🍜 异国小助手服务器运行在端口 3000
🌐 访问地址: http://localhost:3000
📊 数据库: Supabase
```

---

## 📋 Getting Your Supabase Credentials

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard

### 2. Select Your Project
Or create a new one if you don't have one yet

### 3. Get Your Credentials

**Option A: From Settings**
1. Click on **Settings** (gear icon) in sidebar
2. Click on **API**
3. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`

**Option B: From Project Settings**
1. Go to **Project Settings** → **API**
2. Find **Project URL** and **Project API keys**
3. Copy the values

### 4. Create the Orders Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_wechat TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  detail_address TEXT NOT NULL,
  food_type TEXT NOT NULL,
  notes TEXT,
  custom_country TEXT,
  custom_city TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```

---

## 🔧 Optional: Telegram Notifications Setup

If you want to receive order notifications via Telegram:

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Add this to your `.env` as `TELEGRAM_BOT_TOKEN`

### 2. Get Your User ID

1. Search for **@userinfobot** on Telegram
2. Start a chat with it
3. It will send you your **User ID** (a number like: `123456789`)
4. Add this to your `.env` as `TELEGRAM_USER_ID`

### 3. Start Your Bot

1. Find your bot in Telegram (the name you created)
2. Click **Start** or send `/start`
3. Now you'll receive order notifications!

**Multiple Users:** You can add multiple user IDs separated by commas:
```env
TELEGRAM_USER_ID=123456789,987654321,555555555
```

---

## 📁 Project Structure

```
web-foodorder/
├── api/
│   └── server-supabase.js    # Main server file (Supabase version)
├── data/
│   ├── supported-cities.json          # Food delivery regions
│   └── supported-cities-shopping.json # Shopping regions
├── lib/
│   └── supabase.js           # Supabase client
├── client/                   # React frontend (web version)
├── .env                      # Your environment variables (create this)
├── package.json
└── BACKEND-SETUP.md         # This file
```

---

## 🧪 Testing Your Backend

### 1. Check Server Health

Open browser or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "database": "supabase"
}
```

### 2. Test Address Validation

```bash
curl -X POST http://localhost:3000/api/validate-address \
  -H "Content-Type: application/json" \
  -d '{
    "country": "泰国",
    "city": "曼谷 Bangkok",
    "district": ""
  }'
```

Expected response:
```json
{
  "valid": true,
  "message": "✅ 地址验证通过，我们支持该地区"
}
```

### 3. Test Order Submission

```bash
curl -X POST http://localhost:3000/api/submit-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerPhone": "1234567890",
    "customerWechat": "testuser",
    "country": "泰国",
    "city": "曼谷 Bangkok",
    "district": "素坤逸",
    "detailAddress": "Test Street 123",
    "foodType": "🥤 奶茶",
    "notes": "Test order"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "订单提交成功！我们会尽快联系您",
  "orderId": "YX1731849600000ABC12"
}
```

### 4. Check Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **orders** table
4. You should see your test order!

---

## 🔗 Connect Mini Program to Backend

### For Local Development

1. **Update Mini Program Config:**
   ```javascript
   // In mini program: /config/api.js
   export const API_BASE_URL = 'http://localhost:3000';
   ```

2. **Enable Local Testing in WeChat DevTools:**
   - Settings → Project Settings → Local Settings
   - Check ✅ "Do not verify valid domain, web-view, TLS version and HTTPS certificate"

3. **Test the connection:**
   - Open mini program in WeChat DevTools
   - Try submitting a form
   - Check backend console for logs
   - Check Supabase for new orders

### For Production

1. **Deploy Backend** (see DEPLOYMENT section below)

2. **Update Mini Program Config:**
   ```javascript
   // In mini program: /config/api.js
   export const API_BASE_URL = 'https://your-app.vercel.app';
   ```

3. **Whitelist Domain in WeChat:**
   - Go to WeChat Mini Program Admin Panel
   - Settings → Development Settings → Server Domain
   - Add your backend URL to "request valid domain"

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd web-foodorder
   vercel
   ```

3. **Add Environment Variables:**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.

4. **Your backend URL:**
   ```
   https://your-project.vercel.app
   ```

### Option 2: Railway (Free Tier Available)

1. **Sign up:** https://railway.app
2. **Create New Project** → Deploy from GitHub
3. **Add Environment Variables** in Railway dashboard
4. **Your backend URL:**
   ```
   https://your-project.up.railway.app
   ```

### Option 3: Render (Free Tier Available)

1. **Sign up:** https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Add Environment Variables** in Render dashboard

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Problem:** Server won't start
**Solution:** Make sure `.env` file exists with `SUPABASE_URL` and `SUPABASE_ANON_KEY`

```bash
# Check if .env exists
ls -la .env

# If not, create it
touch .env
# Then add your credentials
```

### "Connection refused" or "ECONNREFUSED"

**Problem:** Mini program can't connect to backend
**Solution:** 
1. Make sure backend is running: `npm run dev`
2. Check the port: Should be `3000` (or your custom PORT)
3. Verify URL in mini program `/config/api.js`

### "Address validation failed"

**Problem:** Address validation returns error
**Solution:**
1. Check `data/supported-cities.json` exists
2. Verify country and city names match the JSON format
3. Check backend console for detailed error

### "Order submission failed"

**Problem:** Orders not saving to Supabase
**Solution:**
1. Verify Supabase credentials in `.env`
2. Check if `orders` table exists (run the SQL from above)
3. Check Supabase logs for errors
4. Verify table permissions (RLS policies)

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

---

## 📊 Monitoring

### Check Logs

**Development:**
```bash
npm run dev
# Logs appear in terminal
```

**Production (Vercel):**
- Go to Vercel Dashboard
- Select your project
- Click "Logs" tab

**Supabase:**
- Go to Supabase Dashboard
- Click "Logs" in sidebar
- View API logs and database queries

---

## 🔒 Security Notes

### Important: Never Commit .env File

The `.env` file is already in `.gitignore`. Make sure it stays there!

```bash
# Check if .env is ignored
git status
# .env should NOT appear in the list
```

### Supabase Row Level Security (RLS)

For production, consider enabling RLS on your orders table:

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for order submission)
CREATE POLICY "Allow public insert" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- Only authenticated users can view orders
CREATE POLICY "Allow authenticated read" ON orders
  FOR SELECT TO authenticated
  USING (true);
```

---

## ✅ Checklist

Before going live:

- [ ] `.env` file created with all required variables
- [ ] Supabase credentials added and tested
- [ ] Orders table created in Supabase
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Health check endpoint works (`/api/health`)
- [ ] Address validation tested
- [ ] Order submission tested
- [ ] Orders appear in Supabase
- [ ] Telegram notifications working (if enabled)
- [ ] Mini program connected and tested
- [ ] Backend deployed to production
- [ ] Production URL updated in mini program
- [ ] Domain whitelisted in WeChat

---

## 📞 Need Help?

1. **Check Logs:** Most issues show detailed errors in console
2. **Test Endpoints:** Use curl or Postman to test API directly
3. **Verify Supabase:** Check dashboard for connection issues
4. **Review Code:** Check `api/server-supabase.js` for logic

---

**Ready to go!** 🚀

Start with: `npm run dev`

