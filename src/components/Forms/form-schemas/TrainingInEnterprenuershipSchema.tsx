import { FormSchema } from "../FormPreview";

export const TrainingInEntrepreneurshipSchema: FormSchema = {
    formId: "training-in-entrepreneurship",
    formTitle: "Training in Entrepreneurship",
    formDescription: "Please complete the form below to proceed with your application.",
    multiStep: true,
    allowSaveAndContinue: true,
    autoSaveInterval: 20000, // Auto-save every 20 seconds
    submitEndpoint: "",

    steps: [
        {
            stepTitle: "Company & Requestor Information",
            stepDescription: "Please provide your company and personal details.",
            groups: [
                {
                    groupTitle: "Company Information",
                    fields: [
                        {
                            id: "companyName",
                            label: "Company name",
                            type: "text",
                            required: true,
                            validation: { minLength: 2 },
                        },
                        {
                            id: "companyNumber",
                            label: "Company number",
                            type: "text",
                            required: true,
                            validation: { minLength: 2 },
                        },
                    ],
                },
                {
                    groupTitle: "Requestor Information",
                    fields: [
                        {
                            id: "requestorName",
                            label: "Name of person making the submission",
                            type: "text",
                            required: true,
                            validation: { minLength: 2 },
                        },
                        {
                            id: "requestorPosition",
                            label: "Position",
                            type: "text",
                            required: true,
                        },
                        {
                            id: "requestorEmail",
                            label: "Email Address",
                            type: "email",
                            required: true,
                        },
                        {
                            id: "requestorPhone",
                            label: "Contact telephone number",
                            type: "tel",
                            required: true,
                            validation: {
                                pattern: "^[+]*[0-9]{1,4}[\\s\\-]?[0-9]{1,3}[\\s\\-]?[0-9]{1,4}$",
                            },
                        },
                    ],
                },
            ],
        },
        {
            stepTitle: "Add Course",
            stepDescription: "Please use the options below to find the training course that fits your needs and availability.",
            groups: [
                {
                    groupTitle: "Course Selection",
                    groupDescription: "Select and configure your training courses",
                    fields: [
                        {
                            id: "courseTable",
                            label: "Training Courses",
                            type: "course-table", // Custom type for the course table
                            required: false,
                            helperText: "Use the table below to add and configure your training courses",
                        },
                    ],
                },
            ],
        },
        {
            stepTitle: "Data Sharing",
            stepDescription: "Review and confirm your data sharing consent.",
            groups: [
                {
                    groupTitle: "Data Sharing Consent",
                    groupDescription: "Kindly Accept Data Sharing",
                    fields: [
                        {
                            id: "dataSharingConsent",
                            label: "I acknowledge that by providing this consent, my information may be shared with third party entities for the purpose of increasing the procurement and business opportunities. I understand that my information will be treated in accordance with applicable data protection laws and regulations.",
                            type: "consent",
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
};
