#!/usr/bin/env node

/**
 * Helper script to prepare environment variables for Render deployment
 */

import crypto from 'crypto';

console.log('\n🚀 MindCheck Backend Deployment Helper\n');

// 1. Generate JWT Secret
const jwtSecret = crypto.randomBytes(48).toString('hex');
console.log('✅ Generated JWT Secret (save this):');
console.log(`   JWT_SECRET=${jwtSecret}\n`);

// 2. Neon Connection String Guide
console.log('📋 Neon Database Connection String Guide:');
console.log('   1. Go to https://console.neon.tech');
console.log('   2. Select your project');
console.log('   3. Click "Connection Details"');
console.log('   4. Choose "Pooled connection" (important!)');
console.log('   5. Copy the connection string');
console.log('   Format should look like:');
console.log('   DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.us-east-2.aws.neon.tech/mindcheck?sslmode=require"\n');

// 3. Frontend URL
console.log('🌐 Frontend Configuration:');
console.log('   Replace with your actual Vercel URL (e.g., https://mindcheck.vercel.app)');
console.log('   CORS_ORIGIN=https://your-frontend-url.vercel.app');
console.log('   CLIENT_URL=https://your-frontend-url.vercel.app\n');

console.log('📝 Summary of Environment Variables for Render:');
console.log('   ─────────────────────────────────────────────────');
console.log('   NODE_ENV=production');
console.log('   DATABASE_URL=<your-neon-pooled-url>');
console.log(`   JWT_SECRET=${jwtSecret}`);
console.log('   JWT_EXPIRES_IN=7d');
console.log('   CORS_ORIGIN=https://your-frontend-url.vercel.app');
console.log('   CLIENT_URL=https://your-frontend-url.vercel.app\n');

console.log('Next steps:');
console.log('1. Commit and push the changes: git add . && git commit -m "Update Render config" && git push');
console.log('2. Go to https://dashboard.render.com and create a new Web Service');
console.log('3. Connect your repository: MuhammadAbdullah990/mindcheck');
console.log('4. Add the environment variables above');
console.log('5. Deploy!\n');
