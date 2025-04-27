export interface Book {
  _id: string;
  title: string;
  price: number;
  image: string;
  isFavorite: boolean;
  description?: string;
  author?: string;
  category?: string;
  rating?: number;
} 