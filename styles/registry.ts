import fs from "fs";

function getLocalImage(path: string): string {
  const imageFile = fs.readFileSync(path, { encoding: "base64" });
  return `data:image/png;base64,${imageFile}`;
}

export interface StyleColors {
  badgeBackground: string;
  badgeText: string;
  iconColor: string;
  labelText: string;
  brandName: string;
  brandName916: string;
  productName: string;
  price: string;
  oldPrice: string;
}

interface OverlayImages {
  "1:1": { regular: string; sale: string };
  "4:5": { regular: string; sale: string };
  "9:16": { regular: string; sale: string };
}

export interface StyleConfig {
  id: string;
  label: string;
  colors: StyleColors;
  overlay: OverlayImages | null;
  hideBrandName: boolean;
}

const STYLES: Record<string, StyleConfig> = {
  standard: {
    id: "standard",
    label: "Standard",
    colors: {
      badgeBackground: "red",
      badgeText: "white",
      iconColor: "black",
      labelText: "black",
      brandName: "black",
      brandName916: "black",
      productName: "#333",
      price: "black",
      oldPrice: "#666",
    },
    overlay: null,
    hideBrandName: false,
  },
  christmas: {
    id: "christmas",
    label: "Christmas",
    colors: {
      badgeBackground: "red",
      badgeText: "white",
      iconColor: "white",
      labelText: "white",
      brandName: "black",
      brandName916: "white",
      productName: "#333",
      price: "black",
      oldPrice: "#666",
    },
    overlay: {
      "1:1": {
        regular: getLocalImage("./assets/1by1-regular.png"),
        sale: getLocalImage("./assets/1by1-sale.png"),
      },
      "4:5": {
        regular: getLocalImage("./assets/4by5-regular.png"),
        sale: getLocalImage("./assets/4by5-sale.png"),
      },
      "9:16": {
        regular: getLocalImage("./assets/9by16-regular.png"),
        sale: getLocalImage("./assets/9by16-sale.png"),
      },
    },
    hideBrandName: false,
  },
  mothersday: {
    id: "mothersday",
    label: "Mother's Day",
    colors: {
      badgeBackground: "#f4c2c2",
      badgeText: "black",
      iconColor: "white",
      labelText: "white",
      brandName: "black",
      brandName916: "white",
      productName: "#333",
      price: "black",
      oldPrice: "#666",
    },
    overlay: {
      "1:1": {
        regular: getLocalImage("./assets/1by1-mothersday.png"),
        sale: getLocalImage("./assets/1by1-mothersday-sale.png"),
      },
      "4:5": {
        regular: getLocalImage("./assets/4by5-mothersday.png"),
        sale: getLocalImage("./assets/4by5-mothersday-sale.png"),
      },
      "9:16": {
        regular: getLocalImage("./assets/9by16-mothersday.png"),
        sale: getLocalImage("./assets/9by16-mothersday-sale.png"),
      },
    },
    hideBrandName: true,
  },
};

export function getStyle(id: string): StyleConfig {
  return STYLES[id] ?? STYLES.standard!;
}

export function getOverlayImage(
  styleId: string,
  ratio: string,
  isSale: boolean
): string | null {
  const style = getStyle(styleId);
  if (!style.overlay) return null;
  const ratioKey = ratio as keyof OverlayImages;
  const images = style.overlay[ratioKey];
  if (!images) return null;
  return isSale ? images.sale : images.regular;
}

export const validStyleIds = Object.keys(STYLES);

export const allStyles = Object.values(STYLES);
