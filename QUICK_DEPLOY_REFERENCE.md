# 🚀 Quick Deploy Reference - Render + Resend

## 📦 What You Need

1. **Resend API Key**: Get from https://resend.com/api-keys
2. **MongoDB Connection**: From MongoDB Atlas
3. **GitHub Repository**: With your code
4. **Render Account**: From https://render.com

## ⚡ Environment Variables

### Backend (Render Web Service)
```bash
# Essential for Emails
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# URLs (update after deployment)
FRONTEND_URL=https://your-frontend.onrender.com
BACKEND_URL=https://your-backend.onrender.com
CLIENT_URL=https://your-frontend.onrender.com

# Other Required
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=production
PORT=8000

# Optional (for full features)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
STRIPE_SECRET_KEY=sk_test_your_key
```

### Frontend (Render Static Site)
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## 📝 Deployment Order

### Step 1: Deploy Backend First
1. Render Dashboard → New Web Service
2. Connect GitHub repo
3. Settings:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
4. Add all environment variables
5. Deploy & copy backend URL

### Step 2: Deploy Frontend
1. Render Dashboard → New Static Site
2. Connect GitHub repo
3. Settings:
   - Root Directory: `client`
   - Build: `npm install && npm run build`
   - Publish: `client/dist`
4. Add environment variable: `VITE_API_BASE_URL`
5. Deploy & copy frontend URL

### Step 3: Update Backend URLs
1. Go to backend service
2. Update environment variables:
   - `FRONTEND_URL=https://your-frontend.onrender.com`
   - `CLIENT_URL=https://your-frontend.onrender.com`
3. Manual Deploy → Deploy latest commit

## ✅ Testing Checklist

- [ ] Backend accessible (check `/api/v1/user/check-auth`)
- [ ] Frontend loads correctly
- [ ] Register new user → OTP email received
- [ ] Check Resend dashboard for sent emails
- [ ] Verify OTP works
- [ ] Check backend logs for errors

## 🐛 Quick Troubleshooting

| Issue | Check | Solution |
|-------|-------|----------|
| No emails | Resend API key | Verify in environment variables |
| CORS error | CLIENT_URL | Must match frontend URL exactly |
| 404 on API | VITE_API_BASE_URL | Must match backend URL |
| OTP not working | Backend logs | Check for errors in Render logs |

## 🔗 Important URLs

**During Setup:**
- Get API Key: https://resend.com/api-keys
- Check Emails: https://resend.com/emails
- Render Dashboard: https://dashboard.render.com

**After Deployment:**
- Your Frontend: `https://your-app.onrender.com`
- Your Backend: `https://your-api.onrender.com`
- Test API: `https://your-api.onrender.com/api/v1/user/check-auth`

## 📧 Email Flow

1. User registers → Backend generates OTP
2. Backend calls Resend API
3. Resend sends email instantly
4. User receives OTP in inbox
5. User enters OTP → Account verified ✅

## 💡 Pro Tips

- Start with `onboarding@resend.dev` (no domain setup needed)
- Check spam folder if emails not in inbox
- Monitor Resend dashboard for delivery issues
- Free tier: 100 emails/day is enough for testing
- Add custom domain later for better deliverability

## 🎯 Success Indicators

**Backend logs show:**
```
🚀 Server Configuration:
🔑 Resend API Key configured: ✅
📧 Attempting to send verification email
✅ Verification email sent successfully
```

**Resend dashboard shows:**
- Status: Delivered ✅
- No bounces or spam reports

**Users receive:**
- Email within seconds
- Clear OTP code
- Professional-looking email

---

## 🚨 Emergency Contacts

- Resend Status: https://status.resend.com
- Render Status: https://status.render.com
- Support: Check respective documentation

**You're all set! Deploy and start sending real-time OTP emails! 🎉**
