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
  features?: string[];
  specifications?: Record<string, string>;
  careInstructions?: string[];
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
  shippingCost?: number;
  taxAmount?: number;
  taxRate?: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
  maxAppointmentsPerSlot: number;
}

export interface ScheduleSettings {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  slotDuration: number; // in minutes
  breakBetweenSlots: number; // in minutes
  advanceBookingDays: number; // how many days in advance can clients book
  bookingBuffer: number; // minimum hours before appointment can be booked
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  originalPrice?: number;
  pointsRedeemed?: number;
  pointsDiscount?: number;
  pointsToEarn?: number;
  userId?: string;
  technicianId?: string;
  technicianName?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentIntentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  shippingCost: number;
  taxRate: number;
  currency: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  socialMedia?: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  lastModified: string;
  status: 'published' | 'draft';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  features: string[];
  popular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    slideshowImages: string[];
  };
  about: {
    title: string;
    description: string;
    stats: Array<{
      number: string;
      label: string;
      description: string;
    }>;
    values: Array<{
      title: string;
      description: string;
    }>;
    team: Array<{
      id: string;
      name: string;
      role: string;
      image: string;
      bio: string;
      certifications: string[];
      isTechnician?: boolean;
    }>;
    cta: {
      title: string;
      description: string;
      primaryButtonText: string;
      primaryButtonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
    };
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
  policy: {
    title: string;
    subtitle: string;
    sections: Array<{
      title: string;
      content: Array<{
        subtitle: string;
        text: string;
      }>;
    }>;
  };
  contact: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  sizeGuide: {
    title: string;
    subtitle: string;
    lengths: Array<{
      id: string;
      title: string;
      range: string;
      description: string;
      features: string[];
    }>;
    volumes: Array<{
      id: string;
      title: string;
      description: string;
      bestFor: string[];
    }>;
    curls: Array<{
      id: string;
      title: string;
      type: string;
      description: string;
    }>;
    cta: {
      title: string;
      description: string;
      primaryButtonText: string;
      primaryButtonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
    };
  };
  membership: {
    title: string;
    subtitle: string;
    benefits: Array<{
      id: string;
      title: string;
      description: string;
    }>;
    tiers: Array<{
      id: string;
      name: string;
      price: number;
      popular: boolean;
      features: string[];
      benefits: {
        productDiscount: number;
        serviceDiscount: number;
        pointsRate: number;
        freeRefillsPerMonth: number;
        freeFullSetsPerMonth: number;
        includedServiceIds: string[];
      };
    }>;
    cta: {
      title: string;
      description: string;
      primaryButtonText: string;
      primaryButtonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
    };
  };
}

class ContentManager {
  private readonly CONTENT_KEY = 'renfaye_content';

  // Products Management
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async saveProduct(product: Product): Promise<void> {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to save product');
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Orders Management
  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  async saveOrder(order: Order): Promise<void> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (!response.ok) throw new Error('Failed to save order');
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!response.ok) throw new Error('Failed to update order status');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Services Management
  async getServices(): Promise<Service[]> {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async getService(id: string): Promise<Service | null> {
    const services = await this.getServices();
    return services.find(s => s.id === id) || null;
  }

  async saveService(service: Service): Promise<void> {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      if (!response.ok) throw new Error('Failed to save service');
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete service');
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Contact Submissions Management
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const response = await fetch('/api/contact-submissions');
      if (!response.ok) throw new Error('Failed to fetch contact submissions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return [];
    }
  }

  async saveContactSubmission(submission: ContactSubmission): Promise<void> {
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      if (!response.ok) throw new Error('Failed to save contact submission');
    } catch (error) {
      console.error('Error saving contact submission:', error);
      throw error;
    }
  }

  async updateContactSubmissionStatus(id: string, status: ContactSubmission['status']): Promise<void> {
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!response.ok) throw new Error('Failed to update submission status');
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  }

  async deleteContactSubmission(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/contact-submissions?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete submission');
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }

  // Schedule Management
  async getScheduleSettings(): Promise<ScheduleSettings> {
    try {
      const response = await fetch('/api/schedule');
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return this.getDefaultSchedule();
    }
  }

  async saveScheduleSettings(schedule: ScheduleSettings): Promise<void> {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      });
      if (!response.ok) throw new Error('Failed to save schedule');
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  private getDefaultSchedule(): ScheduleSettings {
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

  // Appointment Management
  async getAvailableSlots(date: string, serviceId: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/appointments/available-slots?date=${date}&serviceId=${serviceId}`);
      if (!response.ok) throw new Error('Failed to fetch available slots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async createCheckoutSession(appointmentId: string): Promise<{ sessionId: string; url: string }> {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });
      if (!response.ok) throw new Error('Failed to create checkout session');
      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Site Content Management
  async getSiteContent(): Promise<SiteContent> {
    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return await response.json();
    } catch (error) {
      console.error('Error fetching site content:', error);
      return this.getDefaultContent();
    }
  }

  async saveSiteContent(content: SiteContent): Promise<void> {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (!response.ok) throw new Error('Failed to save content');
    } catch (error) {
      console.error('Error saving site content:', error);
      throw error;
    }
  }

  // Default Content
  private getDefaultContent(): SiteContent {
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
          { id: '1', title: '10% Off Retail', description: 'Enjoy exclusive discounts on all retail products' },
          { id: '2', title: 'Free Full Set', description: 'Earn a complimentary full set after 20 bookings' },
          { id: '3', title: 'Points Program', description: '5% point accumulation on every visit' },
          { id: '4', title: 'Priority Booking', description: 'Get priority access to appointments' }
        ],
        tiers: [
          {
            id: 'natural',
            name: 'Renfaye Natural',
            price: 100,
            popular: false,
            features: ['Classic wet set', 'YY lashes', '2 refills per month or 1 full-set', '10% off all retail products', '5% point accumulation program', 'Full set after 20 bookings'],
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
            features: ['Classic wet set', 'YY lashes mixed with 10D volume', '2 refills per month or 1 full-set', '10% off all retail products', '5% point accumulation program', 'Full set after 20 bookings'],
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
            features: ['10D handmade fans', '10D pre-made fans', '2 refills per month or 1 full-set', '10% off all retail products', '5% point accumulation program', 'Full set after 20 bookings'],
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
            features: ['20D handmade fans', '20D pre-made fans', '2 refills per month or 1 full-set', '10% off all retail products', '5% point accumulation program', 'Full set after 20 bookings'],
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

  async getStoreSettings(): Promise<StoreSettings> {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  }

  async saveStoreSettings(settings: StoreSettings): Promise<void> {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to save settings');
  }

  getDefaultStoreSettings(): StoreSettings {
    return {
      shippingCost: 15,
      taxRate: 0,
      currency: 'USD',
      storeName: 'RENFAYE LASHES',
      storeEmail: 'info@renfayelashes.com',
      storePhone: '(555) 123-4567',
      storeAddress: '123 Beauty Lane, Suite 100, New York, NY 10001'
    };
  }
}

export const contentManager = new ContentManager();
