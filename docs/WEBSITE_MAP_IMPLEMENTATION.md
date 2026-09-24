# Website map V1 — implementation notes (18 Sep scope)

Source workbook: `2026-09-13_OceanHotspot-Website_Map_V1 (1).xlsx`

**Annotated copy (Implementation status + reason columns):**  
[`docs/2026-09-13_OceanHotspot-Website_Map_V1_with_implementation_status.xlsx`](./2026-09-13_OceanHotspot-Website_Map_V1_with_implementation_status.xlsx)

Open the **`18 Sep summary`** tab (second sheet) for one merged checklist with filters — all Customer, Supplier, and Store rows due before 18 Sep.

Re-run after code changes:

```bash
python3 scripts/annotate-website-map-xlsx.py
```

## SQL for you to apply

```bash
# Supabase Dashboard → SQL, or:
supabase db push
```

Migration: [`supabase/migrations/20260917000001_website_map_fields.sql`](../supabase/migrations/20260917000001_website_map_fields.sql)

- `products`: `part_number`, `technical_detail`, `fits`, `replaces`, `supplier_note`
- `store_interest` table + RLS
- `search_products()` updated for part number

## Commission (as-is in code)

- **5%** of order total (including VAT where applicable) as `platform_fee` at checkout (`create-checkout`).
- **Pricing**, **Sell**, and **Terms** copy aligned to **5%** platform commission only (no alternate 10% model in code).

## Env

- `NEXT_PUBLIC_SUPPORT_PHONE` / `NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY` — header “Call us” (optional until number is live).
- `NEXT_PUBLIC_CUSTOMER_CHECKOUT_ENABLED` — set to `true` only when card checkout is live (default off = opening soon).
- Supabase secret `CUSTOMER_CHECKOUT_ENABLED=true` — must match when enabling checkout (`create-checkout` edge function).

## Not implemented in this pass (needs product/ops or larger build)

- Payment hold / buyer accept delivery
- Bank transfer checkout rail
- Two-price (min / retail) per product
- Supplier onboarding VAT + payout bank fields
- Account area placeholder page rewrites
- Physical store / till / vouchers (Store-Physical_To-Be)
