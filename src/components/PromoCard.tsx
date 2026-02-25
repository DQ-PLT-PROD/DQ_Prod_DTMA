import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface PromoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradientFrom: string;
  gradientTo: string;
}
export const PromoCard: React.FC<PromoCardProps> = ({
  title,
  description,
  icon,
  path,
  gradientFrom = 'from-purple-600',
  gradientTo = 'to-blue-600'
}) => {
  const navigate = useNavigate();
  return <div className={`flex flex-col h-full rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white`} onClick={() => navigate(path)}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-white text-opacity-90 mb-6">{description}</p>
        <div className="mt-auto flex items-center font-medium">
          Explore Now
          <ArrowRight className="ml-2" size={18} />
        </div>
      </div>
    </div>;
};