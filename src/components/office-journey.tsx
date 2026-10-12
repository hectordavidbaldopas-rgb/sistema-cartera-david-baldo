"use client";

import { useEffect, useRef } from "react";

// Fondo "viaje por la oficina": el visitante es una miniatura que recorre un
// escritorio gigante. Cada sección de la landing (marcada con data-scene) tiene
// su foto de la misma oficina desde otro ángulo; al scrollear hacia la sección
// siguiente la cámara se acerca al objeto donde está la próxima parada y se
// funde con la foto de ese ángulo. El contenido de cada sección ([data-panel])
// entra desde abajo, escalonado, a medida que la cámara llega, y sale hacia
// arriba cuando se va. Fotos en public/oficina: versiones con la marca BALDO
// editadas por el cliente, con un desenfoque leve ya aplicado (v3-*), a partir
// de la sesión de Tran Mau Tri Tam en Pexels (uso libre).
const SCENES = [
  // focus = hacia dónde se acerca la cámara al salir de esta escena (% de la foto)
  { src: "/oficina/v3-3-companias-agenda.webp", focus: "50% 50%" }, // portada del logo → el monitor
  // inicio: repite la del gatito (parecida a la general, se vuelve a ver recién en Equipo)
  { src: "/oficina/v3-6-equipo-gatito.webp", focus: "50% 85%", key: "inicio" }, // → bajando al escritorio
  { src: "/oficina/v3-2-quien-soy-general.webp", focus: "58% 82%" }, // → la agenda del escritorio
  { src: "/oficina/v3-1-inicio-monitor.webp", focus: "60% 80%" }, // → bajando hacia el escritorio
  { src: "/oficina/v3-4-ramas-mouse.webp", focus: "55% 78%" }, // → el escritorio desde arriba
  { src: "/oficina/v3-5-como-trabajo-arriba.webp", focus: "18% 40%" }, // → el costado de los monitores
  { src: "/oficina/v3-6-equipo-gatito.webp", focus: "50% 3%" }, // → el estante de arriba
  { src: "/oficina/v3-7-contacto-estante.webp", focus: "50% 50%" },
];

// La cámara siempre avanza: la escena que se va se acerca (ZOOM_OUT) y la que
// llega también viene creciendo un poco (de ZOOM_IN a 1), sin el efecto de
// "acercar y después alejar" que se veía como un movimiento doble.
const ZOOM_OUT = 2.4; // cuánto se acerca la escena que se va
const ZOOM_IN = 0.92; // de qué tamaño arranca la escena que llega
const OVERSCALE = 1.1; // margen para el paralaje y para que ZOOM_IN no deje bordes
// Las fotos ya vienen levemente desenfocadas (las pantallas de los monitores
// tienen texto que no tiene que competir con la página); se hornea en el
// archivo en vez de usar filter: blur, que en el celular trababa el scroll.

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
    // - tarjetas ([data-fx]): se deslizan de costado, una atrás de otra;
    //   con data-fx="zoom" crecen desde su centro (logos de compañías) y con
    //   data-fx="fade" aparecen en su lugar, de desenfocado a nítido (foto de Quién soy)
    // - logo de la portada (data-fx="logo"): al bajar queda fijo en el centro y
    //   se acerca a la cámara desvaneciéndose, como si la atravesáramos
    // - botones: entran enteros, subiendo
    // - resto (textos, ítems de lista): suben / se deslizan (sin desenfoque: trababa el celular)
    // Si uno está dentro de otro (un link dentro de un párrafo) se anima el de afuera.
    type Kind = "line" | "text" | "button" | "list" | "card" | "zoom" | "fade" | "logo";
    // last: último avance dibujado, para no reescribir estilos que no cambiaron
    type Item = { el: HTMLElement; kind: Kind; last?: string };
    const SEL = "h1, h2, h3, p, li, a, button, [data-fx]";
    const kindOf = (el: HTMLElement): Kind => {
      if (el.getAttribute("data-fx") === "zoom") return "zoom";
      if (el.getAttribute("data-fx") === "fade") return "fade";
      if (el.getAttribute("data-fx") === "logo") return "logo";
      if (el.hasAttribute("data-fx")) return "card";
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
            return [{ el, kind: kindOf(el) }];
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
          scale = reduced ? 1 : ZOOM_IN + (1 - ZOOM_IN) * e;
          el.style.transformOrigin = "50% 50%";
        }
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0 ? "visible" : "hidden";
        el.style.zIndex = j === i + 1 ? "2" : "1";
        if (opacity === 0) return; // las capas ocultas no se mueven
        // Pequeño paralaje con el mouse para dar sensación de profundidad
        const px = reduced ? 0 : mx * 14;
        const py = reduced ? 0 : my * 10;
        el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${(scale * OVERSCALE).toFixed(4)})`;
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
          if (kind === "logo") {
            // Entra con su propia animación (logo-fx--intro); acá solo la salida
            const p = clamp(-r.top / (r.height * 0.75));
            el.style.opacity = String(1 - smooth(0.15, 1, p));
            el.style.pointerEvents = p > 0.5 ? "none" : "";
            if (reduced) return;
            el.style.transform = p > 0 ? `translate3d(0, ${(-r.top).toFixed(1)}px, 0) scale(${(1 + p * p * 2.2).toFixed(3)})` : "";
            el.style.filter = p > 0 ? `blur(${(p * 10).toFixed(1)}px)` : "";
            return;
          }
          // Escalonado: cada elemento arranca un poco después que el anterior;
          // las tarjetas tienen su propio escalonado para deslizarse en fila.
          const delay =
            kind === "card" || kind === "zoom" || kind === "fade" ? Math.min(0.15 + cardN++ * 0.14, 0.8) : Math.min(n * 0.07, 0.75);
          let a = clamp(enter * (1 + delay) - delay);
          if (k === 0) a = Math.min(a, clamp(intro * (1 + delay) - delay));
          const b = leave;
          const v = Math.min(a, b);
          const entering = a < b; // entra desde abajo; al irse sale hacia arriba
          const dir = entering ? 1 : -0.7;
          // Sin cambios desde el último cuadro (secciones fuera de pantalla): no tocar
          const key = `${v.toFixed(3)}${entering ? "+" : "-"}`;
          if (item.last === key) return;
          item.last = key;

          if (reduced) {
            el.style.opacity = String(v);
            return;
          }
          // Cerca del final se deja el elemento limpio (sin recorte ni desplazamiento
          // residual), así los botones quedan exactamente con su forma.
          if (v >= 0.985 || v <= 0) {
            el.style.willChange = "";
          } else {
            el.style.willChange = "transform, opacity"; // en su propia capa mientras se mueve
          }
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
              return;
            case "zoom": // crece desde su centro, desde cero (logos de compañías)
              el.style.transform = `scale(${v.toFixed(3)})`;
              el.style.opacity = String(smooth(0, 0.5, v));
              el.style.filter = "";
              return;
            case "fade": // queda fija en su lugar y aparece de difuminada a nítida
              el.style.transform = "";
              el.style.opacity = String(smooth(0, 1, v));
              el.style.filter = `blur(${(w * 14).toFixed(1)}px)`;
              return;
            case "list": // se desliza desde la izquierda
              el.style.transform = `translate3d(${(-w * 60).toFixed(1)}px, ${(w * 10 * dir).toFixed(1)}px, 0)`;
              break;
            default:
              el.style.transform = `translate3d(0, ${(w * 44 * dir).toFixed(1)}px, 0)`;
          }
          el.style.opacity = String(smooth(0, 1, v));
        });

        // Números que cuentan (data-count="+20") a medida que entra la sección
        sec.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          const m = (el.dataset.count ?? "").match(/^(\D*)(\d+)(.*)$/); // "+20" → "+", 20, ""
          if (!m) return;
          const p = k === 0 ? Math.min(enter, intro) : enter;
          const text = `${m[1]}${Math.round(Number(m[2]) * easeInOut(clamp(p * 1.3 - 0.2)))}${m[3]}`;
          if (el.textContent !== text) el.textContent = text;
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

    // Links internos (#seccion): en vez del salto rápido del navegador, la
    // página baja despacio y con aceleración suave, así la cámara recorre la
    // oficina y el contenido entra de a poco. Se corta si el usuario scrollea.
    let glide = 0;
    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
    };
    const onClick = (ev: MouseEvent) => {
      if (reduced || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      const link = (ev.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!link || !target) return;
      ev.preventDefault();
      stopGlide();
      // Desde la portada, el logo da su giro con brillo mientras nos alejamos
      link.closest("[data-scene]")?.querySelector(".logo-fx")?.classList.add("is-playing");
      const from = window.scrollY;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const to = Math.min(
        target.getBoundingClientRect().top + from - margin,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const dist = Math.abs(to - from);
      const ms = Math.min(3200, Math.max(2000, 1400 + dist * 0.5));
      const t0 = performance.now();
      const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
      const step = (now: number) => {
        const v = clamp((now - t0) / ms);
        window.scrollTo({ top: from + (to - from) * ease(v), behavior: "instant" });
        glide = v < 1 ? requestAnimationFrame(step) : 0;
      };
      glide = requestAnimationFrame(step);
      history.pushState(null, "", `#${id}`);
    };

    render();
    document.addEventListener("click", onClick);
    window.addEventListener("wheel", stopGlide, { passive: true });
    window.addEventListener("touchstart", stopGlide, { passive: true });
    window.addEventListener("keydown", stopGlide);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      stopGlide();
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", stopGlide);
      window.removeEventListener("touchstart", stopGlide);
      window.removeEventListener("keydown", stopGlide);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-navy-950">
      {SCENES.map((s, j) => (
        <div
          key={s.key ?? s.src}
          ref={(el) => {
            layers.current[j] = el;
          }}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${s.src})`,
            opacity: j === 0 ? 1 : 0,
            visibility: j === 0 ? "visible" : "hidden",
            transform: `scale(${OVERSCALE})`,
          }}
        />
      ))}
      {/* Velo navy (sin desenfoque) para que el texto se lea sobre las fotos
          claras sin dejar de reconocer la oficina */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(7,26,54,0.74)_0%,rgba(7,26,54,0.6)_45%,rgba(7,26,54,0.78)_100%)]" />
    </div>
  );
}
