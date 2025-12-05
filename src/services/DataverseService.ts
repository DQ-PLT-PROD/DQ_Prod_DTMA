/**
 * Service for interacting with Microsoft Dataverse Web API
 */
// Configuration values - in a real implementation, these would come from environment variables
// For demo purposes, we'll use placeholder values
const DATAVERSE_API_URL = "https://your-org.api.crm.dynamics.com/api/data/v9.2";
const DOCUMENT_ENTITY_NAME = "cr123_document"; // Replace with your actual entity name
// Get the authentication token (this would be handled by your auth provider)
const getAuthToken = async () => {
  // In a real implementation, this would get a token from your auth provider
  // For example, using MSAL.js, Azure AD, etc.
  return "dummy-token";
};
/**
 * Interface for document metadata
 */
interface DocumentMetadata {
  id?: string;
  name: string;
  category: string;
  description?: string;
  expiryDate?: string;
  tags?: string[];
  isConfidential: boolean;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  status: string;
  fileUrl: string;
  versionNumber?: number;
  previousVersionId?: string;
}
/**
 * Creates a new document record in Dataverse
 * @param documentMetadata The document metadata
 * @returns The created document record
 */
export const createDocument = async (documentMetadata: DocumentMetadata) => {
  // For demo purposes, we'll simulate the API call
  console.log("Creating document in Dataverse:", documentMetadata);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Return the document with an ID
  return {
    ...documentMetadata,
    id: Date.now().toString(),
  };
  /* Real implementation would be:
  const token = await getAuthToken()
  // Format the data for Dataverse
  const dataverseRecord = {
    cr123_name: documentMetadata.name,
    cr123_category: documentMetadata.category,
    cr123_description: documentMetadata.description || '',
    cr123_expirydate: documentMetadata.expiryDate,
    cr123_tags: documentMetadata.tags?.join(',') || '',
    cr123_isconfidential: documentMetadata.isConfidential,
    cr123_filetype: documentMetadata.fileType,
    cr123_filesize: documentMetadata.fileSize,
    cr123_uploaddate: documentMetadata.uploadDate,
    cr123_uploadedby: documentMetadata.uploadedBy,
    cr123_status: documentMetadata.status,
    cr123_fileurl: documentMetadata.fileUrl,
    cr123_versionnumber: documentMetadata.versionNumber || 1,
    cr123_previousversionid: documentMetadata.previousVersionId,
  }
  // Make the API call to create the record
  const response = await fetch(
    `${DATAVERSE_API_URL}/${DOCUMENT_ENTITY_NAME}s`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(dataverseRecord),
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to create document: ${response.statusText}`)
  }
  return await response.json()
  */
};
/**
 * Gets all documents from Dataverse
 * @returns An array of document records
 */
export const getAllDocuments = async () => {
  // For demo purposes, we'll return empty array
  console.log("Getting all documents from Dataverse");
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [];
  /* Real implementation would be:
  const token = await getAuthToken()
  // Make the API call to get all documents
  const response = await fetch(
    `${DATAVERSE_API_URL}/${DOCUMENT_ENTITY_NAME}s?$select=cr123_documentid,cr123_name,cr123_category,cr123_description,cr123_expirydate,cr123_tags,cr123_isconfidential,cr123_filetype,cr123_filesize,cr123_uploaddate,cr123_uploadedby,cr123_status,cr123_fileurl,cr123_versionnumber,cr123_previousversionid`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to get documents: ${response.statusText}`)
  }
  const data = await response.json()
  // Transform the data to match our interface
  return data.value.map((record: any) => ({
    id: record.cr123_documentid,
    name: record.cr123_name,
    category: record.cr123_category,
    description: record.cr123_description,
    expiryDate: record.cr123_expirydate,
    tags: record.cr123_tags?.split(',') || [],
    isConfidential: record.cr123_isconfidential,
    fileType: record.cr123_filetype,
    fileSize: record.cr123_filesize,
    uploadDate: record.cr123_uploaddate,
    uploadedBy: record.cr123_uploadedby,
    status: record.cr123_status,
    fileUrl: record.cr123_fileurl,
    versionNumber: record.cr123_versionnumber,
    previousVersionId: record.cr123_previousversionid,
  }))
  */
};
/**
 * Gets a document by ID from Dataverse
 * @param id The document ID
 * @returns The document record
 */
export const getDocumentById = async (id: string) => {
  // For demo purposes, we'll return null
  console.log("Getting document by ID from Dataverse:", id);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return null;
  /* Real implementation would be:
  const token = await getAuthToken()
  // Make the API call to get the document
  const response = await fetch(
    `${DATAVERSE_API_URL}/${DOCUMENT_ENTITY_NAME}s(${id})`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to get document: ${response.statusText}`)
  }
  const record = await response.json()
  // Transform the data to match our interface
  return {
    id: record.cr123_documentid,
    name: record.cr123_name,
    category: record.cr123_category,
    description: record.cr123_description,
    expiryDate: record.cr123_expirydate,
    tags: record.cr123_tags?.split(',') || [],
    isConfidential: record.cr123_isconfidential,
    fileType: record.cr123_filetype,
    fileSize: record.cr123_filesize,
    uploadDate: record.cr123_uploaddate,
    uploadedBy: record.cr123_uploadedby,
    status: record.cr123_status,
    fileUrl: record.cr123_fileurl,
    versionNumber: record.cr123_versionnumber,
    previousVersionId: record.cr123_previousversionid,
  }
  */
};
/**
 * Updates a document in Dataverse
 * @param id The document ID
 * @param documentMetadata The updated document metadata
 * @returns The updated document record
 */
export const updateDocument = async (
  id: string,
  documentMetadata: Partial<DocumentMetadata>
) => {
  // For demo purposes, we'll simulate the update
  console.log("Updating document in Dataverse:", id, documentMetadata);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Return the updated metadata
  return documentMetadata;
  /* Real implementation would be:
  const token = await getAuthToken()
  // Format the data for Dataverse
  const dataverseRecord: any = {}
  if (documentMetadata.name) dataverseRecord.cr123_name = documentMetadata.name
  if (documentMetadata.category)
    dataverseRecord.cr123_category = documentMetadata.category
  if (documentMetadata.description !== undefined)
    dataverseRecord.cr123_description = documentMetadata.description
  if (documentMetadata.expiryDate !== undefined)
    dataverseRecord.cr123_expirydate = documentMetadata.expiryDate
  if (documentMetadata.tags)
    dataverseRecord.cr123_tags = documentMetadata.tags.join(',')
  if (documentMetadata.isConfidential !== undefined)
    dataverseRecord.cr123_isconfidential = documentMetadata.isConfidential
  if (documentMetadata.fileType)
    dataverseRecord.cr123_filetype = documentMetadata.fileType
  if (documentMetadata.fileSize)
    dataverseRecord.cr123_filesize = documentMetadata.fileSize
  if (documentMetadata.uploadDate)
    dataverseRecord.cr123_uploaddate = documentMetadata.uploadDate
  if (documentMetadata.uploadedBy)
    dataverseRecord.cr123_uploadedby = documentMetadata.uploadedBy
  if (documentMetadata.status)
    dataverseRecord.cr123_status = documentMetadata.status
  if (documentMetadata.fileUrl)
    dataverseRecord.cr123_fileurl = documentMetadata.fileUrl
  if (documentMetadata.versionNumber)
    dataverseRecord.cr123_versionnumber = documentMetadata.versionNumber
  if (documentMetadata.previousVersionId)
    dataverseRecord.cr123_previousversionid = documentMetadata.previousVersionId
  // Make the API call to update the record
  const response = await fetch(
    `${DATAVERSE_API_URL}/${DOCUMENT_ENTITY_NAME}s(${id})`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataverseRecord),
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to update document: ${response.statusText}`)
  }
  // Dataverse PATCH doesn't return the updated entity, so we need to get it
  return await getDocumentById(id)
  */
};
/**
 * Deletes a document from Dataverse
 * @param id The document ID
 */
export const deleteDocument = async (id: string) => {
  // For demo purposes, we'll simulate the deletion
  console.log("Deleting document from Dataverse:", id);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  /* Real implementation would be:
  const token = await getAuthToken()
  // Make the API call to delete the record
  const response = await fetch(
    `${DATAVERSE_API_URL}/${DOCUMENT_ENTITY_NAME}s(${id})`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to delete document: ${response.statusText}`)
  }
  */
};
/**
 * Gets all versions of a document
 * @param documentId The document ID
 * @returns An array of document versions
 */
export const getDocumentVersions = async (documentId: string) => {
  // For demo purposes, we'll return empty array
  console.log("Getting document versions from Dataverse:", documentId);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [];
  /* Real implementation would be:
  const token = await getAuthToken()
  // Make the API call to get all versions of the document
  const response = await fetch(
    `${DATAVERSE_API_URL}/${DOCUMENT_ENTITY_NAME}s?$filter=cr123_previousversionid eq '${documentId}'&$select=cr123_documentid,cr123_name,cr123_category,cr123_description,cr123_expirydate,cr123_tags,cr123_isconfidential,cr123_filetype,cr123_filesize,cr123_uploaddate,cr123_uploadedby,cr123_status,cr123_fileurl,cr123_versionnumber,cr123_previousversionid`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to get document versions: ${response.statusText}`)
  }
  const data = await response.json()
  // Transform the data to match our interface
  return data.value.map((record: any) => ({
    id: record.cr123_documentid,
    name: record.cr123_name,
    category: record.cr123_category,
    description: record.cr123_description,
    expiryDate: record.cr123_expirydate,
    tags: record.cr123_tags?.split(',') || [],
    isConfidential: record.cr123_isconfidential,
    fileType: record.cr123_filetype,
    fileSize: record.cr123_filesize,
    uploadDate: record.cr123_uploaddate,
    uploadedBy: record.cr123_uploadedby,
    status: record.cr123_status,
    fileUrl: record.cr123_fileurl,
    versionNumber: record.cr123_versionnumber,
    previousVersionId: record.cr123_previousversionid,
  }))
  */
};

// Mock implementation of Dataverse API service
// In a real implementation, this would make actual API calls to Dataverse
// Mock cache to simulate API data
let dataCache = null;
// Simulate API call to fetch business profile data
export const fetchBusinessProfileData = async () => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  // If we have cached data, return it
  if (dataCache) {
    return dataCache;
  }
  // Otherwise, simulate API response with mock data
  // In a real implementation, this would be:
  // const response = await fetch('https://your-dataverse-api-endpoint/business-profiles/current');
  // const data = await response.json();
  // For now, we'll use the mock data structure but format it as if it came from Dataverse
  const mockData = generateMockDataverseResponse();
  dataCache = mockData;
  return mockData;
};
// Save profile data to Dataverse
export const saveProfileData = async (profileData) => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800));
  // In a real implementation, this would be:
  // const response = await fetch('https://your-dataverse-api-endpoint/business-profiles/current', {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(profileData),
  // });
  // const data = await response.json();
  // For now, we'll just update our cache
  dataCache = {
    ...dataCache,
    ...profileData,
    // Merge sections rather than replacing them
    sections: {
      ...(dataCache?.sections || {}),
      ...profileData.sections,
    },
  };
  // Store in localStorage for persistence across page reloads
  localStorage.setItem("profileData", JSON.stringify(dataCache));
  return dataCache;
};
// Calculate completion percentage for a section based on field values
export const calculateSectionCompletion = (sectionData) => {
  if (
    !sectionData ||
    !sectionData.fields ||
    Object.keys(sectionData.fields).length === 0
  ) {
    return 0;
  }
  let completedFields = 0;
  let totalFields = 0;
  // Count completed fields across all groups
  Object.keys(sectionData.fields).forEach((fieldKey) => {
    totalFields++;
    if (
      sectionData.fields[fieldKey] &&
      sectionData.fields[fieldKey].trim() !== ""
    ) {
      completedFields++;
    }
  });
  return Math.round((completedFields / totalFields) * 100);
};
// Calculate mandatory fields completion for a section based on company stage
export const calculateMandatoryCompletion = (
  sectionData,
  sectionId,
  companyStage,
  config
) => {
  if (!sectionData || !sectionData.fields || !config) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const sectionConfig = config.tabs.find((tab) => tab.id === sectionId);
  if (!sectionConfig) return { completed: 0, total: 0, percentage: 0 };
  let mandatoryFields = 0;
  let completedMandatory = 0;
  sectionConfig.groups.forEach((group) => {
    group.fields.forEach((field) => {
      if (field.mandatory && field.mandatory.includes(companyStage)) {
        mandatoryFields++;
        if (
          sectionData.fields[field.fieldName] &&
          sectionData.fields[field.fieldName].trim() !== ""
        ) {
          completedMandatory++;
        }
      }
    });
  });
  return {
    completed: completedMandatory,
    total: mandatoryFields,
    percentage:
      mandatoryFields > 0
        ? Math.round((completedMandatory / mandatoryFields) * 100)
        : 100,
  };
};
// Check if onboarding has been completed
export const isOnboardingCompleted = () => {
  // Check localStorage first
  const onboardingStatus = localStorage.getItem("onboardingComplete");
  if (onboardingStatus === "true") {
    return true;
  }
  // Check if we have profile data in the cache
  if (dataCache) {
    // Check if mandatory fields are filled
    const { companyStage, sections } = dataCache;
    if (!companyStage || !sections) {
      return false;
    }
    // For simplicity, we'll consider onboarding complete if basic section exists
    return (
      sections.basic && Object.keys(sections.basic.fields || {}).length > 0
    );
  }
  // Check localStorage for profile data
  const storedData = localStorage.getItem("profileData");
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      dataCache = parsedData; // Update cache
      // Same check as above
      const { companyStage, sections } = parsedData;
      if (!companyStage || !sections) {
        return false;
      }
      return (
        sections.basic && Object.keys(sections.basic.fields || {}).length > 0
      );
    } catch (error) {
      console.error("Error parsing stored profile data:", error);
      return false;
    }
  }
  return false;
};
// Generate mock data structure that simulates Dataverse API response
function generateMockDataverseResponse() {
  // Check if we have stored data in localStorage
  const storedData = localStorage.getItem("profileData");
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error("Error parsing stored profile data:", error);
    }
  }
  return {
    id: "12345",
    name: "FutureTech LLC",
    companyType: "Information Technology",
    companySize: "Medium Enterprise",
    companyStage: "growth",
    sections: {
      basic: {
        fields: {
          tradeName: "Future Tech",
          registrationNumber: "FT12345678",
          establishmentDate: "15-Mar-2010",
          entityType: "Limited Liability Company",
          registrationAuthority: "ADGM Registration Authority",
          legalStatus: "Active",
          businessType: "Limited Liability Company",
          industry: "Information Technology",
          businessSize: "Medium Enterprise",
          annualRevenue: "AED 25M - AED 50M",
          numberOfEmployees: "120",
          businessDescription:
            "Enterprise software solutions specializing in cloud-based enterprise management systems with AI-driven analytics capabilities. Our flagship products serve various industries including finance, healthcare, and manufacturing.",
          licenseExpiry: "31-Dec-2023",
          renewalStatus: "Pending",
          complianceStatus: "Compliant",
          lastUpdated: "10-Jun-2023",
          primaryIsicCode: "6201",
          primaryIsicDescription: "Computer programming activities",
          secondaryIsicCode: "6202",
          businessCategory: "Technology",
          marketSegment: "Enterprise Solutions",
          vatRegistrationNumber: "100123456700003",
          commercialLicenseNumber: "CN-12345",
          dunsNumber: "123456789",
          leiCode: "984500B38RH80URRT231",
          chamberOfCommerceNumber: "ADCCI-12345",
          fiveYearVision:
            "To become the leading enterprise software provider in the MENA region, with a focus on AI-driven solutions that transform business operations across industries.",
          investmentGoals: "AED 15M by Q2 2024 (Series B) - 60% complete",
          technologyRoadmap:
            "2023 Q4: Launch AI analytics platform\n2024 Q2: Expand IoT integration capabilities\n2024 Q4: Develop industry-specific solutions for healthcare\n2025: Blockchain integration for secure transactions",
        },
        status: {
          tradeName: "completed",
          registrationNumber: "completed",
          establishmentDate: "completed",
          entityType: "completed",
          registrationAuthority: "completed",
          legalStatus: "completed",
          businessType: "completed",
          industry: "completed",
          businessSize: "completed",
          annualRevenue: "completed",
          numberOfEmployees: "completed",
          businessDescription: "completed",
          licenseExpiry: "completed",
          renewalStatus: "editable",
          complianceStatus: "completed",
          lastUpdated: "completed",
          primaryIsicCode: "completed",
          primaryIsicDescription: "completed",
          secondaryIsicCode: "editable",
          businessCategory: "completed",
          marketSegment: "completed",
          vatRegistrationNumber: "completed",
          commercialLicenseNumber: "completed",
          dunsNumber: "completed",
          leiCode: "completed",
          chamberOfCommerceNumber: "completed",
          fiveYearVision: "completed",
          investmentGoals: "editable",
          technologyRoadmap: "completed",
        },
      },
      contact: {
        fields: {
          contactName: "John Smith",
          position: "Chief Executive Officer",
          email: "jsmith.futuretech@gmail.com",
          phone: "+971 50 123 4567",
          nationality: "British",
          languages: "English, Arabic",
          addressLine1: "Level 42, Al Maqam Tower",
          addressLine2: "ADGM Square, Al Maryah Island",
          city: "Abu Dhabi",
          country: "United Arab Emirates",
          poBox: "P.O. Box 12345",
          geoCoordinates: "24.4991° N, 54.3816° E",
          mainPhone: "+971 2 123 4567",
          website: "www.futuretech.com",
          generalEmail: "info@futuretech.com",
          supportEmail: "support@futuretech.com",
          fax: "+971 2 123 4568",
          socialMedia: "@futuretechllc",
        },
        status: {
          contactName: "completed",
          position: "completed",
          email: "completed",
          phone: "completed",
          nationality: "completed",
          languages: "completed",
          addressLine1: "completed",
          addressLine2: "completed",
          city: "completed",
          country: "completed",
          poBox: "completed",
          geoCoordinates: "editable",
          mainPhone: "completed",
          website: "completed",
          generalEmail: "completed",
          supportEmail: "completed",
          fax: "editable",
          socialMedia: "completed",
        },
      },
      legal: {
        fields: {
          legalForm: "Limited Liability Company",
          jurisdiction: "Abu Dhabi Global Market (ADGM)",
          registrationAuthority: "ADGM Registration Authority",
          governingLaw: "ADGM Companies Regulations 2020",
          foreignBranchStatus: "Not Applicable",
          legalCapacity: "Full",
          taxRegistrationNumber: "100123456700003",
          taxStatus: "Compliant",
          lastFilingDate: "31-Mar-2023",
          taxJurisdiction: "UAE",
          vatRegistrationDate: "01-Jan-2018",
          taxYearEnd: "31-Dec",
        },
        status: {
          legalForm: "completed",
          jurisdiction: "completed",
          registrationAuthority: "completed",
          governingLaw: "completed",
          foreignBranchStatus: "editable",
          legalCapacity: "completed",
          taxRegistrationNumber: "completed",
          taxStatus: "completed",
          lastFilingDate: "completed",
          taxJurisdiction: "completed",
          vatRegistrationDate: "completed",
          taxYearEnd: "completed",
        },
      },
      // Add empty structures for all other sections to support empty states
      financial: { fields: {}, status: {} },
      operational: { fields: {}, status: {} },
      ownership: { fields: {}, status: {} },
      licensing: { fields: {}, status: {} },
      compliance: { fields: {}, status: {} },
      industry: { fields: {}, status: {} },
      employees: { fields: {}, status: {} },
      facilities: { fields: {}, status: {} },
      products: { fields: {}, status: {} },
      certifications: { fields: {}, status: {} },
    },
  };
}
