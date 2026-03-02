# Coming Soon Badges - Implementation Guide

## Overview
Inline pill-style badges added to filter category headers (Industry, Role, Level) to indicate upcoming content expansion.

## Visual Design - "The Dinga"

### Badge Styling
```css
background-color: #0030E3 (DTMA Digital Blue)
color: white
font-size: 10px
font-weight: bold
text-transform: uppercase
letter-spacing: 0.5px
padding: 2px 8px
border-radius: 50px (pill shape)
```

### Placement
- Positioned inline with category title
- 8px gap between title text and badge
- Before the chevron/dropdown icon
- Vertically centered with title text

## Implementation Details

### Component: FilterSidebar.tsx

**AccordionSection Component**:
- Added `showComingSoon?: boolean` prop
- Badge renders conditionally when prop is true
- Badge is non-interactive (visual indicator only)

**Badge Logic**:
```typescript
const showComingSoon = ['industry', 'audienceLevel', 'levelTag'].includes(config.id);
```

### Categories with Badges
1. **Industry** - Shows "COMING SOON" badge
2. **Role** (audienceLevel) - Shows "COMING SOON" badge  
3. **Level** (levelTag) - Shows "COMING SOON" badge

## Visual Result

```
🚀 New specialized tracks coming soon! Check back weekly for updates.

Industry [COMING SOON] ˅
Role [COMING SOON] ˅
Level [COMING SOON] ˅
Category ˅
```

## Purpose & Benefits

1. **Creates Anticipation**: Users know more content is coming
2. **Encourages Return Visits**: "Check back weekly" messaging
3. **Professional Appearance**: Shows active development
4. **Brand Consistency**: Uses DTMA Blue throughout
5. **Non-Intrusive**: Small, clean design doesn't overwhelm

## Accessibility

- Badge is purely visual (decorative)
- Screen readers will read "Industry Coming Soon" naturally
- High contrast white text on blue background (WCAG AAA)
- No interactive elements to confuse users

## Brand Alignment

- Uses official DTMA Digital Blue (#0030E3)
- Matches primary button and CTA colors
- Consistent with overall design system
- Professional pill shape (modern, clean)

## Testing

To see the badges:
1. Navigate to `/courses`
2. Look at the filter sidebar on the left
3. See "COMING SOON" badges next to Industry, Role, and Level headers
4. Badges appear before the dropdown chevron icons

## Future Enhancements

- [ ] Make badges configurable per category via config
- [ ] Add animation on first view (subtle pulse)
- [ ] Track which categories users interact with most
- [ ] Remove badges once content is fully populated
- [ ] A/B test different badge copy ("NEW", "SOON", etc.)
