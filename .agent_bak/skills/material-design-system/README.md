# Material Design 3 System Skill

Complete Material Design 3 implementation guide for React/Tailwind applications.

## Quick Start

1. **Review SKILL.md** for comprehensive documentation
2. **Check tokens/** for M3 token definitions
3. **Explore examples/** for component implementations
4. **Use templates/** for Tailwind configuration

## Token Files

- `tokens/colors.json` - M3 color system with semantic roles
- `tokens/typography.json` - M3 type scale (Display, Headline, Title, Body, Label)
- `tokens/spacing.json` - 4px grid spacing system
- `tokens/elevation.json` - Tonal elevation levels

## Examples

- `examples/button-examples.tsx` - All 5 M3 button variants
- `examples/card-examples.tsx` - All 3 M3 card variants

## Templates

- `templates/tailwind.config.template.js` - Tailwind configuration with M3 tokens

## Key Concepts

### Color System
M3 uses **semantic color roles** (primary, secondary, tertiary, error, surface) with container and on-color variants.

### Tonal Elevation
M3 creates depth using **surface tints + shadows** instead of shadows alone.

### Typography Scale
M3 defines **5 type scales × 3 sizes** for comprehensive hierarchy.

### Accessibility
All tokens meet **WCAG 2.1 AA** contrast requirements.

## Common Patterns

```tsx
// Filled button
<button className="h-10 px-6 bg-primary text-on-primary rounded-full shadow-sm hover:shadow-md transition-all duration-200">
  Action
</button>

// Elevated card
<div className="bg-surface-level-1 rounded-md shadow-sm hover:shadow-md p-4 transition-all duration-200">
  Content
</div>

// Text input
<input className="w-full h-14 px-4 bg-surface-variant border-b-2 border-outline focus:border-primary rounded-t-sm transition-colors duration-200" />
```

## Resources

- **M3 Guidelines**: https://m3.material.io
- **Theme Builder**: https://material-foundation.github.io/material-theme-builder/
- **Accessibility**: https://m3.material.io/foundations/accessible-design/overview

## Support

For detailed documentation, see **SKILL.md**.
