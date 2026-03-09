import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import { Mentor } from "../types/mentor";

interface MentorCardProps {
  mentor: Mentor;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/mentors/${mentor.slug}`);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Header with Avatar and Info */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {mentor.profileImage ? (
            <img
              src={mentor.profileImage}
              alt={mentor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Name and Organization */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            {mentor.name}
          </h3>
          <p className="text-sm text-gray-500">{mentor.organization}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
        {mentor.bio}
      </p>

      {/* Expertise Tags */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">Expertise:</p>
        <p className="text-sm text-gray-600">{mentor.expertise.join(", ")}</p>
      </div>

      {/* Content Author Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider rounded-md">
          Content Author
        </span>
      </div>

      {/* CTA */}
      <button
        className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors group-hover:gap-3"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        Read Contributor Bio
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
