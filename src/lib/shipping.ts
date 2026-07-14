export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 150;

export function calculateShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
