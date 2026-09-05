"use client";

import { useState } from "react";
import { renderTemplate, buildWhatsAppLink, type TemplateVars } from "@/lib/whatsapp";
import { logWhatsAppSentAction } from "../actions";
import { inputClass, labelClass, cardClass, whatsappButtonClass } from "@/lib/ui";

type Template = { id: string; name: string; templateText: string };

export default function WhatsAppSender({
  followUpId,
  phone,
  templates,
  vars,
}: {
  followUpId: string;
  phone: string;
  templates: Template[];
  vars: TemplateVars;
}) {
  const [templateId, setTemplateId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState(false);

  function onSelectTemplate(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    setMessage(template ? renderTemplate(template.templateText, vars) : "");
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    const label = templates.find((t) => t.id === templateId)?.name ?? "mensaje personalizado";
    try {
      await logWhatsAppSentAction(followUpId, label);
    } finally {
      setSending(false);
    }
    window.open(buildWhatsAppLink(phone, message), "_blank");
  }

  return (
    <div className={cardClass}>
      <p className="mb-2 text-sm font-semibold text-white/90">Enviar WhatsApp ({phone})</p>
      {templates.length > 0 && (
        <div className="mb-3">
          <label className={labelClass}>Plantilla</label>
          <select
            value={templateId}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className={inputClass}
          >
            <option value="">Mensaje libre...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <label className={labelClass}>Mensaje</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className={inputClass}
        placeholder="Escribí el mensaje o elegí una plantilla arriba..."
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !message.trim()}
        className={`mt-3 ${whatsappButtonClass}`}
      >
        {sending ? "Abriendo..." : "Abrir WhatsApp"}
      </button>
    </div>
  );
}
