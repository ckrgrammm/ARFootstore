export class Cart {
  items?: CartItem[];
}

export class CartItem {
  product?: any;
  quantity?: number;
}

export class CartItemDetailed {
  product?: any;
  quantity?: number;
}

export class CartItemWithSize {
  productId?: string;
  product?: any; // Add product for template use
  size?: string;
  quantity?: number;
}
