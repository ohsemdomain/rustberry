// Follow pattern from src/shared/items.ts

export enum InvoiceStatus {
  UNPAID = 1,
  PARTIAL = 2,
  PAID = 3,
  CANCELLED = 4,
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  // Billing address
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_address_line3: string | null
  billing_address_line4: string | null
  billing_postcode: string | null
  billing_city: string | null
  billing_state: string | null
  billing_country: string | null
  // Shipping address
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_address_line3: string | null
  shipping_address_line4: string | null
  shipping_postcode: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_country: string | null
  invoice_date: number
  status: InvoiceStatus
  subtotal_cents: number
  discount_percent: number
  discount_cents: number
  tax_percent: number
  tax_cents: number
  total_cents: number
  notes: string | null
  created_at: number
  updated_at: number
  created_by: string
  updated_by: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_id: string | null
  description: string
  quantity: number
  unit_price_cents: number
  total_cents: number
  sort_order: number
  created_at: number
  updated_at: number
}

export const INVOICE_ID_PREFIX = 'INV'
export const INVOICE_ITEM_ID_PREFIX = 'INVI'