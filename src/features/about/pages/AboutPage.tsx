import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import {
  MessageCircle,
  Users,
  CheckCircle,
  User,
  Award,
  Clock,
  BarChart3,
  GraduationCap,
  Globe,
} from "lucide-react";

const AboutPage: React.FC = () => {
  const handleWhatsAppClick = () => {
    // Replace with your actual WhatsApp number
    window.open("https://wa.me/1234567890", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - Our Story */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/images/about/pattern-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "bottom",
          }}
        />

        <PageContainer className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-[#030C2B] mb-6">
                Our Story
              </h1>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Founded in 2015, DTMA (Digital Transformation Management
                  Academy) was established to bridge the digital skills gap by
                  leveraging the expertise of DigitalQatalyst (DQ). We offer
                  world-class training designed to empower digital workers with
                  the skills needed to thrive in a rapidly changing business
                  landscape.
                </p>

                <p>
                  Starting with a strong foundation built on DQ's deep industry
                  knowledge, DTMA has grown to offer cutting-edge courses in
                  areas such as AI, Digital Strategy, Data Analytics, and
                  Digital Leadership.
                </p>

                <p>
                  At DTMA, we are committed to transforming the workforce
                  through hands-on, industry-aligned education, enabling
                  professionals to drive digital transformation within their
                  organizations. By utilizing the expertise of DQ, we are
                  shaping the future of digital business and technology leaders
                  worldwide.
                </p>
              </div>

              {/* WhatsApp CTA */}
              <div className="pt-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#030C2B] transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Got any Questions? Chat with us
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/about/learning-environment.jpg"
                  alt="Professional learning environment with diverse students"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop";
                  }}
                />
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#1839AD] opacity-20 rounded-full blur-3xl" />
            </div>
          </div>
        </PageContainer>

        {/* Bottom Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="url(#wave-gradient)"
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="0">
                <stop offset="0%" stopColor="#1839AD" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#2B4EC2" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4A6FD7" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* What Makes DTMA Different Section */}
      <section className="py-16 bg-white">
        <PageContainer>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] mb-4">
              What Makes DTMA Different
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering digital workers with industry-aligned skills and
              practical competencies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Industry-Driven Curriculum */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src="/images/about/industry-curriculum.jpg"
                  alt="Industry-Aligned Curriculum"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                  Industry-Driven Curriculum
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  DTMA offers courses directly aligned with digital workforce
                  needs. Our curriculum equips workers with relevant, up-to-date
                  skills to excel in digital transformation roles.
                </p>
              </div>
            </div>

            {/* Card 2: Hands-On Learning */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src="/images/about/hands-on-learning.jpg"
                  alt="Project-Based Learning"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                  Hands-On Learning
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  DTMA provides digital workers with practical, real-world
                  applications. Our courses emphasize learning by doing,
                  enabling workers to apply skills immediately in the workplace.
                </p>
              </div>
            </div>

            {/* Card 3: Expert Mentorship */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src="/images/about/expert-mentorship.jpg"
                  alt="Career Services & Job Placement Support"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                  Expert Mentorship
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  DTMA offers expert mentorship from industry professionals to
                  digital workers. This guidance ensures workers gain the
                  competencies needed to succeed in digital transformation
                  roles.
                </p>
              </div>
            </div>

            {/* Card 4: Competency-Based Learning */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src="/images/about/competency-based.jpg"
                  alt="Competency-Based Learning"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                  Competency-Based Learning
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  DTMA develops core competencies required for digital workers.
                  Our courses help workers gain in-demand skills essential for
                  navigating the digital economy and leading transformation
                  efforts.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Vision, Mission & Core Values Section */}
      <section className="py-16 bg-gray-50">
        <PageContainer>
          {/* Vision and Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto items-start">
            {/* Our Vision */}
            <div className="text-center flex flex-col">
              <h2 className="text-3xl font-bold text-[#030C2B] mb-4">
                Our Vision
              </h2>
              <h3 className="text-xl font-semibold text-[#030C2B] mb-4">
                A world in which anyone can create their future
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                To empower digital workers with the skills they need to drive
                successful transformations within their organizations. By
                equipping professionals with industry-relevant competencies, we
                aim to shape the future of digital business and technology
                leadership.
              </p>
            </div>

            {/* Our Mission */}
            <div className="text-center flex flex-col">
              <h2 className="text-3xl font-bold text-[#030C2B] mb-4">
                Our Mission
              </h2>
              <h3 className="text-xl font-semibold text-[#030C2B] mb-4">
                To develop the tech talent the world needs
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                We provide industry-aligned education that develops the next
                generation of digital transformation leaders. Through practical,
                hands-on learning and expert mentorship, we equip digital
                workers to lead their organizations through the challenges of
                the digital age.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Collaboration */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-[#1839AD] rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                Collaboration
              </h3>
              <p className="text-gray-600 text-sm">
                Working together to achieve shared goals and drive innovation
              </p>
            </div>

            {/* Accountability */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-[#1839AD] rounded-full flex items-center justify-center">
                  <CheckCircle
                    className="w-12 h-12 text-white"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                Accountability
              </h3>
              <p className="text-gray-600 text-sm">
                Taking ownership of our actions and delivering on our
                commitments
              </p>
            </div>

            {/* Customer Centric */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-[#1839AD] rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                Customer Centric
              </h3>
              <p className="text-gray-600 text-sm">
                Putting our learners first and ensuring their success is our
                priority
              </p>
            </div>

            {/* Excellence */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-[#1839AD] rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#030C2B] mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 text-sm">
                Striving for the highest standards in everything we do
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Why Choose DTMA Section */}
      <section className="py-16 bg-white">
        <PageContainer>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] mb-4">
              Why Choose DTMA?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 15+ Years of Expertise */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <Clock
                    className="w-24 h-24 text-[#1839AD]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#030C2B] px-4">
                15+ Years of Digital Transformation Expertise
              </h3>
            </div>

            {/* Proven Track Record */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <BarChart3
                    className="w-24 h-24 text-[#1839AD]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#030C2B] px-4">
                Proven Track Record of Success
              </h3>
            </div>

            {/* Industry-Aligned Curriculum */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <GraduationCap
                    className="w-24 h-24 text-[#1839AD]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#030C2B] px-4">
                Industry-Aligned Curriculum
              </h3>
            </div>

            {/* Global Reach & Expert Mentorship */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <Globe
                    className="w-24 h-24 text-[#1839AD]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#030C2B] px-4">
                Global Reach & Expert Mentorship
              </h3>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 bg-gray-50">
        <PageContainer>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our success is driven by a passionate team of industry experts and
              professionals committed to transforming digital education. With
              expertise in technology, education, and business, our team ensures
              digital workers receive top-tier training and mentorship. Get to
              know the leaders, mentors, and innovators shaping the future of
              digital talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dr. Stephane Niango */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src="/images/People/S.N.png?v=4"
                  alt="Dr. Stephane Niango"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#030C2B] mb-2">
                  Dr. Stéphane Niango
                </h3>
                <p className="text-gray-600 mb-4">CEO | Research Office</p>
                <a
                  href="/team/dr-stephane-niango"
                  className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] font-semibold transition-colors"
                >
                  See Full Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Mark Kerry */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src="/images/People/MK-Avatar.png?v=5"
                  alt="Mark Kerry"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#030C2B] mb-2">
                  Mark Kerry
                </h3>
                <p className="text-gray-600 mb-4">EVP | Accounts Office</p>
                <a
                  href="/team/mark-kerry"
                  className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] font-semibold transition-colors"
                >
                  See Full Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Bilal Waqar */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src="/images/People/BW.svg?v=4"
                  alt="Bilal Waqar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#030C2B] mb-2">
                  Bilal Waqar
                </h3>
                <p className="text-gray-600 mb-4">DBP | Designs Office</p>
                <a
                  href="/team/bilal-waqar"
                  className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] font-semibold transition-colors"
                >
                  See Full Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Kaylynn Oceanne */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src="/images/People/KO.png?v=4"
                  alt="Kaylynn Oceanne"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#030C2B] mb-2">
                  Kaylynn Océanne
                </h3>
                <p className="text-gray-600 mb-4">Research Advisory</p>
                <a
                  href="/team/kaylynn-oceanne"
                  className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] font-semibold transition-colors"
                >
                  See Full Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Stephen Muema */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src="/images/People/SM.png?v=4"
                  alt="Stephen Muema"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#030C2B] mb-2">
                  Stephen Muema
                </h3>
                <p className="text-gray-600 mb-4">Executive Advisory</p>
                <a
                  href="/team/stephen-muema"
                  className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] font-semibold transition-colors"
                >
                  See Full Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Irene Musyoki */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src="/images/People/IM.png?v=4"
                  alt="Irene Musyoki"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#030C2B] mb-2">
                  Irene Musyoki
                </h3>
                <p className="text-gray-600 mb-4">DCO | Operations</p>
                <a
                  href="/team/irene-musyoki"
                  className="inline-flex items-center text-[#1839AD] hover:text-[#030C2B] font-semibold transition-colors"
                >
                  See Full Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Join Us Section */}
      <section className="py-16 bg-white">
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] mb-6">
              Join Us
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Are you ready to take the next step in your career? DTMA empowers
              digital workers to enhance their skills and become leaders in the
              digital transformation space. With our industry-aligned courses
              and expert mentorship, you'll gain the knowledge and hands-on
              experience you need to drive change in your organization.
            </p>
            <div className="mt-8">
              <a
                href="/"
                className="inline-block px-8 py-4 bg-[#1839AD] text-white text-lg font-semibold rounded-full hover:bg-[#030C2B] transition-all shadow-lg hover:shadow-xl"
              >
                Start Your Digital Transformation Journey Today!
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Help us build the workforce of tomorrow
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Additional sections can be added here */}

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default AboutPage;
