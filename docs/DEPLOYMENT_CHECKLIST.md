# Production Deployment Checklist

## Before First Deployment

### Firebase Setup
- [ ] Create production Firebase project
- [ ] Enable Authentication (Email Link, Google)
- [ ] Create Firestore database in production mode
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Configure authorized domains in Firebase Console

### Vercel Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables (see below)
- [ ] Set up custom domain (optional)
- [ ] Enable preview deployments for PRs

### GitHub Repository Secrets

Add these secrets in GitHub Settings > Secrets and Variables > Actions:

| Secret | Description |
|--------|-------------|
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_TOKEN` | Firebase CI token (from `firebase login:ci`) |
| `CODECOV_TOKEN` | Optional: Codecov token for coverage |

### Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | yourproject.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | yourproject.appspot.com |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID |
| `NEXT_PUBLIC_APP_ENV` | production |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | true |
| `NEXT_PUBLIC_ENABLE_ERROR_REPORTING` | true |

### DNS & Domain (if using custom domain)
- [ ] Configure DNS records in your domain provider
- [ ] Verify domain in Vercel
- [ ] Update Firebase authorized domains
- [ ] Update OAuth redirect URIs if using Google Sign-In

---

## For Each Deployment

### Pre-Deploy Checklist
- [ ] All tests passing: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No ESLint errors: `npm run lint`
- [ ] CHANGELOG.md updated (if applicable)

### Post-Deploy Verification
- [ ] Verify app loads at production URL
- [ ] Test authentication flow
- [ ] Test creating a match
- [ ] Test entering scores
- [ ] Test offline functionality (toggle airplane mode)
- [ ] Check health endpoint: `/api/health`
- [ ] Monitor for errors (first 30 minutes)

---

## Rollback Procedures

### Vercel Rollback

```bash
# Via CLI
vercel rollback

# Or via Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." > "Promote to Production"
```

### Firebase Rules Rollback

1. Go to Firebase Console > Firestore > Rules
2. Click "History" tab
3. Select previous version
4. Click "Revert"

### Cloud Functions Rollback

```bash
# Checkout previous commit
git checkout PREVIOUS_COMMIT

# Redeploy functions
cd functions && npm ci && npm run build
firebase deploy --only functions
```

---

## Deployment Commands

### Quick Deploy (All)
```bash
./scripts/deploy.sh all
```

### Deploy Specific Targets
```bash
# Vercel only
./scripts/deploy.sh vercel

# Firebase rules and functions
./scripts/deploy.sh firebase

# Functions only
./scripts/deploy.sh functions

# Rules only
./scripts/deploy.sh rules
```

### Manual Commands
```bash
# Firebase
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
firebase deploy --only firestore:rules,functions

# Vercel
vercel --prod
```

---

## Monitoring

### Health Check
- Production: `https://your-domain.com/api/health`
- Preview: `https://your-preview-url.vercel.app/api/health`

### Response Format
```json
{
  "status": "ok",
  "timestamp": "2025-01-04T12:00:00.000Z",
  "environment": "production",
  "version": "abc1234",
  "checks": {
    "firebase": { "status": "ok" },
    "app": { "status": "ok" }
  }
}
```

### Status Pages
- Vercel: https://vercel-status.com
- Firebase: https://status.firebase.google.com
- GitHub: https://www.githubstatus.com

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `ci.yml` | Push/PR to main | Lint, typecheck, test, build |
| `firebase-deploy.yml` | Push to main (firestore.rules, functions/*) | Deploy rules & functions |
| `preview-comment.yml` | PR opened/updated | Comment with preview URL |

### Required Status Checks (Recommended)

Enable these in GitHub branch protection for `main`:

- [x] CI / Lint & Type Check
- [x] CI / Unit Tests
- [x] CI / Build

---

## Troubleshooting

### Build Failures

1. Check Node.js version (requires 20+)
2. Clear cache: `rm -rf .next node_modules && npm ci`
3. Check environment variables are set
4. Review build logs for specific errors

### Firebase Deployment Failures

1. Check Firebase login: `firebase login`
2. Verify project: `firebase use --add`
3. Check functions dependencies: `cd functions && npm ci`
4. Review Firebase Console for quota limits

### Vercel Deployment Failures

1. Check environment variables in Vercel dashboard
2. Review deployment logs
3. Verify build command works locally
4. Check for any Vercel-specific build errors
