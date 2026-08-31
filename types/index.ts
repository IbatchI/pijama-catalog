export interface Product {
  id: string;
  name: string;
  price: number | null;
  type: string;
  imagePath: string;
}

export interface CartItem {
  product: Product;
}
