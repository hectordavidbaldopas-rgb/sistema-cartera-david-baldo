"use client";

import { useState } from "react";
import { renderTemplate, buildWhatsAppLink } from "@/lib/whatsapp";
import { inputClass, labelClass, cardClass, whatsappButtonClass } from "@/lib/ui";

type Template = {
  id: string;
  name: string;
  templateText: string;
  branchId: string | null;
  branchName: string | null;
};

type PolicyInfo = {
  branchId: string;
  companyName: string;
  policyNumber: string;
  endDateFormatted: string;
};

export default function ClientMessageSender({
  clientName,
  phone,
  templates,
  policiesByBranch,
}: {
  clientName: string;
  phone: string;
  templates: Template[];
  policiesByBranch: Record<string, PolicyInfo>;
}) {
  const [templateId, setTemplateId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  function onSelectTemplate(template: Template) {
    setTemplateId(template.id);
    const policy = template.branchId ? policiesByBranch[template.branchId] : undefined;
    setMessage(
      renderTemplate(template.templateText, {
        cliente: clientName,
        ramo: template.branchName ?? "",
        compania: policy?.companyName ?? "",
        poliza: policy?.policyNumber ?? "",
        fecha_vencimiento: policy?.endDateFormatted ?? "",
      }),
    );
  }

  if (templates.length === 0) return null;

  const groups = new Map<string, Template[]>();
  for (const t of templates) {
    const key = t.branchName ?? "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return (
    <div className={cardClass}>
      <p className="mb-2 text-sm font-semibold text-white/90">Mensajes prearmados</p>
      <div className="space-y-2">
        {[...groups.entries()].map(([groupName, groupTemplates]) => (
          <div key={groupName}>
            <p className="mb-1 text-xs font-medium uppercase text-white/50">{groupName}</p>
            <div className="flex flex-wrap gap-2">
              {groupTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTemplate(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition duration-150 active:translate-y-px ${
                    templateId === t.id
                      ? "border-gold-400 bg-gold-500/10 text-gold-300"
                      : "border-gold-500/40 text-white/80 hover:border-gold-400 hover:bg-gold-500/10 active:bg-gold-500/20"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {templateId && (
        <div className="mt-3 border-t border-gold-500/20 pt-3">
          <label className={labelClass}>Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className={inputClass}
          />
          <a
            href={buildWhatsAppLink(phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 ${whatsappButtonClass}`}
          >
            Compartir por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
