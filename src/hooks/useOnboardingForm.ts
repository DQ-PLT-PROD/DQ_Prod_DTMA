// hooks/useOnboardingForm.ts
import { useState, useEffect, useRef } from "react";
import { validateFormField } from "../utils/validation";
import { loadOnboardingData, loadOnboardingProgress, saveOnboardingData } from "../services/onboardingService";

export function useOnboardingForm(steps, onComplete, isRevisit) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});
  const [editedFields, setEditedFields] = useState<any>({});
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);
  const [showStepsDropdown, setShowStepsDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const stepsDropdownRef: any = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        stepsDropdownRef.current &&
        !stepsDropdownRef.current.contains(event.target)
      ) {
        setShowStepsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load existing onboarding data first
        let existingData = await loadOnboardingData();
        
        // If no complete data, try to load progress
        if (!existingData) {
          existingData = await loadOnboardingProgress();
        }
        
        // If we have existing data, use it
        if (existingData) {
          setFormData(existingData);
        } else {
          // Use mock initial data for demo purposes
          const mockData = {
            tradeName: "Future Tech Solutions",
            industry: "Technology",
            companyStage: "Startup",
            contactName: "John Smith",
            email: "jsmith.futuretech@gmail.com",
            phone: "+971501234567",
          };
          setFormData(mockData);
        }
      } catch (error) {
        console.error("Error loading onboarding data:", error);
        // Fallback to mock data
        const mockData = {
          tradeName: "Future Tech Solutions",
          industry: "Technology",
          companyStage: "Startup",
          contactName: "John Smith",
          email: "jsmith.futuretech@gmail.com",
          phone: "+971501234567",
        };
        setFormData(mockData);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    // Clear error if field becomes valid
    if (errors[fieldName]) {
      validateField(fieldName, value);
    }

    // Track edited fields for Welcome step
    if (currentStep === 0 && isEditingWelcome) {
      setEditedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    }
  };

  const validateField = (fieldName, value) => {
    const field = findFieldDefinition(fieldName);
    if (!field) return true;

    const isValid = validateFormField(field, value);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (isValid.success) {
        delete newErrors[fieldName];
      } else {
        newErrors[fieldName] = isValid.error;
      }
      return newErrors;
    });

    return isValid.success;
  };

  const findFieldDefinition = (fieldName) => {
    // Search through all steps to find field definition
    for (const step of steps) {
      if (step.sections) {
        for (const section of step.sections) {
          const field = section.fields?.find((f) => f.fieldName === fieldName);
          if (field) return field;
        }
      } else if (step.fields) {
        const field = step.fields.find((f) => f.fieldName === fieldName);
        if (field) return field;
      }
    }

    // Handle welcome step fields
    if (currentStep === 0) {
      const welcomeFields = getWelcomeFields();
      return welcomeFields.find((f) => f.fieldName === fieldName);
    }

    return null;
  };

  const getWelcomeFields = () => [
    {
      fieldName: "tradeName",
      label: "Company Name",
      required: true,
      minLength: 2,
    },
    { fieldName: "industry", label: "Industry", required: true },
    {
      fieldName: "contactName",
      label: "Contact Name",
      required: true,
      minLength: 3,
      pattern: "^[a-zA-Z\\s.-]+$",
    },
    { fieldName: "email", label: "Email", required: true, type: "email" },
    { fieldName: "phone", label: "Phone", required: true, type: "tel" },
  ];

  const validateCurrentStep = () => {
    if (currentStep === 0 && !isEditingWelcome) return true;
    if (currentStep === steps.length - 1) return true;

    const step = steps[currentStep];
    let isValid = true;
    const touchedStepFields = {};

    const fieldsToValidate =
      currentStep === 0 ? getWelcomeFields() : getStepFields(step);

    fieldsToValidate.forEach((field) => {
      touchedStepFields[field.fieldName] = true;
      const fieldIsValid = validateField(
        field.fieldName,
        formData[field.fieldName]
      );
      if (!fieldIsValid) isValid = false;
    });

    setTouchedFields((prev) => ({ ...prev, ...touchedStepFields }));
    return isValid;
  };

  const getStepFields = (step) => {
    const fields: any = [];
    if (step.sections) {
      step.sections.forEach((section) => {
        if (section.fields) fields.push(...section.fields);
      });
    } else if (step.fields) {
      fields.push(...step.fields);
    }
    return fields;
  };

  const handleSubmit = async () => {
    // Validate all fields
    const allFields: any = [];
    steps.forEach((step) => {
      allFields.push(...getStepFields(step));
    });

    const allTouchedFields = {};
    allFields.forEach((field) => {
      allTouchedFields[field.fieldName] = true;
    });
    setTouchedFields(allTouchedFields);

    // Validate required fields
    const requiredFields = allFields.filter((field) => field.required);
    let isValid = true;

    requiredFields.forEach((field) => {
      const fieldIsValid = validateField(
        field.fieldName,
        formData[field.fieldName]
      );
      if (!fieldIsValid) isValid = false;
    });

    if (isValid) {
      setLoading(true);
      try {
        // Save to backend using mock API
        const result = await saveOnboardingData(formData);

        if (result) {
          onComplete();
        } else {
          console.error("Failed to save onboarding data");
        }
      } catch (error) {
        console.error("Error saving onboarding data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Navigate to first step with errors
      const errorStep = findFirstStepWithErrors();
      if (errorStep !== -1) {
        setCurrentStep(errorStep);
      }
    }
  };

  const findFirstStepWithErrors = () => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const fields = getStepFields(step);
      if (fields.some((field) => errors[field.fieldName])) {
        return i;
      }
    }
    return -1;
  };

  const toggleWelcomeEdit = () => {
    setIsEditingWelcome(!isEditingWelcome);
  };

  const handleJumpToStep = (stepIndex) => {
    if (stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
      setShowStepsDropdown(false);
    }
  };

  const getStepCompletionStatus = (stepIndex) => {
    if (stepIndex === 0 || stepIndex === steps.length - 1) return true;

    const step = steps[stepIndex];
    const fields = getStepFields(step);

    return fields.every((field) => {
      if (!field.required) return true;
      const value = formData[field.fieldName];
      return value && (typeof value !== "string" || value.trim() !== "");
    });
  };

  return {
    currentStep,
    formData,
    errors,
    touchedFields,
    editedFields,
    isEditingWelcome,
    showStepsDropdown,
    loading,
    stepsDropdownRef,
    setCurrentStep,
    setShowStepsDropdown,
    setIsEditingWelcome,
    handleInputChange,
    validateCurrentStep,
    validateField,
    toggleWelcomeEdit,
    handleSubmit,
    handleJumpToStep,
    getStepCompletionStatus,
  };
}
