import jwt from 'jsonwebtoken';
import { getAdminCredentials, verifyAdminPassword } from './db';

// In production, store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  const isValid = await verifyAdminPassword(email, password);
  
  if (isValid) {
    const admin = await getAdminCredentials();
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name
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
