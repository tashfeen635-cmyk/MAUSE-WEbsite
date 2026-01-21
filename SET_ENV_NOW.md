# Set Environment Variables in Vercel - Quick Guide

## Option 1: Via Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/mesum357s-projects/masss/settings/environment-variables

2. Add these 4 variables:

   **Variable 1: MONGODB_URI**
   - Value: Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mas-website?retryWrites=true&w=majority`

   **Variable 2: JWT_SECRET**
   - Value: Generate a random 32+ character string
   - You can use: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

   **Variable 3: ADMIN_USERNAME**
   - Value: `tashu`

   **Variable 4: ADMIN_PASSWORD**
   - Value: `tashu123` (or your preferred password)

3. For each variable, select: ✅ Production, ✅ Preview, ✅ Development

4. Click "Save" for each one

5. **IMPORTANT:** After adding variables, go to Deployments tab and click "Redeploy" on the latest deployment

## Option 2: Via Vercel CLI (If you have CLI installed)

Run these commands (one at a time, paste values when prompted):

```bash
vercel env add MONGODB_URI production preview development
# When prompted, paste your MongoDB connection string

vercel env add JWT_SECRET production preview development
# When prompted, paste a random 32+ character string

vercel env add ADMIN_USERNAME production preview development
# When prompted, type: tashu

vercel env add ADMIN_PASSWORD production preview development
# When prompted, type: tashu123

# Then redeploy
vercel --prod
```

## Get MongoDB Connection String

If you don't have MongoDB Atlas yet:

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0)
3. Create database user (username/password)
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Database → Connect → Connect your app
6. Copy connection string and replace `<password>` and `<dbname>`

## After Setting Variables

The app will automatically redeploy, or you can manually redeploy:
- Dashboard: Click "Redeploy" on latest deployment
- CLI: `vercel --prod`

## Verify Variables Are Set

After redeploying, visit:
- https://masss-xi.vercel.app/api/test
- This will show which environment variables are configured
