import React from "react";
import {
  TrendingUp,
  Brain,
  Zap,
  Users,
  Rocket,
  ArrowRight,
  Globe,
} from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { useNavigate } from "react-router-dom";

const FeaturedCourses: React.FC = () => {
  const navigate = useNavigate();

  const courses = [
    {
      icon: TrendingUp,
      title: "Digital Economy",
      description:
        "Understand the dynamics of the digital economy and how to leverage emerging technologies to drive business growth.",
      color: "blue",
      slug: "economy-4-0",
      isCategory: true,
    },
    {
      icon: Globe,
      title: "Digital Business Platforms",
      description:
        "Navigate digital platforms to optimize operations, enhance customer experiences, and drive smarter decision-making.",
      color: "cyan",
      slug: "digital-business-platforms",
    },
    {
      icon: Brain,
      title: "Digital Cognitive Organizations",
      description:
        "Master the design and management of intelligent organizations that use AI and automation to enhance agility and innovation.",
      color: "purple",
      slug: "digital-cognitive-organizations",
    },
    {
      icon: Zap,
      title: "Digital Transformation",
      description:
        "Gain the skills to lead and implement digital transformation strategies in organizations.",
      color: "indigo",
      slug: "digital-transformation",
    },
    {
      icon: Users,
      title: "Digital Workers & Workspaces",
      description:
        "Build and manage a digitally empowered workforce and create flexible, collaborative work environments.",
      color: "teal",
      slug: "digital-workers-workspaces",
    },
    {
      icon: Rocket,
      title: "Digital Accelerators & Tools",
      description:
        "Dive deep into the digital tools and accelerators that drive faster, more efficient transformation processes.",
      color: "orange",
      slug: "digital-accelerators-tools",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { bg: string; icon: string; border: string; hover: string }
    > = {
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        border: "border-blue-200",
        hover: "hover:border-blue-400",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        border: "border-purple-200",
        hover: "hover:border-purple-400",
      },
      indigo: {
        bg: "bg-indigo-50",
        icon: "text-indigo-600",
        border: "border-indigo-200",
        hover: "hover:border-indigo-400",
      },
      teal: {
        bg: "bg-teal-50",
        icon: "text-teal-600",
        border: "border-teal-200",
        hover: "hover:border-teal-400",
      },
      cyan: {
        bg: "bg-cyan-50",
        icon: "text-cyan-600",
        border: "border-cyan-200",
        hover: "hover:border-cyan-400",
      },
      orange: {
        bg: "bg-orange-50",
        icon: "text-orange-600",
        border: "border-orange-200",
        hover: "hover:border-orange-400",
      },
    };
    return colors[color] || colors.blue;
  };

  const handleCourseClick = (slug: string, isCategory?: boolean) => {
    // Navigate to course catalog with category filter or specific course page
    if (isCategory) {
      navigate(`/courses?category=${slug}`);
    } else {
      navigate(`/courses/${slug}`);
    }
  };

  return (
    <PageContainer className="py-16 md:py-20">
      {/* Header Section */}
      <div className="text-center mb-12 md:mb-14">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Featured Courses
        </h2>
        <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          At DTMA, we offer specialized programs designed to equip you with the
          skills to lead the digital transformation journey. Each course focuses
          on a key area shaping today's digital business landscape.
        </p>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => {
            const colors = getColorClasses(course.color);
            const Icon = course.icon;

            return (
              <div
                key={index}
                className={`group relative p-6 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hover} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
                onClick={() =>
                  handleCourseClick(course.slug, course.isCategory)
                }
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-lg ${colors.bg} border-2 ${colors.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {course.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course.slug, course.isCategory);
                    }}
                    className={`flex-1 px-4 py-2 ${colors.icon} bg-white border-2 ${colors.border} rounded-lg font-semibold text-sm hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center gap-2 group/btn`}
                  >
                    Learn More
                    <ArrowRight
                      size={16}
                      className="group-hover/btn:translate-x-1 transition-transform duration-200"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course.slug, course.isCategory);
                    }}
                    className={`flex-1 px-4 py-2 text-white ${course.color === "blue" ? "bg-blue-600 hover:bg-blue-700" : course.color === "cyan" ? "bg-cyan-600 hover:bg-cyan-700" : course.color === "purple" ? "bg-purple-600 hover:bg-purple-700" : course.color === "indigo" ? "bg-indigo-600 hover:bg-indigo-700" : course.color === "teal" ? "bg-teal-600 hover:bg-teal-700" : "bg-orange-600 hover:bg-orange-700"} rounded-lg font-semibold text-sm transition-all duration-200`}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default FeaturedCourses;
