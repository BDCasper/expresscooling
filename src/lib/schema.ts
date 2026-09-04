import { site } from '../data/site';

const WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export function buildLocalBusinessSchema(ogImageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    description:
      'Ремонт холодильников и холодильного оборудования в Алматы. Звонки принимают сами мастера, выезд по городу за 40-90 минут, стоимость работ называем до начала ремонта.',
    url: site.url,
    image: ogImageUrl,
    telephone: site.phones.map((p) => p.raw),
    priceRange: site.diagnosticsFrom,
    currenciesAccepted: 'KZT',
    areaServed: { '@type': 'City', name: site.city },
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
