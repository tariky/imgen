import { readFileSync } from "fs";
import { join } from "path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { createLayout } from "./layouts/layout";
import { getOverlayImage, getStyle } from "./styles/registry";
import type { RenderPayload, RenderWorkerRequest, RenderWorkerResponse } from "./utils/render-types";

declare const self: {
  onmessage: ((event: { data: RenderWorkerRequest }) => void | Promise<void>) | null;
  postMessage(message: RenderWorkerResponse, transfer?: ArrayBuffer[]): void;
};

const zalandoSansRegular = readFileSync(join(process.cwd(), "zalando-sans-regular.ttf"));
const zalandoSansBold = readFileSync(join(process.cwd(), "zalando-sans-bold.ttf"));

async function renderImage(payload: RenderPayload): Promise<Buffer> {
  const styleConfig = getStyle(payload.style);
  const overlayImage = getOverlayImage(
    payload.style,
    payload.aspectRatio,
    !!(payload.isDiscounted && payload.discountPercentage)
  );
  const template = createLayout(
    payload.productImgBase64,
    payload.brandName,
    payload.productName,
    payload.finalPrice,
    payload.oldPrice,
    payload.isDiscounted,
    payload.discountPercentage,
    payload.debugMode,
    payload.aspectRatio,
    styleConfig.colors,
    overlayImage,
    styleConfig.hideBrandName
  );

  const svg = await satori(template, {
    width: payload.imageWidth,
    height: payload.imageHeight,
    fonts: [
      { name: "Zalando Sans", data: zalandoSansRegular, weight: 400, style: "normal" },
      { name: "Zalando Sans", data: zalandoSansBold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: payload.imageWidth },
    font: {
      loadSystemFonts: false,
    },
  });

  return resvg.render().asPng();
}

self.onmessage = async (event) => {
  const { id, payload } = event.data;

  try {
    const pngBuffer = await renderImage(payload);
    const arrayBuffer = new ArrayBuffer(pngBuffer.byteLength);
    new Uint8Array(arrayBuffer).set(pngBuffer);
    self.postMessage({ id, ok: true, data: arrayBuffer }, [arrayBuffer]);
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
