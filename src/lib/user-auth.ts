import jwt from 'jsonwebtoken';
import { User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserToken {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function generateUserToken(user: User): string {
  const payload: UserToken = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyUserToken(token: string): UserToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserToken;
    return decoded;
  } catch {
    return null;
  }
}
