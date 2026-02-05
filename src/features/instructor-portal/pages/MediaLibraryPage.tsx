import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, FileIcon, ImageIcon, FilmIcon, Search, Loader2 } from 'lucide-react';
import { listLibraryFiles, uploadToLibrary, deleteLibraryFile, MediaItem } from '../lib/mediaService';
import { Toast } from '@/components/ui/Toast';

export function MediaLibraryPage() {
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    useEffect(() => {
        loadFiles();
    }, []);

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
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await uploadToLibrary(file);
            setToast({ type: 'success', message: 'File uploaded successfully' });
            loadFiles(); // Refresh list
        } catch (error) {
            console.error('Upload failed', error);
            setToast({ type: 'error', message: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') });
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (filePath: string) => {
        if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;

        try {
            await deleteLibraryFile(filePath);
            setToast({ type: 'success', message: 'File deleted' });
            setFiles(files.filter(f => f.id !== filePath));
        } catch (error) {
            console.error('Delete failed', error);
            setToast({ type: 'error', message: 'Failed to delete file' });
        }
    };

    const copyToClipboard = (url?: string) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setToast({ type: 'success', message: 'URL copied to clipboard' });
    };

    const getFileIcon = (mimetype: string | undefined) => {
        if (mimetype?.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
        if (mimetype?.startsWith('video/')) return <FilmIcon className="h-8 w-8 text-purple-500" />;
        return <FileIcon className="h-8 w-8 text-gray-400" />;
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                    <p className="text-gray-500">Manage your reusable course assets</p>
                </div>
                <div>
                    <label className={`flex items-center gap-2 px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)] cursor-pointer transition-colors ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-full w-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No media files</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload something to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredFiles.map((file) => (
                        <div key={file.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center p-2">
                                {file.metadata?.mimetype?.startsWith('image/') && file.url ? (
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    getFileIcon(file.metadata?.mimetype)
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.metadata?.size ? (file.metadata.size / 1024 / 1024).toFixed(2) : '0')} MB</p>
                            </div>

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => copyToClipboard(file.url)}
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-[var(--md-primary)] hover:bg-gray-50"
                                    title="Copy URL"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(file.id)}
                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
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
