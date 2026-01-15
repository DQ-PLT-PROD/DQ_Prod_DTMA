import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageLayout,
  PageSection,
  SectionContent,
  PrimaryButton,
} from "../../../../components/PageLayout";
import { useAuth } from "../../../../components/Header";
import {
  getProfile,
  upsertProfile,
  RoleTrack,
} from "../../../learner/services/learnerProfileService";

const ROLE_OPTIONS: { label: string; value: RoleTrack }[] = [
  { label: "Digital Worker", value: "digital_worker" },
  { label: "Leader", value: "leader" },
];

const GOAL_OPTIONS = [
  "Career growth",
  "Upskill quickly",
  "Lead teams better",
  "Improve productivity",
  "Learn AI/automation",
  "Prepare for promotion",
  "Build confidence",
  "Explore new topics",
];

const PREFERENCE_OPTIONS = [
  "Data",
  "AI",
  "Automation",
  "Leadership",
  "Project management",
  "Communication",
  "Digital tools",
  "Strategy",
  "Innovation",
  "Operations",
  "Customer experience",
  "Finance",
];

const MIN_GOALS = 3;
const MAX_GOALS = 8;
const MAX_PREFERENCES = 12;

export const LearnerOnboarding: React.FC<{
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
}> = ({ setIsOpen, isLoggedIn }) => {
  const navigate = useNavigate();
  const { databaseUser, isDatabaseUserLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [roleTrack, setRoleTrack] = useState<RoleTrack | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const azureUserId = databaseUser?.azure_user_id;

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!azureUserId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const existing = await getProfile(azureUserId);

      if (isMounted && existing) {
        setRoleTrack(existing.roleTrack);
        setGoals(existing.goals || []);
        setPreferences(existing.preferences || []);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [azureUserId]);

  const goalCountError = useMemo(() => {
    if (goals.length === 0) {
      return "Select at least 3 goals to continue.";
    }
    if (goals.length < MIN_GOALS) {
      return `Select at least ${MIN_GOALS} goals to continue.`;
    }
    if (goals.length > MAX_GOALS) {
      return `Select up to ${MAX_GOALS} goals.`;
    }
    return null;
  }, [goals]);

  const preferencesError = useMemo(() => {
    if (preferences.length > MAX_PREFERENCES) {
      return `Select up to ${MAX_PREFERENCES} preferences.`;
    }
    return null;
  }, [preferences]);

  const canContinueStep1 = Boolean(roleTrack);
  const canSave = !goalCountError && !preferencesError && roleTrack !== null;

  const toggleSelection = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    maxCount?: number
  ) => {
    setList((prev) => {
      const exists = prev.includes(value);
      if (exists) {
        return prev.filter((item) => item !== value);
      }
      if (maxCount && prev.length >= maxCount) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleAddOtherGoal = () => {
    const trimmed = otherGoal.trim();
    if (!trimmed) {
      return;
    }
    if (goals.includes(trimmed)) {
      setOtherGoal("");
      return;
    }
    if (goals.length >= MAX_GOALS) {
      return;
    }
    setGoals((prev) => [...prev, trimmed]);
    setOtherGoal("");
  };

  const handleSave = async () => {
    if (!azureUserId) {
      setError("User profile is not available yet. Please try again.");
      return;
    }
    if (!canSave) {
      setError(goalCountError || preferencesError || "Please review your selections.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await upsertProfile(azureUserId, {
      roleTrack,
      goals,
      preferences,
      onboardingCompleted: true,
    });

    setIsSaving(false);

    if (!result) {
      setError("We couldn't save your onboarding details. Please try again.");
      return;
    }

    navigate("/portal");
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Choose your role track</h2>
        <p className="text-sm text-gray-600 mt-1">
          This helps personalize your learning experience.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = roleTrack === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setRoleTrack(option.value)}
              className={`p-4 rounded-lg border text-left transition ${
                isSelected
                  ? "border-[#1839AD] bg-[#1839AD]/5"
                  : "border-gray-200 hover:border-[#1839AD]/40"
              }`}
            >
              <div className="text-lg font-semibold text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-500 mt-1">
                {option.value === "digital_worker"
                  ? "Build practical skills to work smarter every day."
                  : "Lead teams, drive change, and scale impact."}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <PrimaryButton
          onClick={() => setStep(2)}
          disabled={!canContinueStep1}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Pick your goals</h2>
        <p className="text-sm text-gray-600 mt-1">
          Select {MIN_GOALS}-{MAX_GOALS} goals to tailor your dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = goals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => toggleSelection(goal, goals, setGoals, MAX_GOALS)}
                className={`px-3 py-2 rounded-full text-sm border transition ${
                  isSelected
                    ? "border-[#1839AD] bg-[#1839AD]/10 text-[#1839AD]"
                    : "border-gray-200 text-gray-600 hover:border-[#1839AD]/40"
                }`}
              >
                {goal}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={otherGoal}
            onChange={(event) => setOtherGoal(event.target.value)}
            placeholder="Other (optional)"
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30"
          />
          <button
            type="button"
            onClick={handleAddOtherGoal}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-600 hover:border-[#1839AD]/40"
          >
            Add
          </button>
        </div>
        {goalCountError && (
          <p className="text-sm text-red-600 mt-2">{goalCountError}</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">Preferences (optional)</h2>
        <p className="text-sm text-gray-600 mt-1">
          Pick topics or skills you want to see more of.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((preference) => {
            const isSelected = preferences.includes(preference);
            return (
              <button
                key={preference}
                type="button"
                onClick={() =>
                  toggleSelection(preference, preferences, setPreferences, MAX_PREFERENCES)
                }
                className={`px-3 py-2 rounded-full text-sm border transition ${
                  isSelected
                    ? "border-[#1839AD] bg-[#1839AD]/10 text-[#1839AD]"
                    : "border-gray-200 text-gray-600 hover:border-[#1839AD]/40"
                }`}
              >
                {preference}
              </button>
            );
          })}
        </div>
        {preferencesError && (
          <p className="text-sm text-red-600 mt-2">{preferencesError}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back
        </button>
        <PrimaryButton onClick={handleSave} disabled={!canSave || isSaving}>
          {isSaving ? "Saving..." : "Save and continue"}
        </PrimaryButton>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Learner Onboarding"
      headerClassName="pt-4 pb-4 pl-0.5"
      titleClassName="text-3xl font-bold text-gray-900"
      setIsOpen={setIsOpen}
      isLoggedIn={isLoggedIn}
    >
      <div className="w-full max-w-3xl mx-auto px-4 lg:px-6 pb-10">
        <PageSection>
          <SectionContent>
            {isLoading || isDatabaseUserLoading ? (
              <div className="py-16 text-center text-gray-500">Loading onboarding...</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      step === 1 ? "bg-[#1839AD]" : "bg-gray-300"
                    }`}
                  ></span>
                  <span>Step {step} of 2</span>
                </div>
                {step === 1 ? renderStepOne() : renderStepTwo()}
              </div>
            )}
          </SectionContent>
        </PageSection>
      </div>
    </PageLayout>
  );
};

export default LearnerOnboarding;
