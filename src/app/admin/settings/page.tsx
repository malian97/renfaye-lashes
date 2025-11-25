'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, StoreSettings } from '@/lib/content-manager';
import { FiSave, FiMail, FiPhone, FiMapPin, FiClock, FiFacebook, FiInstagram, FiTwitter, FiDollarSign, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SiteSettings {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export default function AdminSettings() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [hasChanges, setHasChanges] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  
  const [settings, setSettings] = useState<SiteSettings>({
    businessName: 'RENFAYE LASHES',
    email: 'info@renfayelashes.com',
    phone: '(555) 123-4567',
    address: '123 Beauty Lane, New York, NY 10001',
    businessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 7:00 PM',
      friday: '9:00 AM - 7:00 PM',
      saturday: '10:00 AM - 5:00 PM',
      sunday: 'Closed'
    },
    social: {
      facebook: 'https://facebook.com/renfayelashes',
      instagram: 'https://instagram.com/renfayelashes',
      twitter: 'https://twitter.com/renfayelashes'
    },
    seo: {
      metaTitle: 'RENFAYE LASHES | Premium Eyelash Extensions',
      metaDescription: 'Discover luxury eyelash extensions that enhance your natural beauty. Shop our premium collection of lashes.',
      keywords: 'eyelash extensions, premium lashes, beauty, cosmetics'
    }
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('renfaye_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Load store settings from API
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      const data = await contentManager.getStoreSettings();
      setStoreSettings(data);
      // Load social media from store settings if available
      if (data.socialMedia) {
        setSettings(prev => ({
          ...prev,
          social: {
            facebook: data.socialMedia?.facebook || '',
            instagram: data.socialMedia?.instagram || '',
            twitter: data.socialMedia?.twitter || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
      toast.error('Failed to load store settings');
    } finally {
      setLoadingStore(false);
    }
  };

  const handleSave = async () => {
    localStorage.setItem('renfaye_settings', JSON.stringify(settings));
    
    // Also save social media to store settings (server)
    if (storeSettings) {
      try {
        await contentManager.saveStoreSettings({
          ...storeSettings,
          socialMedia: settings.social
        });
      } catch (error) {
        console.error('Error saving social media to server:', error);
      }
    }
    
    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const updateSettings = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const updateBusinessHours = (day: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value
      }
    }));
    setHasChanges(true);
  };

  const updateSocial = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
    setHasChanges(true);
  };

  const updateSEO = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveStoreSettings = async () => {
    if (!storeSettings) return;
    
    try {
      await contentManager.saveStoreSettings(storeSettings);
      toast.success('Store settings saved successfully');
    } catch (error) {
      console.error('Error saving store settings:', error);
      toast.error('Failed to save store settings');
    }
  };

  const updateStoreSettings = (field: keyof StoreSettings, value: string | number) => {
    setStoreSettings(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
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
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your website settings and configuration</p>
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

        {/* Store Settings (E-commerce) */}
        {!loadingStore && storeSettings && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                <FiShoppingCart className="inline mr-2" />
                Store Settings
              </h2>
              <button
                onClick={handleSaveStoreSettings}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
              >
                <FiSave className="mr-2" />
                Save Store Settings
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="inline mr-1" />
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={storeSettings.shippingCost}
                  onChange={(e) => updateStoreSettings('shippingCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">Flat rate shipping cost for all orders</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={storeSettings.taxRate}
                  onChange={(e) => updateStoreSettings('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">Sales tax percentage (0 for no tax)</p>
              </div>
            </div>
          </div>
        )}

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => updateSettings('businessName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateSettings('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => updateSettings('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="inline mr-1" />
                Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateSettings('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            <FiClock className="inline mr-2" />
            Business Hours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(settings.businessHours).map(([day, hours]) => (
              <div key={day}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {day}
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => updateBusinessHours(day, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFacebook className="inline mr-1" />
                Facebook
              </label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) => updateSocial('facebook', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiInstagram className="inline mr-1" />
                Instagram
              </label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) => updateSocial('instagram', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiTwitter className="inline mr-1" />
                Twitter
              </label>
              <input
                type="url"
                value={settings.social.twitter}
                onChange={(e) => updateSocial('twitter', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://twitter.com/yourpage"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.seo.metaTitle}
                onChange={(e) => updateSEO('metaTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.seo.metaDescription}
                onChange={(e) => updateSEO('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={settings.seo.keywords}
                onChange={(e) => updateSEO('keywords', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Comma separated keywords"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
