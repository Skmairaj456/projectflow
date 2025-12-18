const fs = require('fs');
const crypto = require('crypto');

const envContent = `# Database - Supabase PostgreSQL (Connection Pooler - Recommended)
# Using Transaction mode pooler (port 6543) for better connection management
# Note: Password contains @ which is URL encoded as %40
# connection_limit=10 allows multiple concurrent requests
# connect_timeout=10 increases timeout for connection acquisition
DATABASE_URL="postgresql://postgres.moipshirdisvecojldwi:Mairaj%401784@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&connect_timeout=15&pool_timeout=20"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${crypto.randomBytes(32).toString('base64')}"

# OAuth Providers (Optional - add when needed)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Redis (for caching and sessions - optional)
REDIS_URL="redis://localhost:6379"

# Cloudinary (for file uploads - optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (for notifications - optional)
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# App
NODE_ENV="development"
`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file created successfully!');
console.log('📝 Your Supabase database connection is configured.');
console.log('🔐 A secure NEXTAUTH_SECRET has been generated.');

