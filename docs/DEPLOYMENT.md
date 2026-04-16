# Deployment Guide for THEIA

## Pre-Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] No console errors in dev build
- [ ] `.env` NOT staged (verify with `git status`)
- [ ] Environment variables configured correctly
- [ ] Security audit passed
- [ ] Performance benchmarks met (<2s load time)

## Environment Variables

Required for deployment (set in CI/CD or server):

```env
VITE_REGION=your-region
VITE_PROJECT=your-project-id
VITE_AGENT_ID=your-agent-id
VITE_WORKFORCE_ID=optional-workforce-id (if using workforce mode)
```

⚠️ **NEVER commit `.env` to repository**. Use `.env.example` as template.

## Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build
# Output: dist/ directory with optimised assets

# Preview production build locally
npm run preview
```

## Deployment Options

### Option 1: Static Hosting (Recommended for THEIA)

- **Platforms:** Vercel, Netlify, GitHub Pages
- **Steps:**
  1. Push to main branch
  2. CI/CD pipeline triggers build
  3. Deploy dist/ folder
  4. Set environment variables in hosting dashboard

### Option 2: Docker Containerisation

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Option 3: Traditional Server (Node.js)

```bash
# Install PM2 for process management
npm install -g pm2

# Build
npm run build

# Start production server
pm2 start "npm run preview" --name theia
```

## Performance Optimisation

- **Code splitting:** Vite handles automatically
- **Asset compression:** gzip enabled on production servers
- **Caching:** Set long-lived cache headers for dist assets
- **CDN:** Deploy dist/ folder to CDN for global distribution

## Monitoring Post-Deployment

- Monitor error logs in browser console
- Track real-time dashboard performance
- Verify API connectivity to fraud analysis backend
- Monitor streaming data updates for latency
- Check audit log ingestion

## Rollback Procedure

1. Revert to previous commit: `git revert <commit-hash>`
2. Rebuild: `npm run build`
3. Redeploy dist/ folder
4. Verify functionality
5. Document incident in audit logs

## Database & State Management

- User authentication state stored locally via signals
- Fraud case data persisted through backend API
- Session data synced via `signals/storage.ts`
- No state stored in Git history

## Security in Production

- HTTPS enforced
- CSP headers configured
- CORS properly restricted
- Rate limiting on API endpoints
- Audit logging active for all actions

## Versioning

- Semantic versioning: MAJOR.MINOR.PATCH
- Tag releases: `git tag -a v1.0.0 -m "Release 1.0.0"`
- Document breaking changes in release notes

## Maintenance Windows

- Schedule during low-traffic periods
- Notify users 24 hours in advance
- Estimated duration: 15-30 minutes
- Have rollback plan ready
