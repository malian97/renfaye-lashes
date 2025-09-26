'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { contentManager, SiteContent } from '@/lib/content-manager';
import { FiSave, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminContent() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(contentManager.getSiteContent());
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'testimonials' | 'services'>('hero');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  const handleSave = () => {
    contentManager.saveSiteContent(content);
    setHasChanges(false);
    toast.success('Content saved successfully');
  };

  const updateContent = (section: keyof SiteContent, data: any) => {
    setContent(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now().toString(),
      name: 'New Customer',
      location: 'City, State',
      rating: 5,
      text: 'Amazing experience!',
      image: 'https://picsum.photos/150/150?random=' + Date.now(),
      service: 'Classic Lashes'
    };
    updateContent('testimonials', [...content.testimonials, newTestimonial]);
  };

  const removeTestimonial = (id: string) => {
    updateContent('testimonials', content.testimonials.filter(t => t.id !== id));
  };

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      name: 'New Service',
      description: 'Service description',
      price: '$100',
      duration: '60 min',
      image: 'https://picsum.photos/400/300?random=' + Date.now(),
      popular: false
    };
    updateContent('services', [...content.services, newService]);
  };

  const removeService = (id: string) => {
    updateContent('services', content.services.filter(s => s.id !== id));
  };

  const addStat = () => {
    const newStat = {
      number: '0',
      label: 'New Stat',
      description: 'Description'
    };
    updateContent('about', {
      ...content.about,
      stats: [...content.about.stats, newStat]
    });
  };

  const removeStat = (index: number) => {
    updateContent('about', {
      ...content.about,
      stats: content.about.stats.filter((_, i) => i !== index)
    });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Edit your website content</p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <FiSave className="mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['hero', 'about', 'testimonials', 'services'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Hero Section */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => updateContent('hero', { ...content.hero, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <textarea
                    value={content.hero.subtitle}
                    onChange={(e) => updateContent('hero', { ...content.hero, subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.ctaText}
                      onChange={(e) => updateContent('hero', { ...content.hero, ctaText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CTA Button Link
                    </label>
                    <input
                      type="text"
                      value={content.hero.ctaLink}
                      onChange={(e) => updateContent('hero', { ...content.hero, ctaLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                <ImageUpload
                  value={content.hero.backgroundImage}
                  onChange={(url) => updateContent('hero', { ...content.hero, backgroundImage: url })}
                  label="Background Image"
                />
              </div>
            )}

            {/* About Section */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">About Section</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={content.about.title}
                    onChange={(e) => updateContent('about', { ...content.about, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={content.about.description}
                    onChange={(e) => updateContent('about', { ...content.about, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Statistics</h3>
                    <button
                      onClick={addStat}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add Stat
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.about.stats.map((stat, index) => (
                      <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={stat.number}
                            onChange={(e) => {
                              const newStats = [...content.about.stats];
                              newStats[index].number = e.target.value;
                              updateContent('about', { ...content.about, stats: newStats });
                            }}
                            placeholder="Number"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...content.about.stats];
                              newStats[index].label = e.target.value;
                              updateContent('about', { ...content.about, stats: newStats });
                            }}
                            placeholder="Label"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={stat.description}
                            onChange={(e) => {
                              const newStats = [...content.about.stats];
                              newStats[index].description = e.target.value;
                              updateContent('about', { ...content.about, stats: newStats });
                            }}
                            placeholder="Description"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <button
                          onClick={() => removeStat(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Testimonials Section */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Testimonials</h2>
                  <button
                    onClick={addTestimonial}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Testimonial
                  </button>
                </div>

                <div className="space-y-4">
                  {content.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => {
                            const updated = content.testimonials.map(t =>
                              t.id === testimonial.id ? { ...t, name: e.target.value } : t
                            );
                            updateContent('testimonials', updated);
                          }}
                          placeholder="Customer Name"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <input
                          type="text"
                          value={testimonial.location}
                          onChange={(e) => {
                            const updated = content.testimonials.map(t =>
                              t.id === testimonial.id ? { ...t, location: e.target.value } : t
                            );
                            updateContent('testimonials', updated);
                          }}
                          placeholder="Location"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={testimonial.service}
                          onChange={(e) => {
                            const updated = content.testimonials.map(t =>
                              t.id === testimonial.id ? { ...t, service: e.target.value } : t
                            );
                            updateContent('testimonials', updated);
                          }}
                          placeholder="Service"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <select
                          value={testimonial.rating}
                          onChange={(e) => {
                            const updated = content.testimonials.map(t =>
                              t.id === testimonial.id ? { ...t, rating: Number(e.target.value) } : t
                            );
                            updateContent('testimonials', updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        >
                          {[5, 4, 3, 2, 1].map(n => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        value={testimonial.text}
                        onChange={(e) => {
                          const updated = content.testimonials.map(t =>
                            t.id === testimonial.id ? { ...t, text: e.target.value } : t
                          );
                          updateContent('testimonials', updated);
                        }}
                        placeholder="Testimonial text"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 mb-4"
                      />

                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={testimonial.image}
                          onChange={(e) => {
                            const updated = content.testimonials.map(t =>
                              t.id === testimonial.id ? { ...t, image: e.target.value } : t
                            );
                            updateContent('testimonials', updated);
                          }}
                          placeholder="Image URL"
                          className="flex-1 mr-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button
                          onClick={() => removeTestimonial(testimonial.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Section */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Services</h2>
                  <button
                    onClick={addService}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Service
                  </button>
                </div>

                <div className="space-y-4">
                  {content.services.map((service) => (
                    <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const updated = content.services.map(s =>
                              s.id === service.id ? { ...s, name: e.target.value } : s
                            );
                            updateContent('services', updated);
                          }}
                          placeholder="Service Name"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={service.price}
                            onChange={(e) => {
                              const updated = content.services.map(s =>
                                s.id === service.id ? { ...s, price: e.target.value } : s
                              );
                              updateContent('services', updated);
                            }}
                            placeholder="Price"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={service.duration}
                            onChange={(e) => {
                              const updated = content.services.map(s =>
                                s.id === service.id ? { ...s, duration: e.target.value } : s
                              );
                              updateContent('services', updated);
                            }}
                            placeholder="Duration"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <textarea
                        value={service.description}
                        onChange={(e) => {
                          const updated = content.services.map(s =>
                            s.id === service.id ? { ...s, description: e.target.value } : s
                          );
                          updateContent('services', updated);
                        }}
                        placeholder="Service description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 mb-4"
                      />

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={service.image}
                            onChange={(e) => {
                              const updated = content.services.map(s =>
                                s.id === service.id ? { ...s, image: e.target.value } : s
                              );
                              updateContent('services', updated);
                            }}
                            placeholder="Image URL"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={service.popular}
                              onChange={(e) => {
                                const updated = content.services.map(s =>
                                  s.id === service.id ? { ...s, popular: e.target.checked } : s
                                );
                                updateContent('services', updated);
                              }}
                              className="mr-2"
                            />
                            Popular
                          </label>
                        </div>
                        <button
                          onClick={() => removeService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
