import React, { useCallback, useEffect, useState } from 'react';
import {
    Copy,
    FileIcon,
    FilmIcon,
    ImageIcon,
    Loader2,
    Search,
    Trash2,
    Upload,
} from 'lucide-react';
import {
    deleteLibraryFile,
    listLibraryFiles,
    MediaItem,
    uploadToLibrary,
} from '../lib/mediaService';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';

export function MediaLibraryPage() {
    const { ability } = useAdminAuth();
    const canUploadMedia = ability.can('upload', 'Media');
    const canDeleteMedia = ability.can('delete', 'Media');
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);

    const loadFiles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await listLibraryFiles();
            setFiles(data);
        } catch (err) {
            console.error('Failed to load library files', err);
            setToast({ type: 'error', message: 'Failed to load files' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUploadMedia) {
            setToast({ type: 'error', message: 'You do not have permission to upload media.' });
            e.target.value = '';
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setUploadProgress(0);
            await uploadToLibrary(file, {
                onProgress: setUploadProgress,
            });
            setToast({ type: 'success', message: 'File uploaded successfully' });
            await loadFiles();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            setToast({ type: 'error', message: msg });
        } finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    };

    const handleDelete = async (filePath: string) => {
        if (!canDeleteMedia) {
            setToast({ type: 'error', message: 'You do not have permission to delete media.' });
            return;
        }
        if (
            !window.confirm(
                'Are you sure you want to delete this file? This action cannot be undone.'
            )
        )
            return;

        try {
            setDeletingFileId(filePath);
            await deleteLibraryFile(filePath);
            setToast({ type: 'success', message: 'File deleted' });
            setFiles((prev) => prev.filter((f) => f.id !== filePath));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete file';
            setToast({ type: 'error', message });
        } finally {
            setDeletingFileId(null);
        }
    };

    const copyToClipboard = (url?: string) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setToast({ type: 'success', message: 'URL copied to clipboard' });
    };

    const getFileIcon = (mimetype: string | undefined) => {
        if (mimetype?.startsWith('image/'))
            return <ImageIcon className="h-8 w-8 text-blue-500" />;
        if (mimetype?.startsWith('video/'))
            return <FilmIcon className="h-8 w-8 text-purple-500" />;
        return <FileIcon className="h-8 w-8 text-gray-400" />;
    };

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Media Library
                    </h1>
                    <p className="text-gray-500">
                        Manage your reusable course assets
                    </p>
                </div>
                <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors bg-[var(--md-primary)] text-white hover:bg-[var(--md-primary-hover)] ${
                        uploading || !canUploadMedia ? 'pointer-events-none opacity-70' : ''
                    }`}
                >
                    {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    <span>
                        {uploading
                            ? `Uploading${uploadProgress > 0 ? ` ${uploadProgress}%` : '...'}`
                            : 'Upload Media'}
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading || !canUploadMedia}
                    />
                </label>
            </div>

            {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex justify-between text-sm text-gray-600">
                        <span>Uploading</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-[var(--md-primary)] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[var(--md-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-full w-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        No media files
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Upload something to get started
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.id}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                        >
                            <div className="flex aspect-square items-center justify-center bg-gray-100 p-2">
                                {file.metadata?.mimetype?.startsWith(
                                    'image/'
                                ) && file.url ? (
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    getFileIcon(file.metadata?.mimetype)
                                )}
                            </div>
                            <div className="border-t border-gray-100 p-3">
                                <p
                                    className="truncate text-sm font-medium text-gray-900"
                                    title={file.name}
                                >
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {file.metadata?.size
                                        ? (
                                              file.metadata.size /
                                              1024 /
                                              1024
                                          ).toFixed(2)
                                        : '0'}{' '}
                                    MB
                                </p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(file.url)}
                                    className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-[var(--md-primary)]"
                                    title="Copy URL"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                {canDeleteMedia && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(file.id)}
                                        disabled={deletingFileId === file.id}
                                        className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        title="Delete"
                                    >
                                        {deletingFileId === file.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                    isVisible={!!toast}
                />
            )}
        </div>
    );
}

export default MediaLibraryPage;
