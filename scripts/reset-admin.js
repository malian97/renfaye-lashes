/**
 * Admin Password Reset Script
 * 
 * This script resets the admin credentials to default values.
 * Use this ONLY if you've lost access to your admin account.
 * 
 * Usage:
 *   node scripts/reset-admin.js
 * 
 * Or with custom credentials:
 *   node scripts/reset-admin.js new-email@example.com newpassword123
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Get arguments
const args = process.argv.slice(2);
const newEmail = args[0] || 'admin@renfayelashes.com';
const newPassword = args[1] || 'admin123';

// Validate inputs
if (newPassword.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters');
  process.exit(1);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(newEmail)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

// Hash the password
const passwordHash = bcrypt.hashSync(newPassword, 10);

// Create admin credentials object
const adminCredentials = {
  id: '1',
  email: newEmail,
  passwordHash: passwordHash,
  name: 'Admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Write to admin.json
const adminFilePath = path.join(dataDir, 'admin.json');
fs.writeFileSync(adminFilePath, JSON.stringify(adminCredentials, null, 2));

console.log('\n✅ Admin credentials have been reset!');
console.log('\n📧 New Credentials:');
console.log(`   Email:    ${newEmail}`);
console.log(`   Password: ${newPassword}`);
console.log('\n⚠️  IMPORTANT: Change these credentials immediately after logging in!\n');
console.log('🔗 Login at: http://localhost:3000/admin/login\n');
