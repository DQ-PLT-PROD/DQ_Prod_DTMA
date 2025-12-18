import React from "react";

export interface ApplicationProcessTabProps {
  process?: { title: string; description: string }[];
}

const ApplicationProcessTab: React.FC<ApplicationProcessTabProps> = ({ process }) => {
  const steps = Array.isArray(process) ? process : [];
  const fallback = [
    { title: "Submit Application", description: "Complete the online application form with your business details and required information." },
    { title: "Document Verification", description: "Upload required documents for verification and wait for our team to review them." },
    { title: "Review & Approval", description: "Our team will review your application and contact you with a decision within 5-7 business days." },
  ];
  // If steps are fewer than 3, prefer the default fallback flow
  const list = steps.length >= 3 ? steps : fallback;

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg mb-6">Follow these simple steps to complete your application.</p>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="space-y-3">
          {list.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-gray-500 font-medium">{index + 1}.</span>
              <div>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationProcessTab;
