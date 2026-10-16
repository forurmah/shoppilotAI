import type { Product } from "./types";

export const hoodie: Product = {
  id: "hoodie-001",
  name: "Essential Oversized Hoodie",
  description: "Comfortable oversized cotton hoodie",
  category: "Hoodies",
  price: 49.99,
  currency: "USD",

  images: [
    "/images/products/hoodie-BLACK.jpeg",
    "/images/products/hoodie-WHITE.jpeg"
  ],

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
export const classicTshirt: Product = {
  id: "tshirt-001",
  name: "Classic Cotton T-Shirt",
  description:
    "A comfortable everyday cotton T-shirt with a relaxed fit.",
  category: "T-Shirts",
  price: 24.99,
  currency: "USD",

  images:[
    "/images/products/tshirt-black.jpeg",
    "/images/products/tshirt-white.jpeg"
  ],

  variants: [
    {
      sku: "TS-BLK-M",
      color: "Black",
      size: "M",
      stock: 12,
      imageUrl: "/images/products/tshirt-black.jpeg",
    },
    {
      sku: "TS-BLK-L",
      color: "Black",
      size: "L",
      stock: 2,
      imageUrl: "/images/products/tshirt-black.jpeg",
    },
    {
      sku: "TS-WHT-M",
      color: "White",
      size: "M",
      stock: 0,
      imageUrl: "/images/products/tshirt-white.jpeg",
    },
  ],
};
export const straightLegJeans: Product = {
  id: "jeans-001",
  name: "Straight-Leg Jeans",
  description:
    "Classic straight-leg denim jeans designed for everyday comfort and style.",
  category: "Jeans",
  price: 64.99,
  currency: "USD",

  images: [
    "/images/products/jeans-blue.jpeg",
    "/images/products/jeans-black.jpeg",
    "/images/products/jeans-khaki.jpeg",
  ],

  variants: [
    {
      sku: "JN-BLU-30",
      color: "Blue",
      size: "30",
      stock: 15,
      imageUrl: "/images/products/jeans-blue.jpeg",
    },
    {
      sku: "JN-KHK-32",
      color: "khaki",
      size: "32",
      stock: 5,
      imageUrl: "/images/products/jeans-khaki.jpeg",
    },
    {
      sku: "JN-BLK-30",
      color: "Black",
      size: "30",
      stock: 2,
      imageUrl: "/images/products/jeans-black.jpeg",
    },
    {
      sku: "JN-BLK-32",
      color: "Black",
      size: "32",
      stock: 0,
      imageUrl: "/images/products/jeans-black.jpeg",
    },
  ],
};
export const everydayJacket: Product = {
  id: "jacket-001",
  name: "Everyday Jacket",
  description:
    "A versatile lightweight jacket for casual outfits and everyday wear.",
  category: "Jackets",
  price: 89.99,
  currency: "USD",

  images: [
    "/images/products/jacket-black.jpeg",
    "/images/products/jacket-green.jpeg",
  ],

  variants: [
    {
      sku: "JK-BLK-M",
      color: "Black",
      size: "M",
      stock: 10,
      imageUrl: "/images/products/jacket-black.jpeg",
    },
    {
      sku: "JK-BLK-L",
      color: "Black",
      size: "L",
      stock: 3,
      imageUrl: "/images/products/jacket-black.jpeg",
    },
    {
      sku: "JK-GRN-M",
      color: "Green",
      size: "M",
      stock: 0,
      imageUrl: "/images/products/jacket-green.jpeg",
    },
    {
      sku: "JK-GRN-L",
      color: "Green",
      size: "L",
      stock: 7,
      imageUrl: "/images/products/jacket-green.jpeg",
    },
  ],
};
export const relaxedSweatshirt: Product = {
  id: "sweatshirt-001",
  name: "Relaxed Sweatshirt",
  description:
    "A soft cotton-blend sweatshirt with a relaxed fit for everyday comfort.",
  category: "Sweatshirts",
  price: 54.99,
  currency: "USD",

  images: [
    "/images/products/sweatshirt-grey.jpeg",
  ],

  variants: [
    {
      sku: "SW-GRY-M",
      color: "Grey",
      size: "M",
      stock: 14,
      imageUrl: "/images/products/sweatshirt-grey.jpeg",
    },
    {
      sku: "SW-GRY-L",
      color: "Grey",
      size: "L",
      stock: 2,
      imageUrl: "/images/products/sweatshirt-grey.jpeg",
    },
    {
      sku: "SW-GRY-XL",
      color: "Grey",
      size: "XL",
      stock: 0,
      imageUrl: "/images/products/sweatshirt-grey.jpeg",
    },
  ],
};
export const products: Product[] = [
  hoodie,
  classicTshirt,
  straightLegJeans,
  everydayJacket,
  relaxedSweatshirt
];