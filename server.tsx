import { serve } from "bun";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// 1. Load Fonts
const fontRegular = await fetch("https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-400-normal.woff").then(res => res.arrayBuffer());
const fontRegularExt = await fetch("https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-ext-400-normal.woff").then(res => res.arrayBuffer());
const fontBold = await fetch("https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-700-normal.woff").then(res => res.arrayBuffer());
const fontBoldExt = await fetch("https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-ext-700-normal.woff").then(res => res.arrayBuffer());

// Helper: Convert Image URL to Base64
async function urlToDataUri(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Image fetch failed");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (e) {
    console.error(`Failed to load image: ${url}`);
    return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }
}

serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3004,
  async fetch(req) {
    const url = new URL(req.url);

    // --- 2. GET VARIABLES ---
    const brandName = "LUNATIK"; 
    const productName = url.searchParams.get("name") || "Haljina Judson";
    console.log("Product Name:", productName);
    
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

    const productImgBase64 = imageUrl 
        ? await urlToDataUri(imageUrl) 
        : await urlToDataUri("https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"); 

    // --- 3. THE LAYOUT ---
    const template = (
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        fontFamily: 'Roboto, Roboto-Ext', // Add fallback font family
      }}>
        
        {/* LEFT COLUMN: PRODUCT IMAGE */}
        <div style={{
            display: 'flex',
            width: '65%', 
            height: '100%',
            paddingBottom: '220px',
            paddingTop: '220px',
            paddingRight: '60px',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* IMAGE CONTAINER */}
            <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                border: '1px solid #e0e0e0',
                overflow: 'hidden', // Ensures image stays inside the border
            }}>
                {/* FIX: Using <img> with objectFit: 'cover' 
                   This forces the image to fill the container completely.
                */}
                <img 
                    src={productImgBase64}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // This is the magic property
                        objectPosition: 'center'
                    }}
                />
            </div>
        </div>

        {/* RIGHT COLUMN: INFO & TEXT */}
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '35%',
            height: '100%',
            paddingTop: '240px',
            paddingBottom: '240px',
            paddingRight: '40px',
            justifyContent: 'space-between', 
        }}>
            
            {/* TOP: Special Offer Label */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '150px' }}>
                {isDiscounted ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#EE2A2A', 
                        fontSize: '32px',
                        fontWeight: 700,
                        lineHeight: '1.2',
                    }}>
                        <span>Posebna</span>
                        <span>ponuda</span>
                        <span>do -50%</span>
                    </div>
                ) : <div style={{ display: 'flex' }} /> } 
            </div>

            {/* MIDDLE: Brand Name */}
            <div style={{
                display: 'flex',
                fontSize: '72px',
                fontWeight: 700,
                color: 'black',
                letterSpacing: '-2px',
                textTransform: 'uppercase'
            }}>
                {brandName}
            </div>

            {/* BOTTOM: Pricing Block */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Old Price */}
                {isDiscounted && (
                    <div style={{
                        display: 'flex',
                        fontSize: '36px',
                        color: '#666',
                        textDecoration: 'line-through',
                        marginBottom: '10px'
                    }}>
                        {oldPrice}
                    </div>
                )}

                {/* Product Name */}
                <div style={{
                    display: 'flex',
                    fontSize: '26px',
                    color: '#333',
                    marginBottom: '10px'
                }}>
                    {productName}
                </div>

                {/* Main Price */}
                <div style={{
                    display: 'flex',
                    fontSize: '56px',
                    fontWeight: 700,
                    color: 'black'
                }}>
                    {finalPrice}
                </div>
            </div>

        </div>
      </div>
    );

    // --- 4. RENDER ---
    const svg = await satori(template, {
      width: 1080,
      height: 1340,
      fonts: [
        { name: 'Roboto', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Roboto-Ext', data: fontRegularExt, weight: 400, style: 'normal' },
        { name: 'Roboto', data: fontBold, weight: 700, style: 'normal' },
        { name: 'Roboto-Ext', data: fontBoldExt, weight: 700, style: 'normal' },
      ],
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } });
    const pngBuffer = resvg.render().asPng();

    return new Response(pngBuffer, {
      headers: { "Content-Type": "image/png" },
    });
  },
});

console.log(`Generator running at http://localhost:${process.env.PORT || 3004}`);