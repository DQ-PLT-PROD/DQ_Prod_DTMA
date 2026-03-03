import React from "react";

const TrustedPartners: React.FC = () => {
  // List of partner organizations
  const partners = [
    { name: "MUBADALA", logo: "/images/partners/mubadala-logo.webp" },
    { name: "ADNOC", logo: "/images/partners/adnoc.png" },
    { name: "ADCB", logo: "/images/partners/adcb.png" },
    { name: "Etihad", logo: "/images/partners/etihad-logo.webp" },
    { name: "Masdar", logo: "/images/partners/masdar-logo.webp" },
    { name: "FAB", logo: "/images/partners/fab-logo.webp" },
  ];

  // Duplicate the partners array multiple times for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <div className="py-16 md:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm font-semibold text-gray-500 tracking-widest uppercase">
            Transforming Industry Leaders with DTMA
          </p>
        </div>

        {/* Scrolling logos container */}
        <div className="flex overflow-hidden">
          <div className="flex animate-scroll-left">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 mx-8 md:mx-12 lg:mx-16 flex items-center justify-center"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 md:h-20 lg:h-24 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".fallback-text")) {
                      const span = document.createElement("span");
                      span.className =
                        "fallback-text text-gray-400 font-semibold text-sm whitespace-nowrap";
                      span.textContent = partner.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedPartners;
