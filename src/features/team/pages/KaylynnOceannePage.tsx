import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const KaylynnOceannePage: React.FC = () => {
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
                  src="/images/People/KO.png"
                  alt="Kaylynn Océanne"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold text-[#030C2B] mb-2">
                  Kaylynn Océanne
                </h1>
                <p className="text-lg text-gray-600 mb-4">Research Advisory</p>
              </div>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Kaylynn Océanne brings extensive research expertise to DTMA's
                  advisory team. Her work focuses on identifying emerging trends
                  in digital transformation and ensuring DTMA's curriculum
                  remains at the forefront of industry innovation. With a
                  background in educational research and technology integration,
                  Kaylynn plays a crucial role in shaping the strategic
                  direction of DTMA's learning programs.
                </p>
              </div>

              <div>
                <p className="text-gray-700 leading-relaxed">
                  Her research-driven approach has helped DTMA develop
                  evidence-based learning methodologies that maximize learner
                  engagement and skill retention. Kaylynn's insights into adult
                  learning principles and digital pedagogy have been
                  instrumental in creating courses that deliver measurable
                  results for digital workers.
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
                      Led research initiatives that shaped DTMA's
                      competency-based learning framework.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Developed assessment methodologies used across DTMA's
                      course portfolio.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Published research on digital transformation education and
                      workforce development.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="/mentors/kaylynn-oceanne"
                  className="inline-block px-6 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#030C2B] transition-all font-semibold"
                >
                  Connect with Kaylynn
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

export default KaylynnOceannePage;
