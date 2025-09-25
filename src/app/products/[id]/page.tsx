import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';

// Sample product data - in a real app, this would come from a database
const products = [
  {
    id: 1,
    name: 'Classic Volume Lashes',
    price: 49.99,
    images: [
      'https://picsum.photos/600/800?random=2',
      'https://picsum.photos/600/800?random=3',
      'https://picsum.photos/600/800?random=4',
    ],
    category: 'Volume Lashes',
    description: 'Our Classic Volume Lashes provide a natural yet enhanced look that perfectly frames your eyes. Each lash is carefully selected and applied to create beautiful volume while maintaining a lightweight feel.',
    features: [
      'Natural silk material',
      'Lightweight and comfortable',
      'Lasts 4-6 weeks',
      'Waterproof',
      'Customizable length and curl',
    ],
    specifications: {
      'Material': 'Premium Silk',
      'Length': '8-14mm',
      'Curl': 'C, CC, D',
      'Thickness': '0.15mm',
      'Application Time': '2-3 hours',
      'Retention': '4-6 weeks',
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 127,
  },
  {
    id: 2,
    name: 'Hybrid Volume Set',
    price: 59.99,
    images: [
      'https://picsum.photos/600/800?random=5',
      'https://picsum.photos/600/800?random=6',
      'https://picsum.photos/600/800?random=7',
    ],
    category: 'Hybrid Lashes',
    description: 'The perfect combination of classic and volume techniques, our Hybrid Volume Set creates a textured, multi-dimensional look that adds both length and fullness to your natural lashes.',
    features: [
      'Combination of classic and volume',
      'Multi-dimensional texture',
      'Enhanced fullness',
      'Long-lasting wear',
      'Professional application',
    ],
    specifications: {
      'Material': 'Premium Silk & Mink',
      'Length': '9-15mm',
      'Curl': 'C, CC, D',
      'Thickness': '0.12-0.15mm',
      'Application Time': '2.5-3.5 hours',
      'Retention': '5-7 weeks',
    },
    inStock: true,
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: 3,
    name: 'Mega Volume Set',
    price: 69.99,
    images: [
      'https://picsum.photos/600/800?random=8',
      'https://picsum.photos/600/800?random=9',
      'https://picsum.photos/600/800?random=10',
    ],
    category: 'Volume Lashes',
    description: 'For those who want maximum drama and glamour, our Mega Volume Set creates incredibly full, fluffy lashes that make a bold statement while remaining comfortable to wear.',
    features: [
      'Maximum volume and drama',
      'Ultra-lightweight fans',
      'Dramatic yet comfortable',
      'Perfect for special occasions',
      'Expert application required',
    ],
    specifications: {
      'Material': 'Ultra-fine Silk',
      'Length': '10-16mm',
      'Curl': 'C, CC, D, DD',
      'Thickness': '0.05-0.07mm',
      'Application Time': '3-4 hours',
      'Retention': '6-8 weeks',
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 156,
  },
];

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find(p => p.id === parseInt(params.id));

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = products.find(p => p.id === parseInt(params.id));

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | RENFAYE LASHES`,
    description: product.description,
    openGraph: {
      title: `${product.name} | RENFAYE LASHES`,
      description: product.description,
      images: [product.images[0]],
    },
  };
}
