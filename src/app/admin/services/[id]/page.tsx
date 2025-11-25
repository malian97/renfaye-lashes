'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, Service } from '@/lib/content-manager';
import { FiSave, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

export default function EditService() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const isNew = serviceId === 'new';

  const [formData, setFormData] = useState<Service>({
    id: '',
    name: '',
    description: '',
    duration: '',
    price: 0,
    image: '',
    features: [''],
    popular: false,
    createdAt: '',
    updatedAt: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const loadService = async () => {
      if (!isNew && serviceId) {
        const service = await contentManager.getService(serviceId);
        if (service) {
          // Ensure price is a number during load
          setFormData({
            ...service,
            price: typeof service.price === 'string' ? parseFloat(service.price) || 0 : service.price
          });
        } else {
          toast.error('Service not found');
          router.push('/admin/services');
        }
      } else if (isNew) {
        setFormData(prev => ({
          ...prev,
          id: Date.now().toString()
        }));
      }
    };
    
    loadService();
  }, [isNew, serviceId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate
      if (!formData.name || !formData.description || !formData.price || !formData.duration) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.image) {
        toast.error('Please upload a service image');
        return;
      }

      // Filter out empty features
      const cleanedFeatures = formData.features.filter(f => f.trim() !== '');
      
      if (cleanedFeatures.length === 0) {
        toast.error('Please add at least one feature');
        return;
      }

      const serviceToSave = {
        ...formData,
        features: cleanedFeatures
      };

      await contentManager.saveService(serviceToSave);
      toast.success(`Service ${isNew ? 'created' : 'updated'} successfully`);
      router.push('/admin/services');
    } catch (error) {
      toast.error('Failed to save service');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/services"
            className="text-pink-600 hover:text-pink-700 flex items-center mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Services
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Add New Service' : 'Edit Service'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2-2.5 hours"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price * (in dollars)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 150"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <div>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Service Image *"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="popular"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="popular" className="ml-2 text-sm text-gray-700">
                Mark as Most Popular
              </label>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Features *
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="text-pink-600 hover:text-pink-700 flex items-center text-sm"
              >
                <FiPlus className="mr-1" />
                Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <FiSave className="mr-2" />
              {isSaving ? 'Saving...' : isNew ? 'Create Service' : 'Save Changes'}
            </button>
            <Link
              href="/admin/services"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
