export const PRODUCT_STATUSES = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800 border-gray-200", variant: "secondary" as const },
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800 border-yellow-200", variant: "outline" as const },
  active: { label: "Active", color: "bg-green-100 text-green-800 border-green-200", variant: "default" as const },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", variant: "destructive" as const },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-500 border-gray-200", variant: "secondary" as const },
} as const;

export type ProductStatus = keyof typeof PRODUCT_STATUSES;

export const REQUIRED_FIELDS_FOR_SUBMISSION = [
  "title",
  "brand",
  "condition",
  "entity_type",
  "domain_category",
  "description",
  "image_url",
  "vat_treatment",
  "availability_status",
  "ships_from",
  "shipping_cost_rule",
] as const;

export function isProductComplete(product: Record<string, any>): boolean {
  return REQUIRED_FIELDS_FOR_SUBMISSION.every(
    (field) => product[field] !== null && product[field] !== undefined && product[field] !== ""
  );
}

export function getStatusInfo(status: string | null) {
  return PRODUCT_STATUSES[(status as ProductStatus) || "draft"] || PRODUCT_STATUSES.draft;
}
