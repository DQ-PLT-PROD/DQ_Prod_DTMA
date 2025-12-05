// JSON configuration for the Business Profile layout
export const profileConfig = {
  // Company stages with corresponding labels and colors
  companyStages: [
    { id: "startup", label: "Startup", color: "bg-purple-500" },
    { id: "growth", label: "Growth", color: "bg-blue-500" },
    { id: "mature", label: "Mature", color: "bg-green-500" },
    { id: "enterprise", label: "Enterprise", color: "bg-gray-700" },
  ],
  // All 13 sections (tabs) for the profile
  tabs: [
    {
      id: "basic",
      title: "Vision & Strategy",
      groups: [
        {
          groupName: "Company Identification",
          fields: [
            {
              id: "tradeName",
              label: "Trade Name",
              fieldName: "tradeName",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "registrationNumber",
              label: "Registration Number",
              fieldName: "registrationNumber",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "establishmentDate",
              label: "Establishment Date",
              fieldName: "establishmentDate",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "entityType",
              label: "Entity Type",
              fieldName: "entityType",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "registrationAuthority",
              label: "Registration Authority",
              fieldName: "registrationAuthority",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "legalStatus",
              label: "Legal Status",
              fieldName: "legalStatus",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Business Details",
          fields: [
            {
              id: "businessType",
              label: "Business Type",
              fieldName: "businessType",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "industry",
              label: "Industry",
              fieldName: "industry",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "businessSize",
              label: "Business Size",
              fieldName: "businessSize",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "annualRevenue",
              label: "Annual Revenue",
              fieldName: "annualRevenue",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "numberOfEmployees",
              label: "Number of Employees",
              fieldName: "numberOfEmployees",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "businessDescription",
              label: "Business Description",
              fieldName: "businessDescription",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Status Information",
          fields: [
            {
              id: "licenseExpiry",
              label: "License Expiry",
              fieldName: "licenseExpiry",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "renewalStatus",
              label: "Renewal Status",
              fieldName: "renewalStatus",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "complianceStatus",
              label: "Compliance Status",
              fieldName: "complianceStatus",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "lastUpdated",
              label: "Last Updated",
              fieldName: "lastUpdated",
              mandatory: [],
            },
          ],
        },
        {
          groupName: "Classification",
          fields: [
            {
              id: "primaryIsicCode",
              label: "Primary ISIC Code",
              fieldName: "primaryIsicCode",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "primaryIsicDescription",
              label: "Primary ISIC Description",
              fieldName: "primaryIsicDescription",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "secondaryIsicCode",
              label: "Secondary ISIC Code",
              fieldName: "secondaryIsicCode",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "businessCategory",
              label: "Business Category",
              fieldName: "businessCategory",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "marketSegment",
              label: "Market Segment",
              fieldName: "marketSegment",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Identifiers",
          fields: [
            {
              id: "vatRegistrationNumber",
              label: "VAT Registration Number",
              fieldName: "vatRegistrationNumber",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "commercialLicenseNumber",
              label: "Commercial License Number",
              fieldName: "commercialLicenseNumber",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "dunsNumber",
              label: "DUNS Number",
              fieldName: "dunsNumber",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "leiCode",
              label: "LEI Code",
              fieldName: "leiCode",
              mandatory: ["enterprise"],
            },
            {
              id: "chamberOfCommerceNumber",
              label: "Chamber of Commerce Number",
              fieldName: "chamberOfCommerceNumber",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Needs & Aspirations",
          fields: [
            {
              id: "fiveYearVision",
              label: "5-Year Vision",
              fieldName: "fiveYearVision",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "investmentGoals",
              label: "Investment Goals",
              fieldName: "investmentGoals",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "technologyRoadmap",
              label: "Technology Roadmap",
              fieldName: "technologyRoadmap",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Information",
      groups: [
        {
          groupName: "Primary Contact",
          fields: [
            {
              id: "contactName",
              label: "Contact Name",
              fieldName: "contactName",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "position",
              label: "Position",
              fieldName: "position",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "email",
              label: "Email",
              fieldName: "email",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "phone",
              label: "Phone",
              fieldName: "phone",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "nationality",
              label: "Nationality",
              fieldName: "nationality",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "languages",
              label: "Languages",
              fieldName: "languages",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Business Address",
          fields: [
            {
              id: "addressLine1",
              label: "Address Line 1",
              fieldName: "addressLine1",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "addressLine2",
              label: "Address Line 2",
              fieldName: "addressLine2",
              mandatory: [],
            },
            {
              id: "city",
              label: "City",
              fieldName: "city",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "country",
              label: "Country",
              fieldName: "country",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "poBox",
              label: "P.O. Box",
              fieldName: "poBox",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "geoCoordinates",
              label: "Geo Coordinates",
              fieldName: "geoCoordinates",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Communication",
          fields: [
            {
              id: "mainPhone",
              label: "Main Phone",
              fieldName: "mainPhone",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "website",
              label: "Website",
              fieldName: "website",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "generalEmail",
              label: "General Email",
              fieldName: "generalEmail",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "supportEmail",
              label: "Support Email",
              fieldName: "supportEmail",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "fax",
              label: "Fax",
              fieldName: "fax",
              mandatory: ["enterprise"],
            },
            {
              id: "socialMedia",
              label: "Social Media",
              fieldName: "socialMedia",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "legal",
      title: "Legal Information",
      groups: [
        {
          groupName: "Legal Structure",
          fields: [
            {
              id: "legalForm",
              label: "Legal Form",
              fieldName: "legalForm",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "jurisdiction",
              label: "Jurisdiction",
              fieldName: "jurisdiction",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "registrationAuthority",
              label: "Registration Authority",
              fieldName: "registrationAuthority",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "governingLaw",
              label: "Governing Law",
              fieldName: "governingLaw",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "foreignBranchStatus",
              label: "Foreign Branch Status",
              fieldName: "foreignBranchStatus",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "legalCapacity",
              label: "Legal Capacity",
              fieldName: "legalCapacity",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Tax Information",
          fields: [
            {
              id: "taxRegistrationNumber",
              label: "Tax Registration Number",
              fieldName: "taxRegistrationNumber",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "taxStatus",
              label: "Tax Status",
              fieldName: "taxStatus",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "lastFilingDate",
              label: "Last Filing Date",
              fieldName: "lastFilingDate",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "taxJurisdiction",
              label: "Tax Jurisdiction",
              fieldName: "taxJurisdiction",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "vatRegistrationDate",
              label: "VAT Registration Date",
              fieldName: "vatRegistrationDate",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "taxYearEnd",
              label: "Tax Year End",
              fieldName: "taxYearEnd",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "financial",
      title: "Financial Information",
      groups: [
        {
          groupName: "Financial Overview",
          fields: [
            {
              id: "annualRevenue",
              label: "Annual Revenue",
              fieldName: "annualRevenue",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "totalAssets",
              label: "Total Assets",
              fieldName: "totalAssets",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "fiscalYearEnd",
              label: "Fiscal Year End",
              fieldName: "fiscalYearEnd",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "revenueGrowth",
              label: "Revenue Growth YoY",
              fieldName: "revenueGrowth",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "profitMargin",
              label: "Profit Margin",
              fieldName: "profitMargin",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "ebitda",
              label: "EBITDA",
              fieldName: "ebitda",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Banking Information",
          fields: [
            {
              id: "primaryBank",
              label: "Primary Bank",
              fieldName: "primaryBank",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "accountManager",
              label: "Account Manager",
              fieldName: "accountManager",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "bankingRelationshipSince",
              label: "Banking Relationship Since",
              fieldName: "bankingRelationshipSince",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "numberOfAccounts",
              label: "Number of Accounts",
              fieldName: "numberOfAccounts",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "creditFacilities",
              label: "Credit Facilities",
              fieldName: "creditFacilities",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "treasuryServices",
              label: "Treasury Services",
              fieldName: "treasuryServices",
              mandatory: ["enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "operational",
      title: "Operational Information",
      groups: [
        {
          groupName: "Business Operations",
          fields: [
            {
              id: "operatingModel",
              label: "Operating Model",
              fieldName: "operatingModel",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "businessHours",
              label: "Business Hours",
              fieldName: "businessHours",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "operationalSince",
              label: "Operational Since",
              fieldName: "operationalSince",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "serviceLevelAgreements",
              label: "Service Level Agreements",
              fieldName: "serviceLevelAgreements",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "qualityManagementSystem",
              label: "Quality Management System",
              fieldName: "qualityManagementSystem",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "businessContinuityPlan",
              label: "Business Continuity Plan",
              fieldName: "businessContinuityPlan",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Infrastructure",
          fields: [
            {
              id: "itInfrastructure",
              label: "IT Infrastructure",
              fieldName: "itInfrastructure",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "physicalInfrastructure",
              label: "Physical Infrastructure",
              fieldName: "physicalInfrastructure",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "disasterRecovery",
              label: "Disaster Recovery",
              fieldName: "disasterRecovery",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "networkCapacity",
              label: "Network Capacity",
              fieldName: "networkCapacity",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "serverEnvironment",
              label: "Server Environment",
              fieldName: "serverEnvironment",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "backupSystems",
              label: "Backup Systems",
              fieldName: "backupSystems",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "ownership",
      title: "Ownership Structure",
      groups: [
        {
          groupName: "Shareholder Information",
          fields: [
            {
              id: "majorShareholder",
              label: "Major Shareholder",
              fieldName: "majorShareholder",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "localPartner",
              label: "Local Partner",
              fieldName: "localPartner",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "founderShares",
              label: "Founder Shares",
              fieldName: "founderShares",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "employeeStockOwnership",
              label: "Employee Stock Ownership",
              fieldName: "employeeStockOwnership",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "otherShareholders",
              label: "Other Shareholders",
              fieldName: "otherShareholders",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "shareClassStructure",
              label: "Share Class Structure",
              fieldName: "shareClassStructure",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Ultimate Beneficial Owners",
          fields: [
            {
              id: "primaryUBO",
              label: "Primary UBO",
              fieldName: "primaryUBO",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "secondaryUBO",
              label: "Secondary UBO",
              fieldName: "secondaryUBO",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "uboRegistryFiling",
              label: "UBO Registry Filing",
              fieldName: "uboRegistryFiling",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "uboVerification",
              label: "UBO Verification",
              fieldName: "uboVerification",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "uboChangesLastYear",
              label: "UBO Changes Last Year",
              fieldName: "uboChangesLastYear",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "uboReportingStatus",
              label: "UBO Reporting Status",
              fieldName: "uboReportingStatus",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "licensing",
      title: "Licensing",
      groups: [
        {
          groupName: "Primary Licenses",
          fields: [
            {
              id: "commercialLicense",
              label: "Commercial License",
              fieldName: "commercialLicense",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "licenseType",
              label: "License Type",
              fieldName: "licenseType",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "issuingAuthority",
              label: "Issuing Authority",
              fieldName: "issuingAuthority",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "issueDate",
              label: "Issue Date",
              fieldName: "issueDate",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "expiryDate",
              label: "Expiry Date",
              fieldName: "expiryDate",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "renewalProcess",
              label: "Renewal Process",
              fieldName: "renewalProcess",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Industry-Specific Licenses",
          fields: [
            {
              id: "softwareProviderLicense",
              label: "Software Provider License",
              fieldName: "softwareProviderLicense",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "dataCenterOperations",
              label: "Data Center Operations",
              fieldName: "dataCenterOperations",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "cloudServicesProvider",
              label: "Cloud Services Provider",
              fieldName: "cloudServicesProvider",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "issuingAuthoritySpecific",
              label: "Issuing Authority",
              fieldName: "issuingAuthoritySpecific",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "validityPeriod",
              label: "Validity Period",
              fieldName: "validityPeriod",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "specialConditions",
              label: "Special Conditions",
              fieldName: "specialConditions",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "compliance",
      title: "Compliance",
      groups: [
        {
          groupName: "Regulatory Compliance",
          fields: [
            {
              id: "primaryRegulator",
              label: "Primary Regulator",
              fieldName: "primaryRegulator",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "complianceStatus",
              label: "Compliance Status",
              fieldName: "complianceStatus",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "lastRegulatoryInspection",
              label: "Last Regulatory Inspection",
              fieldName: "lastRegulatoryInspection",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "inspectionOutcome",
              label: "Inspection Outcome",
              fieldName: "inspectionOutcome",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "complianceFramework",
              label: "Compliance Framework",
              fieldName: "complianceFramework",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "regulatoryReporting",
              label: "Regulatory Reporting",
              fieldName: "regulatoryReporting",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Legal Compliance",
          fields: [
            {
              id: "legalStructureReview",
              label: "Legal Structure Review",
              fieldName: "legalStructureReview",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "corporateGovernance",
              label: "Corporate Governance",
              fieldName: "corporateGovernance",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "contractManagement",
              label: "Contract Management",
              fieldName: "contractManagement",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "litigationStatus",
              label: "Litigation Status",
              fieldName: "litigationStatus",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "intellectualProperty",
              label: "Intellectual Property",
              fieldName: "intellectualProperty",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "legalOpinions",
              label: "Legal Opinions",
              fieldName: "legalOpinions",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "industry",
      title: "Industry Classification",
      groups: [
        {
          groupName: "Primary Classification",
          fields: [
            {
              id: "isicCode",
              label: "ISIC Code",
              fieldName: "isicCode",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "isicDescription",
              label: "ISIC Description",
              fieldName: "isicDescription",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "naicsCode",
              label: "NAICS Code",
              fieldName: "naicsCode",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "naicsDescription",
              label: "NAICS Description",
              fieldName: "naicsDescription",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "sicCode",
              label: "SIC Code",
              fieldName: "sicCode",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "industryTier",
              label: "Industry Tier",
              fieldName: "industryTier",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Industry Positioning",
          fields: [
            {
              id: "marketPosition",
              label: "Market Position",
              fieldName: "marketPosition",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "competitiveLandscape",
              label: "Competitive Landscape",
              fieldName: "competitiveLandscape",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "marketShare",
              label: "Market Share",
              fieldName: "marketShare",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "growthRate",
              label: "Growth Rate",
              fieldName: "growthRate",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "industryAssociations",
              label: "Industry Associations",
              fieldName: "industryAssociations",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "industryRecognition",
              label: "Industry Recognition",
              fieldName: "industryRecognition",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "employees",
      title: "Workforce",
      groups: [
        {
          groupName: "Workforce Overview",
          fields: [
            {
              id: "totalEmployees",
              label: "Total Employees",
              fieldName: "totalEmployees",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "fullTimeEmployees",
              label: "Full-time Employees",
              fieldName: "fullTimeEmployees",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "partTimeEmployees",
              label: "Part-time Employees",
              fieldName: "partTimeEmployees",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "emiratizationRate",
              label: "Emiratization Rate",
              fieldName: "emiratizationRate",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "genderDiversity",
              label: "Gender Diversity",
              fieldName: "genderDiversity",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "averageTenure",
              label: "Average Tenure",
              fieldName: "averageTenure",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "HR Management",
          fields: [
            {
              id: "hrSystem",
              label: "HR System",
              fieldName: "hrSystem",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "performanceReviews",
              label: "Performance Reviews",
              fieldName: "performanceReviews",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "compensationStructure",
              label: "Compensation Structure",
              fieldName: "compensationStructure",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "trainingBudget",
              label: "Training Budget",
              fieldName: "trainingBudget",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "employeeTurnover",
              label: "Employee Turnover",
              fieldName: "employeeTurnover",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "successionPlanning",
              label: "Succession Planning",
              fieldName: "successionPlanning",
              mandatory: ["enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "facilities",
      title: "Facilities",
      groups: [
        {
          groupName: "Headquarters",
          fields: [
            {
              id: "hqLocation",
              label: "Location",
              fieldName: "hqLocation",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "hqSize",
              label: "Size",
              fieldName: "hqSize",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "hqCapacity",
              label: "Capacity",
              fieldName: "hqCapacity",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "leaseTerms",
              label: "Lease Terms",
              fieldName: "leaseTerms",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "hqFacilities",
              label: "Facilities",
              fieldName: "hqFacilities",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "specialFeatures",
              label: "Special Features",
              fieldName: "specialFeatures",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Technical Infrastructure",
          fields: [
            {
              id: "dataCenter",
              label: "Data Center",
              fieldName: "dataCenter",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "serverRoom",
              label: "Server Room",
              fieldName: "serverRoom",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "networkInfrastructure",
              label: "Network Infrastructure",
              fieldName: "networkInfrastructure",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "powerBackup",
              label: "Power Backup",
              fieldName: "powerBackup",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "coolingSystems",
              label: "Cooling Systems",
              fieldName: "coolingSystems",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "physicalSecurity",
              label: "Physical Security",
              fieldName: "physicalSecurity",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "products",
      title: "Products & Services",
      groups: [
        {
          groupName: "Core Products",
          fields: [
            {
              id: "productName1",
              label: "Product Name 1",
              fieldName: "productName1",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "productName2",
              label: "Product Name 2",
              fieldName: "productName2",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "productName3",
              label: "Product Name 3",
              fieldName: "productName3",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "productPortfolioAge",
              label: "Product Portfolio Age",
              fieldName: "productPortfolioAge",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Services Offered",
          fields: [
            {
              id: "implementationServices",
              label: "Implementation Services",
              fieldName: "implementationServices",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "managedServices",
              label: "Managed Services",
              fieldName: "managedServices",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "professionalServices",
              label: "Professional Services",
              fieldName: "professionalServices",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "trainingServices",
              label: "Training Services",
              fieldName: "trainingServices",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "supportServices",
              label: "Support Services",
              fieldName: "supportServices",
              mandatory: ["startup", "growth", "mature", "enterprise"],
            },
            {
              id: "serviceLevelAgreements",
              label: "Service Level Agreements",
              fieldName: "serviceLevelAgreements",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
      ],
    },
    {
      id: "certifications",
      title: "Certifications & Awards",
      groups: [
        {
          groupName: "Quality Certifications",
          fields: [
            {
              id: "iso9001",
              label: "ISO 9001:2015",
              fieldName: "iso9001",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "iso27001",
              label: "ISO 27001:2013",
              fieldName: "iso27001",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "iso22301",
              label: "ISO 22301:2019",
              fieldName: "iso22301",
              mandatory: ["enterprise"],
            },
            {
              id: "iso20000",
              label: "ISO 20000-1:2018",
              fieldName: "iso20000",
              mandatory: ["enterprise"],
            },
            {
              id: "cmmiLevel",
              label: "CMMI Level",
              fieldName: "cmmiLevel",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "certificationBody",
              label: "Certification Body",
              fieldName: "certificationBody",
              mandatory: ["mature", "enterprise"],
            },
          ],
        },
        {
          groupName: "Industry Certifications",
          fields: [
            {
              id: "pciDss",
              label: "PCI DSS",
              fieldName: "pciDss",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "soc2",
              label: "SOC 2 Type II",
              fieldName: "soc2",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "csaStar",
              label: "CSA STAR",
              fieldName: "csaStar",
              mandatory: ["enterprise"],
            },
            {
              id: "gdprCompliance",
              label: "GDPR Compliance",
              fieldName: "gdprCompliance",
              mandatory: ["mature", "enterprise"],
            },
            {
              id: "adgmDataProtection",
              label: "ADGM Data Protection",
              fieldName: "adgmDataProtection",
              mandatory: ["growth", "mature", "enterprise"],
            },
            {
              id: "uaeIaCompliance",
              label: "UAE IA Compliance",
              fieldName: "uaeIaCompliance",
              mandatory: ["growth", "mature", "enterprise"],
            },
          ],
        },
      ],
    },
  ],
};

// Helper function to get section metadata for sidebar and overview
// export const getSectionsMetadata = () => {
//   return profileConfig.tabs.map((tab) => ({
//     id: tab.id,
//     title: tab.title,
//   }));
// };

// Get section configuration by ID
// export const getSectionConfigById = (sectionId) => {
//   return profileConfig.tabs.find((tab) => tab.id === sectionId);
// };

// Check if a field is mandatory for a given company stage
export const isFieldMandatory = (field, companyStage) => {
  return field.mandatory && field.mandatory.includes(companyStage);
};

// Get company stage information by ID
export const getCompanyStageById = (stageId) => {
  return profileConfig.companyStages.find((stage) => stage.id === stageId);
};

// Get all mandatory fields for a given company stage
export const getMandatoryFieldsForStage = (stageId) => {
  const mandatoryFields: any = [];
  profileConfig.tabs.forEach((tab) => {
    tab.groups.forEach((group) => {
      group.fields.forEach((field) => {
        if (isFieldMandatory(field, stageId)) {
          mandatoryFields.push({
            tabId: tab.id,
            groupName: group.groupName,
            ...field,
          } as any);
        }
      });
    });
  });
  return mandatoryFields;
};

// Check completion of mandatory fields for a company stage
export const checkMandatoryFieldsCompletion = (profileData, companyStage) => {
  const mandatoryFields = getMandatoryFieldsForStage(companyStage);
  const missingFields: any = [];
  mandatoryFields.forEach((field) => {
    const sectionData = profileData.sections[field.tabId];
    if (
      !sectionData ||
      !sectionData.fields ||
      !sectionData.fields[field.fieldName] ||
      sectionData.fields[field.fieldName].trim() === ""
    ) {
      missingFields.push(field);
    }
  });
  return {
    total: mandatoryFields.length,
    completed: mandatoryFields.length - missingFields.length,
    missing: missingFields,
  };
};
