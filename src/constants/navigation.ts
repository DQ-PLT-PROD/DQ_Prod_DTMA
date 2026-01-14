import {
    BuildingIcon,
    CreditCardIcon,
    UsersIcon,
    GraduationCapIcon,
    TrendingUpIcon,
    LucideProps,
} from "lucide-react";

export interface CourseCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<LucideProps>;
    href: string;
}

export const COURSE_CATEGORIES: CourseCategory[] = [
    {
        id: "d1",
        name: "Mastering Economy 4.0",
        description: "Navigating the opportunities and challenges in the new economy",
        icon: BuildingIcon,
        href: "/courses?category=economy-4-0",
    },
    {
        id: "d2",
        name: "Building Tomorrow’s Organisations",
        description:
            "Where organizations are headed in the age of digital transformation",
        icon: UsersIcon,
        href: "/courses?category=digital-cognitive-organization",
    },
    {
        id: "d3",
        name: "Mastering Digital Transformation",
        description:
            "What legacy value or orchestration engine powers the future?",
        icon: CreditCardIcon,
        href: "/courses?category=digital-business-platform",
    },
    {
        id: "d4",
        name: "Designing for the Future",
        description:
            "How to design and deploy next-generation transformation frameworks",
        icon: TrendingUpIcon,
        href: "/courses?category=digital-transformation-2-0",
    },
    {
        id: "d5",
        name: "Architecting Change",
        description:
            "Who are the orchestrators of the new digital workspace?",
        icon: GraduationCapIcon,
        href: "/courses?category=digital-worker-workspace",
    },
    {
        id: "d6",
        name: "Empowering Change",
        description:
            "When will we get there? Exploring tools to accelerate transformation",
        icon: TrendingUpIcon,
        href: "/courses?category=digital-accelerators-tools",
    },
];
