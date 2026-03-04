import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageContainer } from "@/components/layouts/PageContainer";
import { MentorCard } from "../components/MentorCard";
import { getMentors } from "../data/mentorsData";
import { Mentor } from "../types/mentor";

const MentorsPage: React.FC = () => {
  const [mentors] = useState<Mentor[]>(getMentors());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === "" ||
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header transparent={false} />

      <main className="pt-24 pb-16">
        <PageContainer>
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#030C2B] mb-4">
              Meet Our Expert Contributors
            </h1>
            <p className="text-lg text-gray-600">
              Learn from industry leaders with decades of real-world digital
              transformation experience
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search by name, expertise, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredMentors.length} of {mentors.length} contributors
            </p>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>

          {/* Empty State */}
          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No contributors found matching your search.
              </p>
            </div>
          )}
        </PageContainer>
      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default MentorsPage;
