/**
 * Intent Registry for AI Widget (Dev D - Feature D3)
 *
 * Rule-based intent matching system for DTMA chat widget
 * Maps user input patterns to predefined responses and actions
 *
 * @see docs/DTMA_Jan29_DevD_Feature_Specs.md
 */

export interface IntentAction {
  type: "navigate" | "scroll" | "modal" | "none";
  target?: string;
  data?: any;
}

export interface IntentResponse {
  id: string;
  patterns: string[];
  response: string;
  action?: IntentAction;
  category: "general" | "courses" | "navigation" | "support";
  keywords: string[];
}

/**
 * Intent Registry - Add new intents here
 * Patterns are matched case-insensitively and support partial matching
 */
export const intentRegistry: IntentResponse[] = [
  // General DTMA Information
  {
    id: "what-is-dtma",
    patterns: [
      "what is dtma",
      "what is this platform",
      "tell me about dtma",
      "what does dtma do",
      "dtma overview",
      "about dtma",
    ],
    response: `DTMA (Digital Transformation Management Academy) is your comprehensive learning platform for Economy 4.0 skills. We offer practical, bite-sized courses on Digital Organizations, Transformation, and Future Design to help professionals thrive in the digital age.`,
    category: "general",
    keywords: ["dtma", "platform", "about", "what", "overview"],
  },

  // Course Discovery
  {
    id: "leadership-courses",
    patterns: [
      "leadership courses",
      "show me leadership",
      "leadership training",
      "management courses",
      "leader development",
    ],
    response: `Here are our leadership courses designed for digital leaders. I'll take you to our leadership catalog where you can explore courses on digital leadership, team management, and strategic thinking.`,
    action: {
      type: "navigate",
      target: "/courses?category=leadership",
    },
    category: "courses",
    keywords: ["leadership", "management", "leader", "courses"],
  },

  {
    id: "technology-courses",
    patterns: [
      "technology courses",
      "tech courses",
      "digital transformation",
      "show me tech",
      "technology training",
    ],
    response: `Explore our technology and digital transformation courses. These cover emerging technologies, digital tools, and transformation strategies for modern organizations.`,
    action: {
      type: "navigate",
      target: "/courses?category=technology",
    },
    category: "courses",
    keywords: ["technology", "tech", "digital", "transformation", "courses"],
  },

  {
    id: "beginner-courses",
    patterns: [
      "beginner courses",
      "courses for beginners",
      "easy courses",
      "starter courses",
      "basic level",
    ],
    response: `Perfect for getting started! Here are our beginner-friendly courses designed for those new to digital transformation and modern business practices.`,
    action: {
      type: "navigate",
      target: "/courses?level=beginner",
    },
    category: "courses",
    keywords: ["beginner", "basic", "starter", "easy", "courses"],
  },

  // Course Management
  {
    id: "save-course",
    patterns: [
      "how do i save a course",
      "bookmark course",
      "save for later",
      "how to bookmark",
      "save course",
    ],
    response: `To save a course for later, simply click the bookmark icon (📖) on any course card or the "Save" button on the course details page. Your saved courses will be stored locally and you can access them anytime. Note: You need to be signed in to save courses.`,
    category: "courses",
    keywords: ["save", "bookmark", "later", "course"],
  },

  {
    id: "my-progress",
    patterns: [
      "my progress",
      "show my courses",
      "courses in progress",
      "what am i learning",
      "my learning",
    ],
    response: `Let me take you to your learning dashboard where you can see all your enrolled courses, track your progress, and continue where you left off.`,
    action: {
      type: "navigate",
      target: "/portal/my-courses/in-progress",
    },
    category: "navigation",
    keywords: ["progress", "my", "learning", "courses", "dashboard"],
  },

  // Enrollment & Getting Started
  {
    id: "how-to-enroll",
    patterns: [
      "how do i enroll",
      "how to sign up",
      "join a course",
      "enroll in course",
      "get started",
    ],
    response: `Getting started is easy! Browse our course catalog, click on any course that interests you, and hit the "Enroll Now" button. You'll need to sign in with your Microsoft account first. Most courses are free to start!`,
    action: {
      type: "navigate",
      target: "/courses",
    },
    category: "general",
    keywords: ["enroll", "sign up", "join", "start", "course"],
  },

  {
    id: "browse-courses",
    patterns: [
      "browse courses",
      "show all courses",
      "course catalog",
      "what courses",
      "available courses",
    ],
    response: `Here's our complete course catalog! You can filter by category, level, or search for specific topics. All courses are designed for busy professionals with practical, actionable content.`,
    action: {
      type: "navigate",
      target: "/courses",
    },
    category: "navigation",
    keywords: ["browse", "catalog", "courses", "all", "available"],
  },

  // Search & Filtering
  {
    id: "search-courses",
    patterns: [
      "search for courses",
      "find a course",
      "course search",
      "look for",
      "search",
    ],
    response: `You can search for courses using the search bar at the top of the course catalog. Try searching by topic, skill, or keyword. You can also use filters to narrow down by category, level, or audience.`,
    action: {
      type: "navigate",
      target: "/courses",
    },
    category: "navigation",
    keywords: ["search", "find", "look", "course"],
  },

  // Account & Profile
  {
    id: "sign-in",
    patterns: [
      "how to sign in",
      "login",
      "sign in",
      "account access",
      "microsoft login",
    ],
    response: `To sign in, click the "Sign In" button in the top right corner. We use Microsoft Azure authentication for secure access. You can use your work or personal Microsoft account.`,
    category: "general",
    keywords: ["sign in", "login", "account", "microsoft", "access"],
  },

  // Support & Help
  {
    id: "need-help",
    patterns: ["i need help", "help me", "support", "contact", "assistance"],
    response: `I'm here to help! You can ask me about courses, how to use the platform, or finding specific content. For technical issues or detailed support, you can contact our support team using the link below.`,
    category: "support",
    keywords: ["help", "support", "contact", "assistance"],
  },
];

/**
 * Quick Actions - Common questions for users who don't want to type
 */
export const quickActions = [
  {
    id: "browse-courses",
    label: "📚 Browse All Courses",
    intent: "browse-courses",
  },
  {
    id: "leadership-courses",
    label: "👥 Leadership Courses",
    intent: "leadership-courses",
  },
  {
    id: "my-progress",
    label: "📊 My Progress",
    intent: "my-progress",
  },
  {
    id: "how-to-enroll",
    label: "🚀 How to Get Started",
    intent: "how-to-enroll",
  },
];

/**
 * Fallback responses when no intent is matched
 */
export const fallbackResponses = [
  `I'm not sure I understand that question. Here are some things I can help you with:`,
  `I didn't quite catch that. Let me show you some common questions I can answer:`,
  `I'm still learning! Here are some topics I can definitely help with:`,
];

/**
 * Match user input to an intent
 * Uses simple pattern matching with keywords and partial string matching
 */
export function matchIntent(userInput: string): IntentResponse | null {
  const input = userInput.toLowerCase().trim();

  if (!input) return null;

  // First, try exact pattern matching
  for (const intent of intentRegistry) {
    for (const pattern of intent.patterns) {
      if (input.includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }

  // Then try keyword matching (at least 2 keywords must match)
  for (const intent of intentRegistry) {
    const matchedKeywords = intent.keywords.filter((keyword) =>
      input.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length >= 2) {
      return intent;
    }
  }

  // Finally, try single keyword matching for high-confidence keywords
  const highConfidenceKeywords = [
    "dtma",
    "courses",
    "enroll",
    "progress",
    "help",
  ];
  for (const intent of intentRegistry) {
    for (const keyword of intent.keywords) {
      if (
        highConfidenceKeywords.includes(keyword) &&
        input.includes(keyword.toLowerCase())
      ) {
        return intent;
      }
    }
  }

  return null;
}

/**
 * Get a random fallback response
 */
export function getFallbackResponse(): string {
  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
}

/**
 * Get intent by ID (for quick actions)
 */
export function getIntentById(id: string): IntentResponse | null {
  return intentRegistry.find((intent) => intent.id === id) || null;
}

/**
 * Get all intents by category
 */
export function getIntentsByCategory(category: string): IntentResponse[] {
  return intentRegistry.filter((intent) => intent.category === category);
}
