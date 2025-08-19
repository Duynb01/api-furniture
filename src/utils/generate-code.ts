import {nanoid} from 'nanoid';

export function generateOrderCode(): string{
  return `#ORD-${nanoid(8).toUpperCase()}`
}

export function generatePaymentCode(): string{
  return `#PAY-${nanoid(10).toUpperCase()}`
}