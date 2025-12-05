import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, SearchIcon, FilterIcon, XIcon, ChevronDownIcon, ChevronUpIcon, SlidersIcon } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import ProfileModal from '../components/ProfileModal';
// Types for our marketplace
interface Business {
  id: number;
  name: string;
  logo: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address?: string;
  founded?: string;
  employees?: string;
  revenue?: string;
  services?: string[];
}
// Filter options
type SortOption = 'default' | 'nameAsc' | 'nameDesc' | 'foundedAsc' | 'foundedDesc';
type CategoryFilter = string | 'all';
const BusinessDirectoryMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Business | null>(null);
  const businessesPerPage = 9;
  const pageRef = useRef<HTMLDivElement>(null);
  // Populate the business data
  useEffect(() => {
    // This would normally come from an API
    const allBusinesses: Business[] = [{
      id: 1,
      name: 'Abu Dhabi Global Market',
      logo: '/logo/adgm.png',
      category: 'Finance',
      description: 'International financial center located on Al Maryah Island, providing a broad range of financial services.',
      phone: '+971 2 333 8888',
      email: 'contact@adgm.com',
      website: 'adgm.com',
      address: 'Al Maryah Island, Abu Dhabi, UAE',
      founded: '2013',
      employees: '500+',
      revenue: '$100M+',
      services: ['Financial Licensing', 'Regulatory Framework', 'Business Setup', 'Legal Services']
    }, {
      id: 2,
      name: 'Masdar',
      logo: '/logo/masdar-logo.webp',
      category: 'Energy',
      description: 'Renewable energy company that advances the development, commercialization and deployment of clean energy solutions.',
      phone: '+971 2 653 3333',
      email: 'info@masdar.ae',
      website: 'masdar.ae',
      address: 'Masdar City, Abu Dhabi, UAE',
      founded: '2006',
      employees: '1,500+',
      revenue: '$500M+',
      services: ['Renewable Energy', 'Sustainable Development', 'Clean Technology', 'Urban Planning']
    }, {
      id: 3,
      name: 'Hub71',
      logo: '/logo/hub71.png',
      category: 'Technology',
      description: 'Global tech ecosystem that enables startups to scale globally through access to funding, networks, and business opportunities.',
      phone: '+971 2 449 7777',
      email: 'hello@hub71.com',
      website: 'hub71.com',
      address: 'Al Maryah Island, Abu Dhabi, UAE',
      founded: '2019',
      employees: '200+',
      services: ['Startup Incubation', 'Venture Capital', 'Mentorship', 'Networking']
    }, {
      id: 4,
      name: 'Cleveland Clinic Abu Dhabi',
      logo: '/logo/cleveland.png',
      category: 'Healthcare',
      description: 'Multispecialty hospital offering patients the highest level of specialized care across 40+ medical and surgical specialties.',
      phone: '+971 2 659 9999',
      email: 'info@ccad.ae',
      website: 'clevelandclinicabudhabi.ae',
      address: 'Al Maryah Island, Abu Dhabi, UAE',
      founded: '2015',
      employees: '3,000+',
      revenue: '$1B+',
      services: ['Medical Care', 'Surgical Services', 'Research', 'Medical Education']
    }, {
      id: 5,
      name: 'Yas Mall',
      logo: '/logo/yas.png',
      category: 'Retail',
      description: 'Premier shopping, dining and entertainment destination located on Yas Island, featuring over 370 international brands.',
      phone: '+971 2 565 7000',
      email: 'customerservice@yasmall.ae',
      website: 'yasmall.ae',
      address: 'Yas Island, Abu Dhabi, UAE',
      founded: '2014',
      employees: '1,000+',
      services: ['Retail Space', 'Entertainment', 'Dining', 'Events']
    }, {
      id: 6,
      name: 'Emirates Palace',
      logo: '/logo/palace.png',
      category: 'Tourism',
      description: 'Luxury hotel located in the heart of Abu Dhabi, offering world-class hospitality and stunning Arabian Gulf views.',
      phone: '+971 2 690 9000',
      email: 'reservations@emiratespalace.ae',
      website: 'emiratespalace.com',
      address: 'West Corniche Road, Abu Dhabi, UAE',
      founded: '2005',
      employees: '1,500+',
      revenue: '$300M+',
      services: ['Luxury Accommodation', 'Fine Dining', 'Conference Facilities', 'Spa Services']
    }, {
      id: 7,
      name: 'Etihad Airways',
      logo: '/logo/etihad-logo.webp',
      category: 'Tourism',
      description: 'The national airline of the UAE, connecting Abu Dhabi to the world with a fleet of modern aircraft.',
      phone: '+971 2 599 0000',
      email: 'info@etihad.ae',
      website: 'etihad.com',
      address: 'Khalifa City, Abu Dhabi, UAE',
      founded: '2003',
      employees: '10,000+',
      revenue: '$5B+',
      services: ['Air Travel', 'Cargo Services', 'Loyalty Program', 'Holiday Packages']
    }, {
      id: 8,
      name: 'Mubadala Investment Company',
      logo: '/logo/mubadala-logo.webp',
      category: 'Finance',
      description: 'Sovereign wealth fund investing in diversified sectors globally to transform the UAE economy.',
      phone: '+971 2 413 0000',
      email: 'info@mubadala.ae',
      website: 'mubadala.com',
      address: 'Al Mamoura Building, Abu Dhabi, UAE',
      founded: '2002',
      employees: '50,000+',
      revenue: '$50B+',
      services: ['Investment Management', 'Strategic Development', 'Portfolio Management', 'Economic Diversification']
    }, {
      id: 9,
      name: 'Aldar Properties',
      logo: '/logo/aldar-logo.webp',
      category: 'Real Estate',
      description: 'Leading real estate developer with iconic developments across Abu Dhabi and beyond.',
      phone: '+971 2 810 5555',
      email: 'customercare@aldar.com',
      website: 'aldar.com',
      address: 'Al Raha Beach, Abu Dhabi, UAE',
      founded: '2005',
      employees: '1,500+',
      revenue: '$2B+',
      services: ['Property Development', 'Asset Management', 'Retail Management', 'Hospitality']
    }, {
      id: 10,
      name: 'Abu Dhabi Ports',
      logo: '/logo/ad-ports-logo.webp',
      category: 'Logistics',
      description: 'Operates and manages ports and related logistics infrastructure in Abu Dhabi and beyond.',
      phone: '+971 2 695 2000',
      email: 'info@adports.ae',
      website: 'adports.ae',
      address: 'Zayed Port, Abu Dhabi, UAE',
      founded: '2006',
      employees: '3,000+',
      revenue: '$1.5B+',
      services: ['Port Operations', 'Industrial Zones', 'Maritime Services', 'Digital Solutions']
    }, {
      id: 11,
      name: 'First Abu Dhabi Bank',
      logo: '/logo/fab-logo.webp',
      category: 'Finance',
      description: 'The largest bank in the UAE, offering a full range of financial services to customers across multiple segments.',
      phone: '+971 2 818 1818',
      email: 'info@bankfab.com',
      website: 'bankfab.com',
      address: 'FAB Building, Khalifa Business Park, Abu Dhabi, UAE',
      founded: '2017',
      employees: '5,000+',
      revenue: '$7B+',
      services: ['Corporate Banking', 'Personal Banking', 'Investment Services', 'Islamic Banking']
    }, {
      id: 12,
      name: 'Twofour54',
      logo: '/logo/twofour54.png',
      category: 'Media',
      description: 'Media free zone that nurtures media and entertainment businesses in Abu Dhabi.',
      phone: '+971 2 401 2454',
      email: 'info@twofour54.com',
      website: 'twofour54.com',
      address: 'Yas Creative Hub, Yas Island, Abu Dhabi, UAE',
      founded: '2008',
      employees: '600+',
      services: ['Media Production', 'Business Licensing', 'Studio Facilities', 'Content Creation']
    }, {
      id: 13,
      name: 'ADNOC',
      logo: '/logo/adnoc.png',
      category: 'Energy',
      description: "One of the world's leading energy producers and a primary catalyst for Abu Dhabi's growth and diversification.",
      phone: '+971 2 707 0000',
      email: 'contact@adnoc.ae',
      website: 'adnoc.ae',
      address: 'ADNOC Headquarters, Corniche, Abu Dhabi, UAE',
      founded: '1971',
      employees: '50,000+',
      revenue: '$60B+',
      services: ['Oil Production', 'Gas Processing', 'Petrochemicals', 'Refined Products']
    }, {
      id: 14,
      name: 'NYU Abu Dhabi',
      logo: '/logo/nyu.png',
      category: 'Education',
      description: 'A leading liberal arts and research university bringing together the best of New York and Abu Dhabi.',
      phone: '+971 2 628 4000',
      email: 'nyuad.admissions@nyu.edu',
      website: 'nyuad.nyu.edu',
      address: 'Saadiyat Island, Abu Dhabi, UAE',
      founded: '2010',
      employees: '1,000+',
      services: ['Higher Education', 'Research', 'Arts & Humanities', 'STEM Programs']
    }, {
      id: 15,
      name: 'Khalifa Port',
      logo: '/logo/KFport.png',
      category: 'Logistics',
      description: "First semi-automated container port in the GCC region, handling all of Abu Dhabi's container traffic.",
      phone: '+971 2 695 2000',
      email: 'info@kizad.ae',
      website: 'kizad.ae',
      address: 'Taweelah, Abu Dhabi, UAE',
      founded: '2012',
      employees: '1,200+',
      services: ['Container Handling', 'General Cargo', 'Bulk Cargo', 'Logistics Services']
    }, {
      id: 16,
      name: 'Abu Dhabi Investment Authority',
      logo: '/logo/adia.png',
      category: 'Finance',
      description: "One of the world's largest sovereign wealth funds, investing funds on behalf of the Government of Abu Dhabi.",
      phone: '+971 2 626 7600',
      email: 'info@adia.ae',
      website: 'adia.ae',
      address: 'ADIA Tower, Corniche, Abu Dhabi, UAE',
      founded: '1976',
      employees: '1,700+',
      revenue: '$100B+',
      services: ['Asset Management', 'Global Investments', 'Financial Services', 'Economic Development']
    }, {
      id: 17,
      name: 'Ferrari World Abu Dhabi',
      logo: '/logo/ferari.png',
      category: 'Tourism',
      description: "The world's first Ferrari-branded theme park, featuring record-breaking rides and attractions.",
      phone: '+971 2 496 8000',
      email: 'contact@ferrariworldabudhabi.com',
      website: 'ferrariworldabudhabi.com',
      address: 'Yas Island, Abu Dhabi, UAE',
      founded: '2010',
      employees: '800+',
      services: ['Theme Park', 'Entertainment', 'Dining', 'Retail']
    }, {
      id: 18,
      name: 'Louvre Abu Dhabi',
      logo: '/logo/louvre.png',
      category: 'Tourism',
      description: 'Universal museum showcasing art and artifacts from around the world, housed in an architectural masterpiece.',
      phone: '+971 600 565566',
      email: 'contact@louvreabudhabi.ae',
      website: 'louvreabudhabi.ae',
      address: 'Saadiyat Island, Abu Dhabi, UAE',
      founded: '2017',
      employees: '500+',
      services: ['Art Museum', 'Cultural Exhibitions', 'Educational Programs', 'Events']
    }, {
      id: 19,
      name: 'Abu Dhabi Media',
      logo: '/logo/admn.png',
      category: 'Media',
      description: 'Multi-platform media company delivering content across television, radio, publishing and digital media.',
      phone: '+971 2 414 4000',
      email: 'info@admedia.ae',
      website: 'admedia.ae',
      address: 'Abu Dhabi Media Zone, Abu Dhabi, UAE',
      founded: '2007',
      employees: '1,200+',
      services: ['Broadcasting', 'Digital Content', 'Publishing', 'Advertising']
    }, {
      id: 20,
      name: 'Khalifa University',
      logo: '/logo/KFuni.png',
      category: 'Education',
      description: "Research-intensive university focused on science, engineering, and medicine to support Abu Dhabi's knowledge economy.",
      phone: '+971 2 312 3333',
      email: 'info@ku.ac.ae',
      website: 'ku.ac.ae',
      address: 'Abu Dhabi, UAE',
      founded: '2007',
      employees: '900+',
      services: ['Higher Education', 'Research & Development', 'Engineering Programs', 'Innovation Hub']
    }, {
      id: 21,
      name: 'Abu Dhabi Commercial Bank',
      logo: '/logo/adcb.png',
      category: 'Finance',
      description: 'One of the largest banks in the UAE, providing a comprehensive range of retail and commercial banking services.',
      phone: '+971 2 621 0090',
      email: 'contactus@adcb.com',
      website: 'adcb.com',
      address: 'ADCB Tower, Sheikh Zayed Road, Abu Dhabi, UAE',
      founded: '1985',
      employees: '5,000+',
      revenue: '$3B+',
      services: ['Retail Banking', 'Corporate Banking', 'Wealth Management', 'Islamic Banking']
    }];
    setBusinesses(allBusinesses);
    setFilteredBusinesses(allBusinesses);
  }, []);
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
      }
    }, {
      threshold: 0.1
    });
    if (pageRef.current) {
      observer.observe(pageRef.current);
    }
    return () => {
      if (pageRef.current) {
        observer.unobserve(pageRef.current);
      }
    };
  }, []);
  // Apply filters and sorting
  useEffect(() => {
    let result = [...businesses];
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(business => business.name.toLowerCase().includes(query) || business.description.toLowerCase().includes(query) || business.category.toLowerCase().includes(query));
    }
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(business => business.category === categoryFilter);
    }
    // Apply sorting
    switch (sortBy) {
      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'foundedAsc':
        result.sort((a, b) => {
          if (!a.founded) return 1;
          if (!b.founded) return -1;
          return parseInt(a.founded) - parseInt(b.founded);
        });
        break;
      case 'foundedDesc':
        result.sort((a, b) => {
          if (!a.founded) return 1;
          if (!b.founded) return -1;
          return parseInt(b.founded) - parseInt(a.founded);
        });
        break;
      default:
        // Default sorting (by id)
        result.sort((a, b) => a.id - b.id);
    }
    setFilteredBusinesses(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, sortBy, categoryFilter, businesses]);
  // Get current businesses for pagination
  const indexOfLastBusiness = currentPage * businessesPerPage;
  const indexOfFirstBusiness = indexOfLastBusiness - businessesPerPage;
  const currentBusinesses = filteredBusinesses.slice(indexOfFirstBusiness, indexOfLastBusiness);
  const totalPages = Math.ceil(filteredBusinesses.length / businessesPerPage);
  // Get unique categories for filter
  const categories = ['all', ...new Set(businesses.map(business => business.category))];
  // Handle pagination
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the grid
    document.getElementById('business-grid')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setCategoryFilter('all');
    setShowFilters(false);
  };
  // Handle view profile
  const handleViewProfile = (business: Business) => {
    setSelectedProfile(business);
    setIsProfileModalOpen(true);
  };
  return <div ref={pageRef} className="min-h-screen w-full bg-gray-50 pt-24 pb-20 px-6 md:px-12 opacity-0 -translate-y-4 transition-all duration-1000">
    <div className="container mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link to="/discover-abudhabi" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors transform hover:-translate-x-1 duration-200">
          <ArrowLeftIcon size={18} className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Business Directory
        </h1>
        <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Connect with leading organizations and service providers in Abu
          Dhabi's dynamic business ecosystem to foster partnerships and drive
          growth.
        </p>
      </div>
      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md mb-12 transition-all duration-300">
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input type="text" placeholder="Search companies, industries, or services..." className="w-full py-4 pl-12 pr-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-base" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {/* Filter Toggle Button */}
          <button className={`px-5 py-4 rounded-lg flex items-center justify-center transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-label="Toggle filters">
            <FilterIcon size={20} className="mr-2" />
            <span>Filters</span>
          </button>
        </div>
        {/* Expanded Filters */}
        {showFilters && <div className="p-6 border-t border-gray-100 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Industry Category
              </label>
              <div className="relative">
                <select className="w-full p-3 bg-gray-50 rounded-lg appearance-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  {categories.map(category => <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>)}
                </select>
                <ChevronDownIcon size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Sort By Name */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Sort by Name
              </label>
              <div className="relative">
                <select className="w-full p-3 bg-gray-50 rounded-lg appearance-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary" value={sortBy === 'nameAsc' ? 'nameAsc' : sortBy === 'nameDesc' ? 'nameDesc' : ''} onChange={e => {
                  if (e.target.value) {
                    setSortBy(e.target.value as SortOption);
                  }
                }}>
                  <option value="">No sorting</option>
                  <option value="nameAsc">A to Z</option>
                  <option value="nameDesc">Z to A</option>
                </select>
                <ChevronDownIcon size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Sort By Founded Year */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Sort by Established Year
              </label>
              <div className="relative">
                <select className="w-full p-3 bg-gray-50 rounded-lg appearance-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary" value={sortBy === 'foundedAsc' ? 'foundedAsc' : sortBy === 'foundedDesc' ? 'foundedDesc' : ''} onChange={e => {
                  if (e.target.value) {
                    setSortBy(e.target.value as SortOption);
                  }
                }}>
                  <option value="">No sorting</option>
                  <option value="foundedAsc">Oldest First</option>
                  <option value="foundedDesc">Newest First</option>
                </select>
                <ChevronDownIcon size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {/* Reset Filters */}
          <div className="mt-6 flex justify-end">
            <button onClick={resetFilters} className="flex items-center text-gray-500 hover:text-primary transition-colors">
              <XIcon size={16} className="mr-1" />
              Reset Filters
            </button>
          </div>
        </div>}
      </div>
      {/* Active Filters Summary */}
      {(searchQuery || categoryFilter !== 'all' || sortBy !== 'default') && <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-gray-500">Active filters:</span>
        {searchQuery && <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
          <span className="mr-2">Search: {searchQuery}</span>
          <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
            <XIcon size={14} />
          </button>
        </div>}
        {categoryFilter !== 'all' && <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
          <span className="mr-2">Category: {categoryFilter}</span>
          <button onClick={() => setCategoryFilter('all')} className="text-gray-400 hover:text-gray-600">
            <XIcon size={14} />
          </button>
        </div>}
        {sortBy !== 'default' && <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
          <span className="mr-2">
            Sort:{' '}
            {sortBy === 'nameAsc' ? 'Name (A-Z)' : sortBy === 'nameDesc' ? 'Name (Z-A)' : sortBy === 'foundedAsc' ? 'Established (Oldest)' : 'Established (Newest)'}
          </span>
          <button onClick={() => setSortBy('default')} className="text-gray-400 hover:text-gray-600">
            <XIcon size={14} />
          </button>
        </div>}
        <button onClick={resetFilters} className="text-primary hover:text-primary-dark text-sm ml-auto">
          Clear All
        </button>
      </div>}
      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-gray-500">
          Showing {filteredBusinesses.length}{' '}
          {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
        </div>
        {/* Pagination Controls - Top */}
        {totalPages > 1 && <div className="flex items-center space-x-1">
          <button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ChevronUpIcon size={16} className="transform rotate-90" />
          </button>
          {Array.from({
            length: totalPages
          }, (_, i) => i + 1).map(number => <button key={number} onClick={() => paginate(number)} className={`w-8 h-8 rounded ${currentPage === number ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {number}
          </button>)}
          <button onClick={() => paginate(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ChevronDownIcon size={16} className="transform rotate-90" />
          </button>
        </div>}
      </div>
      {/* Business Grid */}
      <div id="business-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {currentBusinesses.length > 0 ? currentBusinesses.map(business => <ProfileCard key={business.id} name={business.name} logo={business.logo} category={business.category} description={business.description} phone={business.phone} email={business.email} website={business.website} onViewProfile={() => handleViewProfile(business)} />) : <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No businesses found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Reset Filters
          </button>
        </div>}
      </div>
      {/* Pagination Controls - Bottom */}
      {totalPages > 1 && <div className="flex justify-center mt-8 mb-12">
        <div className="flex items-center space-x-1">
          <button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ChevronUpIcon size={16} className="transform rotate-90" />
          </button>
          {Array.from({
            length: totalPages
          }, (_, i) => i + 1).map(number => <button key={number} onClick={() => paginate(number)} className={`w-8 h-8 rounded ${currentPage === number ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {number}
          </button>)}
          <button onClick={() => paginate(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ChevronDownIcon size={16} className="transform rotate-90" />
          </button>
        </div>
      </div>}
      {/* CTA Section */}
      {/* <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to Join Abu Dhabi's Business Community?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Connect with our business development team to explore opportunities,
            partnerships, and support services tailored to your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="px-8 py-4 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg">
              Register Your Business
            </Link>
            <Link to="/" className="px-8 py-4 border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-white transition-colors">
              Contact Business Support
            </Link>
          </div>
        </div> */}
    </div>
    {/* Profile Modal */}
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={selectedProfile} />
  </div>;
};
export default BusinessDirectoryMarketplace;