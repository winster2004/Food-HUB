# 🚨 CRITICAL: Render Environment Variables Setup

**⚠️ DO THIS FIRST BEFORE DEPLOYMENT**

## Backend Service (food-hub-apx3) - Add These Env Vars

### Copy-Paste Ready (Replace the values)

```
PORT=3000
NODE_ENV=production
CLIENT_URL=https://food-hub-1-732u.onrender.com
FRONTEND_URL=https://food-hub-1-732u.onrender.com
BACKEND_URL=https://food-hub-apx3.onrender.com
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/food_hub?retryWrites=true&w=majority
SECRET_KEY=generate_a_random_string_like_abc123xyz789
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
STRIPE_SECRET_KEY=sk_live_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Frontend Service (food-hub-1-732u) - Add This Env Var

```
VITE_API_BASE_URL=https://food-hub-apx3.onrender.com
```

---

## How to Add on Render Dashboard

1. Go to your service on Render
2. Click "Settings"
3. Scroll to "Environment"
4. Click "Add Environment Variable"
5. Paste each line above (replace placeholder values)
6. Click "Deploy" after all are added

---

## Verify After Deployment

```bash
# Check backend logs show:
✅ "🌐 CORS Origin: https://food-hub-1-732u.onrender.com"
✅ "🔐 Stripe Secret Key configured: ✅"
✅ "🌍 Frontend URL (CLIENT_URL): https://food-hub-1-732u.onrender.com"

# Test with curl:
curl https://food-hub-apx3.onrender.com/healthz
# Should return: {"status":"ok"}
```

---

## What Each Variable Does

| Var | What it does | Where from |
|-----|--------------|-----------|
| `CLIENT_URL` | Frontend URL for CORS + email links | Your Render frontend URL |
| `BACKEND_URL` | Email action links point here | Your Render backend URL |
| `MONGO_URI` | Database connection | MongoDB Atlas |
| `SECRET_KEY` | JWT signing | Any random string |
| `RESEND_API_KEY` | Email sending | resend.com dashboard |
| `STRIPE_SECRET_KEY` | Payment processing | Stripe dashboard |
| `CLOUDINARY_*` | Image storage | Cloudinary dashboard |

---

## Common Issues

**"Cannot GET /api/..." in frontend**
→ Check `VITE_API_BASE_URL` in frontend env vars

**CORS error in browser console**
→ Check `CLIENT_URL` in backend env vars matches frontend URL exactly

**Email verification link broken**
→ Check `CLIENT_URL` is set in backend

**Stripe payment fails**
→ Check `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set

---

✅ When all env vars are set correctly, redeploy both services and test!
