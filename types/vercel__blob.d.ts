// types/vercel__blob.d.ts
declare module '@vercel/blob' {
    export function put(
      path: string,
      file: File | Blob | ArrayBuffer | Buffer,
      options?: { 
        access?: 'public' | 'private';
        addRandomSuffix?: boolean;
        contentType?: string;
      }
    ): Promise<{ url: string }>;
  }