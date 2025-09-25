import { Metadata } from 'next';
import ShopPage from '@/components/shop/ShopPage';

export const metadata: Metadata = {
  title: 'Shop | RENFAYE LASHES',
  description: 'Browse our complete collection of premium eyelash extensions. Find the perfect lashes for your style.',
};

export default function Shop() {
  return <ShopPage />;
}
