import React, { Component } from 'react';
/**
 * Field Renderer Component
 *
 * This component renders form fields based on their type and configuration.
 * It handles different field types, validation, and error display.
 *
 * @module onboarding-form/components/FieldRenderer
 */

import { AlertCircleIcon, InfoIcon } from 'lucide-react';
import {
    FormField,
    FormData,
    ErrorsState,
    TouchedFields,
} from '../types/formData';
/**
 * Props for the FieldRenderer component
 */
interface FieldRendererProps {
    field: FormField; // Field configuration
    formData: FormData; // Current form data
    errors: ErrorsState; // Validation errors
    touchedFields: TouchedFields; // Fields that have been touched
    onChange: (fieldName: string, value: any) => void; // Handler for field changes
    validateField: (fieldName: string, value: any) => boolean | null; // Field validation function
}
/**
 * Component for rendering form fields based on their type
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
    field,
    formData,
    errors,
    touchedFields,
    onChange,
    validateField,
}) => {
    /**
     * Renders a tooltip for a field
     *
     * @param tooltipText - Text to display in the tooltip
     * @returns JSX for the tooltip
     */
    const renderTooltip = (tooltipText: string) => {
        return (
            <div className="group relative inline-block ml-1">
                <InfoIcon size={14} className="text-gray-400 cursor-help" />
                <div className="absolute z-10 w-64 p-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-1 pointer-events-none">
                    {tooltipText}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                </div>
            </div>
        );
    };
    // Get current field value and state
    const fieldValue = formData[field.fieldName] || '';
    const hasError = !!errors[field.fieldName];
    const isTouched = !!touchedFields[field.fieldName];
    return (
        <div key={field.id} className="space-y-2 mb-6">
            {/* Field Label */}
            <label
                htmlFor={field.fieldName}
                className="block text-sm font-medium text-gray-700 flex items-center"
            >
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
                {field.tooltip && renderTooltip(field.tooltip)}
            </label>
            {/* Field Input - Rendered based on field type */}
            {field.type === 'textarea' ? (
                <textarea
                    id={field.fieldName}
                    name={field.fieldName}
                    value={fieldValue}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    onBlur={() => validateField(field.fieldName, fieldValue)}
                    rows={4}
                    placeholder={field.placeholder || ''}
                    className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
            ) : field.type === 'select' ? (
                <select
                    id={field.fieldName}
                    name={field.fieldName}
                    value={fieldValue}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    onBlur={() => validateField(field.fieldName, fieldValue)}
                    className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                >
                    {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type || 'text'}
                    id={field.fieldName}
                    name={field.fieldName}
                    value={fieldValue}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    onBlur={() => validateField(field.fieldName, fieldValue)}
                    placeholder={field.placeholder || ''}
                    min={field.min}
                    max={field.max}
                    className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
            )}
            {/* Format Hint */}
            {field.formatHint && !hasError && (
                <p className="text-xs text-gray-500 mt-1">{field.formatHint}</p>
            )}
            {/* Error Message */}
            {hasError && isTouched && (
                <div className="text-red-500 text-sm mt-1 flex items-start">
                    <AlertCircleIcon size={14} className="mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>{errors[field.fieldName]}</span>
                </div>
            )}
            {/* Help Text */}
            {field.helpText && !hasError && (
                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
        </div>
    );
};
