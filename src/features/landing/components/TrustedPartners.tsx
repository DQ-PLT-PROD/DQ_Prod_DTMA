import React from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

const partners = [
  { name: "ADNOC", logo: "/logo/partners/logo/adnoc.png" },
  { name: "Mubadala", logo: "/logo/partners/logo/mubadala-logo.webp" },
  { name: "Etihad", logo: "/logo/partners/logo/etihad-logo.webp" },
  { name: "ADCB", logo: "/logo/partners/logo/adcb.png" },
  { name: "FAB", logo: "/logo/partners/logo/fab-logo.webp" },
  { name: "ADIB", logo: "/logo/partners/logo/adib-logo.webp" },
  { name: "Etisalat", logo: "/logo/partners/logo/etisalat-logo.webp" },
  { name: "Aldar", logo: "/logo/partners/logo/aldar-logo.webp" },
  { name: "Masdar", logo: "/logo/partners/logo/masdar-logo.webp" },
  { name: "ADQ", logo: "/logo/partners/logo/adq-logo.webp" },
  { name: "Hub71", logo: "/logo/partners/logo/hub71.png" },
  { name: "ADGM", logo: "/logo/partners/logo/adgm.png" },
  { name: "ADIA", logo: "/logo/partners/logo/adia.png" },
  { name: "Khalifa Fund", logo: "/logo/partners/logo/KhalifaFund_Logo_Dark Blue_RGB.png" },
  { name: "TII", logo: "/logo/partners/logo/tii-logo.webp" },
  { name: "NYU", logo: "/logo/partners/logo/nyu.png" },
  { name: "Cleveland Clinic", logo: "/logo/partners/logo/cleveland.png" },
  { name: "Ferrari", logo: "/logo/partners/logo/ferari.png" },
  { name: "Louvre", logo: "/logo/partners/logo/louvre.png" },
  { name: "Emirates Palace", logo: "/logo/partners/logo/palace.png" },
  { name: "Yas", logo: "/logo/partners/logo/yas.png" },
  { name: "twofour54", logo: "/logo/partners/logo/twofour54.png" },
  { name: "AD Ports", logo: "/logo/partners/logo/ad-ports-logo.webp" },
  { name: "EDB", logo: "/logo/partners/logo/edb-logo.webp" },
  { name: "Aspire", logo: "/logo/partners/logo/aspire-logo.webp" },
  { name: "Venture One", logo: "/logo/partners/logo/venture-one-logo.webp" },
];

const TrustedPartners = () => {
  const duplicatedPartners = [...partners, ...partners];

  return (
    <div className="w-full bg-gray-50 py-12 overflow-hidden">
      <PageContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#030C2B] mb-2">
            Trusted by Industry Leaders
          </h2>
          <p className="text-gray-600">
            Organizations worldwide trust our expertise in digital transformation
          </p>
        </div>
      </PageContainer>

      <div className="relative">
        <div className="flex animate-scroll">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={partner.name + index}
              className="flex-shrink-0 mx-6 flex items-center justify-center bg-white rounded-lg shadow-sm p-4"
              style={{ width: "180px", height: "100px" }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          width: fit-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TrustedPartners;

