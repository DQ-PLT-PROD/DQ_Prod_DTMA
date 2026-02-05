import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, Search, ImageIcon, FilmIcon, FileIcon } from 'lucide-react';
import { listLibraryFiles, uploadToLibrary, MediaItem } from '../../lib/mediaService';
import { Toast } from '@/components/ui/Toast';

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    allowedTypes?: string[]; // e.g. ['image/']
}

export function MediaPickerModal({ isOpen, onClose, onSelect, allowedTypes }: MediaPickerModalProps) {
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            // Upload to library root
            const url = await uploadToLibrary(file);
            setToast({ type: 'success', message: 'File uploaded successfully' });

            // Reload and select
            await loadFiles();
            // Optional: Auto-select uploaded file? or just let user select.
            // onSelect(url);
            // onClose();
        } catch (error) {
            console.error('Upload failed', error);
            setToast({ type: 'error', message: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') });
        } finally {
            setUploading(false);
            e.target.value = '';
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
                    <label className={`flex items-center gap-2 px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)] cursor-pointer transition-colors ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredFiles.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => {
                                        if (file.url) {
                                            onSelect(file.url);
                                            onClose();
                                        }
                                    }}
                                    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-[var(--md-primary)] transition-all text-left"
                                >
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center p-2 relative">
                                        {file.metadata?.mimetype?.startsWith('image/') && file.url ? (
                                            <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-md" />
                                        ) : (
                                            getFileIcon(file.metadata?.mimetype)
                                        )}
                                        {/* Hover overlay hint */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <div className="p-2 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{(file.metadata?.size ? (file.metadata.size / 1024).toFixed(1) : '0')} KB</p>
                                    </div>
                                </button>
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
