# UI Component Library - Button

## Overview
The Button component is a reusable, customizable button component that provides consistent styling across the frontend application. It uses the primary accent color **#3858e9** and follows BEM naming conventions.

## Features
- ✅ 5 variants: primary, secondary, danger, ghost, link
- ✅ 3 sizes: sm, md, lg
- ✅ Loading state with animated spinner
- ✅ Icon support (left or right positioned)
- ✅ Full-width option
- ✅ Disabled state
- ✅ Accessibility support (aria-label)
- ✅ SCSS-based styling (no Tailwind dependency)

## Installation
The Button component is already integrated into the frontend build system:

**File Structure:**
```
src/frontend/components/ui/
├── Button.js          # React component
├── Button.scss        # SCSS styles
└── index.js           # Exports
```

**SCSS Import:**
The Button styles are automatically imported in `frontend.scss`:
```scss
@import '../components/ui/Button.scss';
```

## Usage

### Basic Import
```jsx
import { Button } from './components/ui';
```

### Examples

#### Primary Button (Default)
```jsx
<Button onClick={handleClick}>
  Save Changes
</Button>
```

#### Variants
```jsx
{/* Primary - uses #3858e9 accent */}
<Button variant="primary">Primary Action</Button>

{/* Secondary - gray background */}
<Button variant="secondary">Secondary Action</Button>

{/* Danger - red for destructive actions */}
<Button variant="danger">Delete</Button>

{/* Ghost - transparent with hover */}
<Button variant="ghost">Cancel</Button>

{/* Link - styled like a link */}
<Button variant="link">Learn More</Button>
```

#### Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>  {/* Default */}
<Button size="lg">Large</Button>
```

#### Loading State
```jsx
<Button 
  variant="primary" 
  loading={isSubmitting}
  type="submit"
>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

#### With Icons
```jsx
import { PlusIcon } from '@heroicons/react/24/outline';

<Button 
  variant="primary" 
  icon={<PlusIcon />}
  iconPosition="left"
>
  Add New
</Button>
```

#### Full Width
```jsx
<Button fullWidth variant="primary">
  Continue
</Button>
```

#### Disabled State
```jsx
<Button disabled variant="primary">
  Cannot Click
</Button>
```

#### Form Submission
```jsx
<Button 
  type="submit" 
  variant="primary"
  disabled={!isValid}
>
  Submit Form
</Button>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Button content |
| `variant` | string | `'primary'` | Button style variant: `'primary'`, `'secondary'`, `'danger'`, `'ghost'`, `'link'` |
| `size` | string | `'md'` | Button size: `'sm'`, `'md'`, `'lg'` |
| `disabled` | boolean | `false` | Whether button is disabled |
| `loading` | boolean | `false` | Whether button shows loading spinner |
| `fullWidth` | boolean | `false` | Whether button takes full width |
| `className` | string | `''` | Additional CSS classes |
| `onClick` | function | - | Click handler |
| `type` | string | `'button'` | Button type: `'button'`, `'submit'`, `'reset'` |
| `icon` | ReactNode | - | Icon element to display |
| `iconPosition` | string | `'left'` | Icon position: `'left'`, `'right'` |
| `ariaLabel` | string | - | Accessible label for screen readers |

## Styling

### Color Scheme
```scss
$accent-color: #3858e9;     // Primary button background
$accent-hover: #2d46ba;     // Primary button hover
$accent-active: #243a94;    // Primary button active
```

### Customization
The Button component uses SCSS variables and BEM naming:

```scss
.cht-button {
  // Base styles
}

.cht-button--primary {
  // Primary variant
}

.cht-button--sm {
  // Small size
}

.cht-button__icon {
  // Icon wrapper
}
```

To customize, modify `src/frontend/components/ui/Button.scss`.

## Components Updated
The Button component has been integrated into the following frontend components:

- ✅ `CommentPopup.js` - Save/Cancel buttons with loading state
- ✅ `CommentMarker.js` - Reply buttons with loading state
- ✅ `CommentSidebar.js` - Reply/Cancel buttons with small size

## Migration Notes

### Before
```jsx
<button 
  type="submit" 
  className="cht-btn cht-btn-primary"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="cht-spinner"></span>
      Saving...
    </>
  ) : (
    'Save Comment'
  )}
</button>
```

### After
```jsx
<Button 
  type="submit" 
  variant="primary"
  disabled={isLoading}
  loading={isLoading}
>
  {isLoading ? 'Saving...' : 'Save Comment'}
</Button>
```

## Benefits
1. **Consistency** - All buttons use the same styling and behavior
2. **Maintainability** - Single source of truth for button styles
3. **Accessibility** - Built-in aria-label support and keyboard navigation
4. **Loading States** - Automatic spinner with proper disabled state
5. **Customizable** - Easy to extend with new variants or sizes
6. **Type Safety** - Clear prop definitions with defaults

## Future Enhancements
- [ ] Add more variants (warning, info, success)
- [ ] Add icon-only button variant
- [ ] Add button group component
- [ ] Add tooltip support
- [ ] Add keyboard shortcuts
- [ ] Add animation variants

## Browser Support
The Button component supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance
- Minimal bundle size impact (~3KB gzipped)
- CSS animations use hardware acceleration
- No runtime dependencies beyond React
