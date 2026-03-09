import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, Search, ImageIcon, FilmIcon, FileIcon, Trash2 } from 'lucide-react';
import { deleteLibraryFile, listLibraryFiles, uploadToLibrary, MediaItem } from '../../lib/mediaService';
import { useAdminAuth } from '@/lib/admin-auth';
import { Toast } from '@/components/ui/Toast';

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    allowedTypes?: string[]; // e.g. ['image/']
    currentUrl?: string;
    onDeleteUrl?: (url: string) => void;
}

export function MediaPickerModal({
    isOpen,
    onClose,
    onSelect,
    allowedTypes,
    currentUrl,
    onDeleteUrl,
}: MediaPickerModalProps) {
    const { ability } = useAdminAuth();
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const canUploadMedia = ability.can('upload', 'Media');
    const canDeleteMedia = ability.can('delete', 'Media');

    useEffect(() => {
        if (isOpen) {
            loadFiles();
        }
    }, [isOpen]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            const data = await listLibraryFiles();
            setFiles(data);
        } catch (error) {
            console.error('Failed to load library files', error);
            setToast({ type: 'error', message: 'Failed to load files' });
        } finally {
            setLoading(false);
        }
    };

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
            await uploadToLibrary(file);
            setToast({ type: 'success', message: 'File uploaded successfully' });
            await loadFiles();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            setToast({ type: 'error', message: msg });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSelect = (file: MediaItem) => {
        if (!file.url) return;
        onSelect(file.url);
        onClose();
    };

    const handleDelete = async (file: MediaItem) => {
        if (!canDeleteMedia) {
            setToast({ type: 'error', message: 'You do not have permission to delete media.' });
            return;
        }

        if (!window.confirm(`Delete "${file.name}" from the media library? This cannot be undone.`)) {
            return;
        }

        try {
            setDeletingFileId(file.id);
            await deleteLibraryFile(file.id);
            setFiles((current) => current.filter((item) => item.id !== file.id));
            if (file.url && currentUrl === file.url) {
                onDeleteUrl?.(file.url);
            }
            setToast({ type: 'success', message: 'File deleted successfully' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete file';
            setToast({ type: 'error', message });
        } finally {
            setDeletingFileId(null);
        }
    };

    const getFileIcon = (mimetype: string | undefined) => {
        if (mimetype?.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
        if (mimetype?.startsWith('video/')) return <FilmIcon className="h-6 w-6 text-purple-500" />;
        return <FileIcon className="h-6 w-6 text-gray-400" />;
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = allowedTypes
            ? allowedTypes.some(type => file.metadata?.mimetype?.startsWith(type))
            : true;
        return matchesSearch && matchesType;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                    <h2 className="text-lg font-semibold text-gray-900">Select Media</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search library..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <label className={`flex items-center gap-2 px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-hover)] cursor-pointer transition-colors ${(uploading || !canUploadMedia) ? 'opacity-70 pointer-events-none' : ''}`}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading || !canUploadMedia}
                            accept={allowedTypes ? allowedTypes.join(',') + (allowedTypes.includes('image/') ? ',image/*' : '') : undefined}
                        />
                    </label>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <ImageIcon className="h-full w-full" />
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching files</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload a new file or adjust search</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-[var(--md-primary)] hover:shadow-md"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(file)}
                                        className="block w-full text-left"
                                    >
                                        <div className="relative flex aspect-square items-center justify-center bg-gray-100 p-2">
                                            {file.metadata?.mimetype?.startsWith('image/') && file.url ? (
                                                <img src={file.url} alt={file.name} className="h-full w-full rounded-md object-cover" />
                                            ) : (
                                                getFileIcon(file.metadata?.mimetype)
                                            )}
                                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                        </div>
                                        <div className="border-t border-gray-100 p-2">
                                            <p className="truncate text-xs font-medium text-gray-900">{file.name}</p>
                                            <p className="mt-0.5 text-[10px] text-gray-500">
                                                {(file.metadata?.size ? (file.metadata.size / 1024).toFixed(1) : '0')} KB
                                            </p>
                                        </div>
                                    </button>
                                    {canDeleteMedia && (
                                        <div className="border-t border-gray-100 px-2 py-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(file)}
                                                disabled={deletingFileId === file.id}
                                                className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {deletingFileId === file.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                        isVisible={!!toast}
                    />
                )}
            </div>
        </div>
    );
}
