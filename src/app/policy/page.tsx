import { Metadata } from 'next';
import PolicyPage from '@/components/policy/PolicyPage';

export const metadata: Metadata = {
  title: 'Policies | RENFAYE LASHES',
  description: 'Review our policies including privacy policy, terms of service, return policy, and booking policies.',
};

export default function Policy() {
  return <PolicyPage />;
}
