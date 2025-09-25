import { Metadata } from 'next';
import GalleryPage from '@/components/gallery/GalleryPage';

export const metadata: Metadata = {
  title: 'Gallery | RENFAYE LASHES',
  description: 'Browse our gallery of beautiful eyelash extension transformations and see the amazing results our clients achieve.',
};

export default function Gallery() {
  return <GalleryPage />;
}
