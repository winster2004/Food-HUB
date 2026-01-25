# ✅ Resend Setup Checklist for Real-time Emails

## 🎯 Quick Setup Steps

### 1️⃣ Create Resend Account
- Go to https://resend.com
- Sign up for free account
- Confirm your email

### 2️⃣ Get API Key
- Navigate to: https://resend.com/api-keys
- Click "Create API Key"
- Give it a name: "Food Hub Production"
- Select permission: "Sending access"
- **Copy the API key** (starts with `re_`)
- ⚠️ Save it immediately - you can't see it again!

### 3️⃣ Choose Your Email Sender

#### Option A: Quick Start (Testing) ✨ RECOMMENDED FOR NOW
Use Resend's built-in test domain:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```
**Pros:** 
- Works immediately
- No domain setup needed
- Perfect for testing
- 100 emails/day free

**Cons:**
- Generic sender address
- May land in spam folder

#### Option B: Custom Domain (Production)
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records to your domain provider:
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend]
   
   Type: MX
   Name: @
   Value: [provided by Resend]
   ```
5. Wait for verification (can take up to 48 hours)
6. Once verified, use: `noreply@yourdomain.com`

**Pros:**
- Professional appearance
- Better email deliverability
- Custom sender name

**Cons:**
- Requires domain ownership
- DNS configuration needed
- Verification wait time

### 4️⃣ Configure Backend Environment Variables

In your **Render Backend Web Service**, add these environment variables:

```bash
# Required for emails to work
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# Required for links in emails
FRONTEND_URL=https://your-frontend-app.onrender.com
BACKEND_URL=https://your-backend-api.onrender.com

# Required for production
NODE_ENV=production
```

### 5️⃣ Test Your Setup

#### Local Testing (Optional)
1. Create `server/.env`:
   ```bash
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:8000
   ```
2. Run backend: `cd server && npm start`
3. Run frontend: `cd client && npm run dev`
4. Try registering a new user
5. Check your email for OTP

#### Production Testing
1. Deploy backend to Render
2. Deploy frontend to Render
3. Go to your frontend URL
4. Register with your real email
5. Check inbox for OTP email
6. Verify OTP works

### 6️⃣ Monitor Email Delivery

**Check Resend Dashboard:**
- https://resend.com/emails
- See all sent emails
- Check delivery status
- View email content
- See bounce/spam reports

**Check Backend Logs:**
- Go to Render Dashboard → Your backend service
- Click "Logs" tab
- Look for:
  ```
  📧 Attempting to send verification email to: user@email.com
  ✅ Verification email sent successfully
  ```

## 🚨 Common Issues & Solutions

### Issue: "Invalid API key"
**Solution:** 
- Double-check your API key in Render
- Make sure there are no spaces
- Regenerate key if needed

### Issue: Emails not received
**Check:**
1. ✅ Spam/Junk folder
2. ✅ Email address is correct
3. ✅ Check Resend dashboard for delivery status
4. ✅ Check backend logs for errors
5. ✅ Verify API key is correct

### Issue: "From email not verified"
**Solution:**
- Use `onboarding@resend.dev` for testing
- OR verify your custom domain first

### Issue: Rate limit exceeded
**Resend Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month
**Solution:**
- Upgrade to Pro plan
- Or use different email service

## 📊 Resend Pricing

### Free Tier
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ 1 domain
- ✅ Email logs
- ❌ Custom domains (limited)

### Pro Tier ($20/month)
- ✅ 50,000 emails/month
- ✅ Unlimited domains
- ✅ Priority support
- ✅ Better deliverability
- ✅ Email analytics

## 🎉 Success Indicators

When everything works correctly, you should see:

**In Backend Logs:**
```
🚀 Server Configuration:
📍 Environment: production
🌐 CORS Origin: https://your-frontend-app.onrender.com
📧 Resend Email From: onboarding@resend.dev
🔑 Resend API Key configured: ✅

📧 Attempting to send verification email to: user@email.com
🔑 Verification code: 123456
✅ Verification email sent successfully: { id: 're_abc123...' }
```

**In Resend Dashboard:**
- Email status: "Delivered" ✅
- No bounce or spam reports

**For Users:**
- Receive OTP email within seconds
- Email appears in inbox (not spam)
- OTP code is visible and works

## 🔗 Useful Links

- **Resend Home**: https://resend.com
- **API Keys**: https://resend.com/api-keys
- **Email Logs**: https://resend.com/emails
- **Domains**: https://resend.com/domains
- **Documentation**: https://resend.com/docs
- **Status Page**: https://status.resend.com

## 💡 Pro Tips

1. **Start with test domain** (`onboarding@resend.dev`)
2. **Test locally first** before deploying
3. **Monitor logs** regularly
4. **Check Resend dashboard** for delivery issues
5. **Add custom domain** once everything works
6. **Set up proper error handling** for email failures
7. **Consider email templates** for better branding

## ⚡ Quick Commands

**Check if API key works:**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your@email.com",
    "subject": "Test Email",
    "html": "<p>Test from Resend</p>"
  }'
```

## 📝 Environment Variables Summary

### Backend (.env)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=https://your-frontend-app.onrender.com
BACKEND_URL=https://your-backend-api.onrender.com
NODE_ENV=production
```

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://your-backend-api.onrender.com
```

---

## 🚀 Ready to Deploy!

Once you complete these steps:
1. ✅ API key obtained
2. ✅ Sender email configured
3. ✅ Environment variables set
4. ✅ Both apps deployed to Render

Your users will receive **real-time OTP emails** instantly! 🎉
