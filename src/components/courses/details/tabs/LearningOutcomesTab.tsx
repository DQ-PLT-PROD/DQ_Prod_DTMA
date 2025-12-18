import React from "react";
import { CheckCircleIcon } from "lucide-react";

export interface LearningOutcomesTabProps {
  outcomes: string[];
  skills?: string[];
  uponCompletion?: string;
}

const LearningOutcomesTab: React.FC<LearningOutcomesTabProps> = ({ outcomes, skills, uponCompletion }) => {
  const list = Array.isArray(outcomes) ? outcomes : [];
  const skillList = Array.isArray(skills) ? skills : [];
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg mb-6">
        What you'll learn from this course and the skills you'll develop.
      </p>
      {/* Core Learning Outcomes - simplified numbered list */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Core Learning Outcomes</h3>
        <ol className="space-y-3">
          {list.map((outcome, index) => (
            <li key={index} className="pl-2">
              <div className="flex items-start gap-3">
                <span className="text-gray-500 font-medium">{index + 1}.</span>
                <p className="text-gray-700 leading-relaxed">{outcome}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {/* Skills You'll Gain - compact two-column grid */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Skills You'll Gain</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {skillList.map((skill, index) => (
            <div key={index} className="flex items-center">
              <CheckCircleIcon size={16} className="text-green-600 mr-2 flex-shrink-0" />
              <span className="text-gray-700">{skill}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Upon Completion - single subtle highlight box */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Upon Completion</h3>
        {uponCompletion ? (
          <p className="text-gray-700 mb-3">{uponCompletion}</p>
        ) : (
          <p className="text-gray-700 mb-3">Course completion benefits will be provided by the training partner.</p>
        )}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
          Businesses report an average of 40% improvement in relevant metrics within 6 months of course completion.
        </div>
      </div>
    </div>
  );
};

export default LearningOutcomesTab;
