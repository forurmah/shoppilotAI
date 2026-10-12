import type { Product } from "./types";

export const hoodie: Product = {
  id: "hoodie-001",
  name: "Essential Oversized Hoodie",
  description: "Comfortable oversized cotton hoodie",
  category: "Hoodies",
  price: 49.99,
  currency: "USD",

  images: ["/images/products/hoodie-BLACK.jpeg"],

  variants: [
    {
      sku: "HD-BLK-M",
      color: "Black",
      size: "M",
      stock: 8,
      imageUrl: "/images/products/hoodie-BLACK.jpeg",
    },
    {
      sku: "HD-BLK-L",
      color: "Black",
      size: "L",
      stock: 3,
      imageUrl: "/images/products/hoodie-BLACK.jpeg"
    },
    {
      sku: "HD-WHT-M",
      color: "White",
      size: "M",
      stock: 0,
      imageUrl: "/images/products/hoodie-WHITE.jpeg",
    },
  ],
};