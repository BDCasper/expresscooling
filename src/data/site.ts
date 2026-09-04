export interface Phone {
  /** Номер в каноничном виде, для tel: и schema.org */
  raw: string;
  /** Как показывается человеку */
  display: string;
  isWhatsapp: boolean;
}

export const site = {
  name: 'Express Cooling',
  legalLine: 'Express Cooling, ремонт холодильного оборудования',
  url: 'https://expresscooling.kz',
  city: 'Алматы',
  /** Адреса нет: обслуживаем территорию, а не точку */
  hasStorefront: false,
  phones: [
    { raw: '+77011325970', display: '+7 701 132 5970', isWhatsapp: true },
    { raw: '+77073279715', display: '+7 707 327 9715', isWhatsapp: true },
  ] as Phone[],
  hours: {
    opens: '06:00',
    /** 23:59, а не 00:00: интервал нулевой длины ломает разметку schema.org */
    closes: '23:59',
    label: '6:00-00:00',
    /**
     * Короткая человеческая запись для фраз вида «заявки с … до …» (Hero,
     * Business, Footer) — так время показано человеку в макете. `opens`/
     * `closes` не годятся для этого: они в формате под schema.org (ведущий
     * ноль, `closes` нарочно `23:59`, а не `00:00` — см. комментарий выше).
     */
    opensShort: '6:00',
    closesShort: '00:00',
  },
  whatsappText: 'Здравствуйте! Пишу с сайта. Холодильник: [модель]. Проблема: ',
  diagnosticsFrom: 'от 3500 ₸',
  responseTime: '40-90 мин',
} as const;
