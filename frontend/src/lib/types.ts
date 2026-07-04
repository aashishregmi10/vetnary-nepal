export interface ImageAsset {
  publicId?: string;
  secureUrl: string;
  name?: string;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "discontinued";
export type Species = "dog" | "cat" | "bird" | "fish" | "small-pet" | "reptile";

export interface Category {
  _id: string;
  slug: string;
  name: string;
  parent: string | null;
  description?: string;
  image?: ImageAsset;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductCardData {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  species: Species;
  price: number;
  comparePrice?: number;
  stock: number;
  stockStatus: StockStatus;
  coverImage: ImageAsset;
  avgRating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  specifications?: { suitableFor?: string };
}

export interface ProductDetail extends ProductCardData {
  category: { _id: string; slug: string; name: string };
  tags: string[];
  images: ImageAsset[];
  shortDescription?: string;
  description?: string;
  specifications: {
    weight?: string;
    suitableFor?: string;
    ingredients?: string;
    material?: string;
    countryOfOrigin?: string;
    expiryDate?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export interface ApiErrorEnvelope {
  message: string;
  errors: { field?: string; message?: string; code?: string }[];
}
