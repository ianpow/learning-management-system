import { put } from '@vercel/blob';

export async function uploadToBlob(file: File, prefix: string = '') {
  try {
    const blob = await put(`${prefix}${file.name}`, file, {
      access: 'public',
    });
    return blob.url;
  } catch (error) {
    console.error('Error uploading to blob storage:', error);
    throw error;
  }
}

export async function deleteFromBlob(url: string) {
  try {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Failed to delete: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting from blob storage:', error);
    throw error;
  }
}