import React, { useEffect, useMemo, useState, useRef, Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayersControl, Circle, Polygon, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SearchIcon, LayersIcon, BuildingIcon, BriefcaseIcon, GlobeIcon, MapPinIcon, XIcon, ChevronRightIcon, BarChart3Icon, ZapIcon, HeartIcon, DollarSignIcon, TargetIcon, MaximizeIcon, MinimizeIcon, FilterIcon, LaptopIcon, ScaleIcon, TruckIcon, UsersIcon, FlaskConicalIcon, HomeIcon, ShieldIcon, ServerIcon, NetworkIcon, BoxIcon, ArrowRightIcon, CheckIcon, ListIcon, GridIcon, ClipboardIcon, PlusIcon, BarChartIcon, ChevronDownIcon, SlidersIcon } from 'lucide-react';
// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
// Custom icon factory
const createCustomIcon = (color, IconComponent) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="w-8 h-8 flex items-center justify-center rounded-full bg-${color}-100 border-2 border-${color}-500 text-${color}-500 shadow-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${IconComponent === BuildingIcon ? '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>' : IconComponent === BriefcaseIcon ? '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>' : IconComponent === ZapIcon ? '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>' : IconComponent === HeartIcon ? '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>' : IconComponent === DollarSignIcon ? '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' : IconComponent === LaptopIcon ? '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>' : IconComponent === ScaleIcon ? '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>' : IconComponent === TruckIcon ? '<path d="M1 3h15v13H1z"></path><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>' : IconComponent === UsersIcon ? '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' : IconComponent === FlaskConicalIcon ? '<path d="M10 2v7.31"></path><path d="M14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path>' : IconComponent === BoxIcon ? '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path>' : IconComponent === HomeIcon ? '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' : IconComponent === BoxIcon ? '<path d="M20 4v10"></path><path d="M20 10H8"></path><path d="M8 10v10h12V10"></path><path d="M4 10h4"></path><path d="M4 4v16"></path><path d="M4 8h4"></path>' : IconComponent === ShieldIcon ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' : IconComponent === ServerIcon ? '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>' : IconComponent === NetworkIcon ? '<rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path>' : IconComponent === MapPinIcon ? '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>' : '<circle cx="12" cy="12" r="10"></circle>'}
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};
// Map search component
const MapSearch = ({
  points,
  onSelectLocation
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    if (query.length > 1) {
      setIsSearching(true);
      const searchResults = points.filter(point => point.name.toLowerCase().includes(query.toLowerCase()) || point.description.toLowerCase().includes(query.toLowerCase()) || point.category.toLowerCase().includes(query.toLowerCase()) || point.sector && point.sector.toLowerCase().includes(query.toLowerCase()) || point.zone && point.zone.toLowerCase().includes(query.toLowerCase()) || point.services && point.services.some(s => s.toLowerCase().includes(query.toLowerCase())));
      setResults(searchResults);
      setIsSearching(false);
    } else {
      setResults([]);
    }
  }, [query, points]);
  return <div className="absolute top-4 left-4 z-[2000] w-64 sm:w-72 md:w-80 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <input type="text" placeholder="Search businesses, zones, sectors..." className="w-full py-3 pl-10 pr-4 bg-white border-b border-gray-200 focus:outline-none text-sm" value={query} onChange={e => setQuery(e.target.value)} />
        <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {isSearching && <div className="p-4 text-center">
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
        </div>}
      {results.length > 0 && <div className="max-h-60 overflow-y-auto">
          {results.map((result, index) => <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => {
        onSelectLocation(result);
        setQuery('');
        setResults([]);
      }}>
              <div className="font-medium text-sm">{result.name}</div>
              <div className="text-xs text-gray-500">
                {result.sector || result.zone || result.category}
              </div>
            </div>)}
        </div>}
      {query.length > 1 && results.length === 0 && !isSearching && <div className="p-4 text-sm text-gray-500 text-center">
          No results found
        </div>}
    </div>;
};
// Business-focused map data
const businessMapData = {
  // Sector data
  sectors: [{
    id: 's1',
    position: [24.4813, 54.3576],
    name: 'Financial District',
    description: "Abu Dhabi's premier financial hub with global banking institutions and investment firms.",
    category: 'finance',
    sector: 'Financial Services',
    icon: createCustomIcon('purple', DollarSignIcon),
    keyStats: {
      companies: '150+ financial institutions',
      growth: '8.3% annual sector growth',
      workforce: '12,000+ professionals',
      investment: '$27B in annual transactions'
    },
    highlights: ['Home to Abu Dhabi Global Market (ADGM)', 'International Financial Centre (IFC)', 'World-class regulatory framework', 'Tax-efficient environment for businesses'],
    opportunities: ['FinTech innovation programs', 'Wealth management services', 'Islamic finance development', 'Sustainable finance initiatives'],
    setupTime: '2-4 weeks',
    setupCost: '$8,000-15,000',
    suppliers: [{
      name: 'Global Banking Solutions',
      type: 'Financial Technology'
    }, {
      name: 'Regulatory Compliance Partners',
      type: 'Legal Services'
    }, {
      name: 'ADGM Business Centre',
      type: 'Office Solutions'
    }],
    talent: {
      availability: 'High',
      skills: ['Financial Analysis', 'Banking', 'Compliance', 'FinTech'],
      educationPartners: ['INSEAD Abu Dhabi', 'Paris-Sorbonne University Abu Dhabi']
    },
    successStories: [{
      company: 'Revolut',
      description: 'Established MENA headquarters in ADGM, serving as regional hub',
      result: 'Achieved 300% regional customer growth in first year'
    }, {
      company: 'Abu Dhabi Islamic Bank',
      description: 'Launched digital banking innovation center',
      result: 'Developed 15+ new fintech solutions for Islamic finance'
    }]
  }, {
    id: 's2',
    position: [24.5246, 54.4311],
    name: 'Masdar City Tech Hub',
    description: 'Sustainable innovation district focused on clean technology and renewable energy research.',
    category: 'technology',
    sector: 'Technology & Innovation',
    icon: createCustomIcon('blue', LaptopIcon),
    keyStats: {
      companies: '900+ tech startups and companies',
      growth: '11.7% annual sector growth',
      workforce: '5,000+ tech professionals',
      investment: '$15B in technology investments'
    },
    highlights: ['Smart city infrastructure', 'Tech startup ecosystem', 'Innovation incubators', 'Research & development centers'],
    opportunities: ['AI and machine learning ventures', 'Smart city technology implementation', 'Renewable energy tech development', 'Research partnerships with leading institutions'],
    setupTime: '1-3 weeks',
    setupCost: '$5,000-12,000',
    suppliers: [{
      name: 'Masdar Clean Energy',
      type: 'Renewable Energy'
    }, {
      name: 'Smart City Solutions',
      type: 'IoT & Infrastructure'
    }, {
      name: 'Tech Venture Partners',
      type: 'Funding & Acceleration'
    }],
    talent: {
      availability: 'Very High',
      skills: ['Software Development', 'AI/ML', 'Clean Energy', 'Smart Infrastructure'],
      educationPartners: ['Khalifa University', 'Mohamed bin Zayed University of AI']
    },
    successStories: [{
      company: 'Siemens Energy',
      description: 'Established green hydrogen innovation center',
      result: 'Developed breakthrough electrolyzer technology reducing costs by 35%'
    }, {
      company: 'Alef Education',
      description: 'AI-powered education platform built in Masdar',
      result: 'Now deployed in 400+ schools across MENA region'
    }]
  }, {
    id: 's3',
    position: [24.4821, 54.3606],
    name: 'Healthcare Innovation District',
    description: 'Medical research and healthcare services cluster with world-class facilities.',
    category: 'healthcare',
    sector: 'Healthcare & Life Sciences',
    icon: createCustomIcon('red', HeartIcon),
    keyStats: {
      companies: '75+ healthcare providers',
      growth: '9.8% annual sector growth',
      workforce: '8,000+ healthcare professionals',
      investment: '$12B in healthcare infrastructure'
    },
    highlights: ['Cleveland Clinic Abu Dhabi', 'Advanced medical research facilities', 'Pharmaceutical development centers', 'Medical tourism infrastructure'],
    opportunities: ['Digital health innovations', 'Medical research partnerships', 'Specialized healthcare services', 'Health tech startup development'],
    setupTime: '3-6 months',
    setupCost: '$15,000-100,000',
    suppliers: [{
      name: 'Medical Equipment Suppliers LLC',
      type: 'Healthcare Equipment'
    }, {
      name: 'Pharma Distribution Network',
      type: 'Pharmaceutical Distribution'
    }, {
      name: 'Healthcare Regulatory Consultants',
      type: 'Compliance & Licensing'
    }],
    talent: {
      availability: 'Medium-High',
      skills: ['Medical Professionals', 'Research Scientists', 'Healthcare Management'],
      educationPartners: ['Fatima College of Health Sciences', 'UAE University Medical School']
    },
    successStories: [{
      company: 'Cleveland Clinic Abu Dhabi',
      description: 'Established world-class multi-specialty hospital',
      result: 'Treats 400,000+ patients annually, reducing medical tourism outflow by 30%'
    }, {
      company: 'Pure Health',
      description: 'Launched integrated healthcare platform',
      result: "Created UAE's largest laboratory network with 115 labs"
    }]
  }, {
    id: 's4',
    position: [24.4672, 54.393],
    name: 'Energy Innovation Center',
    description: 'Hub for renewable and traditional energy companies with research facilities.',
    category: 'energy',
    sector: 'Energy',
    icon: createCustomIcon('yellow', ZapIcon),
    keyStats: {
      companies: '120+ energy companies',
      growth: '7.5% annual sector growth',
      workforce: '10,000+ energy professionals',
      investment: '$30B in energy infrastructure'
    },
    highlights: ['ADNOC headquarters', 'Renewable energy research centers', 'Energy transition initiatives', 'Sustainable energy development'],
    opportunities: ['Hydrogen economy development', 'Carbon capture technologies', 'Solar energy innovations', 'Energy efficiency solutions'],
    setupTime: '2-5 months',
    setupCost: '$20,000-150,000',
    suppliers: [{
      name: 'ADNOC Energy Services',
      type: 'Energy Infrastructure'
    }, {
      name: 'Renewable Components Manufacturing',
      type: 'Solar & Wind Components'
    }, {
      name: 'Energy Transition Consultants',
      type: 'Advisory Services'
    }],
    talent: {
      availability: 'High',
      skills: ['Petroleum Engineering', 'Renewable Energy', 'Energy Management'],
      educationPartners: ['Petroleum Institute', 'Heriot-Watt University Dubai']
    },
    successStories: [{
      company: 'ADNOC',
      description: 'Launched comprehensive energy transition program',
      result: 'Reduced carbon intensity by 25% while expanding production capacity'
    }, {
      company: 'Masdar',
      description: 'Developed innovative solar technology',
      result: 'Achieved record-low solar electricity cost of 1.35 cents/kWh'
    }]
  }, {
    id: 's5',
    position: [24.4912, 54.377],
    name: 'Manufacturing Excellence Zone',
    description: 'Advanced manufacturing facilities with Industry 4.0 technologies and logistics support.',
    category: 'manufacturing',
    sector: 'Manufacturing',
    icon: createCustomIcon('gray', BoxIcon),
    keyStats: {
      companies: '200+ manufacturing firms',
      growth: '6.8% annual sector growth',
      workforce: '15,000+ manufacturing jobs',
      investment: '$18B in manufacturing capacity'
    },
    highlights: ['Advanced manufacturing facilities', 'Industry 4.0 implementation', 'Export-oriented production', 'Supply chain integration'],
    opportunities: ['Smart manufacturing technologies', 'Aerospace component manufacturing', 'Pharmaceutical production', 'Sustainable manufacturing practices'],
    setupTime: '3-8 months',
    setupCost: '$50,000-500,000',
    suppliers: [{
      name: 'Industrial Automation Systems',
      type: 'Manufacturing Technology'
    }, {
      name: 'Raw Materials Supply Chain',
      type: 'Materials & Components'
    }, {
      name: 'Logistics & Warehousing Solutions',
      type: 'Supply Chain Services'
    }],
    talent: {
      availability: 'Medium',
      skills: ['Industrial Engineering', 'Supply Chain Management', 'Manufacturing Technology'],
      educationPartners: ['Abu Dhabi Polytechnic', 'Higher Colleges of Technology']
    },
    successStories: [{
      company: 'Strata Manufacturing',
      description: 'Established aerospace components factory',
      result: 'Became tier-one supplier to Boeing and Airbus with $1B+ in contracts'
    }, {
      company: 'EGA (Emirates Global Aluminium)',
      description: 'Implemented advanced smelting technology',
      result: 'Reduced energy consumption by 37% while increasing output by 15%'
    }]
  }],
  // Zones data
  zones: [{
    id: 'z1',
    name: 'Abu Dhabi Global Market (ADGM)',
    description: 'International financial free zone with its own civil and commercial laws.',
    category: 'free zone',
    zone: 'Financial Free Zone',
    position: [24.4813, 54.3576],
    icon: createCustomIcon('purple', BuildingIcon),
    boundaries: [[24.4913, 54.3676], [24.4913, 54.3476], [24.4713, 54.3476], [24.4713, 54.3676]],
    keyStats: {
      established: '2013',
      companies: '3,700+ registered entities',
      sectors: 'Financial services, fintech, professional services',
      incentives: '0% tax rate, 100% foreign ownership'
    },
    highlights: ['Independent regulatory framework', 'Common law jurisdiction', 'World-class business infrastructure', 'Strategic location on Al Maryah Island'],
    opportunities: ['Financial services licensing', 'Investment fund establishment', 'FinTech development', 'Wealth management operations'],
    setupTime: '2-4 weeks',
    setupCost: '$8,000-15,000',
    suppliers: [{
      name: 'Global Banking Solutions',
      type: 'Financial Technology'
    }, {
      name: 'Regulatory Compliance Partners',
      type: 'Legal Services'
    }, {
      name: 'ADGM Business Centre',
      type: 'Office Solutions'
    }],
    talent: {
      availability: 'High',
      skills: ['Financial Analysis', 'Banking', 'Compliance', 'FinTech'],
      educationPartners: ['INSEAD Abu Dhabi', 'Paris-Sorbonne University Abu Dhabi']
    },
    successStories: [{
      company: 'Revolut',
      description: 'Established MENA headquarters in ADGM, serving as regional hub',
      result: 'Achieved 300% regional customer growth in first year'
    }, {
      company: 'Abu Dhabi Islamic Bank',
      description: 'Launched digital banking innovation center',
      result: 'Developed 15+ new fintech solutions for Islamic finance'
    }]
  }, {
    id: 'z2',
    name: 'Masdar City Free Zone',
    description: 'Sustainability-focused economic zone specializing in clean technology and renewable energy.',
    category: 'free zone',
    zone: 'Technology Free Zone',
    position: [24.5246, 54.4311],
    icon: createCustomIcon('green', MapPinIcon),
    boundaries: [[24.5346, 54.4411], [24.5346, 54.4211], [24.5146, 54.4211], [24.5146, 54.4411]],
    keyStats: {
      established: '2008',
      companies: '900+ registered businesses',
      sectors: 'Clean energy, technology, R&D',
      incentives: '0% import tariffs, 100% foreign ownership'
    },
    highlights: ['Sustainability-focused business ecosystem', 'Innovation center and startup hub', 'Renewable energy research facilities', 'Smart city infrastructure'],
    opportunities: ['Clean technology development', 'Renewable energy ventures', 'Sustainable urban solutions', 'Green building technology'],
    setupTime: '1-3 weeks',
    setupCost: '$5,000-12,000',
    suppliers: [{
      name: 'Masdar Clean Energy',
      type: 'Renewable Energy'
    }, {
      name: 'Smart City Solutions',
      type: 'IoT & Infrastructure'
    }, {
      name: 'Tech Venture Partners',
      type: 'Funding & Acceleration'
    }],
    talent: {
      availability: 'Very High',
      skills: ['Software Development', 'AI/ML', 'Clean Energy', 'Smart Infrastructure'],
      educationPartners: ['Khalifa University', 'Mohamed bin Zayed University of AI']
    },
    successStories: [{
      company: 'Siemens Energy',
      description: 'Established green hydrogen innovation center',
      result: 'Developed breakthrough electrolyzer technology reducing costs by 35%'
    }, {
      company: 'Alef Education',
      description: 'AI-powered education platform built in Masdar',
      result: 'Now deployed in 400+ schools across MENA region'
    }]
  }, {
    id: 'z3',
    name: 'Khalifa Industrial Zone (KIZAD)',
    description: 'Integrated trade, logistics, and industrial hub adjacent to Khalifa Port.',
    category: 'industrial zone',
    zone: 'Industrial Zone',
    position: [24.5133, 54.4717],
    icon: createCustomIcon('gray', BoxIcon),
    boundaries: [[24.5233, 54.4817], [24.5233, 54.4617], [24.5033, 54.4617], [24.5033, 54.4817]],
    keyStats: {
      established: '2010',
      area: '410 sq km',
      sectors: 'Manufacturing, logistics, trade',
      incentives: 'Competitive lease rates, excellent connectivity'
    },
    highlights: ['Deep-water port access', 'Integrated logistics solutions', 'Modular land plots', 'Excellent transportation links'],
    opportunities: ['Manufacturing facility establishment', 'Logistics operations', 'Trade and distribution centers', 'Industrial R&D facilities'],
    setupTime: '3-8 months',
    setupCost: '$50,000-500,000',
    suppliers: [{
      name: 'Industrial Automation Systems',
      type: 'Manufacturing Technology'
    }, {
      name: 'Raw Materials Supply Chain',
      type: 'Materials & Components'
    }, {
      name: 'Logistics & Warehousing Solutions',
      type: 'Supply Chain Services'
    }],
    talent: {
      availability: 'Medium',
      skills: ['Industrial Engineering', 'Supply Chain Management', 'Manufacturing Technology'],
      educationPartners: ['Abu Dhabi Polytechnic', 'Higher Colleges of Technology']
    },
    successStories: [{
      company: 'Strata Manufacturing',
      description: 'Established aerospace components factory',
      result: 'Became tier-one supplier to Boeing and Airbus with $1B+ in contracts'
    }, {
      company: 'EGA (Emirates Global Aluminium)',
      description: 'Implemented advanced smelting technology',
      result: 'Reduced energy consumption by 37% while increasing output by 15%'
    }]
  }, {
    id: 'z4',
    name: 'twofour54 (Media Zone Authority)',
    description: 'Media and entertainment free zone supporting content creation and digital media.',
    category: 'free zone',
    zone: 'Media Free Zone',
    position: [24.4912, 54.357],
    icon: createCustomIcon('blue', NetworkIcon),
    boundaries: [[24.5012, 54.367], [24.5012, 54.347], [24.4812, 54.347], [24.4812, 54.367]],
    keyStats: {
      established: '2008',
      companies: '600+ media companies',
      sectors: 'Media, entertainment, gaming, publishing',
      incentives: '0% corporate tax, 100% foreign ownership'
    },
    highlights: ['State-of-the-art production facilities', 'Media training academy', 'Creative community', 'Content creation support'],
    opportunities: ['Film and TV production', 'Digital content creation', 'Gaming and app development', 'Media training and education'],
    setupTime: '2-5 weeks',
    setupCost: '$10,000-30,000',
    suppliers: [{
      name: 'Creative Production Services',
      type: 'Media Production'
    }, {
      name: 'Digital Content Distribution',
      type: 'Content Networks'
    }, {
      name: 'Media Technology Providers',
      type: 'Equipment & Software'
    }],
    talent: {
      availability: 'High',
      skills: ['Media Production', 'Digital Marketing', 'Content Creation', 'Gaming Development'],
      educationPartners: ['New York University Abu Dhabi', 'SAE Institute']
    },
    successStories: [{
      company: 'Image Nation Abu Dhabi',
      description: 'Established film and TV production company',
      result: 'Produced award-winning content distributed globally on Netflix and Amazon'
    }, {
      company: 'Unity Technologies',
      description: 'Opened Middle East gaming center',
      result: 'Trained 2,000+ developers and supported 50+ local game studios'
    }]
  }, {
    id: 'z5',
    name: 'ICAD (Industrial City of Abu Dhabi)',
    description: 'Established industrial area hosting manufacturing and processing facilities.',
    category: 'industrial zone',
    zone: 'Industrial Zone',
    position: [24.4527, 54.4125],
    icon: createCustomIcon('yellow', BoxIcon),
    boundaries: [[24.4627, 54.4225], [24.4627, 54.4025], [24.4427, 54.4025], [24.4427, 54.4225]],
    keyStats: {
      established: '1998',
      area: '40 sq km',
      sectors: 'Manufacturing, food processing, engineering',
      incentives: 'Established infrastructure, skilled labor access'
    },
    highlights: ['Developed industrial infrastructure', 'Proximity to urban centers', 'Logistics support', 'Worker accommodation zones'],
    opportunities: ['Light and medium manufacturing', 'Food processing facilities', 'Engineering workshops', 'Industrial services'],
    setupTime: '2-6 months',
    setupCost: '$30,000-250,000',
    suppliers: [{
      name: 'Industrial Equipment Suppliers',
      type: 'Machinery & Tools'
    }, {
      name: 'Raw Materials Distributors',
      type: 'Production Materials'
    }, {
      name: 'Industrial Workforce Solutions',
      type: 'Labor & Staffing'
    }],
    talent: {
      availability: 'Medium-High',
      skills: ['Manufacturing', 'Engineering', 'Industrial Operations', 'Quality Control'],
      educationPartners: ['Abu Dhabi Vocational Education and Training Institute', 'BITS Pilani Dubai']
    },
    successStories: [{
      company: 'National Food Products Company',
      description: 'Established large-scale food processing facility',
      result: 'Achieved 70% market share in dairy products with export to 20+ countries'
    }, {
      company: 'Al Dahra Agriculture',
      description: 'Built advanced food processing center',
      result: 'Increased production capacity by 200% while reducing water usage by 40%'
    }]
  }],
  // Business services data
  services: [{
    id: 'bs1',
    name: 'Hub71 Tech Accelerator',
    description: 'Global tech ecosystem offering incentive programs and support for startups.',
    category: 'accelerator',
    services: ['Startup Acceleration', 'Funding Access', 'Mentorship'],
    position: [24.4913, 54.3576],
    icon: createCustomIcon('blue', LaptopIcon),
    keyStats: {
      established: '2019',
      startups: '200+ global startups',
      funding: 'Access to $250M+ venture capital',
      incentives: 'Subsidized housing, health insurance, office space'
    },
    highlights: ['Global startup ecosystem', 'Corporate innovation programs', 'Investor network access', 'Government partnership initiatives'],
    opportunities: ['Startup incubation programs', 'Corporate innovation partnerships', 'Investment opportunities', 'Market entry facilitation'],
    setupTime: '1-2 weeks',
    setupCost: '$0-5,000',
    suppliers: [{
      name: 'Tech Startup Services',
      type: 'Business Development'
    }, {
      name: 'Venture Capital Networks',
      type: 'Funding'
    }, {
      name: 'Innovation Consultants',
      type: 'Advisory'
    }],
    talent: {
      availability: 'Very High',
      skills: ['Entrepreneurship', 'Technology Development', 'Business Development'],
      educationPartners: ['INSEAD', 'NYU Abu Dhabi']
    },
    successStories: [{
      company: 'Sarwa',
      description: 'Digital investment platform launched through Hub71',
      result: 'Raised $15M and grew to 50,000+ users across MENA'
    }, {
      company: 'Shorooq Partners',
      description: 'VC firm established through Hub71',
      result: 'Built $150M portfolio supporting 30+ regional startups'
    }]
  }, {
    id: 'bs2',
    name: 'ADGM Academy',
    description: 'Financial education and training center offering professional certification programs.',
    category: 'education',
    services: ['Financial Training', 'Professional Certification', 'Executive Education'],
    position: [24.4833, 54.3576],
    icon: createCustomIcon('purple', UsersIcon),
    keyStats: {
      established: '2018',
      programs: '50+ professional courses',
      partners: '25+ global educational partners',
      graduates: '5,000+ professionals trained'
    },
    highlights: ['Financial services training', 'Professional certification programs', 'Executive education courses', 'Industry partnerships'],
    opportunities: ['Financial professional development', 'Corporate training programs', 'Educational partnerships', 'Regulatory compliance training'],
    setupTime: 'N/A',
    setupCost: 'N/A',
    suppliers: [{
      name: 'Educational Content Providers',
      type: 'Training Materials'
    }, {
      name: 'Certification Bodies',
      type: 'Professional Accreditation'
    }, {
      name: 'Financial Training Technology',
      type: 'EdTech'
    }],
    talent: {
      availability: 'High',
      skills: ['Financial Services', 'Regulatory Compliance', 'Investment Management'],
      educationPartners: ['London Business School', 'CFA Institute']
    },
    successStories: [{
      company: 'ADGM Academy',
      description: 'Launched comprehensive FinTech training program',
      result: 'Certified 500+ professionals in blockchain, AI, and digital banking'
    }, {
      company: 'Abu Dhabi Financial Group',
      description: 'Implemented customized executive training',
      result: 'Improved portfolio performance by 18% through advanced techniques'
    }]
  }, {
    id: 'bs3',
    name: 'WeWork Abu Dhabi',
    description: 'Premium coworking space offering flexible office solutions for businesses of all sizes.',
    category: 'coworking',
    services: ['Flexible Workspace', 'Meeting Facilities', 'Networking Events'],
    position: [24.4913, 54.3626],
    icon: createCustomIcon('green', HomeIcon),
    keyStats: {
      established: '2020',
      capacity: '1,200 workstations',
      amenities: 'Meeting rooms, event spaces, high-speed internet',
      membership: 'Daily, monthly, and annual plans available'
    },
    highlights: ['Premium office facilities', 'Flexible workspace solutions', 'Business networking community', 'Central business district location'],
    opportunities: ['Flexible office rental', 'Business networking', 'Corporate event hosting', 'Market entry base'],
    setupTime: '1-7 days',
    setupCost: '$500-3,000/month',
    suppliers: [{
      name: 'Office Equipment Providers',
      type: 'Workspace Technology'
    }, {
      name: 'Business Services Network',
      type: 'Support Services'
    }, {
      name: 'Event Management',
      type: 'Networking & Community'
    }],
    talent: {
      availability: 'High',
      skills: ['Diverse professional backgrounds', 'Entrepreneurship', 'Remote Work'],
      educationPartners: ['N/A']
    },
    successStories: [{
      company: 'TechStars Accelerator',
      description: 'Launched Middle East program from WeWork',
      result: 'Incubated 25 startups that collectively raised over $40M'
    }, {
      company: 'Remote First Inc',
      description: 'Used WeWork as MENA headquarters',
      result: 'Scaled to 50 employees across region without long-term lease commitments'
    }]
  }, {
    id: 'bs4',
    name: 'Abu Dhabi Investment Office',
    description: 'Government entity supporting business setup and investment in Abu Dhabi.',
    category: 'government',
    services: ['Investment Facilitation', 'Business Setup', 'Government Relations'],
    position: [24.4672, 54.363],
    icon: createCustomIcon('blue', BriefcaseIcon),
    keyStats: {
      established: '2019',
      investment: 'Facilitated $8B+ in investments',
      sectors: 'Support across all priority sectors',
      incentives: 'Access to government incentive programs'
    },
    highlights: ['Investment facilitation services', 'Market intelligence and insights', 'Investor care and support', 'Government relations assistance'],
    opportunities: ['Investment partnerships', 'Business expansion support', 'Market entry facilitation', 'Incentive program access'],
    setupTime: 'N/A',
    setupCost: 'N/A',
    suppliers: [{
      name: 'Government Relations Consultants',
      type: 'Public Affairs'
    }, {
      name: 'Investment Advisory Firms',
      type: 'Financial Advisory'
    }, {
      name: 'Business Setup Services',
      type: 'Administration'
    }],
    talent: {
      availability: 'N/A',
      skills: ['N/A'],
      educationPartners: ['N/A']
    },
    successStories: [{
      company: 'Amazon Web Services',
      description: 'Established Middle East cloud region',
      result: 'Created 1,500+ jobs and $5B in infrastructure investment'
    }, {
      company: 'Plug and Play Tech Center',
      description: 'Launched MENA innovation hub with ADIO support',
      result: 'Connected 100+ startups with corporate partners and investors'
    }]
  }, {
    id: 'bs5',
    name: 'Emirates Logistics Center',
    description: 'Integrated logistics hub offering warehousing, distribution, and supply chain services.',
    category: 'logistics',
    services: ['Warehousing', 'Distribution', 'Supply Chain Management'],
    position: [24.4527, 54.3925],
    icon: createCustomIcon('yellow', TruckIcon),
    keyStats: {
      established: '2015',
      area: '100,000 sq m facility',
      capacity: '250,000+ shipments annually',
      connectivity: 'Air, sea, and land transport links'
    },
    highlights: ['Modern warehousing facilities', 'Distribution network access', 'Supply chain management services', 'Customs clearance support'],
    opportunities: ['Warehousing and storage solutions', 'Distribution partnerships', 'Supply chain optimization', 'E-commerce fulfillment services'],
    setupTime: '1-3 months',
    setupCost: '$10,000-50,000',
    suppliers: [{
      name: 'Logistics Technology Providers',
      type: 'Supply Chain Software'
    }, {
      name: 'Warehousing Equipment',
      type: 'Storage & Handling'
    }, {
      name: 'Transportation Networks',
      type: 'Distribution'
    }],
    talent: {
      availability: 'Medium',
      skills: ['Supply Chain Management', 'Logistics Operations', 'Inventory Control'],
      educationPartners: ['Abu Dhabi University', 'Higher Colleges of Technology']
    },
    successStories: [{
      company: 'Noon.com',
      description: 'Established regional fulfillment center',
      result: 'Reduced delivery times by 60% across UAE and Saudi Arabia'
    }, {
      company: 'DHL Express',
      description: 'Expanded logistics hub',
      result: 'Increased regional package capacity by 150% with automated sorting'
    }]
  }, {
    id: 'bs6',
    name: 'Abu Dhabi Legal Center',
    description: 'Cluster of international and local law firms providing comprehensive legal services.',
    category: 'legal',
    services: ['Corporate Law', 'Commercial Contracts', 'Regulatory Compliance'],
    position: [24.4813, 54.3526],
    icon: createCustomIcon('purple', ScaleIcon),
    keyStats: {
      established: '2012',
      firms: '50+ international and local law firms',
      specializations: 'Corporate, commercial, regulatory',
      languages: 'Services in 15+ languages'
    },
    highlights: ['International legal expertise', 'Business setup legal support', 'Regulatory compliance services', 'Commercial contract assistance'],
    opportunities: ['Legal representation', 'Regulatory compliance guidance', 'Contract development and review', 'Intellectual property protection'],
    setupTime: 'N/A',
    setupCost: 'N/A',
    suppliers: [{
      name: 'Legal Research Providers',
      type: 'Information Services'
    }, {
      name: 'Translation & Interpretation',
      type: 'Language Services'
    }, {
      name: 'Legal Technology Solutions',
      type: 'LegalTech'
    }],
    talent: {
      availability: 'High',
      skills: ['Corporate Law', 'Commercial Law', 'Regulatory Compliance'],
      educationPartners: ['Paris-Sorbonne University Abu Dhabi', 'DIFC Academy of Law']
    },
    successStories: [{
      company: 'Clifford Chance',
      description: 'Established regional headquarters',
      result: 'Facilitated $20B+ in regional transactions'
    }, {
      company: 'Al Tamimi & Company',
      description: 'Expanded specialized practice areas',
      result: 'Supported 500+ business establishments in Abu Dhabi'
    }]
  }, {
    id: 'bs7',
    name: 'Cyber Security Innovation Center',
    description: 'Advanced facility focused on cybersecurity solutions and digital protection services.',
    category: 'technology',
    services: ['Cyber Security', 'Digital Protection', 'Security Consulting'],
    position: [24.5046, 54.4111],
    icon: createCustomIcon('red', ShieldIcon),
    keyStats: {
      established: '2018',
      clients: '300+ government and private entities',
      services: 'Cybersecurity, digital forensics, training',
      certifications: 'ISO 27001, SOC 2 compliance'
    },
    highlights: ['Advanced security operations center', 'Digital forensics capabilities', 'Security compliance consulting', 'Cybersecurity training programs'],
    opportunities: ['Security partnership programs', 'Digital protection services', 'Cybersecurity compliance consulting', 'Security technology implementation'],
    setupTime: '1-3 months',
    setupCost: '$15,000-75,000',
    suppliers: [{
      name: 'Security Technology Providers',
      type: 'Cybersecurity Tools'
    }, {
      name: 'Compliance Certification Bodies',
      type: 'Standards & Auditing'
    }, {
      name: 'Threat Intelligence Networks',
      type: 'Security Information'
    }],
    talent: {
      availability: 'Medium-High',
      skills: ['Cybersecurity', 'Digital Forensics', 'Network Security', 'Compliance'],
      educationPartners: ['Khalifa University', 'Rabdan Academy']
    },
    successStories: [{
      company: 'DarkMatter Group',
      description: 'Established advanced cyber defense center',
      result: 'Protected critical infrastructure from 10,000+ daily threats'
    }, {
      company: 'G42',
      description: 'Developed AI-powered security solutions',
      result: 'Reduced false positives by 85% in threat detection systems'
    }]
  }, {
    id: 'bs8',
    name: 'Innovation Research Labs',
    description: 'R&D facility supporting scientific research and technological innovation.',
    category: 'research',
    services: ['R&D Facilities', 'Innovation Support', 'Technology Testing'],
    position: [24.5146, 54.4311],
    icon: createCustomIcon('green', FlaskConicalIcon),
    keyStats: {
      established: '2016',
      facilities: '15,000 sq m of lab space',
      partnerships: '20+ university research partnerships',
      patents: 'Supported 150+ patent applications'
    },
    highlights: ['Advanced research laboratories', 'Scientific equipment access', 'Academic partnerships', 'Commercialization support'],
    opportunities: ['Research collaboration', 'Technology testing and validation', 'Innovation partnerships', 'Product development support'],
    setupTime: '2-6 months',
    setupCost: '$25,000-200,000',
    suppliers: [{
      name: 'Laboratory Equipment Suppliers',
      type: 'Research Instrumentation'
    }, {
      name: 'Scientific Materials Providers',
      type: 'Research Consumables'
    }, {
      name: 'Intellectual Property Services',
      type: 'Patent & Licensing'
    }],
    talent: {
      availability: 'High',
      skills: ['Research Scientists', 'Laboratory Technicians', 'R&D Specialists'],
      educationPartners: ['Khalifa University', 'UAE University', 'MBZUAI']
    },
    successStories: [{
      company: 'Technology Innovation Institute',
      description: 'Established quantum computing research center',
      result: "Developed region's first quantum computer with 27 qubits"
    }, {
      company: 'ASPIRE',
      description: 'Launched advanced materials research program',
      result: 'Created breakthrough carbon capture material reducing costs by 40%'
    }]
  }],
  // Talent data
  talent: [{
    id: 't1',
    name: 'Mohamed bin Zayed University of Artificial Intelligence',
    description: "World's first graduate-level, research-based AI university offering specialized programs in machine learning, computer vision, and natural language processing.",
    category: 'education',
    type: 'University',
    position: [24.523, 54.435],
    icon: createCustomIcon('blue', UsersIcon),
    keyStats: {
      established: '2019',
      students: '500+ graduate students',
      faculty: '50+ world-renowned AI researchers',
      research: '100+ active research projects'
    },
    highlights: ['Full scholarship programs', 'State-of-the-art AI research facilities', 'Industry partnership programs', 'Global faculty from top institutions'],
    opportunities: ['Research collaboration', 'Talent recruitment', 'Executive education', 'Industry-specific AI solutions']
  }, {
    id: 't2',
    name: 'Khalifa University',
    description: 'Leading research university offering engineering, sciences, and business programs with strong industry connections.',
    category: 'education',
    type: 'University',
    position: [24.4781, 54.3576],
    icon: createCustomIcon('purple', UsersIcon),
    keyStats: {
      established: '2007',
      students: '4,000+ undergraduate and graduate students',
      faculty: '300+ faculty members',
      research: '20+ research centers'
    },
    highlights: ['Engineering and technology focus', 'Advanced research facilities', 'Industry-sponsored research', 'Entrepreneurship programs'],
    opportunities: ['Graduate recruitment', 'Research partnerships', 'Technology transfer', 'Innovation incubation']
  }, {
    id: 't3',
    name: 'Abu Dhabi Vocational Education and Training Institute',
    description: 'Vocational training institute developing skilled workforce for key industries in Abu Dhabi.',
    category: 'education',
    type: 'Vocational Training',
    position: [24.4672, 54.373],
    icon: createCustomIcon('green', UsersIcon),
    keyStats: {
      established: '2010',
      students: '10,000+ students annually',
      programs: '50+ vocational programs',
      placement: '85% employment rate'
    },
    highlights: ['Industry-aligned curriculum', 'Practical skills training', 'Apprenticeship programs', 'Continuing education'],
    opportunities: ['Skilled workforce recruitment', 'Customized training programs', 'Industry certification', 'Workforce development']
  }, {
    id: 't4',
    name: 'Abu Dhabi Global Talent Hub',
    description: 'Centralized talent acquisition and development center supporting businesses with recruitment and workforce solutions.',
    category: 'recruitment',
    type: 'Talent Center',
    position: [24.4812, 54.3626],
    icon: createCustomIcon('blue', UsersIcon),
    keyStats: {
      established: '2018',
      placements: '5,000+ professionals annually',
      sectors: 'Coverage across all priority sectors',
      database: '50,000+ qualified professionals'
    },
    highlights: ['Executive search services', 'Specialized recruitment', 'Talent development programs', 'Labor market intelligence'],
    opportunities: ['Talent sourcing', 'Recruitment process outsourcing', 'Skills assessment', 'Workforce planning']
  }, {
    id: 't5',
    name: 'INSEAD Abu Dhabi Campus',
    description: 'Middle East campus of the renowned international business school offering executive education and MBA programs.',
    category: 'education',
    type: 'Business School',
    position: [24.4913, 54.3626],
    icon: createCustomIcon('purple', UsersIcon),
    keyStats: {
      established: '2010',
      programs: 'MBA, Executive MBA, executive education',
      alumni: '5,000+ in MENA region',
      ranking: 'Consistently top-ranked business school'
    },
    highlights: ['Global business education', 'Executive leadership programs', 'Entrepreneurship focus', 'International network'],
    opportunities: ['Executive recruitment', 'Management training', 'Business consulting projects', 'Innovation workshops']
  }],
  // Infrastructure data
  infrastructure: [{
    id: 'i1',
    name: 'Etihad Rail',
    description: 'National railway network connecting industrial zones, urban centers, and ports across the UAE.',
    category: 'transportation',
    type: 'Railway',
    position: [24.4527, 54.3925],
    icon: createCustomIcon('yellow', TruckIcon),
    keyStats: {
      established: '2009',
      network: '1,200 km planned network',
      capacity: '60 million tonnes of freight annually',
      connectivity: 'Links to all major industrial zones and ports'
    },
    highlights: ['Freight and logistics services', 'Multimodal transport connections', 'Reduced transportation costs', 'Lower carbon emissions'],
    opportunities: ['Logistics partnerships', 'Distribution center development', 'Supply chain optimization', 'Cross-border trade']
  }, {
    id: 'i2',
    name: 'Khalifa Port',
    description: 'Advanced deep-water port with state-of-the-art container and cargo handling facilities.',
    category: 'transportation',
    type: 'Port',
    position: [24.5133, 54.4717],
    icon: createCustomIcon('blue', TruckIcon),
    keyStats: {
      established: '2012',
      capacity: '5 million TEU containers annually',
      area: '100 sq km port zone',
      connectivity: 'Serving 25+ shipping lines with 70+ direct destinations'
    },
    highlights: ['Semi-automated container terminal', 'Deep-water berths', 'Integrated with KIZAD industrial zone', 'Multi-purpose logistics'],
    opportunities: ['Port operations', 'Shipping services', 'Warehousing and distribution', 'Trade facilitation']
  }, {
    id: 'i3',
    name: 'Abu Dhabi International Airport',
    description: 'Major international airport serving as a global aviation hub with extensive cargo facilities.',
    category: 'transportation',
    type: 'Airport',
    position: [24.433, 54.6511],
    icon: createCustomIcon('green', TruckIcon),
    keyStats: {
      established: '1982 (major expansion 2023)',
      capacity: '45 million passengers annually',
      cargo: '800,000 tonnes of cargo capacity',
      connectivity: '88 destinations in 56 countries'
    },
    highlights: ['New Midfield Terminal', 'Air cargo facilities', 'Maintenance, repair, and overhaul services', 'Free zone status'],
    opportunities: ['Air freight services', 'Aviation services', 'Logistics operations', 'E-commerce fulfillment']
  }, {
    id: 'i4',
    name: 'Masdar City Smart Grid',
    description: 'Advanced smart grid and renewable energy infrastructure powering the sustainable city development.',
    category: 'utilities',
    type: 'Energy Infrastructure',
    position: [24.5246, 54.4311],
    icon: createCustomIcon('yellow', ZapIcon),
    keyStats: {
      established: '2008',
      capacity: '10 MW solar power plant',
      efficiency: '40% lower energy consumption than conventional grids',
      technology: 'Smart meters, energy storage, demand management'
    },
    highlights: ['Renewable energy integration', 'Smart grid technology', 'Energy storage solutions', 'Demand response systems'],
    opportunities: ['Clean energy projects', 'Smart grid technology testing', 'Energy efficiency solutions', 'Sustainable power systems']
  }, {
    id: 'i5',
    name: 'Abu Dhabi Data Center',
    description: 'Tier 4 data center providing secure, high-performance cloud and colocation services.',
    category: 'digital',
    type: 'Data Center',
    position: [24.4912, 54.377],
    icon: createCustomIcon('purple', ServerIcon),
    keyStats: {
      established: '2015',
      capacity: '20 MW IT load',
      certification: 'Tier 4 design, ISO 27001, PCI DSS',
      connectivity: 'Multiple fiber routes, sub-5ms latency to regional hubs'
    },
    highlights: ['High-density colocation', 'Cloud connectivity', 'Disaster recovery services', 'Low-latency connections'],
    opportunities: ['Data hosting', 'Cloud services', 'Digital business infrastructure', 'Business continuity solutions']
  }],
  // Supplier data
  suppliers: [{
    id: 'su1',
    name: 'Abu Dhabi Industrial Ecosystem',
    description: 'Network of industrial suppliers, manufacturers, and service providers supporting diverse sectors.',
    category: 'manufacturing',
    type: 'Industrial Suppliers',
    position: [24.4527, 54.4125],
    icon: createCustomIcon('gray', BoxIcon),
    keyStats: {
      established: '2010',
      companies: '300+ industrial suppliers',
      sectors: 'Manufacturing, processing, assembly',
      capabilities: 'Raw materials, components, industrial services'
    },
    highlights: ['Local manufacturing capabilities', 'Supply chain integration', 'Quality certification', 'Just-in-time delivery'],
    opportunities: ['Manufacturing partnerships', 'Component sourcing', 'Industrial services', 'Value chain integration']
  }, {
    id: 'su2',
    name: 'Abu Dhabi Financial Services Marketplace',
    description: 'Ecosystem of financial service providers offering banking, insurance, and investment solutions.',
    category: 'finance',
    type: 'Financial Services',
    position: [24.4813, 54.3576],
    icon: createCustomIcon('purple', DollarSignIcon),
    keyStats: {
      established: '2013',
      institutions: '150+ financial institutions',
      services: 'Banking, insurance, investment, advisory',
      assets: '$400B+ assets under management'
    },
    highlights: ['International and local banks', 'Investment firms', 'Insurance providers', 'Financial technology companies'],
    opportunities: ['Business banking', 'Investment capital', 'Risk management', 'Financial advisory']
  }, {
    id: 'su3',
    name: 'TechSource Abu Dhabi',
    description: 'Technology supplier network providing hardware, software, and IT services to businesses.',
    category: 'technology',
    type: 'Technology Suppliers',
    position: [24.4912, 54.377],
    icon: createCustomIcon('blue', LaptopIcon),
    keyStats: {
      established: '2015',
      companies: '200+ technology providers',
      services: 'Hardware, software, cloud, cybersecurity',
      support: '24/7 technical support services'
    },
    highlights: ['Enterprise technology solutions', 'Software development services', 'IT infrastructure providers', 'Technology integration specialists'],
    opportunities: ['IT systems procurement', 'Software implementation', 'Technology consulting', 'Digital transformation services']
  }, {
    id: 'su4',
    name: 'Abu Dhabi Energy Partners',
    description: 'Consortium of energy service companies providing power, water, and utility solutions.',
    category: 'energy',
    type: 'Energy Services',
    position: [24.4672, 54.393],
    icon: createCustomIcon('yellow', ZapIcon),
    keyStats: {
      established: '2012',
      companies: '50+ energy service providers',
      services: 'Power, water, cooling, renewable energy',
      capacity: 'Supporting 5,000+ businesses'
    },
    highlights: ['Utility connections and services', 'Renewable energy solutions', 'Energy efficiency services', 'District cooling systems'],
    opportunities: ['Utility setup', 'Energy management', 'Sustainable power solutions', 'Resource optimization']
  }, {
    id: 'su5',
    name: 'Professional Services Hub',
    description: 'Cluster of professional service firms offering legal, accounting, consulting, and advisory services.',
    category: 'services',
    type: 'Professional Services',
    position: [24.4813, 54.3526],
    icon: createCustomIcon('green', BriefcaseIcon),
    keyStats: {
      established: '2014',
      firms: '300+ professional service firms',
      services: 'Legal, accounting, consulting, HR, marketing',
      clients: 'Supporting 10,000+ businesses annually'
    },
    highlights: ['Global professional firms', 'Specialized business services', 'Multilingual capabilities', 'Industry-specific expertise'],
    opportunities: ['Business setup services', 'Compliance and regulatory support', 'Strategic advisory', 'Operational optimization']
  }]
};
// Interface for browsing modes
const BrowsingModeTabs = ({
  activeMode,
  onModeChange
}) => {
  const modes = [{
    id: 'sectors',
    label: 'Sectors',
    icon: <BarChart3Icon size={16} />
  }, {
    id: 'zones',
    label: 'Zones',
    icon: <MapPinIcon size={16} />
  }, {
    id: 'services',
    label: 'Business Services',
    icon: <BriefcaseIcon size={16} />
  }, {
    id: 'talent',
    label: 'Talent',
    icon: <UsersIcon size={16} />
  }, {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: <TruckIcon size={16} />
  }, {
    id: 'suppliers',
    label: 'Suppliers',
    icon: <BoxIcon size={16} />
  }];
  return <div className="absolute top-4 z-[2000] left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-wrap justify-center">
        {modes.map(mode => <button key={mode.id} className={`flex items-center px-3 py-2 ${activeMode === mode.id ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => onModeChange(mode.id)}>
            <span className="mr-2">{mode.icon}</span>
            <span>{mode.label}</span>
          </button>)}
      </div>
    </div>;
};
// Category filter component
const CategoryFilter = ({
  categories,
  activeCategories,
  onToggleCategory
}) => {
  return <div className="absolute bottom-4 left-4 z-[2000] bg-white rounded-lg shadow-lg p-2">
      <div className="flex flex-col space-y-2">
        {categories.map(category => <button key={category.id} className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${activeCategories.includes(category.id) ? `bg-${category.color}-100 text-${category.color}-700` : 'bg-gray-100 text-gray-600'}`} onClick={() => onToggleCategory(category.id)}>
            <span className={`mr-2 text-${category.color}-500`}>
              {category.icon}
            </span>
            {category.name}
          </button>)}
      </div>
    </div>;
};
// Custom popup content component
const CustomPopupContent = ({
  point,
  onViewDetails
}) => {
  const getCategoryColor = category => {
    const colorMap = {
      finance: 'purple',
      technology: 'blue',
      healthcare: 'red',
      energy: 'yellow',
      manufacturing: 'gray',
      'free zone': 'blue',
      'industrial zone': 'yellow',
      accelerator: 'blue',
      education: 'purple',
      coworking: 'green',
      government: 'blue',
      logistics: 'yellow',
      legal: 'purple',
      research: 'green',
      transportation: 'yellow',
      utilities: 'blue',
      digital: 'purple',
      services: 'green'
    };
    return colorMap[category] || 'gray';
  };
  const color = getCategoryColor(point.category);
  return <div className="font-body p-1 min-w-[220px] max-w-[280px]">
      <div className="flex items-center mb-2">
        <div className={`w-4 h-4 rounded-full bg-${color}-100 flex items-center justify-center mr-2`}>
          <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
        </div>
        <span className="text-xs uppercase font-medium text-gray-500">
          {point.sector || point.zone || point.category}
        </span>
      </div>
      <h3 className="font-bold text-base mb-1">{point.name}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {point.description.length > 120 ? point.description.substring(0, 120) + '...' : point.description}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 mb-3">
        {Object.entries(point.keyStats).slice(0, 2).map(([key, value]) => <div key={key} className="bg-gray-50 p-2 rounded text-xs">
              <div className="text-gray-500 capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="font-semibold">{value}</div>
            </div>)}
      </div>
      <button className={`mt-1 w-full text-center text-sm bg-${color}-50 text-${color}-700 py-1.5 px-3 rounded-md font-medium hover:bg-${color}-100 transition-colors flex items-center justify-center`} onClick={e => {
      e.stopPropagation();
      onViewDetails(point);
    }}>
        View Business Details
        <ChevronRightIcon size={16} className="ml-1" />
      </button>
    </div>;
};
// Enhanced Detail Modal Component with Tabs
const BusinessDetailModal = ({
  isOpen,
  onClose,
  business,
  onAddToCompare
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  if (!isOpen || !business) return null;
  const getCategoryColor = category => {
    const colorMap = {
      finance: 'purple',
      technology: 'blue',
      healthcare: 'red',
      energy: 'yellow',
      manufacturing: 'gray',
      'free zone': 'blue',
      'industrial zone': 'yellow',
      accelerator: 'blue',
      education: 'purple',
      coworking: 'green',
      government: 'blue',
      logistics: 'yellow',
      legal: 'purple',
      research: 'green',
      transportation: 'yellow',
      utilities: 'blue',
      digital: 'purple',
      services: 'green'
    };
    return colorMap[category] || 'gray';
  };
  const getCategoryIcon = category => {
    const iconMap = {
      finance: <DollarSignIcon size={20} />,
      technology: <LaptopIcon size={20} />,
      healthcare: <HeartIcon size={20} />,
      energy: <ZapIcon size={20} />,
      manufacturing: <BoxIcon size={20} />,
      'free zone': <BuildingIcon size={20} />,
      'industrial zone': <BoxIcon size={20} />,
      accelerator: <LaptopIcon size={20} />,
      education: <UsersIcon size={20} />,
      coworking: <HomeIcon size={20} />,
      government: <BriefcaseIcon size={20} />,
      logistics: <TruckIcon size={20} />,
      legal: <ScaleIcon size={20} />,
      research: <FlaskConicalIcon size={20} />,
      transportation: <TruckIcon size={20} />,
      utilities: <ZapIcon size={20} />,
      digital: <ServerIcon size={20} />,
      services: <BriefcaseIcon size={20} />
    };
    return iconMap[category] || <MapPinIcon size={20} />;
  };
  const getStatIcon = statKey => {
    const iconMap = {
      companies: <BuildingIcon size={16} />,
      growth: <BarChart3Icon size={16} />,
      workforce: <UsersIcon size={16} />,
      investment: <DollarSignIcon size={16} />,
      established: <CalendarIcon size={16} />,
      area: <MapPinIcon size={16} />,
      sectors: <BriefcaseIcon size={16} />,
      incentives: <TargetIcon size={16} />,
      startups: <LaptopIcon size={16} />,
      funding: <DollarSignIcon size={16} />,
      programs: <BookOpenIcon size={16} />,
      partners: <HandshakeIcon size={16} />,
      graduates: <GraduationCapIcon size={16} />,
      capacity: <UsersIcon size={16} />,
      amenities: <HomeIcon size={16} />,
      membership: <CreditCardIcon size={16} />,
      clients: <UsersIcon size={16} />,
      services: <ServerIcon size={16} />,
      certifications: <AwardIcon size={16} />,
      facilities: <BuildingIcon size={16} />,
      partnerships: <HandshakeIcon size={16} />,
      patents: <FileTextIcon size={16} />
    };
    return iconMap[statKey] || <ChevronRightIcon size={16} />;
  };
  const color = getCategoryColor(business.category);
  const tabs = [{
    id: 'overview',
    label: 'Overview',
    icon: <BarChart3Icon size={16} />
  }, {
    id: 'setup',
    label: 'Setup Steps',
    icon: <ClipboardIcon size={16} />
  }, {
    id: 'suppliers',
    label: 'Suppliers',
    icon: <BoxIcon size={16} />
  }, {
    id: 'insights',
    label: 'Insights',
    icon: <BarChartIcon size={16} />
  }, {
    id: 'success',
    label: 'Success Stories',
    icon: <TargetIcon size={16} />
  }];
  // Only show tabs that have data
  const hasSetupData = business.setupTime && business.setupCost;
  const hasSuppliersData = business.suppliers && business.suppliers.length > 0;
  const hasTalentData = business.talent && business.talent.skills && business.talent.skills.length > 0;
  const hasSuccessStories = business.successStories && business.successStories.length > 0;
  const filteredTabs = tabs.filter(tab => {
    if (tab.id === 'setup' && !hasSetupData) return false;
    if (tab.id === 'suppliers' && !hasSuppliersData) return false;
    if (tab.id === 'insights' && !hasTalentData) return false;
    if (tab.id === 'success' && !hasSuccessStories) return false;
    return true;
  });
  return <div className="fixed inset-0 z-[10000] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className={`h-2 bg-${color}-500`}></div>
          <div className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <XIcon size={20} className="text-gray-500" />
            </button>
            {/* Header Section */}
            <div className="px-6 py-5 flex items-center border-b border-gray-200">
              <div className={`w-12 h-12 rounded-lg bg-${color}-100 text-${color}-500 flex items-center justify-center mr-4`}>
                {getCategoryIcon(business.category)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-gray-900">
                  {business.name}
                </h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                    {business.sector || business.zone || business.category}
                  </span>
                </div>
              </div>
              {onAddToCompare && <button onClick={() => onAddToCompare(business)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none flex items-center">
                  <PlusIcon size={16} className="mr-1" />
                  Add to Compare
                </button>}
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {filteredTabs.map(tab => <button key={tab.id} className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${activeTab === tab.id ? `border-b-2 border-${color}-500 text-${color}-600` : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab(tab.id)}>
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>)}
              </div>
            </div>
            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && <div className="animate-fadeIn">
                  <div className="text-sm text-gray-500 mb-6">
                    {business.description}
                  </div>
                  <div className="mb-6">
                    <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                      Business Intelligence
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(business.keyStats).map(([key, value]) => <div key={key} className="bg-gray-50 p-3 rounded-lg flex items-center">
                          <div className="text-primary mr-3">
                            {getStatIcon(key)}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="font-medium">{value}</div>
                          </div>
                        </div>)}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                      Key Highlights
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {business.highlights.map((highlight, index) => <li key={index} className="flex items-start">
                          <div className={`mt-1 mr-3 text-${color}-500`}>
                            <ChevronRightIcon size={16} />
                          </div>
                          <span className="text-gray-600">{highlight}</span>
                        </li>)}
                    </ul>
                  </div>
                  {business.opportunities && <div className="mb-6">
                      <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                        Business Opportunities
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {business.opportunities.map((opportunity, index) => <li key={index} className="flex items-start">
                            <div className={`mt-1 mr-3 text-${color}-500`}>
                              <TargetIcon size={16} />
                            </div>
                            <span className="text-gray-600">{opportunity}</span>
                          </li>)}
                      </ul>
                    </div>}
                </div>}
              {/* Setup Steps Tab */}
              {activeTab === 'setup' && hasSetupData && <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                      Business Setup Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">
                          Typical Setup Time
                        </div>
                        <div className="font-semibold text-lg">
                          {business.setupTime}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">
                          Estimated Setup Cost
                        </div>
                        <div className="font-semibold text-lg">
                          {business.setupCost}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                      Setup Process
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="font-medium">
                          Step 1: Business Registration
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-2">
                          Register your business with the appropriate authority:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                          <li>
                            Submit application to{' '}
                            {business.category === 'free zone' ? 'free zone authority' : 'Department of Economic Development'}
                          </li>
                          <li>
                            Provide required documents (business plan, ID, etc.)
                          </li>
                          <li>Pay registration fees</li>
                        </ul>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden mt-4">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="font-medium">
                          Step 2: Facility Setup
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-2">
                          Secure and prepare your business location:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                          <li>Lease office or facility space</li>
                          <li>
                            Obtain necessary permits (fit-out, signage, etc.)
                          </li>
                          <li>Set up utilities and services</li>
                        </ul>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden mt-4">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="font-medium">
                          Step 3: Licensing & Approvals
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-2">
                          Obtain required licenses and permits:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                          <li>Apply for commercial license</li>
                          <li>Secure industry-specific approvals</li>
                          <li>Register for VAT (if applicable)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden mt-4">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="font-medium">
                          Step 4: Operational Setup
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-2">
                          Prepare for business operations:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                          <li>Set up banking relationships</li>
                          <li>Hire and register employees</li>
                          <li>Implement required systems and processes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>}
              {/* Suppliers Tab */}
              {activeTab === 'suppliers' && hasSuppliersData && <div className="animate-fadeIn">
                  <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                    Available Suppliers & Service Providers
                  </h4>
                  <div className="mb-4">
                    <p className="text-gray-600">
                      Access to these suppliers and service providers can help
                      accelerate your business setup and operations in this
                      area.
                    </p>
                  </div>
                  <div className="border rounded-lg overflow-hidden divide-y">
                    {business.suppliers.map((supplier, index) => <div key={index} className="p-4 flex items-start hover:bg-gray-50">
                        <div className={`w-10 h-10 rounded-full bg-${color}-100 text-${color}-500 flex items-center justify-center mr-4 flex-shrink-0`}>
                          <BoxIcon size={18} />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {supplier.name}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {supplier.type}
                          </p>
                        </div>
                      </div>)}
                  </div>
                </div>}
              {/* Insights Tab */}
              {activeTab === 'insights' && hasTalentData && <div className="animate-fadeIn">
                  <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                    Talent & Workforce Insights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        Talent Availability
                      </div>
                      <div className="font-semibold text-lg">
                        {business.talent.availability}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                      <div className="text-sm text-gray-500 mb-1">
                        Education Partners
                      </div>
                      <div className="font-semibold">
                        {business.talent.educationPartners.join(', ')}
                      </div>
                    </div>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-3">
                    Available Skill Sets
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {business.talent.skills.map((skill, index) => <span key={index} className={`px-3 py-1 bg-${color}-50 text-${color}-700 rounded-full text-sm`}>
                        {skill}
                      </span>)}
                  </div>
                  <h4 className="text-lg font-display font-semibold mb-3 text-gray-900 mt-6">
                    Market Analysis
                  </h4>
                  <div className="border rounded-lg overflow-hidden mb-6">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="font-medium">Growth Trajectory</div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 w-full bg-gray-200 rounded-full mb-2">
                        <div className={`h-4 bg-${color}-500 rounded-full`} style={{
                      width: `${business.keyStats.growth ? parseInt(business.keyStats.growth) * 10 : 70}%`
                    }}></div>
                      </div>
                      <p className="text-gray-600">
                        This{' '}
                        {business.sector || business.zone || business.category}{' '}
                        shows
                        <span className="font-medium">
                          {' '}
                          {business.keyStats.growth || 'strong growth'}{' '}
                        </span>
                        with significant investment and development activity.
                      </p>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="font-medium">Competitive Landscape</div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-2">
                        Current market dynamics:
                      </p>
                      <ul className="list-disc pl-5 text-gray-600">
                        <li>
                          {business.keyStats.companies || 'Multiple companies'}{' '}
                          operating in this area
                        </li>
                        <li>
                          Growing demand for specialized services and solutions
                        </li>
                        <li>
                          Opportunities for new entrants with innovative
                          approaches
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>}
              {/* Success Stories Tab */}
              {activeTab === 'success' && hasSuccessStories && <div className="animate-fadeIn">
                  <h4 className="text-lg font-display font-semibold mb-3 text-gray-900">
                    Success Stories
                  </h4>
                  <div className="mb-4">
                    <p className="text-gray-600">
                      Companies that have successfully established and grown in
                      this area.
                    </p>
                  </div>
                  {business.successStories.map((story, index) => <div key={index} className="border rounded-lg overflow-hidden mb-4">
                      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <div className="font-medium">{story.company}</div>
                        <div className={`px-2 py-1 bg-${color}-100 text-${color}-700 rounded text-xs`}>
                          Success Case
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 mb-2">
                          {story.description}
                        </p>
                        <div className="flex items-center mt-3">
                          <div className={`text-${color}-500 mr-2`}>
                            <TargetIcon size={16} />
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {story.result}
                          </p>
                        </div>
                      </div>
                    </div>)}
                </div>}
              <div className="mt-8 flex justify-end">
                <button onClick={onClose} className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  Close
                </button>
                <button onClick={() => console.log(`Contact about ${business.name}`)} className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none`}>
                  Contact Business Office
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
// Comparison Bar Component
const ComparisonBar = ({
  items,
  onRemove,
  onClear,
  onCompare,
  isOpen,
  onToggle
}) => {
  if (items.length === 0 && !isOpen) return null;
  return <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 z-[9000] ${isOpen ? 'transform translate-y-0' : 'transform translate-y-full'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center">
            <button onClick={onToggle} className="p-1 mr-2 rounded-full hover:bg-gray-100">
              {isOpen ? <ChevronDownIcon size={20} className="text-gray-500" /> : <ChevronUpIcon size={20} className="text-gray-500" />}
            </button>
            <h3 className="font-medium">Compare Locations ({items.length})</h3>
          </div>
          <div className="flex items-center">
            <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700 mr-4" disabled={items.length === 0}>
              Clear All
            </button>
            <button onClick={onCompare} className="px-4 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors" disabled={items.length < 2}>
              Compare
            </button>
          </div>
        </div>
        {isOpen && <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => <div key={item.id} className="border rounded-lg p-3 relative">
                  <button onClick={() => onRemove(item.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100">
                    <XIcon size={16} className="text-gray-400" />
                  </button>
                  <div className="mt-2">
                    <h4 className="font-medium truncate" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {item.sector || item.zone || item.category}
                    </p>
                  </div>
                </div>)}
              {items.length < 4 && <div className="border border-dashed rounded-lg p-3 flex items-center justify-center text-gray-400 min-h-[80px]">
                  <p className="text-sm">Add more locations to compare</p>
                </div>}
            </div>
          </div>}
      </div>
    </div>;
};
// Comparison Modal Component
const ComparisonModal = ({
  isOpen,
  onClose,
  items
}) => {
  const [preferences, setPreferences] = useState({
    setupTime: 50,
    cost: 50,
    talent: 50,
    ecosystem: 50
  });
  if (!isOpen || items.length < 2) return null;
  const handlePreferenceChange = (key, value) => {
    setPreferences({
      ...preferences,
      [key]: value
    });
  };
  // Calculate decision scores based on preferences
  const getDecisionScores = () => {
    return items.map(item => {
      // These are simplified calculations for demonstration
      const setupTimeScore = item.setupTime && item.setupTime.includes('week') ? 90 - preferences.setupTime * 0.5 : 50 - preferences.setupTime * 0.3;
      const costScore = item.setupCost && parseInt(item.setupCost) < 20000 ? 85 - preferences.cost * 0.4 : 60 - preferences.cost * 0.2;
      const talentScore = item.talent && item.talent.availability === 'High' ? 80 + preferences.talent * 0.4 : 50 + preferences.talent * 0.2;
      const ecosystemScore = item.keyStats.companies && parseInt(item.keyStats.companies) > 500 ? 75 + preferences.ecosystem * 0.5 : 55 + preferences.ecosystem * 0.3;
      const totalScore = Math.round((setupTimeScore + costScore + talentScore + ecosystemScore) / 4);
      return {
        id: item.id,
        name: item.name,
        score: Math.min(Math.max(totalScore, 40), 95) // Ensure score is between 40-95
      };
    }).sort((a, b) => b.score - a.score);
  };
  const decisionScores = getDecisionScores();
  return <div className="fixed inset-0 z-[11000] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="h-2 bg-primary"></div>
          <div className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <XIcon size={20} className="text-gray-500" />
            </button>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-gray-900">
                Location Comparison
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Compare up to 4 locations to find the best match for your
                business needs
              </p>
            </div>
            <div className="p-6">
              {/* Comparison Table */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 w-1/5">
                        Criteria
                      </th>
                      {items.map(item => <th key={item.id} className="text-left py-3 px-4 font-medium text-gray-900">
                          {item.name}
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">Type</td>
                      {items.map(item => <td key={item.id} className="py-3 px-4">
                          {item.sector || item.zone || item.category}
                        </td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">Setup Time</td>
                      {items.map(item => <td key={item.id} className="py-3 px-4">
                          {item.setupTime || 'Varies'}
                        </td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">Setup Cost</td>
                      {items.map(item => <td key={item.id} className="py-3 px-4">
                          {item.setupCost || 'Varies'}
                        </td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        Talent Availability
                      </td>
                      {items.map(item => <td key={item.id} className="py-3 px-4">
                          {item.talent?.availability || 'Not specified'}
                        </td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        Key Incentives
                      </td>
                      {items.map(item => <td key={item.id} className="py-3 px-4">
                          {item.keyStats?.incentives || 'Not specified'}
                        </td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        Ecosystem Size
                      </td>
                      {items.map(item => <td key={item.id} className="py-3 px-4">
                          {item.keyStats?.companies || 'Not specified'}
                        </td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Preference Sliders */}
              <div className="mb-8">
                <h4 className="text-lg font-display font-semibold mb-4 text-gray-900">
                  Set Your Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Setup Time Importance
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Less</span>
                      <input type="range" min="0" max="100" value={preferences.setupTime} onChange={e => handlePreferenceChange('setupTime', parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="text-xs text-gray-500 ml-2">More</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Sensitivity
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Low</span>
                      <input type="range" min="0" max="100" value={preferences.cost} onChange={e => handlePreferenceChange('cost', parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="text-xs text-gray-500 ml-2">High</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Talent Importance
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Less</span>
                      <input type="range" min="0" max="100" value={preferences.talent} onChange={e => handlePreferenceChange('talent', parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="text-xs text-gray-500 ml-2">More</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ecosystem Value
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Less</span>
                      <input type="range" min="0" max="100" value={preferences.ecosystem} onChange={e => handlePreferenceChange('ecosystem', parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="text-xs text-gray-500 ml-2">More</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decision Scores */}
              <div>
                <h4 className="text-lg font-display font-semibold mb-4 text-gray-900">
                  Decision Scores
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {decisionScores.map(item => <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{item.name}</h5>
                        <span className="text-lg font-bold text-primary">
                          {item.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{
                      width: `${item.score}%`
                    }}></div>
                      </div>
                    </div>)}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
// Custom component to add map interactions
const MapInteractions = ({
  points,
  activeCategories,
  onMapReady,
  selectedLocation
}) => {
  const map = useMap();
  useEffect(() => {
    // Add map to ref when ready
    if (onMapReady) {
      onMapReady(map);
    }
    // Fit bounds to include all markers
    if (points.length > 0) {
      const filteredPoints = activeCategories.length > 0 ? points.filter(point => activeCategories.includes(point.category)) : points;
      if (filteredPoints.length > 0) {
        const bounds = L.latLngBounds(filteredPoints.map(point => point.position));
        map.fitBounds(bounds, {
          padding: [50, 50]
        });
      }
    }
  }, [map, points, activeCategories, onMapReady]);
  // Handle selected location highlight and zoom
  useEffect(() => {
    if (selectedLocation && map) {
      // Zoom to selected location
      map.setView(selectedLocation.position, 14, {
        animate: true,
        duration: 0.5
      });
      // Find marker with matching position and open its popup
      setTimeout(() => {
        const markers = document.querySelectorAll('.leaflet-marker-icon');
        markers.forEach(marker => {
          if (marker._leaflet_pos) {
            const markerPoint = map.latLngToLayerPoint(selectedLocation.position);
            if (Math.abs(markerPoint.x - marker._leaflet_pos.x) < 20 && Math.abs(markerPoint.y - marker._leaflet_pos.y) < 20) {
              marker.click();
            }
          }
        });
      }, 100);
    }
  }, [selectedLocation, map]);
  return null;
};
// Missing icons imported from lucide-react
const CalendarIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>;
const BookOpenIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>;
const HandshakeIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
  </svg>;
const GraduationCapIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
  </svg>;
const CreditCardIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>;
const AwardIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>;
const FileTextIcon = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>;
// Business Location List Component
const BusinessLocationList = ({
  locations,
  activeCategory,
  onSelectLocation,
  selectedLocation
}) => {
  return <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Business Locations</h3>
        <p className="text-sm text-gray-500">
          {activeCategory === 'all' ? 'All locations' : `Filtered by: ${activeCategory}`}
        </p>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {locations.length > 0 ? <ul className="divide-y divide-gray-200">
            {locations.map(location => <li key={location.id} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedLocation && selectedLocation.id === location.id ? 'bg-blue-50 border-l-4 border-primary' : ''}`} onClick={() => onSelectLocation(location)}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(location.category, 16, `text-${getCategoryColor(location.category)}-500`)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {location.sector || location.zone || location.category}
                    </p>
                  </div>
                </div>
              </li>)}
          </ul> : <div className="p-4 text-center text-gray-500">
            No locations found matching your filters.
          </div>}
      </div>
    </div>;
};
// Helper function to get category color
const getCategoryColor = category => {
  const colorMap = {
    finance: 'purple',
    technology: 'blue',
    healthcare: 'red',
    energy: 'yellow',
    manufacturing: 'gray',
    'free zone': 'blue',
    'industrial zone': 'yellow',
    accelerator: 'blue',
    education: 'purple',
    coworking: 'green',
    government: 'blue',
    logistics: 'yellow',
    legal: 'purple',
    research: 'green',
    transportation: 'yellow',
    utilities: 'blue',
    digital: 'purple',
    services: 'green'
  };
  return colorMap[category] || 'gray';
};
// Helper function to get category icon
const getCategoryIcon = (category, size = 20, className = '') => {
  const iconMap = {
    finance: <DollarSignIcon size={size} className={className} />,
    technology: <LaptopIcon size={size} className={className} />,
    healthcare: <HeartIcon size={size} className={className} />,
    energy: <ZapIcon size={size} className={className} />,
    manufacturing: <BoxIcon size={size} className={className} />,
    'free zone': <BuildingIcon size={size} className={className} />,
    'industrial zone': <BoxIcon size={size} className={className} />,
    accelerator: <LaptopIcon size={size} className={className} />,
    education: <UsersIcon size={size} className={className} />,
    coworking: <HomeIcon size={size} className={className} />,
    government: <BriefcaseIcon size={size} className={className} />,
    logistics: <TruckIcon size={size} className={className} />,
    legal: <ScaleIcon size={size} className={className} />,
    research: <FlaskConicalIcon size={size} className={className} />,
    transportation: <TruckIcon size={size} className={className} />,
    utilities: <ZapIcon size={size} className={className} />,
    digital: <ServerIcon size={size} className={className} />,
    services: <BriefcaseIcon size={size} className={className} />
  };
  return iconMap[category] || <MapPinIcon size={size} className={className} />;
};
const HeroSection = () => {
  const sectionRef = useRef(null);
  const [mapRef, setMapRef] = useState(null);
  const [browsingMode, setBrowsingMode] = useState('sectors');
  const [activeCategories, setActiveCategories] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState('light'); // 'light', 'satellite', 'hybrid'
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareBarOpen, setIsCompareBarOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const mapContainerRef = useRef(null);
  // Abu Dhabi coordinates
  const mainPosition = [24.4539, 54.3773];
  // Get current data based on browsing mode
  const getCurrentData = () => {
    switch (browsingMode) {
      case 'sectors':
        return businessMapData.sectors;
      case 'zones':
        return businessMapData.zones;
      case 'services':
        return businessMapData.services;
      case 'talent':
        return businessMapData.talent;
      case 'infrastructure':
        return businessMapData.infrastructure;
      case 'suppliers':
        return businessMapData.suppliers;
      default:
        return businessMapData.sectors;
    }
  };
  // Define category filters based on browsing mode
  const getCategoryFilters = () => {
    switch (browsingMode) {
      case 'sectors':
        return [{
          id: 'finance',
          name: 'Financial Services',
          color: 'purple',
          icon: <DollarSignIcon size={16} />
        }, {
          id: 'technology',
          name: 'Technology',
          color: 'blue',
          icon: <LaptopIcon size={16} />
        }, {
          id: 'healthcare',
          name: 'Healthcare',
          color: 'red',
          icon: <HeartIcon size={16} />
        }, {
          id: 'energy',
          name: 'Energy',
          color: 'yellow',
          icon: <ZapIcon size={16} />
        }, {
          id: 'manufacturing',
          name: 'Manufacturing',
          color: 'gray',
          icon: <BoxIcon size={16} />
        }];
      case 'zones':
        return [{
          id: 'free zone',
          name: 'Free Zones',
          color: 'blue',
          icon: <BuildingIcon size={16} />
        }, {
          id: 'industrial zone',
          name: 'Industrial Zones',
          color: 'yellow',
          icon: <BoxIcon size={16} />
        }];
      case 'services':
        return [{
          id: 'accelerator',
          name: 'Accelerators',
          color: 'blue',
          icon: <LaptopIcon size={16} />
        }, {
          id: 'education',
          name: 'Education',
          color: 'purple',
          icon: <UsersIcon size={16} />
        }, {
          id: 'coworking',
          name: 'Coworking Spaces',
          color: 'green',
          icon: <HomeIcon size={16} />
        }, {
          id: 'logistics',
          name: 'Logistics',
          color: 'yellow',
          icon: <TruckIcon size={16} />
        }, {
          id: 'legal',
          name: 'Legal Services',
          color: 'purple',
          icon: <ScaleIcon size={16} />
        }];
      case 'talent':
        return [{
          id: 'education',
          name: 'Education Institutions',
          color: 'purple',
          icon: <UsersIcon size={16} />
        }, {
          id: 'recruitment',
          name: 'Recruitment Services',
          color: 'blue',
          icon: <UsersIcon size={16} />
        }];
      case 'infrastructure':
        return [{
          id: 'transportation',
          name: 'Transportation',
          color: 'yellow',
          icon: <TruckIcon size={16} />
        }, {
          id: 'utilities',
          name: 'Utilities',
          color: 'blue',
          icon: <ZapIcon size={16} />
        }, {
          id: 'digital',
          name: 'Digital Infrastructure',
          color: 'purple',
          icon: <ServerIcon size={16} />
        }];
      case 'suppliers':
        return [{
          id: 'manufacturing',
          name: 'Manufacturing',
          color: 'gray',
          icon: <BoxIcon size={16} />
        }, {
          id: 'finance',
          name: 'Financial Services',
          color: 'purple',
          icon: <DollarSignIcon size={16} />
        }, {
          id: 'technology',
          name: 'Technology',
          color: 'blue',
          icon: <LaptopIcon size={16} />
        }, {
          id: 'energy',
          name: 'Energy',
          color: 'yellow',
          icon: <ZapIcon size={16} />
        }, {
          id: 'services',
          name: 'Professional Services',
          color: 'green',
          icon: <BriefcaseIcon size={16} />
        }];
      default:
        return [];
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
      }
    }, {
      threshold: 0.1
    });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscKey = e => {
      if (e.key === 'Escape') {
        if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
        } else if (isCompareModalOpen) {
          setIsCompareModalOpen(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    document.addEventListener('keydown', handleEscKey);
    // Control body scroll when in fullscreen
    if (isFullscreen || isDetailModalOpen || isCompareModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen, isDetailModalOpen, isCompareModalOpen]);
  // Reset active categories when browsing mode changes
  useEffect(() => {
    setActiveCategories([]);
    setSelectedLocation(null);
  }, [browsingMode]);
  const handleExploreClick = () => {
    // Scroll to growth areas section
    const growthAreasSection = document.getElementById('growth-areas');
    if (growthAreasSection) {
      growthAreasSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleDirectoryClick = () => {
    // Scroll to directory section
    const directorySection = document.getElementById('directory');
    if (directorySection) {
      directorySection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleSelectLocation = location => {
    setSelectedLocation(location);
    if (mapRef) {
      mapRef.setView(location.position, 15);
      // Find marker with matching position and open its popup
      setTimeout(() => {
        const markers = document.querySelectorAll('.leaflet-marker-icon');
        markers.forEach(marker => {
          if (marker._leaflet_pos) {
            const markerPoint = mapRef.latLngToLayerPoint(location.position);
            if (Math.abs(markerPoint.x - marker._leaflet_pos.x) < 20 && Math.abs(markerPoint.y - marker._leaflet_pos.y) < 20) {
              marker.click();
            }
          }
        });
      }, 100);
    }
  };
  const handleToggleCategory = categoryId => {
    setActiveCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    // Reset selected location when changing categories
    setSelectedLocation(null);
  };
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Give the map a moment to resize after state change
    setTimeout(() => {
      if (mapRef) {
        mapRef.invalidateSize();
        // Re-fit bounds after toggling fullscreen
        const currentData = getCurrentData();
        const filteredPoints = activeCategories.length > 0 ? currentData.filter(point => activeCategories.includes(point.category)) : currentData;
        if (filteredPoints.length > 0) {
          const bounds = L.latLngBounds(filteredPoints.map(point => point.position));
          mapRef.fitBounds(bounds, {
            padding: [50, 50]
          });
        }
      }
    }, 100);
  };
  const handleViewDetails = business => {
    setSelectedBusiness(business);
    setIsDetailModalOpen(true);
  };
  const handleBrowsingModeChange = mode => {
    setBrowsingMode(mode);
  };
  const handleAddToCompare = item => {
    // Check if item is already in the compare list
    if (!compareItems.some(i => i.id === item.id)) {
      // Limit to 4 items
      if (compareItems.length < 4) {
        setCompareItems([...compareItems, item]);
        setIsCompareBarOpen(true);
      } else {
        alert('You can compare up to 4 locations at a time.');
      }
    }
  };
  const handleRemoveFromCompare = itemId => {
    setCompareItems(compareItems.filter(item => item.id !== itemId));
  };
  const handleClearCompare = () => {
    setCompareItems([]);
  };
  const handleCompare = () => {
    if (compareItems.length >= 2) {
      setIsCompareModalOpen(true);
    } else {
      alert('Please select at least 2 locations to compare.');
    }
  };
  const handleMapStyleChange = style => {
    setMapStyle(style);
  };
  const handleViewModeChange = mode => {
    setViewMode(mode);
  };
  const currentData = getCurrentData();
  const filteredData = activeCategories.length > 0 ? currentData.filter(point => activeCategories.includes(point.category)) : currentData;
  const categoryFilters = getCategoryFilters();
  // Get TileLayer URL based on selected map style
  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'hybrid':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      case 'light':
      default:
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }
  };
  return <section id="about" ref={sectionRef} className="min-h-screen pt-28 pb-20 px-6 md:px-12 flex flex-col justify-center opacity-0 -translate-y-4 transition-all duration-1000">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-8">
              Discover <span className="text-primary">Abu Dhabi</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-gray-700 mb-10 max-w-xl leading-relaxed">
              A thriving global business hub at the crossroads of East and West,
              offering unparalleled opportunities for growth and innovation.
            </p>
            <div className="flex flex-row gap-5">
              <button className="px-8 py-4 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg" onClick={handleDirectoryClick}>
                Browse Business Directory
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-white transition-colors" onClick={handleExploreClick}>
                Discover Growth Opportunities
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-display font-bold text-primary mb-2">
                  200+
                </p>
                <p className="font-body text-gray-600">Global Companies</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-display font-bold text-primary mb-2">
                  $400B
                </p>
                <p className="font-body text-gray-600">GDP</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-display font-bold text-primary mb-2">
                  #1
                </p>
                <p className="font-body text-gray-600">Ease of Business</p>
              </div>
            </div>
          </div>
          {/* Map Container */}
          <div ref={mapContainerRef} className={`order-1 lg:order-2 relative ${isFullscreen ? 'map-fullscreen' : 'h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-2xl overflow-hidden shadow-2xl'}`}>
            {/* View Mode Toggle */}
            <div className="absolute top-4 right-20 z-[10000] bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex">
                <button onClick={() => handleViewModeChange('map')} className={`p-2 ${viewMode === 'map' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} aria-label="Map view" title="Map view">
                  <MapPinIcon size={20} />
                </button>
                <button onClick={() => handleViewModeChange('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} aria-label="List view" title="List view">
                  <ListIcon size={20} />
                </button>
                <button onClick={() => handleViewModeChange('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} aria-label="Grid view" title="Grid view">
                  <GridIcon size={20} />
                </button>
              </div>
            </div>
            {/* Fullscreen Toggle Button */}
            <button onClick={toggleFullscreen} className="absolute top-4 right-4 z-[10000] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? <MinimizeIcon size={20} className="text-gray-700" /> : <MaximizeIcon size={20} className="text-gray-700" />}
            </button>
            {/* Close button only shown in fullscreen mode */}
            {isFullscreen && <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-16 z-[10000] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors" aria-label="Close fullscreen">
                <XIcon size={20} className="text-gray-700" />
              </button>}
            {/* Browsing Mode Tabs */}
            <BrowsingModeTabs activeMode={browsingMode} onModeChange={handleBrowsingModeChange} />
            {/* Map Style Selector */}
            <div className="absolute top-16 right-4 z-[2000] bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-2 border-b border-gray-200">
                <h4 className="text-xs font-medium text-gray-500">Map Style</h4>
              </div>
              <div className="p-2">
                <div className="flex flex-col space-y-2">
                  <button className={`px-3 py-1 text-xs rounded-md ${mapStyle === 'light' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => handleMapStyleChange('light')}>
                    Standard
                  </button>
                  <button className={`px-3 py-1 text-xs rounded-md ${mapStyle === 'satellite' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => handleMapStyleChange('satellite')}>
                    Satellite
                  </button>
                  <button className={`px-3 py-1 text-xs rounded-md ${mapStyle === 'hybrid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => handleMapStyleChange('hybrid')}>
                    Hybrid
                  </button>
                </div>
              </div>
            </div>
            {viewMode === 'map' && <MapContainer center={mainPosition} zoom={11} style={{
            height: '100%',
            width: '100%'
          }} zoomControl={false} attributionControl={false} className={isFullscreen ? 'fullscreen-map' : ''}>
                <TileLayer url={getTileLayerUrl()} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                <ZoomControl position="topright" />
                {/* Render zone boundaries */}
                {browsingMode === 'zones' && businessMapData.zones.map(zone => zone.boundaries && <Polygon key={`zone-${zone.id}`} positions={zone.boundaries} pathOptions={{
              fillColor: activeCategories.length === 0 || activeCategories.includes(zone.category) ? zone.category === 'free zone' ? '#3B82F6' : '#EAB308' : '#D1D5DB',
              fillOpacity: selectedLocation && selectedLocation.id === zone.id ? 0.5 : 0.2,
              color: activeCategories.length === 0 || activeCategories.includes(zone.category) ? zone.category === 'free zone' ? '#2563EB' : '#CA8A04' : '#9CA3AF',
              weight: selectedLocation && selectedLocation.id === zone.id ? 3 : 1
            }} eventHandlers={{
              click: () => {
                handleSelectLocation(zone);
              }
            }} />)}
                {/* Render business sector circles */}
                {browsingMode === 'sectors' && businessMapData.sectors.map(sector => <Circle key={`sector-${sector.id}`} center={sector.position} radius={selectedLocation && selectedLocation.id === sector.id ? 700 : 500} pathOptions={{
              fillColor: activeCategories.length === 0 || activeCategories.includes(sector.category) ? sector.category === 'finance' ? '#8B5CF6' : sector.category === 'technology' ? '#3B82F6' : sector.category === 'healthcare' ? '#EF4444' : sector.category === 'energy' ? '#EAB308' : '#6B7280' : '#D1D5DB',
              fillOpacity: selectedLocation && selectedLocation.id === sector.id ? 0.5 : 0.2,
              color: activeCategories.length === 0 || activeCategories.includes(sector.category) ? sector.category === 'finance' ? '#7C3AED' : sector.category === 'technology' ? '#2563EB' : sector.category === 'healthcare' ? '#DC2626' : sector.category === 'energy' ? '#CA8A04' : '#4B5563' : '#9CA3AF',
              weight: selectedLocation && selectedLocation.id === sector.id ? 3 : 1
            }} eventHandlers={{
              click: () => {
                handleSelectLocation(sector);
              }
            }} />)}
                {/* Render markers based on browsing mode */}
                {filteredData.map(point => <Marker key={`${browsingMode}-${point.id}`} position={point.position} icon={point.icon} eventHandlers={{
              click: e => {
                e.target.openPopup();
                setSelectedLocation(point);
              }
            }}>
                    <Popup className="map-popup">
                      <CustomPopupContent point={point} onViewDetails={handleViewDetails} />
                    </Popup>
                  </Marker>)}
                <MapInteractions points={currentData} activeCategories={activeCategories} onMapReady={setMapRef} selectedLocation={selectedLocation} />
              </MapContainer>}
            {viewMode === 'list' && <div className="h-full w-full overflow-hidden flex">
                <div className="w-1/3 h-full overflow-y-auto">
                  <BusinessLocationList locations={filteredData} activeCategory={activeCategories.length > 0 ? activeCategories[0] : 'all'} onSelectLocation={handleSelectLocation} selectedLocation={selectedLocation} />
                </div>
                <div className="w-2/3 h-full">
                  <MapContainer center={mainPosition} zoom={11} style={{
                height: '100%',
                width: '100%'
              }} zoomControl={false} attributionControl={false}>
                    <TileLayer url={getTileLayerUrl()} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                    <ZoomControl position="topright" />
                    {/* Render zone boundaries */}
                    {browsingMode === 'zones' && businessMapData.zones.map(zone => zone.boundaries && <Polygon key={`zone-${zone.id}`} positions={zone.boundaries} pathOptions={{
                  fillColor: activeCategories.length === 0 || activeCategories.includes(zone.category) ? zone.category === 'free zone' ? '#3B82F6' : '#EAB308' : '#D1D5DB',
                  fillOpacity: selectedLocation && selectedLocation.id === zone.id ? 0.5 : 0.2,
                  color: activeCategories.length === 0 || activeCategories.includes(zone.category) ? zone.category === 'free zone' ? '#2563EB' : '#CA8A04' : '#9CA3AF',
                  weight: selectedLocation && selectedLocation.id === zone.id ? 3 : 1
                }} eventHandlers={{
                  click: () => {
                    handleSelectLocation(zone);
                  }
                }} />)}
                    {/* Render business sector circles */}
                    {browsingMode === 'sectors' && businessMapData.sectors.map(sector => <Circle key={`sector-${sector.id}`} center={sector.position} radius={selectedLocation && selectedLocation.id === sector.id ? 700 : 500} pathOptions={{
                  fillColor: activeCategories.length === 0 || activeCategories.includes(sector.category) ? sector.category === 'finance' ? '#8B5CF6' : sector.category === 'technology' ? '#3B82F6' : sector.category === 'healthcare' ? '#EF4444' : sector.category === 'energy' ? '#EAB308' : '#6B7280' : '#D1D5DB',
                  fillOpacity: selectedLocation && selectedLocation.id === sector.id ? 0.5 : 0.2,
                  color: activeCategories.length === 0 || activeCategories.includes(sector.category) ? sector.category === 'finance' ? '#7C3AED' : sector.category === 'technology' ? '#2563EB' : sector.category === 'healthcare' ? '#DC2626' : sector.category === 'energy' ? '#CA8A04' : '#4B5563' : '#9CA3AF',
                  weight: selectedLocation && selectedLocation.id === sector.id ? 3 : 1
                }} eventHandlers={{
                  click: () => {
                    handleSelectLocation(sector);
                  }
                }} />)}
                    {/* Render markers based on browsing mode */}
                    {filteredData.map(point => <Marker key={`${browsingMode}-${point.id}`} position={point.position} icon={point.icon} eventHandlers={{
                  click: e => {
                    e.target.openPopup();
                    setSelectedLocation(point);
                  }
                }}>
                        <Popup className="map-popup">
                          <CustomPopupContent point={point} onViewDetails={handleViewDetails} />
                        </Popup>
                      </Marker>)}
                    <MapInteractions points={currentData} activeCategories={activeCategories} onMapReady={setMapRef} selectedLocation={selectedLocation} />
                  </MapContainer>
                </div>
              </div>}
            {viewMode === 'grid' && <div className="h-full w-full overflow-auto bg-gray-50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.map(location => <div key={location.id} className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedLocation && selectedLocation.id === location.id ? 'ring-2 ring-primary' : ''}`} onClick={() => handleSelectLocation(location)}>
                      <div className="p-4">
                        <div className="flex items-start mb-3">
                          <div className={`w-10 h-10 rounded-full bg-${getCategoryColor(location.category)}-100 text-${getCategoryColor(location.category)}-500 flex items-center justify-center mr-3 flex-shrink-0`}>
                            {getCategoryIcon(location.category, 20)}
                          </div>
                          <div>
                            <h3 className="font-medium">{location.name}</h3>
                            <p className="text-sm text-gray-500">
                              {location.sector || location.zone || location.category}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {location.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {Object.entries(location.keyStats).slice(0, 2).map(([key, value]) => <div key={key} className="bg-gray-50 p-2 rounded text-xs">
                                <div className="text-gray-500 capitalize text-[10px] mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="font-medium truncate">
                                  {value}
                                </div>
                              </div>)}
                        </div>
                        <div className="flex justify-between items-center">
                          <button onClick={e => {
                      e.stopPropagation();
                      handleViewDetails(location);
                    }} className="text-xs text-primary hover:text-primary-dark">
                            View Details
                          </button>
                          <button onClick={e => {
                      e.stopPropagation();
                      handleAddToCompare(location);
                    }} className="text-xs text-gray-500 hover:text-gray-700">
                            + Add to Compare
                          </button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}
            <MapSearch points={[...businessMapData.sectors, ...businessMapData.zones, ...businessMapData.services, ...businessMapData.talent, ...businessMapData.infrastructure, ...businessMapData.suppliers]} onSelectLocation={handleSelectLocation} />
            <CategoryFilter categories={categoryFilters} activeCategories={activeCategories} onToggleCategory={handleToggleCategory} />
            {/* Legend for current browsing mode */}
            <div className="absolute bottom-4 right-4 z-[2000] bg-white rounded-lg shadow-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">
                {browsingMode === 'sectors' ? 'Business Sectors' : browsingMode === 'zones' ? 'Economic Zones' : browsingMode === 'services' ? 'Business Services' : browsingMode === 'talent' ? 'Talent Resources' : browsingMode === 'infrastructure' ? 'Infrastructure' : 'Suppliers'}
              </div>
              <div className="flex flex-col space-y-1">
                {categoryFilters.map(category => <div key={category.id} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500 mr-2`}></div>
                    <span className="text-xs text-gray-700">
                      {category.name}
                    </span>
                  </div>)}
              </div>
            </div>
            {/* Fullscreen overlay instructions */}
            {isFullscreen && <div className="absolute bottom-4 right-40 z-[2000] bg-white bg-opacity-90 rounded-lg shadow-lg p-3 max-w-xs">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Tip:</span> Press ESC key or use
                  the buttons in the top-right to exit fullscreen mode
                </p>
              </div>}
          </div>
        </div>
      </div>
      {/* Business Detail Modal */}
      <BusinessDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} business={selectedBusiness} onAddToCompare={handleAddToCompare} />
      {/* Comparison Bar */}
      <ComparisonBar items={compareItems} onRemove={handleRemoveFromCompare} onClear={handleClearCompare} onCompare={handleCompare} isOpen={isCompareBarOpen} onToggle={() => setIsCompareBarOpen(!isCompareBarOpen)} />
      {/* Comparison Modal */}
      <ComparisonModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} items={compareItems} />
    </section>;
};
export default HeroSection;