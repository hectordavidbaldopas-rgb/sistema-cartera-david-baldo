import { describe, it, expect } from "vitest";
import { computeInformationStatus, missingFields } from "../client-status";

describe("computeInformationStatus", () => {
  it("is 'incomplete' when nothing is filled", () => {
    expect(computeInformationStatus({})).toBe("incomplete");
  });

  it("is 'complete' when every required field is filled", () => {
    expect(
      computeInformationStatus({
        documentNumber: "30111222",
        phone: "3471000000",
        email: "test@test.com",
        address: "Calle 1",
        birthDate: new Date(),
      }),
    ).toBe("complete");
  });

  it("is 'partial' when only some fields are filled", () => {
    expect(computeInformationStatus({ phone: "3471000000" })).toBe("partial");
  });
});

describe("missingFields", () => {
  it("lists every missing field by its label", () => {
    const missing = missingFields({ phone: "3471000000" });
    expect(missing).toContain("DNI");
    expect(missing).toContain("email");
    expect(missing).toContain("domicilio");
    expect(missing).toContain("fecha de nacimiento");
    expect(missing).not.toContain("teléfono");
  });

  it("is empty when everything is filled", () => {
    const missing = missingFields({
      documentNumber: "1",
      phone: "1",
      email: "1",
      address: "1",
      birthDate: new Date(),
    });
    expect(missing).toEqual([]);
  });
});
