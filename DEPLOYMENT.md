# TruNORTH Deployment Guide

## Quick Deploy to Vercel (Frontend + API)

TruNORTH now supports **serverless API functions** directly on Vercel!

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables (see below)
6. Click "Deploy"

### Step 3: Add Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

| Variable | Value | Source |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | `https://ikthjaibjralpqyjwktt.supabase.co` | Supabase → Settings → API → URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_eMfP92Pq5hA6Izm9ynQkWw_K7EuVAdx` | Supabase → Settings → API → New publishable key |
| `VITE_SUPABASE_PROJECT_ID` | `ikthjaibjralpqyjwktt` | Supabase → Settings → API → Project ID |
| `JWT_SECRET` | `[YOUR JWT SECRET]` | Supabase → Settings → JWT Settings → JWT Secret |
| `VITE_DEMO_MODE` | `true` | Set to `false` for production |

**⚠️ Important: Get your JWT Secret from:**
1. Go to Supabase Dashboard
2. Click Settings (⚙️) → JWT Settings
3. Copy the JWT Secret value
4. Add it to Vercel as `JWT_SECRET`

### Step 4: Configure Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## API Endpoints (Serverless)

After deployment, your API will be available at:
```
https://your-project.vercel.app/api/
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user profile |
| `/api/auth/profile` | PUT | Update user profile |
| `/api/wallet` | GET | Get wallet balance |
| `/api/wallet/deposit` | POST | Deposit funds |
| `/api/wallet/withdraw` | POST | Withdraw funds |
| `/api/wallet/transactions` | GET | Get transactions |
| `/api/donations` | GET/POST | List/create donations |
| `/api/donations/causes` | GET | List causes |
| `/api/emergency` | GET/POST | List/report emergencies |
| `/api/emergency/contacts` | GET | Get emergency contacts |
| `/api/shop` | GET | List products |
| `/api/shop/order` | POST | Create order |
| `/api/events` | GET/POST | List/create events |
| `/api/ai/chat` | POST | AI chat |

---

## Understanding Your Supabase Keys

### Which Key Goes Where?

| Key | Format | Use For |
|-----|--------|---------|
| **Publishable Key** | `sb_publishable_...` | Frontend (VITE_SUPABASE_ANON_KEY) - Safe in browser |
| **Secret Key** | `sb_secret_...` | Server-side only (backend/admin operations) |
| **JWT Secret** | UUID format | API authentication (JWT_SECRET) |
| **Legacy Anon Key** | `eyJhbGciOiJIUz...` | Old format - prefer publishable key |

### Where to Find Each Key

1. **Publishable Key**: Supabase → Settings → API → New publishable key
2. **Secret Key**: Supabase → Settings → API → New secret key
3. **JWT Secret**: Supabase → Settings → JWT Settings → JWT Secret
4. **Project URL**: Supabase → Settings → API → Project URL
5. **Project ID**: Supabase → Settings → API → Project ID

---

## Demo Mode

The app runs in **demo mode** by default, which:
- Bypasses authentication
- Uses demo user accounts
- Uses in-memory data storage

To disable demo mode:
1. Set `VITE_DEMO_MODE=false` in Vercel environment variables
2. Configure Supabase authentication
3. Set up a database for data persistence

---

## Free Tier Limits

### Vercel
- **Bandwidth**: 100GB/month
- **Sites**: Unlimited
- **Build Time**: 100 hours/month
- **Serverless Functions**: 100 hours/month
- **SSL**: Free custom domains

### Supabase (Free Tier)
- **Database**: 500MB
- **File Storage**: 1GB
- **Auth**: Unlimited users
- **API Requests**: Unlimited

---

## Troubleshooting

### Build Fails
- Check `npm run build` works locally
- Ensure all dependencies are in `package.json`

### CORS Errors
- Add your Vercel domain to Supabase → API → CORS settings

### API Returns 404
- Ensure API routes are in the `/api` directory
- Check that vercel.json has correct rewrites

### Supabase Connection Failed
- Verify environment variables are set correctly
- Check RLS policies in Supabase dashboard

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project connected to Vercel
- [ ] Environment variables added (including JWT_SECRET!)
- [ ] Build successful on Vercel
- [ ] API endpoints tested
- [ ] Supabase CORS updated (if needed)
- [ ] All features tested
