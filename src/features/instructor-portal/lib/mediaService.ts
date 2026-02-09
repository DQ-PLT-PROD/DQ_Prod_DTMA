import { getSupabaseClient } from './dbClient';

export interface MediaItem {
    name: string;
    id: string; // usually the name or path
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

const BUCKET_NAME = 'lms-content';
const LIBRARY_PATH = 'LMS_Library';

export async function listLibraryFiles(folderPath: string = ''): Promise<MediaItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database connection unavailable');

    const searchPath = folderPath ? `${LIBRARY_PATH}/${folderPath}` : LIBRARY_PATH;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(searchPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) {
        console.error('Error listing library files:', error);
        throw error;
    }

    // Process files to add public URLs
    const filesWithUrls = data.map((item) => {
        // Skip placeholders or folders if necessary
        if (!item.metadata) return item;

        const filePath = folderPath
            ? `${LIBRARY_PATH}/${folderPath}/${item.name}`
            : `${LIBRARY_PATH}/${item.name}`;

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            ...item,
            url: urlData.publicUrl,
            // Store full path in id for easier referencing
            id: filePath
        };
    });

    return filesWithUrls as MediaItem[];
}

export async function uploadToLibrary(file: File, folderPath: string = ''): Promise<string> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database connection unavailable');

    // Sanitize filename
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = folderPath
        ? `${LIBRARY_PATH}/${folderPath}/${sanitizedFilename}`
        : `${LIBRARY_PATH}/${sanitizedFilename}`;

    const { error, data } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false // Don't overwrite by default
        });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

    return urlData.publicUrl;
}

export async function deleteLibraryFile(filePath: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database connection unavailable');

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) throw error;
}
