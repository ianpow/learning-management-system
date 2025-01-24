// app/lib/file-upload.ts
import { put } from '@vercel/blob';

export async function uploadFile(file: File): Promise<string> {
  const blob = await put(`scorm/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });
  return blob.url;
}