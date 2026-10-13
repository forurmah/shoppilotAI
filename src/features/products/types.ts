export type ProductVariant = {
  sku: string;
  color: string;
  size: string;
  stock: number;
  imageUrl?:string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images:string[];
  variants: ProductVariant[];
};