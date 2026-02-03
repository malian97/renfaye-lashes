'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { contentManager, SiteContent } from '@/lib/content-manager';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminContent() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'testimonials' | 'policy' | 'contact' | 'sizeGuide' | 'membership'>('hero');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const loadContent = async () => {
      const siteContent = await contentManager.getSiteContent();
      setContent(siteContent);
    };
    loadContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;
    try {
      await contentManager.saveSiteContent(content);
      setHasChanges(false);
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const updateContent = (section: keyof SiteContent, data: unknown) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: data
    });
    setHasChanges(true);
  };

  const addTestimonial = () => {
    if (!content) return;
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
    if (!content) return;
    updateContent('testimonials', content.testimonials.filter(t => t.id !== id));
  };

  const addStat = () => {
    if (!content) return;
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
    if (!content) return;
    updateContent('about', {
      ...content.about,
      stats: content.about.stats.filter((_, i) => i !== index)
    });
  };

  if (isLoading || !content) {
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
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {['hero', 'about', 'testimonials', 'policy', 'contact', 'sizeGuide', 'membership'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'sizeGuide' ? 'Size Guide' : tab}
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
                  label="Background Image (Fallback)"
                />

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Slideshow Images</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add multiple images for the hero slideshow. Images will automatically transition.
                  </p>
                  
                  {content.hero.slideshowImages && content.hero.slideshowImages.map((image, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Image {index + 1}
                        </label>
                        <button
                          onClick={() => {
                            const newImages = content.hero.slideshowImages.filter((_, i) => i !== index);
                            updateContent('hero', { ...content.hero, slideshowImages: newImages });
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <ImageUpload
                        value={image}
                        onChange={(url) => {
                          const newImages = [...content.hero.slideshowImages];
                          newImages[index] = url;
                          updateContent('hero', { ...content.hero, slideshowImages: newImages });
                        }}
                        label=""
                      />
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const currentImages = content.hero.slideshowImages || [];
                      const newImages = [...currentImages, 'https://picsum.photos/1920/1080?random=' + Date.now()];
                      updateContent('hero', { ...content.hero, slideshowImages: newImages });
                    }}
                    className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    + Add Slideshow Image
                  </button>
                  
                  {content.hero.slideshowImages && content.hero.slideshowImages.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Total images: {content.hero.slideshowImages.filter((img: string) => img && img.trim() !== '').length}
                    </p>
                  )}
                </div>
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

                {/* Values Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Our Values</h3>
                    <button
                      onClick={() => {
                        const currentValues = content.about.values || [];
                        const newValues = [...currentValues, { title: 'New Value', description: 'Description' }];
                        updateContent('about', { ...content.about, values: newValues });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add Value
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.about.values && content.about.values.map((value, index) => (
                      <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={value.title}
                            onChange={(e) => {
                              const newValues = [...content.about.values];
                              newValues[index].title = e.target.value;
                              updateContent('about', { ...content.about, values: newValues });
                            }}
                            placeholder="Value Title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <textarea
                            value={value.description}
                            onChange={(e) => {
                              const newValues = [...content.about.values];
                              newValues[index].description = e.target.value;
                              updateContent('about', { ...content.about, values: newValues });
                            }}
                            placeholder="Description"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newValues = content.about.values.filter((_, i) => i !== index);
                            updateContent('about', { ...content.about, values: newValues });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <button
                      onClick={() => {
                        const newMember = {
                          id: Date.now().toString(),
                          name: 'New Team Member',
                          role: 'Position',
                          image: 'https://picsum.photos/300/400?random=' + Date.now(),
                          bio: 'Bio description',
                          certifications: ['Certification 1']
                        };
                        const currentTeam = content.about.team || [];
                        updateContent('about', { ...content.about, team: [...currentTeam, newMember] });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add Team Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.about.team && content.about.team.map((member, index) => (
                      <div key={member.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              const newTeam = [...content.about.team];
                              newTeam[index].name = e.target.value;
                              updateContent('about', { ...content.about, team: newTeam });
                            }}
                            placeholder="Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => {
                              const newTeam = [...content.about.team];
                              newTeam[index].role = e.target.value;
                              updateContent('about', { ...content.about, team: newTeam });
                            }}
                            placeholder="Role"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <ImageUpload
                          value={member.image}
                          onChange={(url) => {
                            const newTeam = [...content.about.team];
                            newTeam[index].image = url;
                            updateContent('about', { ...content.about, team: newTeam });
                          }}
                          label="Team Member Photo"
                        />
                        <textarea
                          value={member.bio}
                          onChange={(e) => {
                            const newTeam = [...content.about.team];
                            newTeam[index].bio = e.target.value;
                            updateContent('about', { ...content.about, team: newTeam });
                          }}
                          placeholder="Bio"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certifications (one per line)
                          </label>
                          <textarea
                            value={member.certifications.join('\n')}
                            onChange={(e) => {
                              const newTeam = [...content.about.team];
                              newTeam[index].certifications = e.target.value.split('\n').filter(c => c.trim());
                              updateContent('about', { ...content.about, team: newTeam });
                            }}
                            placeholder="Certification 1&#10;Certification 2&#10;Certification 3"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newTeam = content.about.team.filter((_, i) => i !== index);
                            updateContent('about', { ...content.about, team: newTeam });
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" />
                          Remove Team Member
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Call-to-Action Section</h3>
                  {content.about.cta ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTA Title
                        </label>
                        <input
                          type="text"
                          value={content.about.cta.title}
                          onChange={(e) => updateContent('about', { 
                            ...content.about, 
                            cta: { ...content.about.cta, title: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTA Description
                        </label>
                        <textarea
                          value={content.about.cta.description}
                          onChange={(e) => updateContent('about', { 
                            ...content.about, 
                            cta: { ...content.about.cta, description: e.target.value }
                          })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Button Text
                          </label>
                          <input
                            type="text"
                            value={content.about.cta.primaryButtonText}
                            onChange={(e) => updateContent('about', { 
                              ...content.about, 
                              cta: { ...content.about.cta, primaryButtonText: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Button Link
                          </label>
                          <input
                            type="text"
                            value={content.about.cta.primaryButtonLink}
                            onChange={(e) => updateContent('about', { 
                              ...content.about, 
                              cta: { ...content.about.cta, primaryButtonLink: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Button Text
                          </label>
                          <input
                            type="text"
                            value={content.about.cta.secondaryButtonText}
                            onChange={(e) => updateContent('about', { 
                              ...content.about, 
                              cta: { ...content.about.cta, secondaryButtonText: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Button Link
                          </label>
                          <input
                            type="text"
                            value={content.about.cta.secondaryButtonLink}
                            onChange={(e) => updateContent('about', { 
                              ...content.about, 
                              cta: { ...content.about.cta, secondaryButtonLink: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">CTA section not initialized</p>
                      <button
                        onClick={() => updateContent('about', {
                          ...content.about,
                          cta: {
                            title: 'Experience the RENFAYE Difference',
                            description: 'Join thousands of satisfied clients.',
                            primaryButtonText: 'Book Now',
                            primaryButtonLink: '/book',
                            secondaryButtonText: 'Free Consultation',
                            secondaryButtonLink: '/contact'
                          }
                        })}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        Initialize CTA Section
                      </button>
                    </div>
                  )}
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

                      <ImageUpload
                        value={testimonial.image}
                        onChange={(url) => {
                          const updated = content.testimonials.map(t =>
                            t.id === testimonial.id ? { ...t, image: url } : t
                          );
                          updateContent('testimonials', updated);
                        }}
                        label="Customer Photo"
                      />

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => removeTestimonial(testimonial.id)}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" />
                          Remove Testimonial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Section */}
            {activeTab === 'policy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Policy Page Content</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={content.policy.title}
                    onChange={(e) => updateContent('policy', { ...content.policy, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Subtitle
                  </label>
                  <textarea
                    value={content.policy.subtitle}
                    onChange={(e) => updateContent('policy', { ...content.policy, subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Policy Sections</h3>
                  {content.policy.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...content.policy.sections];
                            newSections[sectionIndex].title = e.target.value;
                            updateContent('policy', { ...content.policy, sections: newSections });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Content Items
                        </label>
                        {section.content.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-white p-4 rounded-lg space-y-3">
                            <input
                              type="text"
                              value={item.subtitle}
                              onChange={(e) => {
                                const newSections = [...content.policy.sections];
                                newSections[sectionIndex].content[itemIndex].subtitle = e.target.value;
                                updateContent('policy', { ...content.policy, sections: newSections });
                              }}
                              placeholder="Subtitle"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                            <textarea
                              value={item.text}
                              onChange={(e) => {
                                const newSections = [...content.policy.sections];
                                newSections[sectionIndex].content[itemIndex].text = e.target.value;
                                updateContent('policy', { ...content.policy, sections: newSections });
                              }}
                              placeholder="Text content"
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                            <button
                              onClick={() => {
                                const newSections = [...content.policy.sections];
                                newSections[sectionIndex].content = newSections[sectionIndex].content.filter((_, i) => i !== itemIndex);
                                updateContent('policy', { ...content.policy, sections: newSections });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm flex items-center"
                            >
                              <FiTrash2 className="mr-1" />
                              Remove Item
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newSections = [...content.policy.sections];
                            newSections[sectionIndex].content.push({ subtitle: '', text: '' });
                            updateContent('policy', { ...content.policy, sections: newSections });
                          }}
                          className="text-pink-600 hover:text-pink-700 text-sm flex items-center"
                        >
                          <FiPlus className="mr-1" />
                          Add Content Item
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const newSections = content.policy.sections.filter((_, i) => i !== sectionIndex);
                          updateContent('policy', { ...content.policy, sections: newSections });
                        }}
                        className="text-red-600 hover:text-red-700 flex items-center"
                      >
                        <FiTrash2 className="mr-2" />
                        Remove Section
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newSections = [...content.policy.sections, { title: 'New Section', content: [{ subtitle: '', text: '' }] }];
                      updateContent('policy', { ...content.policy, sections: newSections });
                    }}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Policy Section
                  </button>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Contact Page Content</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={content.contact.title}
                    onChange={(e) => updateContent('contact', { ...content.contact, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Subtitle
                  </label>
                  <textarea
                    value={content.contact.subtitle}
                    onChange={(e) => updateContent('contact', { ...content.contact, subtitle: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={content.contact.phone}
                        onChange={(e) => updateContent('contact', { ...content.contact, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={content.contact.email}
                        onChange={(e) => updateContent('contact', { ...content.contact, email: e.target.value })}
                        placeholder="info@renfayelashes.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={content.contact.address}
                        onChange={(e) => updateContent('contact', { ...content.contact, address: e.target.value })}
                        placeholder="123 Beauty Lane, Suite 100, New York, NY 10001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Hours
                      </label>
                      <textarea
                        value={content.contact.hours}
                        onChange={(e) => updateContent('contact', { ...content.contact, hours: e.target.value })}
                        placeholder="Mon-Fri: 9:00 AM - 7:00 PM&#10;Sat: 10:00 AM - 6:00 PM&#10;Sun: Closed"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use line breaks to separate different days/hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The contact form functionality remains the same. The contact information you edit here will be displayed in the sidebar next to the contact form.
                  </p>
                </div>
              </div>
            )}

            {/* Size Guide Section */}
            {activeTab === 'sizeGuide' && content.sizeGuide && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold mb-4">Size Guide Content</h2>

                {/* Title & Subtitle */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                    <input
                      type="text"
                      value={content.sizeGuide.title}
                      onChange={(e) => updateContent('sizeGuide', { ...content.sizeGuide, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={content.sizeGuide.subtitle}
                      onChange={(e) => updateContent('sizeGuide', { ...content.sizeGuide, subtitle: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Lengths */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Lash Lengths</h3>
                    <button
                      onClick={() => {
                        const newLength = {
                          id: Date.now().toString(),
                          title: 'New Length',
                          range: '10-12mm',
                          description: 'Description',
                          features: ['Feature 1', 'Feature 2']
                        };
                        updateContent('sizeGuide', {
                          ...content.sizeGuide,
                          lengths: [...content.sizeGuide.lengths, newLength]
                        });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add Length
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.sizeGuide.lengths.map((length, index) => (
                      <div key={length.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={length.title}
                            onChange={(e) => {
                              const newLengths = [...content.sizeGuide.lengths];
                              newLengths[index].title = e.target.value;
                              updateContent('sizeGuide', { ...content.sizeGuide, lengths: newLengths });
                            }}
                            placeholder="Title (e.g., Natural)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={length.range}
                            onChange={(e) => {
                              const newLengths = [...content.sizeGuide.lengths];
                              newLengths[index].range = e.target.value;
                              updateContent('sizeGuide', { ...content.sizeGuide, lengths: newLengths });
                            }}
                            placeholder="Range (e.g., 8-10mm)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <textarea
                          value={length.description}
                          onChange={(e) => {
                            const newLengths = [...content.sizeGuide.lengths];
                            newLengths[index].description = e.target.value;
                            updateContent('sizeGuide', { ...content.sizeGuide, lengths: newLengths });
                          }}
                          placeholder="Description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                          <textarea
                            value={length.features.join('\n')}
                            onChange={(e) => {
                              const newLengths = [...content.sizeGuide.lengths];
                              newLengths[index].features = e.target.value.split('\n').filter(f => f.trim());
                              updateContent('sizeGuide', { ...content.sizeGuide, lengths: newLengths });
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newLengths = content.sizeGuide.lengths.filter((_, i) => i !== index);
                            updateContent('sizeGuide', { ...content.sizeGuide, lengths: newLengths });
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volumes */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Volume Types</h3>
                    <button
                      onClick={() => {
                        const newVolume = {
                          id: Date.now().toString(),
                          title: 'New Volume',
                          description: 'Description',
                          bestFor: ['Best for item 1', 'Best for item 2']
                        };
                        updateContent('sizeGuide', {
                          ...content.sizeGuide,
                          volumes: [...content.sizeGuide.volumes, newVolume]
                        });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add Volume
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.sizeGuide.volumes.map((volume, index) => (
                      <div key={volume.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={volume.title}
                          onChange={(e) => {
                            const newVolumes = [...content.sizeGuide.volumes];
                            newVolumes[index].title = e.target.value;
                            updateContent('sizeGuide', { ...content.sizeGuide, volumes: newVolumes });
                          }}
                          placeholder="Title (e.g., Classic Lashes)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <textarea
                          value={volume.description}
                          onChange={(e) => {
                            const newVolumes = [...content.sizeGuide.volumes];
                            newVolumes[index].description = e.target.value;
                            updateContent('sizeGuide', { ...content.sizeGuide, volumes: newVolumes });
                          }}
                          placeholder="Description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Best For (one per line)</label>
                          <textarea
                            value={volume.bestFor.join('\n')}
                            onChange={(e) => {
                              const newVolumes = [...content.sizeGuide.volumes];
                              newVolumes[index].bestFor = e.target.value.split('\n').filter(f => f.trim());
                              updateContent('sizeGuide', { ...content.sizeGuide, volumes: newVolumes });
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newVolumes = content.sizeGuide.volumes.filter((_, i) => i !== index);
                            updateContent('sizeGuide', { ...content.sizeGuide, volumes: newVolumes });
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curls */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Curl Types</h3>
                    <button
                      onClick={() => {
                        const newCurl = {
                          id: Date.now().toString(),
                          title: 'New Curl',
                          type: 'Type',
                          description: 'Description'
                        };
                        updateContent('sizeGuide', {
                          ...content.sizeGuide,
                          curls: [...content.sizeGuide.curls, newCurl]
                        });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add Curl
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.sizeGuide.curls.map((curl, index) => (
                      <div key={curl.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={curl.title}
                            onChange={(e) => {
                              const newCurls = [...content.sizeGuide.curls];
                              newCurls[index].title = e.target.value;
                              updateContent('sizeGuide', { ...content.sizeGuide, curls: newCurls });
                            }}
                            placeholder="Title (e.g., C Curl)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={curl.type}
                            onChange={(e) => {
                              const newCurls = [...content.sizeGuide.curls];
                              newCurls[index].type = e.target.value;
                              updateContent('sizeGuide', { ...content.sizeGuide, curls: newCurls });
                            }}
                            placeholder="Type (e.g., Most Popular)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <textarea
                          value={curl.description}
                          onChange={(e) => {
                            const newCurls = [...content.sizeGuide.curls];
                            newCurls[index].description = e.target.value;
                            updateContent('sizeGuide', { ...content.sizeGuide, curls: newCurls });
                          }}
                          placeholder="Description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button
                          onClick={() => {
                            const newCurls = content.sizeGuide.curls.filter((_, i) => i !== index);
                            updateContent('sizeGuide', { ...content.sizeGuide, curls: newCurls });
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Call-to-Action Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                      <input
                        type="text"
                        value={content.sizeGuide.cta.title}
                        onChange={(e) => updateContent('sizeGuide', {
                          ...content.sizeGuide,
                          cta: { ...content.sizeGuide.cta, title: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Description</label>
                      <textarea
                        value={content.sizeGuide.cta.description}
                        onChange={(e) => updateContent('sizeGuide', {
                          ...content.sizeGuide,
                          cta: { ...content.sizeGuide.cta, description: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                        <input
                          type="text"
                          value={content.sizeGuide.cta.primaryButtonText}
                          onChange={(e) => updateContent('sizeGuide', {
                            ...content.sizeGuide,
                            cta: { ...content.sizeGuide.cta, primaryButtonText: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Link</label>
                        <input
                          type="text"
                          value={content.sizeGuide.cta.primaryButtonLink}
                          onChange={(e) => updateContent('sizeGuide', {
                            ...content.sizeGuide,
                            cta: { ...content.sizeGuide.cta, primaryButtonLink: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                        <input
                          type="text"
                          value={content.sizeGuide.cta.secondaryButtonText}
                          onChange={(e) => updateContent('sizeGuide', {
                            ...content.sizeGuide,
                            cta: { ...content.sizeGuide.cta, secondaryButtonText: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Link</label>
                        <input
                          type="text"
                          value={content.sizeGuide.cta.secondaryButtonLink}
                          onChange={(e) => updateContent('sizeGuide', {
                            ...content.sizeGuide,
                            cta: { ...content.sizeGuide.cta, secondaryButtonLink: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Membership Section */}
            {activeTab === 'membership' && content.membership && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Membership Page</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                  <input
                    type="text"
                    value={content.membership.title}
                    onChange={(e) => updateContent('membership', { ...content.membership, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={content.membership.subtitle}
                    onChange={(e) => updateContent('membership', { ...content.membership, subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* Benefits */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Member Benefits</h3>
                    <button
                      onClick={() => {
                        const newBenefit = { id: Date.now().toString(), title: 'New Benefit', description: 'Description' };
                        updateContent('membership', {
                          ...content.membership,
                          benefits: [...content.membership.benefits, newBenefit]
                        });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" /> Add Benefit
                    </button>
                  </div>
                  <div className="space-y-4">
                    {content.membership.benefits.map((benefit, index) => (
                      <div key={benefit.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={benefit.title}
                            onChange={(e) => {
                              const newBenefits = [...content.membership.benefits];
                              newBenefits[index].title = e.target.value;
                              updateContent('membership', { ...content.membership, benefits: newBenefits });
                            }}
                            placeholder="Benefit Title"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <input
                            type="text"
                            value={benefit.description}
                            onChange={(e) => {
                              const newBenefits = [...content.membership.benefits];
                              newBenefits[index].description = e.target.value;
                              updateContent('membership', { ...content.membership, benefits: newBenefits });
                            }}
                            placeholder="Description"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newBenefits = content.membership.benefits.filter((_, i) => i !== index);
                            updateContent('membership', { ...content.membership, benefits: newBenefits });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Membership Tiers */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Membership Tiers</h3>
                    <button
                      onClick={() => {
                        const newTier = {
                          id: Date.now().toString(),
                          name: 'New Tier',
                          price: 0,
                          popular: false,
                          features: ['Feature 1'],
                          benefits: {
                            productDiscount: 10,
                            serviceDiscount: 0,
                            pointsRate: 5,
                            freeRefillsPerMonth: 2,
                            freeFullSetsPerMonth: 0,
                            includedServiceIds: []
                          }
                        };
                        updateContent('membership', {
                          ...content.membership,
                          tiers: [...content.membership.tiers, newTier]
                        });
                      }}
                      className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
                    >
                      <FiPlus className="mr-1" /> Add Tier
                    </button>
                  </div>
                  <div className="space-y-6">
                    {content.membership.tiers.map((tier, index) => (
                      <div key={tier.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => {
                              const newTiers = [...content.membership.tiers];
                              newTiers[index].name = e.target.value;
                              updateContent('membership', { ...content.membership, tiers: newTiers });
                            }}
                            placeholder="Tier Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <input
                              type="number"
                              value={tier.price}
                              onChange={(e) => {
                                const newTiers = [...content.membership.tiers];
                                newTiers[index].price = Number(e.target.value);
                                updateContent('membership', { ...content.membership, tiers: newTiers });
                              }}
                              placeholder="Price"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                            <span className="ml-2">/mo</span>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tier.popular}
                              onChange={(e) => {
                                const newTiers = [...content.membership.tiers];
                                newTiers[index].popular = e.target.checked;
                                updateContent('membership', { ...content.membership, tiers: newTiers });
                              }}
                              className="mr-2 rounded text-pink-600 focus:ring-pink-500"
                            />
                            Mark as Popular
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                          <textarea
                            value={tier.features.join('\n')}
                            onChange={(e) => {
                              const newTiers = [...content.membership.tiers];
                              newTiers[index].features = e.target.value.split('\n').filter(f => f.trim());
                              updateContent('membership', { ...content.membership, tiers: newTiers });
                            }}
                            rows={4}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                        
                        {/* Benefits Configuration */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3">Benefits Configuration</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Product Discount (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tier.benefits?.productDiscount || 0}
                                onChange={(e) => {
                                  const newTiers = [...content.membership.tiers];
                                  newTiers[index].benefits = {
                                    ...newTiers[index].benefits,
                                    productDiscount: Number(e.target.value)
                                  };
                                  updateContent('membership', { ...content.membership, tiers: newTiers });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Service Discount (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tier.benefits?.serviceDiscount || 0}
                                onChange={(e) => {
                                  const newTiers = [...content.membership.tiers];
                                  newTiers[index].benefits = {
                                    ...newTiers[index].benefits,
                                    serviceDiscount: Number(e.target.value)
                                  };
                                  updateContent('membership', { ...content.membership, tiers: newTiers });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Points Rate (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tier.benefits?.pointsRate || 0}
                                onChange={(e) => {
                                  const newTiers = [...content.membership.tiers];
                                  newTiers[index].benefits = {
                                    ...newTiers[index].benefits,
                                    pointsRate: Number(e.target.value)
                                  };
                                  updateContent('membership', { ...content.membership, tiers: newTiers });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Free Refills/Month</label>
                              <input
                                type="number"
                                min="0"
                                value={tier.benefits?.freeRefillsPerMonth || 0}
                                onChange={(e) => {
                                  const newTiers = [...content.membership.tiers];
                                  newTiers[index].benefits = {
                                    ...newTiers[index].benefits,
                                    freeRefillsPerMonth: Number(e.target.value)
                                  };
                                  updateContent('membership', { ...content.membership, tiers: newTiers });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Free Full Sets/Month</label>
                              <input
                                type="number"
                                min="0"
                                value={tier.benefits?.freeFullSetsPerMonth || 0}
                                onChange={(e) => {
                                  const newTiers = [...content.membership.tiers];
                                  newTiers[index].benefits = {
                                    ...newTiers[index].benefits,
                                    freeFullSetsPerMonth: Number(e.target.value)
                                  };
                                  updateContent('membership', { ...content.membership, tiers: newTiers });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            const newTiers = content.membership.tiers.filter((_, i) => i !== index);
                            updateContent('membership', { ...content.membership, tiers: newTiers });
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" /> Remove Tier
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Call-to-Action Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                      <input
                        type="text"
                        value={content.membership.cta.title}
                        onChange={(e) => updateContent('membership', {
                          ...content.membership,
                          cta: { ...content.membership.cta, title: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Description</label>
                      <textarea
                        value={content.membership.cta.description}
                        onChange={(e) => updateContent('membership', {
                          ...content.membership,
                          cta: { ...content.membership.cta, description: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                        <input
                          type="text"
                          value={content.membership.cta.primaryButtonText}
                          onChange={(e) => updateContent('membership', {
                            ...content.membership,
                            cta: { ...content.membership.cta, primaryButtonText: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Link</label>
                        <input
                          type="text"
                          value={content.membership.cta.primaryButtonLink}
                          onChange={(e) => updateContent('membership', {
                            ...content.membership,
                            cta: { ...content.membership.cta, primaryButtonLink: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                        <input
                          type="text"
                          value={content.membership.cta.secondaryButtonText}
                          onChange={(e) => updateContent('membership', {
                            ...content.membership,
                            cta: { ...content.membership.cta, secondaryButtonText: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Link</label>
                        <input
                          type="text"
                          value={content.membership.cta.secondaryButtonLink}
                          onChange={(e) => updateContent('membership', {
                            ...content.membership,
                            cta: { ...content.membership.cta, secondaryButtonLink: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
