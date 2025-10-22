import React, { useState, useRef } from 'react';
import {
    UploadIcon,
    XIcon,
    FileIcon,
    CheckIcon,
    CalendarIcon,
} from 'lucide-react';
import { createDocument } from '../../services/DataverseService';
export function DocumentUpload({ onClose, onUpload, categories }: { onClose: () => void, onUpload: (document: any) => void, categories: string[]; }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        category: categories[0] || '',
        description: '',
        expiryDate: '',
        tags: '',
        isConfidential: false,
    });
    const [errors, setErrors] = useState<any>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    // Handle drag events
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e: any) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setFormData({
                ...formData,
                name: droppedFile.name.split('.')[0],
            });
        }
    };
    // Handle file input change
    const handleFileChange = (e: any) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFormData({
                ...formData,
                name: selectedFile.name.split('.')[0],
            });
        }
    };
    // Handle form input changes
    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    // Get file type from extension
    const getFileType = (filename: any) => {
        if (!filename) return 'file';
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
        if (['ppt', 'pptx'].includes(ext)) return 'presentation';
        if (['doc', 'docx', 'txt'].includes(ext)) return 'document';
        return 'file';
    };
    // Format file size
    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    // Upload file to API and save metadata to Dataverse
    const uploadToAzure = async () => {
        try {
            setIsUploading(true);
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return 95;
                    }
                    return prev + 5;
                });
            }, 200);
            // Prepare multipart form data and call serverless API
            const form = new FormData();
            form.append('file', file);
            const response = await fetch('/api/storage/upload/upload', {
                method: 'POST',
                body: form,
            });
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            const result = await response.json();
            const fileUrl = (result?.urls && result.urls[0]) || result?.url;
            // Create document metadata in Dataverse
            const newDocument = {
                name: formData.name,
                category: formData.category,
                description: formData.description,
                expiryDate: formData.expiryDate || null,
                tags: formData.tags
                    .split()
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                isConfidential: formData.isConfidential,
                fileType: getFileType(file.name),
                fileSize: formatFileSize(file.size),
                uploadDate: new Date().toISOString().split('T')[0],
                uploadedBy: 'John Smith',
                status: 'Active',
                fileUrl: fileUrl,
                versionNumber: 1,
            };
            // Save metadata to Dataverse
            await createDocument(newDocument as any);
            // Complete the progress
            clearInterval(progressInterval);
            setUploadProgress(100);
            // Wait a moment to show the 100% completion state
            setTimeout(() => {
                setIsUploading(false);
                onUpload(newDocument);
            }, 500);
        } catch (error) {
            console.error('Error uploading document:', error);
            setIsUploading(false);
            setErrors({
                ...errors,
                submit: 'Failed to upload document. Please try again.',
            });
        }
    };
    // Validate form
    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = 'Document name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!file) newErrors.file = 'Please upload a file';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Handle form submission
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (validateForm()) {
            await uploadToAzure();
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Upload Document
                    </h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        <XIcon size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    {/* File Upload */}
                    {!file ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer mb-6 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                            // @ts-ignore
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <UploadIcon
                                size={32}
                                className={isDragging ? 'text-blue-500' : 'text-gray-400'}
                            />
                            <p className="mt-2 text-sm text-gray-600 text-center">
                                <span className="font-medium text-blue-600">
                                    Click to upload
                                </span>{' '}
                                or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                                PDF, Word, Excel, PowerPoint, or image files (max 10MB)
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                            />
                            {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <div className="flex items-center">
                                <FileIcon size={24} className="text-gray-500 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-red-500"
                                    onClick={() => setFile(null)}
                                >
                                    <XIcon size={16} />
                                </button>
                            </div>
                            {uploadProgress > 0 && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-500">
                                            {uploadProgress}%
                                        </span>
                                        {uploadProgress === 100 && (
                                            <span className="text-xs text-green-500 flex items-center">
                                                <CheckIcon size={12} className="mr-1" /> Complete
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Document Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document Name*
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category*
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <CalendarIcon size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="e.g. license, registration, compliance"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isConfidential"
                                    checked={formData.isConfidential}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Mark as confidential
                                </span>
                            </label>
                        </div>
                        {errors.submit && (
                            <div className="col-span-2">
                                <p className="text-red-500 text-sm">{errors.submit}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={onClose}
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
