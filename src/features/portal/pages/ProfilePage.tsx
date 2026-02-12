import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../components/Header";
import {
  getLearnerProfile,
  upsertLearnerProfile,
  RoleTrack,
} from "../../learner/services/learnerProfileService";
import {
  ROLE_OPTIONS,
  GOAL_OPTIONS,
  PREFERENCE_OPTIONS,
  MAX_GOALS,
  MAX_PREFERENCES,
  SENIORITY_OPTIONS,
  WEEKLY_CAPACITY_OPTIONS,
  TRANSFORMATION_EXPERIENCE_OPTIONS,
} from "../../learner/constants/profileOptions";

const ProfilePage: React.FC = () => {
  const { databaseUser, isDatabaseUserLoading, user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const toastRef = useRef(showToast);

  const [displayName, setDisplayName] = useState("");
  const [preferredEmail, setPreferredEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [roleTrack, setRoleTrack] = useState<RoleTrack | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [weeklyLearningCapacity, setWeeklyLearningCapacity] = useState("");
  const [transformationExperience, setTransformationExperience] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      const { profile, error } = await getLearnerProfile(userKey);

      if (requestIdRef.current !== requestId) {
        return;
      }

      if (error) {
        toastRef.current("Unable to load profile data.", "error");
      }

      if (profile) {
        setDisplayName(
          profile.displayName ||
            databaseUser?.name ||
            user?.name ||
            ""
        );
        setPreferredEmail(profile.preferredEmail || "");
        setPhoneNumber(profile.phoneNumber || "");
        setCountry(profile.country || "");
        setTimezone(profile.timezone || "");
        setRoleTrack(profile.roleTrack || null);
        setGoals(profile.goals || []);
        setPreferences(profile.preferences || []);
        setSeniorityLevel(profile.seniorityLevel || "");
        setWeeklyLearningCapacity(profile.weeklyLearningCapacity || "");
        setTransformationExperience(profile.transformationExperience || "");
      }

      loadedKeyRef.current = userKey;

      if (isFirstLoad) {
        setInitialLoading(false);
      }
      setIsRefreshing(false);
    };

    loadProfile();
  }, [userKey, isDatabaseUserLoading, databaseUser?.name, user?.name]);

  useEffect(() => {
    if (roleTrack !== "leader" && transformationExperience) {
      setTransformationExperience("");
    }
  }, [roleTrack, transformationExperience]);

  const displayNameError = displayName.trim() ? null : "Display name is required.";

  const preferredEmailError = useMemo(() => {
    if (!preferredEmail.trim()) {
      return null;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(preferredEmail.trim())
      ? null
      : "Preferred email must be a valid email address.";
  }, [preferredEmail]);

  const goalsError = useMemo(() => {
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

  const roleError = roleTrack ? null : "Role track is required.";
  const seniorityError = seniorityLevel ? null : "Seniority level is required.";
  const transformationError =
    roleTrack === "leader" && !transformationExperience
      ? "Transformation experience is required for leaders."
      : null;
  const canSave = !roleError
    && !displayNameError
    && !preferredEmailError
    && !goalsError
    && !preferencesError
    && !seniorityError
    && !transformationError;

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

  const handleSave = async () => {
    if (!userKey) {
      showToast("Profile is not available yet.", "error");
      return;
    }

    if (!canSave) {
      showToast(
        roleError
          || displayNameError
          || preferredEmailError
          || seniorityError
          || transformationError
          || goalsError
          || preferencesError
          || "Fix validation errors.",
        "error"
      );
      return;
    }

    setIsSaving(true);
    const trimmedDisplayName = displayName.trim();
    const trimmedPreferredEmail = preferredEmail.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedCountry = country.trim();
    const trimmedTimezone = timezone.trim();
    const result = await upsertLearnerProfile(userKey, {
      displayName: trimmedDisplayName || null,
      preferredEmail: trimmedPreferredEmail || null,
      phoneNumber: trimmedPhoneNumber || null,
      country: trimmedCountry || null,
      timezone: trimmedTimezone || null,
      roleTrack,
      goals,
      preferences,
      seniorityLevel: seniorityLevel || null,
      weeklyLearningCapacity: weeklyLearningCapacity || null,
      transformationExperience:
        roleTrack === "leader" ? transformationExperience || null : null,
    });
    setIsSaving(false);

    if (!result) {
      showToast("Failed to save profile changes.", "error");
      return;
    }

    showToast("Profile updated successfully.", "success");
  };

  return (
    <div className="p-3 md:p-4 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your learner profile details.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-8">
          {initialLoading || isDatabaseUserLoading ? (
            <div className="py-12 text-center text-gray-500">Loading profile...</div>
          ) : (
            <>
              {isRefreshing && (
                <p className="text-sm text-gray-500">Refreshing profile data...</p>
              )}
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Basic information</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update how your profile appears to you and the platform.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Display name
                    </label>
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30"
                      placeholder="Your preferred name"
                    />
                    {displayNameError && (
                      <p className="text-sm text-red-600 mt-1">{displayNameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email (read-only)
                    </label>
                    <input
                      value={databaseUser?.email || user?.email || ""}
                      readOnly
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred email (optional)
                    </label>
                    <input
                      value={preferredEmail}
                      onChange={(event) => setPreferredEmail(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30"
                      placeholder="name@company.com"
                    />
                    {preferredEmailError && (
                      <p className="text-sm text-red-600 mt-1">{preferredEmailError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone number (optional)
                    </label>
                    <input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30"
                      placeholder="+971 50 000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country (optional)
                    </label>
                    <input
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30"
                      placeholder="United Arab Emirates"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Timezone (optional)
                    </label>
                    <input
                      value={timezone}
                      onChange={(event) => setTimezone(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD]/30"
                      placeholder="Asia/Dubai"
                    />
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Role track</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose the track that best fits your current role.
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
                {roleError && <p className="text-sm text-red-600">{roleError}</p>}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Seniority level</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tell us where you are in your career.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SENIORITY_OPTIONS.map((option) => {
                    const isSelected = seniorityLevel === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSeniorityLevel(option.value)}
                        className={`p-4 rounded-lg border text-left transition ${
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
                {seniorityError && (
                  <p className="text-sm text-red-600">{seniorityError}</p>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Weekly learning capacity</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Optional: Let us know how much time you can commit weekly.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {WEEKLY_CAPACITY_OPTIONS.map((option) => {
                    const isSelected = weeklyLearningCapacity === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setWeeklyLearningCapacity(option.value)}
                        className={`p-4 rounded-lg border text-left transition ${
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
              </section>

              {roleTrack === "leader" && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Transformation experience
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Leaders are asked to share their transformation experience.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TRANSFORMATION_EXPERIENCE_OPTIONS.map((option) => {
                      const isSelected = transformationExperience === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTransformationExperience(option.value)}
                          className={`p-4 rounded-lg border text-left transition ${
                            isSelected
                              ? "border-[#1839AD] bg-[#1839AD]/5"
                              : "border-gray-200 hover:border-[#1839AD]/40"
                          }`}
                        >
                          <div className="text-lg font-semibold text-gray-900">
                            {option.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {transformationError && (
                    <p className="text-sm text-red-600">{transformationError}</p>
                  )}
                </section>
              )}

              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Goals</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select up to {MAX_GOALS} goals.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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
                {goalsError && <p className="text-sm text-red-600">{goalsError}</p>}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select up to {MAX_PREFERENCES} preferences.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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
                  <p className="text-sm text-red-600">{preferencesError}</p>
                )}
              </section>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#1839AD] hover:bg-[#132b7c] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default ProfilePage;
