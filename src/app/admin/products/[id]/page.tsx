'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, Product } from '@/lib/content-manager';
import { FiSave, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

export default function EditProduct() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isNew = productId === 'new';

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: 0,
    description: '',
    category: '',
    image: 'https://picsum.photos/600/800?random=new',
    features: [],
    specifications: {},
    careInstructions: [],
    inStock: true,
    featured: false,
    bestSeller: false
  });

  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newCareInstruction, setNewCareInstruction] = useState('');


  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!isNew && productId) {
        const existingProduct = await contentManager.getProduct(productId);
        if (existingProduct) {
          setProduct(existingProduct);
        } else {
          toast.error('Product not found');
          router.push('/admin/products');
        }
      }
    };
    
    loadProduct();
  }, [productId, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.name || !product.price || !product.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productData: Product = {
      id: isNew ? Date.now().toString() : productId,
      name: product.name,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      description: product.description || '',
      category: product.category,
      image: product.image || 'https://picsum.photos/600/800?random=new',
      features: product.features || [],
      specifications: product.specifications || {},
      careInstructions: product.careInstructions || [],
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      bestSeller: product.bestSeller ?? false,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await contentManager.saveProduct(productData);
      toast.success(isNew ? 'Product created successfully' : 'Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNew ? 'Add New Product' : 'Edit Product'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isNew ? 'Create a new product listing' : 'Update product information'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="e.g., Volume Lashes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (for sale)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={product.originalPrice || ''}
                  onChange={(e) => setProduct({ ...product, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Product Image</h2>
            
            <ImageUpload
              value={product.image || ''}
              onChange={(url) => {
                setProduct({ ...product, image: url });
              }}
              label="Product Image"
            />
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Key Features</h2>
            
            <div className="space-y-3">
              {product.features && product.features.length > 0 ? (
                product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...(product.features || [])];
                        newFeatures[index] = e.target.value;
                        setProduct({ ...product, features: newFeatures });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Enter feature"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = product.features?.filter((_, i) => i !== index);
                        setProduct({ ...product, features: newFeatures });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No features added yet</p>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newFeature.trim()) {
                        setProduct({ 
                          ...product, 
                          features: [...(product.features || []), newFeature.trim()] 
                        });
                        setNewFeature('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Add a new feature"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newFeature.trim()) {
                      setProduct({ 
                        ...product, 
                        features: [...(product.features || []), newFeature.trim()] 
                      });
                      setNewFeature('');
                    }
                  }}
                  className="p-2 bg-pink-600 text-white hover:bg-pink-700 rounded-lg transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Press Enter or click + to add a feature</p>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Specifications</h2>
            
            <div className="space-y-3">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newSpecs = { ...product.specifications };
                        const newKey = e.target.value;
                        if (newKey !== key) {
                          delete newSpecs[key];
                          newSpecs[newKey] = value;
                        }
                        setProduct({ ...product, specifications: newSpecs });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Spec name"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newSpecs = { ...product.specifications };
                          newSpecs[key] = e.target.value;
                          setProduct({ ...product, specifications: newSpecs });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Spec value"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSpecs = { ...product.specifications };
                          delete newSpecs[key];
                          setProduct({ ...product, specifications: newSpecs });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No specifications added yet</p>
              )}
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <input
                  type="text"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSpecKey.trim() && newSpecValue.trim()) {
                        setProduct({ 
                          ...product, 
                          specifications: { 
                            ...(product.specifications || {}), 
                            [newSpecKey.trim()]: newSpecValue.trim() 
                          } 
                        });
                        setNewSpecKey('');
                        setNewSpecValue('');
                      }
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Spec name (e.g., Material)"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSpecKey.trim() && newSpecValue.trim()) {
                          setProduct({ 
                            ...product, 
                            specifications: { 
                              ...(product.specifications || {}), 
                              [newSpecKey.trim()]: newSpecValue.trim() 
                            } 
                          });
                          setNewSpecKey('');
                          setNewSpecValue('');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Spec value (e.g., Premium Silk)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSpecKey.trim() && newSpecValue.trim()) {
                        setProduct({ 
                          ...product, 
                          specifications: { 
                            ...(product.specifications || {}), 
                            [newSpecKey.trim()]: newSpecValue.trim() 
                          } 
                        });
                        setNewSpecKey('');
                        setNewSpecValue('');
                      }
                    }}
                    className="p-2 bg-pink-600 text-white hover:bg-pink-700 rounded-lg transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Press Enter or click + to add a specification</p>
            </div>
          </div>

          {/* Care Instructions Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Care Instructions</h2>
            
            <div className="space-y-3">
              {product.careInstructions && product.careInstructions.length > 0 ? (
                product.careInstructions.map((instruction, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...(product.careInstructions || [])];
                        newInstructions[index] = e.target.value;
                        setProduct({ ...product, careInstructions: newInstructions });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Enter care instruction"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newInstructions = product.careInstructions?.filter((_, i) => i !== index);
                        setProduct({ ...product, careInstructions: newInstructions });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No care instructions added yet</p>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newCareInstruction}
                  onChange={(e) => setNewCareInstruction(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newCareInstruction.trim()) {
                        setProduct({ 
                          ...product, 
                          careInstructions: [...(product.careInstructions || []), newCareInstruction.trim()] 
                        });
                        setNewCareInstruction('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Add care instruction (e.g., Avoid oil-based products)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCareInstruction.trim()) {
                      setProduct({ 
                        ...product, 
                        careInstructions: [...(product.careInstructions || []), newCareInstruction.trim()] 
                      });
                      setNewCareInstruction('');
                    }
                  }}
                  className="p-2 bg-pink-600 text-white hover:bg-pink-700 rounded-lg transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Press Enter or click + to add a care instruction</p>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Product Status</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => setProduct({ ...product, inStock: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Product</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.bestSeller}
                  onChange={(e) => setProduct({ ...product, bestSeller: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Best Seller</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <FiSave className="mr-2" />
              {isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
