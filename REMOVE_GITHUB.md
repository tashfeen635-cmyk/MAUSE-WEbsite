# GitHub Repository Removed

The GitHub repository connection has been removed from this project.

## What Was Done

- Removed the git remote connection to: `https://github.com/tashfeen635-cmyk/MAS-Website.git`

## Current Status

- No git remote is configured
- Local git repository still exists (you can still commit locally)
- Vercel deployment will need to be reconfigured if it was connected to GitHub

## If You Want to Reconnect Later

To add a new repository:

```bash
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## For Vercel Deployment

If your Vercel project was connected to GitHub, you have two options:

1. **Reconnect to a new GitHub repository:**
   - Push code to a new GitHub repo
   - Update Vercel project settings to point to the new repo

2. **Deploy without GitHub (using Vercel CLI):**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

## Note

The website content itself doesn't contain any GitHub links - only the deployment documentation mentions GitHub as an option for hosting the code repository.
