import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../../../components/ui/Toast";
import { useAuth } from "@/lib/auth";
import {
  getLearnerProfile,
  RoleTrack,
  upsertLearnerProfile,
  UpsertProfileInput,
} from "../../../learner/services/learnerProfileService";
import {
  GOAL_OPTIONS,
  MAX_GOALS,
  MAX_PREFERENCES,
  PREFERENCE_OPTIONS,
  ROLE_OPTIONS,
  SENIORITY_OPTIONS,
  TRANSFORMATION_EXPERIENCE_OPTIONS,
  WEEKLY_CAPACITY_OPTIONS,
} from "../../../learner/constants/profileOptions";
import ChipMultiSelect from "../../../learner/components/ChipMultiSelect";
import ProfileTabs from "./ProfileTabs";
import ProfileSectionAccordion from "./ProfileSectionAccordion";
import {
  computeProfileCompletion,
  ProfileSectionId,
  ProfileTabId,
} from "../../utils/profileCompletion";

type EditableTabId = Exclude<ProfileTabId, "summary">;

interface ProfileFormState {
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

const EMPTY_PROFILE_STATE: ProfileFormState = {
  displayName: "",
  preferredEmail: "",
  phoneNumber: "",
  country: "",
  timezone: "",
  roleTrack: null,
  goals: [],
  preferences: [],
  seniorityLevel: "",
  weeklyLearningCapacity: "",
  transformationExperience: "",
};

const INPUT_CLASSNAME =
  "mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30";

const ProfilePageContainer: React.FC = () => {
  const { databaseUser, isDatabaseUserLoading, user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const toastRef = useRef(showToast);

  const [profile, setProfile] = useState<ProfileFormState>(EMPTY_PROFILE_STATE);
  const [activeTab, setActiveTab] = useState<ProfileTabId>("summary");
  const [openSections, setOpenSections] = useState<Record<EditableTabId, ProfileSectionId | null>>({
    personal: "basic_information",
    identity: "role_track",
    goals: "goals",
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingTab, setSavingTab] = useState<EditableTabId | null>(null);

  const userKey = databaseUser?.azure_user_id ?? null;
  const loadedKeyRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userKey) {
        if (!isDatabaseUserLoading && loadedKeyRef.current === null) {
          setInitialLoading(false);
        }
        return;
      }

      if (loadedKeyRef.current === userKey) {
        return;
      }

      const isFirstLoad = loadedKeyRef.current === null;
      if (isFirstLoad) {
        setInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      const { profile: loadedProfile, error } = await getLearnerProfile(userKey);

      if (requestIdRef.current !== requestId) {
        return;
      }

      if (error) {
        toastRef.current("Unable to load profile data.", "error");
      }

      const fallbackDisplayName =
        databaseUser?.display_name || databaseUser?.name || user?.name || "";

      if (loadedProfile) {
        setProfile({
          displayName: loadedProfile.displayName || fallbackDisplayName,
          preferredEmail: loadedProfile.preferredEmail || "",
          phoneNumber: loadedProfile.phoneNumber || "",
          country: loadedProfile.country || "",
          timezone: loadedProfile.timezone || "",
          roleTrack: loadedProfile.roleTrack || null,
          goals: loadedProfile.goals || [],
          preferences: loadedProfile.preferences || [],
          seniorityLevel: loadedProfile.seniorityLevel || "",
          weeklyLearningCapacity: loadedProfile.weeklyLearningCapacity || "",
          transformationExperience: loadedProfile.transformationExperience || "",
        });
      } else {
        setProfile((previous) => ({
          ...previous,
          displayName: previous.displayName || fallbackDisplayName,
        }));
      }

      loadedKeyRef.current = userKey;

      if (isFirstLoad) {
        setInitialLoading(false);
      }
      setIsRefreshing(false);
    };

    loadProfile();
  }, [
    userKey,
    isDatabaseUserLoading,
    databaseUser?.display_name,
    databaseUser?.name,
    user?.name,
  ]);

  useEffect(() => {
    if (profile.roleTrack !== "leader" && profile.transformationExperience) {
      setProfile((previous) => ({ ...previous, transformationExperience: "" }));
    }
  }, [profile.roleTrack, profile.transformationExperience]);

  const displayNameError = profile.displayName.trim()
    ? null
    : "Display name is required.";

  const preferredEmailError = useMemo(() => {
    if (!profile.preferredEmail.trim()) {
      return null;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(profile.preferredEmail.trim())
      ? null
      : "Preferred email must be a valid email address.";
  }, [profile.preferredEmail]);

  const roleError = profile.roleTrack ? null : "Role track is required.";
  const seniorityError = profile.seniorityLevel ? null : "Seniority level is required.";
  const transformationError =
    profile.roleTrack === "leader" && !profile.transformationExperience
      ? "Transformation experience is required for leaders."
      : null;

  const goalsError = useMemo(() => {
    if (profile.goals.length < 1) {
      return "Select at least 1 goal.";
    }
    if (profile.goals.length > MAX_GOALS) {
      return `Select up to ${MAX_GOALS} goals.`;
    }
    return null;
  }, [profile.goals]);

  const preferencesError = useMemo(() => {
    if (profile.preferences.length > MAX_PREFERENCES) {
      return `Select up to ${MAX_PREFERENCES} interests.`;
    }
    return null;
  }, [profile.preferences]);

  const tabErrors: Record<EditableTabId, string[]> = {
    personal: [displayNameError, preferredEmailError].filter(Boolean) as string[],
    identity: [roleError, seniorityError, transformationError].filter(Boolean) as string[],
    goals: [goalsError, preferencesError].filter(Boolean) as string[],
  };

  const completion = useMemo(
    () =>
      computeProfileCompletion({
        displayName: profile.displayName,
        preferredEmail: profile.preferredEmail,
        phoneNumber: profile.phoneNumber,
        country: profile.country,
        timezone: profile.timezone,
        roleTrack: profile.roleTrack,
        goals: profile.goals,
        preferences: profile.preferences,
        seniorityLevel: profile.seniorityLevel,
        weeklyLearningCapacity: profile.weeklyLearningCapacity,
        transformationExperience: profile.transformationExperience,
      }),
    [profile]
  );

  const tabItems = [
    { id: "summary" as const, label: "Profile Summary" },
    {
      id: "personal" as const,
      label: "Personal Details",
      completionPct: completion.tabs.personal.completionPct,
      missingRequiredCount: completion.tabs.personal.missingRequiredFields.length,
    },
    {
      id: "identity" as const,
      label: "Learning Identity",
      completionPct: completion.tabs.identity.completionPct,
      missingRequiredCount: completion.tabs.identity.missingRequiredFields.length,
    },
    {
      id: "goals" as const,
      label: "Goals & Interests",
      completionPct: completion.tabs.goals.completionPct,
      missingRequiredCount: completion.tabs.goals.missingRequiredFields.length,
    },
  ];

  const accountEmail = databaseUser?.email || user?.email || "";
  const roleLabel =
    ROLE_OPTIONS.find((option) => option.value === profile.roleTrack)?.label || "Not set";
  const seniorityLabel =
    SENIORITY_OPTIONS.find((option) => option.value === profile.seniorityLevel)?.label ||
    "Not set";
  const learningCapacityLabel =
    WEEKLY_CAPACITY_OPTIONS.find((option) => option.value === profile.weeklyLearningCapacity)
      ?.label || "Not set";

  const incompleteRequiredSections = Object.values(completion.sections).filter(
    (section) => section.isRequired && !section.isComplete
  );

  const updateField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
  };

  const toggleSection = (tabId: EditableTabId, sectionId: ProfileSectionId) => {
    setOpenSections((previous) => ({
      ...previous,
      [tabId]: previous[tabId] === sectionId ? null : sectionId,
    }));
  };

  const jumpToSection = (sectionId: ProfileSectionId) => {
    const section = completion.sections[sectionId];
    setActiveTab(section.tabId);
    setOpenSections((previous) => ({
      ...previous,
      [section.tabId]: sectionId,
    }));
  };
  const buildTabPayload = (tabId: EditableTabId): UpsertProfileInput => {
    if (tabId === "personal") {
      return {
        displayName: profile.displayName.trim() || null,
        preferredEmail: profile.preferredEmail.trim() || null,
        phoneNumber: profile.phoneNumber.trim() || null,
        country: profile.country.trim() || null,
        timezone: profile.timezone.trim() || null,
      };
    }

    if (tabId === "identity") {
      return {
        roleTrack: profile.roleTrack,
        seniorityLevel: profile.seniorityLevel || null,
        transformationExperience:
          profile.roleTrack === "leader" ? profile.transformationExperience || null : null,
      };
    }

    return {
      goals: profile.goals,
      preferences: profile.preferences,
      weeklyLearningCapacity: profile.weeklyLearningCapacity || null,
    };
  };

  const handleSaveTab = async (tabId: EditableTabId) => {
    if (!userKey) {
      showToast("Profile is not available yet.", "error");
      return;
    }

    if (tabErrors[tabId].length > 0) {
      showToast(tabErrors[tabId][0], "error");
      return;
    }

    setSavingTab(tabId);
    const result = await upsertLearnerProfile(userKey, buildTabPayload(tabId));
    setSavingTab(null);

    if (!result) {
      showToast("Failed to save profile changes.", "error");
      return;
    }

    showToast("Profile updated successfully.", "success");
  };

  const renderSummaryTab = () => (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Completion Overview</h2>
            <p className="mt-1 text-sm text-gray-600">
              {completion.overallCompletionPct}% complete
            </p>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700">
            {completion.missingRequiredCount} required fields missing
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-[#1839AD] transition-all"
            style={{ width: `${completion.overallCompletionPct}%` }}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Jump to incomplete sections</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {incompleteRequiredSections.length ? (
              incompleteRequiredSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpToSection(section.id)}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
                >
                  {section.title}
                </button>
              ))
            ) : (
              <span className="text-sm text-green-700">All required sections are complete.</span>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Account Snapshot</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Display name</p>
            <p className="text-sm text-gray-900">{profile.displayName || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{accountEmail || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Role track</p>
            <p className="text-sm text-gray-900">{roleLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Seniority</p>
            <p className="text-sm text-gray-900">{seniorityLabel}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Learning Snapshot</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Goals selected</p>
            <p className="text-sm text-gray-900">{profile.goals.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Interests selected</p>
            <p className="text-sm text-gray-900">{profile.preferences.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Learning capacity</p>
            <p className="text-sm text-gray-900">{learningCapacityLabel}</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPersonalTab = () => (
    <div className="space-y-3">
      <ProfileSectionAccordion
        title="Basic Information"
        description="Update your profile name. Identity email is managed by your organization."
        requirement={completion.sections.basic_information.requirement}
        completionPct={completion.sections.basic_information.completionPct}
        isComplete={completion.sections.basic_information.isComplete}
        isOpen={openSections.personal === "basic_information"}
        onToggle={() => toggleSection("personal", "basic_information")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display name</label>
            <input
              value={profile.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
              className={INPUT_CLASSNAME}
              placeholder="Your preferred name"
            />
            {displayNameError && <p className="mt-1 text-sm text-red-600">{displayNameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={accountEmail}
              readOnly
              className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">Managed by your organization.</p>
          </div>
        </div>
      </ProfileSectionAccordion>

      <ProfileSectionAccordion
        title="Contact Details"
        description="Optional contact channels for your learner profile."
        requirement={completion.sections.contact_details.requirement}
        completionPct={completion.sections.contact_details.completionPct}
        isComplete={completion.sections.contact_details.isComplete}
        isOpen={openSections.personal === "contact_details"}
        onToggle={() => toggleSection("personal", "contact_details")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred email (optional)</label>
            <input
              value={profile.preferredEmail}
              onChange={(event) => updateField("preferredEmail", event.target.value)}
              className={INPUT_CLASSNAME}
              placeholder="name@company.com"
            />
            {preferredEmailError && <p className="mt-1 text-sm text-red-600">{preferredEmailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone number (optional)</label>
            <input
              value={profile.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              className={INPUT_CLASSNAME}
              placeholder="+1 555 000 0000"
            />
          </div>
        </div>
      </ProfileSectionAccordion>

      <ProfileSectionAccordion
        title="Location & Time"
        description="Optional location context for scheduling learning activities."
        requirement={completion.sections.location_time.requirement}
        completionPct={completion.sections.location_time.completionPct}
        isComplete={completion.sections.location_time.isComplete}
        isOpen={openSections.personal === "location_time"}
        onToggle={() => toggleSection("personal", "location_time")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Country (optional)</label>
            <input
              value={profile.country}
              onChange={(event) => updateField("country", event.target.value)}
              className={INPUT_CLASSNAME}
              placeholder="United States"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone (optional)</label>
            <input
              value={profile.timezone}
              onChange={(event) => updateField("timezone", event.target.value)}
              className={INPUT_CLASSNAME}
              placeholder="America/New_York"
            />
          </div>
        </div>
      </ProfileSectionAccordion>
    </div>
  );

  const renderIdentityTab = () => (
    <div className="space-y-3">
      <ProfileSectionAccordion
        title="Role Track"
        description="Choose the path that aligns to your role."
        requirement={completion.sections.role_track.requirement}
        completionPct={completion.sections.role_track.completionPct}
        isComplete={completion.sections.role_track.isComplete}
        isOpen={openSections.identity === "role_track"}
        onToggle={() => toggleSection("identity", "role_track")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = profile.roleTrack === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("roleTrack", option.value)}
                className={`rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-[#1839AD] bg-[#1839AD]/5"
                    : "border-gray-200 hover:border-[#1839AD]/40"
                }`}
              >
                <div className="text-lg font-semibold text-gray-900">{option.label}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {option.value === "digital_worker"
                    ? "Build practical skills to work smarter every day."
                    : "Lead teams, drive change, and scale impact."}
                </div>
              </button>
            );
          })}
        </div>
        {roleError && <p className="mt-2 text-sm text-red-600">{roleError}</p>}
      </ProfileSectionAccordion>

      <ProfileSectionAccordion
        title="Seniority Level"
        description="Tell us where you are in your career."
        requirement={completion.sections.seniority_level.requirement}
        completionPct={completion.sections.seniority_level.completionPct}
        isComplete={completion.sections.seniority_level.isComplete}
        isOpen={openSections.identity === "seniority_level"}
        onToggle={() => toggleSection("identity", "seniority_level")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SENIORITY_OPTIONS.map((option) => {
            const isSelected = profile.seniorityLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("seniorityLevel", option.value)}
                className={`rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-[#1839AD] bg-[#1839AD]/5"
                    : "border-gray-200 hover:border-[#1839AD]/40"
                }`}
              >
                <div className="text-lg font-semibold text-gray-900">{option.label}</div>
              </button>
            );
          })}
        </div>
        {seniorityError && <p className="mt-2 text-sm text-red-600">{seniorityError}</p>}
      </ProfileSectionAccordion>

      <ProfileSectionAccordion
        title="Transformation Experience"
        description="Required only when role track is Leader."
        requirement={completion.sections.transformation_experience.requirement}
        completionPct={completion.sections.transformation_experience.completionPct}
        isComplete={completion.sections.transformation_experience.isComplete}
        isOpen={openSections.identity === "transformation_experience"}
        onToggle={() => toggleSection("identity", "transformation_experience")}
      >
        {profile.roleTrack !== "leader" ? (
          <p className="text-sm text-gray-500">
            Select role track as Leader to make this field required.
          </p>
        ) : null}
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          {TRANSFORMATION_EXPERIENCE_OPTIONS.map((option) => {
            const isSelected = profile.transformationExperience === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("transformationExperience", option.value)}
                disabled={profile.roleTrack !== "leader"}
                className={`rounded-lg border p-4 text-left transition ${
                  profile.roleTrack !== "leader"
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : isSelected
                      ? "border-[#1839AD] bg-[#1839AD]/5"
                      : "border-gray-200 hover:border-[#1839AD]/40"
                }`}
              >
                <div className="text-lg font-semibold text-gray-900">{option.label}</div>
              </button>
            );
          })}
        </div>
        {transformationError && <p className="mt-2 text-sm text-red-600">{transformationError}</p>}
      </ProfileSectionAccordion>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-3">
      <ProfileSectionAccordion
        title="Goals"
        description={`Select between 1 and ${MAX_GOALS} goals.`}
        requirement={completion.sections.goals.requirement}
        completionPct={completion.sections.goals.completionPct}
        isComplete={completion.sections.goals.isComplete}
        isOpen={openSections.goals === "goals"}
        onToggle={() => toggleSection("goals", "goals")}
      >
        <ChipMultiSelect
          options={GOAL_OPTIONS}
          selected={profile.goals}
          onChange={(next) => updateField("goals", next)}
          maxSelections={MAX_GOALS}
        />
        <p className="mt-2 text-xs text-gray-500">{profile.goals.length}/{MAX_GOALS} selected</p>
        {goalsError && <p className="mt-2 text-sm text-red-600">{goalsError}</p>}
      </ProfileSectionAccordion>

      <ProfileSectionAccordion
        title="Areas of Interest"
        description={`Optional. Select up to ${MAX_PREFERENCES} interests.`}
        requirement={completion.sections.areas_of_interest.requirement}
        completionPct={completion.sections.areas_of_interest.completionPct}
        isComplete={completion.sections.areas_of_interest.isComplete}
        isOpen={openSections.goals === "areas_of_interest"}
        onToggle={() => toggleSection("goals", "areas_of_interest")}
      >
        <ChipMultiSelect
          options={PREFERENCE_OPTIONS}
          selected={profile.preferences}
          onChange={(next) => updateField("preferences", next)}
          maxSelections={MAX_PREFERENCES}
        />
        <p className="mt-2 text-xs text-gray-500">
          {profile.preferences.length}/{MAX_PREFERENCES} selected
        </p>
        {preferencesError && <p className="mt-2 text-sm text-red-600">{preferencesError}</p>}
      </ProfileSectionAccordion>

      <ProfileSectionAccordion
        title="Learning Capacity"
        description="Optional weekly learning time."
        requirement={completion.sections.learning_capacity.requirement}
        completionPct={completion.sections.learning_capacity.completionPct}
        isComplete={completion.sections.learning_capacity.isComplete}
        isOpen={openSections.goals === "learning_capacity"}
        onToggle={() => toggleSection("goals", "learning_capacity")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WEEKLY_CAPACITY_OPTIONS.map((option) => {
            const isSelected = profile.weeklyLearningCapacity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("weeklyLearningCapacity", option.value)}
                className={`rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-[#1839AD] bg-[#1839AD]/5"
                    : "border-gray-200 hover:border-[#1839AD]/40"
                }`}
              >
                <div className="text-lg font-semibold text-gray-900">{option.label}</div>
              </button>
            );
          })}
        </div>
      </ProfileSectionAccordion>
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === "summary") {
      return renderSummaryTab();
    }
    if (activeTab === "personal") {
      return renderPersonalTab();
    }
    if (activeTab === "identity") {
      return renderIdentityTab();
    }
    return renderGoalsTab();
  };

  return (
    <div className="w-full px-4 py-4 md:px-6 lg:px-8 xl:px-10">
      <div className="w-full max-w-[1400px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your learner profile across personal details, identity, and goals.
          </p>
        </div>

        <div className="w-full space-y-4">
          {initialLoading || isDatabaseUserLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-500">
              Loading profile...
            </div>
          ) : (
            <>
              {isRefreshing ? (
                <p className="text-sm text-gray-500">Refreshing profile data...</p>
              ) : null}

              <ProfileTabs tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />

              {renderActiveTab()}

              {activeTab !== "summary" ? (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">
                    {tabErrors[activeTab].length
                      ? `${tabErrors[activeTab].length} validation issue(s) to resolve`
                      : "No validation issues in this tab."}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSaveTab(activeTab)}
                    disabled={savingTab === activeTab}
                    className="inline-flex items-center rounded-md bg-[#1839AD] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#132b7c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTab === activeTab ? "Saving..." : "Save changes"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default ProfilePageContainer;
