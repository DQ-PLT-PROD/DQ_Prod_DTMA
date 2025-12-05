import React, { useState } from 'react';
import { PhoneIcon, MailIcon, GlobeIcon } from 'lucide-react';
interface ProfileCardProps {
  name: string;
  logo: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  onViewProfile: () => void;
  buttonText?: string;
}
const ProfileCard = ({
  name,
  logo,
  category,
  description,
  phone,
  email,
  website,
  onViewProfile,
  buttonText = 'View Profile'
}: ProfileCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-lg bg-gray-50 p-2 mr-5 shadow-sm flex items-center justify-center">
            {!imgLoaded && !imgError && (
              <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
            )}
            {imgError ? (
              <div className="text-xs font-semibold text-gray-600">
                {name.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <img 
                src={logo} 
                alt={`${name} logo`} 
                className="w-full h-full object-contain" 
                style={{ display: imgLoaded ? 'block' : 'none' }}
                crossOrigin="anonymous"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)} 
              />
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold mb-1">{name}</h3>
            <span className="inline-block px-3 py-1 bg-primary-light bg-opacity-20 text-primary-dark text-xs rounded-full font-body font-medium">
              {category}
            </span>
          </div>
        </div>
        <p className="text-gray-600 font-body mb-6 flex-1">{description}</p>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center text-gray-600">
            <PhoneIcon size={16} className="mr-3 text-primary" />
            <a href={`tel:${phone}`} className="text-sm font-body hover:text-primary transition-colors">
              {phone}
            </a>
          </div>
          <div className="flex items-center text-gray-600">
            <MailIcon size={16} className="mr-3 text-primary" />
            <a href={`mailto:${email}`} className="text-sm font-body hover:text-primary transition-colors">
              {email}
            </a>
          </div>
          <div className="flex items-center text-gray-600">
            <GlobeIcon size={16} className="mr-3 text-primary" />
            <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-body hover:text-primary transition-colors">
              {website}
            </a>
          </div>
        </div>
        <button onClick={onViewProfile} className="w-full py-3 bg-white border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-white transition-colors">
          {buttonText}
        </button>
      </div>
    </div>;
};
export default ProfileCard;