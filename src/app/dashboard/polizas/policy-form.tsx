"use client";

import { useActionState } from "react";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import {
  POLICY_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  UPDATE_FREQUENCY,
} from "@/lib/policy-fields";
import type { Policy, InsuranceBranch, InsuranceCompany, Seller } from "@prisma/client";

type ActionFn = (
  prevState: { error: string | null },
  formData: FormData,
) => Promise<{ error: string | null }>;

function dateInputValue(d: Date | null | undefined) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function PolicyForm({
  action,
  clientId,
  policy,
  branches,
  companies,
  sellers,
  lockSellerId,
  submitLabel,
}: {
  action: ActionFn;
  clientId: string;
  policy?: Policy;
  branches: InsuranceBranch[];
  companies: InsuranceCompany[];
  sellers: Seller[];
  lockSellerId: string | null;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <input type="hidden" name="clientId" value={clientId} />
      {policy && <input type="hidden" name="id" value={policy.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ramo</label>
          <select name="branchId" required defaultValue={policy?.branchId ?? ""} className={inputClass}>
            <option value="" disabled>
              Elegir...
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Compañía</label>
          <select name="companyId" defaultValue={policy?.companyId ?? ""} className={inputClass}>
            <option value="">A confirmar</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Vendedor</label>
        {lockSellerId ? (
          <>
            <input type="hidden" name="sellerId" value={lockSellerId} />
            <input
              disabled
              className={inputClass}
              value={sellers.find((s) => s.id === lockSellerId)?.displayName ?? ""}
            />
          </>
        ) : (
          <select name="sellerId" required defaultValue={policy?.sellerId ?? ""} className={inputClass}>
            <option value="" disabled>
              Elegir...
            </option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>N° de póliza</label>
          <input name="policyNumber" defaultValue={policy?.policyNumber ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Objeto asegurado</label>
          <input
            name="insuredObject"
            defaultValue={policy?.insuredObject ?? ""}
            className={inputClass}
            placeholder="Ej: patente AB123CD"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Cobertura</label>
        <input name="coverageName" defaultValue={policy?.coverageName ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Fecha de emisión</label>
          <input
            name="startDate"
            type="date"
            defaultValue={dateInputValue(policy?.startDate)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha de vencimiento</label>
          <input
            name="endDate"
            type="date"
            defaultValue={dateInputValue(policy?.endDate)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Suma asegurada</label>
          <input
            name="insuredSum"
            type="number"
            step="0.01"
            defaultValue={policy?.insuredSum ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Prima mensual</label>
          <input
            name="premiumAmount"
            type="number"
            step="0.01"
            defaultValue={policy?.premiumAmount ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>% Comisión</label>
          <input
            name="commissionPercentage"
            type="number"
            step="0.01"
            defaultValue={
              policy?.commissionPercentage != null ? policy.commissionPercentage * 100 : 10
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Forma de pago</label>
          <select name="paymentMethod" defaultValue={policy?.paymentMethod ?? "unknown"} className={inputClass}>
            {PAYMENT_METHOD.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estado de pago</label>
          <select name="paymentStatus" defaultValue={policy?.paymentStatus ?? "unknown"} className={inputClass}>
            {PAYMENT_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Cuotas</label>
          <input
            name="installmentCount"
            type="number"
            defaultValue={policy?.installmentCount ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Actualización</label>
          <select name="updateFrequency" defaultValue={policy?.updateFrequency ?? "none"} className={inputClass}>
            {UPDATE_FREQUENCY.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estado de la póliza</label>
          <select name="status" defaultValue={policy?.status ?? "draft"} className={inputClass}>
            {POLICY_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-white/70">
        Nota: el % de comisión se guarda como número entero (10 = 10%), no como fracción.
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
