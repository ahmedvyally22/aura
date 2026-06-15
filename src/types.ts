export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
  image: string;
  featured: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
