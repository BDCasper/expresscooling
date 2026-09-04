import type { ImageMetadata } from 'astro';

import heroMasterSrc from '../assets/images/hero-master.jpg';
import warehouseShelvesSrc from '../assets/images/warehouse-shelves.jpg';
import masterToolsSrc from '../assets/images/master-tools.jpg';
import businessMasterSrc from '../assets/images/business-master.jpg';

import breakageNeHoloditSrc from '../assets/images/breakage-ne-holodit.jpg';
import breakageShubaSrc from '../assets/images/breakage-shuba.jpg';
import breakageTechetSrc from '../assets/images/breakage-techet.jpg';
import breakageShumitSrc from '../assets/images/breakage-shumit.jpg';
import breakagePerestalMorozitSrc from '../assets/images/breakage-perestal-morozit.jpg';
import breakageKompressorSrc from '../assets/images/breakage-kompressor.jpg';
import breakageOdnaKameraSrc from '../assets/images/breakage-odna-kamera.jpg';
import breakagePischitSrc from '../assets/images/breakage-pischit.jpg';

import equipmentHouseholdFridgesSrc from '../assets/images/equipment-household-fridges.jpg';
import equipmentDisplayCasesSrc from '../assets/images/equipment-display-cases.jpg';
import equipmentPastryCabinetsSrc from '../assets/images/equipment-pastry-cabinets.jpg';

export interface SiteImage {
  src: ImageMetadata;
  alt: string;
}

export const images = {
  // Первый экран
  heroMaster: {
    src: heroMasterSrc,
    alt: 'Мастер Express Cooling ремонтирует холодильник на кухне в Алматы',
  },

  // Секция "Свой склад"
  warehouseShelves: {
    src: warehouseShelvesSrc,
    alt: 'Стеллажи со склада запчастей',
  },
  masterTools: {
    src: masterToolsSrc,
    alt: 'Инструмент мастера',
  },

  // Секция "Витрина встала" (для бизнеса)
  businessMaster: {
    src: businessMasterSrc,
    alt: 'Мастер подключает манометры к компрессору торгового холодильного шкафа',
  },

  // Крупные карточки поломок
  breakageNeHolodit: {
    src: breakageNeHoloditSrc,
    alt: 'Мастер запаивает медную трубку холодильника газовой горелкой',
  },
  breakageShuba: {
    src: breakageShubaSrc,
    alt: 'Мастер счищает наледь с испарителя холодильника шпателем',
  },
  breakageTechet: {
    src: breakageTechetSrc,
    alt: 'Мастер вытирает лужу воды на полу рядом с холодильником',
  },
  breakageShumit: {
    src: breakageShumitSrc,
    alt: 'Мастер подключает щуп прибора к компрессору холодильника',
  },

  // Малые карточки поломок
  breakagePerestalMorozit: {
    src: breakagePerestalMorozitSrc,
    alt: 'Мастер устанавливает датчик температуры внутри пустой камеры холодильника',
  },
  breakageKompressor: {
    src: breakageKompressorSrc,
    alt: 'Мастер откручивает крепление компрессора холодильника гаечным ключом',
  },
  breakageOdnaKamera: {
    src: breakageOdnaKameraSrc,
    alt: 'Мастер снимает заднюю панель торгового холодильного шкафа отвёрткой',
  },
  breakagePischit: {
    src: breakagePischitSrc,
    alt: 'Мастер проверяет плату управления холодильника мультиметром',
  },

  // Секция "Что берём в работу" — категории оборудования
  equipmentHouseholdFridges: {
    src: equipmentHouseholdFridgesSrc,
    alt: 'Кухня с открытым бытовым холодильником, полным продуктов',
  },
  equipmentDisplayCases: {
    src: equipmentDisplayCasesSrc,
    alt: 'Открытая торговая витрина-холодильник с напитками и товарами в магазине',
  },
  equipmentPastryCabinets: {
    src: equipmentPastryCabinetsSrc,
    alt: 'Кондитерская витрина с тортами за изогнутым стеклом',
  },
} satisfies Record<string, SiteImage>;
