---
name: Material Design 3 System
description: Complete Material Design 3 implementation guide for React/Tailwind applications. Provides M3-compliant tokens, component patterns, accessibility guidelines, and best practices for building modern, consistent interfaces.
---

# Material Design 3 System

## When to Use This Skill

Use this skill when you need to:
- **Implement Material Design 3** in a React/Tailwind application
- **Create or update** a design system following M3 specifications
- **Ensure accessibility** and consistency across UI components
- **Apply M3 tokens** (colors, typography, elevation, shape)
- **Build M3 components** (buttons, cards, inputs, dialogs, FABs)
- **Understand M3 patterns** for layout, motion, and interaction

## Overview

Material Design 3 (M3) is Google's latest design system, featuring:
- **Tonal color system** with semantic roles and dynamic color support
- **Expanded typography scale** (Display, Headline, Title, Body, Label)
- **Tonal elevation** using surface tints + shadows
- **Accessibility-first** approach (WCAG 2.1 AA compliance)
- **Adaptive components** that work across platforms

This skill provides a complete M3 implementation for web applications using React and Tailwind CSS.

---

## Token System

### Color Tokens

M3 uses a **semantic color system** with specific roles. All tokens are defined in `tokens/colors.json`.

#### Primary Colors
Main brand color for key actions.

```tsx
// Filled button
<button className="bg-primary text-on-primary">Action</button>

// Tonal button
<button className="bg-primary-container text-on-primary-container">Action</button>
```

**Tokens**:
- `primary` - Main brand color (#0030E3)
- `primary-container` - Tonal variant (#DDE3FF)
- `on-primary` - Text on primary (#FFFFFF)
- `on-primary-container` - Text on container (#000E44)

#### Secondary & Tertiary
Supporting and accent colors.

```tsx
// Secondary action
<button className="bg-secondary text-on-secondary">Secondary</button>

// Tertiary accent
<div className="bg-tertiary-container text-on-tertiary-container">Accent</div>
```

#### Surface & Elevation
Background colors with tonal elevation support.

```tsx
// Base surface
<div className="bg-surface text-on-surface">Content</div>

// Elevated surface (Level 1)
<div className="bg-surface-level-1 shadow-sm">Elevated Card</div>

// Elevated surface (Level 3)
<div className="bg-surface-level-3 shadow-md">Modal</div>
```

**Elevation Levels**:
- `surface-level-0` - Base (0% tint)
- `surface-level-1` - Elevated cards (5% tint + shadow-sm)
- `surface-level-2` - Floating elements (8% tint + shadow)
- `surface-level-3` - Modals, menus (11% tint + shadow-md)
- `surface-level-4` - Navigation drawer (12% tint + shadow-lg)
- `surface-level-5` - App bar, FAB (14% tint + shadow-xl)

#### Error & Neutral
Error states and neutral tones.

```tsx
// Error message
<div className="bg-error-container text-on-error-container">Error</div>

// Neutral text
<p className="text-neutral-700">Body text</p>
<p className="text-neutral-500">Disabled text</p>
```

### Typography Tokens

M3 defines 5 type scales with 3 sizes each. See `tokens/typography.json`.

```tsx
// Display (hero text)
<h1 className="text-display-lg">Hero Headline</h1>
<h2 className="text-display-md">Page Hero</h2>

// Headline (titles)
<h1 className="text-headline-lg">Page Title</h1>
<h2 className="text-headline-md">Section Title</h2>
<h3 className="text-headline-sm">Card Title</h3>

// Title (subtitles)
<h4 className="text-title-lg">List Header</h4>
<h5 className="text-title-md">Subheading</h5>

// Body (content)
<p className="text-body-lg">Lead paragraph</p>
<p className="text-body-md">Body copy</p>
<p className="text-body-sm">Caption</p>

// Label (UI elements)
<span className="text-label-lg">Button</span>
<span className="text-label-md">Tab</span>
```

**Font Family**: Roboto, Inter, system-ui, sans-serif

### Shape Tokens

Border radius values for components.

```tsx
// Buttons, FABs
<button className="rounded-full">Action</button>

// Cards, dialogs
<div className="rounded-md">Card</div>
<div className="rounded-xl">Dialog</div>

// Small elements
<div className="rounded-xs">Chip</div>
<div className="rounded-sm">Checkbox</div>
```

**Tokens**:
- `rounded-none` (0px) - Full-bleed
- `rounded-xs` (4px) - Small chips
- `rounded-sm` (8px) - Checkboxes
- `rounded-md` (12px) - Cards, inputs
- `rounded-lg` (16px) - Dialogs
- `rounded-xl` (28px) - Large containers
- `rounded-full` (9999px) - Buttons, FABs

### Spacing Tokens

4px grid system.

```tsx
// Standard padding
<div className="p-4">16px padding</div>

// Section spacing
<div className="p-6">24px padding</div>

// Grid gaps
<div className="grid gap-4">16px gap</div>
<div className="grid gap-8">32px gap</div>
```

---

## Component Patterns

### Buttons

M3 defines 5 button types. See `examples/button-examples.tsx`.

#### 1. Filled Button (High Emphasis)

```tsx
<button className="
  h-10 px-6 
  bg-primary text-on-primary 
  rounded-full 
  shadow-sm hover:shadow-md 
  transition-all duration-200 
  text-label-lg
">
  Primary Action
</button>
```

**When to use**: Primary action on a screen (e.g., "Submit", "Save", "Continue").

#### 2. Filled Tonal Button (Medium Emphasis)

```tsx
<button className="
  h-10 px-6 
  bg-primary-container text-on-primary-container 
  rounded-full 
  hover:shadow-sm 
  transition-all duration-200 
  text-label-lg
">
  Secondary Action
</button>
```

**When to use**: Important but not primary actions.

#### 3. Outlined Button (Medium Emphasis)

```tsx
<button className="
  h-10 px-6 
  border border-outline 
  text-primary 
  rounded-full 
  hover:bg-primary/5 
  transition-all duration-200 
  text-label-lg
">
  Outlined Action
</button>
```

**When to use**: Alternative actions, filters, toggles.

#### 4. Text Button (Low Emphasis)

```tsx
<button className="
  h-10 px-4 
  text-primary 
  rounded-full 
  hover:bg-primary/5 
  transition-all duration-200 
  text-label-lg
">
  Text Action
</button>
```

**When to use**: Tertiary actions, "Cancel", "Learn More".

#### 5. Elevated Button (Special Emphasis)

```tsx
<button className="
  h-10 px-6 
  bg-surface-level-1 text-primary 
  rounded-full 
  shadow-sm hover:shadow-md 
  transition-all duration-200 
  text-label-lg
">
  Elevated Action
</button>
```

**When to use**: Important actions that need to stand out from filled buttons.

### Cards

Three card variants. See `examples/card-examples.tsx`.

#### 1. Elevated Card (Default)

```tsx
<div className="
  bg-surface-level-1 
  rounded-md 
  shadow-sm hover:shadow-md 
  p-4 
  transition-all duration-200
">
  <h3 className="text-headline-sm mb-2">Card Title</h3>
  <p className="text-body-md text-on-surface-variant">Card content</p>
</div>
```

**When to use**: Default card style for most content.

#### 2. Filled Card (Subtle)

```tsx
<div className="
  bg-surface-variant 
  rounded-md 
  p-4
">
  <h3 className="text-headline-sm mb-2">Card Title</h3>
  <p className="text-body-md text-on-surface-variant">Card content</p>
</div>
```

**When to use**: Less prominent cards, secondary content.

#### 3. Outlined Card

```tsx
<div className="
  bg-surface 
  border border-outline-variant 
  rounded-md 
  p-4 
  hover:border-outline 
  transition-colors duration-200
">
  <h3 className="text-headline-sm mb-2">Card Title</h3>
  <p className="text-body-md text-on-surface-variant">Card content</p>
</div>
```

**When to use**: Cards that need clear boundaries, selectable cards.

### Text Fields

Two input styles.

#### Filled Text Field

```tsx
<div className="relative">
  <input 
    className="
      w-full h-14 px-4 pt-6 pb-2
      bg-surface-variant 
      border-b-2 border-outline 
      focus:border-primary 
      rounded-t-sm 
      text-body-lg 
      transition-colors duration-200
      peer
    " 
    placeholder=" "
  />
  <label className="
    absolute left-4 top-2 
    text-body-sm text-on-surface-variant
    peer-placeholder-shown:top-4 peer-placeholder-shown:text-body-lg
    peer-focus:top-2 peer-focus:text-body-sm
    transition-all duration-200
  ">
    Label
  </label>
</div>
```

#### Outlined Text Field

```tsx
<div className="relative">
  <input 
    className="
      w-full h-14 px-4 
      bg-surface 
      border border-outline 
      focus:border-2 focus:border-primary 
      rounded-sm 
      text-body-lg 
      transition-all duration-200
    " 
  />
  <label className="
    absolute left-4 -top-2 px-1 
    bg-surface 
    text-body-sm text-on-surface-variant
  ">
    Label
  </label>
</div>
```

### Floating Action Button (FAB)

```tsx
// Standard FAB
<button className="
  w-14 h-14 
  bg-primary-container text-on-primary-container 
  rounded-xl 
  shadow-md hover:shadow-lg 
  flex items-center justify-center 
  transition-all duration-200
">
  <PlusIcon className="w-6 h-6" />
</button>

// Extended FAB
<button className="
  h-14 px-4 
  bg-primary-container text-on-primary-container 
  rounded-xl 
  shadow-md hover:shadow-lg 
  flex items-center gap-2 
  transition-all duration-200
">
  <PlusIcon className="w-6 h-6" />
  <span className="text-label-lg">Create</span>
</button>
```

### Dialogs

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="
    bg-surface-level-3 
    rounded-xl 
    shadow-xl 
    p-6 
    max-w-md w-full 
    mx-4
  ">
    <h2 className="text-headline-sm mb-4">Dialog Title</h2>
    <p className="text-body-md text-on-surface-variant mb-6">
      Dialog content goes here. Explain the action or provide information.
    </p>
    <div className="flex justify-end gap-2">
      <button className="h-10 px-4 text-primary rounded-full hover:bg-primary/5 transition-all duration-200">
        Cancel
      </button>
      <button className="h-10 px-6 bg-primary text-on-primary rounded-full shadow-sm hover:shadow-md transition-all duration-200">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## Layout Patterns

### Responsive Grid

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
    <div className="col-span-4 md:col-span-4 lg:col-span-6">Column 1</div>
    <div className="col-span-4 md:col-span-4 lg:col-span-6">Column 2</div>
  </div>
</div>
```

**Grid System**:
- Mobile: 4 columns, 16px gutter
- Tablet: 8 columns, 24px gutter
- Desktop: 12 columns, 32px gutter

### Page Container

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  {/* Page content */}
</div>
```

---

## Motion & Transitions

### Standard Transitions

```tsx
// Default hover/focus
className="transition-all duration-200 ease-in-out"

// Enter animations
className="transition-all duration-300 ease-in-out"

// Exit animations  
className="transition-all duration-200 ease-out"
```

### Easing Curves

```css
/* Standard (default) */
transition: all 200ms cubic-bezier(0.2, 0, 0, 1);

/* Emphasized (enter) */
transition: all 300ms cubic-bezier(0.2, 0, 0, 1);

/* Emphasized Decelerate (exit) */
transition: all 200ms cubic-bezier(0.05, 0.7, 0.1, 1);
```

---

## Accessibility Guidelines

### Contrast Requirements

All color combinations meet **WCAG 2.1 AA** standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Touch Targets

Minimum tap area: **44×44px** for all interactive elements.

```tsx
// Correct: 44px minimum
<button className="h-11 px-6">Action</button>

// Incorrect: Too small
<button className="h-8 px-4">Action</button>
```

### Focus Indicators

Always provide visible focus indicators.

```tsx
<button className="
  focus:outline-none 
  focus:ring-2 focus:ring-primary focus:ring-offset-2
">
  Action
</button>
```

### Screen Reader Support

Use semantic HTML and ARIA labels.

```tsx
<button aria-label="Close dialog">
  <XIcon className="w-6 h-6" />
</button>
```

---

## Best Practices

### ✅ Do

- **Use semantic tokens**: `bg-primary` instead of `bg-[#0030E3]`
- **Apply tonal elevation**: Combine surface tints with shadows
- **Follow M3 shape system**: `rounded-full` for buttons, `rounded-md` for cards
- **Maintain touch targets**: 44px minimum for interactive elements
- **Use M3 type scale**: Apply correct typography tokens for hierarchy
- **Implement standard transitions**: Use M3 easing curves and durations
- **Ensure accessibility**: Meet WCAG 2.1 AA contrast requirements
- **Test responsively**: Verify layouts on mobile, tablet, and desktop

### ❌ Don't

- **Don't use arbitrary colors**: Avoid hardcoded hex values
- **Don't mix shape styles**: Keep button shapes consistent
- **Don't use shadows alone**: Always combine with surface tints for elevation
- **Don't create custom spacing**: Stick to the 4px grid system
- **Don't ignore contrast**: Always check color combinations
- **Don't use extreme transitions**: Keep durations between 50ms-400ms
- **Don't skip focus indicators**: Always provide visible focus states
- **Don't use small touch targets**: Never go below 44px

---

## Implementation Checklist

### Initial Setup

- [ ] Install Tailwind CSS and configure theme
- [ ] Add M3 color tokens to `tailwind.config.js`
- [ ] Add M3 typography scale to `tailwind.config.js`
- [ ] Add M3 shape tokens (border radius)
- [ ] Add M3 elevation tokens (shadows + surface tints)
- [ ] Configure font family (Roboto or Inter)

### Component Development

- [ ] Create button variants (Filled, Tonal, Outlined, Text, Elevated)
- [ ] Create card variants (Elevated, Filled, Outlined)
- [ ] Create text field variants (Filled, Outlined)
- [ ] Create FAB component (Standard, Extended)
- [ ] Create dialog/modal component
- [ ] Implement focus indicators on all interactive elements
- [ ] Test touch targets (44px minimum)

### Accessibility

- [ ] Verify all color combinations meet WCAG 2.1 AA
- [ ] Add ARIA labels to icon-only buttons
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Ensure focus indicators are visible

### Testing

- [ ] Test on mobile devices (320px - 640px)
- [ ] Test on tablets (640px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Verify dark mode support (if applicable)
- [ ] Test with assistive technologies

---

## Quick Reference

### Common Patterns

```tsx
// Primary action button
<button className="h-10 px-6 bg-primary text-on-primary rounded-full shadow-sm hover:shadow-md transition-all duration-200">
  Action
</button>

// Elevated card
<div className="bg-surface-level-1 rounded-md shadow-sm hover:shadow-md p-4 transition-all duration-200">
  Content
</div>

// Text input
<input className="w-full h-14 px-4 bg-surface-variant border-b-2 border-outline focus:border-primary rounded-t-sm transition-colors duration-200" />

// FAB
<button className="w-14 h-14 bg-primary-container text-on-primary-container rounded-xl shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200">
  <Icon />
</button>
```

---

## Resources

- **M3 Guidelines**: [https://m3.material.io](https://m3.material.io)
- **Theme Builder**: [https://material-foundation.github.io/material-theme-builder/](https://material-foundation.github.io/material-theme-builder/)
- **Color Utilities**: [https://github.com/material-foundation/material-color-utilities](https://github.com/material-foundation/material-color-utilities)
- **Accessibility**: [https://m3.material.io/foundations/accessible-design/overview](https://m3.material.io/foundations/accessible-design/overview)
- **Components**: [https://m3.material.io/components](https://m3.material.io/components)

---

## Support

For questions or issues with this skill:
1. Review the M3 guidelines at [m3.material.io](https://m3.material.io)
2. Check the token files in `tokens/` directory
3. Review examples in `examples/` directory
4. Consult templates in `templates/` directory
