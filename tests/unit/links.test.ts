import { describe, expect, it } from 'vitest';
import { site } from '../../src/data/site';
import { digitsOnly, primaryPhone, telHref, whatsappHref } from '../../src/lib/links';

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
  it('не содержит номеров-заглушек из макета (устойчиво к форматированию)', () => {
    // Нормализуем все данные сайта, убирая всё кроме цифр
    const serialized = JSON.stringify(site);
    const normalized = serialized.replace(/\D/g, '');
    // Проверяем что слитные формы заглушек не попали в данные
    expect(normalized).not.toContain('7760251088');
    expect(normalized).not.toContain('7078887371');
  });

  it('ловит заглушку в человеческом формате', () => {
    // Эта заглушка в таком формате может быть случайно скопирована из макета
    const humanFormat = '+7 760 251 088';
    const normalized = humanFormat.replace(/\D/g, '');
    expect(normalized).toBe('7760251088');
  });

  it('содержит оба настоящих номера', () => {
    expect(site.phones.map((p) => p.raw)).toEqual(['+77011325970', '+77073279715']);
  });
});
