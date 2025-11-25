'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiSave, FiEye, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  lastModified: string;
  status: 'published' | 'draft';
}

export default function AdminPages() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      } else {
        toast.error('Failed to load pages');
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const savePagesToServer = async (updatedPages: PageContent[]) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPages)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save pages');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving pages:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    
    const updatedPages = pages.map(page => 
      page.id === selectedPage.id 
        ? { ...selectedPage, lastModified: new Date().toISOString() }
        : page
    );
    
    const saved = await savePagesToServer(updatedPages);
    
    if (saved) {
      setPages(updatedPages);
      setHasChanges(false);
      toast.success('Page saved successfully');
    } else {
      toast.error('Failed to save page');
    }
  };

  const updateSelectedPage = (field: keyof PageContent, value: string) => {
    if (!selectedPage) return;
    
    setSelectedPage({
      ...selectedPage,
      [field]: value
    });
    setHasChanges(true);
  };

  const selectPage = (page: PageContent) => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Do you want to discard them?')) {
        return;
      }
    }
    setSelectedPage(page);
    setHasChanges(false);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="flex gap-6">
        {/* Pages List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Pages</h2>
            </div>
            <div className="p-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => selectPage(page)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedPage?.id === page.id ? 'bg-pink-50 text-pink-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-sm text-gray-500">/{page.slug}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {page.status === 'published' ? (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Page Editor */}
        <div className="flex-1">
          {selectedPage ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Edit Page</h1>
                  <p className="text-gray-600 mt-2">Last modified: {new Date(selectedPage.lastModified).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/${selectedPage.slug}`}
                    target="_blank"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <FiEye className="mr-2" />
                    Preview
                  </Link>
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
              </div>

              {/* Page Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Page Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={selectedPage.title}
                      onChange={(e) => updateSelectedPage('title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        /
                      </span>
                      <input
                        type="text"
                        value={selectedPage.slug}
                        onChange={(e) => updateSelectedPage('slug', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedPage.status}
                      onChange={(e) => updateSelectedPage('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Page Content</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content (HTML)
                    </label>
                    <textarea
                      value={selectedPage.content}
                      onChange={(e) => updateSelectedPage('content', e.target.value)}
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can use HTML tags to format your content
                    </p>
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
                      value={selectedPage.metaTitle}
                      onChange={(e) => updateSelectedPage('metaTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={selectedPage.metaDescription}
                      onChange={(e) => updateSelectedPage('metaDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Page</h2>
              <p className="text-gray-600">Choose a page from the list to start editing</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
