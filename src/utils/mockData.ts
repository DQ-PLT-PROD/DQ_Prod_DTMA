// Mock data for the Course Marketplace
export interface ProviderType {
  name: string;
  logoUrl: string;
  description: string;
}
export interface CourseType {
  id: string;
  title: string;
  description: string;
  category: string;
  deliveryMode: string;
  duration: string;
  durationType: string;
  businessStage: string;
  provider: ProviderType;
  learningOutcomes: string[];
  startDate: string;
  price?: string;
  location?: string;
  thumbnailUrl?: string;
  introVideoUrl?: string;
  rating?: number;
  reviewCount?: number;
}
// Categories
export const categories = [
  "Entrepreneurship",
  "Compliance",
  "Finance",
  "Technology",
  "Marketing",
  "Operations",
  "HR",
  "Leadership",
];
// Delivery Modes
export const deliveryModes = ["Online", "In-person", "Hybrid"];
// Durations
export const durations = [
  {
    value: "Short",
    label: "Short (<1 week)",
  },
  {
    value: "Medium",
    label: "Medium (1-4 weeks)",
  },
  {
    value: "Long",
    label: "Long (1+ month)",
  },
];
// Business Stages
export const businessStages = [
  "Conception",
  "Growth",
  "Maturity",
  "Restructuring",
];
// Providers
export const providers = [
  {
    name: "Khalifa Fund Academy",
    logoUrl: "https://media.licdn.com/dms/image/v2/D4D0BAQEm7hh-vPHtNg/company-logo_200_200/company-logo_200_200/0/1730726304605/khalifa_fund_logo?e=2147483647&v=beta&t=AtpC5HexpPIneFytzHCc6-wjOCF9u0ShL3s5GXPW8K8",
    description:
      "Khalifa Fund for Enterprise Development is an independent, not-for-profit small and medium enterprises (SMEs) socio-economic development organization established in 2007.",
  },
  {
    name: "ADGM Academy",
    logoUrl:
      "https://images.squarespace-cdn.com/content/v1/5cc0e1e9a0cd27177a2dd7ec/1556171141973-2BKLJ7QWZM0RN9Y1DKBY/ADGM+Academy.png",
    description:
      "ADGM Academy is the knowledge arm of Abu Dhabi Global Market (ADGM), the International Financial Centre of Abu Dhabi.",
  },
  {
    name: "Hub71",
    logoUrl: "https://hub71.com/wp-content/uploads/2023/05/hub71-logo-1.png",
    description:
      "Hub71 is a global tech ecosystem that enables startups to scale globally from Abu Dhabi.",
  },
  {
    name: "NYU Abu Dhabi",
    logoUrl:
      "https://nyuad.nyu.edu/content/dam/nyuad/departments/public-affairs/logos/NYUAD-logo-color.png",
    description:
      "NYU Abu Dhabi is a degree-granting research university with a fully integrated liberal arts and science college.",
  },
  {
    name: "Google for Startups",
    logoUrl:
      "https://storage.googleapis.com/cms-storage-bucket/6e19fee6b47b36ca613f.png",
    description:
      "Google for Startups connects startups with the right people, products, and best practices to help them grow.",
  },
];
// Mock Courses (legacy dataset — not used by /marketplace/courses)
export const mockCourses: CourseType[] = [
  {
    id: "1",
    title: "Business Plan Development",
    description:
      "Learn how to create a comprehensive business plan that will help you secure funding and guide your business growth. This course covers market research, financial projections, and strategic planning.",
    category: "Entrepreneurship",
    deliveryMode: "Online",
    duration: "2 weeks",
    durationType: "Medium",
    businessStage: "Conception",
    provider: providers[0],
    learningOutcomes: [
      "Develop a comprehensive business plan",
      "Create realistic financial projections",
      "Conduct effective market research",
      "Craft a compelling executive summary",
      "Present your business plan to potential investors",
    ],
    startDate: "January 15, 2024",
    price: "AED 1,500",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "2",
    title: "Financial Management for SMEs",
    description:
      "Master the essentials of financial management for small and medium enterprises. This course covers budgeting, cash flow management, financial analysis, and strategic financial planning.",
    category: "Finance",
    deliveryMode: "Hybrid",
    duration: "4 weeks",
    durationType: "Medium",
    businessStage: "Growth",
    provider: providers[1],
    learningOutcomes: [
      "Create and manage effective budgets",
      "Develop cash flow forecasts and management strategies",
      "Analyze financial statements to make informed decisions",
      "Implement cost-saving measures",
      "Understand financial risks and mitigation strategies",
    ],
    startDate: "February 1, 2024",
    price: "AED 2,200",
    thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2626&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "3",
    title: "Digital Marketing Fundamentals",
    description:
      "Develop a comprehensive digital marketing strategy for your business. Learn about SEO, social media marketing, content creation, email marketing, and analytics to drive growth and engagement.",
    category: "Marketing",
    deliveryMode: "Online",
    duration: "3 weeks",
    durationType: "Medium",
    businessStage: "Growth",
    provider: providers[2],
    learningOutcomes: [
      "Create a comprehensive digital marketing strategy",
      "Implement effective SEO techniques",
      "Develop engaging social media campaigns",
      "Design effective email marketing sequences",
      "Analyze marketing performance using analytics tools",
    ],
    startDate: "January 22, 2024",
    price: "AED 1,800",
    thumbnailUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "4",
    title: "Leadership Excellence",
    description:
      "Develop essential leadership skills to effectively manage teams and drive organizational success. This course focuses on communication, motivation, delegation, and strategic decision-making.",
    category: "Leadership",
    deliveryMode: "In-person",
    duration: "2 days",
    durationType: "Short",
    businessStage: "Maturity",
    provider: providers[3],
    learningOutcomes: [
      "Develop effective leadership communication skills",
      "Learn techniques for motivating and engaging team members",
      "Master the art of delegation and empowerment",
      "Implement strategic decision-making frameworks",
      "Create a positive and productive work culture",
    ],
    startDate: "March 5, 2024",
    price: "AED 3,500",
    location: "NYU Abu Dhabi Campus",
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: "5",
    title: "Compliance and Legal Essentials",
    description:
      "Navigate the legal and regulatory landscape for businesses in the UAE. This comprehensive course covers business laws, licensing requirements, employment regulations, and compliance best practices.",
    category: "Compliance",
    deliveryMode: "Hybrid",
    duration: "5 weeks",
    durationType: "Long",
    businessStage: "Conception",
    provider: providers[1],
    learningOutcomes: [
      "Understand UAE business laws and regulations",
      "Navigate licensing and permit requirements",
      "Implement compliance best practices",
      "Manage employment contracts and labor laws",
      "Mitigate legal risks in business operations",
    ],
    startDate: "February 15, 2024",
    price: "AED 2,800",
    thumbnailUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2612&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: "6",
    title: "E-commerce Implementation",
    description:
      "Build and optimize an e-commerce platform for your business. Learn about platform selection, payment integration, inventory management, customer experience, and digital marketing strategies specific to e-commerce.",
    category: "Technology",
    deliveryMode: "Online",
    duration: "6 weeks",
    durationType: "Long",
    businessStage: "Growth",
    provider: providers[4],
    learningOutcomes: [
      "Select the right e-commerce platform for your business",
      "Implement secure payment processing systems",
      "Develop effective inventory management strategies",
      "Optimize the customer journey and experience",
      "Create e-commerce specific marketing campaigns",
    ],
    startDate: "March 1, 2024",
    price: "Free",
    thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: "7",
    title: "Supply Chain Optimization",
    description:
      "Streamline your business operations with effective supply chain management strategies. This course covers procurement, inventory management, logistics, supplier relationships, and technology integration.",
    category: "Operations",
    deliveryMode: "In-person",
    duration: "3 days",
    durationType: "Short",
    businessStage: "Maturity",
    provider: providers[0],
    learningOutcomes: [
      "Optimize procurement processes and costs",
      "Implement effective inventory management systems",
      "Streamline logistics and distribution channels",
      "Develop strong supplier relationships",
      "Integrate technology solutions for supply chain visibility",
    ],
    startDate: "April 10, 2024",
    price: "AED 2,500",
    location: "Khalifa Fund Headquarters, Abu Dhabi",
    thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
  {
    id: "8",
    title: "HR Management for Growing Businesses",
    description:
      "Develop effective human resources strategies as your business grows. This course covers recruitment, onboarding, performance management, employee development, and creating a positive workplace culture.",
    category: "HR",
    deliveryMode: "Hybrid",
    duration: "4 weeks",
    durationType: "Medium",
    businessStage: "Growth",
    provider: providers[3],
    learningOutcomes: [
      "Create effective recruitment and selection processes",
      "Develop comprehensive onboarding programs",
      "Implement performance management systems",
      "Design employee development and retention strategies",
      "Build a positive and inclusive workplace culture",
    ],
    startDate: "February 20, 2024",
    price: "AED 2,000",
    thumbnailUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2684&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
  {
    id: "9",
    title: "Business Restructuring Strategies",
    description:
      "Navigate the challenges of business restructuring with strategic approaches to organizational change. This course covers financial restructuring, operational transformation, change management, and communication strategies.",
    category: "Entrepreneurship",
    deliveryMode: "Online",
    duration: "8 weeks",
    durationType: "Long",
    businessStage: "Restructuring",
    provider: providers[2],
    learningOutcomes: [
      "Develop comprehensive restructuring plans",
      "Implement financial restructuring strategies",
      "Execute operational transformation initiatives",
      "Manage change effectively throughout the organization",
      "Create clear communication plans for stakeholders",
    ],
    startDate: "March 15, 2024",
    price: "AED 3,200",
    thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  },
  {
    id: "10",
    title: "Data Analytics for Business Decisions",
    description:
      "Harness the power of data to make informed business decisions. This course covers data collection, analysis techniques, visualization tools, and implementing data-driven strategies across your organization.",
    category: "Technology",
    deliveryMode: "Online",
    duration: "5 weeks",
    durationType: "Long",
    businessStage: "Growth",
    provider: providers[4],
    learningOutcomes: [
      "Implement effective data collection methods",
      "Apply appropriate data analysis techniques",
      "Create compelling data visualizations",
      "Develop data-driven decision-making processes",
      "Integrate analytics into business strategy",
    ],
    startDate: "April 1, 2024",
    price: "Free",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },
  {
    id: "11",
    title: "Strategic Marketing Planning",
    description:
      "Develop a comprehensive marketing strategy aligned with your business goals. This course covers market analysis, brand positioning, marketing mix development, campaign planning, and performance measurement.",
    category: "Marketing",
    deliveryMode: "Hybrid",
    duration: "3 weeks",
    durationType: "Medium",
    businessStage: "Maturity",
    provider: providers[0],
    learningOutcomes: [
      "Conduct thorough market and competitor analysis",
      "Develop effective brand positioning strategies",
      "Create comprehensive marketing mix plans",
      "Design and implement marketing campaigns",
      "Measure and optimize marketing performance",
    ],
    startDate: "February 5, 2024",
    price: "AED 2,100",
    thumbnailUrl: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  },
  {
    id: "12",
    title: "Financial Planning for Business Expansion",
    description:
      "Prepare your business for growth with strategic financial planning. This course covers funding options, investment analysis, risk assessment, financial forecasting, and capital allocation strategies.",
    category: "Finance",
    deliveryMode: "In-person",
    duration: "2 weeks",
    durationType: "Medium",
    businessStage: "Growth",
    provider: providers[1],
    learningOutcomes: [
      "Identify and evaluate appropriate funding options",
      "Conduct investment analysis for expansion opportunities",
      "Assess and mitigate financial risks",
      "Develop accurate financial forecasts",
      "Create effective capital allocation strategies",
    ],
    startDate: "March 10, 2024",
    price: "AED 2,800",
    location: "ADGM Academy, Abu Dhabi",
    thumbnailUrl: "https://images.unsplash.com/photo-1565514020176-dbf2277f18f3?q=80&w=2670&auto=format&fit=crop",
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  },
  {
    id: "ai-working-era",
    title: "Leading in the AI Working Era",
    description:
      "Build a strategic lens for AI-enabled transformation and align teams around measurable outcomes with Digital Qatalyst's 6XD playbooks.",
    category: "Leadership",
    deliveryMode: "Online",
    duration: "3 weeks",
    durationType: "Medium",
    businessStage: "Growth",
    provider: providers[0],
    learningOutcomes: [
      "Mobilize teams around AI-enabled initiatives",
      "Translate the 6XD Framework into execution plans",
      "Align transformation investments to measurable outcomes",
      "Coach leaders to adopt AI-ready mindsets",
      "Measure and iterate on AI era KPIs",
    ],
    startDate: "April 10, 2024",
    price: "AED 2,000",
  },
  {
    id: "digital-workflows",
    title: "Designing Digital Workflows",
    description:
      "Redesign the flow of work with intelligent automation, data insights, and human-centred practices tailored for digital workers.",
    category: "Operations",
    deliveryMode: "Hybrid",
    duration: "4 weeks",
    durationType: "Medium",
    businessStage: "Growth",
    provider: providers[2],
    learningOutcomes: [
      "Map current workflows and identify automation opportunities",
      "Apply human-in-the-loop design principles",
      "Deploy no-code automation accelerators",
      "Measure efficiency gains and employee sentiment",
      "Create a roadmap for digital worker enablement",
    ],
    startDate: "May 6, 2024",
    price: "AED 2,400",
  },
  {
    id: "platform-thinking-101",
    title: "Platform Thinking 101",
    description:
      "Shift from products to platforms by exploring operating models, value exchanges, and ecosystem design strategies.",
    category: "Strategy",
    deliveryMode: "Online",
    duration: "2 weeks",
    durationType: "Short",
    businessStage: "Growth",
    provider: providers[3],
    learningOutcomes: [
      "Differentiate between product and platform plays",
      "Design multi-sided value propositions",
      "Map ecosystem incentives and governance",
      "Plan phased platform launches",
      "Build monetization and data strategies",
    ],
    startDate: "April 24, 2024",
    price: "AED 1,750",
  },
  {
    id: "economy-4-0-fundamentals",
    title: "Economy 4.0 Fundamentals",
    description:
      "Understand the macro shifts defining the AI economy and how they reshape competitiveness for modern leaders.",
    category: "Economics",
    deliveryMode: "Online",
    duration: "3 weeks",
    durationType: "Medium",
    businessStage: "Conception",
    provider: providers[1],
    learningOutcomes: [
      "Identify Economy 4.0 policy and market levers",
      "Translate macro trends into enterprise strategy",
      "Evaluate regional readiness indicators",
      "Prioritize capability investments by dimension",
      "Craft executive narratives for stakeholders",
    ],
    startDate: "May 20, 2024",
    price: "AED 1,600",
  },
  {
    id: "digital-accelerators-toolkit",
    title: "Digital Accelerators Toolkit",
    description:
      "Get hands-on with Digital Qatalyst accelerators to execute transformation efficiently and scale momentum.",
    category: "Technology",
    deliveryMode: "Hybrid",
    duration: "4 weeks",
    durationType: "Medium",
    businessStage: "Maturity",
    provider: providers[4] ?? providers[0],
    learningOutcomes: [
      "Deploy DQ accelerators for process redesign",
      "Integrate AI copilots into daily operations",
      "Measure ROI of accelerators using D6 scorecards",
      "Enable teams through templates and playbooks",
      "Scale accelerators across multiple initiatives",
    ],
    startDate: "June 3, 2024",
    price: "AED 2,600",
  },
];

// Helper function to assign random statuses to fields
const assignFieldStatuses = (fields: any) => {
  const statuses = ["locked", "editable", "completed"];
  return fields.map((field: any) => ({
    ...field,
    status:
      field.status || statuses[Math.floor(Math.random() * statuses.length)], // Randomly assign a status
  }));
};

// Add some empty fields to demonstrate placeholder styling
const addEmptyFields = (groups: any) => {
  return groups.map((group: any) => {
    const updatedFields = group.fields.map((field: any, index: any) => {
      // Make some fields empty (roughly 10%)
      if (index % 10 === 0) {
        return { ...field, value: "" };
      }
      return field;
    });
    return { ...group, fields: updatedFields };
  });
};

// Apply status to all fields in all groups
export const mockProfileData = {
  basic: addEmptyFields([
    {
      groupName: "Company Identification",
      fields: assignFieldStatuses([
        { label: "Trade Name", value: "FutureTech" },
        { label: "Registration Number", value: "FT12345678" },
        { label: "Establishment Date", value: "15-Mar-2010" },
        { label: "Entity Type", value: "Limited Liability Company" },
        {
          label: "Registration Authority",
          value: "ADGM Registration Authority",
        },
        { label: "Legal Status", value: "Active" },
      ]),
    },
    {
      groupName: "Business Details",
      fields: assignFieldStatuses([
        { label: "Business Type", value: "Limited Liability Company" },
        { label: "Industry", value: "Information Technology" },
        { label: "Business Size", value: "Medium Enterprise" },
        { label: "Annual Revenue", value: "AED25M - AED50M" },
        { label: "Number of Employees", value: "120" },
        {
          label: "Business Description",
          value:
            "Enterprise software solutions specializing in cloud-based enterprise management systems with AI-driven analytics capabilities. Our flagship products serve various industries including finance, healthcare, and manufacturing.",
        },
      ]),
    },
    {
      groupName: "Status Information",
      fields: assignFieldStatuses([
        { label: "License Expiry", value: "31-Dec-2023" },
        { label: "Renewal Status", value: "Pending" },
        { label: "Compliance Status", value: "Compliant" },
        { label: "Last Updated", value: "10-Jun-2025" },
      ]),
    },
    {
      groupName: "Classification",
      fields: assignFieldStatuses([
        { label: "Primary ISIC Code", value: "6201" },
        {
          label: "Primary ISIC Description",
          value: "Computer programming activities",
        },
        { label: "Secondary ISIC Code", value: "6202" },
        { label: "Business Category", value: "Technology" },
        { label: "Market Segment", value: "Enterprise Solutions" },
      ]),
    },
    {
      groupName: "Identifiers",
      fields: assignFieldStatuses([
        { label: "VAT Registration Number", value: "100123456700003" },
        { label: "Commercial License Number", value: "CN-12345" },
        { label: "DUNS Number", value: "123456789" },
        { label: "LEI Code", value: "984500B38RH80URRT231" },
        { label: "Chamber of Commerce Number", value: "ADCCI-12345" },
      ]),
    },
    {
      groupName: "Needs & Aspirations",
      fields: assignFieldStatuses([
        {
          label: "5-Year Vision",
          value:
            "To become the leading enterprise software provider in the MENA region, with a focus on AI-driven solutions that transform business operations across industries.",
        },
        {
          label: "Investment Goals",
          value: "AED15M by Q2 2024 (Series B) - 60% complete",
        },
        {
          label: "Technology Roadmap",
          value:
            "2023 Q4: Launch AI analytics platform\n2024 Q2: Expand IoT integration capabilities\n2024 Q4: Develop industry-specific solutions for healthcare\n2025: Blockchain integration for secure transactions",
        },
      ]),
    },
  ]),
  contact: addEmptyFields([
    {
      groupName: "Primary Contact",
      fields: assignFieldStatuses([
        { label: "Contact Name", value: "John Smith" },
        { label: "Position", value: "Chief Executive Officer" },
        { label: "Email", value: "jsmith.futuretech@gmail.com" },
        { label: "Phone", value: "+971 50 123 4567" },
        { label: "Nationality", value: "British" },
        { label: "Languages", value: "English, Arabic" },
      ]),
    },
    {
      groupName: "Business Address",
      fields: [
        { label: "Address Line 1", value: "Level 42, Al Maqam Tower" },
        { label: "Address Line 2", value: "ADGM Square, Al Maryah Island" },
        { label: "City", value: "Abu Dhabi" },
        { label: "Country", value: "United Arab Emirates" },
        { label: "P.O. Box", value: "P.O. Box 12345" },
        { label: "Geo Coordinates", value: "24.4991° N, 54.3816° E" },
      ],
    },
    {
      groupName: "Communication",
      fields: [
        { label: "Main Phone", value: "+971 2 123 4567" },
        { label: "Website", value: "www.futuretech.com" },
        { label: "General Email", value: "info@futuretech.com" },
        { label: "Support Email", value: "support@futuretech.com" },
        { label: "Fax", value: "+971 2 123 4568" },
        { label: "Social Media", value: "@futuretechllc" },
      ],
    },
    {
      groupName: "Secondary Contact",
      fields: [
        { label: "Contact Name", value: "Sarah Johnson" },
        { label: "Position", value: "Chief Operations Officer" },
        { label: "Email", value: "sarah.johnson@futuretech.com" },
        { label: "Phone", value: "+971 50 987 6543" },
        { label: "Nationality", value: "American" },
        { label: "Languages", value: "English" },
      ],
    },
    {
      groupName: "Emergency Contact",
      fields: [
        { label: "Contact Name", value: "Ahmed Al Mansoori" },
        { label: "Position", value: "Security Manager" },
        { label: "Email", value: "ahmed.m@futuretech.com" },
        { label: "Phone", value: "+971 50 555 1234" },
        { label: "Available Hours", value: "24/7" },
        { label: "Priority Level", value: "High" },
      ],
    },
  ]),
  legal: addEmptyFields([
    {
      groupName: "Legal Structure",
      fields: [
        { label: "Legal Form", value: "Limited Liability Company" },
        { label: "Jurisdiction", value: "Abu Dhabi Global Market (ADGM)" },
        {
          label: "Registration Authority",
          value: "ADGM Registration Authority",
        },
        { label: "Governing Law", value: "ADGM Companies Regulations 2020" },
        { label: "Foreign Branch Status", value: "Not Applicable" },
        { label: "Legal Capacity", value: "Full" },
      ],
    },
    {
      groupName: "Tax Information",
      fields: [
        { label: "Tax Registration Number", value: "100123456700003" },
        { label: "Tax Status", value: "Compliant" },
        { label: "Last Filing Date", value: "31-Mar-2023" },
        { label: "Tax Jurisdiction", value: "UAE" },
        { label: "VAT Registration Date", value: "01-Jan-2018" },
        { label: "Tax Year End", value: "31-Dec" },
      ],
    },
    {
      groupName: "Corporate Governance",
      fields: [
        { label: "Board Size", value: "5 Directors" },
        { label: "Board Meeting Frequency", value: "Quarterly" },
        { label: "Corporate Secretary", value: "Legal Associates LLC" },
        { label: "Articles Last Updated", value: "15-Jan-2022" },
        {
          label: "Governance Framework",
          value: "ADGM Corporate Governance Framework",
        },
        { label: "Shareholder Agreement", value: "In place - 12-Mar-2020" },
      ],
    },
    {
      groupName: "Regulatory Compliance",
      fields: [
        {
          label: "Primary Regulator",
          value: "Financial Services Regulatory Authority",
        },
        { label: "Regulatory Status", value: "Compliant" },
        { label: "Last Inspection Date", value: "05-May-2022" },
        { label: "Special Licenses", value: "Data Protection Registration" },
        { label: "Compliance Officer", value: "Fatima Al Zaabi" },
        {
          label: "Regulatory Reports Due",
          value: "Quarterly Financial Reports",
        },
      ],
    },
    {
      groupName: "Legal Representation",
      fields: [
        { label: "External Legal Counsel", value: "Global Legal Partners LLP" },
        {
          label: "Internal Legal Contact",
          value: "Mohammed Hassan, Legal Director",
        },
        {
          label: "Power of Attorney Holders",
          value: "John Smith, Sarah Johnson",
        },
        {
          label: "Legal Authority Limits",
          value: "As per Delegation of Authority Matrix",
        },
        { label: "Jurisdiction for Disputes", value: "ADGM Courts" },
        { label: "Arbitration Clause", value: "ADGM Arbitration Centre" },
      ],
    },
  ]),
  financial: addEmptyFields([
    {
      groupName: "Financial Overview",
      fields: [
        { label: "Annual Revenue", value: "AED38.5 Million" },
        { label: "Total Assets", value: "AED42.7 Million" },
        { label: "Fiscal Year End", value: "31 December" },
        { label: "Revenue Growth YoY", value: "12.4%" },
        { label: "Profit Margin", value: "18.7%" },
        { label: "EBITDA", value: "AED7.2 Million" },
      ],
    },
    {
      groupName: "Banking Information",
      fields: [
        { label: "Primary Bank", value: "Abu Dhabi Commercial Bank" },
        { label: "Account Manager", value: "Khalid Al Naqbi" },
        { label: "Banking Relationship Since", value: "2010" },
        { label: "Number of Accounts", value: "5" },
        { label: "Credit Facilities", value: "Trade Finance, Overdraft" },
        { label: "Treasury Services", value: "FX, Cash Management" },
      ],
    },
    {
      groupName: "Financial Reporting",
      fields: [
        { label: "Accounting Standards", value: "IFRS" },
        { label: "External Auditor", value: "KPMG" },
        { label: "Last Audit Date", value: "15-Feb-2023" },
        { label: "Audit Opinion", value: "Unqualified" },
        { label: "Reporting Currency", value: "AED" },
        { label: "Consolidated Statements", value: "Yes" },
      ],
    },
    {
      groupName: "Capital Structure",
      fields: [
        { label: "Authorized Capital", value: "AED50 Million" },
        { label: "Paid-up Capital", value: "AED25 Million" },
        { label: "Number of Shares", value: "2,500,000" },
        { label: "Par Value per Share", value: "AED10" },
        { label: "Debt-to-Equity Ratio", value: "0.8" },
        { label: "Last Capital Increase", value: "10-Jun-2020" },
      ],
    },
    {
      groupName: "Financial Metrics",
      fields: [
        { label: "Current Ratio", value: "2.3" },
        { label: "Quick Ratio", value: "1.8" },
        { label: "Return on Assets", value: "15.2%" },
        { label: "Return on Equity", value: "22.4%" },
        { label: "Inventory Turnover", value: "8.5" },
        { label: "Days Sales Outstanding", value: "45 days" },
      ],
    },
  ]),
  operational: addEmptyFields([
    {
      groupName: "Business Operations",
      fields: [
        { label: "Operating Model", value: "Product & Services" },
        { label: "Business Hours", value: "Sun-Thu, 8:00 AM - 5:00 PM" },
        { label: "Operational Since", value: "April 2010" },
        { label: "Service Level Agreements", value: "99.9% Uptime Guarantee" },
        {
          label: "Quality Management System",
          value: "ISO 9001:2015 Certified",
        },
        { label: "Business Continuity Plan", value: "Updated Quarterly" },
      ],
    },
    {
      groupName: "Supply Chain",
      fields: [
        { label: "Key Suppliers", value: "5 Tier-1 Suppliers" },
        { label: "Supply Chain Model", value: "Just-in-Time" },
        { label: "Procurement Process", value: "Digital Procurement Platform" },
        { label: "Average Lead Time", value: "14 days" },
        { label: "Supplier Locations", value: "UAE, USA, Germany, Singapore" },
        {
          label: "Supplier Management",
          value: "Quarterly Performance Reviews",
        },
      ],
    },
    {
      groupName: "Infrastructure",
      fields: [
        { label: "IT Infrastructure", value: "Cloud-based (AWS, Azure)" },
        { label: "Physical Infrastructure", value: "2 Offices, 1 Data Center" },
        { label: "Disaster Recovery", value: "Hot Site in Dubai" },
        { label: "Network Capacity", value: "10 Gbps Redundant" },
        { label: "Server Environment", value: "Virtualized, Containerized" },
        { label: "Backup Systems", value: "Daily Incremental, Weekly Full" },
      ],
    },
    {
      groupName: "Key Processes",
      fields: [
        {
          label: "Core Processes",
          value: "Software Development, Implementation, Support",
        },
        { label: "Process Framework", value: "ITIL v4" },
        { label: "Process Documentation", value: "Digital Process Repository" },
        { label: "Process Automation Level", value: "75% Automated" },
        {
          label: "Process KPIs",
          value: "Cycle Time, Defect Rate, Customer Satisfaction",
        },
        { label: "Process Improvement", value: "Six Sigma, Lean" },
      ],
    },
    {
      groupName: "Operational Metrics",
      fields: [
        { label: "On-time Delivery", value: "97.5%" },
        { label: "First-time Resolution", value: "85.3%" },
        { label: "Customer Satisfaction", value: "4.7/5.0" },
        { label: "Operational Efficiency", value: "82%" },
        { label: "Incident Response Time", value: "< 2 hours" },
        { label: "System Availability", value: "99.98%" },
      ],
    },
  ]),
  ownership: addEmptyFields([
    {
      groupName: "Shareholder Information",
      fields: [
        { label: "Major Shareholder", value: "Global Tech Ventures (51%)" },
        { label: "Local Partner", value: "Abu Dhabi Investments LLC (24%)" },
        { label: "Founder Shares", value: "John Smith (15%)" },
        { label: "Employee Stock Ownership", value: "5%" },
        { label: "Other Shareholders", value: "5%" },
        { label: "Share Class Structure", value: "Class A & B Shares" },
      ],
    },
    {
      groupName: "Ultimate Beneficial Owners",
      fields: [
        {
          label: "Primary UBO",
          value: "Richard Williams (35% of Global Tech Ventures)",
        },
        {
          label: "Secondary UBO",
          value: "Sheikh Mohammed Al Nahyan (100% of Abu Dhabi Investments)",
        },
        { label: "UBO Registry Filing", value: "Completed - 10-Jan-2023" },
        { label: "UBO Verification", value: "KYC Completed" },
        { label: "UBO Changes Last Year", value: "None" },
        { label: "UBO Reporting Status", value: "Compliant" },
      ],
    },
    {
      groupName: "Corporate Structure",
      fields: [
        {
          label: "Parent Company",
          value: "Global Tech Holdings Ltd (Cayman Islands)",
        },
        {
          label: "Subsidiaries",
          value: "FutureTech Saudi LLC, FutureTech Egypt Ltd",
        },
        {
          label: "Affiliated Companies",
          value: "DataSync Technologies, CloudEra Solutions",
        },
        { label: "Holding Structure", value: "3-Tier Holding Structure" },
        { label: "Group Organization Chart", value: "Updated 05-Mar-2023" },
        {
          label: "Intercompany Agreements",
          value: "Service Level Agreements, IP Licensing",
        },
      ],
    },
    {
      groupName: "Ownership Changes",
      fields: [
        { label: "Last Ownership Change", value: "15-Aug-2021" },
        { label: "Nature of Change", value: "Secondary Share Sale (10%)" },
        { label: "Previous Major Owner", value: "Tech Ventures Capital" },
        { label: "Ownership Stability", value: "Stable since 2021" },
        { label: "Planned Changes", value: "None Disclosed" },
        {
          label: "Share Transfer Restrictions",
          value: "Right of First Refusal, Tag-Along Rights",
        },
      ],
    },
    {
      groupName: "Governance Rights",
      fields: [
        { label: "Voting Rights", value: "One Share, One Vote" },
        {
          label: "Board Representation",
          value: "GTV: 3 seats, ADI: 1 seat, Founder: 1 seat",
        },
        {
          label: "Special Voting Rights",
          value: "Class B (Founder) shares have 10x voting power",
        },
        { label: "Veto Rights", value: "Major Shareholders on Key Decisions" },
        { label: "Dividend Rights", value: "Pro-rata to Shareholding" },
        {
          label: "Information Rights",
          value: "Monthly Reports to Major Shareholders",
        },
      ],
    },
  ]),
  licensing: addEmptyFields([
    {
      groupName: "Primary Licenses",
      fields: [
        { label: "Commercial License", value: "ADGM-CL-12345" },
        { label: "License Type", value: "Technology Services Provider" },
        { label: "Issuing Authority", value: "ADGM Registration Authority" },
        { label: "Issue Date", value: "15-Mar-2010" },
        { label: "Expiry Date", value: "31-Dec-2023" },
        { label: "Renewal Process", value: "Annual Renewal Required" },
      ],
    },
    {
      groupName: "Industry-Specific Licenses",
      fields: [
        { label: "Software Provider License", value: "TRA-SP-7890" },
        { label: "Data Center Operations", value: "TRA-DC-4567" },
        { label: "Cloud Services Provider", value: "TRA-CSP-5678" },
        {
          label: "Issuing Authority",
          value: "Telecommunications Regulatory Authority",
        },
        { label: "Validity Period", value: "3 Years" },
        {
          label: "Special Conditions",
          value: "Local Data Storage Requirements",
        },
      ],
    },
    {
      groupName: "Permits & Authorizations",
      fields: [
        { label: "Establishment Card", value: "MOL-12345678" },
        { label: "Immigration Establishment", value: "ICA-87654321" },
        { label: "Commercial Signage Permit", value: "ADM-SG-54321" },
        { label: "Civil Defense Permit", value: "CD-2023-12345" },
        { label: "Environmental Permit", value: "EAD-2023-7890" },
        { label: "Special Activity Permit", value: "ADDED-SA-34567" },
      ],
    },
    {
      groupName: "International Authorizations",
      fields: [
        {
          label: "Export Control Compliance",
          value: "US BIS Compliance Program",
        },
        { label: "EU GDPR Compliance", value: "Registered Data Controller" },
        { label: "ISO 27001 Certification", value: "Valid until 15-Jun-2025" },
        { label: "PCI DSS Compliance", value: "Level 1 Service Provider" },
        { label: "SOC 2 Type II", value: "Annual Audit Completed" },
        {
          label: "Cross-Border Data Transfer",
          value: "Authorized under ADGM Data Protection",
        },
      ],
    },
    {
      groupName: "License Management",
      fields: [
        { label: "License Manager", value: "Fatima Al Zaabi" },
        { label: "Renewal Calendar", value: "Automated Tracking System" },
        { label: "Compliance Monitoring", value: "Quarterly Internal Audits" },
        {
          label: "License Repository",
          value: "Digital Document Management System",
        },
        { label: "Last Compliance Review", value: "05-May-2023" },
        { label: "Licensing Budget", value: "AED125,000 Annual" },
      ],
    },
  ]),
  compliance: addEmptyFields([
    {
      groupName: "Regulatory Compliance",
      fields: [
        {
          label: "Primary Regulator",
          value: "ADGM Financial Services Regulatory Authority",
        },
        { label: "Compliance Status", value: "Fully Compliant" },
        { label: "Last Regulatory Inspection", value: "10-Nov-2022" },
        { label: "Inspection Outcome", value: "No Major Findings" },
        { label: "Compliance Framework", value: "ADGM Compliance Framework" },
        { label: "Regulatory Reporting", value: "Quarterly Reports Submitted" },
      ],
    },
    {
      groupName: "Legal Compliance",
      fields: [
        {
          label: "Legal Structure Review",
          value: "Annual - Last: 15-Jan-2023",
        },
        {
          label: "Corporate Governance",
          value: "Compliant with ADGM Requirements",
        },
        { label: "Contract Management", value: "Digital Contract Repository" },
        { label: "Litigation Status", value: "No Active Litigation" },
        { label: "Intellectual Property", value: "All IP Properly Registered" },
        { label: "Legal Opinions", value: "Clean Legal Opinions on Structure" },
      ],
    },
    {
      groupName: "Financial Compliance",
      fields: [
        { label: "Anti-Money Laundering", value: "AML Program in Place" },
        {
          label: "KYC Procedures",
          value: "Enhanced Due Diligence for High-Risk Clients",
        },
        { label: "Financial Reporting", value: "IFRS Compliant" },
        { label: "Tax Compliance", value: "All Filings Up-to-Date" },
        { label: "Financial Audits", value: "Annual External Audit" },
        { label: "Treasury Controls", value: "Dual Authorization System" },
      ],
    },
    {
      groupName: "Industry Compliance",
      fields: [
        { label: "Data Protection", value: "ADGM Data Protection Regulations" },
        { label: "Information Security", value: "ISO 27001 Certified" },
        { label: "Quality Management", value: "ISO 9001 Certified" },
        { label: "Business Continuity", value: "ISO 22301 Compliant" },
        { label: "Industry Standards", value: "NIST Cybersecurity Framework" },
        { label: "Technical Compliance", value: "TRA Technical Standards" },
      ],
    },
    {
      groupName: "Compliance History",
      fields: [
        { label: "Regulatory Actions", value: "None in Last 5 Years" },
        {
          label: "Compliance Violations",
          value: "Minor Finding (2021) - Resolved",
        },
        {
          label: "Remediation Actions",
          value: "Process Improvements Implemented",
        },
        {
          label: "Compliance Monitoring",
          value: "Continuous Monitoring System",
        },
        { label: "Compliance Training", value: "Annual for All Staff" },
        { label: "Whistleblower Reports", value: "None in Last 3 Years" },
      ],
    },
  ]),
  industry: addEmptyFields([
    {
      groupName: "Primary Classification",
      fields: [
        { label: "ISIC Code", value: "6201" },
        { label: "ISIC Description", value: "Computer programming activities" },
        { label: "NAICS Code", value: "541511" },
        {
          label: "NAICS Description",
          value: "Custom Computer Programming Services",
        },
        { label: "SIC Code", value: "7371" },
        { label: "Industry Tier", value: "Tier 1 - Strategic Sector" },
      ],
    },
    {
      groupName: "Secondary Classifications",
      fields: [
        {
          label: "Secondary ISIC",
          value: "6202 - Computer consultancy activities",
        },
        {
          label: "Secondary NAICS",
          value: "541512 - Computer Systems Design Services",
        },
        {
          label: "Additional Classification",
          value: "6311 - Data processing, hosting",
        },
        { label: "Product Classification", value: "HS Code: 8523.29" },
        {
          label: "Service Classification",
          value: "CPC 8314 - IT consulting services",
        },
        {
          label: "Local Classification",
          value: "ADDED Tech Services Category A",
        },
      ],
    },
    {
      groupName: "Industry Positioning",
      fields: [
        {
          label: "Market Position",
          value: "Top 5 Enterprise Software Provider in UAE",
        },
        { label: "Competitive Landscape", value: "15 Direct Competitors" },
        {
          label: "Market Share",
          value: "12% of UAE Enterprise Software Market",
        },
        {
          label: "Growth Rate",
          value: "15% YoY (Above Industry Average of 8%)",
        },
        {
          label: "Industry Associations",
          value: "UAE ICT Business Council, ADGM Tech Association",
        },
        {
          label: "Industry Recognition",
          value: "UAE Technology Innovation Award 2022",
        },
      ],
    },
    {
      groupName: "Industry Regulations",
      fields: [
        {
          label: "Primary Regulator",
          value: "Telecommunications Regulatory Authority",
        },
        { label: "Industry Standards", value: "ISO/IEC 27001, ISO 9001" },
        {
          label: "Compliance Requirements",
          value: "Data Residency, Security Clearance",
        },
        {
          label: "Industry Codes of Conduct",
          value: "UAE ICT Code of Practice",
        },
        {
          label: "Special Permissions",
          value: "Critical Infrastructure Provider Status",
        },
        {
          label: "Regulatory Changes",
          value: "New Data Protection Framework (2023)",
        },
      ],
    },
    {
      groupName: "Industry Engagement",
      fields: [
        {
          label: "Industry Working Groups",
          value: "UAE Cybersecurity Council, AI Ethics Committee",
        },
        {
          label: "Standards Development",
          value: "Contributing to UAE Cloud Computing Standards",
        },
        { label: "Industry Events", value: "GITEX, Abu Dhabi Technology Week" },
        {
          label: "Industry Publications",
          value: "Quarterly Technology Trend Reports",
        },
        {
          label: "Thought Leadership",
          value: "Digital Transformation Whitepapers",
        },
      ],
    },
  ]),
  employees: addEmptyFields([
    {
      groupName: "Workforce Overview",
      fields: [
        { label: "Total Employees", value: "120" },
        { label: "Full-time Employees", value: "108" },
        { label: "Part-time Employees", value: "12" },
        { label: "Emiratization Rate", value: "15%" },
        { label: "Gender Diversity", value: "35% Female, 65% Male" },
        { label: "Average Tenure", value: "4.5 Years" },
      ],
    },
    {
      groupName: "Employment Structure",
      fields: [
        {
          label: "Employment Categories",
          value: "Regular, Contractual, Internship",
        },
        { label: "Management Positions", value: "22 (18% of workforce)" },
        { label: "Technical Positions", value: "75 (63% of workforce)" },
        { label: "Support Positions", value: "23 (19% of workforce)" },
        { label: "Remote Workers", value: "25 (21% of workforce)" },
        { label: "Organizational Levels", value: "5 Levels" },
      ],
    },
    {
      groupName: "Workforce Demographics",
      fields: [
        { label: "Nationality Mix", value: "15 Nationalities" },
        { label: "Age Distribution", value: "Avg: 34 years (Range: 22-58)" },
        {
          label: "Educational Background",
          value: "85% with Bachelor's or higher",
        },
        { label: "Experience Level", value: "Avg: 8.5 years in industry" },
        {
          label: "Technical Certifications",
          value: "Average 2.3 per technical employee",
        },
        { label: "Languages Spoken", value: "12 languages across workforce" },
      ],
    },
    {
      groupName: "HR Management",
      fields: [
        { label: "HR System", value: "Workday HRIS" },
        { label: "Performance Reviews", value: "Semi-annual" },
        {
          label: "Compensation Structure",
          value: "Base + Variable + Benefits",
        },
        { label: "Training Budget", value: "AED2,500 per employee annually" },
        { label: "Employee Turnover", value: "8.5% annual" },
        { label: "Succession Planning", value: "In place for key positions" },
      ],
    },
    {
      groupName: "Employment Compliance",
      fields: [
        { label: "Labor Law Compliance", value: "ADGM Employment Regulations" },
        { label: "Work Permits Status", value: "100% Compliant" },
        {
          label: "Health Insurance",
          value: "Comprehensive Coverage for All Employees",
        },
        {
          label: "Pension Contributions",
          value: "UAE Nationals: GPSSA, Expats: Voluntary Plan",
        },
        {
          label: "Working Hours Policy",
          value: "40 Hours/Week, Flexible Arrangements Available",
        },
        {
          label: "Leave Entitlements",
          value: "25 Days Annual + Public Holidays",
        },
      ],
    },
  ]),
  facilities: addEmptyFields([
    {
      groupName: "Headquarters",
      fields: [
        { label: "Location", value: "Level 42, Al Maqam Tower, ADGM Square" },
        { label: "Size", value: "1,500 sq meters" },
        { label: "Capacity", value: "150 workstations" },
        { label: "Lease Terms", value: "10-year lease, expires 2028" },
        {
          label: "Facilities",
          value: "Open workspace, 8 meeting rooms, cafeteria",
        },
        {
          label: "Special Features",
          value: "Innovation lab, client experience center",
        },
      ],
    },
    {
      groupName: "Additional Locations",
      fields: [
        { label: "Dubai Office", value: "Dubai Internet City, Building 12" },
        { label: "Size", value: "500 sq meters" },
        { label: "Capacity", value: "50 workstations" },
        { label: "Purpose", value: "Sales & customer support" },
        { label: "Lease Terms", value: "5-year lease, expires 2025" },
        { label: "Occupancy", value: "85% utilized" },
      ],
    },
    {
      groupName: "Technical Infrastructure",
      fields: [
        { label: "Data Center", value: "Khazna Data Center, Masdar City" },
        { label: "Server Room", value: "On-premises at HQ (100 sq meters)" },
        {
          label: "Network Infrastructure",
          value: "Redundant 10 Gbps connections",
        },
        {
          label: "Power Backup",
          value: "UPS and Generator with 72hr capacity",
        },
        {
          label: "Cooling Systems",
          value: "Precision cooling, N+1 redundancy",
        },
        {
          label: "Physical Security",
          value: "24/7 monitored, biometric access",
        },
      ],
    },
    {
      groupName: "Facility Management",
      fields: [
        { label: "Facility Manager", value: "Ibrahim Al Hashemi" },
        {
          label: "Maintenance Contract",
          value: "Comprehensive with Emrill Services",
        },
        { label: "Security Provider", value: "G4S Secure Solutions" },
        { label: "Health & Safety", value: "ISO 45001 compliant" },
        {
          label: "Sustainability Features",
          value: "LEED Gold certified building",
        },
        { label: "Facility Expenses", value: "AED 2.5M annually" },
      ],
    },
    {
      groupName: "Future Expansion",
      fields: [
        {
          label: "Planned Locations",
          value: "Saudi Arabia (Riyadh) - Q1 2024",
        },
        {
          label: "Space Requirements",
          value: "Additional 1,000 sq meters by 2025",
        },
        { label: "Facility Strategy", value: "Hub and spoke model" },
        {
          label: "Remote Work Policy",
          value: "Hybrid model (60% office, 40% remote)",
        },
        {
          label: "Facility Optimization",
          value: "Space utilization study ongoing",
        },
        {
          label: "Capital Investment",
          value: "AED 5M allocated for facility expansion",
        },
      ],
    },
  ]),
  products: addEmptyFields([
    {
      groupName: "Core Products",
      fields: [
        {
          label: "Enterprise Suite",
          value: "Integrated business management platform",
        },
        { label: "CloudSync", value: "Cloud data synchronization solution" },
        { label: "SecureID", value: "Identity and access management system" },
        {
          label: "DataInsight",
          value: "Business intelligence and analytics platform",
        },
        { label: "ProcessFlow", value: "Business process automation tool" },
        { label: "Product Portfolio Age", value: "3-7 years" },
      ],
    },
    {
      groupName: "Services Offered",
      fields: [
        {
          label: "Implementation Services",
          value: "End-to-end deployment and setup",
        },
        { label: "Managed Services", value: "24/7 monitoring and management" },
        { label: "Professional Services", value: "Consulting and advisory" },
        { label: "Training Services", value: "Customized training programs" },
        { label: "Support Services", value: "Tiered support packages" },
        { label: "Service Level Agreements", value: "99.9% uptime guarantee" },
      ],
    },
    {
      groupName: "Product Development",
      fields: [
        { label: "R&D Investment", value: "15% of annual revenue" },
        { label: "Development Methodology", value: "Agile (Scrum)" },
        {
          label: "Release Frequency",
          value: "Major: Quarterly, Minor: Monthly",
        },
        { label: "Current Development", value: "AI-enhanced analytics module" },
        { label: "Product Roadmap", value: "18-month rolling roadmap" },
        {
          label: "Innovation Process",
          value: "Design thinking workshops, hackathons",
        },
      ],
    },
    {
      groupName: "Market Information",
      fields: [
        {
          label: "Target Segments",
          value: "Enterprise, Government, Financial Services",
        },
        { label: "Customer Base", value: "85+ enterprise customers" },
        {
          label: "Geographic Reach",
          value: "UAE, Saudi Arabia, Qatar, Oman, Kuwait",
        },
        { label: "Market Share", value: "12% in Enterprise Software segment" },
        { label: "Competitive Position", value: "Top 3 in UAE market" },
        {
          label: "Go-to-Market Strategy",
          value: "Direct sales, strategic partners",
        },
      ],
    },
    {
      groupName: "Product Management",
      fields: [
        { label: "Product Manager", value: "Layla Al Mazrouei" },
        { label: "Product Team Size", value: "12 professionals" },
        { label: "Product Lifecycle", value: "Managed through PLM system" },
        { label: "Customer Feedback", value: "NPS score: 67" },
        { label: "Product Performance", value: "85% feature adoption rate" },
        {
          label: "Pricing Strategy",
          value: "Subscription-based, tiered pricing",
        },
      ],
    },
  ]),
  certifications: addEmptyFields([
    {
      groupName: "Quality Certifications",
      fields: assignFieldStatuses([
        { label: "ISO 9001:2015", value: "Quality Management System" },
        { label: "ISO 27001:2013", value: "Information Security Management" },
        { label: "ISO 22301:2019", value: "Business Continuity Management" },
        { label: "ISO 20000-1:2018", value: "IT Service Management" },
        {
          label: "CMMI Level 4",
          value: "Capability Maturity Model Integration",
        },
        { label: "Certification Body", value: "Bureau Veritas" },
      ]),
    },
    {
      groupName: "Industry Certifications",
      fields: assignFieldStatuses([
        {
          label: "PCI DSS",
          value: "Payment Card Industry Data Security Standard",
        },
        { label: "SOC 2 Type II", value: "Service Organization Control" },
        { label: "CSA STAR", value: "Cloud Security Alliance" },
        {
          label: "GDPR Compliance",
          value: "EU General Data Protection Regulation",
        },
        { label: "ADGM Data Protection", value: "Registered Data Controller" },
        {
          label: "UAE IA Compliance",
          value: "Information Assurance Standards",
        },
      ]),
    },
    {
      groupName: "Business Awards",
      fields: assignFieldStatuses([
        { label: "UAE Innovation Award", value: "Winner 2022" },
        {
          label: "Gulf Business Technology Company",
          value: "Top 10 (2021, 2022)",
        },
        { label: "GITEX Future Stars", value: "Best Enterprise Solution 2022" },
        {
          label: "Abu Dhabi Digital Authority",
          value: "Digital Transformation Partner 2023",
        },
        {
          label: "Forbes Middle East",
          value: "Most Innovative Companies 2022",
        },
        {
          label: "Arabian Business",
          value: "Technology Company of the Year 2021",
        },
      ]),
    },
    {
      groupName: "Team Certifications",
      fields: assignFieldStatuses([
        {
          label: "AWS Certified Solutions Architects",
          value: "12 professionals",
        },
        {
          label: "Microsoft Certified Professionals",
          value: "25 certifications",
        },
        {
          label: "Certified Information Security Managers",
          value: "5 professionals",
        },
        {
          label: "Project Management Professionals",
          value: "8 certified PMPs",
        },
        { label: "ITIL Certified Practitioners", value: "15 professionals" },
        { label: "Certified Data Scientists", value: "6 professionals" },
      ]),
    },
    {
      groupName: "Recognition & Partnerships",
      fields: assignFieldStatuses([
        { label: "Microsoft Gold Partner", value: "Since 2015" },
        { label: "AWS Advanced Consulting Partner", value: "Since 2018" },
        { label: "Oracle Platinum Partner", value: "Since 2016" },
        { label: "IBM Business Partner", value: "Premier Level" },
        { label: "Google Cloud Partner", value: "Specialized Partner" },
        { label: "Gartner Recognition", value: "Notable Vendor in MEA, 2022" },
      ]),
    },
  ]),
};

// Multi-entry data for tables
export const mockMultiEntryData = {
  basic: [
    {
      title: "Current Business Needs",
      columns: [
        { key: "need", label: "Business Need" },
        { key: "priority", label: "Priority" },
        { key: "timeline", label: "Timeline" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          need: "Expand sales team in Saudi Arabia",
          priority: "High",
          timeline: "Q1 2024",
          status: "Planning",
        },
        {
          id: "2",
          need: "Secure Series B funding",
          priority: "Critical",
          timeline: "Q2 2024",
          status: "In Progress",
        },
        {
          id: "3",
          need: "Hire AI/ML specialists",
          priority: "Medium",
          timeline: "Q3 2024",
          status: "Not Started",
        },
        {
          id: "4",
          need: "Upgrade cloud infrastructure",
          priority: "High",
          timeline: "Q4 2023",
          status: "In Progress",
        },
      ],
    },
    {
      title: "Future Aspirations",
      columns: [
        { key: "aspiration", label: "Aspiration" },
        { key: "category", label: "Category" },
        { key: "timeline", label: "Timeline" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          aspiration: "Expand to European markets",
          category: "Geographic Expansion",
          timeline: "2025",
          status: "Planning",
        },
        {
          id: "2",
          aspiration: "Develop healthcare-specific solutions",
          category: "Product Development",
          timeline: "2024",
          status: "Research",
        },
        {
          id: "3",
          aspiration: "Launch IPO",
          category: "Financial",
          timeline: "2027",
          status: "Long-term Goal",
        },
        {
          id: "4",
          aspiration: "Establish R&D center in Abu Dhabi",
          category: "Innovation",
          timeline: "2025",
          status: "Conceptual",
        },
      ],
    },
    {
      title: "Strategic Alliances & Partnerships",
      columns: [
        { key: "partner", label: "Partner" },
        { key: "type", label: "Type" },
        { key: "objective", label: "Objective" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          partner: "Abu Dhabi Digital Authority",
          type: "Government",
          objective: "Smart City Solutions",
          status: "Active",
        },
        {
          id: "2",
          partner: "Microsoft",
          type: "Technology",
          objective: "Cloud Integration",
          status: "Active",
        },
        {
          id: "3",
          partner: "Healthcare Innovation Group",
          type: "Industry",
          objective: "Sector Expansion",
          status: "Negotiating",
        },
        {
          id: "4",
          partner: "KAUST",
          type: "Academic",
          objective: "R&D Collaboration",
          status: "Planning",
        },
      ],
    },
  ],
  ownership: [
    {
      title: "Shareholders",
      columns: [
        { key: "name", label: "Shareholder Name" },
        { key: "percentage", label: "Ownership %" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          name: "Global Tech Ventures",
          percentage: 51,
          category: "Investor",
          status: "Active",
        },
        {
          id: "2",
          name: "Abu Dhabi Investments LLC",
          percentage: 24,
          category: "Local Partner",
          status: "Active",
        },
        {
          id: "3",
          name: "John Smith",
          percentage: 15,
          category: "Founder",
          status: "Active",
        },
        {
          id: "4",
          name: "Employee Stock Ownership Plan",
          percentage: 5,
          category: "ESOP",
          status: "Active",
        },
        {
          id: "5",
          name: "Other Shareholders",
          percentage: 5,
          category: "Others",
          status: "Active",
        },
      ],
    },
    {
      title: "Ultimate Beneficial Owners",
      columns: [
        { key: "name", label: "UBO Name" },
        { key: "entity", label: "Related Entity" },
        { key: "percentage", label: "Indirect %" },
        { key: "nationality", label: "Nationality" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          name: "Richard Williams",
          entity: "Global Tech Ventures",
          percentage: 35,
          nationality: "American",
          status: "Verified",
        },
        {
          id: "2",
          name: "Sheikh Mohammed Al Nahyan",
          entity: "Abu Dhabi Investments",
          percentage: 100,
          nationality: "Emirati",
          status: "Verified",
        },
        {
          id: "3",
          name: "John Smith",
          entity: "Direct Holding",
          percentage: 15,
          nationality: "British",
          status: "Verified",
        },
      ],
    },
  ],
  legal: [
    {
      title: "Board of Directors",
      columns: [
        { key: "name", label: "Director Name" },
        { key: "position", label: "Position" },
        { key: "representing", label: "Representing" },
        { key: "appointmentDate", label: "Appointment Date" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          name: "Richard Williams",
          position: "Chairman",
          representing: "Global Tech Ventures",
          appointmentDate: "15-Jan-2020",
          status: "Active",
        },
        {
          id: "2",
          name: "Sheikh Mohammed Al Nahyan",
          position: "Vice Chairman",
          representing: "Abu Dhabi Investments",
          appointmentDate: "15-Jan-2020",
          status: "Active",
        },
        {
          id: "3",
          name: "John Smith",
          position: "Executive Director",
          representing: "Founder",
          appointmentDate: "15-Mar-2010",
          status: "Active",
        },
        {
          id: "4",
          name: "Sarah Johnson",
          position: "Director",
          representing: "Global Tech Ventures",
          appointmentDate: "10-Jun-2021",
          status: "Active",
        },
        {
          id: "5",
          name: "Ahmed Al Mansoori",
          position: "Director",
          representing: "Abu Dhabi Investments",
          appointmentDate: "05-Feb-2022",
          status: "Active",
        },
      ],
    },
  ],
  employees: [
    {
      title: "Key Personnel",
      columns: [
        { key: "name", label: "Name" },
        { key: "position", label: "Position" },
        { key: "department", label: "Department" },
        { key: "joinDate", label: "Join Date" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          name: "John Smith",
          position: "Chief Executive Officer",
          department: "Executive",
          joinDate: "15-Mar-2010",
          status: "Active",
        },
        {
          id: "2",
          name: "Sarah Johnson",
          position: "Chief Operations Officer",
          department: "Operations",
          joinDate: "10-May-2012",
          status: "Active",
        },
        {
          id: "3",
          name: "Ahmed Al Mansoori",
          position: "Chief Financial Officer",
          department: "Finance",
          joinDate: "05-Jan-2015",
          status: "Active",
        },
        {
          id: "4",
          name: "Fatima Al Zaabi",
          position: "Chief Technology Officer",
          department: "Technology",
          joinDate: "20-Jul-2016",
          status: "Active",
        },
        {
          id: "5",
          name: "Michael Chen",
          position: "Chief Marketing Officer",
          department: "Marketing",
          joinDate: "12-Nov-2018",
          status: "Active",
        },
        {
          id: "6",
          name: "Layla Al Mazrouei",
          position: "Head of Product",
          department: "Product",
          joinDate: "03-Mar-2019",
          status: "Active",
        },
      ],
    },
  ],
  facilities: [
    {
      title: "Locations",
      columns: [
        { key: "name", label: "Location Name" },
        { key: "type", label: "Type" },
        { key: "address", label: "Address" },
        { key: "size", label: "Size" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          name: "Headquarters",
          type: "Office",
          address: "Level 42, Al Maqam Tower, ADGM Square",
          size: "1,500 sq meters",
          status: "Active",
        },
        {
          id: "2",
          name: "Dubai Office",
          type: "Office",
          address: "Dubai Internet City, Building 12",
          size: "500 sq meters",
          status: "Active",
        },
        {
          id: "3",
          name: "Data Center",
          type: "Technical",
          address: "Khazna Data Center, Masdar City",
          size: "200 sq meters",
          status: "Active",
        },
        {
          id: "4",
          name: "Riyadh Office",
          type: "Office",
          address: "King Fahd Road, Riyadh",
          size: "300 sq meters",
          status: "Pending",
        },
      ],
    },
  ],
  products: [
    {
      title: "Products & Services",
      columns: [
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "description", label: "Description" },
        { key: "launchDate", label: "Launch Date" },
        { key: "status", label: "Status" },
      ],
      data: [
        {
          id: "1",
          name: "Enterprise Suite",
          type: "Software",
          description: "Integrated business management platform",
          launchDate: "Jun 2015",
          status: "Active",
        },
        {
          id: "2",
          name: "CloudSync",
          type: "Software",
          description: "Cloud data synchronization solution",
          launchDate: "Mar 2017",
          status: "Active",
        },
        {
          id: "3",
          name: "SecureID",
          type: "Software",
          description: "Identity and access management system",
          launchDate: "Nov 2018",
          status: "Active",
        },
        {
          id: "4",
          name: "DataInsight",
          type: "Software",
          description: "Business intelligence and analytics platform",
          launchDate: "Apr 2019",
          status: "Active",
        },
        {
          id: "5",
          name: "ProcessFlow",
          type: "Software",
          description: "Business process automation tool",
          launchDate: "Sep 2020",
          status: "Active",
        },
        {
          id: "6",
          name: "Implementation Services",
          type: "Service",
          description: "End-to-end deployment and setup",
          launchDate: "Jun 2015",
          status: "Active",
        },
      ],
    },
  ],
};

// Document data for document sections
export const mockDocuments = {
  legal: [
    {
      id: "1",
      name: "Articles of Association.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: "15-Mar-2010",
      status: "Approved",
    },
    {
      id: "2",
      name: "Board Resolution - 2023.pdf",
      type: "pdf",
      size: "1.1 MB",
      uploadDate: "10-Jan-2023",
      status: "Approved",
    },
    {
      id: "3",
      name: "Power of Attorney.pdf",
      type: "pdf",
      size: "850 KB",
      uploadDate: "05-Jun-2022",
      status: "Approved",
    },
    {
      id: "4",
      name: "Shareholders Agreement.pdf",
      type: "pdf",
      size: "3.2 MB",
      uploadDate: "15-Mar-2010",
      status: "Approved",
    },
  ],
  licensing: [
    {
      id: "1",
      name: "Commercial License.pdf",
      type: "pdf",
      size: "1.5 MB",
      uploadDate: "31-Dec-2022",
      status: "Approved",
    },
    {
      id: "2",
      name: "Software Provider License.pdf",
      type: "pdf",
      size: "1.2 MB",
      uploadDate: "15-Jul-2022",
      status: "Approved",
    },
    {
      id: "3",
      name: "Data Center Operations License.pdf",
      type: "pdf",
      size: "980 KB",
      uploadDate: "20-Aug-2022",
      status: "Approved",
    },
    {
      id: "4",
      name: "Cloud Services Provider License.pdf",
      type: "pdf",
      size: "1.1 MB",
      uploadDate: "05-Sep-2022",
      status: "Pending",
    },
  ],
  ownership: [
    {
      id: "1",
      name: "UBO Declaration Form.pdf",
      type: "pdf",
      size: "1.8 MB",
      uploadDate: "10-Jan-2023",
      status: "Approved",
    },
    {
      id: "2",
      name: "Share Certificate - Global Tech Ventures.pdf",
      type: "pdf",
      size: "950 KB",
      uploadDate: "15-Mar-2010",
      status: "Approved",
    },
    {
      id: "3",
      name: "Share Certificate - Abu Dhabi Investments.pdf",
      type: "pdf",
      size: "950 KB",
      uploadDate: "15-Mar-2010",
      status: "Approved",
    },
    {
      id: "4",
      name: "Share Certificate - John Smith.pdf",
      type: "pdf",
      size: "950 KB",
      uploadDate: "15-Mar-2010",
      status: "Approved",
    },
    {
      id: "5",
      name: "ESOP Documentation.pdf",
      type: "pdf",
      size: "2.5 MB",
      uploadDate: "20-Jun-2018",
      status: "Approved",
    },
  ],
  compliance: [
    {
      id: "1",
      name: "ISO 27001 Certificate.pdf",
      type: "pdf",
      size: "1.2 MB",
      uploadDate: "15-Jun-2022",
      status: "Approved",
    },
    {
      id: "2",
      name: "ISO 9001 Certificate.pdf",
      type: "pdf",
      size: "1.1 MB",
      uploadDate: "15-Jun-2022",
      status: "Approved",
    },
    {
      id: "3",
      name: "Data Protection Registration.pdf",
      type: "pdf",
      size: "1.5 MB",
      uploadDate: "10-Jan-2023",
      status: "Approved",
    },
    {
      id: "4",
      name: "Annual Compliance Report 2022.pdf",
      type: "pdf",
      size: "3.5 MB",
      uploadDate: "28-Feb-2023",
      status: "Approved",
    },
  ],
  certifications: [
    {
      id: "1",
      name: "UAE Innovation Award Certificate.jpg",
      type: "image",
      size: "1.8 MB",
      uploadDate: "15-Dec-2022",
      status: "Approved",
    },
    {
      id: "2",
      name: "GITEX Future Stars Award.jpg",
      type: "image",
      size: "2.1 MB",
      uploadDate: "18-Oct-2022",
      status: "Approved",
    },
    {
      id: "3",
      name: "Microsoft Gold Partner Certificate.pdf",
      type: "pdf",
      size: "1.2 MB",
      uploadDate: "10-Jan-2023",
      status: "Approved",
    },
    {
      id: "4",
      name: "AWS Advanced Consulting Partner Certificate.pdf",
      type: "pdf",
      size: "1.3 MB",
      uploadDate: "05-Feb-2023",
      status: "Approved",
    },
  ],
};
