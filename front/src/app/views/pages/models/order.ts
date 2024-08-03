export interface OrderItem {
    productId: string;
    product: any; 
    quantity: number;
    price: number;
  }
  
  export interface Order {
    id: string;
    zip: string;
    lastName: string;
    country: string;
    address: string;
    cartItems: CartItem[];
    orderDate: Date;
    totalPrice: number; 
  }
  export interface CartItem {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    size: string;
  }
  export interface Product {
    id: string;
    title: string;
    images: string[];
  }