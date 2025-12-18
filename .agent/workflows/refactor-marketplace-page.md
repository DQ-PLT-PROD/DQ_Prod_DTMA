---
description: Refactor MarketplacePage.tsx to remove all knowledge-hub code
---

# Refactor MarketplacePage.tsx - Remove Knowledge-Hub Code

## Background
`MarketplacePage.tsx` is 1045 lines with knowledge-hub logic deeply integrated throughout.
The file handles both courses and knowledge-hub marketplace types but knowledge-hub is unused.

## Knowledge-Hub References (7 locations)
1. **Line 36**: Type union `"courses" | "knowledge-hub"` → change to `"courses"`
2. **Lines 12**: Import `getFallbackKnowledgeHubItems` → remove
3. **Lines 18-27**: `MEDIA_TYPE_FORMAT_MAPPING` constant → remove
4. **Lines 90-102**: Filter loading branch for knowledge-hub → remove block
5. **Lines 239-390**: Data loading branch for knowledge-hub → remove entire block
6. **Lines 611-700**: `filteredKnowledgeHubConfig` and `handleKnowledgeHubFilterChange` → remove
7. **Lines 866-909, 931-991**: Ternary conditionals in filter UI → simplify to courses-only

## Step-by-Step Approach

### 1. Change Type Definition
```typescript
// Line 36: Change from
marketplaceType: "courses" | "knowledge-hub";
// To
marketplaceType: "courses";
```

### 2. Remove Imports and Constants
- Remove line 12: `import { getFallbackKnowledgeHubItems } from "../../utils/fallbackData";`
- Remove lines 18-27: `MEDIA_TYPE_FORMAT_MAPPING` constant

### 3. Simplify Filter Loading (lines 90-128)
Remove the `if (marketplaceType === 'knowledge-hub')` block entirely.
The courses logic starting at line 94 should remain but remove the `if (marketplaceType === 'courses')` wrapper.

### 4. Remove Data Loading Branch (lines 239-390)
The entire `if (marketplaceType === 'knowledge-hub')` block should be removed.
Keep only the courses handling starting at line 392.

### 5. Remove Knowledge-Hub Filter Helpers (lines 611-700)
Remove:
- `filteredKnowledgeHubConfig` useMemo (lines 611-643)
- `handleKnowledgeHubFilterChange` useCallback (lines 645-700+)

### 6. Simplify Filter UI Ternaries
**Mobile filter (lines 866-909)**: Replace ternary with just the FilterSidebar:
```tsx
<div className="p-4">
  <FilterSidebar
    filters={filters}
    filterConfig={filterConfig}
    onFilterChange={handleFilterChange}
    onResetFilters={resetFilters}
    isResponsive={true}
    singleOpen={true}
  />
</div>
```

**Desktop filter (lines 931-991)**: Same approach - use only FilterSidebar.

## Verification
After each major change:
1. Run `npm run build` to check for errors
2. If errors occur, revert and try smaller changes

## Expected Outcome
- ~300 lines of dead code removed
- File simplified to courses-only
- Build passes
