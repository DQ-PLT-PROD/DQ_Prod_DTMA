import React from 'react';
import { BuildingIcon, PencilIcon, SaveIcon } from 'lucide-react';
import { profileConfig } from '../utils/profileConfig';

export function WelcomeStep({
    formData,
    errors,
    isEditingWelcome,
    editedFields,
    isRevisit,
    onInputChange,
    onToggleEdit
}) {
    const companyStageInfo = profileConfig.companyStages.find(
        stage => stage.id === formData.companyStage
    ) || profileConfig.companyStages[0];

    const welcomeFields = [
        { id: 'tradeName', label: 'Company Name', fieldName: 'tradeName', required: true, minLength: 2 },
        { id: 'industry', label: 'Industry', fieldName: 'industry', required: true },
        { id: 'contactName', label: 'Contact Name', fieldName: 'contactName', required: true, minLength: 3, pattern: '^[a-zA-Z\\s.-]+$' },
        { id: 'email', label: 'Email', fieldName: 'email', required: true, type: 'email' },
        { id: 'phone', label: 'Phone', fieldName: 'phone', required: true, type: 'tel' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-center">
                <div className="bg-blue-100 p-5 rounded-full">
                    <BuildingIcon size={44} className="text-blue-600" />
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    {isRevisit ? 'Review Your Onboarding Information' : 'Welcome to Enterprise Journey'}
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    {isRevisit
                        ? 'You can review and update your onboarding information at any time.'
                        : 'We already have some information from your sign-up. Please review it and complete a few additional details to get started.'}
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-medium text-gray-800">Your Information</h3>
                    <button
                        type="button"
                        onClick={onToggleEdit}
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        {isEditingWelcome ? (
                            <>
                                <SaveIcon size={16} className="mr-1" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <PencilIcon size={16} className="mr-1" />
                                Edit Information
                            </>
                        )}
                    </button>
                </div>

                {isEditingWelcome ? (
                    <div className="space-y-5">
                        {welcomeFields.map(field => (
                            <div key={field.id} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    {field.label}
                                    {field.required && <span className="ml-1 text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type || 'text'}
                                    value={formData[field.fieldName] || ''}
                                    onChange={e => onInputChange(field.fieldName, e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors[field.fieldName] ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                {errors[field.fieldName] && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors[field.fieldName]}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Company Stage
                            </label>
                            <select
                                value={formData.companyStage || 'startup'}
                                onChange={e => onInputChange('companyStage', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                {profileConfig.companyStages.map(stage => (
                                    <option key={stage.id} value={stage.id}>
                                        {stage.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[
                            { key: 'tradeName', label: 'Company Name' },
                            { key: 'industry', label: 'Industry' },
                            { key: 'companyStage', label: 'Company Stage', special: 'stage' },
                            { key: 'contactName', label: 'Contact Name' },
                            { key: 'email', label: 'Email' },
                            { key: 'phone', label: 'Phone' },
                        ].map(item => (
                            <div key={item.key} className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">{item.label}:</span>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-800 flex items-center">
                                        {item.special === 'stage' ? (
                                            <>
                                                {companyStageInfo.label || 'Not provided'}
                                                <span className={`ml-2 inline-block w-2 h-2 rounded-full ${companyStageInfo.color}`} />
                                            </>
                                        ) : (
                                            formData[item.key] || 'Not provided'
                                        )}
                                    </span>
                                    {editedFields[item.key] && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                            Updated
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                <p className="text-sm text-blue-700">
                    {isRevisit
                        ? 'You can navigate through all steps to review and update your information. Your changes will be saved automatically.'
                        : "We'll guide you through a few steps to complete your business profile. Your progress will be saved automatically."}
                </p>
            </div>
        </div>
    );
}