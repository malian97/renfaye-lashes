import { Metadata } from 'next';
import MembershipPage from '@/components/membership/MembershipPage';

export const metadata: Metadata = {
  title: 'Memberships | RENFAYE LASHES',
  description: 'Join our exclusive membership program and enjoy premium lash services, discounts, and rewards.',
};

export default function Membership() {
  return <MembershipPage />;
}
