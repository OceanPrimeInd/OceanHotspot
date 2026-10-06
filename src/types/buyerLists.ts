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
  part_number?: string | null;
  supplier_name?: string | null;
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
  seller_id?: string;
  part_number?: string | null;
  supplier_name?: string | null;
  quantity?: number;
  note?: string;
  addedAt: number;
}
