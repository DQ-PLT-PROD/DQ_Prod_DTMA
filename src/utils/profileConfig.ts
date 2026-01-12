/**
 * Profile Configuration
 *
 * Configuration data for company stages and other profile-related settings
 */

export interface CompanyStage {
  id: string;
  label: string;
  color: string;
}

export const profileConfig = {
  companyStages: [
    {
      id: "startup",
      label: "Startup",
      color: "bg-green-500",
    },
    {
      id: "growth",
      label: "Growth",
      color: "bg-blue-500",
    },
    {
      id: "mature",
      label: "Mature",
      color: "bg-purple-500",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      color: "bg-orange-500",
    },
  ] as CompanyStage[],
};
