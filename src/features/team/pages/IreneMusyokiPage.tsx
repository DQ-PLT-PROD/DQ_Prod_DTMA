import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const IreneMusyokiPage: React.FC = () => {
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
                  src="/images/People/IM.png"
                  alt="Irene Musyoki"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold text-[#030C2B] mb-2">
                  Irene Musyoki
                </h1>
                <p className="text-lg text-gray-600 mb-4">DCO | Operations</p>
              </div>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Irene Musyoki leads DTMA's operational excellence as the
                  Digital Chief Operations Officer. With her exceptional
                  organizational skills and deep understanding of digital
                  learning platforms, Irene ensures that DTMA's day-to-day
                  operations run smoothly and efficiently. Her focus on process
                  optimization and learner experience has been crucial in
                  scaling DTMA's operations while maintaining the high quality
                  standards that define the academy.
                </p>
              </div>

              <div>
                <p className="text-gray-700 leading-relaxed">
                  Under Irene's leadership, DTMA has implemented streamlined
                  systems that enhance both the learner journey and instructor
                  effectiveness. Her commitment to operational excellence
                  ensures that digital workers receive seamless support
                  throughout their learning experience, from enrollment to
                  certification. Irene's innovative approach to operations
                  management has positioned DTMA as a leader in digital
                  education delivery.
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
                      Implemented operational systems that support over 4000
                      active learners.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Developed quality assurance frameworks that maintain
                      DTMA's high educational standards.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Led digital transformation initiatives that improved
                      operational efficiency by 40%.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="/mentors/irene-musyoki"
                  className="inline-block px-6 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#030C2B] transition-all font-semibold"
                >
                  Connect with Irene
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

export default IreneMusyokiPage;
