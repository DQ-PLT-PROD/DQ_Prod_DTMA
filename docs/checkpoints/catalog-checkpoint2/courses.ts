import { Course } from "../../types/dtma-lms";

export const courses: Course[] = [
  {
    id: "course-digital-strategy",
    slug: "digital-strategy-playbook",
    title: "Digital Strategy Playbook",
    shortDescription:
      "Build a 6XD-aligned digital strategy with clear value cases, governance, and measurable outcomes.",
    longDescription:
      "A fast-paced program for digital leaders to align ambition with execution. You will define your vision, prioritize value cases, and set up the governance, metrics, and ways of working to steer delivery. The playbook is lightweight enough to start immediately and robust enough to scale.",
    categoryId: "cat-digital-strategy",
    audienceLevel: "Digital Leaders",
    topicTags: ["Portfolio planning", "Governance", "Value cases"],
    levelTag: "Intermediate",
    estimatedDurationMinutes: 210,
    lessonCount: 7,
    heroImageUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80",
    isFeatured: true,
    status: "published",
    provider: {
      name: "Khalifa Fund Academy",
      logoUrl: "/mzn_logo.png",
      description: "Capability building for public sector and SME leaders.",
      url: "https://khalifafund.ae",
    },
    rating: 4.8,
    reviewCount: 64,
    deliveryMode: "Hybrid",
    enrollmentUrl: "/forms/needs-assessment",
    learningOutcomes: [
      "Prioritize a portfolio of digital bets tied to clear outcomes",
      "Set up governance, funding, and KPIs for digital programs",
      "Create a 90-day execution plan with measurable milestones",
    ],
    skillsGained: [
      "Digital portfolio planning",
      "North-star metrics",
      "Executive storytelling",
      "Value realization",
    ],
    uponCompletion:
      "Leaders leave with a focused roadmap and a governance cadence they can run next week.",
    startDate: "2024-08-05",
    location: "Abu Dhabi & Virtual",
  },
  {
    id: "course-cx-sprint",
    slug: "customer-journey-design-sprint",
    title: "Customer Journey Design Sprint",
    shortDescription:
      "Redesign a critical journey using data, service blueprints, and rapid prototyping.",
    longDescription:
      "A practitioner-led sprint where cross-functional teams map pain points, ideate fixes, and prototype an improved journey in under two weeks. Expect hands-on collaboration, moderated usability tests, and a backlog of validated improvements.",
    categoryId: "cat-customer-growth",
    audienceLevel: "Digital Workers",
    topicTags: ["CX", "Service design", "Prototyping"],
    levelTag: "Intermediate",
    estimatedDurationMinutes: 180,
    lessonCount: 6,
    heroImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    isFeatured: true,
    status: "published",
    provider: {
      name: "ADGM Academy",
      logoUrl:
        "https://images.squarespace-cdn.com/content/v1/5cc0e1e9a0cd27177a2dd7ec/1556171141973-2BKLJ7QWZM0RN9Y1DKBY/ADGM+Academy.png",
      description: "Executive and practitioner training across finance and tech.",
    },
    rating: 4.7,
    reviewCount: 52,
    deliveryMode: "Hybrid",
    enrollmentUrl: "/forms/training-in-entrepreneurship",
    learningOutcomes: [
      "Map end-to-end journeys and quantify friction with data",
      "Run co-creation workshops and prioritize fixes",
      "Prototype and test improvements with real customers",
    ],
    skillsGained: [
      "Journey mapping",
      "Service blueprinting",
      "Usability testing",
      "CX measurement",
    ],
    uponCompletion:
      "Teams leave with a tested journey prototype and a prioritized backlog.",
    startDate: "2024-08-19",
    location: "Abu Dhabi",
  },
  {
    id: "course-data-storytelling",
    slug: "data-storytelling-with-impact",
    title: "Data Storytelling with Impact",
    shortDescription:
      "Turn insights into executive-ready narratives that drive decisions and velocity.",
    longDescription:
      "Learn to shape data into concise stories, pick the right visuals, and land recommendations with senior stakeholders. Real examples from product, operations, and policy contexts help you translate numbers into action.",
    categoryId: "cat-data-insights",
    audienceLevel: "Digital Workers",
   topicTags: ["Data visualization", "Executive comms", "Analytics"],
    levelTag: "Beginner",
    estimatedDurationMinutes: 160,
    lessonCount: 5,
    heroImageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
    isFeatured: false,
    status: "published",
    provider: {
      name: "Data Works MENA",
      logoUrl:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=200&q=40",
      description: "Analytics labs focused on public sector impact.",
    },
    rating: 4.6,
    reviewCount: 41,
    deliveryMode: "Online",
    enrollmentUrl: "/forms/needs-assessment",
    learningOutcomes: [
      "Structure insights into a clear narrative arc",
      "Select visuals that clarify signal and avoid clutter",
      "Tailor recommendations to decision-makers",
    ],
    skillsGained: [
      "Story arc design",
      "Data visualization",
      "Influencing stakeholders",
      "Slidecraft",
    ],
    uponCompletion:
      "Participants publish a two-page insight brief and a concise presentation.",
    startDate: "2024-09-02",
    location: "Virtual",
  },
  {
    id: "course-modern-web-architecture",
    slug: "modern-web-architecture",
    title: "Modern Web Architecture Essentials",
    shortDescription:
      "Choose scalable front-to-back architectures, deployment patterns, and observability for modern products.",
    longDescription:
      "Engineers and tech leads get hands-on with modern web stacks, cloud deployment, and resilience practices. The course balances architecture decisions, DX, and reliability so teams can ship faster with confidence.",
    categoryId: "cat-technology-platforms",
    audienceLevel: "Digital Workers",
    topicTags: ["Architecture", "DevOps", "Observability"],
    levelTag: "Advanced",
    estimatedDurationMinutes: 240,
    lessonCount: 8,
    heroImageUrl:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1400&q=80",
    isFeatured: false,
    status: "published",
    provider: {
      name: "Cloud Builders Gulf",
      logoUrl:
        "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=200&q=40",
      description: "Cloud-native engineering enablement.",
    },
    rating: 4.5,
    reviewCount: 33,
    deliveryMode: "Online",
    enrollmentUrl: "/forms/needs-assessment",
    learningOutcomes: [
      "Pick architectures that balance speed and resilience",
      "Set up CI/CD, environments, and release strategies",
      "Instrument services with logging, metrics, and tracing",
    ],
    skillsGained: [
      "Frontend/back-end architecture",
      "DevOps practices",
      "Observability setup",
      "Reliability planning",
    ],
    uponCompletion:
      "Teams leave with a reference architecture and an environment checklist.",
    startDate: "2024-08-26",
    location: "Virtual",
  },
  {
    id: "course-lean-ops",
    slug: "lean-service-operations",
    title: "Lean Service Operations",
    shortDescription:
      "Stabilize and scale service delivery with lean methods, SLAs, and automation.",
    longDescription:
      "Operations leads learn how to eliminate bottlenecks, instrument SLAs, and introduce automation without breaking customer experience. The course blends practical tooling with change management so improvements stick.",
    categoryId: "cat-operations",
    audienceLevel: "Digital Leaders",
    topicTags: ["Operations", "Automation", "SLA design"],
    levelTag: "Intermediate",
    estimatedDurationMinutes: 170,
    lessonCount: 6,
    heroImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    isFeatured: false,
    status: "published",
    provider: {
      name: "Service Lab",
      logoUrl:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=200&q=40",
      description: "Service design and operations coaches.",
    },
    rating: 4.6,
    reviewCount: 29,
    deliveryMode: "Hybrid",
    enrollmentUrl: "/forms/needs-assessment",
    learningOutcomes: [
      "Map operational bottlenecks and failure modes",
      "Design SLAs and dashboards that drive action",
      "Automate repetitive steps without adding risk",
    ],
    skillsGained: [
      "Lean operations",
      "SLA design",
      "Automation scoping",
      "Change adoption",
    ],
    uponCompletion:
      "Participants draft an operations control plan and a 30-day improvement backlog.",
    startDate: "2024-09-09",
    location: "Abu Dhabi & Virtual",
  },
  {
    id: "course-leading-change",
    slug: "leading-change-in-digital-teams",
    title: "Leading Change in Digital Teams",
    shortDescription:
      "Practical change leadership for squads adopting new tools, processes, or delivery models.",
    longDescription:
      "Managers and coaches learn how to shape narratives, identify influencers, and remove blockers to adoption. Includes templates for comms, onboarding, and feedback loops tailored to digital teams.",
    categoryId: "cat-people-culture",
    audienceLevel: "Digital Leaders",
    topicTags: ["Change management", "Team culture", "Leadership"],
    levelTag: "Intermediate",
    estimatedDurationMinutes: 150,
    lessonCount: 5,
    heroImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    isFeatured: true,
    status: "published",
    provider: {
      name: "Hub71",
      logoUrl: "https://hub71.com/wp-content/uploads/2023/05/hub71-logo-1.png",
      description: "Community and programs for high-growth teams.",
    },
    rating: 4.7,
    reviewCount: 48,
    deliveryMode: "Hybrid",
    enrollmentUrl: "/forms/needs-assessment",
    learningOutcomes: [
      "Diagnose change readiness and stakeholder map",
      "Craft narratives and rituals that reinforce change",
      "Set up feedback loops and track adoption signals",
    ],
    skillsGained: [
      "Change leadership",
      "Stakeholder mapping",
      "Communication planning",
      "Team rituals",
    ],
    uponCompletion:
      "Leaders leave with a change playbook and a four-week adoption plan.",
    startDate: "2024-08-12",
    location: "Abu Dhabi & Virtual",
  },
];
