import { serve } from "bun";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { createLayout45 } from "./layouts/layout45";
import { createLayout916 } from "./layouts/layout916";
import { createLayout11 } from "./layouts/layout11";
import { createLayout11Christmas } from "./layouts/layout11-christmas";
import { createHash } from "crypto";

// 1. Load Fonts - Zalando Sans with East European (Latin-Extended) support
import { readFileSync } from 'fs';
import { join } from 'path';
import { createLayout45Christmas } from "./layouts/layout45-christmas";
import { createLayout916Christmas } from "./layouts/layout916-christmas";

// Load static TTF files (Satori doesn't fully support variable fonts)
// These files support Latin-Extended characters for East European languages
const zalandoSansRegular = readFileSync(
  join(process.cwd(), 'zalando-sans-regular.ttf')
);
const zalandoSansBold = readFileSync(
  join(process.cwd(), 'zalando-sans-bold.ttf')
);

// Configure Sharp for optimal performance
// Enable multi-threading and set concurrency
sharp.concurrency(0); // 0 = use all available CPU cores
sharp.simd(true); // Enable SIMD optimizations

// Image cache - stores processed images in memory
const imageCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL
const MAX_CACHE_SIZE = 100; // Maximum cached images

// PNG cache - stores final rendered images
const pngCache = new Map<string, { data: Buffer; timestamp: number }>();
const PNG_CACHE_TTL = 1000 * 60 * 30; // 30 minutes cache TTL
const MAX_PNG_CACHE_SIZE = 50; // Maximum cached PNGs

// Cleanup old cache entries
function cleanupCache() {
  const now = Date.now();
  
  // Clean image cache
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
  
  // Clean PNG cache
  for (const [key, value] of pngCache.entries()) {
    if (now - value.timestamp > PNG_CACHE_TTL) {
      pngCache.delete(key);
    }
  }
  
  // Limit cache sizes
  if (imageCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(imageCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, imageCache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => imageCache.delete(key));
  }
  
  if (pngCache.size > MAX_PNG_CACHE_SIZE) {
    const entries = Array.from(pngCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, pngCache.size - MAX_PNG_CACHE_SIZE);
    toDelete.forEach(([key]) => pngCache.delete(key));
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupCache, 1000 * 60 * 5);

// Helper: Parse aspect ratio from string (supports "1:1", "4:5", or "9:16")
function parseAspectRatio(ratioStr: string | null): { width: number; height: number; ratio: string } {
  const baseWidth = 1080; // Base width for all images
  
  if (!ratioStr || ratioStr === "4:5") {
    // Default to 4:5
    return { width: baseWidth, height: Math.round(baseWidth * (5 / 4)), ratio: "4:5" };
  }

  if (ratioStr === "1:1") {
    return { width: baseWidth, height: baseWidth, ratio: "1:1" };
  }

  if (ratioStr === "9:16") {
    return { width: baseWidth, height: Math.round(baseWidth * (16 / 9)), ratio: "9:16" };
  }

  // Invalid ratio, default to 4:5
  console.warn(`Invalid aspect ratio: ${ratioStr}. Only "1:1", "4:5", and "9:16" are supported. Using default 4:5`);
  return { width: baseWidth, height: Math.round(baseWidth * (5 / 4)), ratio: "4:5" };
}

// Helper: Create cache key for image
function createImageCacheKey(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

// Helper: Convert Image URL to Base64 (with caching)
async function urlToDataUri(url: string): Promise<string> {
  const cacheKey = createImageCacheKey(url);
  
  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Image fetch failed");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to JPG using sharp with optimized settings
    // Use faster quality and progressive encoding for better performance
    const jpegBuffer = await sharp(buffer, {
      failOn: 'none', // Don't fail on corrupt images
      limitInputPixels: 268402689, // Max pixels (16383^2)
    })
      .jpeg({
        quality: 85, // Good balance between quality and file size
        progressive: true, // Progressive JPEG for faster perceived loading
        mozjpeg: true, // Use mozjpeg for better compression
      })
      .toBuffer();

    const dataUri = `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
    
    // Cache the result
    imageCache.set(cacheKey, {
      data: dataUri,
      timestamp: Date.now(),
    });
    
    return dataUri;
  } catch (e) {
    console.error(`Failed to load image: ${url}`, e);
    return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }
}

// Helper: Create cache key for final PNG
function createPngCacheKey(params: {
  style: string;
  aspectRatio: string;
  productName: string;
  finalPrice: string | null;
  oldPrice: string | null;
  isDiscounted: boolean;
  discountPercentage: number | null;
  imageUrl: string;
  debugMode: boolean;
}): string {
  const keyString = JSON.stringify(params);
  return createHash('md5').update(keyString).digest('hex');
}


serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3004,
  async fetch(req) {
    const url = new URL(req.url);

    // Cache stats endpoint
    if (url.pathname === "/cache-stats") {
      return new Response(JSON.stringify({
        imageCache: {
          size: imageCache.size,
          maxSize: MAX_CACHE_SIZE,
        },
        pngCache: {
          size: pngCache.size,
          maxSize: MAX_PNG_CACHE_SIZE,
        },
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Demo route - serve HTML page for testing layouts
    if (url.pathname === "/demo" || url.pathname === "/demo/") {
      const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Generator Demo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 30px;
      color: #333;
    }
    .controls {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
    }
    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
    }
    button:hover {
      background: #0056b3;
    }
    .preview-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-top: 30px;
    }
    .preview-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .preview-card h2 {
      margin-bottom: 15px;
      color: #333;
      font-size: 20px;
    }
    .preview-image {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f9f9f9;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    .preview-image img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .loading {
      color: #007bff;
    }
    .error {
      color: #dc3545;
    }
    @media (max-width: 1400px) {
      .preview-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 968px) {
      .preview-section {
        grid-template-columns: 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Image Generator Demo</h1>
    
    <div class="controls">
      <form id="demoForm">
        <div class="form-group">
          <label for="productName">Product Name</label>
          <input type="text" id="productName" name="name" value="Haljina Judson" placeholder="Enter product name">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="price">Price</label>
            <input type="text" id="price" name="price" value="59.95KM" placeholder="e.g., 59.95KM">
          </div>
          <div class="form-group">
            <label for="discountPrice">Discount Price (optional)</label>
            <input type="text" id="discountPrice" value="39.95KM" name="discount_price" placeholder="e.g., 39.95KM">
          </div>
        </div>
        
        <div class="form-group">
          <label for="imageUrl">Image URL</label>
          <input type="text" id="imageUrl" name="img" placeholder="Leave empty for default image">
        </div>
        
        <div class="form-group">
          <label for="style">Style</label>
          <select id="style" name="style">
            <option value="standard">Standard</option>
            <option value="christmas">Christmas</option>
          </select>
        </div>
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="debugMode" name="debug" style="width: auto; cursor: pointer;">
            <span>Debug Mode (Show Borders)</span>
          </label>
        </div>
        
        <button type="submit">Generate Images</button>
      </form>
    </div>
    
    <div class="preview-section">
      <div class="preview-card">
        <h2>1:1 Layout (Square)</h2>
        <div class="preview-image" id="preview11">
          <span>Click "Generate Images" to preview</span>
        </div>
      </div>
      
      <div class="preview-card">
        <h2>4:5 Layout (Horizontal)</h2>
        <div class="preview-image" id="preview45">
          <span>Click "Generate Images" to preview</span>
        </div>
      </div>
      
      <div class="preview-card">
        <h2>9:16 Layout (Vertical)</h2>
        <div class="preview-image" id="preview916">
          <span>Click "Generate Images" to preview</span>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const form = document.getElementById('demoForm');
    const preview11 = document.getElementById('preview11');
    const preview45 = document.getElementById('preview45');
    const preview916 = document.getElementById('preview916');
    
    function buildImageUrl(params, aspectRatio) {
      const url = new URL('/', window.location.origin);
      Object.keys(params).forEach(key => {
        if (params[key]) {
          url.searchParams.set(key, params[key]);
        }
      });
      url.searchParams.set('aspect_ratio', aspectRatio);
      return url.toString();
    }
    
    function updatePreview(container, url) {
      container.innerHTML = '<span class="loading">Loading...</span>';
      const img = new Image();
      img.onload = () => {
        container.innerHTML = '';
        container.appendChild(img);
      };
      img.onerror = () => {
        container.innerHTML = '<span class="error">Failed to load image</span>';
      };
      img.src = url + '&t=' + Date.now(); // Cache busting
    }
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const imgValue = formData.get('img');
      const debugMode = formData.get('debug') === 'on';
      const style = formData.get('style') || 'standard';
      const params = {
        name: formData.get('name') || undefined,
        price: formData.get('price') || undefined,
        discount_price: formData.get('discount_price') || undefined,
        img: imgValue ? btoa(imgValue) : undefined,
        style: style || undefined,
        debug: debugMode ? 'true' : undefined,
      };
      
      // Generate all layouts
      const url11 = buildImageUrl(params, '1:1');
      const url45 = buildImageUrl(params, '4:5');
      const url916 = buildImageUrl(params, '9:16');
      
      updatePreview(preview11, url11);
      updatePreview(preview45, url45);
      updatePreview(preview916, url916);
    });
    
    // Generate on page load with default values
    form.dispatchEvent(new Event('submit'));
  </script>
</body>
</html>
      `;
      return new Response(demoHTML, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // --- 2. GET VARIABLES ---
    const brandName = "Lunatik"; 
    const productName = url.searchParams.get("name") || "Haljina Judson";
    console.log("Product Name:", productName);
    
    // Style Logic - determines which layout variant to use
    const styleParam = url.searchParams.get("style") || "standard";
    const style = styleParam === "christmas" ? "christmas" : "standard";
    console.log(`Style: ${style}`);
    
    // Aspect Ratio Logic
    const aspectRatioParam = url.searchParams.get("aspect_ratio");
    const { width: imageWidth, height: imageHeight, ratio: aspectRatio } = parseAspectRatio(aspectRatioParam);
    console.log(`Image dimensions: ${imageWidth}x${imageHeight} (aspect ratio: ${aspectRatio})`);
    
    // Image Logic: Decode base64 image URL if present
    const rawImgParam = url.searchParams.get("img");
    let imageUrl = rawImgParam;
    if (rawImgParam) {
      try {
        imageUrl = Buffer.from(rawImgParam, 'base64').toString('utf-8');
      } catch (e) {
        console.error("Failed to decode base64 image URL:", e);
        // Fallback to raw param if decoding fails (might be a normal URL)
        imageUrl = rawImgParam;
      }
    }
    
    // Price Logic
    const priceParam = url.searchParams.get("price"); 
    const discountParam = url.searchParams.get("discount_price")?.trim(); 
    
    const isDiscounted = !!discountParam && discountParam !== "undefined" && discountParam !== "";
    const finalPrice = isDiscounted ? discountParam : priceParam;
    const oldPrice = isDiscounted ? priceParam : null;
    
    // Calculate discount percentage
    function calculateDiscountPercentage(oldPriceStr: string | null, newPriceStr: string | null): number | null {
      if (!oldPriceStr || !newPriceStr || !isDiscounted) return null;
      
      // Extract numeric values (remove currency symbols and spaces)
      const extractNumber = (str: string): number => {
        // Remove all non-digit characters except dots and commas
        const cleaned = str.replace(/[^\d.,]/g, '');
        // Replace comma with dot for decimal
        const normalized = cleaned.replace(',', '.');
        return parseFloat(normalized) || 0;
      };
      
      const oldPriceNum = extractNumber(oldPriceStr);
      const newPriceNum = extractNumber(newPriceStr);
      
      if (oldPriceNum === 0 || newPriceNum >= oldPriceNum) return null;
      
      const discount = ((oldPriceNum - newPriceNum) / oldPriceNum) * 100;
      return Math.round(discount);
    }
    
    const discountPercentage = calculateDiscountPercentage(oldPrice, finalPrice);
    
    // Debug mode - show borders for layout debugging
    const debugMode = url.searchParams.get("debug") === "true";

    // Check PNG cache first
    const pngCacheKey = createPngCacheKey({
      style,
      aspectRatio,
      productName,
      finalPrice,
      oldPrice,
      isDiscounted,
      discountPercentage,
      imageUrl: imageUrl || "default",
      debugMode,
    });
    
    const cachedPng = pngCache.get(pngCacheKey);
    if (cachedPng && Date.now() - cachedPng.timestamp < PNG_CACHE_TTL) {
      return new Response(cachedPng.data, {
        headers: { 
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=1800", // 30 minutes
          "X-Cache": "HIT",
        },
      });
    }

    // Process image and layout in parallel where possible
    const productImgBase64 = imageUrl 
        ? await urlToDataUri(imageUrl) 
        : await urlToDataUri("https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"); 

    // --- 3. THE LAYOUT ---
    // Choose layout based on aspect ratio and style
    let template;
    if (aspectRatio === "1:1") {
      template = style === "christmas"
        ? createLayout11Christmas(productImgBase64, brandName, productName, finalPrice, oldPrice, isDiscounted, discountPercentage, debugMode)
        : createLayout11(productImgBase64, brandName, productName, finalPrice, oldPrice, isDiscounted, discountPercentage, debugMode);
    } else if (aspectRatio === "9:16") {
      template = style === "christmas"
        ? createLayout916Christmas(productImgBase64, brandName, productName, finalPrice, oldPrice, isDiscounted, discountPercentage, debugMode)
        : createLayout916(productImgBase64, brandName, productName, finalPrice, oldPrice, isDiscounted, discountPercentage, debugMode);
    } else {
      template = style === "christmas"
        ? createLayout45Christmas(productImgBase64, brandName, productName, finalPrice, oldPrice, isDiscounted, discountPercentage, debugMode)
        : createLayout45(productImgBase64, brandName, productName, finalPrice, oldPrice, isDiscounted, discountPercentage, debugMode);
    }

    // --- 4. RENDER ---
    // Use Promise.all for parallel operations where possible
    const svg = await satori(template, {
      width: imageWidth,
      height: imageHeight,
      fonts: [
        { name: 'Zalando Sans', data: zalandoSansRegular, weight: 400, style: 'normal' },
        { name: 'Zalando Sans', data: zalandoSansBold, weight: 700, style: 'normal' },
      ],
    });

    // Optimize Resvg rendering
    const resvg = new Resvg(svg, { 
      fitTo: { mode: 'width', value: imageWidth },
      // Enable optimizations
      font: {
        loadSystemFonts: false, // Don't load system fonts, we have our own
      },
    });
    
    const pngBuffer = resvg.render().asPng();

    // Cache the PNG
    pngCache.set(pngCacheKey, {
      data: pngBuffer,
      timestamp: Date.now(),
    });

    return new Response(pngBuffer, {
      headers: { 
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=1800", // 30 minutes
        "X-Cache": "MISS",
      },
    });
  },
});

console.log(`Generator running at http://localhost:${process.env.PORT || 3004}`);