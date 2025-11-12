# Production Deployment Guide

Complete step-by-step guide to deploy Kids Church Check-in System to production.

---

## Prerequisites

- [ ] GitHub repository with code pushed
- [ ] Supabase production project created
- [ ] Domain name (optional but recommended)
- [ ] SMTP email service credentials
- [ ] Sentry account (optional but recommended)

---

## Part 1: Database Setup (Supabase)

### 1. Create Production Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose organization and region (closest to your users)
4. Set a strong database password (save it securely)
5. Wait for project to provision (~2 minutes)

### 2. Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/00_RUN_ALL_MIGRATIONS.sql` from your repository
4. Copy entire contents and paste into SQL Editor
5. Click **Run** to execute all migrations
6. Verify success: Check **Table Editor** to see all tables created

### 3. Configure Database Settings

1. Go to **Settings** → **API**
2. Copy the following values (you'll need them later):
   - Project URL (`https://xxx.supabase.co`)
   - `anon` public key
3. Go to **Settings** → **Database**
4. Enable **Connection Pooling** (recommended for production)
5. Note the **Connection String** (pooler mode)

---

## Part 2: Hosting Platform Setup

Choose one hosting platform below (Railway recommended for ease).

### Option A: Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `kids-church` repository
5. Railway will auto-detect Node.js and begin deployment
6. Go to **Settings** tab:
   - Set **Root Directory**: (leave blank)
   - Set **Start Command**: `npm run start`
   - Set **Build Command**: `npm run build`
7. Add custom domain (Settings → Domains):
   - Click **Generate Domain** for free Railway subdomain
   - Or add your custom domain and configure DNS

### Option B: Render

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `kids-church-checkin`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Starter ($7/month) or Free
6. Click **Create Web Service**

### Option C: Vercel (with serverless)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Deploy

---

## Part 3: Environment Variables

### Required Environment Variables

Add these to your hosting platform's environment settings:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server
NODE_ENV=production
PORT=4000
BASE_URL=https://your-domain.com

# Secrets (generate strong random values)
SESSION_SECRET=<generate-32-char-random-string>
JWT_SECRET=<generate-32-char-random-string>

# Security
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
CSP_CONNECT_ORIGINS=https://xxx.supabase.co

# Email (configure with your SMTP provider)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Kids Church <noreply@your-domain.com>

# Error Tracking (optional but recommended)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Logging
LOG_LEVEL=info
```

### How to Generate Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Platform-Specific Instructions

**Railway:**
1. Go to your service → **Variables** tab
2. Click **New Variable** for each env var
3. Or click **RAW Editor** and paste all at once

**Render:**
1. Go to your service → **Environment** tab
2. Add each variable individually
3. Click **Save Changes**

**Vercel:**
1. Go to project **Settings** → **Environment Variables**
2. Add each variable
3. Select **Production** environment
4. Redeploy after adding variables

---

## Part 4: Email Service Setup

### Option A: SendGrid (Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key:
   - Settings → API Keys → Create API Key
   - Choose **Full Access**
   - Copy the key (shown only once!)
3. Set environment variables:
   ```bash
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=<your-api-key>
   EMAIL_FROM=Kids Church <noreply@yourdomain.com>
   ```
4. Verify sender identity (Settings → Sender Authentication)

### Option B: Gmail (Simple but limited)

1. Enable 2FA on your Google account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App Passwords
3. Set environment variables:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=<app-password>
   EMAIL_FROM=Kids Church <your-email@gmail.com>
   ```

### Option C: AWS SES (Scalable)

1. Sign up for AWS and enable SES
2. Verify your domain
3. Create SMTP credentials in SES console
4. Set environment variables with your SMTP credentials

---

## Part 5: Error Tracking (Optional but Recommended)

### Sentry Setup

1. Go to [sentry.io](https://sentry.io)
2. Create new project → **Node.js**
3. Copy the DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)
4. Add to environment variables:
   ```bash
   SENTRY_DSN=<your-dsn-here>
   ```
5. Deploy and verify errors are being captured

---

## Part 6: Domain & SSL

### Custom Domain Setup

**Railway:**
1. Go to **Settings** → **Domains**
2. Click **Custom Domain**
3. Enter your domain (e.g., `checkin.yourchurch.com`)
4. Add CNAME record in your DNS provider:
   - Name: `checkin` (or `@` for root)
   - Value: provided by Railway
5. SSL auto-provisioned by Railway

**Render:**
1. Go to **Settings** → **Custom Domain**
2. Enter domain → **Save**
3. Add DNS records as instructed
4. SSL auto-provisioned (Let's Encrypt)

**Vercel:**
1. Go to **Settings** → **Domains**
2. Add domain → **Add**
3. Configure DNS as instructed
4. SSL auto-provisioned

### DNS Configuration Example

```
Type    Name        Value                       TTL
CNAME   checkin     xxx.railway.app             3600
```

---

## Part 7: Post-Deployment

### 1. Verify Deployment

Test these URLs (replace with your domain):

```bash
# Health check
curl https://your-domain.com/health

# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Create First Admin User

1. Go to `https://your-domain.com`
2. Register a new account
3. Open Supabase SQL Editor
4. Run:
   ```sql
   -- Find your user
   SELECT id, email, name FROM users;
   
   -- Assign admin role (replace USER_ID)
   INSERT INTO user_roles (user_id, role) 
   VALUES ('YOUR-USER-ID-HERE', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```
5. Refresh and verify admin access

### 3. Test Critical Flows

- [ ] User registration
- [ ] Email verification
- [ ] Login with correct password
- [ ] Login with wrong password (check lockout after 5 attempts)
- [ ] Password reset flow
- [ ] Child registration
- [ ] Check-in (verify security code display)
- [ ] Check-out (verify code validation)

### 4. Monitor

- Check application logs in hosting platform
- Check Sentry for errors (if configured)
- Monitor Supabase dashboard for database health

---

## Part 8: Ongoing Maintenance

### Daily
- [ ] Check Sentry for new errors
- [ ] Review application logs for anomalies

### Weekly
- [ ] Review Supabase usage/performance
- [ ] Check email delivery rates
- [ ] Monitor uptime

### Monthly
- [ ] Review and rotate secrets if needed
- [ ] Update dependencies: `npm audit fix`
- [ ] Backup database (Supabase auto-backs up daily)
- [ ] Review user feedback

### Quarterly
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Feature roadmap planning

---

## Troubleshooting

### "Server won't start"
1. Check logs in hosting platform
2. Verify all environment variables are set
3. Check build logs for TypeScript errors
4. Try: `npm run build` locally to test

### "Can't connect to database"
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check Supabase project is not paused (free tier auto-pauses after 1 week inactive)
3. Test connection in Supabase SQL Editor

### "Emails not sending"
1. Check SMTP credentials
2. Verify sender domain is verified with email provider
3. Check application logs for email errors
4. Test SMTP connection with online tool

### "CORS errors"
1. Verify `CORS_ORIGIN` includes your production domain
2. Include protocol: `https://` not just domain
3. Separate multiple origins with commas
4. Redeploy after changing

### "Account locked immediately"
1. Check if `failed_login_attempts` was carried over from dev
2. Reset in database:
   ```sql
   UPDATE users 
   SET failed_login_attempts = 0, locked_until = NULL 
   WHERE email = 'user@example.com';
   ```

---

## Rollback Plan

If production deployment fails:

1. **Railway/Render**: 
   - Go to **Deployments**
   - Click previous successful deployment
   - Click **Redeploy**

2. **Vercel**:
   - Go to **Deployments**
   - Find previous working deployment
   - Click **...** → **Promote to Production**

3. **Database**: 
   - Supabase keeps automatic backups
   - Go to **Database** → **Backups**
   - Restore from backup if needed

---

## Security Checklist

Before going live:

- [ ] All secrets are strong random strings (32+ characters)
- [ ] `NODE_ENV=production` is set
- [ ] CORS is restricted to your domain(s)
- [ ] Database RLS policies reviewed (or server-only access confirmed)
- [ ] HTTPS only (no HTTP)
- [ ] Rate limiting enabled (already in code)
- [ ] Sentry configured for error tracking
- [ ] Email verification working
- [ ] Password reset working
- [ ] Account lockout tested (5 failed attempts)
- [ ] CSP headers configured
- [ ] No sensitive data in logs (Pino redacts automatically)

---

## Cost Estimates

### Free Tier (Good for small churches)
- **Hosting**: Railway/Render free tier or Vercel hobby
- **Database**: Supabase free (500MB, 2GB bandwidth)
- **Email**: SendGrid free (100 emails/day)
- **Error Tracking**: Sentry free (5k errors/month)
- **Total**: $0/month

### Production Tier (Recommended)
- **Hosting**: Railway Starter ($5/month) or Render Starter ($7/month)
- **Database**: Supabase Pro ($25/month) - 8GB, backups, support
- **Email**: SendGrid Essentials ($20/month) - 50k emails
- **Error Tracking**: Sentry Team ($26/month) - better features
- **Domain**: $10-15/year
- **Total**: ~$55-80/month

---

## Success Criteria

Your deployment is successful when:

✅ Application loads at your domain  
✅ Health check returns 200 OK  
✅ Users can register and log in  
✅ Emails are sent and received  
✅ Check-ins work end-to-end  
✅ Security codes are generated correctly  
✅ Check-outs validate codes properly  
✅ No errors in Sentry for 24 hours  
✅ Logs show normal operation  

---

## Support

If you need help:

1. Check application logs first
2. Review Sentry errors (if configured)
3. Test locally to isolate platform vs code issues
4. Check hosting platform status pages
5. Review Supabase dashboard for database issues

---

**Deployment complete!** 🎉

Your Kids Church Check-in System is now live in production.
