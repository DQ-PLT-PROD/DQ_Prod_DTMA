import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import ProfileCard from './ProfileCard';
import ProfileModal from './ProfileModal';
// Updated logo URLs for initialProfiles
const initialProfiles = [{
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
  logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D',
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
}];
// Additional profiles that can be loaded
const additionalProfiles = [{
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
}];
const DirectorySection = () => {
  // ... rest of the code remains unchanged
  const [profiles, setProfiles] = useState(initialProfiles);
  const [filteredProfiles, setFilteredProfiles] = useState(initialProfiles);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const sectionRef = useRef(null);
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
    // Listen for search events from header
    const handleHeaderSearch = event => {
      const {
        query
      } = event.detail;
      if (query) {
        handleSearch(query, []);
      }
    };
    document.addEventListener('headerSearch', handleHeaderSearch);
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      document.removeEventListener('headerSearch', handleHeaderSearch);
    };
  }, []);
  const handleSearch = (query: string, filters: string[]) => {
    setIsSearching(true);
    setTimeout(() => {
      let results = [...profiles];
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        results = results.filter(profile => profile.name.toLowerCase().includes(lowercaseQuery) || profile.description.toLowerCase().includes(lowercaseQuery) || profile.category.toLowerCase().includes(lowercaseQuery));
      }
      if (filters.length > 0) {
        results = results.filter(profile => filters.includes(profile.category));
      }
      setFilteredProfiles(results);
      setIsSearching(false);
      setHasMoreProfiles(additionalProfiles.length > 0);
    }, 500);
  };
  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const newProfiles = [...profiles, ...additionalProfiles];
      setProfiles(newProfiles);
      // Apply current filters to new profiles
      handleSearch('', []); // This will apply any active filters
      setIsLoading(false);
      setHasMoreProfiles(false); // No more profiles to load
    }, 1000);
  };
  const handleViewProfile = profile => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };
  return <section id="directory" ref={sectionRef} className="py-28 px-6 md:px-12 opacity-0 -translate-y-4 transition-all duration-1000">
    <div className="container mx-auto">
      <div className="text-center mb-20">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Business Directory
        </h2>
        <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Connect with leading organizations and service providers in Abu
          Dhabi's dynamic business ecosystem.
        </p>
      </div>
      <div className="mb-16">
        <SearchBar onSearch={handleSearch} />
      </div>
      {isSearching ? <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div> : <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfiles.length > 0 ? filteredProfiles.map(profile => <ProfileCard key={profile.id} name={profile.name} logo={profile.logo} category={profile.category} description={profile.description} phone={profile.phone} email={profile.email} website={profile.website} onViewProfile={() => handleViewProfile(profile)} buttonText="Contact" />) : <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-500 font-body text-lg mb-4">
              No results found.
            </p>
            <p className="text-gray-400 font-body">
              Please try a different search term or filter.
            </p>
          </div>}
        </div>
        {filteredProfiles.length > 0 && hasMoreProfiles && <div className="mt-16 text-center">
          <Link to="/business-directory-marketplace" className="px-10 py-4 bg-white border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-white transition-colors shadow-sm hover:shadow-md">
            View Full Directory
          </Link>
        </div>}
      </>}
    </div>
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={selectedProfile} />
  </section>;
};
export default DirectorySection;