import { Metadata } from 'next';
import ServicesPage from '@/components/services/ServicesPage';

export const metadata: Metadata = {
  title: 'Services | RENFAYE LASHES',
  description: 'Professional eyelash extension services including classic, volume, hybrid lashes, lash lifts, and more.',
};

export default function Services() {
  return <ServicesPage />;
}
