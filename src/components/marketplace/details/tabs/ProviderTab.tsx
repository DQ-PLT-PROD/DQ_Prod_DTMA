import React, { useMemo } from "react";
import { ExternalLinkIcon } from "lucide-react";

export interface ProviderTabProps {
  provider: { name: string; logoUrl: string; description?: string };
  marketplaceType: "courses" | "financial" | "non-financial";
  item: any;
}

// Mock data pools for random selection
const MOCK_DATA_POOL = {
  financial: {
    names: [
      "Emirates Business Bank",
      "Gulf SME Finance",
      "National Commercial Bank",
      "Abu Dhabi Business Solutions",
      "UAE Growth Capital",
    ],
    taglines: [
      "Trusted financial services provider",
      "Your partner in business growth",
      "Empowering SMEs across the UAE",
      "Leading business banking solutions",
      "Innovative financing for entrepreneurs",
    ],
    descriptions: [
      "A leading financial institution providing comprehensive banking and financial solutions to SMEs across the UAE.",
      "Trusted provider of innovative financial products and services, specializing in business growth financing.",
      "Premier banking partner for entrepreneurs and small businesses, offering tailored financial solutions.",
      "Established financial services provider with expertise in SME lending and business development.",
      "Award-winning financial institution dedicated to empowering businesses through accessible financing.",
    ],
    expertise: [
      ["SME Financing", "Business Loans", "Investment Services", "Financial Planning"],
      ["Working Capital", "Trade Finance", "Asset Financing", "Credit Facilities"],
      ["Business Banking", "Corporate Finance", "Treasury Services", "Risk Management"],
      ["Commercial Lending", "Cash Management", "Payment Solutions", "Advisory Services"],
      ["Growth Financing", "Equipment Loans", "Invoice Financing", "Business Credit Cards"],
    ],
    locations: ["Abu Dhabi, UAE", "Dubai, UAE", "Sharjah, UAE", "Ajman, UAE", "Ras Al Khaimah, UAE"],
    established: ["2005", "2007", "2010", "2012", "2015"],
    contacts: [
      "business@financeprovider.ae",
      "sme@bankingsolutions.ae",
      "info@businessfinance.ae",
      "support@commercialbank.ae",
      "contact@smefinance.ae",
    ],
    websites: [
      "https://www.adcb.com",
      "https://www.dib.ae",
      "https://www.emiratesnbd.com",
      "https://www.rakbank.ae",
      "https://www.mashreqbank.com",
    ],
    services: ["25+ Financial Products", "30+ Banking Solutions", "20+ Lending Options", "15+ Business Services", "35+ Financial Tools"],
  },
  courses: {
    names: [
      "Emirates Business Academy",
      "Professional Development Institute",
      "Gulf Executive Education",
      "UAE Skills Hub",
      "Business Training Center",
    ],
    taglines: [
      "Leading provider of business education",
      "Excellence in professional training",
      "Empowering careers through education",
      "Your pathway to success",
      "World-class business training",
    ],
    descriptions: [
      "Leading educational institution offering professional development and business training programs.",
      "Premier provider of executive education and certification courses for business professionals.",
      "Innovative learning platform delivering world-class business and entrepreneurship training.",
      "Established training institute specializing in professional skills development and certification.",
      "Award-winning education provider focused on practical business skills and career advancement.",
    ],
    expertise: [
      ["Business Training", "Professional Certification", "Workshops", "E-Learning"],
      ["Executive Education", "Leadership Development", "Digital Skills", "Online Courses"],
      ["Management Training", "Entrepreneurship", "Industry Certifications", "Corporate Training"],
      ["Skills Development", "Career Advancement", "Professional Courses", "Virtual Learning"],
      ["Business Education", "Technical Training", "Soft Skills", "Accredited Programs"],
    ],
    locations: ["Abu Dhabi, UAE", "Dubai, UAE", "Sharjah, UAE", "Online Platform", "Multiple Locations, UAE"],
    established: ["2008", "2010", "2012", "2015", "2018"],
    contacts: [
      "info@businesstraining.ae",
      "courses@professionaled.ae",
      "enroll@learninghub.ae",
      "contact@skillsdevelopment.ae",
      "support@executiveedu.ae",
    ],
    websites: [
      "https://www.coursera.org",
      "https://www.udemy.com",
      "https://www.linkedin.com/learning",
      "https://www.edx.org",
      "https://www.skillshare.com",
    ],
    services: ["50+ Courses Available", "40+ Training Programs", "60+ Certification Courses", "35+ Workshops", "45+ Online Courses"],
  },
  "non-financial": {
    names: [
      "Strategic Business Partners",
      "Gulf Consulting Group",
      "Emirates Advisory Services",
      "Business Solutions Hub",
      "Corporate Strategy Advisors",
    ],
    taglines: [
      "Expert business services provider",
      "Strategic consulting excellence",
      "Driving business transformation",
      "Your trusted advisory partner",
      "Innovative business solutions",
    ],
    descriptions: [
      "Expert business services and consulting firm helping companies achieve operational excellence.",
      "Professional advisory services provider specializing in business strategy and growth consulting.",
      "Leading consultancy offering comprehensive business solutions and market intelligence.",
      "Trusted partner for business development, providing strategic advisory and implementation services.",
      "Innovative consulting firm delivering data-driven insights and actionable business strategies.",
    ],
    expertise: [
      ["Business Advisory", "Consulting", "Market Research", "Strategy"],
      ["Management Consulting", "Business Planning", "Market Analysis", "Growth Strategy"],
      ["Strategic Advisory", "Operations Consulting", "Competitive Analysis", "Business Intelligence"],
      ["Corporate Strategy", "Process Optimization", "Industry Research", "Performance Management"],
      ["Business Development", "Strategic Planning", "Market Entry", "Organizational Development"],
    ],
    locations: ["Abu Dhabi, UAE", "Dubai, UAE", "Sharjah, UAE", "Regional Office, UAE", "GCC Region"],
    established: ["2006", "2009", "2011", "2013", "2016"],
    contacts: [
      "info@businessconsulting.ae",
      "advisory@strategicpartners.ae",
      "contact@consultingfirm.ae",
      "support@businesssolutions.ae",
      "hello@advisoryservices.ae",
    ],
    websites: [
      "https://www.mckinsey.com",
      "https://www.bcg.com",
      "https://www.bain.com",
      "https://www.deloitte.com",
      "https://www.pwc.com",
    ],
    services: ["30+ Services", "25+ Consulting Solutions", "40+ Advisory Services", "20+ Business Tools", "35+ Strategic Services"],
  },
};

// Deterministic random selection based on provider name
const getProviderData = (providerName: string, marketplaceType: "courses" | "financial" | "non-financial") => {
  const pool = MOCK_DATA_POOL[marketplaceType];

  // Use provider name to generate a consistent "random" index
  const hash = providerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const nameIndex = hash % pool.names.length;
  const taglineIndex = hash % pool.taglines.length;
  const descIndex = hash % pool.descriptions.length;
  const expertiseIndex = hash % pool.expertise.length;
  const locationIndex = hash % pool.locations.length;
  const establishedIndex = hash % pool.established.length;
  const contactIndex = hash % pool.contacts.length;
  const websiteIndex = hash % pool.websites.length;
  const servicesIndex = hash % pool.services.length;

  return {
    name: pool.names[nameIndex],
    tagline: pool.taglines[taglineIndex],
    description: pool.descriptions[descIndex],
    expertise: pool.expertise[expertiseIndex],
    location: pool.locations[locationIndex],
    established: pool.established[establishedIndex],
    contact: pool.contacts[contactIndex],
    website: pool.websites[websiteIndex],
    services: pool.services[servicesIndex],
  };
};

const ProviderTab: React.FC<ProviderTabProps> = ({
  provider,
  marketplaceType,
}) => {
  // Use actual provider data when available, fallback to mock data
  const mockData = useMemo(
    () => getProviderData(provider.name, marketplaceType),
    [provider.name, marketplaceType]
  );

  const isCourse = marketplaceType === 'courses';
  const providerLabel = isCourse ? 'instructor' : 'provider';

  // Use actual provider name if available, otherwise use mock name
  const displayName = provider.name && provider.name.trim() !== "" ? provider.name : mockData.name;
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg mb-6">
        Learn more about the {providerLabel} and their expertise in this field.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <img
            src={provider.logoUrl || "/mzn_logo.png"}
            alt={displayName}
            className="h-16 w-16 object-contain rounded-lg bg-gray-50 p-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/mzn_logo.png";
            }}
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            <p className="text-gray-600 text-sm">
              {mockData.tagline}
            </p>
          </div>
          <div className="md:ml-auto flex flex-col md:items-end">
            <div className="text-sm text-gray-500">Established</div>
            <div className="font-medium text-blue-600">
              {mockData.established} {mockData.location.split()[1]?.trim() || 'UAE'}
            </div>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          {mockData.description}
        </p>
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Areas of Expertise
        </h4>
        <div className="flex flex-wrap gap-2 mb-6">
          {mockData.expertise.map((expertise, index) => {
            const colors = [
              'bg-blue-50 text-blue-700',
              'bg-green-50 text-green-700',
              'bg-purple-50 text-purple-700',
              'bg-amber-50 text-amber-700',
            ];
            const color = colors[index % colors.length];

            return (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}
              >
                {expertise}
              </span>
            );
          })}
        </div>
        <a
          href={mockData.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          Visit Provider Website
          <ExternalLinkIcon size={16} className="ml-1" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-sm text-gray-500 mb-1">Location</h4>
          <p className="font-medium text-gray-900">
            {mockData.location}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-sm text-gray-500 mb-1">Contact</h4>
          <p className="font-medium text-gray-900">
            {mockData.contact}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-sm text-gray-500 mb-1">Services</h4>
          <p className="font-medium text-gray-900">
            {mockData.services}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderTab;
