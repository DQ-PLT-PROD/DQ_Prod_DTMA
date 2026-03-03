import React from "react";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { useNavigate } from "react-router-dom";

const ExpertInstructors: React.FC = () => {
  const navigate = useNavigate();

  const instructors = [
    {
      name: "Dr. Stéphane Niango",
      title: "DigitalQatalyst",
      expertise:
        "Expert in Digital Cognitive Organizations & Strategic Transformation",
      specialties: ["DCO Strategy", "Applied AI"],
    },
    {
      name: "Kaylynn Océanne",
      title: "DigitalQatalyst",
      expertise:
        "Content Engagement Strategist specializing in the design of the underlying systems that make content coherent.",
      specialties: ["Experience Design", "Human Insights"],
    },
    {
      name: "Mark Kerry",
      title: "DigitalQatalyst",
      expertise:
        "Explores leadership, culture, and strategy in driving meaningful organisational transformation.",
      specialties: ["DCO Strategy", "Accounts"],
    },
    {
      name: "Sharavi Chander",
      title: "DigitalQatalyst",
      expertise:
        "Explores frameworks, tools, and mindsets for building scalable and resilient digital solutions.",
      specialties: ["Solution Architecture", "DBPs"],
    },
  ];

  const handleViewAllInstructors = () => {
    // Navigate to contributors marketplace
    navigate("/contributors");
  };

  return (
    <PageContainer className="py-12 md:py-16">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Meet Our Expert Instructors
        </h2>
        <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
          Discover the minds shaping the next generation of digital leaders. Our
          instructors are experienced professionals who bring real-world
          expertise and a wealth of knowledge to every course.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleViewAllInstructors}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-full shadow-lg hover:bg-primary-dark transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
          >
            View All Instructors
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ExpertInstructors;
