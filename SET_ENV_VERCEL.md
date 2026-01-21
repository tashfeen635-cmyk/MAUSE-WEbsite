# How to Set Environment Variables in Vercel

## Quick Steps

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/mesum357s-projects/masss/settings/environment-variables

2. **Add Each Variable:**
   Click "Add New" for each variable below:

   ### Required Variables:

   **MONGODB_URI**
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mas-website?retryWrites=true&w=majority`
   - Environments: Select all (Production, Preview, Development)

   **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: A secure random string (at least 32 characters)
   - Generate one: https://randomkeygen.com/ or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   - Environments: Select all (Production, Preview, Development)

   **ADMIN_USERNAME**
   - Key: `ADMIN_USERNAME`
   - Value: `tashu`
   - Environments: Select all (Production, Preview, Development)

   **ADMIN_PASSWORD**
   - Key: `ADMIN_PASSWORD`
   - Value: `tashu123` (or your secure password)
   - Environments: Select all (Production, Preview, Development)

3. **Save and Redeploy:**
   - After adding all variables, you need to redeploy
   - Go to: https://vercel.com/mesum357s-projects/masss/deployments
   - Click "Redeploy" on the latest deployment

## Using Vercel CLI (Alternative)

You can also set them via CLI:

```bash
# Set MongoDB URI
vercel env add MONGODB_URI
# Paste your MongoDB connection string when prompted
# Select: Production, Preview, Development

# Set JWT Secret
vercel env add JWT_SECRET
# Enter your secret key when prompted
# Select: Production, Preview, Development

# Set Admin Username
vercel env add ADMIN_USERNAME
# Enter: tashu
# Select: Production, Preview, Development

# Set Admin Password
vercel env add ADMIN_PASSWORD
# Enter your password
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

## Get MongoDB Connection String

1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Login to your account
3. Click "Database" → Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `mas-website` (or your preferred database name)

Example format:
```
mongodb+srv://username:YourPassword@cluster0.xxxxx.mongodb.net/mas-website?retryWrites=true&w=majority
```

## Generate Secure JWT Secret

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator: https://randomkeygen.com/

## After Setting Variables

1. **Redeploy your application:**
   ```bash
   vercel --prod
   ```

2. **Test the login:**
   - Go to: https://masss-xi.vercel.app/admin
   - Login with your credentials

3. **Check if it works:**
   - Test endpoint: https://masss-xi.vercel.app/api/test
   - This will show which environment variables are set

## Important Notes

- **Never commit `.env` file to Git** (already in .gitignore)
- **Change default passwords** in production
- **Use strong JWT_SECRET** in production
- **Restart deployment** after adding environment variables
