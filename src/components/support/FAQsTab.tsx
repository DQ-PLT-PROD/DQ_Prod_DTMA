import React, { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  ExternalLinkIcon,
} from "lucide-react";
// GraphQL query for FAQs (would be used with an actual GraphQL client)
const FAQ_QUERY = `
  query GetFAQs {
    faqCategories {
      id
      title
      questions {
        id
        question
        answer
      }
    }
  }
`;
// Initial data before fetching from GraphQL
const initialFaqCategories = [
  {
    id: "general",
    title: "General Questions",
    questions: [
      {
        id: "q1",
        question: "How do I reset my password?",
        answer:
          'To reset your password, click on the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password. Follow the link in the email and create a new password.',
      },
      {
        id: "q2",
        question: "How can I update my profile information?",
        answer:
          'You can update your profile information by navigating to the Settings page and selecting the "Profile" tab. From there, you can edit your personal information, contact details, and preferences.',
      },
    ],
  },
  {
    id: "account",
    title: "Account Management",
    questions: [
      {
        id: "q4",
        question: "How do I add a new user to my organization?",
        answer:
          'To add a new user, go to the Settings page and select the "Users & Roles" tab. Click on the "Invite New User" button, fill in their details, and assign them an appropriate role. They will receive an email invitation to join.',
      },
      {
        id: "q5",
        question: "Can I change my username or email address?",
        answer:
          "You can change your email address in your profile settings. However, usernames cannot be changed once created. If you need a different username, please contact our support team for assistance.",
      },
    ],
  },
];
export default function FAQsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [faqCategories, setFaqCategories] = useState(initialFaqCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Function to fetch FAQs from GraphQL endpoint
    const fetchFAQs = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, you would use a GraphQL client like Apollo
        // This is a simplified example using fetch
        const response = await fetch(
          "https://your-graphql-endpoint.com/graphql",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: FAQ_QUERY,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        // If the fetch was successful, update the state with the fetched data
        if (data && data.data && data.data.faqCategories) {
          setFaqCategories(data.data.faqCategories);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setError("Failed to load FAQs. Using default data instead.");
        // Keep using the initial data if there's an error
      } finally {
        setLoading(false);
      }
    };
    // Comment out actual fetch for demo purposes
    // fetchFAQs()
    // For demo, we'll just simulate a loading state
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };
  const filteredCategories = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.questions.length > 0)
    : faqCategories;
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search frequently asked questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
     
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {/* FAQ Categories */}
      {!loading && filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-md overflow-hidden"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900 p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                {category.title}
              </h3>
              <div className="divide-y divide-gray-200">
                {category.questions.map((question) => (
                  <div key={question.id} className="p-3 sm:p-4">
                    <button
                      className="flex justify-between items-center w-full text-left group"
                      onClick={() => toggleQuestion(question.id)}
                      aria-expanded={
                        expandedQuestions[question.id] ? "true" : "false"
                      }
                    >
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 pr-2 group-hover:text-blue-600">
                        {question.question}
                      </h4>
                      {expandedQuestions[question.id] ? (
                        <ChevronUpIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    <div
                      className={`mt-2 text-xs sm:text-sm text-gray-600 overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedQuestions[question.id]
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p>{question.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8 sm:py-10">
            <p className="text-gray-500 text-base sm:text-lg">
              No FAQs match your search criteria.
            </p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Try using different keywords or browse all categories.
            </p>
            <button
              className="mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          </div>
        )
      )}
      {/* Still Need Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 mt-4 sm:mt-6">
        <h3 className="text-base sm:text-lg font-medium text-blue-800">
          Still need help?
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-blue-700">
          If you couldn't find the answer you were looking for, please contact
          our support team.
        </p>
        </div>
    </div>
  );
}
