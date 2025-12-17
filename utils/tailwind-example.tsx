/**
 * Example usage of Tailwind CSS utilities with Satori
 * 
 * You can use Tailwind classes in two ways:
 * 
 * 1. Template literal syntax:
 *    <div style={tw`flex items-center justify-center bg-white`}>
 * 
 * 2. String syntax:
 *    <div style={tw('flex items-center justify-center bg-white')}>
 * 
 * 3. Combine with existing styles:
 *    <div style={{ ...tw`flex items-center`, fontSize: '24px' }}>
 */

import { tw } from './tailwind';

// Example component using Tailwind
export function ExampleComponent() {
  return (
    <div style={tw`flex flex-col w-full h-full bg-white`}>
      <div style={tw`flex items-center justify-center p-8`}>
        <h1 style={tw`text-4xl font-bold text-black`}>Hello World</h1>
      </div>
      
      <div style={tw`flex flex-row justify-between px-4 py-2`}>
        <span style={tw`text-lg text-gray-600`}>Left</span>
        <span style={tw`text-lg text-gray-600`}>Right</span>
      </div>
    </div>
  );
}

// Example combining Tailwind with custom styles
export function MixedStylesExample() {
  return (
    <div style={{
      ...tw`flex items-center justify-center`,
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      fontSize: '24px', // Override or add custom styles
    }}>
      Content
    </div>
  );
}

