import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In production, store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@renfayelashes.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  // In production, this would check against a database
  if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return {
      id: '1',
      email: ADMIN_EMAIL,
      name: 'Admin'
    };
  }
  return null;
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
    return decoded;
  } catch {
    return null;
  }
}
