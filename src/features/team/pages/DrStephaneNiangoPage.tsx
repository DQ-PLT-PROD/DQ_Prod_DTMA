import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const DrStephaneNiangoPage: React.FC = () => {
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
                  src="/images/People/S.N.png"
                  alt="Dr. Stéphane Niango"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold text-[#030C2B] mb-2">
                  Dr. Stéphane Niango
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  CEO | Research Office
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Dr. Stéphane Niango, with over 15 years of leadership
                  experience in digital transformation, is a thought leader and
                  the driving force behind DTMA's strategic vision. Under his
                  leadership, DTMA has grown from a concept to a leading academy
                  in digital workforce education. His passion for bridging the
                  gap between technology and education has led to successful
                  partnerships with global tech giants, creating opportunities
                  for digital workers to excel.
                </p>
              </div>

              <div>
                <p className="text-gray-700 leading-relaxed">
                  Dr. Niango has been featured as a keynote speaker at multiple
                  international conferences, where his vision for digital
                  transformation in education is shaping the future of workforce
                  training.
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
                      Led partnerships with leading companies to create a
                      cutting-edge learning platform.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Developed the curriculum that is now helping over 4000
                      digital workers achieve career milestones.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#1839AD] mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      Featured in industry publications for his contributions to
                      digital workforce development.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="/mentors/dr-stephane-niango"
                  className="inline-block px-6 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#030C2B] transition-all font-semibold"
                >
                  Connect with Dr. Niango
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

export default DrStephaneNiangoPage;
