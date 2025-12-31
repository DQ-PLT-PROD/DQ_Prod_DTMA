import React from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

export interface Resource {
    id: string;
    title: string;
    type: string;
    description?: string;
    resourceUrl: string;
    fileSizeBytes?: number;
    orderIndex: number;
}

interface ResourcesTabProps {
    resources?: Resource[];
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources = [] }) => {
    // Extract filename from URL for download attribute
    const getDownloadName = (resource: Resource): string => {
        try {
            const url = new URL(resource.resourceUrl);
            const pathParts = url.pathname.split('/');
            const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
            return filename || `${resource.title}.${resource.type}`;
        } catch {
            return `${resource.title}.${resource.type}`;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Course Resources</h3>
                {resources.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No resources available for this course yet.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 mb-6">
                            Access downloadable materials to support your learning journey.
                        </p>

                        <div className="grid gap-4">
                            {resources.map((resource) => (
                                <div
                                    key={resource.id}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                {resource.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="uppercase font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                    {resource.type}
                                                </span>
                                                {resource.fileSizeBytes && (
                                                    <>
                                                        <span>{(resource.fileSizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                <span>{resource.description || "Resource"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {resource.type === "link" || resource.type === "url" ? (
                                        <a
                                            href={resource.resourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            aria-label={`Open ${resource.title}`}
                                        >
                                            <ExternalLink size={20} />
                                        </a>
                                    ) : (
                                        <a
                                            href={resource.resourceUrl}
                                            download={getDownloadName(resource)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            aria-label={`Download ${resource.title}`}
                                        >
                                            <Download size={20} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResourcesTab;
