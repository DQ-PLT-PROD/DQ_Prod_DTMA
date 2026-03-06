import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const StephenMuemaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageContainer className="py-24">
        <Link
          to="/about"
          className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] mb-8 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to About
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-lg">
                <img
                  src="/images/People/SM.png"
                  alt="Stephen Muema"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold text-[#030C2B] mb-2">
                  Stephen Muema
                </h1>
                <p className="text-lg text-gray-600 mb-4">Executive Advisory</p>
              </div>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Stephen Muema serves as a key executive advisor to DTMA,
                  bringing decades of experience in organizational leadership
                  and digital transformation strategy. His expertise in guiding
                  organizations through complex digital transitions has been
                  invaluable in shaping DTMA's approach to workforce
                  development. Stephen's strategic insights help ensure that
                  DTMA's programs align with real-world business needs and
                  deliver tangible value to organizations.
                </p>
              </div>

              <div>
                <p className="text-gray-700 leading-relaxed">
                  With a proven track record of leading successful digital
                  transformation initiatives across multiple industries, Stephen
                  brings practical wisdom to DTMA's curriculum development. His
                  advisory role focuses on ensuring that digital workers gain
                  not just technical skills, but also the strategic thinking and
                  leadership capabilities needed to drive organizational change.
                </p>
              </div>

              <div className="pt-4">
                <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                  Key Achievements
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Advised on strategic partnerships that expanded DTMA's
                      global reach.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Contributed to the development of DTMA's executive
                      leadership programs.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Recognized as a thought leader in digital transformation
                      and organizational change management.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="/mentors/stephen-muema"
                  className="inline-block px-6 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#030C2B] transition-all font-semibold"
                >
                  Connect with Stephen
                </a>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default StephenMuemaPage;
