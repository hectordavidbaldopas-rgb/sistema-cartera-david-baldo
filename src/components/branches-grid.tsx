"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/reveal";
import {
  CarIcon,
  HomeIcon,
  StoreIcon,
  ShieldHeartIcon,
  FlameIcon,
  GlassIcon,
  GearIcon,
  TruckIcon,
  AnchorIcon,
  PersonShieldIcon,
  LockIcon,
  HailIcon,
  ScaleIcon,
  BuildingIcon,
} from "@/components/brand-icons";

const BRANCHES = [
  {
    Icon: FlameIcon,
    label: "Incendio",
    description: "Cubre los daños a tu propiedad por incendio, explosión o rayo.",
    detail:
      "Protege tu vivienda, local o bienes ante los daños que puede provocar un incendio, una explosión o la caída de un rayo. Cubre tanto la estructura como el contenido (muebles, mercadería, maquinaria, según lo que hayas asegurado), y es la base sobre la que se arman la mayoría de los seguros combinados e integrales.",
    related: ["Seguro combinado familiar", "Seguro integral para comercio e industria", "Seguro integral para consorcio"],
  },
  {
    Icon: GlassIcon,
    label: "Cristales",
    description: "Cubre la rotura accidental de vidrios y vidrieras en tu casa o negocio.",
    detail:
      "Cubre la rotura accidental de vidrios, vidrieras, espejos y carteles de tu casa o negocio, ya sea por un golpe, un robo o un hecho fortuito. Es especialmente útil para comercios con grandes vidrieras a la calle, donde el reemplazo puede ser costoso.",
    related: ["Seguro combinado familiar", "Seguro integral para comercio e industria"],
  },
  {
    Icon: GearIcon,
    label: "Seguro técnico",
    description: "Cubre roturas o fallas en maquinaria, equipos e instalaciones.",
    detail:
      "Protege maquinaria, equipos electrónicos e instalaciones ante roturas o fallas eléctricas o mecánicas que no son consecuencia del uso normal. Pensado para comercios, industrias y oficinas que dependen de equipos costosos para funcionar: computadoras, equipos médicos, maquinaria de producción, entre otros.",
    related: ["Seguro integral para comercio e industria"],
  },
  {
    Icon: TruckIcon,
    label: "Transporte",
    description: "Cubre la mercadería mientras se traslada de un lugar a otro.",
    detail:
      "Cubre la mercadería o los bienes mientras se trasladan de un lugar a otro, por tierra, agua o aire. Protege ante robo, incendio, vuelco u otros accidentes que puedan dañar o hacer perder la carga durante el viaje.",
    related: ["Automotores", "Cascos"],
  },
  {
    Icon: AnchorIcon,
    label: "Cascos",
    description: "Cubre daños al vehículo, embarcación o maquinaria asegurada.",
    detail:
      "Cubre los daños físicos que pueda sufrir el vehículo, la embarcación o la maquinaria asegurada en sí misma (el \"casco\"), a diferencia de la responsabilidad civil, que cubre a terceros. Se usa mucho para flotas de vehículos, maquinaria agrícola o embarcaciones.",
    related: ["Automotores", "Transporte", "Seguro técnico"],
  },
  {
    Icon: CarIcon,
    label: "Automotores",
    description: "Cubre tu auto, moto, camioneta o camión ante choques, robo e incendio.",
    detail:
      "Cubre tu auto, moto, camioneta o camión ante choques, robo, incendio, daños totales o parciales y responsabilidad civil frente a terceros. Se arma a medida según el uso del vehículo (particular, comercial o de trabajo) y el nivel de cobertura que necesites.",
    related: ["Granizo", "Robo", "Responsabilidad civil", "Accidentes personales", "Cascos"],
  },
  {
    Icon: PersonShieldIcon,
    label: "Accidentes personales",
    description: "Indemniza en caso de muerte o invalidez a causa de un accidente.",
    detail:
      "Brinda una indemnización económica en caso de muerte o invalidez (total o parcial) a causa de un accidente, dentro o fuera del trabajo. Es un complemento importante para quienes no cuentan con otra cobertura de este tipo o quieren ampliarla.",
    related: ["Automotores", "Vida"],
  },
  {
    Icon: LockIcon,
    label: "Robo",
    description: "Cubre el hurto o robo de bienes en tu casa, comercio o vehículo.",
    detail:
      "Cubre el hurto o robo de bienes en tu casa, comercio o vehículo, incluyendo en muchos casos los daños que deja el robo, como puertas forzadas, cerraduras rotas o vidrios rotos. Se puede contratar de forma independiente o como parte de un seguro combinado.",
    related: ["Automotores", "Seguro combinado familiar", "Seguro integral para comercio e industria"],
  },
  {
    Icon: HailIcon,
    label: "Granizo",
    description: "Cubre los daños por granizo en cultivos, techos y estructuras.",
    detail:
      "Cubre los daños que provoca el granizo en cultivos, techos, vehículos, estructuras y otros bienes. Es una cobertura clave en zonas agrícolas como la nuestra, donde el granizo puede afectar tanto al campo como a la vivienda o el comercio.",
    related: ["Automotores", "Seguro combinado familiar"],
  },
  {
    Icon: ScaleIcon,
    label: "Responsabilidad civil",
    description: "Cubre los daños que vos o tu actividad le puedan causar a terceros.",
    detail:
      "Cubre los daños materiales o físicos que vos, tu familia o tu actividad le puedan ocasionar a terceros de forma involuntaria. Por ejemplo, si tu auto choca a otro vehículo, si alguien se lastima en tu comercio o si tu actividad genera un daño a un tercero.",
    related: [
      "Automotores",
      "Seguro combinado familiar",
      "Seguro integral para comercio e industria",
      "Seguro integral para consorcio",
    ],
  },
  {
    Icon: HomeIcon,
    label: "Seguro combinado familiar",
    description: "Cubre tu vivienda en una sola póliza: incendio, robo, responsabilidad civil y más.",
    detail:
      "Protege tu vivienda de forma integral en una sola póliza: incendio, robo, responsabilidad civil, cristales y otros riesgos, según lo que necesites cubrir. Es la opción más completa para proteger tu casa y todo lo que hay adentro.",
    related: ["Incendio", "Robo", "Cristales", "Responsabilidad civil", "Granizo"],
  },
  {
    Icon: StoreIcon,
    label: "Seguro integral para comercio e industria",
    description: "Cubre tu local o fábrica ante incendio, robo y otros riesgos, todo en un solo seguro.",
    detail:
      "Protege tu local, oficina o fábrica ante incendio, robo, responsabilidad civil, cristales y otros riesgos propios de la actividad comercial o industrial, todo combinado en una sola póliza pensada para tu negocio.",
    related: ["Incendio", "Robo", "Cristales", "Responsabilidad civil", "Seguro técnico"],
  },
  {
    Icon: BuildingIcon,
    label: "Seguro integral para consorcio",
    description: "Cubre el edificio y las partes comunes del consorcio ante incendio, responsabilidad civil y más.",
    detail:
      "Cubre el edificio y las partes comunes del consorcio (escalera, ascensor, terraza, entre otras) ante incendio, responsabilidad civil y otros daños. Es la cobertura que necesita todo edificio de propiedad horizontal para proteger a los propietarios.",
    related: ["Incendio", "Responsabilidad civil"],
  },
  {
    Icon: ShieldHeartIcon,
    label: "Vida",
    description: "Protección económica para tu familia ante fallecimiento o invalidez, individual o colectivo.",
    detail:
      "Brinda protección económica a tu familia en caso de fallecimiento o invalidez, ya sea de forma individual o como seguro colectivo para empleados de una empresa. Es una forma de asegurar la tranquilidad económica de quienes dependen de vos.",
    related: ["Accidentes personales"],
  },
];

export default function BranchesGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  const open = openIndex !== null ? BRANCHES[openIndex] : null;

  function goTo(label: string) {
    const i = BRANCHES.findIndex((b) => b.label === label);
    if (i !== -1) setOpenIndex(i);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((b, i) => (
          <Reveal key={b.label} delay={i * 40}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="flex h-full w-full flex-col gap-3 rounded-2xl border border-gold-500/25 bg-navy-950 p-5 text-left transition duration-150 hover:border-gold-400/60 hover:bg-navy-950/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 text-gold-300">
                <b.Icon className="h-5 w-5" />
              </span>
              <p className="text-base font-semibold text-white/90">{b.label}</p>
              <p className="text-sm text-white/60">{b.description}</p>
              <span className="mt-auto text-xs font-medium text-gold-400">Ver más →</span>
            </button>
          </Reveal>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold-500/30 bg-navy-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/40 text-gold-300">
                <open.Icon className="h-6 w-6" />
              </span>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Cerrar"
                className="text-2xl leading-none text-white/50 transition hover:text-white"
              >
                ×
              </button>
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">{open.label}</h3>
            <p className="text-sm leading-relaxed text-white/70">{open.detail}</p>
            {open.related.length > 0 && (
              <div className="mt-5 border-t border-gold-500/15 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                  También puede ir incluida en
                </p>
                <div className="flex flex-wrap gap-2">
                  {open.related.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goTo(label)}
                      className="rounded-full border border-gold-500/40 px-3 py-1.5 text-xs font-medium text-gold-300 transition hover:border-gold-400 hover:bg-gold-500/10"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
