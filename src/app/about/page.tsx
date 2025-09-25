import { Metadata } from 'next';
import AboutPage from '@/components/about/AboutPage';

export const metadata: Metadata = {
  title: 'About Us | RENFAYE LASHES',
  description: 'Learn about RENFAYE LASHES - our story, mission, and commitment to providing premium eyelash extension services.',
};

export default function About() {
  return <AboutPage />;
}
