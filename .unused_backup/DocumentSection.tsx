import React, { useState, useRef } from 'react';
import { FileIcon, FileTextIcon, ImageIcon, FileSpreadsheetIcon, DownloadIcon, TrashIcon, UploadIcon, XIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
export function DocumentSection({
    title,
    documents
}) {
    const [docs, setDocs] = useState(documents);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<any>([]);
    const fileInputRef = useRef(null);
    // Get icon based on file type
    const getFileIcon = type => {
        switch (type) {
            case 'pdf':
                return <FileTextIcon size={16} className="text-red-500" />;
            case 'image':
                return <ImageIcon size={16} className="text-blue-500" />;
            case 'spreadsheet':
                return <FileSpreadsheetIcon size={16} className="text-green-500" />;
            case 'presentation':
                return <div className="text-orange-500" />;
            default:
                return <FileIcon size={16} className="text-gray-500" />;
        }
    };
    // Get color based on status
    const getStatusColor = status => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Handle file input change
    const handleFileChange = e => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };
    // Handle drag and drop
    const handleDragOver = e => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = e => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };
    // Process files
    const handleFiles = files => {
        const newUploadingFiles = files.map(file => ({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: getFileType(file.name),
            size: formatFileSize(file.size),
            progress: 0,
            status: 'uploading'
        }));
        setUploadingFiles([...uploadingFiles, ...newUploadingFiles]);
        // Simulate upload progress
        newUploadingFiles.forEach(file => {
            simulateUpload(file.id);
        });
    };
    // Simulate file upload
    const simulateUpload = fileId => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                clearInterval(interval);
                progress = 100;
                // Add to documents after "upload" completes
                setUploadingFiles((prev: any) => prev.map(file => file.id === fileId ? {
                    ...file,
                    progress,
                    status: 'complete'
                } : file));
                setTimeout(() => {
                    const uploadedFile: any = uploadingFiles.find((file: any) => file.id === fileId);
                    if (uploadedFile) {
                        const newDoc = {
                            id: fileId,
                            name: uploadedFile.name,
                            type: uploadedFile.type,
                            size: uploadedFile.size,
                            uploadDate: new Date().toLocaleDateString(),
                            status: 'Pending'
                        };
                        setDocs([...docs, newDoc]);
                        // Remove from uploading files
                        setUploadingFiles(prev => prev.filter((file: any) => file.id !== fileId));
                    }
                }, 1000);
            } else {
                setUploadingFiles((prev: any) => prev.map(file => file.id === fileId ? {
                    ...file,
                    progress
                } : file));
            }
        }, 300);
    };
    // Get file type from extension
    const getFileType = filename => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
        if (['ppt', 'pptx'].includes(ext)) return 'presentation';
        if (['doc', 'docx', 'txt'].includes(ext)) return 'document';
        return 'file';
    };
    // Format file size
    const formatFileSize = bytes => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    // Handle document deletion
    const handleDeleteDocument = id => {
        setDocs(docs.filter(doc => doc.id !== id));
    };
    return <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h3 className="font-medium text-gray-700">{title}</h3>
        </div>
        {/* Upload area */}
        <div className={`p-4 sm:p-6 border-b border-gray-200 ${isDragging ? 'bg-blue-50' : 'bg-white'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {/**@ts-ignore */}
            <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer min-h-[120px] ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`} onClick={() => fileInputRef.current.click()}>
                <UploadIcon size={24} className={isDragging ? 'text-blue-500' : 'text-gray-400'} />
                <p className="mt-2 text-sm text-gray-600 text-center">
                    <span className="font-medium text-blue-600">Click to upload</span>{' '}
                    or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1 text-center">
                    PDF, Word, Excel, PowerPoint, or image files
                </p>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
            </div>
        </div>
        {/* Uploading files */}
        {uploadingFiles.length > 0 && <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
                Uploading {uploadingFiles.length} file(s)
            </h4>
            <div className="space-y-3">
                {uploadingFiles.map((file: any) => <div key={file.id} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <span className="ml-2 text-sm text-gray-700 truncate flex-1">
                            {file.name}
                        </span>
                        <span className="text-xs text-gray-500">{file.size}</span>
                    </div>
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{
                                width: `${file.progress}%`
                            }}></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                                {file.progress}%
                            </span>
                            {file.status === 'complete' && <span className="text-xs text-green-500 flex items-center">
                                <CheckIcon size={12} className="mr-1" /> Complete
                            </span>}
                        </div>
                    </div>
                </div>)}
            </div>
        </div>}
        {/* Document list - Desktop */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">

                <tbody className="bg-white divide-y divide-gray-200">
                    {docs.map(doc => <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                                {getFileIcon(doc.type)}
                                <span className="ml-2 text-sm text-gray-700">
                                    {doc.name}
                                </span>
                            </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {doc.uploadDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {doc.size}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                                {doc.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-gray-500 hover:text-blue-600 mr-3 p-2">
                                <DownloadIcon size={16} />
                            </button>
                            <button className="text-gray-500 hover:text-red-600 p-2" onClick={() => handleDeleteDocument(doc.id)}>
                                <TrashIcon size={16} />
                            </button>
                        </td>
                    </tr>)}
                    {docs.length === 0 && <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <AlertCircleIcon size={24} className="text-gray-400 mb-2" />
                                <p>No documents uploaded yet</p>
                            </div>
                        </td>
                    </tr>}
                </tbody>
            </table>
        </div>
        {/* Document list - Mobile */}
        <div className="md:hidden">
            {docs.length === 0 ? <div className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                    <AlertCircleIcon size={24} className="text-gray-400 mb-2" />
                    <p>No documents uploaded yet</p>
                </div>
            </div> : docs.map(doc => <div key={doc.id} className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-2">
                    {getFileIcon(doc.type)}
                    <span className="ml-2 text-sm font-medium text-gray-700 truncate flex-1">
                        {doc.name}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 mb-3">
                    <div className="text-xs text-gray-500">Upload Date:</div>
                    <div className="text-xs text-gray-700">{doc.uploadDate}</div>
                    <div className="text-xs text-gray-500">Size:</div>
                    <div className="text-xs text-gray-700">{doc.size}</div>
                    <div className="text-xs text-gray-500">Status:</div>
                    <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                            {doc.status}
                        </span>
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 min-h-[44px] min-w-[44px]">
                        <DownloadIcon size={16} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 min-h-[44px] min-w-[44px]" onClick={() => handleDeleteDocument(doc.id)}>
                        <TrashIcon size={16} />
                    </button>
                </div>
            </div>)}
        </div>
    </div>;
}