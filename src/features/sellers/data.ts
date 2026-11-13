import type { Seller } from "./types";

export const sellers: Seller[] = [
  {
    id: "atelier-north",
    sellerName: "Maya Lin",
    storeName: "Atelier North",
    location: "Portland, OR",
    description:
      "Independent studio crafting heavyweight organic cotton essentials with transparent lot-by-lot stock counts.",
    isVerified: true,
    responseTime: "Replies in under 2 hours",
    deliveryInfo: "Ships in 1–2 business days · Free 30-day returns",
    categories: ["Hoodies", "T-Shirts"],
  },
  {
    id: "loom-and-indigo",
    sellerName: "Tomasz Kowalski",
    storeName: "Loom & Indigo",
    location: "Brooklyn, NY",
    description:
      "Small-batch denim and relaxed knitwear workshop focused on durable everyday fits and accurate measurements.",
    isVerified: true,
    responseTime: "Replies in under 4 hours",
    deliveryInfo: "Ships in 2–3 business days · Carbon-neutral parcel",
    categories: ["Jeans", "Sweatshirts"],
  },
  {
    id: "pinewood-outpost",
    sellerName: "Elena Vance",
    storeName: "Pinewood Outpost",
    location: "Seattle, WA",
    description:
      "Neighborhood outerwear label designing weather-ready layers in limited seasonal runs.",
    isVerified: false,
    responseTime: "Replies within 24 hours",
    deliveryInfo: "Ships in 2–4 business days · Local studio pickup",
    categories: ["Jackets"],
  },
];
