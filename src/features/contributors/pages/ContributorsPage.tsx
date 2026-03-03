import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Mail, Linkedin, Globe } from "lucide-react";

interface Contributor {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  email?: string;
  linkedin?: string;
  website?: string;
}

const ContributorsPage: React.FC = () => {
  const contributors: Contributor[] = [
    {
      id: "stephane-niango",
      name: "Dr. Stéphane Niango",
      title: "DigitalQatalyst",
      bio: "Expert in Digital Cognitive Organizations & Strategic Transformation with extensive experience in guiding organizations through complex digital transformations. Specializes in developing DCO strategies that leverage AI and cognitive technologies to create adaptive, intelligent organizations.",
      expertise: [
        "DCO Strategy",
        "Applied AI",
        "Strategic Transformation",
        "Organizational Design",
      ],
      email: "stephane@digitalqatalyst.com",
      linkedin: "https://linkedin.com/in/stephane-niango",
    },
    {
      id: "kaylynn-oceanne",
      name: "Kaylynn Océanne",
      title: "DigitalQatalyst",
      bio: "Content Engagement Strategist specializing in the design of the underlying systems that make content coherent. Focuses on creating frameworks that enhance user experience and drive meaningful engagement through strategic content architecture.",
      expertise: [
        "Experience Design",
        "Human Insights",
        "Content Strategy",
        "User Engagement",
      ],
      email: "kaylynn@digitalqatalyst.com",
      linkedin: "https://linkedin.com/in/kaylynn-oceanne",
    },
    {
      id: "mark-kerry",
      name: "Mark Kerry",
      title: "DigitalQatalyst",
      bio: "Explores leadership, culture, and strategy in driving meaningful organisational transformation. Brings deep insights into how cultural dynamics and leadership approaches shape successful digital transformation initiatives.",
      expertise: [
        "DCO Strategy",
        "Accounts",
        "Leadership Development",
        "Organizational Culture",
      ],
      email: "mark@digitalqatalyst.com",
      linkedin: "https://linkedin.com/in/mark-kerry",
    },
    {
      id: "sharavi-chander",
      name: "Sharavi Chander",
      title: "DigitalQatalyst",
      bio: "Explores frameworks, tools, and mindsets for building scalable and resilient digital solutions. Specializes in solution architecture and digital business platforms that enable organizations to scale effectively.",
      expertise: [
        "Solution Architecture",
        "DBPs",
        "Scalable Systems",
        "Digital Platforms",
      ],
      email: "sharavi@digitalqatalyst.com",
      linkedin: "https://linkedin.com/in/sharavi-chander",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
        <PageContainer>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Contributors
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Meet the expert instructors and thought leaders who bring their
            real-world experience and deep expertise to DTMA courses.
          </p>
        </PageContainer>
      </div>

      {/* Contributors Grid */}
      <PageContainer className="py-16">
        <div className="grid grid-cols-1 gap-8">
          {contributors.map((contributor) => (
            <div
              key={contributor.id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Avatar Placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-4xl font-bold text-primary">
                        {contributor.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {contributor.name}
                    </h2>
                    <p className="text-lg font-semibold text-primary mb-4">
                      {contributor.title}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed mb-6">
                      {contributor.bio}
                    </p>

                    {/* Expertise Tags */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">
                        Areas of Expertise:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {contributor.expertise.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact Links */}
                    <div className="flex flex-wrap gap-4">
                      {contributor.email && (
                        <a
                          href={`mailto:${contributor.email}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                          <Mail size={16} />
                          Email
                        </a>
                      )}
                      {contributor.linkedin && (
                        <a
                          href={contributor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                        >
                          <Linkedin size={16} />
                          LinkedIn
                        </a>
                      )}
                      {contributor.website && (
                        <a
                          href={contributor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                          <Globe size={16} />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default ContributorsPage;
