/**
 * Media Library Service
 * Handles listing, uploading, and deleting media files in the course-content bucket.
 * Uses unique storage keys to avoid filename collisions and invalid-key errors.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './dbClient';

export interface MediaItem {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        eTag: string;
        size: number;
        mimetype: string;
        cacheControl: string;
        contentLength: number;
        httpStatusCode: number;
    } | null;
    url?: string;
}

export interface UploadResult {
    url: string;
    path: string;
}

const BUCKET = 'course-content';
const LIBRARY_PREFIX = 'LMS_Library';
const DEBUG = true; // Set to false to disable upload debug logs

function randomId(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/** Generate a safe, unique storage key to avoid collisions and invalid-key errors. */
function makeStoragePath(originalName: string): string {
    const ext = originalName.includes('.')
        ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
        : '';
    const rawBase = originalName.includes('.')
        ? originalName.slice(0, originalName.lastIndexOf('.'))
        : originalName;
    const base = rawBase
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 80);
    const safeBase = base || 'file';
    const unique = `${Date.now()}-${randomId(6)}-${safeBase}${ext}`;
    const path = `${LIBRARY_PREFIX}/${unique}`;
    if (DEBUG) {
        console.log('[MediaService] makeStoragePath:', { originalName, ext, rawBase, safeBase, path });
    }
    return path;
}

export async function listLibraryFiles(folderPath = ''): Promise<MediaItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database connection unavailable');

    const searchPath = folderPath ? `${LIBRARY_PREFIX}/${folderPath}` : LIBRARY_PREFIX;
    const { data, error } = await supabase.storage.from(BUCKET).list(searchPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) throw error;

    const items = (data ?? [])
        .filter((item) => item.metadata)
        .map((item) => {
            const filePath = folderPath
                ? `${LIBRARY_PREFIX}/${folderPath}/${item.name}`
                : `${LIBRARY_PREFIX}/${item.name}`;
            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
            return {
                ...item,
                url: urlData.publicUrl,
                id: filePath,
            };
        });

    return items as unknown as MediaItem[];
}

/** Upload a file with optional progress callback. Returns public URL and storage path. */
export async function uploadToLibrary(
    file: File,
    options?: { onProgress?: (percent: number) => void }
): Promise<UploadResult> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database connection unavailable');

    const path = makeStoragePath(file.name);
    if (DEBUG) {
        console.log('[MediaService] uploadToLibrary start:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            storagePath: path,
        });
    }

    if (options?.onProgress) {
        return uploadWithProgress(supabase, path, file, options.onProgress);
    }

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'application/octet-stream',
    });

    if (error) throw new Error(error.message || 'Upload failed');

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
}

async function uploadWithProgress(
    supabase: SupabaseClient,
    path: string,
    file: File,
    onProgress: (percent: number) => void
): Promise<UploadResult> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) throw new Error('Supabase configuration missing');

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || anonKey;
    const url = `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`;

    if (DEBUG) {
        console.log('[MediaService] uploadWithProgress:', {
            url,
            hasAuthToken: !!token,
            contentType: file.type || 'application/octet-stream',
        });
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200 || xhr.status === 201) {
                onProgress(100);
                const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
                if (DEBUG) {
                    console.log('[MediaService] upload success:', { status: xhr.status, path });
                }
                resolve({ url: data.publicUrl, path });
            } else {
                const rawResponse = xhr.responseText || '(empty)';
                let parsed: unknown = null;
                try {
                    parsed = JSON.parse(xhr.responseText);
                } catch {
                    /* ignore */
                }
                if (DEBUG) {
                    console.error('[MediaService] upload failed:', {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: rawResponse,
                        parsedBody: parsed,
                    });
                }
                let msg = `Upload failed (${xhr.status})`;
                if (parsed && typeof parsed === 'object' && 'message' in parsed) {
                    msg = String((parsed as { message: unknown }).message);
                } else if (parsed && typeof parsed === 'object' && 'error' in parsed) {
                    msg = String((parsed as { error: unknown }).error);
                } else if (rawResponse !== '(empty)') {
                    msg = rawResponse;
                }
                reject(new Error(msg));
            }
        });

        xhr.addEventListener('error', () => {
            if (DEBUG) console.error('[MediaService] upload network error');
            reject(new Error('Network error'));
        });
        xhr.addEventListener('abort', () => {
            if (DEBUG) console.error('[MediaService] upload aborted');
            reject(new Error('Upload aborted'));
        });

        xhr.open('PUT', url);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('apikey', anonKey);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('x-upsert', 'true');
        xhr.setRequestHeader('cache-control', '3600');
        xhr.send(file);
    });
}

export async function deleteLibraryFile(filePath: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database connection unavailable');

    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) throw error;
}
