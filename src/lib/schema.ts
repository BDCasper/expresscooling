import { site } from '../data/site';
import { brands } from '../data/brands';

const WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export function buildLocalBusinessSchema(ogImageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    description:
      `Ремонт холодильников и холодильного оборудования в ${site.city}. Звонки принимают сами мастера, выезд по городу за ${site.responseTime}, стоимость работ называем до начала ремонта.`,
    url: site.url,
    image: ogImageUrl,
    telephone: site.phones.map((p) => p.raw),
    priceRange: site.diagnosticsFrom,
    currenciesAccepted: 'KZT',
    areaServed: { '@type': 'City', name: site.city },
    /**
     * Марки из секции «Что берём в работу» (src/data/brands.ts) — источник
     * общий, список не дублируется. У четырёх из двенадцати брендов (LG,
     * Samsung, Bosch, Hitachi) в макете только SVG-значок без подписи —
     * контент SVG поисковик не читает, а у значка Bosch на рисунке нет даже
     * слова «BOSCH». Видимые подписи добавлять нельзя (верстаем строго по
     * макету), поэтому связь страницы с марками идёт только через
     * структурированные данные.
     *
     * knowsAbout, а не brand/makesOffer: бизнес не производит и не продаёт
     * технику этих марок — только ремонтирует. `brand` у Organization
     * подразумевал бы владение брендом, `makesOffer` пришлось бы обвешивать
     * вложенными Service/Offer на каждую марку ради одного факта и по духу
     * ближе к перечислению услуг, чем к экспертизе. knowsAbout как раз и
     * означает «тема, в которой организация разбирается», без утверждения
     * о производстве или продаже — именно то, что здесь верно.
     */
    knowsAbout: brands.map((brand) => brand.name),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...WEEK],
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    // address намеренно отсутствует: физической точки нет, только выезд.
    // Пустой или выдуманный адрес — прямой путь к отклонению в Google Business.
  };
}
