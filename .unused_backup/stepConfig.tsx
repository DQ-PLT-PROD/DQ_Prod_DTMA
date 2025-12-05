/**
 * Step Configuration
 *
 * This file defines the structure and content of all steps in the onboarding form.
 * It includes field definitions, validation rules, and UI configuration for each step.
 *
 * @module onboarding-form/utils/stepConfig
 */
import {
  BuildingIcon,
  CheckIcon,
  MapPinIcon,
  UsersIcon,
  BanknoteIcon,
} from "lucide-react";
import { Step } from "../types/formData";
/**
 * Returns the complete array of steps for the onboarding form
 *
 * @returns Array of Step objects defining the multi-step form
 */
export const getSteps = (): Step[] => [
  // Welcome step
  {
    id: "welcome",
    title: "Welcome",
    icon: <BuildingIcon size={20} />,
  },
  // Business Details step
  {
    id: "business",
    title: "Business Details",
    icon: <BuildingIcon size={20} />,
    sections: [
      {
        title: "Company Identity",
        description: "Basic information about your business",
        fields: [
          {
            id: "registrationNumber",
            label: "Registration Number",
            fieldName: "registrationNumber",
            required: true,
            minLength: 3,
            pattern: "^[a-zA-Z0-9-]+$",
            patternErrorMessage:
              "Registration number can only contain letters, numbers, and hyphens",
            helpText: "Your official business registration number",
          },
          {
            id: "establishmentDate",
            label: "Establishment Date",
            fieldName: "establishmentDate",
            required: true,
            type: "text",
            placeholder: "DD/MM/YYYY",
            formatHint: "DD/MM/YYYY",
            pattern: "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}$",
            patternErrorMessage:
              "Please enter a valid date in DD/MM/YYYY format",
            helpText: "The date your company was officially established",
          },
          {
            id: "businessSize",
            label: "Business Size",
            fieldName: "businessSize",
            required: true,
            type: "select",
            options: [
              {
                value: "",
                label: "Select business size",
              },
              {
                value: "micro",
                label: "Micro (1-9 employees)",
              },
              {
                value: "small",
                label: "Small (10-49 employees)",
              },
              {
                value: "medium",
                label: "Medium (50-249 employees)",
              },
              {
                value: "large",
                label: "Large (250+ employees)",
              },
            ],
            tooltip:
              "Business size determines eligibility for certain programs and support services",
          },
        ],
      },
    ],
  },
  // Business Profile step
  {
    id: "profile",
    title: "Business Profile",
    icon: <BuildingIcon size={20} />,
    sections: [
      {
        title: "Business Description",
        description: "Help us understand your business better",
        fields: [
          {
            id: "businessPitch",
            label: "Business Pitch",
            fieldName: "businessPitch",
            required: true,
            type: "textarea",
            placeholder: "Briefly describe what your business does",
            minLength: 20,
            maxLength: 500,
            helpText: "A concise description of your business proposition",
          },
          {
            id: "problemStatement",
            label: "Problem Statement",
            fieldName: "problemStatement",
            required: true,
            type: "textarea",
            placeholder: "What problem does your business solve?",
            minLength: 20,
            maxLength: 500,
            helpText:
              "Describe the market gap or problem your business addresses",
          },
        ],
      },
    ],
  },
  // Location & Contact step
  {
    id: "location",
    title: "Location & Contact",
    icon: <MapPinIcon size={20} />,
    sections: [
      {
        title: "Business Location",
        description: "Where your business is based",
        fields: [
          {
            id: "address",
            label: "Address",
            fieldName: "address",
            required: true,
            minLength: 5,
            helpText: "Your business street address",
          },
          {
            id: "city",
            label: "City",
            fieldName: "city",
            required: true,
            pattern: "^[a-zA-Z\\s-]+$",
            patternErrorMessage:
              "City name can only contain letters, spaces, and hyphens",
            helpText: "City where your business is located",
          },
          {
            id: "country",
            label: "Country",
            fieldName: "country",
            required: true,
            type: "select",
            options: [
              {
                value: "",
                label: "Select country",
              },
              {
                value: "UAE",
                label: "United Arab Emirates",
              },
              {
                value: "KSA",
                label: "Saudi Arabia",
              },
              {
                value: "Qatar",
                label: "Qatar",
              },
              {
                value: "Bahrain",
                label: "Bahrain",
              },
              {
                value: "Kuwait",
                label: "Kuwait",
              },
              {
                value: "Oman",
                label: "Oman",
              },
              {
                value: "Other",
                label: "Other",
              },
            ],
            helpText: "Country where your business is registered",
          },
        ],
      },
      {
        title: "Online Presence",
        description: "Your business on the web",
        fields: [
          {
            id: "website",
            label: "Website",
            fieldName: "website",
            required: false,
            pattern:
              "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$",
            patternErrorMessage: "Please enter a valid website URL",
            placeholder: "https://www.example.com",
            helpText: "Your business website (if available)",
          },
        ],
      },
    ],
  },
  // Operations step
  {
    id: "operations",
    title: "Operations",
    icon: <UsersIcon size={20} />,
    sections: [
      {
        title: "Team & History",
        description: "Information about your team and founding",
        fields: [
          {
            id: "employeeCount",
            label: "Employee Count",
            fieldName: "employeeCount",
            required: true,
            type: "number",
            min: 1,
            helpText: "Current number of employees in your company",
          },
          {
            id: "founders",
            label: "Founders",
            fieldName: "founders",
            required: true,
            placeholder: "Names of founders, separated by commas",
            minLength: 3,
            helpText: "Names of all company founders",
          },
          {
            id: "foundingYear",
            label: "Founding Year",
            fieldName: "foundingYear",
            required: true,
            type: "number",
            min: 1900,
            max: new Date().getFullYear(),
            helpText: "Year when your company was founded",
          },
        ],
      },
    ],
  },
  // Funding step
  {
    id: "funding",
    title: "Funding",
    icon: <BanknoteIcon size={20} />,
    sections: [
      {
        title: "Financial Information",
        description: "Details about your business finances",
        fields: [
          {
            id: "initialCapital",
            label: "Initial Capital (AED)",
            fieldName: "initialCapital",
            required: true,
            type: "number",
            min: 0,
            helpText: "Initial investment used to start the business",
          },
          {
            id: "fundingNeeds",
            label: "Funding Needs (AED)",
            fieldName: "fundingNeeds",
            required: false,
            type: "number",
            min: 0,
            helpText:
              "Additional funding you are currently seeking (if applicable)",
          },
        ],
      },
      {
        title: "Business Requirements",
        description: "What your business needs to grow",
        fields: [
          {
            id: "needsList",
            label: "Business Needs",
            fieldName: "needsList",
            required: true,
            type: "textarea",
            placeholder:
              "List your top business needs (e.g., marketing, technology, mentorship)",
            minLength: 10,
            helpText: "Describe what your business needs to succeed and grow",
          },
        ],
      },
    ],
  },
  // Review step
  {
    id: "review",
    title: "Review",
    icon: <CheckIcon size={20} />,
  },
];
