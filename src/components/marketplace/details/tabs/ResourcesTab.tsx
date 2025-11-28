import React from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

interface Resource {
    id: string;
    title: string;
    type: "pdf" | "link" | "video";
    url: string;
    size?: string;
    date?: string;
}

const MOCK_RESOURCES: Resource[] = [
    {
        id: "r1",
        title: "Course Syllabus",
        type: "pdf",
        url: "#",
        size: "2.4 MB",
        date: "Updated 2 days ago"
    },
    {
        id: "r2",
        title: "Economy 4.0 Whitepaper",
        type: "pdf",
        url: "#",
        size: "1.8 MB",
        date: "Updated 1 week ago"
    },
    {
        id: "r3",
        title: "Digital Transformation Guide",
        type: "link",
        url: "#",
        date: "Updated 2 weeks ago"
    },
];

const ResourcesTab: React.FC = () => {
    const handleDownload = (resource: Resource) => {
        if (resource.type === 'link') {
            window.open(resource.url, '_blank');
        } else {
            // Create dummy content for demonstration
            const content = `This is a placeholder file for ${resource.title}.\n\nIn a real application, this would be the actual file downloaded from the server.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resource.title.replace(/\s+/g, '_')}.txt`; // Using .txt for demo as content is text
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Course Resources</h3>
                <p className="text-gray-600 mb-6">
                    Access downloadable materials to support your learning journey.
                </p>

                <div className="grid gap-4">
                    {MOCK_RESOURCES.map((resource) => (
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
                                        {resource.size && (
                                            <>
                                                <span>{resource.size}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        <span>{resource.date}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(resource)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                aria-label={`Download ${resource.title}`}
                            >
                                {resource.type === "link" ? (
                                    <ExternalLink size={20} />
                                ) : (
                                    <Download size={20} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResourcesTab;
