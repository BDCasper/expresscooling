import type { images } from './assets';

export interface Breakage {
  slug: string;
  title: string;
  description: string;
  imageKey: keyof typeof images;
  featured: boolean;
  badge?: string;
}

/**
 * Восемь поломок из макета (node 1:78), в порядке следования: сначала
 * четыре крупные карточки (featured), затем четыре малые. Тексты — дословно
 * из get_design_context, а не из усечённой метадаты.
 */
export const breakages: Breakage[] = [
  {
    slug: 'ne-holodit',
    title: 'Не холодит, не морозит',
    description: 'Компрессор гудит, холода нет. Смотрим утечку фреона, засор капиллярной трубки и пусковое реле.',
    imageKey: 'breakageNeHolodit',
    featured: true,
    badge: 'Начните отсюда',
  },
  {
    slug: 'shuba',
    title: 'Шуба, зарос льдом',
    description: 'В No Frost это система оттайки: ТЭН, датчик или таймер. Лёд дорастает до вентилятора и ломает лопасти.',
    imageKey: 'breakageShuba',
    featured: true,
  },
  {
    slug: 'techet',
    title: 'Течёт, лужа под холодильником',
    description: 'Забит дренаж или замёрзла дренажная трубка. Прочищаем канал и смотрим, куда уходит вода.',
    imageKey: 'breakageTechet',
    featured: true,
  },
  {
    slug: 'shumit',
    title: 'Шумит, гудит, трещит',
    description: 'Слушаем, что именно шумит: вентилятор задевает наледь, ослабли опоры компрессора или гудит реле.',
    imageKey: 'breakageShumit',
    featured: true,
  },
  {
    slug: 'perestal-morozit',
    title: 'Перестал морозить',
    description: 'Камеры тёплые, мотор тихий. Проверяем датчик температуры и запуск компрессора.',
    imageKey: 'breakagePerestalMorozit',
    featured: false,
  },
  {
    slug: 'kompressor',
    title: 'Компрессор не включается',
    description: 'Мотор щёлкает и глохнет через 3-5 секунд. Разделяем на месте: пуско-защитное реле или сам компрессор.',
    imageKey: 'breakageKompressor',
    featured: false,
  },
  {
    slug: 'odna-kamera',
    title: 'Не работает одна из камер',
    description: 'В одной камере холод есть, в другой нет: заслонка, вентилятор или забитый льдом воздуховод.',
    imageKey: 'breakageOdnaKamera',
    featured: false,
  },
  {
    slug: 'pischit',
    title: 'Пищит, мигает, моргает',
    description: 'Сигналит плата управления. Читаем код, проверяем датчики температуры и контур оттайки.',
    imageKey: 'breakagePischit',
    featured: false,
  },
];
