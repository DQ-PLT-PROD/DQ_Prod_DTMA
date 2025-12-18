import React from "react";
import { CheckCircleIcon } from "lucide-react";

export interface EligibilityTermsTabProps {
  item: any;
  providerName: string;
}

const EligibilityTermsTab: React.FC<EligibilityTermsTabProps> = ({ item, providerName }) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg mb-6">
        Review eligibility requirements and terms & conditions for this service.
      </p>
      {/* Eligibility Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Eligibility Requirements</h3>
        <ul className="space-y-2">
          {item.eligibilityCriteria ? (
            item.eligibilityCriteria.map((criteria: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon size={16} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{criteria}</span>
              </li>
            ))
          ) : (
            <li className="flex items-start">
              <CheckCircleIcon size={16} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-700">
                {item.eligibility || `Businesses at the ${item.businessStage || "growth"} stage`}
              </span>
            </li>
          )}
        </ul>
        <div className="mt-6 bg-blue-50 rounded-lg p-3">
          <h4 className="text-md font-medium text-blue-800 mb-2">Not sure if you qualify?</h4>
          <p className="text-gray-700 mb-3 text-sm">
            Contact {providerName} for a preliminary eligibility assessment before submitting your full application.
          </p>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">Contact Provider</button>
        </div>
      </div>
      {/* Terms Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h3>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Key Terms</h4>
        <p className="text-gray-700 mb-4">
          {item.keyTerms ||
            "Zero interest rate with a grace period of 12 months. Repayment in equal monthly installments over the loan tenure. Early settlement allowed without penalties after 24 months."}
        </p>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Terms</h4>
        <ul className="space-y-2">
          {item.additionalTerms ? (
            item.additionalTerms.map((term: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-700">{term}</span>
              </li>
            ))
          ) : (
            <>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-700">Collateral requirements will be determined based on loan amount and business risk profile</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-700">Late payment penalties may apply as per the final loan agreement</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-700">Prepayment options available subject to terms outlined in the loan agreement</span>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="text-sm text-gray-500 italic">
        The information provided here is a summary of key terms and conditions. The full terms and conditions will be
        provided in the final agreement. {providerName} reserves the right to modify these terms at their discretion.
      </div>
    </div>
  );
};

export default EligibilityTermsTab;
