export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  seller_id: string;
  vat_treatment: string | null;
  vat_rate: number;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  description?: string | null;
  entity_type?: string | null;
  domain_category?: string | null;
  addedAt: number;
}
