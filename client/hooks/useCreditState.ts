import { useOrder } from "../context/OrderContext";

// Mock credit data — would come from API in production
const CREDIT_LIMIT = 100000000; // $10 crores
const CREDIT_USED = 92000;

export interface CreditState {
  creditLimit: number;
  creditUsed: number;
  creditRemaining: number;
  cartTotal: number;
  remainingAfterOrder: number;
  isExceeded: boolean;
}

export function useCreditState(): CreditState {
  const { totalValue } = useOrder();
  const creditRemaining = CREDIT_LIMIT - CREDIT_USED;
  const remainingAfterOrder = creditRemaining - totalValue;
  const isExceeded = totalValue > 0 && remainingAfterOrder < 0;

  return {
    creditLimit: CREDIT_LIMIT,
    creditUsed: CREDIT_USED,
    creditRemaining,
    cartTotal: totalValue,
    remainingAfterOrder,
    isExceeded,
  };
}
