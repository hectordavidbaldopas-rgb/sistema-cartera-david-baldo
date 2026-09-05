import { describe, it, expect } from "vitest";
import { daysToExpiry, expiryLevel, expiryLabel } from "../expiry";

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

describe("daysToExpiry", () => {
  it("returns null when there is no date", () => {
    expect(daysToExpiry(null)).toBeNull();
    expect(daysToExpiry(undefined)).toBeNull();
  });

  it("returns 0 for a date that is today", () => {
    expect(daysToExpiry(daysFromNow(0))).toBe(0);
  });

  it("returns a positive number for a future date", () => {
    expect(daysToExpiry(daysFromNow(10))).toBe(10);
  });

  it("returns a negative number for a past date", () => {
    expect(daysToExpiry(daysFromNow(-5))).toBe(-5);
  });
});

describe("expiryLevel", () => {
  it("is 'sin_fecha' when there is no date", () => {
    expect(expiryLevel(null)).toBe("sin_fecha");
  });

  it("is 'vencida' for a past date", () => {
    expect(expiryLevel(daysFromNow(-1))).toBe("vencida");
  });

  it("is 'roja' within the urgent window", () => {
    expect(expiryLevel(daysFromNow(0))).toBe("roja");
    expect(expiryLevel(daysFromNow(7))).toBe("roja");
  });

  it("is 'naranja' between urgent and warning windows", () => {
    expect(expiryLevel(daysFromNow(8))).toBe("naranja");
    expect(expiryLevel(daysFromNow(30))).toBe("naranja");
  });

  it("is 'verde' beyond the warning window", () => {
    expect(expiryLevel(daysFromNow(31))).toBe("verde");
  });
});

describe("expiryLabel", () => {
  it("says 'vence hoy' for today", () => {
    expect(expiryLabel(daysFromNow(0))).toBe("vence hoy");
  });

  it("mentions days remaining for a future date", () => {
    expect(expiryLabel(daysFromNow(5))).toBe("vence en 5d");
  });

  it("mentions days overdue for a past date", () => {
    expect(expiryLabel(daysFromNow(-3))).toBe("vencida hace 3d");
  });
});
