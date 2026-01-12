// utils/validation.js
export function validateFormField(field, value) {
  const trimmedValue = typeof value === "string" ? value.trim() : value;

  // Required validation
  if (field.required && (!trimmedValue || trimmedValue === "")) {
    return {
      success: false,
      error: `${field.label} is required`,
    };
  }

  // Min length validation
  if (
    field.minLength &&
    typeof trimmedValue === "string" &&
    trimmedValue.length < field.minLength
  ) {
    return {
      success: false,
      error: `${field.label} must be at least ${field.minLength} characters`,
    };
  }

  // Max length validation
  if (
    field.maxLength &&
    typeof trimmedValue === "string" &&
    trimmedValue.length > field.maxLength
  ) {
    return {
      success: false,
      error: `${field.label} must be no more than ${field.maxLength} characters`,
    };
  }

  // Pattern validation
  if (field.pattern && typeof trimmedValue === "string" && trimmedValue) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(trimmedValue)) {
      return {
        success: false,
        error:
          field.patternErrorMessage || `${field.label} has an invalid format`,
      };
    }
  }

  // Number validation
  if (field.type === "number" && trimmedValue !== "") {
    const numValue = Number(trimmedValue);
    if (isNaN(numValue)) {
      return {
        success: false,
        error: `${field.label} must be a number`,
      };
    }

    if (field.min !== undefined && numValue < field.min) {
      return {
        success: false,
        error: `${field.label} must be at least ${field.min}`,
      };
    }

    if (field.max !== undefined && numValue > field.max) {
      return {
        success: false,
        error: `${field.label} must be no more than ${field.max}`,
      };
    }
  }

  return { success: true };
}
