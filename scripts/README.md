# Scripts Directory

This directory contains utility scripts for managing your RENFAYE LASHES application.

## Available Scripts

### `reset-admin.js`

Resets admin credentials if you lose access to your account.

**Basic Usage (default credentials):**
```bash
npm run reset-admin
```

This resets to:
- Email: `admin@renfayelashes.com`
- Password: `admin123`

**Custom Credentials:**
```bash
node scripts/reset-admin.js your-email@example.com YourSecurePassword123
```

**Requirements:**
- Password must be at least 6 characters
- Email must be valid format

**After Reset:**
1. Login with the new credentials
2. Immediately go to Account Settings
3. Change to secure credentials
4. Store them in a password manager

---

For more recovery options, see [ADMIN_RECOVERY.md](../ADMIN_RECOVERY.md)
