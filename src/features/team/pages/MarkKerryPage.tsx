import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MarkKerryPage: React.FC = () => {
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
                  src="/images/People/MK-Avatar.png"
                  alt="Mark Kerry"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold text-[#030C2B] mb-2">
                  Mark Kerry
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  EVP | Accounts Office
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Mark Kerry is the financial strategist behind DTMA's success.
                  With his expertise in financial management, he ensures DTMA
                  can scale its operations while providing top-tier digital
                  training to workers. His work has driven DTMA's ability to
                  expand without compromising on the quality of education
                  provided. Mark's deep understanding of both business and
                  education sectors has been instrumental in aligning DTMA's
                  growth with market needs.
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
                      Instrumental in raising significant funding for DTMA's
                      expansion.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Developed strategic financial models that allowed DTMA to
                      expand to multiple regions.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Featured in industry journals for innovations in
                      educational financial strategies.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="/mentors/mark-kerry"
                  className="inline-block px-6 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#030C2B] transition-all font-semibold"
                >
                  Connect with Mark
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

export default MarkKerryPage;
