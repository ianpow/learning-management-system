'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Camera, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      setIsUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setMessage({ type: 'success', text: 'Profile image updated successfully' });
      
      // Update the session to reflect the new image
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            profileImage: data.url,
          },
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-[300px] h-[300px] rounded-lg border-2 border-gray-200 overflow-hidden relative bg-gray-50">
              {(previewUrl || session?.user?.profileImage) ? (
                <Image
                  src={previewUrl || session?.user?.profileImage || ''}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload New Image'}
            </button>
          </div>

          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{session?.user?.first_name} {session?.user?.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}