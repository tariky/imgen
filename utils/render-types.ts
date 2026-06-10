export interface RenderPayload {
  productImgBase64: string;
  brandName: string;
  productName: string;
  finalPrice: string | null;
  oldPrice: string | null;
  isDiscounted: boolean;
  discountPercentage: number | null;
  debugMode: boolean;
  aspectRatio: string;
  style: string;
  imageWidth: number;
  imageHeight: number;
}

export interface RenderWorkerRequest {
  id: number;
  payload: RenderPayload;
}

export type RenderWorkerResponse =
  | {
      id: number;
      ok: true;
      data: ArrayBuffer;
    }
  | {
      id: number;
      ok: false;
      error: string;
    };
