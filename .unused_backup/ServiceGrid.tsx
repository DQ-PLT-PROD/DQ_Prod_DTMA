import React, { useState } from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceItem } from '../../types/marketplace';
import { PromoCard } from '../PromoCard';
import { DollarSign, Briefcase, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceQuickViewModal } from './ServiceQuickViewModal';
interface ServiceGridProps {
  services: ServiceItem[];
  onServiceSelect: (service: ServiceItem) => void;
  bookmarkedServices: string[];
  onToggleBookmark: (serviceId: string) => void;
  onAddToComparison: (service: ServiceItem) => void;
  marketplaceType: string;
  primaryButtonText?: string;
}
export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  onServiceSelect,
  bookmarkedServices,
  onToggleBookmark,
  onAddToComparison,
  marketplaceType,
  primaryButtonText = 'Enroll Now'
}) => {
  const [quickViewService, setQuickViewService] = useState<ServiceItem | null>(null);
  const navigate = useNavigate();
  // Promo cards to be inserted after every 6 regular cards
  const promoCards = [{
    id: 'finance-promo',
    title: 'Looking for funding?',
    description: 'Explore financial opportunities and resources to grow your business.',
    icon: <DollarSign size={24} className="text-white" />,
    path: '/marketplace/financial',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-700'
  }, {
    id: 'advisory-promo',
    title: 'Need expert advice?',
    description: 'Connect with industry experts and get personalized guidance.',
    icon: <Briefcase size={24} className="text-white" />,
    path: '/marketplace/non-financial',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-500'
  }, {
    id: 'community-promo',
    title: 'Join our community',
    description: 'Network with fellow entrepreneurs and share experiences.',
    icon: <Users size={24} className="text-white" />,
    path: '/community',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-teal-400'
  }, {
    id: 'events-promo',
    title: 'Upcoming events',
    description: 'Discover workshops, webinars, and networking opportunities.',
    icon: <Calendar size={24} className="text-white" />,
    path: '/events',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500'
  }];
  if (services.length === 0) {
    return <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search criteria
        </p>
      </div>;
  }
  // Insert promo cards after every 6 regular cards
  const itemsWithPromos = services.reduce((acc, service, index) => {
    acc.push({
      type: 'service',
      data: service
    });
    // Insert a promo card after every 6 services
    if ((index + 1) % 6 === 0 && promoCards[Math.floor(index / 6) % promoCards.length]) {
      const promoIndex = Math.floor(index / 6) % promoCards.length;
      acc.push({
        type: 'promo',
        data: promoCards[promoIndex]
      });
    }
    return acc;
  }, [] as Array<{
    type: 'service' | 'promo';
    data: any;
  }>);
  return <div>
      <div className="flex justify-between items-center mb-4">
        {/* Responsive header - concise on mobile */}
        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
          Available Items ({services.length})
        </h2>
        <div className="text-sm text-gray-500 hidden sm:block">
          Showing {services.length} of {services.length} items
        </div>
        {/* Mobile-friendly header */}
        <h2 className="text-lg font-medium text-gray-800 sm:hidden">
          {services.length} Items Available
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {itemsWithPromos.map((item, idx) => {
        if (item.type === 'service') {
          const service = item.data as ServiceItem;
          return <ServiceCard key={`service-${service.id}`} service={service} onClick={() => onServiceSelect(service)} onQuickView={() => setQuickViewService(service)} isBookmarked={bookmarkedServices.includes(service.id)} onToggleBookmark={() => onToggleBookmark(service.id)} onAddToComparison={() => onAddToComparison(service)} marketplaceType={marketplaceType} primaryButtonText={primaryButtonText} />;
        } else if (item.type === 'promo') {
          const promo = item.data;
          return <PromoCard key={`promo-${promo.id}-${idx}`} title={promo.title} description={promo.description} icon={promo.icon} path={promo.path} gradientFrom={promo.gradientFrom} gradientTo={promo.gradientTo} />;
        }
        return null;
      })}
      </div>
      {/* Quick View Modal */}
      {quickViewService && <ServiceQuickViewModal service={quickViewService} onClose={() => setQuickViewService(null)} onViewDetails={() => {
      setQuickViewService(null);
      navigate(`/marketplace/${marketplaceType}/${quickViewService.id}`);
    }} isBookmarked={bookmarkedServices.includes(quickViewService.id)} onToggleBookmark={() => onToggleBookmark(quickViewService.id)} onAddToComparison={() => {
      onAddToComparison(quickViewService);
      setQuickViewService(null);
    }} marketplaceType={marketplaceType} primaryButtonText={primaryButtonText} />}
    </div>;
};