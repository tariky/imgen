# Image Generator API Guide

## Overview

The Image Generator API creates product advertisement images with customizable layouts, pricing, and product information. The API generates PNG images optimized for social media and marketing materials.

## Base URL

```
http://localhost:3004
```

Or your production server URL.

## Endpoint

### Generate Image

**GET** `/`

Generates a product advertisement image based on query parameters.

## Query Parameters

### Required Parameters

None - all parameters are optional with sensible defaults.

### Optional Parameters

| Parameter        | Type                        | Default          | Description                                                                   |
| ---------------- | --------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `name`           | string                      | "Haljina Judson" | Product name to display                                                       |
| `price`          | string                      | null             | Regular price (e.g., "2.990 RSD")                                             |
| `discount_price` | string                      | null             | Discounted price (e.g., "1.495 RSD"). When provided, enables discount display |
| `img`            | string (base64 encoded URL) | Default image    | Product image URL. Must be base64 encoded if using a URL                      |
| `aspect_ratio`   | string                      | "4:5"            | Image aspect ratio. Supported values: `"1:1"`, `"4:5"`, `"9:16"`              |
| `debug`          | boolean                     | false            | Enable debug mode to show layout borders. Set to `"true"`                     |

## Response

- **Content-Type**: `image/png`
- **Body**: PNG image binary data

## Examples

### Basic Request

Generate a simple product image with default values:

```bash
curl "http://localhost:3004/" -o product.png
```

### With Product Information

```bash
curl "http://localhost:3004/?name=Haljina%20Judson&price=25.95%20KM" -o product.png
```

### With Discount

```bash
curl "http://localhost:3004/?name=Haljina%20Judson&price=19.95%20KM&discount_price=15.95%20KM" -o product.png
```

### With Custom Image

```bash
# First, base64 encode the image URL
IMAGE_URL="https://example.com/product-image.jpg"
ENCODED_URL=$(echo -n "$IMAGE_URL" | base64)

curl "http://localhost:3004/?img=$ENCODED_URL&name=Product%20Name&price=100%20EUR" -o product.png
```

### Different Aspect Ratio

```bash
# 1:1 square layout
curl "http://localhost:3004/?aspect_ratio=1:1&name=Product&price=50%20USD" -o product-square.png

# 4:5 horizontal layout (default)
curl "http://localhost:3004/?aspect_ratio=4:5&name=Product&price=50%20USD" -o product-horizontal.png

# 9:16 vertical layout
curl "http://localhost:3004/?aspect_ratio=9:16&name=Product&price=50%20USD" -o product-vertical.png
```

### Debug Mode

```bash
curl "http://localhost:3004/?debug=true&name=Test%20Product&price=100%20RSD" -o debug.png
```

## Code Examples

### JavaScript/TypeScript (Fetch API)

```javascript
async function generateProductImage(params) {
  const queryParams = new URLSearchParams({
    name: params.name || "Haljina Judson",
    price: params.price || "",
    discount_price: params.discountPrice || "",
    aspect_ratio: params.aspectRatio || "4:5",
    debug: params.debug || "false",
  });

  // If image URL is provided, base64 encode it
  if (params.imageUrl) {
    const encodedUrl = btoa(params.imageUrl);
    queryParams.set("img", encodedUrl);
  }

  const url = `http://localhost:3004/?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const blob = await response.blob();
  return blob;
}

// Usage
const imageBlob = await generateProductImage({
  name: "Haljina Judson",
  price: "2.990 RSD",
  discountPrice: "1.495 RSD",
  aspectRatio: "4:5",
  imageUrl: "https://example.com/product.jpg",
});

// Create object URL for display
const imageUrl = URL.createObjectURL(imageBlob);
```

### Python

```python
import requests
import base64

def generate_product_image(name=None, price=None, discount_price=None,
                          image_url=None, aspect_ratio='4:5', debug=False):
    """
    Generate a product advertisement image.

    Args:
        name: Product name
        price: Regular price string
        discount_price: Discounted price string
        image_url: URL to product image
        aspect_ratio: '4:5' or '9:16'
        debug: Enable debug mode

    Returns:
        bytes: PNG image data
    """
    params = {
        'aspect_ratio': aspect_ratio,
        'debug': 'true' if debug else 'false'
    }

    if name:
        params['name'] = name
    if price:
        params['price'] = price
    if discount_price:
        params['discount_price'] = discount_price
    if image_url:
        # Base64 encode the URL
        encoded_url = base64.b64encode(image_url.encode()).decode()
        params['img'] = encoded_url

    response = requests.get('http://localhost:3004/', params=params)
    response.raise_for_status()

    return response.content

# Usage
image_data = generate_product_image(
    name='Haljina Judson',
    price='2.990 RSD',
    discount_price='1.495 RSD',
    image_url='https://example.com/product.jpg',
    aspect_ratio='4:5'
)

# Save to file
with open('product.png', 'wb') as f:
    f.write(image_data)
```

### Node.js

```javascript
const https = require("https");
const fs = require("fs");

function generateProductImage(params) {
  const queryParams = new URLSearchParams({
    name: params.name || "Haljina Judson",
    price: params.price || "",
    discount_price: params.discountPrice || "",
    aspect_ratio: params.aspectRatio || "4:5",
    debug: params.debug ? "true" : "false",
  });

  if (params.imageUrl) {
    const encodedUrl = Buffer.from(params.imageUrl).toString("base64");
    queryParams.set("img", encodedUrl);
  }

  const url = `http://localhost:3004/?${queryParams.toString()}`;

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`API error: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
  });
}

// Usage
generateProductImage({
  name: "Haljina Judson",
  price: "2.990 RSD",
  discountPrice: "1.495 RSD",
  aspectRatio: "4:5",
}).then((imageBuffer) => {
  fs.writeFileSync("product.png", imageBuffer);
});
```

## Layout Details

### 1:1 Aspect Ratio (Square)

- **Dimensions**: 1080x1080 pixels
- **Layout**: Horizontal (image left, text right)
- **Image**: 60% width, full height
- **Text**: 40% width, centered vertically
- **Use Case**: Instagram posts, Facebook posts, square social media formats

### 4:5 Aspect Ratio (Default)

- **Dimensions**: 1080x1350 pixels
- **Layout**: Horizontal (image left, text right)
- **Image**: 60% width, full height
- **Text**: 40% width, centered vertically
- **Use Case**: Portrait social media posts, product cards

### 9:16 Aspect Ratio

- **Dimensions**: 1080x1920 pixels
- **Layout**: Horizontal (image left, text right)
- **Image**: 60% width, full height
- **Text**: 40% width, centered vertically
- **Use Case**: Instagram Stories, TikTok, vertical displays

## Price Format

The API accepts price strings in any format. Examples:

- `"2.990 RSD"`
- `"€50.00"`
- `"$29.99"`
- `"1,495.00 HRK"`

When both `price` and `discount_price` are provided:

- `price` becomes the old/strikethrough price
- `discount_price` becomes the main displayed price
- Discount percentage is automatically calculated and displayed

## Image Requirements

### Supported Formats

- JPEG
- PNG
- WebP
- Any format supported by Sharp library

### Image Processing

- Images are automatically converted to JPEG format
- Images are optimized for web delivery
- Large images are automatically resized

### Image URL Encoding

When providing an image URL via the `img` parameter, it must be base64 encoded:

**JavaScript:**

```javascript
const encodedUrl = btoa("https://example.com/image.jpg");
```

**Python:**

```python
import base64
encoded_url = base64.b64encode('https://example.com/image.jpg'.encode()).decode()
```

**Bash:**

```bash
echo -n "https://example.com/image.jpg" | base64
```

## Error Handling

### Common Errors

| Status Code | Description  | Solution                                          |
| ----------- | ------------ | ------------------------------------------------- |
| 200         | Success      | Image returned successfully                       |
| 400         | Bad Request  | Check parameter format                            |
| 500         | Server Error | Check server logs, verify image URL is accessible |

### Error Response Format

On error, the API may return:

- HTML error page (check Content-Type header)
- Empty response
- Error message in response body

Always check the `Content-Type` header:

- `image/png` = Success
- `text/html` = Error page

## Debug Mode

Enable debug mode by setting `debug=true` in query parameters. This adds colored borders to layout elements:

- **Red border**: Main container
- **Blue border**: Image container (left column)
- **Green border**: Text container (right column)
- **Orange border**: Brand name section
- **Purple border**: Pricing block section

Useful for:

- Troubleshooting layout issues
- Understanding container boundaries
- Verifying alignment and spacing

## Best Practices

### 1. Image URLs

- Use HTTPS URLs for security
- Ensure images are publicly accessible
- Use CDN URLs for better performance
- Recommended image size: 800x1000px or larger

### 2. Caching

- Cache generated images on your side
- Use cache-busting query parameters for testing: `&t=timestamp`
- Set appropriate cache headers in your application

### 3. Performance

- Generate images asynchronously
- Pre-generate common product images
- Use appropriate aspect ratio for your use case

### 4. Error Handling

```javascript
try {
  const imageBlob = await generateProductImage(params);
  // Handle success
} catch (error) {
  console.error("Failed to generate image:", error);
  // Fallback to default image or show error message
}
```

### 5. Price Formatting

- Keep price strings consistent
- Include currency symbol or code
- Use appropriate decimal separators for locale

## Demo Page

Visit `/demo` for an interactive testing interface:

```
http://localhost:3004/demo
```

Features:

- Visual form to test all parameters
- Real-time preview of both aspect ratios
- Debug mode toggle
- No coding required

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider:

- Implementing rate limiting
- Using a queue system for high-volume requests
- Caching frequently requested images

## Support

For issues or questions:

1. Check the debug mode output
2. Verify all parameters are correctly formatted
3. Ensure image URLs are accessible
4. Check server logs for detailed error messages

## Changelog

### Current Version

- Support for 4:5 and 9:16 aspect ratios
- Automatic discount percentage calculation
- Debug mode for layout troubleshooting
- Automatic image format conversion to JPEG
- Zalando Sans font with East European character support
