# Script to fix OneDrive file locking issues
# Run this if you get EBUSY errors

Write-Host "🛑 Stopping all Node processes..."
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

Write-Host "🗑️  Deleting .next folder..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "✅ .next folder deleted"
} else {
    Write-Host "ℹ️  .next folder doesn't exist"
}

Write-Host "`n✅ Done! Now restart your dev server with: npm run dev"
Write-Host "`n💡 TIP: If this keeps happening, exclude the project folder from OneDrive sync"



