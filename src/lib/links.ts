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
 *
 * `problem` — название поломки, с которым человек пришёл (карточки в
 * секции «Выберите поломку»). Оно дописывается ОТДЕЛЬНЫМ предложением,
 * после точки: «… нужен ремонт холодильника. Проблема: Шумит, гудит,
 * трещит.» Раньше заготовка сама кончалась на «Проблема: » и поломка
 * приклеивалась прямо к ней, но у такой заготовки был изъян: без поломки
 * (hero, шапка, футер, «Другая поломка») она оставалась недописанной
 * фразой, которую нельзя отправить как есть — см. комментарий у
 * site.whatsappText. Теперь оба варианта — законченный текст: и с
 * поломкой, и без неё человеку достаточно нажать «отправить».
 */
export function whatsappHref(problem?: string): string {
  const text = problem ? `${site.whatsappText} Проблема: ${problem}.` : site.whatsappText;
  return `https://wa.me/${digitsOnly(primaryPhone().raw)}?text=${encodeURIComponent(text)}`;
}
