// Mock data for Enterprise Journey
// Hero section data
export const mockHeroData = {
  title: 'Accelerate Your Business Growth',
  subtitle: "Enterprise Journey provides the tools, resources and connections to help your business thrive in today’s competitive landscape across the UAE and beyond.",
  stats: [{
    label: 'Businesses Supported',
    value: '10,000+'
  }, {
    label: 'Growth Rate',
    value: '32%'
  }, {
    label: 'Success Rate',
    value: '87%'
  }, {
    label: 'Investment Secured',
    value: 'AED 120M+'
  }]
};
// Growth areas data
export const mockGrowthAreas = [{
  id: 'ga1',
  title: 'Digital Transformation',
  description: 'Leverage technology to revolutionize your business operations and customer experience.',
  icon: 'trending-up',
  stats: {
    businesses: 2453,
    growth: '42%'
  },
  color: 'blue',
  sector: 'Technology',
  trends: [{
    month: 'Jan',
    value: 45
  }, {
    month: 'Feb',
    value: 52
  }, {
    month: 'Mar',
    value: 49
  }, {
    month: 'Apr',
    value: 62
  }, {
    month: 'May',
    value: 67
  }, {
    month: 'Jun',
    value: 69
  }],
  keyPlayers: ['Hub71', 'Microsoft', 'IBM', 'Oracle', 'SAP'],
  opportunities: ['Cloud Migration Services', 'AI Implementation', 'Digital Customer Experience', 'Process Automation', 'Cybersecurity Solutions']
}, {
  id: 'ga2',
  title: 'Market Expansion',
  description: 'Explore new markets and reach untapped customer segments to drive business growth.',
  icon: 'globe',
  stats: {
    businesses: 1872,
    growth: '38%'
  },
  color: 'teal',
  sector: 'Business Development',
  trends: [{
    month: 'Jan',
    value: 38
  }, {
    month: 'Feb',
    value: 42
  }, {
    month: 'Mar',
    value: 47
  }, {
    month: 'Apr',
    value: 53
  }, {
    month: 'May',
    value: 58
  }, {
    month: 'Jun',
    value: 62
  }],
  keyPlayers: ['Etihad Airways', 'DP World', 'Emaar', 'Careem', 'Noon'],
  opportunities: ['E-commerce Enablement', 'Market Entry Consulting', 'Cross-border Trade Solutions', 'Distribution Network Development', 'International Partnerships']
}, {
  id: 'ga3',
  title: 'Operational Excellence',
  description: 'Optimize your business processes to increase efficiency and reduce operational costs.',
  icon: 'settings',
  stats: {
    businesses: 3214,
    growth: '29%'
  },
  color: 'purple',
  sector: 'Operations',
  trends: [{
    month: 'Jan',
    value: 32
  }, {
    month: 'Feb',
    value: 35
  }, {
    month: 'Mar',
    value: 39
  }, {
    month: 'Apr',
    value: 42
  }, {
    month: 'May',
    value: 45
  }, {
    month: 'Jun',
    value: 48
  }],
  keyPlayers: ['ADNOC', 'Emirates Group', 'Mubadala', 'Etisalat', 'First Abu Dhabi Bank'],
  opportunities: ['Supply Chain Optimization', 'Lean Management Implementation', 'Quality Control Systems', 'Resource Planning Solutions', 'Performance Management Tools']
}, {
  id: 'ga4',
  title: 'Innovation & R&D',
  description: 'Develop new products and services to stay ahead of the competition and meet evolving customer needs.',
  icon: 'lightbulb',
  stats: {
    businesses: 1645,
    growth: '45%'
  },
  color: 'lime',
  sector: 'Research',
  trends: [{
    month: 'Jan',
    value: 41
  }, {
    month: 'Feb',
    value: 48
  }, {
    month: 'Mar',
    value: 53
  }, {
    month: 'Apr',
    value: 59
  }, {
    month: 'May',
    value: 65
  }, {
    month: 'Jun',
    value: 72
  }],
  keyPlayers: ['Masdar', 'Khalifa University', 'MBZUAI', 'ADGM', 'Technology Innovation Institute'],
  opportunities: ['Research Partnerships', 'Patent Development', 'Product Prototyping', 'Innovation Labs', 'Intellectual Property Management']
}, {
  id: 'ga5',
  title: 'Sustainable Development',
  description: 'Implement environmentally responsible practices while driving business growth and long-term value.',
  icon: 'leaf',
  stats: {
    businesses: 1327,
    growth: '51%'
  },
  color: 'green',
  sector: 'Sustainability',
  trends: [{
    month: 'Jan',
    value: 48
  }, {
    month: 'Feb',
    value: 52
  }, {
    month: 'Mar',
    value: 58
  }, {
    month: 'Apr',
    value: 63
  }, {
    month: 'May',
    value: 68
  }, {
    month: 'Jun',
    value: 74
  }],
  keyPlayers: ['Environment Agency Abu Dhabi'],
  opportunities: ['Renewable Energy Projects', 'Waste Management Solutions', 'Sustainable Supply Chain', 'Green Building Certification', 'Carbon Offset Programs']
}, {
  id: 'ga6',
  title: 'Financial Technology',
  description: 'Leverage innovative financial technologies to streamline operations, reduce costs and enhance customer experience.',
  icon: 'credit-card',
  stats: {
    businesses: 892,
    growth: '56%'
  },
  color: 'blue',
  sector: 'Finance',
  trends: [{
    month: 'Jan',
    value: 52
  }, {
    month: 'Feb',
    value: 58
  }, {
    month: 'Mar',
    value: 63
  }, {
    month: 'Apr',
    value: 69
  }, {
    month: 'May',
    value: 75
  }, {
    month: 'Jun',
    value: 82
  }],
  keyPlayers: ['Hub71', 'ADGM', 'First Abu Dhabi Bank', 'Abu Dhabi Islamic Bank', 'PayBy'],
  opportunities: ['Digital Banking Solutions', 'Payment Processing Systems', 'Blockchain Implementation', 'Regulatory Technology', 'Financial Inclusion Platforms']
}];
// Directory items data
export const mockDirectoryItems = [{
  id: 'dir1',
  name: 'Tech Innovators Association',
  category: 'Industry Association',
  location: 'Dubai, UAE',
  members: 234,
  rating: 4.8,
  logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A premier association connecting technology innovators across the UAE, providing networking, resources and advocacy.',
  establishedYear: 2015,
  contactEmail: 'info@techinnovatorsassociation.ae',
  contactPhone: '+971 4 123 4567',
  website: 'www.techinnovatorsassociation.ae',
  services: ['Networking Events', 'Industry Research', 'Policy Advocacy', 'Startup Support', 'Technology Workshops']
}, {
  id: 'dir2',
  name: 'Global Finance Partners',
  category: 'Investment Group',
  location: 'Abu Dhabi, UAE',
  members: 189,
  rating: 4.6,
  logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A leading investment group focused on financing innovative businesses and projects across the MENA region.',
  establishedYear: 2008,
  contactEmail: 'info@globalfinancepartners.ae',
  contactPhone: '+971 2 234 5678',
  website: 'www.globalfinancepartners.ae',
  services: ['Venture Capital', 'Private Equity', 'Angel Investment', 'Financial Advisory', 'Business Valuation']
}, {
  id: 'dir3',
  name: 'Sustainable Business Network',
  category: 'Business Network',
  location: 'Sharjah, UAE',
  members: 312,
  rating: 4.7,
  logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A network dedicated to promoting sustainable business practices and environmental responsibility in the UAE.',
  establishedYear: 2012,
  contactEmail: 'connect@sustainablebusiness.ae',
  contactPhone: '+971 6 345 6789',
  website: 'www.sustainablebusiness.ae',
  services: ['Sustainability Certification', 'Green Business Consulting', 'Environmental Impact Assessment', 'CSR Program Development', 'Sustainable Supply Chain Management']
}, {
  id: 'dir4',
  name: 'Digital Marketing Alliance',
  category: 'Professional Network',
  location: 'Dubai, UAE',
  members: 276,
  rating: 4.5,
  logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A collaborative network of digital marketing professionals sharing best practices and industry insights.',
  establishedYear: 2016,
  contactEmail: 'hello@digitalmarketingalliance.ae',
  contactPhone: '+971 4 456 7890',
  website: 'www.digitalmarketingalliance.ae',
  services: ['Digital Strategy Development', 'Marketing Technology Assessment', 'Content Marketing Workshops', 'SEO/SEM Consulting', 'Social Media Management']
}, {
  id: 'dir5',
  name: 'Manufacturing Excellence Group',
  category: 'Industry Consortium',
  location: 'Ajman, UAE',
  members: 198,
  rating: 4.4,
  logo: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A consortium focused on advancing manufacturing capabilities and operational excellence in the UAE.',
  establishedYear: 2010,
  contactEmail: 'info@manufacturingexcellence.ae',
  contactPhone: '+971 6 567 8901',
  website: 'www.manufacturingexcellence.ae',
  services: ['Lean Manufacturing Implementation', 'Quality Management Systems', 'Industry 4.0 Adoption', 'Supply Chain Optimization', 'Workforce Development']
}, {
  id: 'dir6',
  name: 'Healthcare Innovation Hub',
  category: 'Innovation Center',
  location: 'Abu Dhabi, UAE',
  members: 245,
  rating: 4.9,
  logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'An innovation center dedicated to advancing healthcare technology and services in the UAE and beyond.',
  establishedYear: 2017,
  contactEmail: 'info@healthcareinnovationhub.ae',
  contactPhone: '+971 2 678 9012',
  website: 'www.healthcareinnovationhub.ae',
  services: ['Medical Technology Development', 'Healthcare Startup Incubation', 'Clinical Trials Support', 'Digital Health Solutions', 'Medical Research Collaboration']
}, {
  id: 'dir7',
  name: 'Creative Industries Federation',
  category: 'Arts & Culture',
  location: 'Dubai, UAE',
  members: 328,
  rating: 4.7,
  logo: 'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A federation supporting creative professionals and businesses in film, design, media and the arts.',
  establishedYear: 2014,
  contactEmail: 'create@creativeindustries.ae',
  contactPhone: '+971 4 789 0123',
  website: 'www.creativeindustries.ae',
  services: ['Creative Talent Development', 'Arts Funding Guidance', 'Cultural Project Management', 'Design Thinking Workshops', 'Media Production Support']
}, {
  id: 'dir8',
  name: 'Logistics & Supply Chain Council',
  category: 'Industry Association',
  location: 'Abu Dhabi, UAE',
  members: 215,
  rating: 4.6,
  logo: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A council dedicated to advancing logistics and supply chain management practices in the UAE.',
  establishedYear: 2011,
  contactEmail: 'info@logisticssupplychain.ae',
  contactPhone: '+971 2 890 1234',
  website: 'www.logisticssupplychain.ae',
  services: ['Supply Chain Optimization', 'Logistics Technology Assessment', 'Warehouse Management Systems', 'Transportation Network Design', 'Customs & Trade Compliance']
}, {
  id: 'dir9',
  name: 'Real Estate Developers Association',
  category: 'Industry Association',
  location: 'Dubai, UAE',
  members: 187,
  rating: 4.5,
  logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'An association representing real estate developers and promoting sustainable urban development.',
  establishedYear: 2009,
  contactEmail: 'info@realestatedevelopers.ae',
  contactPhone: '+971 4 901 2345',
  website: 'www.realestatedevelopers.ae',
  services: ['Urban Planning Consultation', 'Property Market Research', 'Sustainability Certification', 'Development Financing', 'Regulatory Compliance']
}, {
  id: 'dir10',
  name: 'Aerospace & Aviation Cluster',
  category: 'Industry Consortium',
  location: 'Abu Dhabi, UAE',
  members: 156,
  rating: 4.8,
  logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A consortium focused on advancing the aerospace and aviation industries in the UAE.',
  establishedYear: 2013,
  contactEmail: 'info@aerospaceandaviation.ae',
  contactPhone: '+971 2 012 3456',
  website: 'www.aerospaceandaviation.ae',
  services: ['Aerospace Manufacturing', 'Aviation Technology Development', 'MRO Services', 'Pilot Training Programs', 'Airport Management Consulting']
}, {
  id: 'dir11',
  name: 'Fintech Innovators Group',
  category: 'Technology',
  location: 'Dubai, UAE',
  members: 203,
  rating: 4.7,
  logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A group dedicated to advancing financial technology innovation and adoption in the UAE and MENA region.',
  establishedYear: 2018,
  contactEmail: 'connect@fintechinnovators.ae',
  contactPhone: '+971 4 123 4567',
  website: 'www.fintechinnovators.ae',
  services: ['Blockchain Implementation', 'Digital Payment Solutions', 'Regulatory Technology', 'Financial Inclusion Platforms', 'Insurtech Development']
}, {
  id: 'dir12',
  name: 'Food & Agriculture Consortium',
  category: 'Industry Consortium',
  location: 'Abu Dhabi, UAE',
  members: 178,
  rating: 4.6,
  logo: 'https://images.unsplash.com/photo-1595351298020-7f1db2078f87?q=80&w=300&h=300&auto=format&fit=crop',
  description: 'A consortium focused on advancing food security, agricultural innovation and sustainable farming in the UAE.',
  establishedYear: 2016,
  contactEmail: 'info@foodagriculture.ae',
  contactPhone: '+971 2 234 5678',
  website: 'www.foodagriculture.ae',
  services: ['AgTech Implementation', 'Food Security Consulting', 'Vertical Farming Solutions', 'Water Conservation Technologies', 'Sustainable Agriculture Practices']
}];
// Map locations data
export const mockMapLocations = [{
  id: 'loc1',
  name: 'Enterprise Journey Headquarters',
  position: [25.276987, 55.296249],
  // Dubai
  description: 'Main headquarters and innovation center',
  address: 'Downtown Dubai, UAE',
  contactPhone: '+971 4 123 4567',
  type: 'Headquarters',
  region: 'Dubai',
  services: ['Business Consulting', 'Innovation Labs', 'Startup Incubation', 'Investment Advisory'],
  operatingHours: 'Sunday-to-Thursday: 8:00 AM - 6:00 PM'
}, {
  id: 'loc2',
  name: 'Abu Dhabi Business Hub',
  position: [24.466667, 54.366669],
  // Abu Dhabi
  description: 'Regional operations and business development center',
  address: 'Al Maryah Island, Abu Dhabi, UAE',
  contactPhone: '+971 2 234 5678',
  type: 'Regional Office',
  region: 'Abu Dhabi',
  services: ['Business Development', 'Government Relations', 'Corporate Services', 'Market Entry Support'],
  operatingHours: 'Sunday-to-Thursday: 8:00 AM - 6:00 PM'
}, {
  id: 'loc3',
  name: 'Sharjah Innovation Center',
  position: [25.357119, 55.391068],
  // Sharjah
  description: 'Research and development center focused on innovation',
  address: 'University City, Sharjah, UAE',
  contactPhone: '+971 6 345 6789',
  type: 'Innovation Center',
  region: 'Sharjah',
  services: ['R&D Facilities', 'Technology Testing', 'Academic Partnerships', 'Prototype Development'],
  operatingHours: 'Sunday-to-Thursday: 9:00 AM - 5:00 PM'
}, {
  id: 'loc4',
  name: 'Ajman Business Support Center',
  position: [25.399838, 55.479773],
  // Ajman
  description: 'Business support and development services for Ajman-based enterprises',
  address: 'Al Jurf, Ajman, UAE',
  contactPhone: '+971 6 456 7890',
  type: 'Support Center',
  region: 'Ajman',
  services: ['SME Support', 'Business Licensing', 'Training Programs', 'Networking Events'],
  operatingHours: 'Sunday-to-Thursday: 8:30 AM - 5:30 PM'
}, {
  id: 'loc5',
  name: 'Ras Al Khaimah Economic Zone Office',
  position: [25.789097, 55.942608],
  // RAK
  description: 'Office supporting businesses in the Ras Al Khaimah Economic Zone',
  address: 'RAKEZ Headquarters, Ras Al Khaimah, UAE',
  contactPhone: '+971 7 567 8901',
  type: 'Economic Zone Office',
  region: 'Ras Al Khaimah',
  services: ['Free Zone Setup', 'Business Licensing', 'Investor Relations', 'Trade Facilitation'],
  operatingHours: 'Sunday-to-Thursday: 8:00 AM - 6:00 PM'
}, {
  id: 'loc6',
  name: 'Fujairah Trade & Logistics Center',
  position: [25.123474, 56.328609],
  // Fujairah
  description: 'Center focused on trade and logistics support for businesses',
  address: 'Fujairah Port, Fujairah, UAE',
  contactPhone: '+971 9 678 9012',
  type: 'Trade Center',
  region: 'Fujairah',
  services: ['Logistics Support', 'Trade Facilitation', 'Supply Chain Consulting', 'Export/Import Advisory'],
  operatingHours: 'Sunday-to-Thursday: 8:00 AM - 6:00 PM'
}, {
  id: 'loc7',
  name: 'Umm Al Quwain Business Park',
  position: [25.565598, 55.553040],
  // UAQ
  description: 'Business park offering facilities and services for companies in Umm Al Quwain',
  address: 'King Faisal Street, Umm Al Quwain, UAE',
  contactPhone: '+971 6 789 0123',
  type: 'Business Park',
  region: 'Umm Al Quwain',
  services: ['Office Facilities', 'Business Setup Services', 'Administrative Support', 'Meeting Facilities'],
  operatingHours: 'Sunday-to-Thursday: 8:30 AM - 5:30 PM'
}, {
  id: 'loc8',
  name: 'DIFC Innovation Hub',
  position: [25.211760, 55.275700],
  // DIFC, Dubai
  description: 'Innovation hub located in Dubai International Financial Centre',
  address: 'DIFC, Dubai, UAE',
  contactPhone: '+971 4 890 1234',
  type: 'Innovation Hub',
  region: 'Dubai',
  services: ['Fintech Acceleration', 'Regulatory Sandbox', 'Venture Capital Access', 'Co-working Spaces'],
  operatingHours: 'Sunday-to-Thursday: 8:00 AM - 6:00 PM'
}];
// Business insights data
export const mockBusinessInsights = [{
  id: 'insight1',
  title: 'Digital Transformation Trends in UAE Businesses',
  summary: 'Analysis of how UAE businesses are adopting digital technologies to transform operations and customer experiences.',
  sector: 'Technology',
  publishDate: '2023-11-15',
  author: 'Dr. Ahmed Al Mansouri',
  readTime: 8,
  // minutes
  keyPoints: ['Cloud adoption increased by 42% among UAE enterprises', 'AI implementation growing at 37% annually', 'Digital customer experience prioritized by 78% of businesses', 'Cybersecurity investment up 56% year-over-year'],
  imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 'insight2',
  title: 'Sustainable Business Practices in the UAE',
  summary: 'Overview of sustainability initiatives and their impact on business operations and profitability in the UAE.',
  sector: 'Sustainability',
  publishDate: '2023-10-22',
  author: 'Sarah Johnson',
  readTime: 6,
  // minutes
  keyPoints: ['Renewable energy adoption up 63% among UAE corporations', '82% of UAE businesses have sustainability targets', 'Sustainable practices linked to 23% higher profitability', 'Government incentives driving green business growth'],
  imageUrl: 'https://images.unsplash.com/photo-1623227773277-a4e212533297?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 'insight3',
  title: 'Financial Technology Revolution in the UAE',
  summary: 'Exploration of how fintech is transforming financial services and creating new opportunities in the UAE market.',
  sector: 'Finance',
  publishDate: '2023-12-05',
  author: 'Mohammed Al Hashimi',
  readTime: 7,
  // minutes
  keyPoints: ['Digital payments growing at 45% annually', 'Blockchain adoption in financial services up 38%', '29 new fintech startups launched in 2023', 'Regulatory sandboxes facilitating innovation'],
  imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 'insight4',
  title: 'Manufacturing Innovation in the UAE',
  summary: 'Analysis of advanced manufacturing technologies and practices being implemented across UAE industries.',
  sector: 'Manufacturing',
  publishDate: '2023-09-18',
  author: 'Dr. Fatima Al Qasimi',
  readTime: 9,
  // minutes
  keyPoints: ['Industry 4.0 technologies adopted by 47% of manufacturers', '3D printing implementation up 56% year-over-year', 'Smart factory initiatives reducing costs by average of 32%', 'Advanced robotics improving productivity by 41%'],
  imageUrl: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 'insight5',
  title: 'Healthcare Technology Advancements in the UAE',
  summary: 'Overview of technological innovations transforming healthcare delivery and patient outcomes in the UAE.',
  sector: 'Healthcare',
  publishDate: '2023-11-30',
  author: 'Dr. James Wilson',
  readTime: 7,
  // minutes
  keyPoints: ['Telemedicine adoption up 87% since 2020', 'AI in diagnostics improving accuracy by 43%', 'Digital health startups secured AED 420M in funding', 'Electronic health records implemented in 92% of facilities'],
  imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 'insight6',
  title: 'Retail Innovation Trends in the UAE',
  summary: 'Exploration of how technology is reshaping the retail landscape and consumer experiences in the UAE.',
  sector: 'Retail',
  publishDate: '2023-10-12',
  author: 'Layla Al Mahmoud',
  readTime: 6,
  // minutes
  keyPoints: ['E-commerce growth rate of 38% annually', 'Omnichannel retail strategies adopted by 72% of retailers', 'AR/VR shopping experiences increasing conversion by 24%', 'AI-powered personalization improving customer retention by 31%'],
  imageUrl: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=2070&auto=format&fit=crop'
}];
// Investment opportunities data
export const mockInvestmentOpportunities = [{
  id: 'inv1',
  title: 'Sustainable Urban Development Project',
  sector: 'Real Estate',
  location: 'Abu Dhabi',
  investmentAmount: 25000000,
  // AED 25M
  expectedReturn: '18-22%',
  duration: '5-7 years',
  description: 'Mixed-use development project incorporating sustainable design principles, renewable energy and smart city technologies.',
  highlights: ['LEED Platinum certification target', 'Solar power integration', 'Smart building management systems', 'Water recycling and conservation features'],
  status: 'Seeking Investors',
  minimumInvestment: 500000 // AED 500K
}, {
  id: 'inv2',
  title: 'AgTech Innovation Fund',
  sector: 'Agriculture',
  location: 'UAE-wide',
  investmentAmount: 15000000,
  // AED 15M
  expectedReturn: '15-20%',
  duration: '4-6 years',
  description: 'Venture fund focused on agricultural technology startups addressing food security challenges in arid environments.',
  highlights: ['Vertical farming technologies', 'Water-efficient irrigation solutions', 'AI-powered crop management', 'Sustainable packaging innovations'],
  status: 'Actively Investing',
  minimumInvestment: 250000 // AED 250K
}, {
  id: 'inv3',
  title: 'Healthcare Technology Accelerator',
  sector: 'Healthcare',
  location: 'Dubai',
  investmentAmount: 10000000,
  // AED 10M
  expectedReturn: '20-25%',
  duration: '3-5 years',
  description: 'Accelerator program investing in early-stage healthcare technology companies with innovative solutions.',
  highlights: ['Telemedicine platforms', 'AI diagnostic tools', 'Remote patient monitoring', 'Healthcare data analytics'],
  status: 'Seeking Investors',
  minimumInvestment: 200000 // AED 200K
}, {
  id: 'inv4',
  title: 'Renewable Energy Infrastructure Project',
  sector: 'Energy',
  location: 'Ras Al Khaimah',
  investmentAmount: 50000000,
  // AED 50M
  expectedReturn: '12-15%',
  duration: '8-10 years',
  description: 'Large-scale solar energy project with advanced storage solutions providing clean energy to industrial zones.',
  highlights: ['200MW capacity', 'Battery storage integration', 'Power purchase agreements in place', 'Carbon credit generation'],
  status: 'Under Development',
  minimumInvestment: 1000000 // AED 1M
}, {
  id: 'inv5',
  title: 'Fintech Venture Portfolio',
  sector: 'Finance',
  location: 'DIFC, Dubai',
  investmentAmount: 20000000,
  // AED 20M
  expectedReturn: '22-28%',
  duration: '4-6 years',
  description: 'Diversified portfolio of financial technology startups focusing on payments, blockchain and financial inclusion.',
  highlights: ['Digital payment solutions', 'Blockchain applications', 'Regulatory technology', 'Financial inclusion platforms'],
  status: 'Actively Investing',
  minimumInvestment: 300000 // AED 300K
}, {
  id: 'inv6',
  title: 'Advanced Manufacturing Facility',
  sector: 'Manufacturing',
  location: 'Sharjah',
  investmentAmount: 35000000,
  // AED 35M
  expectedReturn: '14-18%',
  duration: '6-8 years',
  description: 'State-of-the-art manufacturing facility utilizing Industry 4.0 technologies for precision components.',
  highlights: ['Robotics and automation', 'IoT-enabled production', 'Advanced materials processing', 'Digital twin technology'],
  status: 'Seeking Investors',
  minimumInvestment: 750000 // AED 750K
}, {
  id: 'inv7',
  title: 'E-commerce Fulfillment Network',
  sector: 'Logistics',
  location: 'Multiple UAE Locations',
  investmentAmount: 18000000,
  // AED 18M
  expectedReturn: '16-20%',
  duration: '5-7 years',
  description: 'Network of automated fulfillment centers optimized for e-commerce operations across the UAE.',
  highlights: ['Automated sorting and packaging', 'Last-mile delivery optimization', 'Cross-border e-commerce capabilities', 'Integrated inventory management'],
  status: 'Under Development',
  minimumInvestment: 400000 // AED 400K
}, {
  id: 'inv8',
  title: 'Tourism & Hospitality Innovation Fund',
  sector: 'Tourism',
  location: 'UAE-wide',
  investmentAmount: 12000000,
  // AED 12M
  expectedReturn: '15-19%',
  duration: '4-6 years',
  description: 'Investment fund focusing on innovative concepts and technologies in tourism and hospitality.',
  highlights: ['Experiential tourism concepts', 'Virtual and augmented reality applications', 'Sustainable hospitality solutions', 'Smart hotel technologies'],
  status: 'Actively Investing',
  minimumInvestment: 200000 // AED 200K
}];
// Economic indicators data
export const mockEconomicIndicators = [{
  id: 'econ1',
  indicator: 'GDP Growth Rate',
  value: 4.3,
  unit: '%',
  year: 2023,
  trend: 'increasing',
  previousValue: 3.8,
  sector: 'Overall Economy',
  source: 'UAE Federal Competitiveness and Statistics Centre'
}, {
  id: 'econ2',
  indicator: 'Foreign Direct Investment',
  value: 22.7,
  unit: 'billion AED',
  year: 2023,
  trend: 'increasing',
  previousValue: 20.2,
  sector: 'Investment',
  source: 'UAE Central Bank'
}, {
  id: 'econ3',
  indicator: 'Non-Oil Sector Growth',
  value: 5.9,
  unit: '%',
  year: 2023,
  trend: 'increasing',
  previousValue: 4.8,
  sector: 'Non-Oil Economy',
  source: 'Ministry of Economy'
}, {
  id: 'econ4',
  indicator: 'Inflation Rate',
  value: 2.6,
  unit: '%',
  year: 2023,
  trend: 'stable',
  previousValue: 2.5,
  sector: 'Overall Economy',
  source: 'UAE Federal Competitiveness and Statistics Centre'
}, {
  id: 'econ5',
  indicator: 'Unemployment Rate',
  value: 3.1,
  unit: '%',
  year: 2023,
  trend: 'decreasing',
  previousValue: 3.4,
  sector: 'Labor Market',
  source: 'Ministry of Human Resources and Emiratisation'
}, {
  id: 'econ6',
  indicator: 'Digital Economy Contribution to GDP',
  value: 9.7,
  unit: '%',
  year: 2023,
  trend: 'increasing',
  previousValue: 8.2,
  sector: 'Digital Economy',
  source: 'Telecommunications and Digital Government Regulatory Authority'
}, {
  id: 'econ7',
  indicator: 'SME Contribution to GDP',
  value: 53.2,
  unit: '%',
  year: 2023,
  trend: 'increasing',
  previousValue: 51.5,
  sector: 'Business',
  source: 'Ministry of Economy'
}, {
  id: 'econ8',
  indicator: 'Export Value',
  value: 425.3,
  unit: 'billion AED',
  year: 2023,
  trend: 'increasing',
  previousValue: 383.5,
  sector: 'Trade',
  source: 'Federal Customs Authority'
}, {
  id: 'econ9',
  indicator: 'Import Value',
  value: 785.1,
  unit: 'billion AED',
  year: 2023,
  trend: 'increasing',
  previousValue: 742.8,
  sector: 'Trade',
  source: 'Federal Customs Authority'
}, {
  id: 'econ10',
  indicator: 'Tourism Contribution to GDP',
  value: 11.8,
  unit: '%',
  year: 2023,
  trend: 'increasing',
  previousValue: 9.6,
  sector: 'Tourism',
  source: 'Ministry of Economy'
}, {
  id: 'econ11',
  indicator: 'Renewable Energy Capacity',
  value: 8.5,
  unit: 'GW',
  year: 2023,
  trend: 'increasing',
  previousValue: 6.2,
  sector: 'Energy',
  source: 'Ministry of Energy and Infrastructure'
}, {
  id: 'econ12',
  indicator: 'R&D Expenditure as % of GDP',
  value: 1.5,
  unit: '%',
  year: 2023,
  trend: 'increasing',
  previousValue: 1.3,
  sector: 'Research',
  source: 'Ministry of Education'
},
// Previous year data
{
  id: 'econ13',
  indicator: 'GDP Growth Rate',
  value: 3.8,
  unit: '%',
  year: 2022,
  trend: 'increasing',
  previousValue: 3.1,
  sector: 'Overall Economy',
  source: 'UAE Federal Competitiveness and Statistics Centre'
}, {
  id: 'econ14',
  indicator: 'Foreign Direct Investment',
  value: 20.2,
  unit: 'billion AED',
  year: 2022,
  trend: 'increasing',
  previousValue: 17.8,
  sector: 'Investment',
  source: 'UAE Central Bank'
}, {
  id: 'econ15',
  indicator: 'Non-Oil Sector Growth',
  value: 4.8,
  unit: '%',
  year: 2022,
  trend: 'increasing',
  previousValue: 4.1,
  sector: 'Non-Oil Economy',
  source: 'Ministry of Economy'
}, {
  id: 'econ16',
  indicator: 'Inflation Rate',
  value: 2.5,
  unit: '%',
  year: 2022,
  trend: 'increasing',
  previousValue: 1.9,
  sector: 'Overall Economy',
  source: 'UAE Federal Competitiveness and Statistics Centre'
}];
// Event calendar data
export const mockEventCalendar = [{
  id: 'event1',
  title: 'UAE Innovation Summit',
  date: '2024-02-15T09:00:00',
  endDate: '2024-02-17T18:00:00',
  location: 'Dubai World Trade Centre',
  category: 'Conference',
  description: 'Annual summit bringing together innovators, entrepreneurs and industry leaders to showcase the latest technologies and innovations.',
  registrationUrl: 'https://www.example.com/innovation-summit',
  isFree: false,
  price: 'AED 1,500',
  organizer: 'UAE Ministry of Economy',
  speakers: ['H.E. Abdullah bin Touq Al Marri', 'Sarah Al Amiri', 'Dr. Ray Johnson'],
  topics: ['Artificial Intelligence', 'Blockchain', 'Smart Cities', 'Future of Transportation']
}, {
  id: 'event2',
  title: 'Entrepreneurship Workshop Series',
  date: '2024-01-25T14:00:00',
  endDate: '2024-01-25T17:00:00',
  location: 'Hub71, Abu Dhabi',
  category: 'Workshop',
  description: 'Practical workshop series for entrepreneurs covering business planning, funding, marketing and growth strategies.',
  registrationUrl: 'https://www.example.com/entrepreneurship-workshop',
  isFree: true,
  price: null,
  organizer: 'Hub71',
  speakers: ['Mohammed Alabbar', 'Fadi Ghandour'],
  topics: ['Business Planning', 'Startup Funding', 'Growth Strategies']
}, {
  id: 'event3',
  title: 'Sustainability in Business Forum',
  date: '2024-03-10T09:30:00',
  endDate: '2024-03-10T16:30:00',
  location: 'Jumeirah Emirates Towers, Dubai',
  category: 'Forum',
  description: 'Forum focused on sustainable business practices, ESG implementation and green technology adoption.',
  registrationUrl: 'https://www.example.com/sustainability-forum',
  isFree: false,
  price: 'AED 950',
  organizer: 'Dubai Chamber of Commerce',
  speakers: ['Dr. Thani Al Zeyoudi', 'Badr Jafar', 'Sheikha Shamma bint Sultan bin Khalifa Al Nahyan'],
  topics: ['ESG Implementation', 'Circular Economy', 'Renewable Energy', 'Sustainable Supply Chains']
}, {
  id: 'event4',
  title: 'Digital Transformation Masterclass',
  date: '2024-02-28T09:00:00',
  endDate: '2024-02-29T17:00:00',
  location: 'Yas Island Rotana, Abu Dhabi',
  category: 'Training',
  description: 'Two-day intensive masterclass on implementing digital transformation strategies in organizations.',
  registrationUrl: 'https://www.example.com/digital-transformation',
  isFree: false,
  price: 'AED 2,200',
  organizer: 'Abu Dhabi Digital Authority',
  speakers: ['Dr. Mohamed Abdelhameed Al Askar', 'Tariq Al Hemeiri'],
  topics: ['Change Management', 'Process Automation', 'Data Strategy', 'Customer Experience']
}, {
  id: 'event5',
  title: 'UAE-India Business Forum',
  date: '2024-04-05T10:00:00',
  endDate: '2024-04-05T16:00:00',
  location: 'Grand Hyatt, Dubai',
  category: 'Forum',
  description: 'Business forum focused on strengthening trade and investment ties between UAE and India.',
  registrationUrl: 'https://www.example.com/uae-india-forum',
  isFree: false,
  price: 'AED 1,200',
  organizer: 'UAE-India Business Council',
  speakers: ['H.E. Dr. Thani bin Ahmed Al Zeyoudi', 'Piyush Goyal', 'Yusuffali M.A.'],
  topics: ['Bilateral Trade', 'Investment Opportunities', 'Joint Ventures', 'Technology Transfer']
}, {
  id: 'event6',
  title: 'Fintech Innovators Meetup',
  date: '2024-02-20T18:00:00',
  endDate: '2024-02-20T21:00:00',
  location: 'DIFC Innovation Hub, Dubai',
  category: 'Networking',
  description: 'Evening networking event for fintech entrepreneurs, investors and industry professionals.',
  registrationUrl: 'https://www.example.com/fintech-meetup',
  isFree: true,
  price: null,
  organizer: 'DIFC FinTech Hive',
  speakers: [],
  topics: ['Digital Banking', 'Payment Solutions', 'Blockchain Applications', 'Regulatory Technology']
}, {
  id: 'event7',
  title: 'Manufacturing Excellence Conference',
  date: '2024-03-25T09:00:00',
  endDate: '2024-03-26T17:00:00',
  location: 'Expo Centre Sharjah',
  category: 'Conference',
  description: 'Conference showcasing advanced manufacturing technologies, automation and Industry 4.0 implementation.',
  registrationUrl: 'https://www.example.com/manufacturing-conference',
  isFree: false,
  price: 'AED 1,800',
  organizer: 'Sharjah Chamber of Commerce and Industry',
  speakers: ['Dr. Eng. Ali Al Suwaidi', 'Abdallah Al Zamil', 'Dr. Aisha Bin Bishr'],
  topics: ['Industry 4.0', 'Smart Manufacturing', 'Supply Chain Optimization', 'Quality Management']
}, {
  id: 'event8',
  title: 'Healthcare Innovation Hackathon',
  date: '2024-04-15T09:00:00',
  endDate: '2024-04-16T18:00:00',
  location: 'Cleveland Clinic Abu Dhabi',
  category: 'Hackathon',
  description: 'Two-day hackathon focused on developing innovative solutions for healthcare challenges.',
  registrationUrl: 'https://www.example.com/healthcare-hackathon',
  isFree: true,
  price: null,
  organizer: 'Department of Health Abu Dhabi',
  speakers: ['Dr. Jamal Al Kaabi', 'Dr. Asma Al Mannaei'],
  topics: ['Digital Health', 'Patient Experience', 'Medical Technology', 'Healthcare Accessibility']
}];
// News items data
export const mockNewsItems = [{
  id: 'news1',
  title: 'UAE Launches New Business Growth Initiative',
  summary: 'The UAE government has launched a comprehensive program to support business growth and innovation across key sectors.',
  content: 'The United Arab Emirates has unveiled a new initiative aimed at accelerating business growth and fostering innovation across the country. The programme, announced by the Ministry of Economy, includes financial incentives, regulatory reforms and support services for businesses in priority sectors including technology, manufacturing and renewable energy. The initiative is expected to create over 10,000 new jobs and contribute significantly to the UAE’s economic diversification goals. Industry leaders have welcomed the announcement, highlighting the potential for increased competitiveness and innovation in the business ecosystem.',
  publishDate: '2023-12-10',
  category: 'Government Initiatives',
  author: 'Sarah Al Hashimi',
  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  tags: ['Business Growth', 'Government Support', 'Economic Development']
}, {
  id: 'news2',
  title: 'Tech Innovators Forum Announces UAE Expansion',
  summary: 'Global technology forum selects UAE as regional hub for innovation and entrepreneurship development.',
  content: 'The Tech Innovators Forum, a leading global platform for technology innovation and entrepreneurship, has announced a significant expansion of its operations in the UAE. The organisation will establish its Middle East headquarters in Abu Dhabi, with additional innovation hubs in Dubai and Sharjah. This expansion will include accelerator programmes, funding initiatives and educational partnerships designed to nurture the next generation of technology entrepreneurs in the region. The move is expected to attract international technology talent and investment to the UAE, further strengthening its position as a global innovation hub. The first programmes under this expansion will launch in early 2024, with applications opening next month.',
  publishDate: '2023-12-05',
  category: 'Technology',
  author: 'Mohammed Al Qasimi',
  imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
  tags: ['Technology', 'Innovation', 'Entrepreneurship']
}, {
  id: 'news3',
  title: 'Sustainable Business Practices Gaining Momentum in UAE',
  summary: 'New report highlights growing adoption of sustainable business models and ESG practices among UAE companies.',
  content: 'A comprehensive report released today by the UAE Sustainable Business Council reveals a significant increase in the adoption of sustainable business practices and ESG (Environmental, Social and Governance) frameworks among UAE-based companies. The study, which surveyed over 500 businesses across multiple sectors, found that 68% of companies have implemented formal sustainability strategies, up from 42% in 2021. The report attributes this growth to increasing consumer demand, regulatory developments and recognition of the business benefits of sustainability. Notable trends include renewable energy adoption, sustainable supply chain management and transparent ESG reporting. The report also highlights that companies with strong sustainability practices demonstrated 23% higher profitability on average compared to industry peers.',
  publishDate: '2023-11-28',
  category: 'Sustainability',
  author: 'Dr. Fatima Al Nuaimi',
  imageUrl: 'https://images.unsplash.com/photo-1623227773277-a4e212533297?q=80&w=2070&auto=format&fit=crop',
  tags: ['Sustainability', 'ESG', 'Green Business']
}, {
  id: 'news4',
  title: 'UAE-India Trade Agreement Boosts Business Opportunities',
  summary: 'Comprehensive Economic Partnership Agreement between UAE and India creates new avenues for business collaboration.',
  content: 'The Comprehensive Economic Partnership Agreement (CEPA) between the UAE and India is generating significant business opportunities across multiple sectors, according to a new analysis by the UAE-India Business Council. Since the agreement came into effect earlier this year, bilateral trade has increased by 27%, with particularly strong growth in technology services, pharmaceuticals and renewable energy. The report highlights several success stories of cross-border business expansions and joint ventures facilitated by the agreement. Business leaders from both countries have praised the reduction in trade barriers and simplified regulatory procedures. The Council has announced a series of upcoming events and resources to help businesses from both countries maximise the benefits of the agreement and explore new partnership opportunities.',
  publishDate: '2023-12-01',
  category: 'International Trade',
  author: 'Rajiv Sharma',
  imageUrl: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=2076&auto=format&fit=crop',
  tags: ['International Trade', 'UAE-India Relations', 'Business Partnerships']
}, {
  id: 'news5',
  title: 'New Investment Fund Launches to Support UAE Startups',
  summary: 'AED 500 million fund established to invest in early-stage technology startups across the UAE.',
  content: 'A new AED 500 million investment fund has been launched to support early-stage technology startups in the UAE. The fund, backed by a consortium of government entities and private investors, will focus on startups in fintech, healthtech, edtech and sustainable technology sectors. The initiative aims to address the funding gap for early-stage companies and accelerate the growth of the UAE’s startup ecosystem. The fund will provide investments ranging from AED 1 million to AED 10 million, along with mentorship, networking opportunities and strategic guidance. Fund managers have emphasised their commitment to supporting diverse founding teams and innovations that address regional challenges. Applications for the first round of funding will open in January 2024, with investments expected to be disbursed by the second quarter.',
  publishDate: '2023-11-15',
  category: 'Investment',
  author: 'Khalid Al Falasi',
  imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2070&auto=format&fit=crop',
  tags: ['Startup Funding', 'Investment', 'Technology Startups']
}, {
  id: 'news6',
  title: 'UAE Manufacturing Sector Shows Strong Growth',
  summary: 'Manufacturing output in the UAE increases by 8.2% year-over-year, driven by technology adoption and export expansion.',
  content: 'The UAE’s manufacturing sector has recorded impressive growth, with output increasing by 8.2% compared to the same period last year, according to the latest data from the Ministry of Industry and Advanced Technology. The growth has been attributed to several factors, including increased technology adoption, expansion into new export markets and government initiatives supporting industrial development. The report highlights particularly strong performance in advanced manufacturing, pharmaceuticals and food processing subsectors. The manufacturing sector now contributes approximately 14% to the UAE’s GDP, moving closer to the national target of 20% by 2031. Industry experts note that the continued focus on Industry 4.0 technologies and sustainable manufacturing practices positions the UAE as an increasingly competitive global manufacturing hub.',
  publishDate: '2023-11-22',
  category: 'Manufacturing',
  author: 'Ahmed Al Zaabi',
  imageUrl: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?q=80&w=2070&auto=format&fit=crop',
  tags: ['Manufacturing', 'Industrial Growth', 'Economic Diversification']
}];