# 🚀 Render Deployment Guide - Real-time Email with Resend

## 📋 Prerequisites

1. **Resend Account**: Sign up at [resend.com](https://resend.com)
2. **Domain (Optional)**: For custom email domain
3. **Render Account**: Sign up at [render.com](https://render.com)

## 🔧 Step 1: Configure Resend

### Option A: Using Resend's Test Domain (Quick Start)
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the API key (starts with `re_`)
4. Use `onboarding@resend.dev` as your sender email

### Option B: Using Your Own Domain (Production)
1. Add your domain in Resend Dashboard
2. Add DNS records to your domain provider
3. Verify domain ownership
4. Create a sending email like `noreply@yourdomain.com`

## 🎯 Step 2: Deploy Backend to Render

### 2.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository with your food-app

### 2.2 Configure Web Service
```
Name: food-hub-backend
Region: Choose closest to your users
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 2.3 Add Environment Variables
Go to **Environment** tab and add these variables:

```bash
# Database
MONGO_URI=your_mongodb_atlas_connection_string

# Server
PORT=8000
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Resend Email
RESEND_API_KEY=re_your_actual_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# URLs (Update after deployment)
FRONTEND_URL=https://your-frontend-app.onrender.com
BACKEND_URL=https://your-backend-api.onrender.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS
CLIENT_URL=https://your-frontend-app.onrender.com
```

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://food-hub-backend.onrender.com`)

## 🎨 Step 3: Deploy Frontend to Render

### 3.1 Create Static Site
1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository

### 3.2 Configure Static Site
```
Name: food-hub-frontend
Region: Same as backend
Branch: main
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: client/dist
```

### 3.3 Add Environment Variables (Frontend)
```bash
VITE_BACKEND_URL=https://your-backend-api.onrender.com
```

### 3.4 Update Client Environment
Create `client/.env.production`:
```bash
VITE_BACKEND_URL=https://your-backend-api.onrender.com
```

### 3.5 Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment
3. Copy your frontend URL (e.g., `https://food-hub-frontend.onrender.com`)

## 🔄 Step 4: Update Environment Variables

### 4.1 Update Backend Environment Variables
Go back to your **backend web service** and update:
```bash
FRONTEND_URL=https://food-hub-frontend.onrender.com
CLIENT_URL=https://food-hub-frontend.onrender.com
```

### 4.2 Trigger Manual Redeploy
1. Go to your backend service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## ✅ Step 5: Test Email Functionality

### 5.1 Test User Registration
1. Go to your frontend URL
2. Register a new account
3. Check your email inbox for OTP
4. Verify the OTP code

### 5.2 Check Logs
**Backend Logs:**
- Go to Render Dashboard → Your backend service → **Logs**
- Look for: `📧 Attempting to send verification email`
- Look for: `✅ Verification email sent successfully`

**Resend Dashboard:**
- Go to [Resend Logs](https://resend.com/emails)
- Check email delivery status

## 🐛 Troubleshooting

### Issue: Emails Not Sending

**Check 1: Resend API Key**
```bash
# In backend logs, look for errors like:
❌ Resend verification email error
```
- Verify your API key is correct
- Check if key has proper permissions

**Check 2: Sender Email**
```bash
# Make sure you're using verified email
RESEND_FROM_EMAIL=onboarding@resend.dev  # For testing
# OR
RESEND_FROM_EMAIL=noreply@yourdomain.com  # For production (must verify domain)
```

**Check 3: CORS Issues**
```bash
# Make sure CLIENT_URL matches your frontend
CLIENT_URL=https://food-hub-frontend.onrender.com
```

### Issue: OTP Not Received

1. **Check Spam Folder**: Resend emails might be in spam
2. **Check Resend Dashboard**: Verify email was sent
3. **Check Backend Logs**: Look for error messages
4. **Verify Email Format**: Make sure email address is valid

### Issue: Frontend Can't Connect to Backend

**Update API Base URL:**
```typescript
// client/src/lib/api.ts or similar
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
```

## 📊 Production Checklist

- [ ] MongoDB Atlas connection string configured
- [ ] Resend API key added to backend
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables updated with correct URLs
- [ ] CORS configured with frontend URL
- [ ] Test user registration and OTP
- [ ] Test password reset flow
- [ ] Cloudinary configured for image uploads
- [ ] Stripe configured for payments

## 🔗 Important URLs

- **Resend Dashboard**: https://resend.com/home/overview
- **Resend API Keys**: https://resend.com/api-keys
- **Resend Email Logs**: https://resend.com/emails
- **Render Dashboard**: https://dashboard.render.com

## 💡 Tips for Production

1. **Use Environment Variables**: Never hardcode API keys
2. **Monitor Logs**: Regularly check Render logs for errors
3. **Email Deliverability**: Consider verifying your domain for better deliverability
4. **Rate Limits**: Resend free tier has limits (check pricing)
5. **Error Handling**: Always handle email failures gracefully

## 📧 Resend Rate Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month

**Pro Tier:**
- 50,000 emails/month
- Custom domains
- Better deliverability

## 🎉 Success!

Once deployed, your users will receive:
- ✅ Email verification OTPs in real-time
- ✅ Password reset emails
- ✅ Welcome emails after verification
- ✅ Order confirmation emails

Your frontend domain (`https://your-app.onrender.com`) will be used as the verification domain!
