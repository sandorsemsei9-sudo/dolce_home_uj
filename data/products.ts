import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: 1,
    name: "Jóga vászonkép",
    slug: "joga-vaszonkep",
    price: 19990,
    category: "Modern & Absztrakt",
    image: "/images/joga.webp",
    description: "Modern, elegáns kompozíció",
  },
  {
    id: 2,
    name: "Japán vászonkép",
    slug: "japan-vaszonkep",
    price: 17990,
    category: "Modern & Absztrakt",
    image: "/images/japan-stilus.webp",
    description: "Lágy árnyalatok",
  },
  {
    id: 3,
    name: "Türkiz életfa",
    slug: "turkiz-eletfa",
    price: 14990,
    category: "Természet & Tájkép",
    image: "/images/turkiz-eletfa.webp",
    description: "Modern, elegáns kompozíció",
  },
  {
    id: 4,
    name: "Japán vászonkép 2",
    slug: "japan-vaszonkep",
    price: 14990,
    category: "Természet & Tájkép",
    image: "/images/japan-stilus-2.webp",
    description: "Lágy árnyalatok",
  }
];