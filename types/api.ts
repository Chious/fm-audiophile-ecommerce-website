export interface ProductImage {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface IncludedItem {
  quantity: number;
  item: string;
}

export interface RelatedProduct {
  slug: string;
  name: string;
  image: ProductImage;
}

export interface ProductGallery {
  first: ProductImage;
  second: ProductImage;
  third: ProductImage;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  image: ProductImage;
  category: string;
  categoryImage: ProductImage;
  new: boolean;
  price: number;
  description: string;
  features: string;
  includes: IncludedItem[];
  gallery: ProductGallery;
  others: RelatedProduct[];
}

export interface CartItem {
  slug: string;
  quantity: number;
  product: Product | null;
  total: number;
}

export interface Cart {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  grandTotal: number;
}

export interface CheckoutPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  payment: string;
  emoneyNumber?: string;
  emoneyPin?: string;
}

export interface Order {
  success: boolean;
  message: string;
  orderId: string;
  receivedPayload: CheckoutPayload;
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  grandTotal: number;
}
