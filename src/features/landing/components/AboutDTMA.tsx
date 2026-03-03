import React from "react";
import { Globe, Brain, Users, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";

const AboutDTMA: React.FC = () => {
  const focusAreas = [
    {
      icon: Globe,
      title: "Digital Business Platforms (DBP)",
      description:
        "Navigate digital platforms to optimize operations and enhance decision-making.",
      color: "blue",
    },
    {
      icon: Brain,
      title: "Digital Cognitive Organizations (DCOs)",
      description:
        "Leverage AI, data, and automation to build agile and innovative organizations.",
      color: "purple",
    },
    {
      icon: Users,
      title: "Digital Workers & Workspaces",
      description:
        "Empower digital workforces and create collaborative, efficient environments.",
      color: "teal",
    },
    {
      icon: Sparkles,
      title: "Emerging Technologies",
      description:
        "Master AI, Machine Learning, IoT, and Blockchain to stay ahead of the curve.",
      color: "indigo",
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
        indigo: {
          bg: "bg-indigo-50",
          icon: "text-indigo-600",
          border: "border-indigo-200",
        },
      };
    return colors[color] || colors.blue;
  };

  const scrollToCategories = () => {
    const el = document.getElementById("d6-categories");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PageContainer className="py-16 md:py-20">
      {/* Header Section */}
      <div className="text-center mb-12 md:mb-14">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          About DTMA
        </h2>
        <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          DTMA equips professionals with the skills to lead digital
          transformation and drive change in today's interconnected world.
        </p>
      </div>

      {/* Focus Areas Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {focusAreas.map((area, index) => {
            const colors = getColorClasses(area.color);
            const Icon = area.icon;

            return (
              <div
                key={index}
                className={`group p-6 rounded-xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {area.title}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default AboutDTMA;
