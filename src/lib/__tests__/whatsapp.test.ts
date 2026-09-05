import { describe, it, expect } from "vitest";
import { renderTemplate, buildWhatsAppLink } from "../whatsapp";

describe("renderTemplate", () => {
  it("replaces every known variable", () => {
    const result = renderTemplate(
      "Hola {{cliente}}, tu {{ramo}} de {{compañia}} vence el {{fecha_vencimiento}} (póliza {{poliza}}, atiende {{vendedor}})",
      {
        cliente: "Juan Perez",
        ramo: "Auto",
        compania: "Mapfre",
        fecha_vencimiento: "1/9/2027",
        poliza: "AB123",
        vendedor: "David",
      },
    );
    expect(result).toBe(
      "Hola Juan Perez, tu Auto de Mapfre vence el 1/9/2027 (póliza AB123, atiende David)",
    );
  });

  it("leaves a variable blank when no value is given", () => {
    expect(renderTemplate("Hola {{cliente}}", {})).toBe("Hola ");
  });
});

describe("buildWhatsAppLink", () => {
  it("adds the Argentina country code to a local number", () => {
    const link = buildWhatsAppLink("3471539107", "hola");
    expect(link).toBe("https://wa.me/543471539107?text=hola");
  });

  it("does not duplicate the country code if already present", () => {
    const link = buildWhatsAppLink("543471539107", "hola");
    expect(link).toBe("https://wa.me/543471539107?text=hola");
  });

  it("encodes the message", () => {
    const link = buildWhatsAppLink("3471539107", "hola ¿cómo va?");
    expect(link).toContain(encodeURIComponent("hola ¿cómo va?"));
  });
});
