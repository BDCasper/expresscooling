import { describe, expect, it } from 'vitest';
import { site, type Phone } from '../../src/data/site';
import { digitsOnly, primaryPhone, telHref, whatsappHref } from '../../src/lib/links';

/** Номера-заглушки из макета Figma — дословно как в дизайне */
const PLACEHOLDER_PHONES = ['+7 776 025 1088', '+7 707 888 7371'];

/**
 * Проверяет что данные не содержат номера-заглушки из макета.
 * Работает с любым форматом записи (с пробелами, без, слитно).
 */
function containsPlaceholderPhone(data: unknown): boolean {
  const digits = JSON.stringify(data).replace(/\D/g, '');
  return PLACEHOLDER_PHONES.some((p) => digits.includes(p.replace(/\D/g, '')));
}

describe('digitsOnly', () => {
  it('оставляет только цифры', () => {
    expect(digitsOnly('+7 701 132 59 70')).toBe('77011325970');
  });
});

describe('telHref', () => {
  it('строит tel: с международным префиксом', () => {
    expect(telHref('+7 701 132 59 70')).toBe('tel:+77011325970');
  });
});

describe('primaryPhone', () => {
  it('возвращает номер, помеченный как WhatsApp', () => {
    expect(primaryPhone().raw).toBe('+77011325970');
    expect(primaryPhone().isWhatsapp).toBe(true);
  });
});

describe('whatsappHref', () => {
  it('ведёт на wa.me с основным номером', () => {
    expect(whatsappHref()).toMatch(/^https:\/\/wa\.me\/77011325970\?/);
  });

  it('подставляет заготовку сообщения с кодированием %20', () => {
    const href = whatsappHref();
    // Проверяем начало ссылки
    expect(href).toMatch(/^https:\/\/wa\.me\/77011325970\?text=/);
    // Извлекаем закодированную часть текста
    const encodedText = href.split('text=')[1];
    // Проверяем что пробелы кодируются как %20, а не +
    expect(encodedText).toContain('%20');
    expect(encodedText).not.toContain('+');
    // Проверяем что раскодирование даёт ровно исходный текст
    expect(decodeURIComponent(encodedText)).toBe(site.whatsappText);
  });
});

describe('site', () => {
  it('не содержит номеров-заглушек из макета', () => {
    expect(containsPlaceholderPhone(site)).toBe(false);
  });

  it('барьер срабатывает: ловит заглушку в человеческом формате', () => {
    // Симулируем случай когда номер скопирован из Figma в display с пробелами
    const fakeData = {
      ...site,
      phones: [
        {
          raw: '+77011325970',
          display: '+7 776 025 1088', // заглушка дизайнера вместо правильного display
          isWhatsapp: true,
        } as Phone,
      ],
    };
    expect(containsPlaceholderPhone(fakeData)).toBe(true);
  });

  it('содержит оба настоящих номера', () => {
    expect(site.phones.map((p) => p.raw)).toEqual(['+77011325970', '+77073279715']);
  });
});
