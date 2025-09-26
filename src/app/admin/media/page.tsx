'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { FiUpload, FiTrash2, FiCopy, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size?: string;
  uploadedAt: string;
  category: 'product' | 'gallery' | 'content' | 'other';
}

export default function AdminMedia() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
    const stored = localStorage.getItem('renfaye_media');
    if (stored) {
      setMediaItems(JSON.parse(stored));
    } else {
      // Default media items
      const defaultMedia: MediaItem[] = [
        {
          id: '1',
          url: 'https://picsum.photos/600/800?random=1',
          name: 'Classic Volume Lashes',
          category: 'product',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '2',
          url: 'https://picsum.photos/600/800?random=2',
          name: 'Hybrid Volume Set',
          category: 'product',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '3',
          url: 'https://picsum.photos/600/800?random=3',
          name: 'Gallery Image 1',
          category: 'gallery',
          uploadedAt: new Date().toISOString()
        }
      ];
      setMediaItems(defaultMedia);
      localStorage.setItem('renfaye_media', JSON.stringify(defaultMedia));
    }
  };

  const handleUpload = (url: string, name: string, category: MediaItem['category']) => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      url,
      name,
      category,
      uploadedAt: new Date().toISOString()
    };
    
    const updated = [...mediaItems, newItem];
    setMediaItems(updated);
    localStorage.setItem('renfaye_media', JSON.stringify(updated));
    setShowUploadModal(false);
    toast.success('Image uploaded successfully');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const updated = mediaItems.filter(item => item.id !== id);
      setMediaItems(updated);
      localStorage.setItem('renfaye_media', JSON.stringify(updated));
      toast.success('Image deleted successfully');
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} images?`)) {
      const updated = mediaItems.filter(item => !selectedItems.includes(item.id));
      setMediaItems(updated);
      localStorage.setItem('renfaye_media', JSON.stringify(updated));
      setSelectedItems([]);
      toast.success(`${selectedItems.length} images deleted successfully`);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-2">Manage your images and media files</p>
          </div>
          <div className="flex space-x-2">
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FiTrash2 className="mr-2" />
                Delete ({selectedItems.length})
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <FiUpload className="mr-2" />
              Upload
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Categories</option>
              <option value="product">Products</option>
              <option value="gallery">Gallery</option>
              <option value="content">Content</option>
              <option value="other">Other</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`relative group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <div className="relative h-40">
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="absolute top-2 left-2 w-4 h-4"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="relative h-12 w-12">
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="text-pink-600 hover:text-pink-900 mr-3"
                      >
                        <FiCopy className="inline w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Upload Image</h2>
              <UploadForm
                onUpload={handleUpload}
                onCancel={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function UploadForm({ onUpload, onCancel }: { 
  onUpload: (url: string, name: string, category: MediaItem['category']) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MediaItem['category']>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) {
      toast.error('Please fill in all fields');
      return;
    }
    onUpload(url, name, category);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        value={url}
        onChange={setUrl}
        label="Upload Image"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MediaItem['category'])}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="product">Product</option>
          <option value="gallery">Gallery</option>
          <option value="content">Content</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Upload
        </button>
      </div>
    </form>
  );
}
