// steps/ReviewStep.js
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { profileConfig } from '../utils/profileConfig';

export function ReviewStep({ formData, isRevisit }) {
    const companyStageInfo = profileConfig.companyStages.find(
        stage => stage.id === formData.companyStage
    ) || profileConfig.companyStages[0];

    const dataGroups = [
        {
            title: 'Company Information',
            fields: [
                { label: 'Company Name', value: formData.tradeName },
                { label: 'Industry', value: formData.industry },
                { label: 'Business Size', value: formData.businessSize },
                { label: 'Registration Number', value: formData.registrationNumber },
                { label: 'Establishment Date', value: formData.establishmentDate },
                {
                    label: 'Company Stage',
                    value: companyStageInfo.label,
                    badge: <span className={`ml-2 inline-block w-2 h-2 rounded-full ${companyStageInfo.color}`} />
                },
            ],
        },
        {
            title: 'Business Profile',
            fields: [
                { label: 'Business Pitch', value: formData.businessPitch },
                { label: 'Problem Statement', value: formData.problemStatement },
            ],
        },
        {
            title: 'Location & Contact',
            fields: [
                { label: 'Address', value: formData.address },
                { label: 'City', value: formData.city },
                { label: 'Country', value: formData.country },
                { label: 'Website', value: formData.website },
                { label: 'Phone', value: formData.phone },
                { label: 'Email', value: formData.email },
            ],
        },
        {
            title: 'Operations',
            fields: [
                { label: 'Employee Count', value: formData.employeeCount },
                { label: 'Founders', value: formData.founders },
                { label: 'Founding Year', value: formData.foundingYear },
            ],
        },
        {
            title: 'Funding & Needs',
            fields: [
                { label: 'Initial Capital (AED)', value: formData.initialCapital },
                { label: 'Funding Needs (AED)', value: formData.fundingNeeds },
                { label: 'Business Needs', value: formData.needsList },
            ],
        },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <div className="flex justify-center mb-5">
                    <div className="bg-green-100 p-5 rounded-full">
                        <CheckIcon size={36} className="text-green-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    {isRevisit ? 'Review Your Information' : 'Almost Done!'}
                </h2>
                <p className="text-gray-600">
                    {isRevisit
                        ? "Here's a summary of all your onboarding information. You can go back to any section to make changes."
                        : 'Please review your information before completing onboarding.'}
                </p>
            </div>

            <div className="space-y-6">
                {dataGroups.map((group, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                            <h3 className="font-medium text-gray-700">{group.title}</h3>
                        </div>
                        <div className="p-5">
                            <dl className="grid grid-cols-1 gap-4">
                                {group.fields.map((field, fieldIndex) =>
                                    field.value ? (
                                        <div key={fieldIndex} className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">{field.label}:</dt>
                                            <dd className="text-sm text-gray-800 text-right flex items-center justify-end max-w-xs">
                                                <span className="break-words">{field.value}</span>
                                                {field.badge}
                                            </dd>
                                        </div>
                                    ) : null
                                )}
                            </dl>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mt-6">
                <p className="text-sm text-blue-700 text-center">
                    {isRevisit
                        ? 'You can update your information at any time by navigating to the Onboarding section from the sidebar.'
                        : "After completing onboarding, you'll be able to add more details to your company profile."}
                </p>
            </div>
        </div>
    );
}
