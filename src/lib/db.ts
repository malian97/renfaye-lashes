// Server-side database utility using file system
import { promises as fs } from 'fs';
import path from 'path';
import { Product, Order, Service, ContactSubmission, ScheduleSettings, DaySchedule, Appointment, StoreSettings, PageContent } from './content-manager';
import bcrypt from 'bcryptjs';

export interface AdminCredentials {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  suspended?: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  membership?: {
    tierId: string;
    tierName: string;
    status: 'active' | 'cancelled' | 'past_due';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    usage?: {
      currentPeriodStart: string;
      refillsUsed: number;
      fullSetsUsed: number;
    };
  };
  points?: {
    balance: number;
    lifetimeEarned: number;
    history: Array<{
      id: string;
      date: string;
      type: 'earned' | 'redeemed';
      amount: number;
      description: string;
      orderId?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');
const DATA_DIR = (() => {
  const envDir = process.env.DATA_DIR;
  if (!envDir) return DEFAULT_DATA_DIR;
  return path.isAbsolute(envDir) ? envDir : path.join(process.cwd(), envDir);
})();

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic read function
async function readData<T>(filename: string, defaultData: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, create it with default data
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

// Generic write function
async function writeData<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Products
export async function getProducts(): Promise<Product[]> {
  return readData('products.json', getDefaultProducts());
}

export async function saveProducts(products: Product[]): Promise<void> {
  return writeData('products.json', products);
}

// Services
export async function getServices(): Promise<Service[]> {
  return readData('services.json', getDefaultServices());
}

export async function saveServices(services: Service[]): Promise<void> {
  return writeData('services.json', services);
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return readData('orders.json', []);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  return writeData('orders.json', orders);
}

// Default data functions
function getDefaultProducts(): Product[] {
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

function getDefaultServices(): Service[] {
  return [
    {
      id: '1',
      name: 'Classic Lashes',
      description: 'One extension applied to each natural lash for a natural, enhanced look.',
      duration: '2-2.5 hours',
      price: 135,
      image: 'https://picsum.photos/600/400?random=30',
      features: [
        'Natural enhancement',
        'Perfect for everyday wear',
        'Lightweight and comfortable',
        'Lasts 4-6 weeks',
        'Suitable for all eye shapes'
      ],
      popular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Volume Lashes',
      description: 'Multiple lightweight extensions fanned and applied to each natural lash.',
      duration: '2.5-3 hours',
      price: 200,
      image: 'https://picsum.photos/600/400?random=31',
      features: [
        'Dramatic, full look',
        'Customizable volume',
        'Ultra-lightweight',
        'Perfect for special events',
        'Lasts 5-7 weeks'
      ],
      popular: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Hybrid Lashes',
      description: 'Perfect combination of classic and volume techniques for textured fullness.',
      duration: '2.5-3 hours',
      price: 175,
      image: 'https://picsum.photos/600/400?random=32',
      features: [
        'Best of both worlds',
        'Textured, dimensional look',
        'Versatile styling',
        'Natural yet full',
        'Lasts 5-6 weeks'
      ],
      popular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Lash Lift & Tint',
      description: 'Curl and darken your natural lashes for a mascara-like effect.',
      duration: '1-1.5 hours',
      price: 90,
      image: 'https://picsum.photos/600/400?random=33',
      features: [
        'No extensions needed',
        'Enhances natural lashes',
        'Low maintenance',
        'Waterproof results',
        'Lasts 6-8 weeks'
      ],
      popular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Lash Removal',
      description: 'Safe and gentle removal of existing lash extensions.',
      duration: '30-45 minutes',
      price: 40,
      image: 'https://picsum.photos/600/400?random=34',
      features: [
        'Professional removal',
        'Protects natural lashes',
        'Gentle process',
        'Includes aftercare advice',
        'Prepares for new set'
      ],
      popular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Touch-Up/Fill',
      description: 'Maintain your lashes with regular fill appointments.',
      duration: '1-1.5 hours',
      price: 75,
      image: 'https://picsum.photos/600/400?random=35',
      features: [
        'Maintains fullness',
        'Extends lash life',
        'Cost-effective',
        'Every 2-3 weeks',
        'Quick refresh'
      ],
      popular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Contact Submissions
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  return readData('contact-submissions.json', []);
}

export async function saveContactSubmissions(submissions: ContactSubmission[]): Promise<void> {
  return writeData('contact-submissions.json', submissions);
}

// Deep merge helper function
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        // For arrays, use target if exists, otherwise use source default
        output[key] = target[key] !== undefined ? target[key] : source[key];
      } else {
        output[key] = target[key] !== undefined ? target[key] : source[key];
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Site Content
export async function getSiteContent() {
  const defaults = getDefaultSiteContent();
  const stored = await readData('content.json', defaults);
  
  // Deep merge stored content with defaults to ensure new fields exist
  return deepMerge(stored, defaults);
}

export async function saveSiteContent(content: any): Promise<void> {
  return writeData('content.json', content);
}

function getDefaultSiteContent() {
  return {
    hero: {
      title: 'Enhance Your Natural Beauty',
      subtitle: 'Premium eyelash extensions that make you feel confident and glamorous.',
      ctaText: 'Book Appointment',
      ctaLink: '/services',
      backgroundImage: 'https://picsum.photos/1920/1080?random=hero',
      slideshowImages: [
        'https://picsum.photos/1920/1080?random=1',
        'https://picsum.photos/1920/1080?random=2',
        'https://picsum.photos/1920/1080?random=3'
      ]
    },
    about: {
      title: 'Why Choose RENFAYE LASHES?',
      description: 'With over 8 years of experience in the beauty industry, we\'ve perfected the art of eyelash extensions.',
      stats: [
        { number: '5000+', label: 'Happy Clients', description: 'Satisfied customers worldwide' },
        { number: '8+', label: 'Years Experience', description: 'In the beauty industry' },
        { number: '99%', label: 'Client Satisfaction', description: 'Based on customer reviews' },
        { number: '50+', label: 'Lash Styles', description: 'Premium options available' }
      ],
      values: [
        { title: 'Excellence', description: 'We strive for perfection in every lash application, using only the finest materials and latest techniques.' },
        { title: 'Care', description: 'Your comfort and satisfaction are our top priorities. We provide a relaxing, luxurious experience.' },
        { title: 'Innovation', description: 'We stay current with the latest trends and techniques to offer you the most advanced lash services.' }
      ],
      team: [
        {
          id: '1',
          name: 'Sarah Mitchell',
          role: 'Founder & Lead Technician',
          image: 'https://picsum.photos/300/400?random=60',
          bio: 'With over 8 years of experience in the beauty industry, Sarah founded RENFAYE LASHES with a vision to provide premium eyelash extension services.',
          certifications: ['Certified Lash Artist', 'Volume Lash Specialist', 'Lash Lift Certified']
        },
        {
          id: '2',
          name: 'Emily Chen',
          role: 'Senior Lash Technician',
          image: 'https://picsum.photos/300/400?random=61',
          bio: 'Emily specializes in volume and mega volume techniques, creating stunning dramatic looks while maintaining the health of natural lashes.',
          certifications: ['Volume Lash Expert', 'Classic Lash Certified', 'Hybrid Specialist']
        },
        {
          id: '3',
          name: 'Maria Rodriguez',
          role: 'Lash Artist & Trainer',
          image: 'https://picsum.photos/300/400?random=62',
          bio: 'Maria combines her artistic background with technical expertise to create beautiful, customized lash looks for each client.',
          certifications: ['Master Lash Artist', 'Lash Trainer', 'Color Theory Certified']
        }
      ],
      cta: {
        title: 'Experience the RENFAYE Difference',
        description: 'Join thousands of satisfied clients who trust us with their lash needs. Book your appointment today and discover why we\'re the premier choice for eyelash extensions.',
        primaryButtonText: 'Book Now',
        primaryButtonLink: '/book',
        secondaryButtonText: 'Free Consultation',
        secondaryButtonLink: '/contact'
      }
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
    ],
    policy: {
      title: 'Privacy & Policies',
      subtitle: 'Your trust is important to us. Please review our policies to understand how we protect your information and serve you better.',
      sections: [
        {
          title: 'Privacy Policy',
          content: [
            {
              subtitle: 'Information We Collect',
              text: 'We collect information that you provide directly to us, including your name, email address, phone number, and appointment details when you book our services or create an account.'
            },
            {
              subtitle: 'How We Use Your Information',
              text: 'We use the information we collect to provide, maintain, and improve our services, to process your bookings, to communicate with you about appointments and promotions, and to enhance your experience with RENFAYE LASHES.'
            },
            {
              subtitle: 'Data Security',
              text: 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.'
            },
            {
              subtitle: 'Your Rights',
              text: 'You have the right to access, correct, or delete your personal information. Please contact us if you wish to exercise these rights.'
            }
          ]
        },
        {
          title: 'Booking & Appointment Policy',
          content: [
            {
              subtitle: 'Booking Confirmation',
              text: 'All appointments must be confirmed via phone, email, or through our online booking system. You will receive a confirmation message once your booking is complete.'
            },
            {
              subtitle: 'Cancellation Policy',
              text: 'We require at least 24 hours notice for cancellations or rescheduling. Cancellations made with less than 24 hours notice may be subject to a cancellation fee of 50% of the service cost.'
            },
            {
              subtitle: 'Late Arrivals',
              text: 'Please arrive on time for your appointment. If you arrive more than 15 minutes late, we may need to reschedule your appointment or reduce service time to accommodate other clients.'
            },
            {
              subtitle: 'No-Show Policy',
              text: 'Failure to show up for a scheduled appointment without prior notice will result in a no-show fee equivalent to 100% of the service cost.'
            }
          ]
        },
        {
          title: 'Return & Refund Policy',
          content: [
            {
              subtitle: 'Service Satisfaction',
              text: 'Your satisfaction is our priority. If you are not completely satisfied with your service, please contact us within 48 hours, and we will work to make it right.'
            },
            {
              subtitle: 'Product Returns',
              text: 'Unopened products may be returned within 14 days of purchase for a full refund. Products must be in their original packaging and unused. Opened products cannot be returned due to hygiene reasons.'
            },
            {
              subtitle: 'Refund Processing',
              text: 'Approved refunds will be processed within 5-7 business days to the original payment method.'
            },
            {
              subtitle: 'Service Corrections',
              text: 'If you experience any issues with your lash extensions within 48 hours of application, we offer complimentary touch-ups or corrections.'
            }
          ]
        },
        {
          title: 'Health & Safety Policy',
          content: [
            {
              subtitle: 'Hygiene Standards',
              text: 'We maintain the highest hygiene standards. All tools are sanitized between clients, and we use disposable items wherever possible.'
            },
            {
              subtitle: 'Allergies & Sensitivities',
              text: 'Please inform us of any allergies or sensitivities before your appointment. We offer patch tests for clients with sensitive skin or concerns about allergic reactions.'
            },
            {
              subtitle: 'Health Conditions',
              text: 'Certain health conditions may affect your ability to receive lash extension services. Please disclose any eye infections, conditions, or recent eye surgeries.'
            },
            {
              subtitle: 'Aftercare Requirements',
              text: 'Proper aftercare is essential for the longevity of your lash extensions. We provide detailed aftercare instructions that must be followed to maintain your lashes and prevent complications.'
            }
          ]
        },
        {
          title: 'Terms of Service',
          content: [
            {
              subtitle: 'Service Agreement',
              text: 'By booking and using our services, you agree to follow our policies and procedures. We reserve the right to refuse service to anyone who does not comply with our policies.'
            },
            {
              subtitle: 'Liability',
              text: 'While we take every precaution to ensure your safety and satisfaction, RENFAYE LASHES is not liable for any allergic reactions, sensitivities, or complications that may arise despite proper disclosure and patch testing.'
            },
            {
              subtitle: 'Changes to Policies',
              text: 'We reserve the right to update these policies at any time. Any changes will be posted on this page and will take effect immediately upon posting.'
            }
          ]
        }
      ]
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Ready to enhance your natural beauty? Get in touch with our expert team to book your appointment or ask any questions about our premium eyelash extension services.',
      phone: '(555) 123-4567',
      email: 'info@renfayelashes.com',
      address: '123 Beauty Lane, Suite 100, New York, NY 10001',
      hours: 'Mon-Fri: 9:00 AM - 7:00 PM\nSat: 10:00 AM - 6:00 PM\nSun: Closed'
    },
    sizeGuide: {
      title: 'Lash Size Guide',
      subtitle: 'Find the perfect lash length and volume for your desired look. Our comprehensive guide helps you choose the right style for your eyes.',
      lengths: [
        {
          id: '1',
          title: 'Natural',
          range: '8-10mm',
          description: 'Perfect for everyday wear. These lengths provide a subtle enhancement that looks naturally beautiful.',
          features: [
            'Ideal for first-time lash clients',
            'Professional office-appropriate',
            'Comfortable for all-day wear',
            'Natural-looking enhancement'
          ]
        },
        {
          id: '2',
          title: 'Glamorous',
          range: '11-13mm',
          description: 'Our most popular choice. These lengths create a noticeable, beautiful look that\'s still wearable daily.',
          features: [
            'Perfect balance of drama and natural',
            'Popular for special events',
            'Creates an open, wide-eyed look',
            'Suitable for most eye shapes'
          ]
        },
        {
          id: '3',
          title: 'Dramatic',
          range: '14-16mm',
          description: 'Bold and beautiful. These lengths create maximum impact and are perfect for those who love a glamorous look.',
          features: [
            'High-impact dramatic effect',
            'Ideal for photo shoots & events',
            'Makes a bold fashion statement',
            'Requires healthy natural lashes'
          ]
        }
      ],
      volumes: [
        {
          id: '1',
          title: 'Classic Lashes',
          description: 'One extension applied to one natural lash. Creates a natural, mascara-like effect with added length.',
          bestFor: [
            'Clients with abundant natural lashes',
            'Those seeking a natural enhancement',
            'First-time lash extension clients',
            'Professional/office environments'
          ]
        },
        {
          id: '2',
          title: 'Volume Lashes',
          description: 'Multiple ultra-fine extensions (2-6) applied to one natural lash. Creates a fuller, more dramatic look.',
          bestFor: [
            'Clients with sparse natural lashes',
            'Those wanting maximum fullness',
            'Special occasions and events',
            'Creating a glamorous, bold look'
          ]
        },
        {
          id: '3',
          title: 'Hybrid Lashes',
          description: 'A combination of classic and volume techniques. Offers texture and fullness with a natural feel.',
          bestFor: [
            'Clients wanting the best of both worlds',
            'Those seeking a textured, wispy look',
            'Bridging natural to dramatic',
            'Versatile everyday to evening wear'
          ]
        },
        {
          id: '4',
          title: 'Mega Volume Lashes',
          description: 'The fullest look possible. Multiple ultra-lightweight extensions (8-16) create maximum density and drama.',
          bestFor: [
            'Maximum impact and drama',
            'Very sparse natural lashes',
            'Special events and photoshoots',
            'Bold, statement-making looks'
          ]
        }
      ],
      curls: [
        {
          id: '1',
          title: 'J Curl',
          type: 'Most Natural',
          description: 'Slight lift. Perfect for those with naturally upturned lashes seeking subtle enhancement.'
        },
        {
          id: '2',
          title: 'B Curl',
          type: 'Natural',
          description: 'Gentle curve. Ideal for clients with straight natural lashes wanting a natural look.'
        },
        {
          id: '3',
          title: 'C Curl',
          type: 'Most Popular',
          description: 'Medium curl. Our most requested curl, creates an open, wide-eyed appearance.'
        },
        {
          id: '4',
          title: 'D Curl',
          type: 'Most Dramatic',
          description: 'Maximum curl. Creates dramatic lift and is perfect for hooded or deep-set eyes.'
        }
      ],
      cta: {
        title: 'Still Not Sure What\'s Right For You?',
        description: 'Book a free consultation with one of our expert lash technicians. We\'ll help you choose the perfect length, volume, and curl for your unique eyes.',
        primaryButtonText: 'Book Free Consultation',
        primaryButtonLink: '/book',
        secondaryButtonText: 'Contact Us',
        secondaryButtonLink: '/contact'
      }
    },
    membership: {
      title: 'RENFAYE Memberships',
      subtitle: 'Join our exclusive membership program and enjoy premium lash services, special discounts, and rewards that keep you looking fabulous all year round.',
      benefits: [
        {
          id: '1',
          title: '10% Off Retail',
          description: 'Enjoy exclusive discounts on all retail products'
        },
        {
          id: '2',
          title: 'Free Full Set',
          description: 'Earn a complimentary full set after 20 bookings'
        },
        {
          id: '3',
          title: 'Points Program',
          description: '5% point accumulation on every visit'
        },
        {
          id: '4',
          title: 'Priority Booking',
          description: 'Get priority access to appointments'
        }
      ],
      tiers: [
        {
          id: 'natural',
          name: 'Renfaye Natural',
          price: 100,
          popular: false,
          features: [
            'Classic wet set',
            'YY lashes',
            '2 refills per month or 1 full-set',
            '10% off all retail products',
            '5% point accumulation program',
            'Full set after 20 bookings'
          ],
          benefits: {
            productDiscount: 10,
            serviceDiscount: 0,
            pointsRate: 5,
            freeRefillsPerMonth: 2,
            freeFullSetsPerMonth: 0,
            includedServiceIds: []
          }
        },
        {
          id: 'hybrid',
          name: 'Renfaye Hybrid',
          price: 120,
          popular: false,
          features: [
            'Classic wet set',
            'YY lashes mixed with 10D volume',
            '2 refills per month or 1 full-set',
            '10% off all retail products',
            '5% point accumulation program',
            'Full set after 20 bookings'
          ],
          benefits: {
            productDiscount: 10,
            serviceDiscount: 0,
            pointsRate: 5,
            freeRefillsPerMonth: 2,
            freeFullSetsPerMonth: 0,
            includedServiceIds: []
          }
        },
        {
          id: 'volume',
          name: 'Renfaye Volume',
          price: 140,
          popular: true,
          features: [
            '10D handmade fans',
            '10D pre-made fans',
            '2 refills per month or 1 full-set',
            '10% off all retail products',
            '5% point accumulation program',
            'Full set after 20 bookings'
          ],
          benefits: {
            productDiscount: 10,
            serviceDiscount: 0,
            pointsRate: 5,
            freeRefillsPerMonth: 2,
            freeFullSetsPerMonth: 0,
            includedServiceIds: []
          }
        },
        {
          id: 'mega',
          name: 'Renfaye Mega',
          price: 165,
          popular: false,
          features: [
            '20D handmade fans',
            '20D pre-made fans',
            '2 refills per month or 1 full-set',
            '10% off all retail products',
            '5% point accumulation program',
            'Full set after 20 bookings'
          ],
          benefits: {
            productDiscount: 10,
            serviceDiscount: 0,
            pointsRate: 5,
            freeRefillsPerMonth: 2,
            freeFullSetsPerMonth: 0,
            includedServiceIds: []
          }
        }
      ],
      cta: {
        title: 'Ready to Join the RENFAYE Family?',
        description: 'Contact us today to learn more about our membership options and start your journey to beautiful lashes.',
        primaryButtonText: 'Contact Us',
        primaryButtonLink: '/contact',
        secondaryButtonText: 'View Services',
        secondaryButtonLink: '/services'
      }
    }
  };
}

// Schedule Settings
export async function getScheduleSettings(): Promise<ScheduleSettings> {
  return readData('schedule.json', getDefaultSchedule());
}

export async function saveScheduleSettings(schedule: ScheduleSettings): Promise<void> {
  return writeData('schedule.json', schedule);
}

// Admin Credentials
function getDefaultAdmin(): AdminCredentials {
  return {
    id: '1',
    email: process.env.ADMIN_EMAIL || 'admin@renfayelashes.com',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10),
    name: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function getAdminCredentials(): Promise<AdminCredentials> {
  return readData('admin.json', getDefaultAdmin());
}

export async function saveAdminCredentials(admin: AdminCredentials): Promise<void> {
  return writeData('admin.json', admin);
}

export async function updateAdminEmail(newEmail: string): Promise<AdminCredentials> {
  const admin = await getAdminCredentials();
  admin.email = newEmail;
  admin.updatedAt = new Date().toISOString();
  await saveAdminCredentials(admin);
  return admin;
}

export async function updateAdminPassword(newPassword: string): Promise<AdminCredentials> {
  const admin = await getAdminCredentials();
  admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  admin.updatedAt = new Date().toISOString();
  await saveAdminCredentials(admin);
  return admin;
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const admin = await getAdminCredentials();
  return admin.email === email && bcrypt.compareSync(password, admin.passwordHash);
}

// User Management
export async function getUsers(): Promise<User[]> {
  return readData('users.json', []);
}

export async function saveUsers(users: User[]): Promise<void> {
  return writeData('users.json', users);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const users = await getUsers();
  
  // Check if email already exists
  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): Promise<User> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    throw new Error('User not found');
  }

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveUsers(users);
  return users[index];
}

export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const users = await getUsers();
  const user = users.find(u => u.id === id);
  
  if (!user) {
    throw new Error('User not found');
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  user.updatedAt = new Date().toISOString();
  
  await saveUsers(users);
}

export async function verifyUserPassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  return isValid ? user : null;
}

// Password Reset Tokens
export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export async function getResetTokens(): Promise<PasswordResetToken[]> {
  return readData('reset-tokens.json', []);
}

export async function saveResetTokens(tokens: PasswordResetToken[]): Promise<void> {
  return writeData('reset-tokens.json', tokens);
}

export async function createResetToken(email: string): Promise<PasswordResetToken | null> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const tokens = await getResetTokens();
  
  // Generate secure random token
  const token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  
  const resetToken: PasswordResetToken = {
    token,
    userId: user.id,
    email: user.email,
    expiresAt,
    createdAt: new Date().toISOString(),
    used: false
  };
  
  tokens.push(resetToken);
  await saveResetTokens(tokens);
  
  return resetToken;
}

export async function getResetToken(token: string): Promise<PasswordResetToken | null> {
  const tokens = await getResetTokens();
  return tokens.find(t => t.token === token) || null;
}

export async function validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const resetToken = await getResetToken(token);
  
  if (!resetToken) {
    return { valid: false, error: 'Invalid reset token' };
  }
  
  if (resetToken.used) {
    return { valid: false, error: 'Reset token already used' };
  }
  
  if (new Date(resetToken.expiresAt) < new Date()) {
    return { valid: false, error: 'Reset token expired' };
  }
  
  return { valid: true, userId: resetToken.userId };
}

export async function markResetTokenAsUsed(token: string): Promise<void> {
  const tokens = await getResetTokens();
  const resetToken = tokens.find(t => t.token === token);
  
  if (resetToken) {
    resetToken.used = true;
    await saveResetTokens(tokens);
  }
}

export async function cleanExpiredResetTokens(): Promise<void> {
  const tokens = await getResetTokens();
  const now = new Date();
  
  // Remove tokens older than 24 hours
  const validTokens = tokens.filter(t => {
    const expiresAt = new Date(t.expiresAt);
    const hoursOld = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60);
    return hoursOld < 24;
  });
  
  await saveResetTokens(validTokens);
}

// Admin Password Reset Tokens
export async function getAdminResetTokens(): Promise<PasswordResetToken[]> {
  return readData('admin-reset-tokens.json', []);
}

export async function saveAdminResetTokens(tokens: PasswordResetToken[]): Promise<void> {
  return writeData('admin-reset-tokens.json', tokens);
}

export async function createAdminResetToken(): Promise<PasswordResetToken> {
  const admin = await getAdminCredentials();
  const tokens = await getAdminResetTokens();
  
  // Generate secure random token
  const token = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  
  const resetToken: PasswordResetToken = {
    token,
    userId: admin.id,
    email: admin.email,
    expiresAt,
    createdAt: new Date().toISOString(),
    used: false
  };
  
  tokens.push(resetToken);
  await saveAdminResetTokens(tokens);
  
  return resetToken;
}

export async function getAdminResetToken(token: string): Promise<PasswordResetToken | null> {
  const tokens = await getAdminResetTokens();
  return tokens.find(t => t.token === token) || null;
}

export async function validateAdminResetToken(token: string): Promise<{ valid: boolean; error?: string }> {
  const resetToken = await getAdminResetToken(token);
  
  if (!resetToken) {
    return { valid: false, error: 'Invalid reset token' };
  }
  
  if (resetToken.used) {
    return { valid: false, error: 'Reset token already used' };
  }
  
  if (new Date(resetToken.expiresAt) < new Date()) {
    return { valid: false, error: 'Reset token expired' };
  }
  
  return { valid: true };
}

export async function markAdminResetTokenAsUsed(token: string): Promise<void> {
  const tokens = await getAdminResetTokens();
  const resetToken = tokens.find(t => t.token === token);
  
  if (resetToken) {
    resetToken.used = true;
    await saveAdminResetTokens(tokens);
  }
}

export async function cleanExpiredAdminResetTokens(): Promise<void> {
  const tokens = await getAdminResetTokens();
  const now = new Date();
  
  // Remove tokens older than 24 hours
  const validTokens = tokens.filter(t => {
    const expiresAt = new Date(t.expiresAt);
    const hoursOld = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60);
    return hoursOld < 24;
  });
  
  await saveAdminResetTokens(validTokens);
}

function getDefaultSchedule(): ScheduleSettings {
  const defaultDaySchedule: DaySchedule = {
    enabled: false,
    timeSlots: [],
    maxAppointmentsPerSlot: 1
  };

  const workingDaySchedule: DaySchedule = {
    enabled: true,
    timeSlots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ],
    maxAppointmentsPerSlot: 1
  };

  return {
    monday: { ...workingDaySchedule },
    tuesday: { ...workingDaySchedule },
    wednesday: { ...workingDaySchedule },
    thursday: { ...workingDaySchedule },
    friday: { ...workingDaySchedule },
    saturday: { ...defaultDaySchedule },
    sunday: { ...defaultDaySchedule },
    slotDuration: 60,
    breakBetweenSlots: 15,
    advanceBookingDays: 30,
    bookingBuffer: 24
  };
}

// Appointments
export async function getAppointments(): Promise<Appointment[]> {
  return readData('appointments.json', []);
}

export async function saveAppointments(appointments: Appointment[]): Promise<void> {
  return writeData('appointments.json', appointments);
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const appointments = await getAppointments();
  return appointments.find(a => a.id === id) || null;
}

// Store Settings
export async function getStoreSettings(): Promise<StoreSettings> {
  const defaultSettings: StoreSettings = {
    shippingCost: 15,
    taxRate: 0,
    currency: 'USD',
    storeName: 'RENFAYE LASHES',
    storeEmail: 'info@renfayelashes.com',
    storePhone: '(555) 123-4567',
    storeAddress: '123 Beauty Lane, Suite 100, New York, NY 10001'
  };
  return readData('settings.json', defaultSettings);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  return writeData('settings.json', settings);
}

// Pages
export async function getPages(): Promise<PageContent[]> {
  const defaultPages: PageContent[] = [
    {
      id: '1',
      title: 'About Us',
      slug: 'about',
      content: `<h1>About RENFAYE LASHES</h1>
<p>Welcome to RENFAYE LASHES, where beauty meets excellence. With over 8 years of experience in the beauty industry, we've perfected the art of eyelash extensions.</p>

<h2>Our Mission</h2>
<p>To enhance your natural beauty with premium eyelash extensions that make you feel confident and glamorous every day.</p>

<h2>Our Values</h2>
<ul>
  <li>Quality: We use only the finest materials</li>
  <li>Excellence: Our technicians are highly trained</li>
  <li>Customer First: Your satisfaction is our priority</li>
</ul>`,
      metaTitle: 'About Us | RENFAYE LASHES',
      metaDescription: 'Learn about RENFAYE LASHES and our commitment to beauty excellence.',
      lastModified: new Date().toISOString(),
      status: 'published'
    },
    {
      id: '2',
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `<h1>Privacy Policy</h1>
<p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>`,
      metaTitle: 'Privacy Policy | RENFAYE LASHES',
      metaDescription: 'Privacy policy for RENFAYE LASHES website.',
      lastModified: new Date().toISOString(),
      status: 'published'
    },
    {
      id: '3',
      title: 'Terms of Service',
      slug: 'terms',
      content: `<h1>Terms of Service</h1>
<p>By using our website and services, you agree to these terms and conditions.</p>`,
      metaTitle: 'Terms of Service | RENFAYE LASHES',
      metaDescription: 'Terms of service for RENFAYE LASHES.',
      lastModified: new Date().toISOString(),
      status: 'published'
    }
  ];
  
  return readData('pages.json', defaultPages);
}

export async function savePages(pages: PageContent[]): Promise<void> {
  return writeData('pages.json', pages);
}
