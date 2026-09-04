import { site, type Phone } from '../data/site';

export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function telHref(phone: string): string {
  return `tel:+${digitsOnly(phone)}`;
}

export function primaryPhone(): Phone {
  const found = site.phones.find((p) => p.isWhatsapp);
  if (!found) throw new Error('В site.phones нет номера с WhatsApp');
  return found;
}

/**
 * Базовая ссылка на WhatsApp. UTM-метки и gclid дописываются на клиенте
 * в inline-скрипте: статический HTML не знает параметров запроса.
 *
 * Пробелы кодируются как %20 (не +): это правильно как для form-urlencoded,
 * так и для обычного URI разбора, в то время как + правилен только для form.
 */
export function whatsappHref(): string {
  return `https://wa.me/${digitsOnly(primaryPhone().raw)}?text=${encodeURIComponent(site.whatsappText)}`;
}
