/**
 * Tailwind CSS to inline styles converter for Satori
 * Converts Tailwind utility classes to inline style objects compatible with Satori
 */

type StyleObject = Record<string, string | number>;

/**
 * Convert Tailwind CSS classes to inline styles
 * Usage: tw`flex items-center justify-center bg-white`
 * Or: tw('flex items-center justify-center')
 */
export function tw(classes: TemplateStringsArray | string, ...values: any[]): StyleObject {
  let classString: string;
  
  if (typeof classes === 'object' && 'raw' in classes) {
    // Template literal
    classString = String.raw(classes, ...values);
  } else {
    // Regular string
    classString = classes as string;
  }
  
  return parseTailwindClasses(classString);
}

/**
 * Parse Tailwind classes and convert to inline styles
 */
function parseTailwindClasses(classes: string): StyleObject {
  const styles: StyleObject = {};
  const classList = classes.split(/\s+/).filter(Boolean);
  
  for (const className of classList) {
    Object.assign(styles, parseClass(className));
  }
  
  return styles;
}

/**
 * Parse a single Tailwind class and return style object
 */
function parseClass(className: string): StyleObject {
  const styles: StyleObject = {};
  
  // Display utilities
  if (className === 'flex') {
    styles.display = 'flex';
  } else if (className === 'block') {
    styles.display = 'block';
  } else if (className === 'inline') {
    styles.display = 'inline';
  } else if (className === 'inline-block') {
    styles.display = 'inline-block';
  } else if (className === 'hidden') {
    styles.display = 'none';
  }
  
  // Flex direction
  else if (className === 'flex-col' || className === 'flex-column') {
    styles.flexDirection = 'column';
  } else if (className === 'flex-row') {
    styles.flexDirection = 'row';
  }
  
  // Width
  else if (className === 'w-full') {
    styles.width = '100%';
  } else if (className === 'w-screen') {
    styles.width = '100vw';
  } else if (className.match(/^w-(\d+)$/)) {
    const match = className.match(/^w-(\d+)$/);
    if (match) {
      styles.width = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className.match(/^w-\[(.+)\]$/)) {
    const match = className.match(/^w-\[(.+)\]$/);
    if (match) {
      styles.width = match[1];
    }
  }
  
  // Height
  else if (className === 'h-full') {
    styles.height = '100%';
  } else if (className === 'h-screen') {
    styles.height = '100vh';
  } else if (className.match(/^h-(\d+)$/)) {
    const match = className.match(/^h-(\d+)$/);
    if (match) {
      styles.height = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className.match(/^h-\[(.+)\]$/)) {
    const match = className.match(/^h-\[(.+)\]$/);
    if (match) {
      styles.height = match[1];
    }
  }
  
  // Padding
  else if (className.match(/^p-(\d+)$/)) {
    const match = className.match(/^p-(\d+)$/);
    if (match) {
      const value = parseInt(match[1]) * 4;
      styles.padding = `${value}px`;
    }
  } else if (className === 'p-0') {
    styles.padding = '0';
  } else if (className === 'px-0') {
    styles.paddingLeft = '0';
    styles.paddingRight = '0';
  } else if (className === 'py-0') {
    styles.paddingTop = '0';
    styles.paddingBottom = '0';
  } else if (className.match(/^px-(\d+)$/)) {
    const match = className.match(/^px-(\d+)$/);
    if (match) {
      const value = parseInt(match[1]) * 4;
      styles.paddingLeft = `${value}px`;
      styles.paddingRight = `${value}px`;
    }
  } else if (className.match(/^py-(\d+)$/)) {
    const match = className.match(/^py-(\d+)$/);
    if (match) {
      const value = parseInt(match[1]) * 4;
      styles.paddingTop = `${value}px`;
      styles.paddingBottom = `${value}px`;
    }
  } else if (className.match(/^pt-(\d+)$/)) {
    const match = className.match(/^pt-(\d+)$/);
    if (match) {
      styles.paddingTop = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className.match(/^pb-(\d+)$/)) {
    const match = className.match(/^pb-(\d+)$/);
    if (match) {
      styles.paddingBottom = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className.match(/^pl-(\d+)$/)) {
    const match = className.match(/^pl-(\d+)$/);
    if (match) {
      styles.paddingLeft = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className.match(/^pr-(\d+)$/)) {
    const match = className.match(/^pr-(\d+)$/);
    if (match) {
      styles.paddingRight = `${parseInt(match[1]) * 4}px`;
    }
  }
  
  // Margin
  else if (className.match(/^m-(\d+)$/)) {
    const match = className.match(/^m-(\d+)$/);
    if (match) {
      styles.margin = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className === 'm-0') {
    styles.margin = '0';
  } else if (className.match(/^mx-(\d+)$/)) {
    const match = className.match(/^mx-(\d+)$/);
    if (match) {
      const value = parseInt(match[1]) * 4;
      styles.marginLeft = `${value}px`;
      styles.marginRight = `${value}px`;
    }
  } else if (className.match(/^my-(\d+)$/)) {
    const match = className.match(/^my-(\d+)$/);
    if (match) {
      const value = parseInt(match[1]) * 4;
      styles.marginTop = `${value}px`;
      styles.marginBottom = `${value}px`;
    }
  } else if (className.match(/^mt-(\d+)$/)) {
    const match = className.match(/^mt-(\d+)$/);
    if (match) {
      styles.marginTop = `${parseInt(match[1]) * 4}px`;
    }
  } else if (className.match(/^mb-(\d+)$/)) {
    const match = className.match(/^mb-(\d+)$/);
    if (match) {
      styles.marginBottom = `${parseInt(match[1]) * 4}px`;
    }
  }
  
  // Typography
  else if (className.match(/^text-(\d+)$/)) {
    const match = className.match(/^text-(\d+)$/);
    if (match) {
      styles.fontSize = `${match[1]}px`;
    }
  } else if (className === 'text-xs') {
    styles.fontSize = '12px';
  } else if (className === 'text-sm') {
    styles.fontSize = '14px';
  } else if (className === 'text-base') {
    styles.fontSize = '16px';
  } else if (className === 'text-lg') {
    styles.fontSize = '18px';
  } else if (className === 'text-xl') {
    styles.fontSize = '20px';
  } else if (className === 'text-2xl') {
    styles.fontSize = '24px';
  } else if (className === 'text-3xl') {
    styles.fontSize = '30px';
  } else if (className === 'text-4xl') {
    styles.fontSize = '36px';
  } else if (className === 'text-5xl') {
    styles.fontSize = '48px';
  } else if (className === 'text-6xl') {
    styles.fontSize = '60px';
  }
  
  // Font weight
  else if (className === 'font-thin') {
    styles.fontWeight = 100;
  } else if (className === 'font-light') {
    styles.fontWeight = 300;
  } else if (className === 'font-normal') {
    styles.fontWeight = 400;
  } else if (className === 'font-medium') {
    styles.fontWeight = 500;
  } else if (className === 'font-semibold') {
    styles.fontWeight = 600;
  } else if (className === 'font-bold') {
    styles.fontWeight = 700;
  } else if (className.match(/^font-(\d+)$/)) {
    const match = className.match(/^font-(\d+)$/);
    if (match) {
      styles.fontWeight = parseInt(match[1]);
    }
  }
  
  // Text color
  else if (className === 'text-white') {
    styles.color = 'white';
  } else if (className === 'text-black') {
    styles.color = 'black';
  } else if (className.match(/^text-(gray|red|blue|green|yellow|purple|pink|indigo)-(\d+)$/)) {
    const match = className.match(/^text-(gray|red|blue|green|yellow|purple|pink|indigo)-(\d+)$/);
    if (match) {
      styles.color = getColorValue(match[1], parseInt(match[2]));
    }
  }
  
  // Background color
  else if (className === 'bg-white') {
    styles.backgroundColor = 'white';
  } else if (className === 'bg-black') {
    styles.backgroundColor = 'black';
  } else if (className.match(/^bg-(gray|red|blue|green|yellow|purple|pink|indigo)-(\d+)$/)) {
    const match = className.match(/^bg-(gray|red|blue|green|yellow|purple|pink|indigo)-(\d+)$/);
    if (match) {
      styles.backgroundColor = getColorValue(match[1], parseInt(match[2]));
    }
  }
  
  // Alignment
  else if (className === 'items-center') {
    styles.alignItems = 'center';
  } else if (className === 'items-start') {
    styles.alignItems = 'flex-start';
  } else if (className === 'items-end') {
    styles.alignItems = 'flex-end';
  } else if (className === 'justify-center') {
    styles.justifyContent = 'center';
  } else if (className === 'justify-between') {
    styles.justifyContent = 'space-between';
  } else if (className === 'justify-start') {
    styles.justifyContent = 'flex-start';
  } else if (className === 'justify-end') {
    styles.justifyContent = 'flex-end';
  }
  
  // Border
  else if (className === 'border') {
    styles.border = '1px solid #e0e0e0';
  } else if (className === 'border-0') {
    styles.border = 'none';
  }
  
  // Overflow
  else if (className === 'overflow-hidden') {
    styles.overflow = 'hidden';
  } else if (className === 'overflow-visible') {
    styles.overflow = 'visible';
  }
  
  // Border radius
  else if (className === 'rounded') {
    styles.borderRadius = '4px';
  } else if (className === 'rounded-sm') {
    styles.borderRadius = '2px';
  } else if (className === 'rounded-md') {
    styles.borderRadius = '6px';
  } else if (className === 'rounded-lg') {
    styles.borderRadius = '8px';
  } else if (className === 'rounded-xl') {
    styles.borderRadius = '12px';
  } else if (className === 'rounded-full') {
    styles.borderRadius = '9999px';
  }
  
  // Text decoration
  else if (className === 'underline') {
    styles.textDecoration = 'underline';
  } else if (className === 'line-through') {
    styles.textDecoration = 'line-through';
  } else if (className === 'no-underline') {
    styles.textDecoration = 'none';
  }
  
  // Text transform
  else if (className === 'uppercase') {
    styles.textTransform = 'uppercase';
  } else if (className === 'lowercase') {
    styles.textTransform = 'lowercase';
  } else if (className === 'capitalize') {
    styles.textTransform = 'capitalize';
  }
  
  // Letter spacing
  else if (className.match(/^tracking-(-?\d+)$/)) {
    const match = className.match(/^tracking-(-?\d+)$/);
    if (match) {
      styles.letterSpacing = `${parseInt(match[1]) * 0.025}em`;
    }
  }
  
  // Line height
  else if (className === 'leading-none') {
    styles.lineHeight = 1;
  } else if (className === 'leading-tight') {
    styles.lineHeight = 1.25;
  } else if (className === 'leading-normal') {
    styles.lineHeight = 1.5;
  } else if (className === 'leading-relaxed') {
    styles.lineHeight = 1.75;
  }
  
  return styles;
}

/**
 * Get color value from Tailwind color name and shade
 */
function getColorValue(color: string, shade: number): string {
  const colorMap: Record<string, Record<number, string>> = {
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  };
  
  return colorMap[color]?.[shade] || '#000000';
}
