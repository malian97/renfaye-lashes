// Content Management System
// In production, this would connect to a database

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
  featured: boolean;
  bestSeller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
  };
  about: {
    title: string;
    description: string;
    stats: Array<{
      number: string;
      label: string;
      description: string;
    }>;
  };
  testimonials: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    image: string;
    service: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    image: string;
    popular: boolean;
  }>;
}

class ContentManager {
  private readonly PRODUCTS_KEY = 'renfaye_products';
  private readonly ORDERS_KEY = 'renfaye_orders';
  private readonly CONTENT_KEY = 'renfaye_content';

  // Products Management
  getProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultProducts();
  }

  getProduct(id: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index >= 0) {
      products[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      products.push({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  // Orders Management
  getOrders(): Order[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getOrder(id: string): Order | null {
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    
    if (index >= 0) {
      orders[index] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.push({ ...order, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  updateOrderStatus(id: string, status: Order['status']): void {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
  }

  // Site Content Management
  getSiteContent(): SiteContent {
    if (typeof window === 'undefined') return this.getDefaultContent();
    const stored = localStorage.getItem(this.CONTENT_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultContent();
  }

  saveSiteContent(content: SiteContent): void {
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
  }

  // Default Data
  private getDefaultProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Classic Volume Lashes',
        price: 49.99,
        originalPrice: 69.99,
        description: 'Beautiful classic volume lashes for a natural yet enhanced look',
        category: 'Volume Lashes',
        image: 'https://picsum.photos/600/800?random=1',
        inStock: true,
        featured: true,
        bestSeller: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Hybrid Volume Set',
        price: 59.99,
        originalPrice: 79.99,
        description: 'Perfect blend of classic and volume techniques',
        category: 'Hybrid Lashes',
        image: 'https://picsum.photos/600/800?random=2',
        inStock: true,
        featured: true,
        bestSeller: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Mega Volume Set',
        price: 69.99,
        originalPrice: 89.99,
        description: 'Maximum volume for dramatic, glamorous look',
        category: 'Volume Lashes',
        image: 'https://picsum.photos/600/800?random=3',
        inStock: true,
        featured: true,
        bestSeller: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private getDefaultContent(): SiteContent {
    return {
      hero: {
        title: 'Enhance Your Natural Beauty',
        subtitle: 'Premium eyelash extensions that make you feel confident and glamorous.',
        ctaText: 'Book Appointment',
        ctaLink: '/services',
        backgroundImage: 'https://picsum.photos/1920/1080?random=hero'
      },
      about: {
        title: 'Why Choose RENFAYE LASHES?',
        description: 'With over 8 years of experience in the beauty industry, we\'ve perfected the art of eyelash extensions.',
        stats: [
          { number: '5000+', label: 'Happy Clients', description: 'Satisfied customers worldwide' },
          { number: '8+', label: 'Years Experience', description: 'In the beauty industry' },
          { number: '99%', label: 'Client Satisfaction', description: 'Based on customer reviews' },
          { number: '50+', label: 'Lash Styles', description: 'Premium options available' }
        ]
      },
      testimonials: [
        {
          id: '1',
          name: 'Sarah Johnson',
          location: 'New York, NY',
          rating: 5,
          text: 'Absolutely amazing! The lashes look so natural and beautiful.',
          image: 'https://picsum.photos/150/150?random=15',
          service: 'Classic Volume Lashes'
        }
      ],
      services: [
        {
          id: '1',
          name: 'Classic Lashes',
          description: 'Natural-looking lashes perfect for everyday wear',
          price: '$80',
          duration: '90 min',
          image: 'https://picsum.photos/400/300?random=service1',
          popular: false
        }
      ]
    };
  }
}

export const contentManager = new ContentManager();
