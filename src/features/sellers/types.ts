import type { Category } from "../products/types";

export type Seller = {
  id: string;
  sellerName: string;
  storeName: string;
  location: string;
  description: string;
  isVerified: boolean;
  responseTime: string;
  deliveryInfo: string;
  categories: Category[];
};
