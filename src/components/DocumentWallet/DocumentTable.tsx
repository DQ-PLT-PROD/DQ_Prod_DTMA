// ✅ CHANGES MADE:
// - Replaced `md:` with `lg:` so desktop mode starts at 1024px
// - Mobile/card layout now applies to iPad/tablet screens too

import React, { useState } from 'react';
import {
    FileTextIcon,
    FileIcon,
    ImageIcon,
    FileSpreadsheetIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronRightIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
} from 'lucide-react';

export function DocumentTable({
    documents,
    onViewDocument,
}: {
    documents: any;
    onViewDocument: (document: any) => void;
}) {
    const [sortField, setSortField] = useState('uploadDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [expandedRows, setExpandedRows] = useState<any[]>([]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedDocuments = [...documents].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'uploadDate' || sortField === 'expiryDate') {
            aValue = aValue ? new Date(aValue).getTime() : 0;
            bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleRowExpansion = (id: string) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter((rowId) => rowId !== id));
        } else {
            setExpandedRows([...expandedRows, id]);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileTextIcon size={16} className="text-red-500" />;
            case 'image':
                return <ImageIcon size={16} className="text-blue-500" />;
            case 'spreadsheet':
                return <FileSpreadsheetIcon size={16} className="text-green-500" />;
            default:
                return <FileIcon size={16} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isExpiringSoon = (expiryDate: string) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* ✅ Desktop view now hidden until lg (1024px+) */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Document Name
                                    {sortField === 'name' &&
                                        (sortDirection === 'asc' ? (
                                            <ArrowUpIcon size={14} className="ml-1" />
                                        ) : (
                                            <ArrowDownIcon size={14} className="ml-1" />
                                        ))}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('category')}
                            >
                                <div className="flex items-center">
                                    Category
                                    {sortField === 'category' &&
                                        (sortDirection === 'asc' ? (
                                            <ArrowUpIcon size={14} className="ml-1" />
                                        ) : (
                                            <ArrowDownIcon size={14} className="ml-1" />
                                        ))}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('uploadDate')}
                            >
                                <div className="flex items-center">
                                    Upload Date
                                    {sortField === 'uploadDate' &&
                                        (sortDirection === 'asc' ? (
                                            <ArrowUpIcon size={14} className="ml-1" />
                                        ) : (
                                            <ArrowDownIcon size={14} className="ml-1" />
                                        ))}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('expiryDate')}
                            >
                                <div className="flex items-center">
                                    Expiry Date
                                    {sortField === 'expiryDate' &&
                                        (sortDirection === 'asc' ? (
                                            <ArrowUpIcon size={14} className="ml-1" />
                                        ) : (
                                            <ArrowDownIcon size={14} className="ml-1" />
                                        ))}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center">
                                    Status
                                    {sortField === 'status' &&
                                        (sortDirection === 'asc' ? (
                                            <ArrowUpIcon size={14} className="ml-1" />
                                        ) : (
                                            <ArrowDownIcon size={14} className="ml-1" />
                                        ))}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedDocuments.length > 0 ? (
                            sortedDocuments.map((doc: any) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getFileIcon(doc.fileType)}
                                            <span className="ml-2 text-sm text-gray-700">
                                                {doc.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {doc.category}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(doc.uploadDate)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        {doc.expiryDate ? (
                                            <span
                                                className={
                                                    isExpiringSoon(doc.expiryDate)
                                                        ? 'text-yellow-600 font-medium'
                                                        : 'text-gray-700'
                                                }
                                            >
                                                {formatDate(doc.expiryDate)}
                                                {isExpiringSoon(doc.expiryDate) && ' (Soon)'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2.5 py-1 text-xs rounded-full ${getStatusColor(
                                                doc.status
                                            )}`}
                                        >
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-800 px-2 py-1"
                                            onClick={() => onViewDocument(doc)}
                                        >
                                            <EyeIcon size={16} className="inline mr-1" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No documents found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ Mobile + Tablet (up to 1023px) */}
            <div className="lg:hidden">
                {sortedDocuments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {sortedDocuments.map((doc: any) => (
                            <div key={doc.id} className="bg-white">
                                <div
                                    className="p-4 active:bg-gray-50 cursor-pointer"
                                    onClick={() => toggleRowExpansion(doc.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start flex-1 min-w-0">
                                            <div className="mt-0.5 mr-3 flex-shrink-0">
                                                {getFileIcon(doc.fileType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-800 truncate">
                                                    {doc.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {doc.category}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-shrink-0">
                                            {expandedRows.includes(doc.id) ? (
                                                <ChevronUpIcon size={20} className="text-gray-400" />
                                            ) : (
                                                <ChevronRightIcon
                                                    size={20}
                                                    className="text-gray-400"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span
                                            className={`px-2.5 py-1 text-xs rounded-full ${getStatusColor(
                                                doc.status
                                            )}`}
                                        >
                                            {doc.status}
                                        </span>
                                        {doc.expiryDate && (
                                            <div className="flex items-center">
                                                <CalendarIcon
                                                    size={12}
                                                    className="text-gray-400 mr-1.5"
                                                />
                                                <span
                                                    className={`text-xs ${isExpiringSoon(doc.expiryDate)
                                                        ? 'text-yellow-600 font-medium'
                                                        : 'text-gray-500'
                                                        }`}
                                                >
                                                    {isExpiringSoon(doc.expiryDate)
                                                        ? 'Expires soon'
                                                        : 'Expires'}
                                                    : {formatDate(doc.expiryDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {expandedRows.includes(doc.id) && (
                                    <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-3 py-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 flex items-center">
                                                    <CalendarIcon
                                                        size={12}
                                                        className="mr-1.5"
                                                    />{' '}
                                                    Upload Date
                                                </p>
                                                <p className="text-sm">
                                                    {formatDate(doc.uploadDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 flex items-center">
                                                    <UserIcon
                                                        size={12}
                                                        className="mr-1.5"
                                                    />{' '}
                                                    Uploaded By
                                                </p>
                                                <p className="text-sm">{doc.uploadedBy}</p>
                                            </div>
                                        </div>
                                        {doc.tags && doc.tags.length > 0 && (
                                            <div className="mb-3 pt-1">
                                                <p className="text-xs text-gray-500 mb-1.5 flex items-center">
                                                    <TagIcon
                                                        size={12}
                                                        className="mr-1.5"
                                                    />{' '}
                                                    Tags
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {doc.tags.map((tag: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            className="w-full mt-3 py-3 flex items-center justify-center text-sm text-blue-600 border border-blue-200 rounded-md bg-white hover:bg-blue-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDocument(doc);
                                            }}
                                        >
                                            <EyeIcon size={16} className="mr-2" /> View
                                            Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No documents found
                    </div>
                )}
            </div>
        </div>
    );
}
