import { FormSchema } from '../FormPreview'

export const facilitateCommunicationSchema: FormSchema = {
    formId: 'facilitate-communication',
    formTitle: 'Facilitate Communication With Strategic Stakeholders',
    formDescription: 'Please complete the form below to proceed with your application.',
    multiStep: true,
    allowSaveAndContinue: true,
    autoSaveInterval: 15000,
    submitEndpoint: '/api/facilitate-communication-request',
    steps: [
        {
            stepTitle: 'Company Information',
            stepDescription: 'Provide your company and contact information.',
            groups: [
                {
                    groupTitle: 'COMPANY INFORMATION',
                    fields: [
                        {
                            id: 'companyName',
                            label: 'Company name',
                            type: 'text',
                            placeholder: 'Enter your company name',
                            required: true,
                            validation: { minLength: 2 },
                        },
                        {
                            id: 'companyNumber',
                            label: 'Company number',
                            type: 'text',
                            placeholder: 'Enter your company number',
                            required: true,
                        },
                    ],
                },
                {
                    groupTitle: 'REQUESTER INFORMATION',
                    fields: [
                        {
                            id: 'requestorName',
                            label: 'Name of person making the submission',
                            type: 'text',
                            placeholder: 'Enter your full name',
                            required: true,
                            validation: { minLength: 2 },
                        },
                        {
                            id: 'requestorPosition',
                            label: 'Position',
                            type: 'text',
                            placeholder: 'Enter your position',
                        },
                        {
                            id: 'requestorEmail',
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'Enter your email address',
                            required: true,
                        },
                        {
                            id: 'requestorPhone',
                            label: 'Contact telephone number',
                            type: 'tel',
                            placeholder: 'Enter your contact number',
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            stepTitle: 'Support Details',
            stepDescription: 'Provide details about the support you require.',
            groups: [
                {
                    groupTitle: 'ADD SUPPORT DETAILS',
                    fields: [
                        {
                            id: 'supportType',
                            label: 'Support Type',
                            type: 'select',
                            placeholder: 'Select',
                            required: true,
                            options: [
                                { value: 'strategic-planning', label: 'Strategic Planning' },
                                { value: 'stakeholder-engagement', label: 'Stakeholder Engagement' },
                                { value: 'communication-strategy', label: 'Communication Strategy' },
                                { value: 'partnership-development', label: 'Partnership Development' },
                                { value: 'other', label: 'Other' },
                            ],
                        },
                        {
                            id: 'entityType',
                            label: 'Entity Type',
                            type: 'select',
                            placeholder: 'Select',
                            required: true,
                            options: [
                                { value: 'government', label: 'Government' },
                                { value: 'private-sector', label: 'Private Sector' },
                                { value: 'ngo', label: 'NGO/Non-Profit' },
                                { value: 'academic', label: 'Academic Institution' },
                                { value: 'international', label: 'International Organization' },
                                { value: 'other', label: 'Other' },
                            ],
                        },
                        {
                            id: 'supportSubject',
                            label: 'Support Subject',
                            type: 'textarea',
                            placeholder: 'Describe the subject of support needed',
                            required: true,
                            validation: { minLength: 10, maxLength: 500 },
                        },
                        {
                            id: 'financialImpact',
                            label: 'Financial Impact',
                            type: 'textarea',
                            placeholder: 'Describe the expected financial impact',
                            validation: { maxLength: 500 },
                        },
                        {
                            id: 'supportDescription',
                            label: 'Support Description',
                            type: 'textarea',
                            placeholder: 'Provide detailed description of the support required',
                            required: true,
                            validation: { minLength: 50, maxLength: 2000 },
                        },
                    ],
                },
            ],
        },
        {
            stepTitle: 'Data Sharing',
            stepDescription: 'Review and confirm your data sharing consent.',
            groups: [
                {
                    groupTitle: 'DATA SHARING CONSENT',
                    groupDescription: 'Kindly Accept Data Sharing',
                    fields: [
                        {
                            id: 'dataSharingConsent',
                            label: 'I acknowledge that by providing this consent, my information may be shared with third party entities for the purpose of increasing the procurement and business opportunities. I understand that my information will be treated in accordance with applicable data protection laws and regulations.',
                            type: 'consent',
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
}
