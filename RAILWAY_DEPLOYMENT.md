# Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)

## Step 1: Push to GitHub

1. **Initialize Git (if not already done):**
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

2. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it: `renfaye-lashes`
   - **DO NOT** initialize with README (we already have code)
   - Click "Create repository"

3. **Push your code:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/renfaye-lashes.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. **Sign up/Login to Railway:**
   - Go to https://railway.app
   - Click "Login with GitHub"
   - Authorize Railway

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `renfaye-lashes` repository
   - Click "Deploy Now"

3. **Railway will automatically:**
   - ✅ Detect Next.js
   - ✅ Install dependencies
   - ✅ Build your app
   - ✅ Deploy it

## Step 3: Configure Environment Variables

1. **In Railway Dashboard:**
   - Click on your deployed service
   - Go to "Variables" tab
   - Click "New Variable"

2. **Add these variables:**

```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-app-name.railway.app
JWT_SECRET=your_secure_random_string_here_change_this
RESEND_API_KEY=your_resend_api_key_if_you_have_one
FROM_EMAIL=your_email@domain.com
```

**Important Notes:**
- Replace `your-app-name` with your actual Railway app URL (found in Settings)
- Generate a secure JWT_SECRET (use a long random string)
- Add Resend API key if you want email functionality

3. **Click "Deploy" to restart with new variables**

## Step 4: Access Your App

1. **Get your URL:**
   - In Railway dashboard, click "Settings"
   - Find "Domains" section
   - Your app URL: `https://your-app-name.railway.app`

2. **Test it:**
   - Visit your URL
   - App should load with all features working
   - Data persists across restarts!

## Step 5: Custom Domain (Optional)

1. **In Railway Dashboard:**
   - Go to "Settings"
   - Click "Add Domain"
   - Add your custom domain (e.g., `renfayeslashes.com`)

2. **Update DNS:**
   - Add CNAME record in your domain provider:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: your-app-name.railway.app
   ```

3. **Update Environment Variable:**
   - Change `NEXT_PUBLIC_BASE_URL` to your custom domain

## Continuous Deployment

**Automatic Updates:**
- Push to GitHub `main` branch
- Railway automatically rebuilds and deploys
- No manual intervention needed!

```bash
git add .
git commit -m "Update feature"
git push origin main
# Railway deploys automatically!
```

## Data Persistence

✅ **Your JSON files persist!**
- `/data` folder is included in deployment
- Changes persist across restarts
- Orders, users, appointments all saved

## Monitoring

**Railway Dashboard shows:**
- Build logs
- Runtime logs
- CPU/Memory usage
- Request metrics

## Troubleshooting

### Build Fails
- Check build logs in Railway
- Ensure all dependencies in `package.json`
- Make sure `npm run build` works locally

### App Crashes
- Check runtime logs
- Verify environment variables
- Check for missing files

### Data Not Persisting
- Ensure `/data` folder is committed to Git
- Check Railway volumes (should be automatic)

## Cost

**Free Tier:**
- $5 monthly credit
- Enough for small apps
- Pay only if you exceed

**Estimated Cost:**
- Small traffic: Free - $5/month
- Medium traffic: $5-10/month

## Admin Access

**After deployment:**
1. Visit `https://your-app.railway.app/admin`
2. Default admin email: `admin@renfayeslashes.com`
3. Default password: `Admin123!`
4. **CHANGE IMMEDIATELY** after first login

## Next Steps

1. ✅ Test all features
2. ✅ Update admin password
3. ✅ Add products in admin panel
4. ✅ Configure email (Resend)
5. ✅ Set up custom domain
6. ✅ Add payment gateway (Stripe)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your Railway Dashboard: https://railway.app/dashboard
