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

  it('подставляет заготовку сообщения', () => {
    const text = new URL(whatsappHref()).searchParams.get('text');
    expect(text).toBe(site.whatsappText);
  });
});

describe('site', () => {
  it('не содержит номеров-заглушек из макета', () => {
    const serialized = JSON.stringify(site);
    expect(serialized).not.toContain('7760251088');
    expect(serialized).not.toContain('7078887371');
  });

  it('содержит оба настоящих номера', () => {
    expect(site.phones.map((p) => p.raw)).toEqual(['+77011325970', '+77073279715']);
  });
});
