import type { PopupImage } from "./PopupImage.js";

export type PopupStyle = {
  blinkColors: string[];
  blinkIntervalMs: number;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  opacity: number;
  image: PopupImage;
};

export type PopupStyleOverride = Partial<Omit<PopupStyle, "image">> & {
  image?: Partial<PopupImage>;
};
