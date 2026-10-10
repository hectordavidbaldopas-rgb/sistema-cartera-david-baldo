"use client";

import { useEffect, useRef } from "react";

// Fondo "viaje por la oficina": el visitante es una miniatura que recorre un
// escritorio gigante. Cada sección de la landing (marcada con data-scene) tiene
// su foto de la misma oficina desde otro ángulo; al scrollear hacia la sección
// siguiente la cámara se acerca al objeto donde está la próxima parada y se
// funde con la foto de ese ángulo. El contenido de cada sección ([data-panel])
// entra desde abajo, de desenfocado a nítido y escalonado, a medida que la
// cámara llega, y sale hacia arriba cuando se va. Fotos en public/oficina:
// versiones con la marca BALDO editadas por el cliente (v2-*), a partir de la
// sesión de Tran Mau Tri Tam en Pexels (uso libre).
const SCENES = [
  // focus = hacia dónde se acerca la cámara al salir de esta escena (% de la foto)
  { src: "/oficina/v2-1-inicio-monitor.webp", focus: "50% 50%" }, // → alejándose a la vista general
  { src: "/oficina/v2-2-quien-soy-general.webp", focus: "58% 82%" }, // → la agenda del escritorio
  { src: "/oficina/v2-3-companias-agenda.webp", focus: "78% 84%" }, // → el mouse
  { src: "/oficina/v2-4-ramas-mouse.webp", focus: "55% 78%" }, // → el escritorio desde arriba
  { src: "/oficina/v2-5-como-trabajo-arriba.webp", focus: "18% 40%" }, // → el costado de los monitores
  { src: "/oficina/v2-6-equipo-gatito.webp", focus: "50% 3%" }, // → el estante de arriba
  { src: "/oficina/v2-7-contacto-estante.webp", focus: "50% 50%" },
];

const ZOOM_OUT = 2.4; // cuánto se acerca la escena que se va
const ZOOM_IN = 1.3; // de qué tamaño arranca la escena que llega

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const easeInOut = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);

export default function OfficeJourney() {
  const layers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let mx = 0;
    let my = 0;
    // Entrada inicial al cargar la página (el hero ya está en pantalla, así
    // que su texto también aparece animado aunque no se haya scrolleado)
    const start = performance.now();
    const INTRO_MS = 1400;

    // Elementos animados de cada sección (dentro de [data-panel]):
    // - títulos con <Lines>: cada línea sube desde atrás de una ranura
    // - párrafos con <Words>: se pintan palabra por palabra
    // - tarjetas ([data-fx]): se deslizan de costado, una atrás de otra
    // - botones: entran enteros, subiendo
    // - resto (textos, ítems de lista): suben / se deslizan desenfocados
    // Si uno está dentro de otro (un link dentro de un párrafo) se anima el de afuera.
    type Kind = "line" | "words" | "text" | "button" | "list" | "card";
    type Item = { el: HTMLElement; kind: Kind; words?: HTMLElement[] };
    const SEL = "h1, h2, h3, p, li, a, button, [data-fx]";
    const kindOf = (el: HTMLElement): Kind => {
      if (el.hasAttribute("data-fx")) return "card";
      if (el.hasAttribute("data-fx-words")) return "words";
      const tag = el.tagName;
      if (tag === "A" || tag === "BUTTON") return "button";
      if (tag === "LI") return "list";
      return "text";
    };
    const itemsOf = (section: HTMLElement): Item[] =>
      Array.from(section.querySelectorAll<HTMLElement>("[data-panel]")).flatMap((panel) =>
        Array.from(panel.querySelectorAll<HTMLElement>(SEL))
          .filter((el) => {
            const outer = el.parentElement?.closest(SEL);
            return !outer || !panel.contains(outer);
          })
          .flatMap((el): Item[] => {
            const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-fx-line]"));
            if (lines.length) return lines.map((l) => ({ el: l, kind: "line" }));
            const kind = kindOf(el);
            if (kind === "words") {
              return [{ el, kind, words: Array.from(el.querySelectorAll<HTMLElement>("[data-fx-word]")) }];
            }
            return [{ el, kind }];
          }),
      );
    let sectionItems: Item[][] = [];

    const render = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      if (!sections.length) return;
      if (sectionItems.length !== sections.length) sectionItems = sections.map(itemsOf);
      const intro = clamp((performance.now() - start) / INTRO_MS);

      // Escena actual (i) y avance hacia la siguiente (t): la transición
      // ocurre mientras la sección siguiente entra desde abajo de la pantalla.
      let i = 0;
      let t = 0;
      for (let k = 0; k < sections.length - 1; k++) {
        const nextTop = sections[k + 1].getBoundingClientRect().top;
        if (nextTop > vh) {
          i = k;
          t = 0;
          break;
        }
        if (nextTop > 0) {
          i = k;
          t = 1 - nextTop / vh;
          break;
        }
        i = k + 1;
        t = 0;
      }
      i = Math.min(i, SCENES.length - 1);

      const e = easeInOut(t);
      const fade = smooth(0.3, 0.8, t);
      const blur = reduced ? 0 : Math.sin(Math.PI * t) * 5;

      layers.current.forEach((el, j) => {
        if (!el) return;
        let opacity = 0;
        let scale = 1;
        if (j === i) {
          opacity = i + 1 < SCENES.length ? 1 - fade : 1;
          scale = reduced ? 1 : 1 + (ZOOM_OUT - 1) * e;
          el.style.transformOrigin = SCENES[j].focus;
        } else if (j === i + 1) {
          opacity = fade;
          scale = reduced ? 1 : ZOOM_IN - (ZOOM_IN - 1) * e;
          el.style.transformOrigin = "50% 50%";
        }
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0 ? "visible" : "hidden";
        el.style.zIndex = j === i + 1 ? "2" : "1";
        // Pequeño paralaje con el mouse para dar sensación de profundidad
        const px = reduced ? 0 : mx * 14;
        const py = reduced ? 0 : my * 10;
        el.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${scale * 1.04})`;
        el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none";
      });

      // Texto: entra mientras la sección sube a su lugar y sale al irse
      sections.forEach((sec, k) => {
        const r = sec.getBoundingClientRect();
        const enter = clamp((vh - r.top) / (vh * 0.75));
        const leave = clamp(r.bottom / (vh * 0.6));
        const items = sectionItems[k];
        let cardN = 0;
        items.forEach((item, n) => {
          const { el, kind } = item;
          // Escalonado: cada elemento arranca un poco después que el anterior;
          // las tarjetas tienen su propio escalonado para deslizarse en fila.
          const delay = kind === "card" ? Math.min(0.15 + cardN++ * 0.14, 0.8) : Math.min(n * 0.07, 0.75);
          let a = clamp(enter * (1 + delay) - delay);
          if (k === 0) a = Math.min(a, clamp(intro * (1 + delay) - delay));
          const b = leave;
          const v = Math.min(a, b);
          const entering = a < b; // entra desde abajo; al irse sale hacia arriba
          const dir = entering ? 1 : -0.7;

          if (kind === "words" && item.words) {
            // El párrafo aparece y se va "pintando" a medida que sube por la pantalla
            const r = el.getBoundingClientRect();
            const fill = clamp((vh * 0.9 - r.top) / (vh * 0.55));
            const total = item.words.length;
            item.words.forEach((w, wi) => {
              const on = clamp(fill * total - wi);
              w.style.opacity = String(0.18 + 0.82 * on);
            });
            el.style.opacity = String(smooth(0, 1, Math.min(1, b * 1.2)));
            return;
          }
          if (reduced) {
            el.style.opacity = String(v);
            return;
          }
          // Cerca del final se deja el elemento limpio (sin recorte ni desplazamiento
          // residual), así los botones quedan exactamente con su forma.
          if (v >= 0.985) {
            el.style.opacity = "";
            el.style.transform = "";
            el.style.filter = "";
            el.style.clipPath = "";
            return;
          }
          const w = 1 - v;
          switch (kind) {
            case "line": // sube desde atrás de la ranura, con un leve giro
              el.style.transform = `translate3d(0, ${(w * 110 * dir).toFixed(1)}%, 0) rotate(${(w * 4 * dir).toFixed(2)}deg)`;
              el.style.transformOrigin = "0% 100%";
              el.style.opacity = entering ? "1" : String(smooth(0, 1, v));
              return;
            case "button": // entra entero: sube y se agranda apenas, sin recortes
              el.style.clipPath = "";
              el.style.transform = `translate3d(0, ${(w * 30 * dir).toFixed(1)}px, 0) scale(${(1 - w * 0.12).toFixed(3)})`;
              el.style.opacity = String(smooth(0, 1, v));
              el.style.filter = "";
              return;
            case "card": // se desliza desde la derecha, en fila
              el.style.transform = `perspective(1000px) translate3d(${(w * 180 * (entering ? 1 : -0.6)).toFixed(1)}px, ${(w * 20).toFixed(1)}px, 0) rotateY(${(-w * 14).toFixed(1)}deg)`;
              el.style.opacity = String(smooth(0, 1, v));
              el.style.filter = `blur(${(w * 6).toFixed(1)}px)`;
              return;
            case "list": // se desliza desde la izquierda
              el.style.transform = `translate3d(${(-w * 60).toFixed(1)}px, ${(w * 10 * dir).toFixed(1)}px, 0)`;
              break;
            default:
              el.style.transform = `translate3d(0, ${(w * 44 * dir).toFixed(1)}px, 0)`;
          }
          el.style.opacity = String(smooth(0, 1, v));
          el.style.filter = `blur(${(w * 10).toFixed(1)}px)`;
        });

        // Números que cuentan (data-count="20+") a medida que entra la sección
        sec.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          const m = (el.dataset.count ?? "").match(/^(\d+)(.*)$/);
          if (!m) return;
          const p = k === 0 ? Math.min(enter, intro) : enter;
          el.textContent = `${Math.round(Number(m[1]) * easeInOut(clamp(p * 1.3 - 0.2)))}${m[2]}`;
        });
      });

      if (intro < 1) request();
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onMouse = (ev: MouseEvent) => {
      mx = ev.clientX / window.innerWidth - 0.5;
      my = ev.clientY / window.innerHeight - 0.5;
      request();
    };

    render();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-navy-950">
      {SCENES.map((s, j) => (
        <div
          key={s.src}
          ref={(el) => {
            layers.current[j] = el;
          }}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${s.src})`, opacity: j === 0 ? 1 : 0, visibility: j === 0 ? "visible" : "hidden" }}
        />
      ))}
      {/* Velo navy (sin desenfoque) para que el texto se lea sobre las fotos
          claras sin dejar de reconocer la oficina */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(7,26,54,0.74)_0%,rgba(7,26,54,0.6)_45%,rgba(7,26,54,0.78)_100%)]" />
    </div>
  );
}
