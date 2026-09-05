import { describe, it, expect } from "vitest";
import { splitRamoText, mapRamoToken } from "../import/branch-mapping";

describe("splitRamoText", () => {
  it("splits on dashes", () => {
    expect(splitRamoText("AUTO-MOTO")).toEqual(["AUTO", "MOTO"]);
  });

  it("splits on ' Y ' too", () => {
    expect(splitRamoText("CAMION Y PICK UP")).toEqual(["CAMION", "PICK UP"]);
  });

  it("trims whitespace and drops empty tokens", () => {
    expect(splitRamoText("PICK UP - MOTO -  HOGAR ")).toEqual(["PICK UP", "MOTO", "HOGAR"]);
  });

  it("keeps a single token as-is", () => {
    expect(splitRamoText("HOGAR")).toEqual(["HOGAR"]);
  });
});

describe("mapRamoToken", () => {
  it("maps known synonyms to their real branch name", () => {
    expect(mapRamoToken("auto").branchName).toBe("Auto/Moto/Camioneta/Camion");
    expect(mapRamoToken("MOTO").branchName).toBe("Auto/Moto/Camioneta/Camion");
    expect(mapRamoToken("Pick Up").branchName).toBe("Auto/Moto/Camioneta/Camion");
    expect(mapRamoToken("hogar").branchName).toBe("Combinado Familiar");
    expect(mapRamoToken("comercio").branchName).toBe("Integral de Comercio");
    expect(mapRamoToken("art").branchName).toBe("ART");
    expect(mapRamoToken("ap").branchName).toBe("Accidentes Personales");
  });

  it("marks known synonyms as mapped", () => {
    expect(mapRamoToken("auto").mapped).toBe(true);
  });

  it("maps 'campo' to Otro explicitly (known synonym)", () => {
    const result = mapRamoToken("campo");
    expect(result.branchName).toBe("Otro");
    expect(result.mapped).toBe(true);
  });

  it("falls back to Otro for anything truly unknown, and flags it as not mapped", () => {
    const result = mapRamoToken("buceo");
    expect(result.branchName).toBe("Otro");
    expect(result.mapped).toBe(false);
  });
});
