import { describe, it, expect } from "vitest";
import { normalizeDocumentNumber, initialPasswordFromDocument, isValidDocumentNumber } from "../credentials";

describe("normalizeDocumentNumber", () => {
  it("strips dots and spaces", () => {
    expect(normalizeDocumentNumber("22.543.873")).toBe("22543873");
    expect(normalizeDocumentNumber("22 543 873")).toBe("22543873");
  });
});

describe("initialPasswordFromDocument", () => {
  it("is the last 4 digits of the DNI", () => {
    expect(initialPasswordFromDocument("22543873")).toBe("3873");
  });

  it("works even if the DNI has separators", () => {
    expect(initialPasswordFromDocument("22.543.873")).toBe("3873");
  });
});

describe("isValidDocumentNumber", () => {
  it("accepts a plausible DNI length", () => {
    expect(isValidDocumentNumber("22543873")).toBe(true);
  });

  it("rejects something too short", () => {
    expect(isValidDocumentNumber("123")).toBe(false);
  });

  it("rejects something too long", () => {
    expect(isValidDocumentNumber("1234567890123")).toBe(false);
  });
});
