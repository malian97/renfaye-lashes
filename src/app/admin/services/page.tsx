'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, Service } from '@/lib/content-manager';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiClock, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminServices() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const allServices = await contentManager.getServices();
    setServices(allServices);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await contentManager.deleteService(id);
        await loadServices();
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-2">Manage your service offerings</p>
          </div>
          <Link
            href="/admin/services/new"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Service
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {service.popular && (
                <div className="bg-orange-500 text-white text-xs font-medium px-3 py-1 text-center">
                  Most Popular
                </div>
              )}
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <FiClock className="w-4 h-4 mr-1" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center text-pink-600 font-semibold">
                    <FiDollarSign className="w-4 h-4" />
                    <span>{typeof service.price === 'number' ? service.price.toFixed(2) : service.price}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Features:</p>
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600">• {feature}</li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-xs text-gray-500 italic">+{service.features.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/services/${service.id}`}
                    className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center"
                  >
                    <FiEdit2 className="mr-2 w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500">No services found. Create your first service to get started!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
