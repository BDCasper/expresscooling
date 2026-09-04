import type { images } from './assets';

export interface EquipmentCategory {
  slug: string;
  title: string;
  description: string;
  /**
   * Bento-сетка 2×2 с неравными колонками (node 1:256): крупные карточки
   * (1 и 4) занимают две колонки из трёх и получают заголовок 30px,
   * узкие (2 и 3) — одну колонку и заголовок 22px. Числа — из
   * get_design_context, не подобраны на глаз.
   */
  size: 'large' | 'small';
  /**
   * Отсутствует ровно у одной категории — «Промышленные установки»
   * (node 1:278). В макете у неё нет фотографии, только иконка на
   * амберной плашке, а не потому что фото забыли подставить.
   */
  imageKey?: keyof typeof images;
  /** Иконка на амберной плашке — задана только у категории без фото. */
  iconName?: string;
}

/**
 * Четыре категории оборудования (node 1:256), в порядке следования
 * bento-сетки: крупная 1, узкая 2, узкая 3, крупная 4. Тексты — дословно
 * из get_design_context, не из усечённой метадаты.
 */
export const equipment: EquipmentCategory[] = [
  {
    slug: 'household-fridges',
    title: 'Бытовые холодильники',
    description:
      'Двухкамерные, No Frost, встраиваемые. Основная часть выездов по квартирам Алматы: оттайка, компрессор, датчики температуры.',
    size: 'large',
    imageKey: 'equipmentHouseholdFridges',
  },
  {
    slug: 'display-cases',
    title: 'Торговые витрины и морозильные камеры',
    description: 'Работают без остановки, поэтому первым забивается конденсатор и течёт дренаж.',
    size: 'small',
    imageKey: 'equipmentDisplayCases',
  },
  {
    slug: 'pastry-cabinets',
    title: 'Кондитерские шкафы',
    description: 'Держат узкий диапазон температуры и влажности.',
    size: 'small',
    imageKey: 'equipmentPastryCabinets',
  },
  {
    slug: 'industrial',
    title: 'Промышленные установки',
    description: 'Холодильные камеры и компрессорно-конденсаторные агрегаты на производстве и складах.',
    size: 'large',
    iconName: 'icon-camera-industrial',
  },
];
