import React from 'react';
import { PhoneIcon, MailIcon, GlobeIcon } from 'lucide-react';
import { useCachedImage } from '../utils/imageCache';
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
  // Use the cached image hook
  const {
    imageUrl,
    isLoading
  } = useCachedImage(logo);
  return <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mr-5 shadow-sm">
            {isLoading ? <div className="animate-pulse w-12 h-12 bg-gray-200 rounded"></div> : <img src={imageUrl || logo} alt={`${name} logo`} className="w-12 h-12 object-contain" onError={e => {
            // Fallback for any runtime errors
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCN0M5MyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
          }} />}
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
