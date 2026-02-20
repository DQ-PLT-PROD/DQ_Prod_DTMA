import { MAX_GOALS, MAX_PREFERENCES } from "../../learner/constants/profileOptions";
import { RoleTrack } from "../../learner/services/learnerProfileService";

export type ProfileTabId = "summary" | "personal" | "identity" | "goals";

export type ProfileSectionId =
  | "basic_information"
  | "contact_details"
  | "location_time"
  | "role_track"
  | "seniority_level"
  | "transformation_experience"
  | "goals"
  | "areas_of_interest"
  | "learning_capacity";

export type SectionRequirement = "required" | "optional" | "conditional";

export interface ProfileCompletionInput {
  displayName: string;
  preferredEmail: string;
  phoneNumber: string;
  country: string;
  timezone: string;
  roleTrack: RoleTrack | null;
  goals: string[];
  preferences: string[];
  seniorityLevel: string;
  weeklyLearningCapacity: string;
  transformationExperience: string;
}

export interface SectionCompletion {
  id: ProfileSectionId;
  tabId: Exclude<ProfileTabId, "summary">;
  title: string;
  requirement: SectionRequirement;
  isRequired: boolean;
  isApplicable: boolean;
  completionPct: number;
  isComplete: boolean;
  missingRequiredFields: string[];
}

export interface TabCompletion {
  tabId: Exclude<ProfileTabId, "summary">;
  completionPct: number;
  missingRequiredFields: string[];
}

export interface ProfileCompletionResult {
  sections: Record<ProfileSectionId, SectionCompletion>;
  tabs: Record<Exclude<ProfileTabId, "summary">, TabCompletion>;
  overallCompletionPct: number;
  missingRequiredFields: string[];
  missingRequiredCount: number;
}

const REQUIRED_WEIGHT = 2;
const OPTIONAL_WEIGHT = 1;

const isFilled = (value: string) => Boolean(value.trim());

const roundPct = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const createOptionalSection = (
  id: ProfileSectionId,
  tabId: Exclude<ProfileTabId, "summary">,
  title: string,
  filledCount: number,
  totalCount: number
): SectionCompletion => {
  const ratio = totalCount === 0 ? 0 : filledCount / totalCount;
  return {
    id,
    tabId,
    title,
    requirement: "optional",
    isRequired: false,
    isApplicable: true,
    completionPct: roundPct(ratio * 100),
    isComplete: ratio === 1,
    missingRequiredFields: [],
  };
};

const weightedCompletion = (sections: SectionCompletion[]): number => {
  const applicable = sections.filter((section) => section.isApplicable);
  if (!applicable.length) {
    return 100;
  }

  const denominator = applicable.reduce(
    (sum, section) => sum + (section.isRequired ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT),
    0
  );
  const numerator = applicable.reduce(
    (sum, section) =>
      sum
      + (section.completionPct / 100)
      * (section.isRequired ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT),
    0
  );

  if (denominator === 0) {
    return 100;
  }

  return roundPct((numerator / denominator) * 100);
};

export function computeProfileCompletion(input: ProfileCompletionInput): ProfileCompletionResult {
  const goalsAreValid = input.goals.length >= 1 && input.goals.length <= MAX_GOALS;
  const preferencesAreValid = input.preferences.length <= MAX_PREFERENCES;
  const isLeader = input.roleTrack === "leader";

  const sections: Record<ProfileSectionId, SectionCompletion> = {
    basic_information: {
      id: "basic_information",
      tabId: "personal",
      title: "Basic Information",
      requirement: "required",
      isRequired: true,
      isApplicable: true,
      completionPct: isFilled(input.displayName) ? 100 : 0,
      isComplete: isFilled(input.displayName),
      missingRequiredFields: isFilled(input.displayName) ? [] : ["Display name"],
    },
    contact_details: createOptionalSection(
      "contact_details",
      "personal",
      "Contact Details",
      [input.preferredEmail, input.phoneNumber].filter(isFilled).length,
      2
    ),
    location_time: createOptionalSection(
      "location_time",
      "personal",
      "Location & Time",
      [input.country, input.timezone].filter(isFilled).length,
      2
    ),
    role_track: {
      id: "role_track",
      tabId: "identity",
      title: "Role Track",
      requirement: "required",
      isRequired: true,
      isApplicable: true,
      completionPct: input.roleTrack ? 100 : 0,
      isComplete: Boolean(input.roleTrack),
      missingRequiredFields: input.roleTrack ? [] : ["Role track"],
    },
    seniority_level: {
      id: "seniority_level",
      tabId: "identity",
      title: "Seniority Level",
      requirement: "required",
      isRequired: true,
      isApplicable: true,
      completionPct: isFilled(input.seniorityLevel) ? 100 : 0,
      isComplete: isFilled(input.seniorityLevel),
      missingRequiredFields: isFilled(input.seniorityLevel) ? [] : ["Seniority level"],
    },
    transformation_experience: {
      id: "transformation_experience",
      tabId: "identity",
      title: "Transformation Experience",
      requirement: "conditional",
      isRequired: isLeader,
      isApplicable: true,
      completionPct: isLeader
        ? (isFilled(input.transformationExperience) ? 100 : 0)
        : 100,
      isComplete: isLeader ? isFilled(input.transformationExperience) : true,
      missingRequiredFields:
        isLeader && !isFilled(input.transformationExperience)
          ? ["Transformation experience"]
          : [],
    },
    goals: {
      id: "goals",
      tabId: "goals",
      title: "Goals",
      requirement: "required",
      isRequired: true,
      isApplicable: true,
      completionPct: goalsAreValid ? 100 : 0,
      isComplete: goalsAreValid,
      missingRequiredFields: goalsAreValid ? [] : ["Goals"],
    },
    areas_of_interest: createOptionalSection(
      "areas_of_interest",
      "goals",
      "Areas of Interest",
      preferencesAreValid && input.preferences.length > 0 ? 1 : 0,
      1
    ),
    learning_capacity: createOptionalSection(
      "learning_capacity",
      "goals",
      "Learning Capacity",
      isFilled(input.weeklyLearningCapacity) ? 1 : 0,
      1
    ),
  };

  const personalSections = [
    sections.basic_information,
    sections.contact_details,
    sections.location_time,
  ];
  const identitySections = [
    sections.role_track,
    sections.seniority_level,
    sections.transformation_experience,
  ];
  const goalsSections = [
    sections.goals,
    sections.areas_of_interest,
    sections.learning_capacity,
  ];

  const tabs: Record<Exclude<ProfileTabId, "summary">, TabCompletion> = {
    personal: {
      tabId: "personal",
      completionPct: weightedCompletion(personalSections),
      missingRequiredFields: personalSections.flatMap((section) => section.missingRequiredFields),
    },
    identity: {
      tabId: "identity",
      completionPct: weightedCompletion(identitySections),
      missingRequiredFields: identitySections.flatMap((section) => section.missingRequiredFields),
    },
    goals: {
      tabId: "goals",
      completionPct: weightedCompletion(goalsSections),
      missingRequiredFields: goalsSections.flatMap((section) => section.missingRequiredFields),
    },
  };

  const allSections = Object.values(sections);
  const missingRequiredFields = allSections.flatMap((section) => section.missingRequiredFields);

  return {
    sections,
    tabs,
    overallCompletionPct: weightedCompletion(allSections),
    missingRequiredFields,
    missingRequiredCount: missingRequiredFields.length,
  };
}
