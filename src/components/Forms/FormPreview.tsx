/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
} from "@floating-ui/react";

import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Upload,
  X,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import {useScrollLock} from "../../hooks/useScrollLock.ts";

// Types
export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "multiselect"
    | "checkbox"
    | "checkbox-group"
    | "radio"
    | "switch"
    | "date"
    | "daterange"
    | "time"
    | "datetime"
    | "file"
    | "multi-file"
    | "image-upload"
    | "number"
    | "email"
    | "tel"
    | "password"
    | "address"
    | "currency"
    | "slider"
    | "rating"
    | "stepper"
    | "lookup"
    | "autocomplete"
    | "tags"
    | "signature"
    | "consent"
    | "course-table"
    | "table";
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    message?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    fileTypes?: string[];
    maxFileSize?: number;
    strength?: "weak" | "medium" | "strong";
    required?: string;
  };
  options?: Array<{
    value: string;
    label: string;
    assetName?: string;
    assetNumber?: string;
  }>;
  tableConfig?: {
    columns: Array<{ key: string; label: string }>;
    selectable?: boolean;
    emptyMessage?: string;
  };
  globalOptionSet?: string;
  conditionalLogic?: {
    dependsOn: string;
    showWhen: string | string[];
  };
  defaultValue?: any;
  helperText?: string;
  currency?: string;
  searchEndpoint?: string;
}

export interface FormGroup {
  groupTitle: string;
  groupDescription?: string;
  conditionalLogic?: {  // Add this for group-level conditional logic
    dependsOn: string;
    showWhen: string | string[];
  };
  fields: FormField[];
}

export interface FormStep {
  stepTitle: string;
  stepDescription?: string;
  groups: FormGroup[];
}

export interface FormSchema {
  formId: string;
  formTitle: string;
  formDescription?: string;
  multiStep: boolean;
  steps?: FormStep[];
  groups?: FormGroup[];
  submitEndpoint?: string;
  allowSaveAndContinue?: boolean;
  autoSaveInterval?: number;
}

export interface ServiceRequestFormProps {
  schema?: FormSchema;
  onSubmit?: (data: any) => Promise<void>;
  onSave?: (data: any) => Promise<void>;
  initialData?: any;
  userId?: string;
  "data-id"?: string;
  enablePersistence?: boolean;
  enableAutoSave?: boolean;
}

// Utility functions
const validateField = (field: FormField, value: any): string | null => {
  if (field.required) {
    if (field.type === "table") {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return field.validation?.required || `${field.label} is required`;
      }
    } else if (field.type === "checkbox-group" || field.type === "multiselect") {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return `${field.label} is required`;
      }
    } else {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${field.label} is required`;
      }
    }
  }

  if (!value) return null;

  if (field.validation) {
    const { pattern, message, minLength, maxLength, min, max } = field.validation;
    if (pattern && !new RegExp(pattern).test(value)) {
      return message || `${field.label} format is invalid`;
    }
    if (minLength && value.length < minLength) {
      return `${field.label} must be at least ${minLength} characters`;
    }
    if (maxLength && value.length > maxLength) {
      return `${field.label} must not exceed ${maxLength} characters`;
    }
    if (min !== undefined && Number(value) < min) {
      return `${field.label} must be at least ${min}`;
    }
    if (max !== undefined && Number(value) > max) {
      return `${field.label} must not exceed ${max}`;
    }
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
  }

  if (field.type === "tel" && value) {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(value.replace(/\s|-/g, ""))) {
      return "Please enter a valid phone number";
    }
  }

  return null;
};

const shouldShowSuccessState = (field: FormField): boolean => {
  const criticalFieldTypes = [
    "email",
    "tel",
    "password",
    "file",
    "multi-file",
    "image-upload",
    "table",
  ];
  return criticalFieldTypes.includes(field.type);
};

const getPasswordStrength = (password: string) => {
  if (!password)
    return {
      score: 0,
      label: "",
      color: "",
    };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const strengthMap = {
    0: {
      label: "",
      color: "",
    },
    1: {
      label: "Weak",
      color: "text-red-600",
    },
    2: {
      label: "Fair",
      color: "text-orange-600",
    },
    3: {
      label: "Good",
      color: "text-blue-600",
    },
    4: {
      label: "Strong",
      color: "text-green-600",
    },
  };
  return {
    score,
    ...strengthMap[score as keyof typeof strengthMap],
  };
};

const getGlobalOptions = (optionSetId: string) => {
  const globalOptions: Record<
    string,
    Array<{
      value: string;
      label: string;
    }>
  > = {
    countries: [
      {
        value: "ae",
        label: "United Arab Emirates",
      },
      {
        value: "us",
        label: "United States",
      },
      {
        value: "uk",
        label: "United Kingdom",
      },
      {
        value: "ca",
        label: "Canada",
      },
      {
        value: "au",
        label: "Australia",
      },
      {
        value: "other",
        label: "Other",
      },
    ],
    serviceTypes: [
      {
        value: "consultation",
        label: "Business Consultation",
      },
      {
        value: "funding",
        label: "Funding & Investment",
      },
      {
        value: "technical",
        label: "Technical Support",
      },
      {
        value: "training",
        label: "Training & Development",
      },
      {
        value: "other",
        label: "Other",
      },
    ],
    priorities: [
      {
        value: "low",
        label: "Low - Within 1 week",
      },
      {
        value: "medium",
        label: "Medium - Within 3 days",
      },
      {
        value: "high",
        label: "High - Within 24 hours",
      },
      {
        value: "urgent",
        label: "Urgent - Same day",
      },
    ],
    budgetRanges: [
      {
        value: "under-5000",
        label: "Under $5,000",
      },
      {
        value: "5000-25000",
        label: "$5,000 - $25,000",
      },
      {
        value: "25000-100000",
        label: "$25,000 - $100,000",
      },
      {
        value: "100000-plus",
        label: "$100,000+",
      },
    ],
    currencies: [
      {
        value: "AED",
        label: "UAE Dirham (AED)",
      },
      {
        value: "USD",
        label: "US Dollar (USD)",
      },
      {
        value: "EUR",
        label: "Euro (EUR)",
      },
      {
        value: "GBP",
        label: "British Pound (GBP)",
      },
    ],
  };
  return globalOptions[optionSetId] || [];
};

const validateSchema = (schema: FormSchema | undefined): FormSchema => {
  if (!schema) {
    throw new Error(
      "ServiceRequestForm: No schema provided. A valid schema is required."
    );
  }
  if (!schema.formId || !schema.formTitle) {
    throw new Error(
      "ServiceRequestForm: Invalid schema, missing required fields (formId or formTitle)."
    );
  }
  if (schema.multiStep) {
    if (
      !schema.steps ||
      !Array.isArray(schema.steps) ||
      schema.steps.length === 0
    ) {
      throw new Error(
        "ServiceRequestForm: Multi-step schema missing valid steps."
      );
    }
    const hasValidSteps = schema.steps.every(
      (step) =>
        step.groups &&
        Array.isArray(step.groups) &&
        step.groups.some(
          (group) =>
            group.fields &&
            Array.isArray(group.fields) &&
            group.fields.length > 0
        )
    );
    if (!hasValidSteps) {
      throw new Error(
        "ServiceRequestForm: Multi-step schema has invalid step structure."
      );
    }
  } else {
    if (
      !schema.groups ||
      !Array.isArray(schema.groups) ||
      schema.groups.length === 0
    ) {
      throw new Error(
        "ServiceRequestForm: Single-step schema missing valid groups."
      );
    }
    const hasValidGroups = schema.groups.some(
      (group) =>
        group.fields && Array.isArray(group.fields) && group.fields.length > 0
    );
    if (!hasValidGroups) {
      throw new Error(
        "ServiceRequestForm: Single-step schema has no valid groups with fields."
      );
    }
  }
  return schema;
};

// Custom Select Component
const CustomSelect: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
  error?: boolean;
  success?: boolean;
}> = ({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select an option",
  error = false,
  success = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift(), size()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, {
    role: "listbox",
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const selectedOption = options.find((opt) => opt.value === value);

  const getTriggerClasses = () => {
    const baseClasses =
      "w-full h-11 px-4 bg-white border rounded-md transition-all duration-200 focus:outline-none focus:ring-2";
    if (error) return `${baseClasses} border-red-500 focus:ring-red-500`;
    if (success) return `${baseClasses} border-green-500 focus:ring-green-500`;
    return `${baseClasses} border-gray-300 hover:border-gray-400 focus:ring-blue-500`;
  };

  const handleBlur = () => {
    if (hasInteracted && !isOpen) {
      onBlur?.();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        ref={refs.setReference}
        className={getTriggerClasses()}
        onBlur={handleBlur}
        {...getReferenceProps()}
      >
        <div className="flex items-center justify-between h-full">
          <span
            className={`block truncate text-left ${
              selectedOption ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {success && (
        <Check className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
      )}
      {isOpen &&
        createPortal(
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              className="rounded-lg bg-white shadow-lg ring-1 ring-gray-200 z-50 max-h-80 overflow-auto"
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    option.value === value
                      ? "bg-blue-50 border-l-2 border-blue-500"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setHasInteracted(true);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </FloatingFocusManager>,
          document.body
        )}
    </div>
  );
};

// Asset Table Component
interface AssetTableData {
  assetName: string;
  assetNumber: string;
  selected?: boolean;
}

const AssetTableField: React.FC<{
  value: AssetTableData[];
  onChange: (value: AssetTableData[]) => void;
  options?: Array<{ assetName: string; assetNumber: string }>;
  error?: string;
  emptyMessage?: string;
}> = ({ value, onChange, options = [], error, emptyMessage = "There are no assets in your account." }) => {
  const [selectedAssets, setSelectedAssets] = useState<AssetTableData[]>(value || []);

  useEffect(() => {
    setSelectedAssets(value || []);
  }, [value]);

  const handleCheckboxChange = (asset: AssetTableData, isChecked: boolean) => {
    let newSelection: AssetTableData[];
    
    if (isChecked) {
      newSelection = [...selectedAssets, { ...asset, selected: true }];
    } else {
      newSelection = selectedAssets.filter(item => 
        item.assetNumber !== asset.assetNumber
      );
    }
    
    setSelectedAssets(newSelection);
    onChange(newSelection);
  };

  const isAssetSelected = (assetNumber: string) => {
    return selectedAssets.some(asset => asset.assetNumber === assetNumber);
  };

  return (
    <div className="asset-table-container">
      <div className="table-wrapper border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Number
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {options && options.length > 0 ? (
              options.map((asset, index) => (
                <tr 
                  key={asset.assetNumber} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isAssetSelected(asset.assetNumber)}
                      onChange={(e) => handleCheckboxChange(asset, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.assetName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.assetNumber}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={3} 
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {options && options.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {selectedAssets.length} asset(s) selected
        </div>
      )}
    </div>
  );
};

// Form Field Component
const FormField: React.FC<{
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isVisible: boolean;
  onBlur?: () => void;
}> = ({ field, value, onChange, error, isVisible, onBlur }) => {
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fieldOptions = useMemo(() => {
    if (field.globalOptionSet) {
      return getGlobalOptions(field.globalOptionSet);
    }
    return field.options || [];
  }, [field.globalOptionSet, field.options]);

  if (!isVisible) return null;

  const getFieldClasses = () => {
    const baseClasses =
      "w-full h-11 px-4 bg-white border rounded-md transition-all duration-200 focus:outline-none focus:ring-2";
    if (error) return `${baseClasses} border-red-500 focus:ring-red-500`;
    if (value && !error && hasBeenTouched && shouldShowSuccessState(field)) {
      return `${baseClasses} border-green-500 focus:ring-green-500`;
    }
    return `${baseClasses} border-gray-300 hover:border-gray-400 focus:ring-blue-500`;
  };

  const handleBlur = () => {
    setHasBeenTouched(true);
    onBlur?.();
  };

  const fieldId = `field-${field.id}`;

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <div className="relative">
            <input
              id={fieldId}
              type={field.type}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              className={getFieldClasses()}
            />
            {value &&
              !error &&
              hasBeenTouched &&
              shouldShowSuccessState(field) && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
          </div>
        );
      case "password": {
        const strength = getPasswordStrength(value || "");
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                id={fieldId}
                type={showPassword ? "text" : "password"}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                className={getFieldClasses()}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {value &&
                  !error &&
                  hasBeenTouched &&
                  shouldShowSuccessState(field) && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {value && strength.score > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      strength.score === 1
                        ? "bg-red-500"
                        : strength.score === 2
                        ? "bg-orange-500"
                        : strength.score === 3
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${(strength.score / 4) * 100}%`,
                    }}
                  />
                </div>
                <span className={`text-sm font-medium ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>
        );
      }
      case "number":
        return (
          <input
            id={fieldId}
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step}
            className={getFieldClasses()}
          />
        );
      case "currency": {
        const currencySymbol =
          field.currency === "USD" ? "$" : field.currency || "$";
        const formatCurrency = (val: string) => {
          const number = val.replace(/[^0-9]/g, "");
          if (!number) return "";
          return Number(number).toLocaleString();
        };

        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {currencySymbol}
            </div>
            <input
              id={fieldId}
              type="text"
              value={value ? formatCurrency(value.toString()) : ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9]/g, "");
                onChange(rawValue ? Number(rawValue) : "");
              }}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              className={getFieldClasses().replace("px-4", "pl-8 pr-4")}
            />
          </div>
        );
      }
      case "textarea":
        return (
          <div className="space-y-2">
            <textarea
              id={fieldId}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              rows={4}
              className={getFieldClasses().replace(
                "h-11",
                "min-h-[100px] py-3"
              )}
            />
            {field.validation?.maxLength && (
              <div className="text-right text-xs text-gray-500">
                {(value || "").length}/{field.validation.maxLength}
              </div>
            )}
          </div>
        );
      case "select":
        return (
          <CustomSelect
            id={fieldId}
            value={value || ""}
            onChange={onChange}
            onBlur={handleBlur}
            options={fieldOptions}
            placeholder={field.placeholder}
            error={!!error}
            success={
              value && !error && hasBeenTouched && shouldShowSuccessState(field)
            }
          />
        );
      case "radio":
        return (
          <div className="space-y-1">
            {fieldOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-3 py-2">
                <input
                  id={`${fieldId}-${option.value}`}
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={handleBlur}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "checkbox-group": {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1">
            {fieldOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-3 py-2">
                <input
                  id={`${fieldId}-${option.value}`}
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v) => v !== option.value);
                    onChange(newValues);
                  }}
                  onBlur={handleBlur}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      }
      case "checkbox":
        return (
          <div className="space-y-1">
            {fieldOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-3 py-2">
                <input
                  id={`${fieldId}-${option.value}`}
                  type="checkbox"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={handleBlur}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "consent":
        return (
          <div className="flex items-center gap-3 py-2">
            <input
              id={fieldId}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={handleBlur}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor={fieldId} className="text-sm text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );
      case "date":
        return (
          <input
            id={fieldId}
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            className={getFieldClasses()}
          />
        );
      case "file":
      case "image-upload":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <input
                  id={fieldId}
                  type="file"
                  className="hidden"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  onBlur={handleBlur}
                />
              </label>
            </div>
            {value && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-green-800 font-medium">
                    {value.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );

      // Multi-file case

      // Add this case to the renderField switch statement in the FormField component
      // Place it right after the "file" and "image-upload" case (around line 680)

      case "multi-file": {
        const files = Array.isArray(value) ? value : [];
        const maxFiles = field.validation?.max || 5; // Default max 5 files
        const maxFileSize = field.validation?.maxFileSize || 5242880; // Default 5MB in bytes
        const allowedTypes = field.validation?.fileTypes || [
          ".pdf",
          ".doc",
          ".docx",
          ".jpg",
          ".jpeg",
          ".png",
          ".txt",
        ];

        const validateFile = (file: File): string | null => {
          // Check file size
          if (file.size > maxFileSize) {
            return `${file.name} exceeds maximum size of ${(
              maxFileSize / 1048576
            ).toFixed(1)}MB`;
          }

          // Check file type
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
          if (!allowedTypes.includes(fileExtension)) {
            return `${
              file.name
            } has an unsupported file type. Allowed types: ${allowedTypes.join(
              ", "
            )}`;
          }

          return null;
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    Max {maxFiles} files, {(maxFileSize / 1048576).toFixed(1)}MB
                    each
                  </p>
                  <p className="text-xs text-gray-400">
                    {allowedTypes.join(", ")}
                  </p>
                </div>
                <input
                  id={fieldId}
                  type="file"
                  multiple
                  accept={allowedTypes.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    setFileError(null);
                    const newFiles = Array.from(e.target.files || []);

                    if (newFiles.length === 0) return;

                    const remainingSlots = maxFiles - files.length;

                    // Check if adding new files would exceed max count
                    if (newFiles.length > remainingSlots) {
                      if (remainingSlots === 0) {
                        setFileError(
                          `Maximum of ${maxFiles} files reached. Remove files to upload more.`
                        );
                      } else {
                        setFileError(
                          `You can only upload ${remainingSlots} more file${
                            remainingSlots !== 1 ? "s" : ""
                          }. Maximum ${maxFiles} files total.`
                        );
                      }
                      e.target.value = ""; // Reset input
                      return;
                    }

                    // Validate each file
                    const validFiles: File[] = [];
                    for (const file of newFiles) {
                      const error = validateFile(file);
                      if (error) {
                        setFileError(error);
                        e.target.value = ""; // Reset input
                        return;
                      }
                      validFiles.push(file);
                    }

                    // All validations passed, add only valid files
                    onChange([...files, ...validFiles]);
                    e.target.value = ""; // Reset input for next upload
                  }}
                  onBlur={handleBlur}
                />
              </label>
            </div>

            {fileError && (
              <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{fileError}</p>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file: File, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-green-800 font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileError(null); // Clear any errors when removing files
                        const newFiles = files.filter(
                          (_: File, i: number) => i !== index
                        );
                        onChange(newFiles.length > 0 ? newFiles : null);
                      }}
                      className="text-red-500 hover:text-red-700 ml-3 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <p className="text-sm text-gray-600">
                {files.length} of {maxFiles} file{files.length !== 1 ? "s" : ""}{" "}
                uploaded
              </p>
            )}
          </div>
        );
      }

      case "table":
        return (
          <AssetTableField
            value={value || []}
            onChange={onChange}
            options={field.options as Array<{ assetName: string; assetNumber: string }>}
            error={error}
            emptyMessage={field.tableConfig?.emptyMessage}
          />
        );
      case "course-table":
        return <CourseTableField value={value || []} onChange={onChange} />;
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Unsupported field type: {field.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {!["checkbox", "switch", "consent"].includes(field.type) && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-gray-900"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {field.helperText && !error && (
        <p className="text-xs text-gray-500">{field.helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Progress Indicator
const ProgressIndicator: React.FC<{
  steps: FormStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
}> = ({ steps, currentStep, completedSteps, onStepClick }) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 mb-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex items-center">
              <button
                onClick={() => completedSteps.has(index) && onStepClick(index)}
                disabled={!completedSteps.has(index) && index !== currentStep}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  completedSteps.has(index)
                    ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                    : currentStep === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600 cursor-not-allowed"
                }`}
              >
                {completedSteps.has(index) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </button>
              <div className="ml-4 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep === index ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.stepTitle}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-6 transition-all duration-300 ${
                  completedSteps.has(index) ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Error Summary
const ErrorSummary: React.FC<{
  errors: Record<string, string>;
}> = ({ errors }) => {
  const errorCount = Object.keys(errors).length;
  if (errorCount === 0) return null;

  return (
    <div
      className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6"
      role="alert"
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            Please correct {errorCount} error{errorCount !== 1 ? "s" : ""} below
            to continue
          </p>
        </div>
      </div>
    </div>
  );
};

// Success State
const SuccessState: React.FC<{
  onClose?: () => void;
  referenceId?: string;
}> = ({ onClose, referenceId }) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Request Submitted Successfully!
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Thank you for your submission. We've received your request and will get
        back to you within 24 hours.
      </p>
      {referenceId && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
          <p className="text-sm text-gray-500 mb-1">Reference ID</p>
          <p className="font-mono text-lg font-semibold text-gray-900">
            {referenceId}
          </p>
        </div>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      )}
    </div>
  );
};

// Form Preview Component
const FormPreview: React.FC<{
  formData: any;
  schema: FormSchema;
  onClose: () => void;
}> = ({ formData, schema, onClose }) => {
  useScrollLock(true);
  const formatValue = (field: FormField, value: any): string => {
    if (!value) return "Not provided";

    switch (field.type) {
      case "checkbox-group":
      case "multiselect":
        return Array.isArray(value) ? value.join(", ") : String(value);
      case "radio":
      case "select": {
        const options = field.globalOptionSet 
          ? getGlobalOptions(field.globalOptionSet)
          : field.options || [];
        const selectedOption = options.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : String(value);
      }
      case "checkbox":
      case "consent":
        return value ? "Yes" : "No";
      case "file":
      case "image-upload":
        return value?.name || "File uploaded";
      case "table":
        return Array.isArray(value) 
          ? `${value.length} asset(s) selected` 
          : "No assets selected";
      case "currency": {
        const currencySymbol = field.currency === "USD" ? "$" : field.currency || "$";
        return `${currencySymbol}${Number(value).toLocaleString()}`;
      }
      default:
        return String(value);
    }
  };

  const getVisibleFields = (groups: FormGroup[]) => {
    const visibleFields: { group: FormGroup; field: FormField; value: any }[] = [];
    
    groups.forEach(group => {
      group.fields.forEach(field => {
        if (field.conditionalLogic) {
          const { dependsOn, showWhen } = field.conditionalLogic;
          const dependentValue = formData[dependsOn];
          const isVisible = Array.isArray(showWhen)
            ? showWhen.includes(dependentValue)
            : dependentValue === showWhen;
          if (!isVisible) return;
        }
        
        const value = formData[field.id];
        if (value !== undefined && value !== null && value !== "") {
          visibleFields.push({ group, field, value });
        }
      });
    });
    
    return visibleFields;
  };

  const allGroups = schema.multiStep
    ? schema.steps?.flatMap(step => step.groups) || []
    : schema.groups || [];

  const visibleFields = getVisibleFields(allGroups);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Form Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {visibleFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data to preview
            </div>
          ) : (
            visibleFields.map(({ group, field, value }, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-blue-600 mb-2">
                  {group.groupTitle}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-gray-700">
                      {field.label}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-900">
                      {formatValue(field, value)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Course Table Component
interface CourseTableData {
  courseName: string;
  language: string;
  meetingType: string;
  startDate: string;
  description: string;
  time: string;
  duration: string;
  location: string;
  trainer: string;
  fees: string;
}

const CourseTableField: React.FC<{
  value: CourseTableData[];
  onChange: (value: CourseTableData[]) => void;
}> = ({ value, onChange }) => {
  const [courses, setCourses] = useState<CourseTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<CourseTableData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const coursesPerPage = 10;

  // Filter states
  const [filters, setFilters] = useState({
    courseName: "",
    language: "",
    meetingType: "",
    startDate: "",
  });

  const courseNameOptions = [
    { value: "business-fundamentals", label: "Business Fundamentals" },
    { value: "marketing-strategy", label: "Marketing Strategy" },
    { value: "financial-management", label: "Financial Management" },
    { value: "leadership-development", label: "Leadership Development" },
    { value: "digital-marketing", label: "Digital Marketing" },
    { value: "project-management", label: "Project Management" },
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" },
    { value: "spanish", label: "Spanish" },
  ];

  const meetingTypeOptions = [
    { value: "online", label: "Online" },
    { value: "in-person", label: "In-Person" },
    { value: "hybrid", label: "Hybrid" },
  ];

  // Simulate fetching courses from server
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Replace this with actual API call
        // const response = await fetch('/api/courses');
        // const data = await response.json();

        // Mock data for demonstration
        const mockCourses: CourseTableData[] = [
          {
            courseName: "business-fundamentals",
            language: "english",
            meetingType: "online",
            startDate: "2025-10-15",
            description: "Learn the core principles of business management",
            time: "10:00 AM - 12:00 PM",
            duration: "8 weeks",
            location: "Virtual Classroom",
            trainer: "Dr. Sarah Johnson",
            fees: "$499"
          },
          {
            courseName: "marketing-strategy",
            language: "english",
            meetingType: "hybrid",
            startDate: "2025-10-20",
            description: "Master modern marketing techniques",
            time: "2:00 PM - 4:00 PM",
            duration: "6 weeks",
            location: "Room 301 / Online",
            trainer: "Michael Chen",
            fees: "$599"
          },
          // Add more mock courses to test pagination
          ...Array.from({ length: 15 }, (_, i) => ({
            courseName: courseNameOptions[i % courseNameOptions.length].value,
            language: languageOptions[i % languageOptions.length].value,
            meetingType: meetingTypeOptions[i % meetingTypeOptions.length].value,
            startDate: `2025-${String(10 + (i % 3)).padStart(2, '0')}-${String(15 + i).padStart(2, '0')}`,
            description: `Course description for course ${i + 3}`,
            time: `${9 + (i % 8)}:00 AM - ${11 + (i % 8)}:00 AM`,
            duration: `${4 + (i % 8)} weeks`,
            location: i % 2 === 0 ? "Virtual Classroom" : `Room ${200 + i}`,
            trainer: `Instructor ${i + 3}`,
            fees: `$${400 + (i * 50)}`
          }))
        ];

        setCourses(mockCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  //Conditionally confirm whether the scroll lock should be called or not
  const shouldLockScroll = showModal && !!selectedCourse;
  useScrollLock(shouldLockScroll);


  // Filter courses
  const filteredCourses = courses.filter((course) => {
    return (
        (!filters.courseName || course.courseName === filters.courseName) &&
        (!filters.language || course.language === filters.language) &&
        (!filters.meetingType || course.meetingType === filters.meetingType) &&
        (!filters.startDate || course.startDate === filters.startDate)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      courseName: "",
      language: "",
      meetingType: "",
      startDate: "",
    });
    setCurrentPage(1);
  };

  const handleRowClick = (course: CourseTableData) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleConfirmSelection = () => {
    if (selectedCourse) {
      // Add selected course to value array
      onChange([...value, selectedCourse]);
      setShowModal(false);
      setSelectedCourse(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getLabel = (options: Array<{ value: string; label: string }>, value: string) => {
    return options.find(opt => opt.value === value)?.label || value;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading courses...</div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Filters Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.courseName}
                  onChange={(e) => handleFilterChange('courseName', e.target.value)}
              >
                <option value="">All Courses</option>
                {courseNameOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.meetingType}
                  onChange={(e) => handleFilterChange('meetingType', e.target.value)}
              >
                <option value="">All Types</option>
                {meetingTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredCourses.length === courses.length
                  ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredCourses.length)} of ${courses.length} courses`
                  : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredCourses.length)} of ${filteredCourses.length} filtered courses (${courses.length} total)`
              }
            </div>
            {(filters.courseName || filters.language || filters.meetingType || filters.startDate) && (
                <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Filters
                </button>
            )}
          </div>
        </div>

        {/* Table */}
        {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No courses match the current filters
            </div>
        ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meeting Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.map((course, index) => (
                        <tr
                            key={index}
                            onClick={() => handleRowClick(course)}
                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {getLabel(courseNameOptions, course.courseName)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {getLabel(languageOptions, course.language)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {getLabel(meetingTypeOptions, course.meetingType)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {course.startDate}
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                        ))}
                      </div>

                      <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              )}
            </>
        )}

        {/* Selection Modal */}
        {showModal && selectedCourse && (
            <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center !mt-0">
              <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Confirm Course Selection
                  </h3>
                  <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Course Details */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Course Name
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {getLabel(courseNameOptions, selectedCourse.courseName)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Language
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {getLabel(languageOptions, selectedCourse.language)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Meeting Type
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {getLabel(meetingTypeOptions, selectedCourse.meetingType)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Start Date
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {selectedCourse.startDate}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Time
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {selectedCourse.time}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Duration
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {selectedCourse.duration}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Location
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {selectedCourse.location}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Trainer
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                        {selectedCourse.trainer}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Fees
                      </label>
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md font-semibold">
                        {selectedCourse.fees}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedCourse.description}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                      type="button"
                      onClick={handleConfirmSelection}
                      className="px-6 py-2.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
            </>
        )}
      </div>
  );
};



// Main ServiceRequestForm Component
export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  schema: providedSchema,
  onSubmit,
  onSave,
  initialData = {},
  "data-id": dataId,
}) => {
  const schema = useMemo(
    () => validateSchema(providedSchema),
    [providedSchema]
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [referenceId, setReferenceId] = useState<string>();
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set()
  );
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        const currentGroups = schema.multiStep
          ? schema.steps?.[currentStep]?.groups || []
          : schema.groups || [];
        const initialCollapsed = new Set<number>();
        currentGroups.forEach((_, index) => {
          if (index > 0) initialCollapsed.add(index);
        });
        setCollapsedSections(initialCollapsed);
      } else {
        setCollapsedSections(new Set());
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [currentStep, schema]);

  useEffect(() => {
    const defaults: any = {};
    const allGroups = schema.multiStep
      ? schema.steps?.flatMap((step) => step.groups) || []
      : schema.groups || [];
    allGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.defaultValue !== undefined && !formData[field.id]) {
          defaults[field.id] = field.defaultValue;
        }
      });
    });
    if (Object.keys(defaults).length > 0) {
      setFormData((prev) => ({
        ...defaults,
        ...prev,
      }));
    }
  }, [schema, formData]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
      if (errors[fieldId]) {
        setErrors((prev) => {
          const newErrors = {
            ...prev,
          };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleFieldBlur = (fieldId: string) => {
    const allGroups = schema.multiStep
      ? schema.steps?.flatMap((step) => step.groups) || []
      : schema.groups || [];
    const field = allGroups
      .flatMap((group) => group.fields)
      .find((f) => f.id === fieldId);

    if (field) {
      const fieldValue = formData[fieldId];
      if (
        fieldValue &&
        (typeof fieldValue !== "string" || fieldValue.trim() !== "")
      ) {
        const error = validateField(field, fieldValue);
        if (error) {
          setErrors((prev) => ({
            ...prev,
            [fieldId]: error,
          }));
        }
      }
    }
  };

  const validateStep = (stepIndex?: number): boolean => {
    const currentGroups = schema.multiStep
      ? schema.steps?.[stepIndex ?? currentStep]?.groups || []
      : schema.groups || [];
    const stepErrors: Record<string, string> = {};
    let isValid = true;
    currentGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.conditionalLogic) {
          const { dependsOn, showWhen } = field.conditionalLogic;
          const dependentValue = formData[dependsOn];
          const isVisible = Array.isArray(showWhen)
            ? showWhen.includes(dependentValue)
            : dependentValue === showWhen;
          if (!isVisible) return;
        }
        const error = validateField(field, formData[field.id]);
        if (error) {
          stepErrors[field.id] = error;
          isValid = false;
        }
      });
    });
    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
      formRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    formRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
      formRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionIndex: number) => {
    setCollapsedSections((prev) => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(sectionIndex)) {
        newCollapsed.delete(sectionIndex);
      } else {
        newCollapsed.add(sectionIndex);
      }
      return newCollapsed;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      const refId = `REQ-${Date.now().toString().slice(-6)}`;
      setReferenceId(refId);
      setShowSuccess(true);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentGroups = schema.multiStep
    ? schema.steps?.[currentStep]?.groups || []
    : schema.groups || [];
  const currentStepData = schema.multiStep ? schema.steps?.[currentStep] : null;
  const isLastStep = schema.multiStep
    ? currentStep === (schema.steps?.length || 1) - 1
    : true;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50" data-id={dataId}>
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <SuccessState
              onClose={() => setShowSuccess(false)}
              referenceId={referenceId}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50" ref={formRef} data-id={dataId}>
        <div className="max-w-12xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
          {schema.formTitle && (
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {schema.formTitle}
            </h2>
          )}

          {schema.multiStep && schema.steps && (
            <ProgressIndicator
              steps={schema.steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            {schema.multiStep && currentStepData && (
              <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Step {currentStep + 1}: {currentStepData.stepTitle}
                </h1>
                {currentStepData.stepDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    {currentStepData.stepDescription}
                  </p>
                )}
              </div>
            )}

            {!schema.multiStep && (
              <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {schema.formTitle}
                </h1>
                {schema.formDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    {schema.formDescription}
                  </p>
                )}
              </div>
            )}

            <ErrorSummary errors={errors} />

            <div className="space-y-10">
              {currentGroups.map((group, index) => {
                const isCollapsed = isMobile && collapsedSections.has(index);
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="px-8 py-6 pb-0">
                      {isMobile ? (
                        <button
                          type="button"
                          onClick={() => toggleSection(index)}
                          className="w-full flex items-center justify-between py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                        >
                          <h3 className="text-sm font-semibold text-blue-600">
                            {group.groupTitle}
                          </h3>
                          {isCollapsed ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                      ) : (
                        <h3 className="text-sm font-semibold text-blue-600">
                          {group.groupTitle}
                        </h3>
                      )}
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isCollapsed
                          ? "max-h-0 opacity-0"
                          : "max-h-none opacity-100"
                      }`}
                    >
                      <div className="px-8 pb-6 mt-4 space-y-4">
                        {group.fields.map((field) => {
                          const isVisible = field.conditionalLogic
                            ? (() => {
                                const { dependsOn, showWhen } =
                                  field.conditionalLogic;
                                const dependentValue = formData[dependsOn];
                                return Array.isArray(showWhen)
                                  ? showWhen.includes(dependentValue)
                                  : dependentValue === showWhen;
                              })()
                            : true;
                          if (!isVisible) return null;

                          const nextField =
                            group.fields[group.fields.indexOf(field) + 1];
                          const isNextFieldLastName =
                            nextField?.id === "lastName";
                          if (field.id === "firstName" && isNextFieldLastName) {
                            return (
                              <div
                                key={field.id}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                              >
                                <FormField
                                  field={field}
                                  value={formData[field.id]}
                                  onChange={(value) =>
                                    handleFieldChange(field.id, value)
                                  }
                                  onBlur={() => handleFieldBlur(field.id)}
                                  error={errors[field.id]}
                                  isVisible={true}
                                />
                                <FormField
                                  field={nextField}
                                  value={formData[nextField.id]}
                                  onChange={(value) =>
                                    handleFieldChange(nextField.id, value)
                                  }
                                  onBlur={() => handleFieldBlur(nextField.id)}
                                  error={errors[nextField.id]}
                                  isVisible={true}
                                />
                              </div>
                            );
                          }
                          if (field.id === "lastName") {
                            const prevField =
                              group.fields[group.fields.indexOf(field) - 1];
                            if (prevField?.id === "firstName") return null;
                          }
                          return (
                            <FormField
                              key={field.id}
                              field={field}
                              value={formData[field.id]}
                              onChange={(value) =>
                                handleFieldChange(field.id, value)
                              }
                              onBlur={() => handleFieldBlur(field.id)}
                              error={errors[field.id]}
                              isVisible={true}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 mt-1">
              <div
                className={`flex gap-4 ${
                  isMobile
                    ? "flex-col space-y-2"
                    : "flex-row justify-between items-center"
                }`}
              >
                <div
                  className={`flex gap-3 ${
                    isMobile ? "flex-col space-y-2" : "flex-row"
                  }`}
                >
                  {schema.multiStep && currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`inline-flex items-center justify-center min-h-12 px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                        isMobile ? "w-full" : "w-full sm:w-auto"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                  )}
                  {schema.allowSaveAndContinue && (
                    <button
                      type="button"
                      onClick={handleSaveAndClose}
                      disabled={isSaving}
                      className={`inline-flex items-center justify-center min-h-12 px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        isMobile ? "w-full" : "w-full sm:w-auto"
                      }`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save & Close"}
                    </button>
                  )}
                  {isLastStep && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className={`inline-flex items-center justify-center min-h-12 px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                        isMobile ? "w-full" : "w-full sm:w-auto"
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                  )}
                </div>

                <div className={isMobile ? "order-first" : ""}>
                  {isLastStep ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`inline-flex items-center justify-center min-h-12 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-semibold text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm ${
                        isMobile ? "w-full" : "w-full sm:w-auto"
                      }`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`inline-flex items-center justify-center min-h-12 px-6 py-3 bg-blue-600 text-base font-semibold text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm ${
                        isMobile ? "w-full" : "w-full sm:w-auto"
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl z-50 space-y-2">
              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center min-h-12 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-semibold text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full inline-flex items-center justify-center min-h-12 px-6 py-3 bg-blue-600 text-base font-semibold text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
              {schema.allowSaveAndContinue && (
                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center min-h-12 px-4 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save & Close"}
                </button>
              )}
              {isLastStep && (
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="w-full inline-flex items-center justify-center min-h-12 px-4 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Preview
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <FormPreview
          formData={formData}
          schema={schema}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};
