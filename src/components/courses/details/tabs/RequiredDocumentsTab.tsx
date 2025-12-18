import React from "react";
import { FileText } from "lucide-react";

export interface RequiredDocumentsTabProps {
  documents?: string[];
}

const RequiredDocumentsTab: React.FC<RequiredDocumentsTabProps> = ({ documents }) => {
  const docs = Array.isArray(documents) ? documents : [];

  const fallback = [
    "Business Registration Certificate",
    "Trade License",
    "Financial Statements (last 2 years)",
    "Business Plan or Proposal",
  ];

  const list = docs.length > 0 ? docs : fallback;

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg mb-6">
        Prepare these documents to support your application and ensure a smooth process.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((doc, index) => (
            <div key={index} className="flex items-start">
              <FileText size={16} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{doc}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-gray-700 bg-amber-50 p-3 rounded border border-amber-100">
          <span className="font-medium text-amber-800">Note:</span> All documents must be submitted in PDF format. Documents in languages other than English or Arabic must be accompanied by certified translations.
        </div>
      </div>
    </div>
  );
};

export default RequiredDocumentsTab;
