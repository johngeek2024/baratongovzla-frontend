export interface Hotspot {
  x: string;
  y: string;
  title: string;
  price: string;
  imageUrl: string;
  linkUrl: string;
}

export interface ProductStageContent {
  backgroundUrl: string;
  title: string;
  paragraph: string;
  buttonText: string;
  buttonLink: string;
}

export interface BundleContent {
  sectionTitle: string;
  imageUrl: string;
  overlayTitle: string;
  overlayParagraph: string;
  hotspots: Hotspot[];
}
