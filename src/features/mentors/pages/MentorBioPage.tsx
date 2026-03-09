import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Globe, Linkedin, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { getMentorBySlug } from "../data/mentorsData";

const MentorBioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const mentor = slug ? getMentorBySlug(slug) : undefined;

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header transparent={false} />
        <main className="pt-24 pb-16">
          <PageContainer>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Contributor Not Found
              </h1>
              <button
                onClick={() => navigate("/mentors")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Contributors
              </button>
            </div>
          </PageContainer>
        </main>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header transparent={false} />

      <main className="pt-24 pb-16">
        <PageContainer>
          {/* Back Button */}
          <button
            onClick={() => navigate("/mentors")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {mentor.profileImage ? (
                  <img
                    src={mentor.profileImage}
                    alt={mentor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-[#030C2B] mb-2">
                  {mentor.name}
                </h1>
                <p className="text-lg text-gray-600 mb-2">{mentor.title}</p>
                {mentor.tagline && (
                  <p className="text-base text-gray-500 italic mb-4">
                    "{mentor.tagline}"
                  </p>
                )}

                {/* Location */}
                {mentor.location && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Globe className="w-4 h-4" />
                    <span>{mentor.location}</span>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {mentor.linkedIn && (
                    <a
                      href={mentor.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-gray-600" />
                    </a>
                  )}
                  {mentor.website && (
                    <a
                      href={mentor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    >
                      <Globe className="w-4 h-4 text-gray-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          {mentor.professionalSummary && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.professionalSummary}
              </p>
            </section>
          )}

          {/* Thought Leadership */}
          {mentor.thoughtLeadership && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Thought Leadership
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.thoughtLeadership}
              </p>
            </section>
          )}

          {/* Key Achievements */}
          {mentor.keyAchievements && mentor.keyAchievements.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Key Achievements
              </h2>
              <ul className="space-y-3">
                {mentor.keyAchievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed">
                      {achievement}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education & Certifications */}
          {mentor.education && mentor.education.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Education & Certifications
              </h2>
              <ul className="space-y-3">
                {mentor.education.map((edu, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed">{edu}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Specialization */}
          {mentor.specialization && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Specialization & Expertise
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.specialization}
              </p>
            </section>
          )}

          {/* Mentorship Approach */}
          {mentor.mentorshipApproach && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Mentorship Approach
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.mentorshipApproach}
              </p>
            </section>
          )}

          {/* Notable Projects */}
          {mentor.notableProjects && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Notable Projects & Clients
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.notableProjects}
              </p>
            </section>
          )}

          {/* Speaking Engagements */}
          {mentor.speakingEngagements &&
            mentor.speakingEngagements.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                  Speaking Engagements & Publications
                </h2>
                <ul className="space-y-3">
                  {mentor.speakingEngagements.map((engagement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700 leading-relaxed">
                        {engagement}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {/* Academic Background */}
          {mentor.academicBackground && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Academic Background & Research Contributions
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.academicBackground}
              </p>
            </section>
          )}

          {/* Industry Contributions */}
          {mentor.industryContributions && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
                Notable Industry Contributions & Leadership
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.industryContributions}
              </p>
            </section>
          )}

          {/* Key Areas of Expertise */}
          {mentor.keyAreasOfExpertise &&
            mentor.keyAreasOfExpertise.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-[#030C2B] mb-6">
                  Key Areas of Expertise
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentor.keyAreasOfExpertise.map((area, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {area.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {area.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Expertise Tags */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#030C2B] mb-4">
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((exp, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {exp}
                </span>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          {mentor.testimonials && mentor.testimonials.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#030C2B] mb-6">
                What Mentees Say
              </h2>
              <div className="space-y-6">
                {mentor.testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-600 pl-6 py-2"
                  >
                    <p className="text-gray-700 italic mb-3">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Learn from {mentor.name.split(" ")[0]}?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join our Digital Transformation Management Academy and gain access
              to expert mentorship
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-3 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors font-semibold shadow-lg inline-flex items-center gap-2"
            >
              Explore Our Programs
              <ArrowRight className="w-5 h-5" />
            </button>
          </section>
        </PageContainer>
      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default MentorBioPage;
