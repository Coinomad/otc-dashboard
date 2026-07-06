import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: 'GHS' | 'NGN' | 'USDT' = 'GHS',
) {
  if (currency === 'USDT') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace('$', 'USDT ');
  }

  if (currency === 'NGN') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace('₦', '₦');
  }

  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace('GHS', '₵');
}

export function formatNumber(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount);
}