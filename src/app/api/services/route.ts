import { NextRequest, NextResponse } from 'next/server';
import { getServices, saveServices } from '@/lib/db';

export async function GET() {
  try {
    const services = await getServices();
    
    // Migrate old string prices to numbers
    const migratedServices = services.map(service => {
      const price = service.price as any;
      if (typeof price === 'string') {
        // Extract first number from string like "$120-150" or "$120"
        const match = price.match(/[\d.]+/);
        return {
          ...service,
          price: match ? parseFloat(match[0]) : 0
        };
      }
      return service;
    });
    
    // Save migrated data if any changes were made
    const needsMigration = services.some(s => typeof (s.price as any) === 'string');
    if (needsMigration) {
      await saveServices(migratedServices);
    }
    
    return NextResponse.json(migratedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const service = await request.json();
    const services = await getServices();
    
    // Ensure price is a number
    const normalizedService = {
      ...service,
      price: typeof service.price === 'string' ? parseFloat(service.price) || 0 : service.price
    };
    
    const index = services.findIndex(s => s.id === normalizedService.id);
    if (index >= 0) {
      services[index] = { ...normalizedService, updatedAt: new Date().toISOString() };
    } else {
      services.push({ 
        ...normalizedService, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      });
    }
    
    await saveServices(services);
    return NextResponse.json({ success: true, service: normalizedService });
  } catch (error) {
    console.error('Error saving service:', error);
    return NextResponse.json({ error: 'Failed to save service' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }
    
    const services = await getServices();
    const filtered = services.filter(s => s.id !== id);
    await saveServices(filtered);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
