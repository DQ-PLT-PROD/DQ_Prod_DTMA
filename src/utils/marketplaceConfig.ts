import * as React from 'react';
import { ReactNode } from 'react';
import { DollarSign, Calendar, Clock, Users, MapPin, CheckCircle, BarChart, Award, FileText, Info, BookOpen, ClipboardList, Building, FileType, Bookmark, TrendingUp } from 'lucide-react';
import { providers } from './mockData';
import { mockFinancialServices, mockNonFinancialServices, mockKnowledgeHubItems, mockKnowledgeHubFilterOptions } from './mockMarketplaceData';
import { categories } from '../data/dtma/categories';
import { getCourses, toMarketplaceItem } from '../lib/api/dtmaCourses';

// Canonical marketplace configuration used by MarketplaceRouter/MarketplacePage.
// Legacy duplicate: src/utils/marketplaceConfiguration.tsx (kept for reference only).
// Define a Tab type for consistency across marketplace pages
export interface MarketplaceTab {
  id: string;
  label: string;
  icon?: any;
  iconBgColor?: string;
  iconColor?: string;
  renderContent?: (item: any, marketplaceType: string) => React.ReactNode;
}
// Configuration type definitions
export interface AttributeConfig {
  key: string;
  label: string;
  icon: ReactNode;
  formatter?: (value: any) => string;
}
export interface TabConfig {
  id: string;
  label: string;
  icon?: any;
  iconBgColor?: string;
  iconColor?: string;
  renderContent?: (item: any, marketplaceType: string) => React.ReactNode;
}
export interface FilterCategoryConfig {
  id: string;
  title: string;
  options: {
    id: string;
    name: string;
  }[];
}
export interface MarketplaceConfig {
  id: string;
  title: string;
  description: string;
  route: string;
  primaryCTA: string;
  secondaryCTA: string;
  itemName: string;
  itemNamePlural: string;
  showPromoCards?: boolean;
  attributes: AttributeConfig[];
  detailSections: string[];
  tabs: TabConfig[];
  summarySticky?: boolean;
  filterCategories: FilterCategoryConfig[];
  // New fields for GraphQL integration
  mapListResponse?: (data: any[]) => any[];
  mapDetailResponse?: (data: any) => any;
  mapFilterResponse?: (data: any) => FilterCategoryConfig[];
  // Mock data for fallback and schema reference
  mockData?: {
    items: any[];
    filterOptions: any;
    providers: any[];
  };
}
// Mock data for financial services
export const mockFinancialServicesData = {
  items: mockFinancialServices,
  filterOptions: {
    categories: [{
      id: 'loans',
      name: 'Loans'
    }, {
      id: 'financing',
      name: 'Financing'
    }, {
      id: 'insurance',
      name: 'Insurance'
    }, {
      id: 'creditcard',
      name: 'Credit Card'
    }],
    serviceTypes: [{
      id: 'financing',
      name: 'Financing'
    }, {
      id: 'credit',
      name: 'Credit'
    }, {
      id: 'riskmanagement',
      name: 'Risk Management'
    }]
  },
  providers: providers
};
// Mock data for non-financial services
export const mockNonFinancialServicesData = {
  items: mockNonFinancialServices,
  filterOptions: {
    categories: [{
      id: 'consultancy',
      name: 'Consultancy'
    }, {
      id: 'technology',
      name: 'Technology'
    }, {
      id: 'research',
      name: 'Research'
    }, {
      id: 'export',
      name: 'Export'
    }],
    serviceTypes: [{
      id: 'advisory',
      name: 'Advisory'
    }, {
      id: 'implementation',
      name: 'Implementation'
    }, {
      id: 'information',
      name: 'Information'
    }, {
      id: 'program',
      name: 'Program'
    }],
    deliveryModes: [{
      id: 'online',
      name: 'Online'
    }, {
      id: 'inperson',
      name: 'In-person'
    }, {
      id: 'hybrid',
      name: 'Hybrid'
    }]
  },
  providers: providers
};
// Mock data for courses
export const mockCoursesData = {
  items: getCourses().map(toMarketplaceItem),
  filterOptions: {
    categories: categories.map((category) => ({
      id: category.slug,
      name: category.name
    })),
    audienceLevels: [{
      id: 'Digital Leaders',
      name: 'Digital Leaders'
    }, {
      id: 'Digital Workers',
      name: 'Digital Workers'
    }],
    deliveryModes: [{
      id: 'Online',
      name: 'Online'
    }, {
      id: 'In-person',
      name: 'In-person'
    }, {
      id: 'Hybrid',
      name: 'Hybrid'
    }],
    levelTags: [{
      id: 'Beginner',
      name: 'Beginner'
    }, {
      id: 'Intermediate',
      name: 'Intermediate'
    }, {
      id: 'Advanced',
      name: 'Advanced'
    }]
  },
  providers: providers
};
// Mock data for Knowledge Hub
export const mockKnowledgeHubData = {
  items: mockKnowledgeHubItems,
  filterOptions: mockKnowledgeHubFilterOptions,
  providers: providers
};
// Define marketplace configurations
export const marketplaceConfig: Record<string, MarketplaceConfig> = {
  courses: {
    id: 'courses',
    title: 'Course Marketplace',
    description: 'Discover and enroll in courses tailored for SMEs to help grow your business',
    route: '/marketplace/courses',
    primaryCTA: 'Start Learning',
    secondaryCTA: 'View Details',
    itemName: 'Course',
    itemNamePlural: 'Courses',
    showPromoCards: false,
    attributes: [{
      key: 'duration',
      label: 'Duration',
      icon: React.createElement(Clock, { size: 18, className: "mr-2" })
    }, {
      key: 'startDate',
      label: 'Starts',
      icon: React.createElement(Calendar, { size: 18, className: "mr-2" })
    }, {
      key: 'price',
      label: 'Cost',
      icon: React.createElement(DollarSign, { size: 18, className: "mr-2" })
    }, {
      key: 'location',
      label: 'Location',
      icon: React.createElement(MapPin, { size: 18, className: "mr-2" })
    }],
    detailSections: ['description', 'learningOutcomes', 'schedule', 'provider', 'related'],
    tabs: [{
      id: 'about',
      label: 'Overview',
      icon: Info,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }, {
      id: 'schedule',
      label: 'Course Outline',
      icon: Calendar,
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }, {
      id: 'learning_outcomes',
      label: 'Learning Outcomes',
      icon: BookOpen,
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }, {
      id: 'provider',
      label: 'About Instructor',
      icon: Building,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }],
    summarySticky: true,
    filterCategories: [{
      id: 'category',
      title: 'Category',
      options: categories.map((category) => ({
        id: category.slug,
        name: category.name
      }))
    }, {
      id: 'audienceLevel',
      title: 'Role',
      options: [{
        id: 'Digital Leaders',
        name: 'Digital Leaders'
      }, {
        id: 'Digital Workers',
        name: 'Digital Workers'
      }]
    }, {
      id: 'levelTag',
      title: 'Level',
      options: [{
        id: 'Beginner',
        name: 'Beginner'
      }, {
        id: 'Intermediate',
        name: 'Intermediate'
      }, {
        id: 'Advanced',
        name: 'Advanced'
      }]
    }, {
      id: 'deliveryMode',
      title: 'Delivery Mode',
      options: [{
        id: 'Online',
        name: 'Online'
      }, {
        id: 'In-person',
        name: 'In-person'
      }, {
        id: 'Hybrid',
        name: 'Hybrid'
      }]
    }],
    // Data mapping functions
    mapListResponse: data => {
      return data.map((item: any) => ({
        ...item,
        // Transform any fields if needed
        tags: item.tags || [item.category, item.deliveryMode].filter(Boolean)
      }));
    },
    mapDetailResponse: data => {
      return {
        ...data,
        // Transform any fields if needed
        highlights: data.highlights || data.learningOutcomes || []
      };
    },
    mapFilterResponse: data => {
      return [{
        id: 'category',
        title: 'Category',
        options: data.categories || categories.map((category) => ({
          id: category.slug,
          name: category.name
        }))
      }, {
        id: 'audienceLevel',
        title: 'Role',
        options: data.audienceLevels || [{
          id: 'Digital Leaders',
          name: 'Digital Leaders'
        }, {
          id: 'Digital Workers',
          name: 'Digital Workers'
        }]
      }, {
        id: 'levelTag',
        title: 'Level',
        options: data.levelTags || [{
          id: 'Beginner',
          name: 'Beginner'
        }, {
          id: 'Intermediate',
          name: 'Intermediate'
        }, {
          id: 'Advanced',
          name: 'Advanced'
        }]
      }, {
        id: 'deliveryMode',
        title: 'Delivery Mode',
        options: data.deliveryModes || [{
          id: 'Online',
          name: 'Online'
        }, {
          id: 'In-person',
          name: 'In-person'
        }, {
          id: 'Hybrid',
          name: 'Hybrid'
        }]
      }];
    },
    // Mock data for fallback and schema reference
    mockData: mockCoursesData
  },
  financial: {
    id: 'financial',
    title: 'Financial Services Marketplace',
    description: 'Access financial products and services to support your business growth',
    route: '/marketplace/financial',
    primaryCTA: 'Apply Now',
    secondaryCTA: 'View Details',
    itemName: 'Financial Service',
    itemNamePlural: 'Financial Services',
    attributes: [{
      key: 'amount',
      label: 'Amount',
      icon: React.createElement(DollarSign, { size: 18, className: "mr-2" })
    }, {
      key: 'duration',
      label: 'Repayment Term',
      icon: React.createElement(Calendar, { size: 18, className: "mr-2" })
    }, {
      key: 'eligibility',
      label: 'Eligibility',
      icon: React.createElement(CheckCircle, { size: 18, className: "mr-2" })
    }, {
      key: 'interestRate',
      label: 'Interest Rate',
      icon: React.createElement(BarChart, { size: 18, className: "mr-2" })
    }],
    detailSections: ['description', 'eligibility', 'terms', 'provider', 'related'],
    tabs: [{
      id: 'about',
      label: 'About This Service',
      icon: Info,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }, {
      id: 'eligibility_terms',
      label: 'Eligibility & Terms',
      icon: CheckCircle,
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }, {
      id: 'application_process',
      label: 'Application Process',
      icon: ClipboardList,
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }, {
      id: 'required_documents',
      label: 'Required Documents',
      icon: FileText,
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }, {
      id: 'provider',
      label: 'About Provider',
      icon: Building,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }],
    summarySticky: true,
    filterCategories: [{
      id: 'category',
      title: 'Service Category',
      options: [{
        id: 'loans',
        name: 'Loans'
      }, {
        id: 'financing',
        name: 'Financing'
      }, {
        id: 'insurance',
        name: 'Insurance'
      }, {
        id: 'creditcard',
        name: 'Credit Card'
      }]
    }, {
      id: 'serviceType',
      title: 'Service Type',
      options: [{
        id: 'financing',
        name: 'Financing'
      }, {
        id: 'credit',
        name: 'Credit'
      }, {
        id: 'riskmanagement',
        name: 'Risk Management'
      }]
    }],
    // Data mapping functions
    mapListResponse: data => {
      return data.map((item: any) => ({
        ...item,
        // Transform any fields if needed
        tags: item.tags || [item.category, item.serviceType].filter(Boolean)
      }));
    },
    mapDetailResponse: data => {
      return {
        ...data,
        // Transform any fields if needed
        highlights: data.highlights || data.details || []
      };
    },
    mapFilterResponse: data => {
      return [{
        id: 'category',
        title: 'Service Category',
        options: data.categories || []
      }, {
        id: 'serviceType',
        title: 'Service Type',
        options: data.serviceTypes || []
      }];
    },
    // Mock data for fallback and schema reference
    mockData: mockFinancialServicesData
  },
  'non-financial': {
    id: 'non-financial',
    title: 'Business Services Marketplace',
    description: 'Find professional services to support and grow your business',
    route: '/marketplace/non-financial',
    primaryCTA: 'Request Service',
    secondaryCTA: 'View Details',
    itemName: 'Business Service',
    itemNamePlural: 'Business Services',
    attributes: [{
      key: 'serviceType',
      label: 'Service Type',
      icon: React.createElement(Award, { size: 18, className: "mr-2" })
    }, {
      key: 'deliveryMode',
      label: 'Service Mode',
      icon: React.createElement(Users, { size: 18, className: "mr-2" })
    }, {
      key: 'duration',
      label: 'Duration',
      icon: React.createElement(Clock, { size: 18, className: "mr-2" })
    }, {
      key: 'price',
      label: 'Cost',
      icon: React.createElement(DollarSign, { size: 18, className: "mr-2" })
    }],
    detailSections: ['description', 'deliveryDetails', 'provider', 'related'],
    tabs: [{
      id: 'about',
      label: 'About This Service',
      icon: Info,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }, {
      id: 'eligibility_terms',
      label: 'Eligibility & Terms',
      icon: CheckCircle,
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }, {
      id: 'application_process',
      label: 'Application Process',
      icon: ClipboardList,
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }, {
      id: 'required_documents',
      label: 'Required Documents',
      icon: FileText,
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }, {
      id: 'provider',
      label: 'About Provider',
      icon: Building,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }],
    summarySticky: true,
    filterCategories: [{
      id: 'category',
      title: 'Service Category',
      options: [{
        id: 'consultancy',
        name: 'Consultancy'
      }, {
        id: 'technology',
        name: 'Technology'
      }, {
        id: 'research',
        name: 'Research'
      }, {
        id: 'export',
        name: 'Export'
      }]
    }, {
      id: 'serviceType',
      title: 'Service Type',
      options: [{
        id: 'advisory',
        name: 'Advisory'
      }, {
        id: 'implementation',
        name: 'Implementation'
      }, {
        id: 'information',
        name: 'Information'
      }, {
        id: 'program',
        name: 'Program'
      }]
    }, {
      id: 'deliveryMode',
      title: 'Delivery Mode',
      options: [{
        id: 'online',
        name: 'Online'
      }, {
        id: 'inperson',
        name: 'In-person'
      }, {
        id: 'hybrid',
        name: 'Hybrid'
      }]
    }],
    // Data mapping functions
    mapListResponse: data => {
      return data.map((item: any) => ({
        ...item,
        // Transform any fields if needed
        tags: item.tags || [item.category, item.serviceType, item.deliveryMode].filter(Boolean)
      }));
    },
    mapDetailResponse: data => {
      return {
        ...data,
        // Transform any fields if needed
        highlights: data.highlights || data.details || []
      };
    },
    mapFilterResponse: data => {
      return [{
        id: 'category',
        title: 'Service Category',
        options: data.categories || []
      }, {
        id: 'serviceType',
        title: 'Service Type',
        options: data.serviceTypes || []
      }, {
        id: 'deliveryMode',
        title: 'Delivery Mode',
        options: data.deliveryModes || []
      }];
    },
    // Mock data for fallback and schema reference
    mockData: mockNonFinancialServicesData
  },
  'knowledge-hub': {
    id: 'knowledge-hub',
    title: 'Knowledge Hub Marketplace',
    description: 'Discover valuable resources, news, events, and tools to support your business journey in Abu Dhabi',
    route: '/marketplace/knowledge-hub',
    primaryCTA: 'Access Now',
    secondaryCTA: 'View Details',
    itemName: 'Resource',
    itemNamePlural: 'Resources',
    attributes: [{
      key: 'mediaType',
      label: 'Type',
      icon: React.createElement(FileType, { size: 18, className: "mr-2" })
    }, {
      key: 'domain',
      label: 'Domain',
      icon: React.createElement(Bookmark, { size: 18, className: "mr-2" })
    }, {
      key: 'businessStage',
      label: 'Business Stage',
      icon: React.createElement(TrendingUp, { size: 18, className: "mr-2" })
    }, {
      key: 'date',
      label: 'Published',
      icon: React.createElement(Calendar, { size: 18, className: "mr-2" })
    }],
    detailSections: ['description', 'content', 'provider', 'related'],
    tabs: [{
      id: 'about',
      label: 'About This Resource',
      icon: Info,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }, {
      id: 'content',
      label: 'Content',
      icon: FileText,
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }, {
      id: 'provider',
      label: 'About Provider',
      icon: Building,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }],
    summarySticky: true,
    filterCategories: [{
      id: 'mediaType',
      title: 'Media Type',
      options: [{
        id: 'news',
        name: 'News'
      }, {
        id: 'article',
        name: 'Article'
      }, {
        id: 'reports',
        name: 'Reports'
      }, {
        id: 'toolkits',
        name: 'Toolkits & Templates'
      }, {
        id: 'guides',
        name: 'Guides'
      }, {
        id: 'events',
        name: 'Events'
      }, {
        id: 'videos',
        name: 'Videos'
      }, {
        id: 'podcasts',
        name: 'Podcasts'
      }]
    }, {
      id: 'businessStage',
      title: 'Business Stage',
      options: [{
        id: 'idea',
        name: 'Idea Stage'
      }, {
        id: 'startup',
        name: 'Startup'
      }, {
        id: 'growth',
        name: 'Growth'
      }, {
        id: 'scaleup',
        name: 'Scale-up'
      }, {
        id: 'established',
        name: 'Established'
      }]
    }, {
      id: 'category',
      title: 'Category',
      options: [{
        id: 'finance',
        name: 'Finance & Funding'
      }, {
        id: 'marketing',
        name: 'Marketing & Sales'
      }, {
        id: 'technology',
        name: 'Technology & Innovation'
      }, {
        id: 'operations',
        name: 'Operations & Productivity'
      }, {
        id: 'legal',
        name: 'Legal & Compliance'
      }, {
        id: 'strategy',
        name: 'Strategy & Growth'
      }]
    }, {
      id: 'format',
      title: 'Format',
      options: [{
        id: 'quickreads',
        name: 'Quick Reads'
      }, {
        id: 'indepth',
        name: 'In-Depth Reports'
      }, {
        id: 'interactive',
        name: 'Interactive Tools'
      }, {
        id: 'templates',
        name: 'Downloadable Templates'
      }, {
        id: 'recorded',
        name: 'Recorded Media'
      }, {
        id: 'live',
        name: 'Live Events'
      }]
    }, {
      id: 'popularity',
      title: 'Popularity',
      options: [{
        id: 'latest',
        name: 'Latest'
      }, {
        id: 'trending',
        name: 'Trending'
      }, {
        id: 'downloaded',
        name: 'Most Downloaded'
      }, {
        id: 'editors',
        name: "Editor's Pick"
      }]
    }],
    // Data mapping functions
    mapListResponse: data => {
      return data.map((item: any) => ({
        ...item,
        // Transform any fields if needed
        tags: item.tags || [item.mediaType, item.domain].filter(Boolean)
      }));
    },
    mapDetailResponse: data => {
      return {
        ...data,
        // Transform any fields if needed
        highlights: data.highlights || []
      };
    },
    mapFilterResponse: data => {
      return [{
        id: 'mediaType',
        title: 'Media Type',
        options: data.mediaTypes || []
      }, {
        id: 'businessStage',
        title: 'Business Stage',
        options: data.businessStages || []
      }, {
        id: 'domain',
        title: 'Domain',
        options: data.domains || []
      }, {
        id: 'format',
        title: 'Format',
        options: data.formats || []
      }, {
        id: 'popularity',
        title: 'Popularity',
        options: data.popularity || []
      }];
    },
    // Mock data for fallback and schema reference
    mockData: mockKnowledgeHubData
  }
};
// Helper to get config by marketplace type
export const getMarketplaceConfig = (type: string): MarketplaceConfig => {
  const config = marketplaceConfig[type];
  if (!config) {
    throw new Error(`No configuration found for marketplace type: ${type}`);
  }
  return config;
};
