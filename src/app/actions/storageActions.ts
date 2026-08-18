'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  storageProvider?: 'supabase' | 's3' | 'local';
  name?: string;
  size?: number;
  type?: string;
  error?: string;
}

export async function uploadFileToCloudAction(formData: FormData): Promise<StorageUploadResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? ((session.user as { id?: string }).id || 'guest') : 'guest';

  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, error: 'Nenhum arquivo enviado.' };
  }

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB Limit
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'O tamanho do arquivo excede o limite de 25MB.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase Storage REST Uploader (if configured)
  if (supabaseUrl && supabaseKey) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileKey = `${userId}/${Date.now()}-${sanitizedName}`;
      const bucketName = 'devdock-attachments';

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadEndpoint = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${bucketName}/${fileKey}`;
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: buffer,
      });

      if (res.ok) {
        const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucketName}/${fileKey}`;
        return {
          success: true,
          url: publicUrl,
          storagePath: fileKey,
          storageProvider: 'supabase',
          name: file.name,
          size: file.size,
          type: file.type,
        };
      }
    } catch (cloudErr) {
      console.warn('[StorageActions] Supabase upload failed, falling back to local storage:', cloudErr);
    }
  }

  // Resilient Fallback: Convert to Base64 DataURL for local storage
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return {
      success: true,
      url: dataUrl,
      storagePath: `local/${Date.now()}-${file.name}`,
      storageProvider: 'local',
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (err) {
    console.error('[StorageActions] Local upload fallback error:', err);
    return { success: false, error: 'Falha ao processar arquivo.' };
  }
}

export async function deleteFileFromCloudAction(storagePath: string): Promise<{ success: boolean; error?: string }> {
  if (!storagePath || storagePath.startsWith('local/')) {
    return { success: true };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const bucketName = 'devdock-attachments';
      const deleteEndpoint = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${bucketName}`;
      const res = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: [storagePath] }),
      });

      return { success: res.ok };
    } catch (err) {
      console.error('[StorageActions] Delete file error:', err);
    }
  }

  return { success: true };
}
