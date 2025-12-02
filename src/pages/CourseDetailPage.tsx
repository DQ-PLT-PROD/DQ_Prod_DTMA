import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  cloneElement,
  Component,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  DollarSign,
  Briefcase,
  Users,
  Newspaper,
  Lightbulb,
  TrendingUp,
  Briefcase as JobIcon,
  Globe,
  Calendar,
  BookIcon,
  Award,
  X,
  Clock,
  Compass,
  HeartHandshake,
  Building,
  Lock,
  ArrowRight,
  ChevronRight,
  Landmark,
  GraduationCap,
  BarChart,
  CreditCard,
  PiggyBank,
  LineChart,
  BadgeDollarSign,
  Wallet,
  Calculator,
  Receipt,
  Coins,
  BriefcaseBusiness,
  Target,
  BarChart2,
  Network,
  PieChart,
  ClipboardList,
  Handshake,
  BarChartHorizontal,
  Building2,
  Share2,
  Store,
  Truck,
  ShoppingBag,
  Megaphone,
  Rocket,
  PanelRight,
  Laptop,
  FileCode,
  Database,
  FileText,
  Presentation,
  BookMarked,
  GraduationCap as GraduationCapIcon,
  Layers,
  LayoutPanelLeft,
  Gauge,
  Microscope,
  BookCopy,
  Library,
  ChevronLeft,
} from 'lucide-react'
import {
  FadeInUpOnScroll,
  StaggeredFadeIn,
  AnimatedCounter,
  useInView,
} from './AnimationUtils'

// Service Category Card Component
const ServiceCard = ({ service, onClick, isComingSoon = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      className={`rounded-xl shadow-md overflow-hidden transition-all duration-500 transform p-6 h-full ${isComingSoon ? 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-75 hover:opacity-85' : `bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} hover:shadow-lg hover:-translate-y-1 hover:scale-102 cursor-pointer`}`}
      onClick={isComingSoon ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full relative">
        {isComingSoon && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full text-gray-800 flex items-center animate-pulse">
            <Clock size={12} className="mr-1" />
            Coming Soon
          </div>
        )}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm transition-all duration-500 ${isHovered ? 'transform -translate-y-2 animate-pulse' : ''}`}
          style={{
            background: 'white',
          }}
        >
          <div className={isComingSoon ? 'text-gray-500' : 'text-blue-600'}>
            {cloneElement(service.icon, {
              size: 24,
              className: isComingSoon ? 'text-gray-500' : 'text-blue-600',
            })}
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">
          {service.title}
        </h2>
        <p className="text-sm text-white/90 mb-4 flex-grow">
          {service.description}
        </p>
        <button
          className={`mt-auto px-4 py-2 rounded-md font-medium w-full transition-all duration-500 flex items-center justify-center ${isComingSoon ? 'bg-white text-gray-500 cursor-not-allowed' : 'bg-white text-blue-700 hover:bg-blue-50 border border-white/20'} ${isHovered && !isComingSoon ? 'opacity-100' : 'opacity-80'}`}
          disabled={isComingSoon}
          onClick={(e) => {
            if (!isComingSoon) {
              e.stopPropagation()
              onClick()
            }
          }}
        >
          {isComingSoon ? <Lock size={14} className="mr-2" /> : 'Explore Now'}
          {!isComingSoon && (
            <ChevronRight
              size={16}
              className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
            />
          )}
        </button>
        {/* Background animation on hover */}
        {!isComingSoon && (
          <div
            className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
            }}
          ></div>
        )}
      </div>
    </div>
  )
}
// Category Header Component
const CategoryHeader = ({ icon, title, count = null }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [ref, isInView] = useInView({
    threshold: 0.1,
  })
  return (
    <div
      className="mb-6"
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 group relative">
          {title}
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group"
            style={{
              width: isHovered ? '100%' : '0%',
            }}
          ></span>
        </h2>
      </div>
      {count !== null && (
        <div className="ml-13 text-gray-600">
          <span className="font-semibold mr-1">
            <AnimatedCounter value={count} />+
          </span>
          services available in this category
        </div>
      )}
    </div>
  )
}
// Carousel Component
const ServiceCarousel = ({ services, handleServiceClick }) => {
  const carouselRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)
  // Update visible count based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1)
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2)
      } else {
        setVisibleCount(4)
      }
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])
  const totalSlides = Math.ceil(services.length / visibleCount)
  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      const scrollAmount = index * carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      })
    }
  }
  const handleNext = () => {
    const nextIndex = Math.min(activeIndex + 1, totalSlides - 1)
    setActiveIndex(nextIndex)
    scrollToIndex(nextIndex)
  }
  const handlePrev = () => {
    const prevIndex = Math.max(activeIndex - 1, 0)
    setActiveIndex(prevIndex)
    scrollToIndex(prevIndex)
  }
  // Handle scroll event to update active index
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const scrollPosition = carouselRef.current.scrollLeft
        const slideWidth = carouselRef.current.offsetWidth
        const newIndex = Math.round(scrollPosition / slideWidth)
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex)
        }
      }
    }
    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll)
      return () => carousel.removeEventListener('scroll', handleScroll)
    }
  }, [activeIndex])
  return (
    <div className="relative">
      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-6"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Create pages of cards */}
        {Array.from({
          length: totalSlides,
        }).map((_, pageIndex) => (
          <div
            key={`page-${pageIndex}`}
            className="flex-shrink-0 w-full flex gap-6 snap-center"
          >
            {services
              .slice(pageIndex * visibleCount, (pageIndex + 1) * visibleCount)
              .map((service, serviceIndex) => (
                <div key={service.id} className={`flex-1 min-w-0`}>
                  <FadeInUpOnScroll delay={(serviceIndex % visibleCount) * 0.1}>
                    <ServiceCard
                      service={service}
                      onClick={() => handleServiceClick(service.path)}
                      isComingSoon={!service.isActive}
                    />
                  </FadeInUpOnScroll>
                </div>
              ))}
            {/* Fill empty slots on the last page */}
            {pageIndex === totalSlides - 1 &&
              Array.from({
                length: (pageIndex + 1) * visibleCount - services.length,
              }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 min-w-0"></div>
              ))}
          </div>
        ))}
      </div>
      {/* Navigation controls */}
      <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center transform -translate-y-1/2 pointer-events-none px-2">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 pointer-events-auto transition-opacity ${activeIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          aria-label="Previous services"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          disabled={activeIndex === totalSlides - 1}
          className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 pointer-events-auto transition-opacity ${activeIndex === totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          aria-label="Next services"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {/* Pagination indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({
          length: totalSlides,
        }).map((_, index) => (
          <button
            key={`indicator-${index}`}
            className={`w-2 h-2 rounded-full transition-all ${activeIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300'}`}
            onClick={() => {
              setActiveIndex(index)
              scrollToIndex(index)
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  // Define all services with categories
  const allServices = useMemo(() => {
    return {
      finance: [
        {
          id: 'funding',
          title: 'Business Funding',
          description:
            'Access loans, grants, and investment opportunities tailored for Abu Dhabi businesses',
          icon: <DollarSign />,
          path: '/marketplace/financial',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: true,
        },
        {
          id: 'financial',
          title: 'Financial Services',
          description:
            'Access financial products to fuel your business growth and sustainability',
          icon: <Landmark />,
          path: '/marketplace/financial',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: true,
        },
        {
          id: 'investments',
          title: 'Investment Marketplace',
          description:
            'Find investment opportunities and funding options for your business',
          icon: <TrendingUp />,
          path: '/investments',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'grants',
          title: 'Grants Directory',
          description:
            'Find grants and funding opportunities for your business',
          icon: <Award />,
          path: '/grants',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'credit-cards',
          title: 'Business Credit Cards',
          description:
            'Compare and apply for business credit cards with special benefits',
          icon: <CreditCard />,
          path: '/credit-cards',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'savings',
          title: 'Business Savings',
          description:
            'Explore savings accounts and investment vehicles for your enterprise',
          icon: <PiggyBank />,
          path: '/savings',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'equity',
          title: 'Equity Financing',
          description: 'Connect with angel investors and venture capital firms',
          icon: <LineChart />,
          path: '/equity-financing',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'microfinance',
          title: 'Microfinance Solutions',
          description:
            'Small-scale funding options for startups and micro-enterprises',
          icon: <BadgeDollarSign />,
          path: '/microfinance',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'payment',
          title: 'Payment Solutions',
          description:
            'Discover payment processing and digital transaction solutions',
          icon: <Wallet />,
          path: '/payment-solutions',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'tax',
          title: 'Tax Planning',
          description: 'Strategic tax planning and optimization services',
          icon: <Calculator />,
          path: '/tax-planning',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'invoice',
          title: 'Invoice Financing',
          description: 'Convert unpaid invoices into immediate working capital',
          icon: <Receipt />,
          path: '/invoice-financing',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'forex',
          title: 'Foreign Exchange',
          description: 'Currency exchange and international payment solutions',
          icon: <Coins />,
          path: '/forex',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
        {
          id: 'insurance',
          title: 'Business Insurance',
          description:
            'Comprehensive insurance solutions to protect your enterprise',
          icon: <BriefcaseBusiness />,
          path: '/business-insurance',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-400',
          isActive: false,
        },
      ],
      advisory: [
        {
          id: 'mentorship',
          title: 'Expert Mentorship',
          description:
            'Connect with experienced business mentors who can guide your growth strategy',
          icon: <HeartHandshake />,
          path: '/marketplace/mentorship',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'business-services',
          title: 'Business Services',
          description:
            'Find professional services to support and grow your business',
          icon: <Briefcase />,
          path: '/marketplace/non-financial',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: true,
        },
        {
          id: 'opportunities',
          title: 'Strategy Advisory',
          description:
            'Discover new business opportunities and strategic partnerships',
          icon: <Lightbulb />,
          path: '/opportunities',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'performance',
          title: 'Performance Analytics',
          description:
            'Data-driven insights to optimize your business performance',
          icon: <Target />,
          path: '/performance',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'market-research',
          title: 'Market Research',
          description:
            'In-depth market analysis and consumer behavior insights',
          icon: <BarChart2 />,
          path: '/market-research',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'networking',
          title: 'Business Networking',
          description:
            'Connect with other businesses for collaboration and growth',
          icon: <Network />,
          path: '/networking',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'competitive',
          title: 'Competitive Analysis',
          description:
            'Understand your competitors and identify market advantages',
          icon: <PieChart />,
          path: '/competitive-analysis',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'business-planning',
          title: 'Business Planning',
          description:
            'Develop comprehensive business plans and growth strategies',
          icon: <ClipboardList />,
          path: '/business-planning',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
        {
          id: 'partnerships',
          title: 'Strategic Partnerships',
          description:
            'Forge valuable business partnerships and collaborations',
          icon: <Handshake />,
          path: '/partnerships',
          gradientFrom: 'from-purple-600',
          gradientTo: 'to-purple-400',
          isActive: false,
        },
      ],
      growth: [
        {
          id: 'expansion',
          title: 'Global Expansion',
          description:
            "Leverage Abu Dhabi's strategic location to expand your business internationally",
          icon: <Compass />,
          path: '/marketplace/expansion',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'communities',
          title: 'Business Communities',
          description:
            'Connect with business networks and expand your professional connections',
          icon: <Users />,
          path: '/communities',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: true,
        },
        {
          id: 'events',
          title: 'Networking Events',
          description:
            'Discover and join business events and networking opportunities',
          icon: <Calendar />,
          path: '/events',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'jobs',
          title: 'Jobs Marketplace',
          description: 'Find talent or explore career opportunities',
          icon: <JobIcon />,
          path: '/jobs',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'performance-metrics',
          title: 'Performance Metrics',
          description:
            'Track and analyze key performance indicators for your business',
          icon: <BarChartHorizontal />,
          path: '/performance-metrics',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'franchising',
          title: 'Franchising Opportunities',
          description:
            'Explore franchising options to scale your business model',
          icon: <Building2 />,
          path: '/franchising',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'corporate-venturing',
          title: 'Corporate Venturing',
          description:
            'Collaborate with established corporations for innovation and growth',
          icon: <div />,
          path: '/corporate-venturing',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'export-development',
          title: 'Export Development',
          description:
            'Develop strategies to export your products to international markets',
          icon: <Share2 />,
          path: '/export-development',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'retail-expansion',
          title: 'Retail Expansion',
          description:
            'Strategies and support for expanding your retail presence',
          icon: <Store />,
          path: '/retail-expansion',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'supply-chain',
          title: 'Supply Chain Optimization',
          description: 'Improve your supply chain efficiency and reduce costs',
          icon: <Truck />,
          path: '/supply-chain',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
        {
          id: 'market-entry',
          title: 'Market Entry Strategies',
          description: 'Develop effective strategies to enter new markets',
          icon: <ShoppingBag />,
          path: '/market-entry',
          gradientFrom: 'from-teal-600',
          gradientTo: 'to-teal-400',
          isActive: false,
        },
      ],
      learning: [
        {
          id: 'courses',
          title: 'Learning & Development',
          description:
            'Discover courses and training programs to enhance your business skills',
          icon: <BookOpen />,
          path: '/marketplace/courses',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: true,
        },
        {
          id: 'digital',
          title: 'Digital Solutions',
          description: 'Explore digital tools and solutions for your business',
          icon: <Globe />,
          path: '/digital-services',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'news',
          title: 'Knowledge Hub',
          description:
            'Stay updated with the latest business news and industry insights',
          icon: <Newspaper />,
          path: '/news',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'law',
          title: 'Legal & Compliance',
          description: 'Access resources on UAE business laws and regulations',
          icon: <BookIcon />,
          path: '/law',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'marketing',
          title: 'Marketing Academy',
          description:
            'Learn effective marketing strategies for business growth',
          icon: <Megaphone />,
          path: '/marketing-academy',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'startup',
          title: 'Startup Accelerator',
          description:
            'Accelerate your startup growth with specialized programs',
          icon: <Rocket />,
          path: '/startup-accelerator',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'innovation',
          title: 'Innovation Lab',
          description:
            'Explore innovation methodologies and creative problem-solving',
          icon: <PanelRight />,
          path: '/innovation-lab',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'tech-training',
          title: 'Technology Training',
          description:
            'Develop technical skills essential for digital transformation',
          icon: <Laptop />,
          path: '/tech-training',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'coding',
          title: 'Coding Bootcamps',
          description: 'Intensive coding programs for entrepreneurs and teams',
          icon: <FileCode />,
          path: '/coding-bootcamps',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'data-analytics',
          title: 'Data Analytics',
          description:
            'Learn to leverage data for better business decision-making',
          icon: <Database />,
          path: '/data-analytics',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'business-writing',
          title: 'Business Writing',
          description: 'Improve your business communication and writing skills',
          icon: <FileText />,
          path: '/business-writing',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'leadership',
          title: 'Leadership Development',
          description:
            'Enhance your leadership skills to drive organizational success',
          icon: <Presentation />,
          path: '/leadership',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'certifications',
          title: 'Professional Certifications',
          description:
            'Earn industry-recognized certifications to boost your credentials',
          icon: <BookMarked />,
          path: '/certifications',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'executive-education',
          title: 'Executive Education',
          description: 'Advanced programs designed for senior business leaders',
          icon: <GraduationCapIcon />,
          path: '/executive-education',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'industry-research',
          title: 'Industry Research',
          description:
            'Access in-depth research on industry trends and developments',
          icon: <Microscope />,
          path: '/industry-research',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
        {
          id: 'business-library',
          title: 'Business Library',
          description:
            'Comprehensive collection of business resources and references',
          icon: <Library />,
          path: '/business-library',
          gradientFrom: 'from-amber-600',
          gradientTo: 'to-amber-400',
          isActive: false,
        },
      ],
    }
  }, [])
  // Function to handle service click
  const handleServiceClick = (path) => {
    navigate(path)
  }
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Marketplaces by Category */}
        <div className="mb-16">
          <FadeInUpOnScroll className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Services & Marketplaces
            </h2>
            <div className="relative">
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover tailored solutions organized by category to accelerate
                your business growth in Abu Dhabi
              </p>
              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-400"></div>
            </div>
          </FadeInUpOnScroll>
          {/* Finance & Funding Category */}
          <div className="mb-10">
            <FadeInUpOnScroll>
              <CategoryHeader
                icon={<DollarSign size={24} />}
                title="Finance & Funding"
                count={13}
              />
            </FadeInUpOnScroll>
            <ServiceCarousel
              services={allServices.finance}
              handleServiceClick={handleServiceClick}
            />
          </div>
          {/* Advisory & Expertise Category */}
          <div className="mb-10">
            <FadeInUpOnScroll>
              <CategoryHeader
                icon={<BarChart size={24} />}
                title="Advisory & Expertise"
                count={9}
              />
            </FadeInUpOnScroll>
            <ServiceCarousel
              services={allServices.advisory}
              handleServiceClick={handleServiceClick}
            />
          </div>
          {/* Growth & Expansion Category */}
          <div className="mb-10">
            <FadeInUpOnScroll>
              <CategoryHeader
                icon={<Globe size={24} />}
                title="Growth & Expansion"
                count={11}
              />
            </FadeInUpOnScroll>
            <ServiceCarousel
              services={allServices.growth}
              handleServiceClick={handleServiceClick}
            />
          </div>
          {/* Learning & Enablement Category */}
          <div className="mb-10">
            <FadeInUpOnScroll>
              <CategoryHeader
                icon={<GraduationCap size={24} />}
                title="Learning & Enablement"
                count={16}
              />
            </FadeInUpOnScroll>
            <ServiceCarousel
              services={allServices.learning}
              handleServiceClick={handleServiceClick}
            />
          </div>
        </div>
      </div>
      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
export default HomePage
