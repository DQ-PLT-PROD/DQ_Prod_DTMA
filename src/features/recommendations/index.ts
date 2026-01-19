/**
 * Recommendations Feature Exports (Dev D - Feature D4)
 *
 * Main exports for the recommendations feature
 */

// Components
export { RecommendationRail } from "./components/RecommendationRail";

// Utils
export {
  generateRecommendations,
  getRecommendationExplanation,
  getReasonDisplayText,
  validateRecommendationInput,
  getRecommendationAnalytics,
} from "./utils/recommendationEngine";

export type {
  RecommendationReason,
  CourseRecommendation,
  RecommendationResult,
} from "./utils/recommendationEngine";

// Default export for easy integration
export { RecommendationRail as default } from "./components/RecommendationRail";
