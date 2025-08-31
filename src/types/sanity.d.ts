// src/types/sanity.d.ts
export interface SanityImageSource {
  asset: {
    _ref: string;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}