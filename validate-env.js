#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks if all required environment variables are set
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating environment configuration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  console.log('📝 Please create a .env file based on .env.example');
  console.log('   Run: cp .env.example .env');
  process.exit(1);
}

// Load .env file
dotenv.config();

// Required environment variables
const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'SESSION_SECRET',
  'PORT'
];

// Optional but recommended
const optional = [
  'BASE_URL',
  'DATABASE_URL',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM'
];

let missingRequired = [];
let missingOptional = [];

// Check required variables
required.forEach(key => {
  if (!process.env[key] || process.env[key].includes('your-') || process.env[key].includes('-here')) {
    missingRequired.push(key);
  }
});

// Check optional variables
optional.forEach(key => {
  if (!process.env[key] || process.env[key].includes('your-') || process.env[key].includes('-here')) {
    missingOptional.push(key);
  }
});

// Report results
if (missingRequired.length === 0) {
  console.log('✅ All required environment variables are set!\n');
  
  console.log('Configuration:');
  console.log(`  - Supabase URL: ${process.env.VITE_SUPABASE_URL.substring(0, 30)}...`);
  console.log(`  - Port: ${process.env.PORT}`);
  console.log(`  - Base URL: ${process.env.BASE_URL || 'http://localhost:' + process.env.PORT}`);
  
  if (missingOptional.length > 0) {
    console.log('\n⚠️  Optional variables not configured:');
    missingOptional.forEach(key => {
      console.log(`  - ${key}`);
    });
    console.log('\nThese are not required but may limit functionality:');
    console.log('  - EMAIL_* variables: Email notifications will not work');
    console.log('  - BASE_URL: Will default to localhost');
  }
  
  console.log('\n🎉 Environment is ready!');
  console.log('\nNext steps:');
  console.log('  1. Set up your database (see DATABASE_SETUP.md)');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npm run dev');
  process.exit(0);
} else {
  console.error('❌ Missing required environment variables:\n');
  missingRequired.forEach(key => {
    console.error(`  - ${key}`);
  });
  console.log('\n📝 How to fix:');
  console.log('  1. Open your .env file');
  console.log('  2. Set the missing values');
  console.log('  3. Run this script again to verify\n');
  console.log('For Supabase credentials:');
  console.log('  - Log into https://app.supabase.com');
  console.log('  - Go to Settings → API');
  console.log('  - Copy URL and anon key\n');
  process.exit(1);
}
