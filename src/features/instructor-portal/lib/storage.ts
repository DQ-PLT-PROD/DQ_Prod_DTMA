/**
 * LMS Storage Provider for Supabase Storage
 * Handles file uploads for LMS content with proper bucket structure.
 * Ported from DWS Admin App for DTMA.
 */

import { getSupabaseClient } from './dbClient';

export type LMSUploadArgs = {
    file: File;
    courseSlug: string;
    moduleOrder?: number;
    moduleTitle?: string;
    lessonOrder?: number;
    lessonTitle?: string;
    itemType: 'thumbnail' | 'image' | 'video' | 'document';
    itemId?: string;
    onProgress?: (progress: number) => void;
}

export type LMSUploadResult = {
    publicUrl: string;
    blobPath: string;
    fileSize: number;
}

function sanitizeFolderName(order: number, title: string): string {
    const paddedOrder = String(order).padStart(2, '0');
    const sanitizedTitle = title
        .replace(/[^a-z0-9\s-]/gi, '')
        .trim()
        .replace(/\s+/g, '_');
    return `${paddedOrder}_${sanitizedTitle}`;
}

function generateStoragePath(
    courseSlug: string,
    args: {
        moduleOrder?: number;
        moduleTitle?: string;
        lessonOrder?: number;
        lessonTitle?: string;
        itemType: string;
        filename: string;
        itemId?: string;
    }
): string {
    const sanitizeSlug = (slug: string) =>
        slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const sanitizedCourseSlug = sanitizeSlug(courseSlug);
    const sanitizedFilename = args.filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');

    if (args.itemType === 'thumbnail') {
        const extension = args.filename.split('.').pop()?.toLowerCase() || 'jpg';
        if (args.moduleTitle) {
            const moduleKey = sanitizeSlug(args.moduleTitle) || 'module';
            const uniqueKey = args.itemId || String(Date.now());
            return `LMS_Uploads/${sanitizedCourseSlug}/module-thumbnails/${moduleKey}-${uniqueKey}.${extension}`;
        }
        return `LMS_Uploads/${sanitizedCourseSlug}/thumbnail.${extension}`;
    }

    let path = `LMS_Uploads/${sanitizedCourseSlug}`;

    if (args.moduleOrder !== undefined && args.moduleTitle) {
        const moduleFolder = sanitizeFolderName(args.moduleOrder, args.moduleTitle);
        path += `/${moduleFolder}`;
    }

    if (args.lessonOrder !== undefined && args.lessonTitle) {
        const lessonFolder = sanitizeFolderName(args.lessonOrder, args.lessonTitle);
        path += `/${lessonFolder}`;
    }

    const contentOrder = args.lessonOrder !== undefined ? args.lessonOrder : 1;
    const paddedContentOrder = String(contentOrder).padStart(2, '0');
    const uniqueFilename = args.itemId
        ? `${paddedContentOrder}_${args.itemId}_${sanitizedFilename}`
        : `${paddedContentOrder}_${sanitizedFilename}`;

    path += `/${uniqueFilename}`;

    return path;
}

export async function uploadLMSFile({
    file,
    courseSlug,
    moduleOrder,
    moduleTitle,
    lessonOrder,
    lessonTitle,
    itemType,
    itemId,
    onProgress,
}: LMSUploadArgs): Promise<LMSUploadResult> {
    const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

    if (file.size > FILE_SIZE_LIMIT && itemType !== 'video' && itemType !== 'thumbnail') {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of 50MB`);
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        throw new Error('Supabase client not available');
    }

    const storagePath = generateStoragePath(courseSlug, {
        moduleOrder,
        moduleTitle,
        lessonOrder,
        lessonTitle,
        itemType,
        filename: file.name,
        itemId,
    });

    // Create a proper public URL for the file to be uploaded
    // Note: bucket is 'course-content'
    const BUCKET_NAME = 'course-content';
    const allowReplace = itemType === 'thumbnail';

    if (onProgress) {
        return new Promise((resolve, reject) => {
            supabase.auth.getSession().then(({ data: { session } }) => {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
                if (!supabaseUrl) {
                    reject(new Error('Supabase URL not configured'));
                    return;
                }

                const storageEndpoint = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${storagePath}`;
                const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                if (!anonKey) {
                    reject(new Error('Supabase anon key not configured'));
                    return;
                }

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(Math.min(percentComplete, 99));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200 || xhr.status === 201) {
                        onProgress(100);

                        const { data: urlData } = supabase.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(storagePath);

                        const publicUrl = urlData.publicUrl;

                        resolve({
                            publicUrl,
                            blobPath: storagePath,
                            fileSize: file.size,
                        });
                    } else {
                        try {
                            const error = JSON.parse(xhr.responseText);
                            reject(new Error(error.message || error.error || `Upload failed with status ${xhr.status}`));
                        } catch {
                            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
                        }
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed - network error'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload aborted'));
                });

                xhr.open('PUT', storageEndpoint);

                const authToken = session?.access_token || anonKey;
                xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
                xhr.setRequestHeader('apikey', anonKey);
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                xhr.setRequestHeader('x-upsert', allowReplace ? 'true' : 'false');
                xhr.setRequestHeader('cache-control', '3600');

                xhr.send(file);
            }).catch(reject);
        });
    } else {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: allowReplace,
            });

        if (error) {
            console.error('Supabase Storage upload error:', error);
            throw new Error(error.message || 'Failed to upload file');
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

        return {
            publicUrl: urlData.publicUrl,
            blobPath: storagePath,
            fileSize: file.size,
        };
    }
}
