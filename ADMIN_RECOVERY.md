# Admin Account Recovery Guide

If you lose your admin credentials, follow one of these methods to regain access.

## 🔓 Recovery Methods

### Method 1: Use the Reset Script (Easiest)

Run the password reset script from the project root:

```bash
node scripts/reset-admin.js
```

This will reset credentials to defaults:
- **Email:** `admin@renfayelashes.com`
- **Password:** `admin123`

#### Custom Credentials

You can also set custom credentials:

```bash
node scripts/reset-admin.js your-email@example.com your-new-password
```

**Example:**
```bash
node scripts/reset-admin.js admin@mystore.com SecurePass123
```

### Method 2: Delete the Admin Database File

1. **Stop your server** (if running)

2. **Delete the admin credentials file:**
   ```bash
   rm data/admin.json
   ```

3. **Restart your server** - the file will regenerate with defaults:
   ```bash
   npm run dev
   ```

4. **Login with default credentials:**
   - Email: `admin@renfayelashes.com`
   - Password: `admin123`

### Method 3: Manual File Edit (Advanced)

If you prefer to edit the file directly:

1. **Open the file:**
   ```bash
   nano data/admin.json
   ```
   or
   ```bash
   code data/admin.json
   ```

2. **Generate a new password hash** using Node.js:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YOUR_NEW_PASSWORD', 10))"
   ```

3. **Update the JSON:**
   ```json
   {
     "id": "1",
     "email": "your-new-email@example.com",
     "passwordHash": "PASTE_HASH_HERE",
     "name": "Admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

4. **Save and restart the server**

## ⚠️ Important Security Notes

### After Recovery:

1. **Log in immediately** with the reset credentials
2. **Go to Account Settings** (`/admin/account`)
3. **Change your email and password** to something secure
4. **Store your new credentials** in a secure password manager

### Prevent Future Lockouts:

- ✅ Use a password manager (1Password, LastPass, Bitwarden)
- ✅ Write down credentials in a secure physical location
- ✅ Consider setting up a backup admin account (feature not yet implemented)
- ✅ Regularly backup the `data/` directory

## 🔒 Production Considerations

For production environments, consider implementing:

1. **Email-based password recovery** (requires email service)
2. **Two-factor authentication (2FA)**
3. **Multiple admin accounts** with different permission levels
4. **Automated backup** of admin credentials
5. **Audit logging** of all authentication attempts

## 🆘 Still Having Issues?

If you're unable to recover your account:

1. Check that the `data/` directory has proper permissions
2. Ensure bcryptjs is installed: `npm install bcryptjs`
3. Check server logs for any errors
4. Verify the database file exists: `ls -la data/`

## 📞 Need Help?

If none of these methods work, you may need to:
- Check your hosting provider's file access
- Contact your development team
- Consider a fresh installation (backup data first!)
