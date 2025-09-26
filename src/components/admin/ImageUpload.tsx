'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Upload Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeImage = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supports: JPG, PNG, GIF, WebP (Max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading...</p>
        </div>
      )}
    </div>
  );
}
