import React from "react";
import { BookOpen, Clock, Users, Award, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { useNavigate } from "react-router-dom";

const WhyChooseUs: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: BookOpen,
      title: "Industry-Relevant Curriculum",
      description:
        "Learn through real-world case studies and the latest industry practices, ensuring you gain practical skills that are immediately applicable.",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Flexible Learning Paths",
      description:
        "Choose from a variety of flexible learning options designed to fit your schedule, allowing you to learn at your own pace.",
      color: "purple",
    },
    {
      icon: Users,
      title: "Expert Mentors & Networking Opportunities",
      description:
        "Gain direct access to industry experts and a network of peers, ensuring support and guidance throughout your learning journey.",
      color: "teal",
    },
    {
      icon: Award,
      title: "Global Certification",
      description:
        "Earn globally recognized certification, enhancing your credibility and unlocking career opportunities in digital transformation.",
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> =
      {
        blue: {
          bg: "bg-blue-50",
          icon: "text-blue-600",
          border: "border-blue-200",
        },
        purple: {
          bg: "bg-purple-50",
          icon: "text-purple-600",
          border: "border-purple-200",
        },
        teal: {
          bg: "bg-teal-50",
          icon: "text-teal-600",
          border: "border-teal-200",
        },
        orange: {
          bg: "bg-orange-50",
          icon: "text-orange-600",
          border: "border-orange-200",
        },
      };
    return colors[color] || colors.blue;
  };

  const handleLearnMore = () => {
    // Navigate to about page or courses
    navigate("/courses");
  };

  return (
    <PageContainer className="py-16 md:py-20">
      {/* Header Section */}
      <div className="text-center mb-12 md:mb-14">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Why Choose Us?
        </h2>
        <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          At DTMA, we focus on delivering industry-leading programs designed to
          equip you with the skills and knowledge to succeed in the digital age.
          Here's why DTMA stands out:
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const colors = getColorClasses(benefit.color);
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className={`group p-6 rounded-xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-lg ${colors.bg} border-2 ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <button
          onClick={handleLearnMore}
          className="px-8 py-4 bg-primary text-white font-semibold text-lg rounded-full shadow-lg hover:bg-primary-dark transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
        >
          Learn More
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </button>
      </div>
    </PageContainer>
  );
};

export default WhyChooseUs;
