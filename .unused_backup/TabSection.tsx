import React, { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
    SaveIcon,
    XIcon,
    AlertCircleIcon,
} from 'lucide-react';
import { isFieldMandatory } from '../../utils/config';
export function TabSection({
    config,
    data,
    completion,
    companyStage,
    mandatoryCompletion,
}) {
    // Track expanded sections and edit mode
    const [expandedSections, setExpandedSections] = useState([0]);
    const [editingSections, setEditingSections] = useState<any>([]);
    // Toggle section expansion
    const toggleSection = (index) => {
        if (expandedSections.includes(index)) {
            setExpandedSections(expandedSections.filter((i) => i !== index));
        } else {
            setExpandedSections([...expandedSections, index]);
        }
    };
    // Toggle edit mode for a section
    const toggleEditMode = (index, event) => {
        event.stopPropagation();
        if (editingSections.includes(index)) {
            setEditingSections(editingSections.filter((i) => i !== index));
        } else {
            setEditingSections([...editingSections, index]);
        }
    };
    // Calculate completion for a group
    const calculateGroupCompletion = (group) => {
        if (!data || !data.fields) return 0;
        let completedFields = 0;
        let totalFields = 0;
        group.fields.forEach((field) => {
            totalFields++;
            if (
                data.fields[field.fieldName] &&
                data.fields[field.fieldName].trim() !== ''
            ) {
                completedFields++;
            }
        });
        return Math.round((completedFields / totalFields) * 100);
    };
    // Calculate mandatory completion for a group
    const calculateGroupMandatoryCompletion = (group) => {
        if (!data || !data.fields || !companyStage)
            return {
                completed: 0,
                total: 0,
                percentage: 0,
            };
        let mandatoryFields = 0;
        let completedMandatory = 0;
        group.fields.forEach((field) => {
            if (isFieldMandatory(field, companyStage)) {
                mandatoryFields++;
                if (
                    data.fields[field.fieldName] &&
                    data.fields[field.fieldName].trim() !== ''
                ) {
                    completedMandatory++;
                }
            }
        });
        return {
            completed: completedMandatory,
            total: mandatoryFields,
            percentage:
                mandatoryFields > 0
                    ? Math.round((completedMandatory / mandatoryFields) * 100)
                    : 100,
        };
    };
    // Check if a field is mandatory for the current company stage
    const checkIfMandatory = (field) => {
        if (!companyStage) return false;
        return isFieldMandatory(field, companyStage);
    };
    // Check if a mandatory field is missing
    const isMandatoryFieldMissing = (field) => {
        if (!companyStage || !checkIfMandatory(field)) return false;
        return (
            !data.fields[field.fieldName] ||
            data.fields[field.fieldName].trim() === ''
        );
    };
    return (
        <div className="space-y-4">
            {config.map((group, groupIndex) => {
                const isExpanded = expandedSections.includes(groupIndex);
                const isEditing = editingSections.includes(groupIndex);
                const groupCompletion = calculateGroupCompletion(group);
                const groupMandatoryCompletion =
                    calculateGroupMandatoryCompletion(group);
                // Check if group has any mandatory fields
                const hasMandatoryFields = group.fields.some((field) =>
                    checkIfMandatory(field),
                );
                // Check if group has missing mandatory fields
                const hasMissingMandatory =
                    hasMandatoryFields && groupMandatoryCompletion.percentage < 100;
                return (
                    <div
                        key={groupIndex}
                        className={`rounded-lg border overflow-hidden transition-all ${hasMissingMandatory ? 'border-amber-300' : 'border-gray-200'} ${isExpanded ? 'shadow-sm' : 'bg-gray-50'}`}
                    >
                        <div
                            className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 cursor-pointer hover:bg-gray-50 min-h-[48px] ${isExpanded ? 'border-b border-gray-200' : ''} ${hasMissingMandatory ? 'bg-amber-50' : ''}`}
                            onClick={() => toggleSection(groupIndex)}
                            role="button"
                            aria-expanded={isExpanded}
                            aria-controls={`section-${groupIndex}-content`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <div className="flex items-center">
                                    <h3 className="font-medium text-gray-700 mb-1 sm:mb-0 text-sm sm:text-base break-words">
                                        {group.groupName}
                                    </h3>
                                    {hasMandatoryFields && (
                                        <div className="ml-2 flex items-center">
                                            {groupMandatoryCompletion.percentage === 100 ? (
                                                <span className="flex items-center text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                                    <CheckCircleIcon
                                                        size={14}
                                                        className="mr-1 flex-shrink-0"
                                                    />
                                                    <span className="truncate">Complete</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1 flex-shrink-0"></span>
                                                    <span className="truncate">
                                                        Required: {groupMandatoryCompletion.completed}/
                                                        {groupMandatoryCompletion.total}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="sm:ml-3 flex items-center mt-2 sm:mt-0">
                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${groupCompletion === 100 ? 'bg-green-500' : groupCompletion >= 70 ? 'bg-blue-500' : groupCompletion >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{
                                                width: `${groupCompletion}%`,
                                            }}
                                            aria-valuenow={groupCompletion}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            role="progressbar"
                                        ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-gray-500">
                                        {groupCompletion}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0">
                                {!isEditing && isExpanded && (
                                    <button
                                        className="mr-3 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 min-h-[32px]"
                                        onClick={(e) => toggleEditMode(groupIndex, e)}
                                        aria-label={`Edit ${group.groupName} section`}
                                    >
                                        Edit Section
                                    </button>
                                )}
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronUpIcon size={16} />
                                    ) : (
                                        <ChevronDownIcon size={16} />
                                    )}
                                </div>
                            </div>
                        </div>
                        {isExpanded && (
                            <div
                                className="p-3 sm:p-4 bg-white"
                                id={`section-${groupIndex}-content`}
                            >
                                {group.fields.length > 0 ? (
                                    <div className="space-y-3">
                                        {group.fields.map((field, fieldIndex) => {
                                            const fieldValue = data?.fields?.[field.fieldName] || '';
                                            const fieldStatus = data?.status?.[field.fieldName] || '';
                                            const isMandatory = checkIfMandatory(field);
                                            const isMissing = isMandatoryFieldMissing(field);
                                            return (
                                                <div
                                                    key={fieldIndex}
                                                    className={`flex flex-col py-1 ${isMissing ? 'border border-red-200 bg-red-50 rounded px-2 sm:px-3 py-2' : ''}`}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                                        <div className="text-sm flex-shrink-0 sm:w-1/3 pr-2 sm:pr-4 mb-1 sm:mb-0">
                                                            <span
                                                                className={`${isMandatory ? 'text-gray-700 font-medium' : 'text-gray-500'} break-words`}
                                                            >
                                                                {field.label}
                                                            </span>
                                                            {isMandatory && (
                                                                <span className="ml-1 text-red-500">*</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    className={`w-full text-sm border rounded px-3 py-2 min-h-[44px] ${isMissing ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                                                    defaultValue={fieldValue}
                                                                    placeholder={
                                                                        isMandatory ? 'Required' : 'Optional'
                                                                    }
                                                                    aria-required={isMandatory}
                                                                    aria-invalid={isMissing}
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div
                                                                        className={`text-sm ${!fieldValue ? 'text-gray-400 italic' : 'text-gray-800'} break-words`}
                                                                    >
                                                                        {fieldValue ||
                                                                            (isMandatory
                                                                                ? 'Not provided'
                                                                                : 'Not provided')}
                                                                    </div>
                                                                    {fieldStatus === 'completed' && (
                                                                        <CheckCircleIcon
                                                                            size={12}
                                                                            className="text-green-500 flex-shrink-0 ml-2"
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isMissing && !isEditing && (
                                                        <div className="sm:ml-[33%] mt-1">
                                                            <p className="text-xs text-red-600">
                                                                This field is required for your company stage
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-gray-500 italic">
                                        No fields defined for this group
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 border-t border-gray-100 pt-4">
                                        <button
                                            className="px-3 py-2 text-sm font-medium text-gray-600 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center min-h-[44px]"
                                            onClick={(e) => toggleEditMode(groupIndex, e)}
                                            aria-label="Cancel editing"
                                        >
                                            <XIcon size={16} className="mr-1" />
                                            Cancel
                                        </button>
                                        <button
                                            className="px-3 py-2 text-sm font-medium text-white rounded bg-blue-600 hover:bg-blue-700 flex items-center justify-center min-h-[44px]"
                                            onClick={(e) => toggleEditMode(groupIndex, e)}
                                            aria-label="Save changes"
                                        >
                                            <SaveIcon size={16} className="mr-1" />
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            {/* Empty state when no groups are available */}
            {(!config || config.length === 0) && (
                <div className="py-8 sm:py-10 md:py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 px-4">
                        No data groups defined for this section
                    </p>
                </div>
            )}
        </div>
    );
}
