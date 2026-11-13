export type Category =
  | "Hoodies"
  | "T-Shirts"
  | "Jeans"
  | "Jackets"
  | "Sweatshirts"
  | (string & {});

export type ProductVariant = {
  sku: string;
  color: string;
  size: string;
  stock: number;
  imageUrl?: string;
};

export type Product = {
  id: string;
  sellerId?: string;
  name: string;
  description: string;
  category: Category;
  priceCents: number;
  currency: string;
  images: string[];
  variants: ProductVariant[];
};