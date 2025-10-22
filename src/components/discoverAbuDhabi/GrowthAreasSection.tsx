import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SectorCard from './SectorCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUpIcon, ZapIcon, DatabaseIcon, GlobeIcon, ShoppingBagIcon, HeartIcon, ArrowRightIcon, CheckIcon, BuildingIcon, BookOpenIcon, TruckIcon, LeafIcon, PaletteIcon, PlaneIcon, DownloadIcon } from 'lucide-react';
const sectorData = [{
  name: 'Technology',
  value: 85,
  previousValue: 70
}, {
  name: 'Energy',
  value: 72,
  previousValue: 65
}, {
  name: 'Finance',
  value: 68,
  previousValue: 61
}, {
  name: 'Tourism',
  value: 60,
  previousValue: 48
}, {
  name: 'Retail',
  value: 55,
  previousValue: 50
}, {
  name: 'Healthcare',
  value: 50,
  previousValue: 42
}, {
  name: 'Education',
  value: 45,
  previousValue: 38
}, {
  name: 'Logistics',
  value: 58,
  previousValue: 49
}, {
  name: 'Agritech',
  value: 42,
  previousValue: 32
}, {
  name: 'Creative',
  value: 48,
  previousValue: 40
}, {
  name: 'Aerospace',
  value: 52,
  previousValue: 44
}];
const GrowthAreasSection = () => {
  const sectionRef = useRef(null);
  const chartRef = useRef(null);
  const [activeChartIndex, setActiveChartIndex] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showAllSectors, setShowAllSectors] = useState(false);
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
      }
    }, {
      threshold: 0.1
    });
    const chartObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'scale-100');
      }
    }, {
      threshold: 0.1
    });
    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }
    if (chartRef.current) {
      chartObserver.observe(chartRef.current);
    }
    return () => {
      if (sectionRef.current) {
        sectionObserver.unobserve(sectionRef.current);
      }
      if (chartRef.current) {
        chartObserver.unobserve(chartRef.current);
      }
    };
  }, []);
  const handleDownloadReport = sectorName => {
    console.log(`Downloading ${sectorName} report...`);
    // Simulate download delay
    const button = document.getElementById(`download-${sectorName}`);
    if (button) {
      button.innerText = 'Downloading...';
      button.disabled = true;
      setTimeout(() => {
        button.innerText = 'Download Report';
        button.disabled = false;
        alert(`${sectorName} sector report downloaded successfully!`);
      }, 1500);
    }
  };
  const technologyDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
          <span>AI and Machine Learning research partnerships with MBZUAI</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
          <span>
            Hub71 startup ecosystem with global connections and funding
          </span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
          <span>Smart City initiatives with government backing</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Technology" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm" onClick={() => handleDownloadReport('Technology')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const energyDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-teal mr-3 mt-1 flex-shrink-0" />
          <span>Masdar City clean technology partnerships</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal mr-3 mt-1 flex-shrink-0" />
          <span>Solar energy development with IRENA headquarters</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal mr-3 mt-1 flex-shrink-0" />
          <span>
            Energy transition consulting for traditional energy companies
          </span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Energy" className="inline-flex items-center px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark transition-colors shadow-sm" onClick={() => handleDownloadReport('Energy')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const financeDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-purple mr-3 mt-1 flex-shrink-0" />
          <span>
            Abu Dhabi Global Market (ADGM) financial services licensing
          </span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-purple mr-3 mt-1 flex-shrink-0" />
          <span>Sovereign wealth fund partnerships with ADIA</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-purple mr-3 mt-1 flex-shrink-0" />
          <span>Islamic Finance innovation hub</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Finance" className="inline-flex items-center px-4 py-2 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors shadow-sm" onClick={() => handleDownloadReport('Finance')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const tourismDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-primary-light mr-3 mt-1 flex-shrink-0" />
          <span>Luxury hospitality investments with beachfront properties</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary-light mr-3 mt-1 flex-shrink-0" />
          <span>
            Cultural tourism leveraging Louvre Abu Dhabi and Zayed National
            Museum
          </span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary-light mr-3 mt-1 flex-shrink-0" />
          <span>
            MICE (Meetings, Incentives, Conferences, Exhibitions) industry
            growth
          </span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Tourism" className="inline-flex items-center px-4 py-2 bg-primary-light text-white rounded-lg font-medium hover:bg-primary transition-colors shadow-sm" onClick={() => handleDownloadReport('Tourism')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const retailDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-teal-light mr-3 mt-1 flex-shrink-0" />
          <span>Luxury retail expansion in premium malls and destinations</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal-light mr-3 mt-1 flex-shrink-0" />
          <span>E-commerce and omnichannel retail solutions</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal-light mr-3 mt-1 flex-shrink-0" />
          <span>Retail technology and experiential shopping concepts</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Retail" className="inline-flex items-center px-4 py-2 bg-teal-light text-white rounded-lg font-medium hover:bg-teal transition-colors shadow-sm" onClick={() => handleDownloadReport('Retail')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const healthcareDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-purple-light mr-3 mt-1 flex-shrink-0" />
          <span>Medical tourism and specialized treatment centers</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-purple-light mr-3 mt-1 flex-shrink-0" />
          <span>Health tech innovations and digital health solutions</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-purple-light mr-3 mt-1 flex-shrink-0" />
          <span>Pharmaceutical research and manufacturing</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Healthcare" className="inline-flex items-center px-4 py-2 bg-purple-light text-white rounded-lg font-medium hover:bg-purple transition-colors shadow-sm" onClick={() => handleDownloadReport('Healthcare')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const educationDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
          <span>International university partnerships and campuses</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
          <span>EdTech innovations and digital learning platforms</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
          <span>Vocational training aligned with economic diversification</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Education" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm" onClick={() => handleDownloadReport('Education')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const logisticsDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-teal mr-3 mt-1 flex-shrink-0" />
          <span>Port expansion and maritime logistics hub development</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal mr-3 mt-1 flex-shrink-0" />
          <span>Supply chain technology and automation solutions</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal mr-3 mt-1 flex-shrink-0" />
          <span>E-commerce fulfillment and last-mile delivery innovations</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Logistics" className="inline-flex items-center px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark transition-colors shadow-sm" onClick={() => handleDownloadReport('Logistics')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const agritechDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-purple mr-3 mt-1 flex-shrink-0" />
          <span>Desert agriculture and vertical farming solutions</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-purple mr-3 mt-1 flex-shrink-0" />
          <span>Water conservation and desalination technologies</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-purple mr-3 mt-1 flex-shrink-0" />
          <span>Food security initiatives and sustainable agriculture</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Agritech" className="inline-flex items-center px-4 py-2 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors shadow-sm" onClick={() => handleDownloadReport('Agritech')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const creativeDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-primary-light mr-3 mt-1 flex-shrink-0" />
          <span>Film and media production with regional incentives</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary-light mr-3 mt-1 flex-shrink-0" />
          <span>Gaming and digital content development</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-primary-light mr-3 mt-1 flex-shrink-0" />
          <span>Cultural and heritage tourism experiences</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Creative" className="inline-flex items-center px-4 py-2 bg-primary-light text-white rounded-lg font-medium hover:bg-primary transition-colors shadow-sm" onClick={() => handleDownloadReport('Creative Industries')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const aerospaceDetails = <div>
      <h4 className="font-display text-lg font-bold mb-4">Key Opportunities</h4>
      <ul className="space-y-3">
        <li className="flex">
          <CheckIcon size={18} className="text-teal-light mr-3 mt-1 flex-shrink-0" />
          <span>
            Aircraft maintenance, repair, and overhaul (MRO) facilities
          </span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal-light mr-3 mt-1 flex-shrink-0" />
          <span>Space technology and satellite development</span>
        </li>
        <li className="flex">
          <CheckIcon size={18} className="text-teal-light mr-3 mt-1 flex-shrink-0" />
          <span>Aviation training and simulation technology</span>
        </li>
      </ul>
      <div className="mt-6">
        <button id="download-Aerospace" className="inline-flex items-center px-4 py-2 bg-teal-light text-white rounded-lg font-medium hover:bg-teal transition-colors shadow-sm" onClick={() => handleDownloadReport('Aerospace')}>
          <DownloadIcon size={16} className="mr-2" />
          Download Report
        </button>
      </div>
    </div>;
  const CustomTooltip = ({
    active,
    payload,
    label
  }) => {
    if (active && payload && payload.length) {
      return <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
          <p className="font-display font-bold text-gray-800">{label}</p>
          {payload.map((entry, index) => <p key={index} className="font-body text-sm" style={{
          color: entry.color
        }}>
              {entry.name === 'value' ? 'Current: ' : 'Previous Year: '}
              <span className="font-medium">{entry.value} points</span>
            </p>)}
          {payload[0].payload.value > payload[0].payload.previousValue && <p className="text-green-600 text-xs mt-1 font-medium">
              ↑{' '}
              {((payload[0].payload.value - payload[0].payload.previousValue) / payload[0].payload.previousValue * 100).toFixed(1)}
              % growth
            </p>}
        </div>;
    }
    return null;
  };
  const initialSectors = [{
    title: 'Technology',
    description: 'Leading innovation hub for AI, fintech, and digital transformation with world-class infrastructure.',
    icon: <TrendingUpIcon size={28} className="text-primary" />,
    growth: '12.5%',
    investment: '$10B+',
    color: 'bg-primary',
    detailsContent: technologyDetails
  }, {
    title: 'Energy',
    description: 'Pioneering sustainable energy solutions while leveraging traditional energy expertise.',
    icon: <ZapIcon size={28} className="text-teal" />,
    growth: '8.3%',
    investment: '$15B+',
    color: 'bg-teal',
    detailsContent: energyDetails
  }, {
    title: 'Finance',
    description: 'International financial center with progressive regulatory frameworks and global connections.',
    icon: <DatabaseIcon size={28} className="text-purple" />,
    growth: '7.2%',
    investment: '$8B+',
    color: 'bg-purple',
    detailsContent: financeDetails
  }, {
    title: 'Tourism',
    description: 'Luxury destination blending cultural heritage with modern attractions and world-class hospitality.',
    icon: <GlobeIcon size={28} className="text-primary-light" />,
    growth: '9.5%',
    investment: '$12B+',
    color: 'bg-primary-light',
    detailsContent: tourismDetails
  }, {
    title: 'Retail',
    description: 'Premium shopping destination with innovative retail concepts and digital marketplace growth.',
    icon: <ShoppingBagIcon size={28} className="text-teal-light" />,
    growth: '6.8%',
    investment: '$5B+',
    color: 'bg-teal-light',
    detailsContent: retailDetails
  }, {
    title: 'Healthcare',
    description: 'Expanding medical tourism and healthcare innovation with state-of-the-art facilities.',
    icon: <HeartIcon size={28} className="text-purple-light" />,
    growth: '10.2%',
    investment: '$7B+',
    color: 'bg-purple-light',
    detailsContent: healthcareDetails
  }];
  const additionalSectors = [{
    title: 'Education',
    description: 'World-class academic institutions and research centers fostering innovation and knowledge exchange.',
    icon: <BookOpenIcon size={28} className="text-primary" />,
    growth: '7.8%',
    investment: '$4.5B+',
    color: 'bg-primary',
    detailsContent: educationDetails
  }, {
    title: 'Logistics',
    description: 'Strategic hub connecting global trade routes with advanced supply chain and transportation infrastructure.',
    icon: <TruckIcon size={28} className="text-teal" />,
    growth: '8.9%',
    investment: '$6.2B+',
    color: 'bg-teal',
    detailsContent: logisticsDetails
  }, {
    title: 'Agritech',
    description: 'Innovative agricultural technologies addressing food security in arid environments through sustainable solutions.',
    icon: <LeafIcon size={28} className="text-purple" />,
    growth: '11.3%',
    investment: '$3.8B+',
    color: 'bg-purple',
    detailsContent: agritechDetails
  }, {
    title: 'Creative Industries',
    description: 'Vibrant ecosystem for media, design, and cultural production with global reach and local authenticity.',
    icon: <PaletteIcon size={28} className="text-primary-light" />,
    growth: '9.2%',
    investment: '$2.7B+',
    color: 'bg-primary-light',
    detailsContent: creativeDetails
  }, {
    title: 'Aerospace',
    description: 'Growing aerospace sector with manufacturing, maintenance, and space technology development capabilities.',
    icon: <PlaneIcon size={28} className="text-teal-light" />,
    growth: '7.5%',
    investment: '$5.5B+',
    color: 'bg-teal-light',
    detailsContent: aerospaceDetails
  }];
  const allSectors = [...initialSectors, ...additionalSectors];
  const displayedSectors = showAllSectors ? allSectors : initialSectors;
  return <section id="growth-areas" ref={sectionRef} className="py-28 px-6 md:px-12 bg-gray-50 opacity-0 -translate-y-4 transition-all duration-1000">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Growth Areas
          </h2>
          <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Abu Dhabi offers exceptional opportunities across diverse sectors,
            each supported by strategic initiatives and investment.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedSectors.map((sector, index) => <SectorCard key={sector.title} title={sector.title} description={sector.description} icon={sector.icon} growth={sector.growth} investment={sector.investment} color={sector.color} detailsContent={sector.detailsContent} />)}
        </div>
        <div className="flex justify-center mb-20">
          {showAllSectors ? <button onClick={() => setShowAllSectors(false)} className="px-8 py-4 bg-white border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 duration-200">
              <ArrowRightIcon size={18} className="mr-2 transform rotate-90" />
              Collapse Growth Areas
            </button> : <Link to="/growth-areas-marketplace" className="px-8 py-4 bg-white border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 duration-200">
              <ArrowRightIcon size={18} className="mr-2 transform -rotate-90" />
              Explore Growth Areas Marketplace
            </Link>}
        </div>
        <div ref={chartRef} className="bg-white rounded-xl shadow-lg p-10 opacity-0 scale-95 transition-all duration-1000 delay-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h3 className="font-display text-3xl font-bold tracking-tight">
              Sector Growth Potential
            </h3>
            <div className="mt-4 md:mt-0 flex items-center">
              <label className="flex items-center cursor-pointer">
                <span className="mr-2 text-gray-600 font-body">
                  Show Year-over-Year Comparison
                </span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={showComparison} onChange={() => setShowComparison(!showComparison)} />
                  <div className={`block w-14 h-8 rounded-full ${showComparison ? 'bg-primary' : 'bg-gray-300'} transition-colors`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showComparison ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50
            }} onMouseMove={data => {
              if (data && data.activeTooltipIndex !== undefined) {
                setActiveChartIndex(data.activeTooltipIndex);
              }
            }} onMouseLeave={() => setActiveChartIndex(null)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{
                fill: '#6B7280',
                fontFamily: 'Helvetica Neue',
                fontSize: 14
              }} axisLine={{
                stroke: '#E5E7EB'
              }} tickLine={false} dy={10} />
                <YAxis tick={{
                fill: '#6B7280',
                fontFamily: 'Helvetica Neue',
                fontSize: 14
              }} axisLine={{
                stroke: '#E5E7EB'
              }} tickLine={false} domain={[0, 100]} label={{
                value: 'Growth Index',
                angle: -90,
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: '#6B7280',
                  fontFamily: 'Helvetica Neue',
                  fontSize: 14
                },
                dy: -40
              }} />
                <Tooltip content={<CustomTooltip />} cursor={{
                fill: 'rgba(0, 48, 227, 0.05)'
              }} />
                {showComparison && <Bar dataKey="previousValue" fill="#99B2FF" name="Previous Year" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1500} />}
                <Bar dataKey="value" fill="#0030E3" name="Current" radius={[6, 6, 0, 0]} barSize={showComparison ? 25 : 50} animationDuration={1500} />
                {showComparison && <Legend wrapperStyle={{
                paddingTop: '20px'
              }} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 text-center">
            <Link to="/growth-areas" className="px-8 py-4 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200">
              Explore Growth Sectors
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default GrowthAreasSection;
