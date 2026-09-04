import { describe, expect, it } from 'vitest';

describe('окружение', () => {
  it('собирает TypeScript и запускает Vitest', () => {
    const twoPlusTwo: number = 2 + 2;
    expect(twoPlusTwo).toBe(4);
  });
});
