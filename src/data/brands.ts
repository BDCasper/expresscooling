export interface Brand {
  name: string;
  /** Только у брендов, показанных значком-логотипом (node 1:292). */
  iconKey?: string;
  /**
   * Натуральный размер SVG-логотипа (квадратный viewBox, свой для каждого
   * файла) — 41/62/28/62px в макете, а не единый размер: дизайнер уравнял
   * визуальный вес разных по рисунку логотипов на глаз, не по формуле.
   * Нужен только вместе с iconKey.
   */
  iconSize?: number;
}

/**
 * Двенадцать брендов ряда (node 1:292), в порядке макета. Первые четыре —
 * значком-логотипом, остальные восемь — текстом (см. brief: SVG-логотипы
 * есть только для LG, Samsung, Bosch, Hitachi).
 */
export const brands: Brand[] = [
  { name: 'LG', iconKey: 'brand-lg', iconSize: 41 },
  { name: 'Samsung', iconKey: 'brand-samsung', iconSize: 62 },
  { name: 'Bosch', iconKey: 'brand-bosch', iconSize: 28 },
  { name: 'Hitachi', iconKey: 'brand-hitachi', iconSize: 62 },
  { name: 'INDESIT' },
  { name: 'ARISTON' },
  { name: 'BEKO' },
  { name: 'LIEBHERR' },
  { name: 'АТЛАНТ' },
  { name: 'БИРЮСА' },
  { name: 'ARDO' },
  { name: 'HOTPOINT' },
];
