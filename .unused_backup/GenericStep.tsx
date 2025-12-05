/**
 * Generic Step Component
 *
 * This component renders a generic step in the multistep form.
 * It displays sections and fields based on the step configuration.
 *
 * @module onboarding-form/steps/GenericStep
 */

import {ErrorsState, FormData, Step, TouchedFields} from '../types/formData';
import {FieldRenderer} from '../components/FieldRenderer';

/**
 * Props for the GenericStep component
 */
interface GenericStepProps {
    stepData: Step; // Configuration for this step
    formData: FormData; // Current form data
    errors: ErrorsState; // Validation errors
    touchedFields: TouchedFields; // Fields that have been touched
    onChange: (fieldName: string, value: any) => void; // Handler for field changes
    validateField: (fieldName: string, value: any) => boolean | null; // Field validation function
}

/**
 * Component for rendering a generic form step
 */
export const GenericStep: React.FC<GenericStepProps> = ({
                                                            stepData, formData,
                                                            errors,
                                                            touchedFields,
                                                            onChange,
                                                            validateField,
                                                        }) => {
    return (
        <div className="space-y-8">
            {/* Step Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {stepData.title}
                </h2>
                <p className="text-gray-600">
                    Please provide the following essential details
                </p>
            </div>
            {/* Step Content - Sections or Fields */}
            {stepData.sections ? (
                // Render sections if available
                <div className="space-y-10">
                    {stepData.sections.map((section, index) => (
                        <div key={index} className="space-y-6">
                            {/* Section Header */}
                            <div className="border-b border-gray-200 pb-2">
                                <h3 className="text-lg font-medium text-gray-800">
                                    {section.title}
                                </h3>
                                {section.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {section.description}
                                    </p>
                                )}
                            </div>
                            {/* Section Fields */}
                            <div className="grid grid-cols-1 gap-6">
                                {section.fields.map((field) => (
                                    <FieldRenderer
                                        key={field.id}
                                        field={field}
                                        formData={formData}
                                        errors={errors}
                                        touchedFields={touchedFields}
                                        onChange={onChange}
                                        validateField={validateField}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : stepData.fields ? (
                // Render fields directly if no sections
                <div className="grid grid-cols-1 gap-6">
                    {stepData.fields.map((field) => (
                        <FieldRenderer
                            key={field.id}
                            field={field}
                            formData={formData}
                            errors={errors}
                            touchedFields={touchedFields}
                            onChange={onChange}
                            validateField={validateField}
                        />
                    ))}
                </div>
            ) : (
                // Fallback if no fields or sections defined
                <div className="text-center text-gray-500">
                    No fields defined for this step
                </div>
            )}
        </div>
    );
};
