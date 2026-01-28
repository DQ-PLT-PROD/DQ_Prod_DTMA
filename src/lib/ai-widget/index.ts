/**
 * AI Widget Feature Exports (Dev D - Feature D3)
 *
 * Main exports for the AI Widget feature
 */

// Components
export { AIWidget } from "./components/AIWidget";
export { AIWidgetContainer } from "./components/AIWidgetContainer";
export { AIWidgetStandalone } from "./components/AIWidgetStandalone";

// Hooks
export { useAIWidget } from "./hooks/useAIWidget";
export type { AIWidgetHook } from "./hooks/useAIWidget";

// Utils
export {
  matchIntent,
  getFallbackResponse,
  getIntentById,
  getIntentsByCategory,
  intentRegistry,
  quickActions,
} from "./utils/intentRegistry";

export type { IntentResponse, IntentAction } from "./utils/intentRegistry";

// Default export for easy integration
export { AIWidgetStandalone as default } from "./components/AIWidgetStandalone";
