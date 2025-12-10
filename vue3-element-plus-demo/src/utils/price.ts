import { Decimal } from 'decimal.js';

/**
 * 金额乘法（单价 × 数量）
 * @param price 单价（元）
 * @param quantity 数量
 * @returns 结果（元，保留2位小数）
 */
export const multiplyPrice = (price: number, quantity: number): string => {
  return new Decimal(price)
    .mul(new Decimal(quantity))
    .toFixed(2); // 强制保留2位小数
};

/**
 * 金额求和（多个金额相加）
 * @param amounts 金额数组（元）
 * @returns 总和（元，保留2位小数）
 */
export const sumPrices = (amounts: number[]): string => {
  return amounts.reduce((total, amount) => {
    return new Decimal(total).add(new Decimal(amount)).toFixed(2);
  }, '0.00');
};

/**
 * 格式化金额显示
 * @param amount 金额（元）
 * @returns 带¥的格式化字符串，如 ¥99.00
 */
export const formatPriceDisplay = (amount: number | string): string => {
  return `¥${new Decimal(amount).toFixed(2)}`;
};