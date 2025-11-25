import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import { getProducts } from '@/lib/db';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const products = await getProducts();
  const dbProduct = products.find(p => p.id === id);

  if (!dbProduct) {
    notFound();
  }

  // Transform database product to match ProductDetail expectations
  const product = {
    ...dbProduct,
    id: parseInt(dbProduct.id) || 0,
    images: dbProduct.image ? [dbProduct.image] : [],
    features: dbProduct.features && dbProduct.features.length > 0 
      ? dbProduct.features 
      : [
          'Premium quality materials',
          'Long-lasting wear',
          'Professional application recommended',
          'Waterproof and durable',
        ],
    specifications: dbProduct.specifications && Object.keys(dbProduct.specifications).length > 0
      ? dbProduct.specifications
      : {
          'Category': dbProduct.category,
          'Price': `$${dbProduct.price.toFixed(2)}`,
          'Stock': dbProduct.inStock ? 'In Stock' : 'Out of Stock',
        },
    careInstructions: dbProduct.careInstructions,
    rating: 4.8,
    reviewCount: 0,
  };

  return <ProductDetail product={product as any} />;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find(p => p.id === id);

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
      images: product.image ? [product.image] : [],
    },
  };
}
