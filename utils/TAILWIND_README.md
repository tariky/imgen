# Tailwind CSS Support for Satori

This project includes Tailwind CSS support for Satori layouts. You can use Tailwind utility classes instead of writing inline styles manually.

## Usage

### Basic Usage

Import the `tw` function and use it with template literals or strings:

```tsx
import { tw } from '../utils/tailwind';

// Template literal syntax (recommended)
<div style={tw`flex items-center justify-center bg-white`}>
  Content
</div>

// String syntax
<div style={tw('flex items-center justify-center bg-white')}>
  Content
</div>
```

### Combining with Custom Styles

You can combine Tailwind classes with custom inline styles:

```tsx
<div style={{
  ...tw`flex items-center justify-center`,
  fontSize: '24px', // Custom style
  fontFamily: 'Roboto, Roboto-Ext', // Custom style
}}>
  Content
</div>
```

## Supported Tailwind Classes

### Layout
- `flex`, `block`, `inline`, `inline-block`, `hidden`
- `flex-col`, `flex-row`
- `w-full`, `w-screen`, `w-[value]`, `w-{number}`
- `h-full`, `h-screen`, `h-[value]`, `h-{number}`

### Spacing
- `p-{number}`, `px-{number}`, `py-{number}`, `pt-{number}`, `pb-{number}`, `pl-{number}`, `pr-{number}`
- `m-{number}`, `mx-{number}`, `my-{number}`, `mt-{number}`, `mb-{number}`

### Typography
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`
- `text-{number}` (for custom pixel sizes)
- `font-thin`, `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- `font-{number}` (for custom weights)
- `text-white`, `text-black`, `text-{color}-{shade}`
- `uppercase`, `lowercase`, `capitalize`
- `underline`, `line-through`, `no-underline`
- `tracking-{number}` (letter spacing)
- `leading-none`, `leading-tight`, `leading-normal`, `leading-relaxed`

### Colors
- `bg-white`, `bg-black`, `bg-{color}-{shade}`
- `text-white`, `text-black`, `text-{color}-{shade}`

### Alignment
- `items-center`, `items-start`, `items-end`
- `justify-center`, `justify-between`, `justify-start`, `justify-end`

### Borders
- `border`, `border-0`
- `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

### Overflow
- `overflow-hidden`, `overflow-visible`

## Examples

### Example 1: Simple Flex Container
```tsx
<div style={tw`flex flex-col items-center justify-center w-full h-full bg-white`}>
  <h1 style={tw`text-4xl font-bold text-black mb-4`}>Title</h1>
  <p style={tw`text-lg text-gray-600`}>Description</p>
</div>
```

### Example 2: Card Layout
```tsx
<div style={tw`flex flex-col p-8 bg-white rounded-lg border`}>
  <div style={tw`flex items-center justify-between mb-4`}>
    <h2 style={tw`text-2xl font-bold`}>Card Title</h2>
    <span style={tw`text-sm text-gray-500`}>Badge</span>
  </div>
  <p style={tw`text-base text-gray-700`}>Card content</p>
</div>
```

### Example 3: Mixed Styles
```tsx
<div style={{
  ...tw`flex items-center justify-center`,
  width: '100%',
  height: '100%',
  backgroundColor: 'white',
  fontFamily: 'Roboto, Roboto-Ext',
  fontSize: '24px',
}}>
  Content with custom styles
</div>
```

## Notes

- The Tailwind converter uses a 4px spacing scale (standard Tailwind default)
- Custom values can be used with bracket notation: `w-[500px]`, `h-[80%]`
- You can always override Tailwind styles with custom inline styles
- Not all Tailwind classes are supported - only the most commonly used utilities
- For unsupported classes, use inline styles directly

## Adding More Classes

To add support for more Tailwind classes, edit `utils/tailwind.ts` and add new cases to the `parseClass` function.

