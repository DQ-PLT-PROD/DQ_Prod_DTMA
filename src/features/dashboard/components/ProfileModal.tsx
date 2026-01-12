// import React from 'react';
// import { XIcon, PhoneIcon, MailIcon, GlobeIcon, MapPinIcon } from 'lucide-react';
// import { useCachedImage } from '../utils/imageCache';
// const ProfileModal = ({
//   isOpen,
//   onClose,
//   profile
// }) => {
//   // Use the cached image hook if we have a profile
//   const {
//     imageUrl,
//     isLoading
//   } = useCachedImage(profile?.logo || '');
//   if (!isOpen || !profile) return null;
//   return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100 flex justify-between items-center">
//           <h2 className="font-display text-2xl font-bold">{profile.name}</h2>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close modal">
//             <XIcon size={20} />
//           </button>
//         </div>
//         <div className="p-6">
//           <div className="flex flex-col md:flex-row gap-8 mb-8">
//             <div className="w-full md:w-1/3 flex flex-col items-center">
//               <div className="w-32 h-32 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-4 shadow-sm">
//                 {isLoading ? <div className="animate-pulse w-24 h-24 bg-gray-200 rounded"></div> : <img src={imageUrl || profile.logo} alt={`${profile.name} logo`} className="w-24 h-24 object-contain" onError={e => {
//                 e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCN0M5MyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
//               }} />}
//               </div>
//               <span className="inline-block px-4 py-1 bg-primary-light bg-opacity-20 text-primary-dark text-sm rounded-full font-body font-medium mb-6">
//                 {profile.category}
//               </span>
//               <div className="space-y-4 w-full">
//                 <div className="flex items-center text-gray-600">
//                   <PhoneIcon size={18} className="mr-3 text-primary" />
//                   <a href={`tel:${profile.phone}`} className="font-body hover:text-primary transition-colors">
//                     {profile.phone}
//                   </a>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <MailIcon size={18} className="mr-3 text-primary" />
//                   <a href={`mailto:${profile.email}`} className="font-body hover:text-primary transition-colors">
//                     {profile.email}
//                   </a>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <GlobeIcon size={18} className="mr-3 text-primary" />
//                   <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="font-body hover:text-primary transition-colors">
//                     {profile.website}
//                   </a>
//                 </div>
//                 {profile.address && <div className="flex items-start text-gray-600">
//                     <MapPinIcon size={18} className="mr-3 text-primary flex-shrink-0 mt-1" />
//                     <span className="font-body">{profile.address}</span>
//                   </div>}
//               </div>
//             </div>
//             <div className="w-full md:w-2/3">
//               <div className="mb-8">
//                 <h3 className="font-display text-xl font-bold mb-3">
//                   About {profile.name}
//                 </h3>
//                 <p className="font-body text-gray-600 leading-relaxed">
//                   {profile.description}
//                 </p>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {profile.founded && <div>
//                     <h4 className="font-display font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">
//                       Established
//                     </h4>
//                     <p className="font-body">{profile.founded}</p>
//                   </div>}
//                 {profile.employees && <div>
//                     <h4 className="font-display font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">
//                       Employees
//                     </h4>
//                     <p className="font-body">{profile.employees}</p>
//                   </div>}
//                 {profile.revenue && <div>
//                     <h4 className="font-display font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">
//                       Annual Revenue
//                     </h4>
//                     <p className="font-body">{profile.revenue}</p>
//                   </div>}
//               </div>
//               {profile.services && <div className="mt-8">
//                   <h3 className="font-display text-xl font-bold mb-3">
//                     Services & Expertise
//                   </h3>
//                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                     {profile.services.map((service, index) => <li key={index} className="font-body text-gray-600 flex items-center">
//                         <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
//                         {service}
//                       </li>)}
//                   </ul>
//                 </div>}
//             </div>
//           </div>
//           <div className="border-t border-gray-100 pt-6 flex justify-end">
//             <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-600 font-body font-medium rounded-lg hover:bg-gray-50 transition-colors mr-4">
//               Close
//             </button>
//             <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary-dark transition-colors">
//               Visit Website
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>;
// };
// export default ProfileModal;


import React from 'react';
import { XIcon, PhoneIcon, MailIcon, GlobeIcon, MapPinIcon } from 'lucide-react';
import { useCachedImage } from '../utils/imageCache';

const ProfileModal = ({ isOpen, onClose, profile }) => {
  const { imageUrl, isLoading } = useCachedImage(profile?.logo || '');

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4">
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-display text-2xl font-bold">{profile.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XIcon size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-32 h-32 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-4 shadow-sm">
                {isLoading ? (
                  <div className="animate-pulse w-24 h-24 bg-gray-200 rounded"></div>
                ) : (
                  <img
                    src={imageUrl || profile.logo}
                    alt={`${profile.name} logo`}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCN0M5MyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                )}
              </div>
              <span className="inline-block px-4 py-1 bg-primary-light bg-opacity-20 text-primary-dark text-sm rounded-full font-body font-medium mb-6">
                {profile.category}
              </span>
              <div className="space-y-4 w-full">
                <div className="flex items-center text-gray-600">
                  <PhoneIcon size={18} className="mr-3 text-primary" />
                  <a href={`tel:${profile.phone}`} className="font-body hover:text-primary transition-colors">
                    {profile.phone}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <MailIcon size={18} className="mr-3 text-primary" />
                  <a href={`mailto:${profile.email}`} className="font-body hover:text-primary transition-colors">
                    {profile.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <GlobeIcon size={18} className="mr-3 text-primary" />
                  <a
                    href={`https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body hover:text-primary transition-colors"
                  >
                    {profile.website}
                  </a>
                </div>
                {profile.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon size={18} className="mr-3 text-primary flex-shrink-0 mt-1" />
                    <span className="font-body">{profile.address}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="mb-8">
                <h3 className="font-display text-xl font-bold mb-3">About {profile.name}</h3>
                <p className="font-body text-gray-600 leading-relaxed">{profile.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.founded && (
                  <div>
                    <h4 className="font-display font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">
                      Established
                    </h4>
                    <p className="font-body">{profile.founded}</p>
                  </div>
                )}
                {profile.employees && (
                  <div>
                    <h4 className="font-display font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">
                      Employees
                    </h4>
                    <p className="font-body">{profile.employees}</p>
                  </div>
                )}
                {profile.revenue && (
                  <div>
                    <h4 className="font-display font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">
                      Annual Revenue
                    </h4>
                    <p className="font-body">{profile.revenue}</p>
                  </div>
                )}
              </div>
              {profile.services && (
                <div className="mt-8">
                  <h3 className="font-display text-xl font-bold mb-3">Services & Expertise</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {profile.services.map((service, index) => (
                      <li key={index} className="font-body text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-600 font-body font-medium rounded-lg hover:bg-gray-50 transition-colors mr-4"
            >
              Close
            </button>
            <a
              href={`https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Visit Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
