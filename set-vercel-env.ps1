# PowerShell script to set Vercel environment variables
# Run this script after updating the values below

Write-Host "Setting Vercel environment variables..." -ForegroundColor Green

# Update these values:
$MONGODB_URI = "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mas-website?retryWrites=true&w=majority"
$JWT_SECRET = "635d6848f721a0e6709cfedd5708779d23e64d26ed90755fdd6033d3934abcb2"
$ADMIN_USERNAME = "admin@mascorporatess.com"
$ADMIN_PASSWORD = "mas123"

Write-Host "`nIMPORTANT: Update MONGODB_URI in this script first!" -ForegroundColor Yellow
Write-Host "`nSetting variables..." -ForegroundColor Cyan

# Set MONGODB_URI
Write-Host "Setting MONGODB_URI..." -ForegroundColor Yellow
echo "$MONGODB_URI" | vercel env add MONGODB_URI production preview development

# Set JWT_SECRET
Write-Host "Setting JWT_SECRET..." -ForegroundColor Yellow
echo "$JWT_SECRET" | vercel env add JWT_SECRET production preview development

# Set ADMIN_USERNAME
Write-Host "Setting ADMIN_USERNAME..." -ForegroundColor Yellow
echo "$ADMIN_USERNAME" | vercel env add ADMIN_USERNAME production preview development

# Set ADMIN_PASSWORD
Write-Host "Setting ADMIN_PASSWORD..." -ForegroundColor Yellow
echo "$ADMIN_PASSWORD" | vercel env add ADMIN_PASSWORD production preview development

Write-Host "`nDone! Now redeploy with: vercel --prod" -ForegroundColor Green
