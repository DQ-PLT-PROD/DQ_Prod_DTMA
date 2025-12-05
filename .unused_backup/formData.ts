/**
 * Form Data Types
 *
 * This file contains type definitions for the onboarding form data structure.
 * It defines interfaces for form fields, sections, steps, and related state.
 *
 * @module onboarding-form/types
 */
/**
 * FormField Interface
 * Represents a single form field with its properties and validation rules
 */
export interface FormField {
  id: string; // Unique identifier for the field
  label: string; // Display label for the field
  fieldName: string; // Property name in the form data object
  required?: boolean; // Whether the field is required
  minLength?: number; // Minimum length for text fields
  maxLength?: number; // Maximum length for text fields
  type?: string; // Field type (text, number, email, etc.)
  pattern?: string; // Regex pattern for validation
  patternErrorMessage?: string; // Custom error message for pattern validation
  helpText?: string; // Help text displayed below the field
  formatHint?: string; // Format hint (e.g., DD/MM/YYYY)
  placeholder?: string; // Placeholder text
  tooltip?: string; // Tooltip text for additional information
  min?: number; // Minimum value for number fields
  max?: number; // Maximum value for number fields
  options?: Array<{
    // Options for select fields
    value: string;
    label: string;
  }>;
}
/**
 * Section Interface
 * Represents a grouping of related form fields within a step
 */
export interface Section {
  title: string; // Section title
  description?: string; // Optional section description
  fields: FormField[]; // Array of fields in this section
}
/**
 * Step Interface
 * Represents a single step in the multi-step form process
 */
export interface Step {
  id: string; // Unique identifier for the step
  title: string; // Step title displayed in the UI
  icon?: React.ReactNode; // Icon component for the step
  sections?: Section[]; // Sections within this step
  fields?: FormField[]; // Fields directly in this step (if no sections)
}
/**
 * FormData Interface
 * Represents the collected form data as a dynamic key-value object
 */
export interface FormData {
  [key: string]: any; // Dynamic object with string keys and any values
  tradeName?: string;
  industry?: string;
  companyStage?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  businessSize?: string;
  registrationNumber?: string;
  establishmentDate?: string;
  businessPitch?: string;
  problemStatement?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  employeeCount?: number;
  founders?: string;
  foundingYear?: number;
  initialCapital?: number;
  fundingNeeds?: number;
  needsList?: string;
}
/**
 * CompanyStageInfo Interface
 * Represents information about a company's development stage
 */
export interface CompanyStageInfo {
  id: string; // Stage identifier
  label: string; // Display name
  color: string; // Color code for visual representation
}
/**
 * ErrorsState Interface
 * Tracks validation errors for form fields
 */
export interface ErrorsState {
  [key: string]: string; // Maps field names to error messages
}
/**
 * EditedFields Interface
 * Tracks which fields have been edited by the user
 */
export interface EditedFields {
  [key: string]: boolean; // Maps field names to edit status
}
/**
 * TouchedFields Interface
 * Tracks which fields have been interacted with by the user
 */
export interface TouchedFields {
  [key: string]: boolean; // Maps field names to touched status
}
/**
 * StepProps Interface
 * Props for step components in the multi-step form
 */
export interface StepProps {
  stepData: Step; // Data for the current step
  formData: FormData; // Current form data
  errors: ErrorsState; // Current validation errors
  touchedFields: TouchedFields; // Fields that have been touched
  onChange: (fieldName: string, value: any) => void; // Handler for field changes
  validateField: (fieldName: string, value: any) => boolean | null; // Field validation function
}
/**
 * OnboardingFormProps Interface
 * Props for the main OnboardingForm component
 */
export interface OnboardingFormProps {
  onComplete: () => void; // Callback when onboarding is completed
  isRevisit?: boolean; // Whether this is a revisit to update information
}
