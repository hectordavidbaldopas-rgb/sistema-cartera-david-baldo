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

    // Posición de cada sección: se mide al cargar y cuando cambia el tamaño de
    // la página, no en cada cuadro. Leer el layout en medio de la animación
    // (getBoundingClientRect mientras se escriben estilos) obliga al navegador a
    // recalcular toda la página y era lo que trababa el scroll en el celular.
    let sections: HTMLElement[] = [];
    let tops: number[] = [];
    let heights: number[] = [];
    let counters: HTMLElement[][] = [];
    let stops: number[] = [];
    // Alto visible de la pantalla (clientHeight: no varía con la barra del
    // navegador del celular, que aparece y desaparece al scrollear)
    let vh = document.documentElement.clientHeight;
    let vw = window.innerWidth;
    const measure = () => {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      document.documentElement.style.setProperty("--header-h", `${header?.offsetHeight ?? 0}px`);
      sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      if (sectionItems.length !== sections.length) sectionItems = sections.map(itemsOf);
      counters = sections.map((sec) => Array.from(sec.querySelectorAll<HTMLElement>("[data-count]")));
      const y = window.scrollY;
      tops = sections.map((sec) => sec.getBoundingClientRect().top + y);
      heights = sections.map((sec) => sec.offsetHeight);

      // Paradas del paso de página: el comienzo de cada sección (justo debajo
      // del encabezado) y, si la sección no entra en la pantalla, pasos
      // intermedios hasta su final para no saltearse nada.
      const headerH = header?.offsetHeight ?? 0;
      const visible = vh - headerH;
      const maxY = document.documentElement.scrollHeight - vh;
      const all: number[] = [];
      sections.forEach((_, k) => {
        const start = tops[k] - headerH;
        all.push(start);
        const extra = heights[k] - visible;
        if (extra > 40) {
          const n = Math.ceil(extra / (visible * 0.8));
          for (let m = 1; m <= n; m++) all.push(start + (extra * m) / n);
        }
      });
      stops = all
        .map((v) => Math.round(Math.min(maxY, Math.max(0, v))))
        .sort((a, b) => a - b)
        .filter((v, n, arr) => n === 0 || v - arr[n - 1] > 4);
    };

    const layerState: string[] = [];
    const sectionActive: boolean[] = [];
    const render = () => {
      raf = 0;
      if (!sections.length) return;
      const y = window.scrollY;
      const intro = clamp((performance.now() - start) / INTRO_MS);

      // Escena actual (i) y avance hacia la siguiente (t): la transición
      // ocurre mientras la sección siguiente sube desde abajo de la pantalla
      // hasta un 30% de la altura (así termina antes y se siente más ágil).
      let i = 0;
      let t = 0;
      for (let k = 0; k < sections.length - 1; k++) {
        const nextTop = tops[k + 1] - y;
        if (nextTop > vh) {
          i = k;
          t = 0;
          break;
        }
        if (nextTop > vh * 0.3) {
          i = k;
          t = (vh - nextTop) / (vh * 0.7);
          break;
        }
        i = k + 1;
        t = 0;
      }
      i = Math.min(i, SCENES.length - 1);

      const e = easeInOut(t);
      const fade = smooth(0.25, 0.75, t);

      layers.current.forEach((el, j) => {
        if (!el) return;
        let opacity = 0;
        let scale = 1;
        let origin = "50% 50%";
        if (j === i) {
          opacity = i + 1 < SCENES.length ? 1 - fade : 1;
          scale = reduced ? 1 : 1 + (ZOOM_OUT - 1) * e;
          origin = SCENES[j].focus;
        } else if (j === i + 1) {
          opacity = fade;
          scale = reduced ? 1 : ZOOM_IN + (1 - ZOOM_IN) * e;
        }
        // Pequeño paralaje con el mouse para dar sensación de profundidad
        const px = reduced ? 0 : mx * 14;
        const py = reduced ? 0 : my * 10;
        const transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${(scale * OVERSCALE).toFixed(4)})`;
        const state = opacity === 0 ? "hidden" : `${opacity.toFixed(3)}|${j === i + 1 ? 2 : 1}|${origin}|${transform}`;
        if (layerState[j] === state) return; // nada cambió: no tocar el DOM
        layerState[j] = state;
        if (opacity === 0) {
          el.style.visibility = "hidden";
          el.style.opacity = "0";
          return;
        }
        el.style.visibility = "visible";
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = j === i + 1 ? "2" : "1";
        el.style.transformOrigin = origin;
        el.style.transform = transform;
      });

      // Texto: entra mientras la sección sube a su lugar y sale al irse
      sections.forEach((_, k) => {
        const top = tops[k] - y;
        const bottom = top + heights[k];
        const enter = clamp((vh - top) / (vh * 0.65));
        const leave = clamp(bottom / (vh * 0.55));
        const items = sectionItems[k];

        // Los elementos de las secciones en pantalla van en su propia capa
        // (se mueven sin repintar); las demás la liberan.
        const active = top < vh * 1.1 && bottom > -vh * 0.1;
        if (sectionActive[k] !== active) {
          sectionActive[k] = active;
          items.forEach(({ el, kind }) => {
            if (kind !== "logo") el.style.willChange = active && !reduced ? "transform, opacity" : "";
          });
        }

        let cardN = 0;
        items.forEach((item, n) => {
          const { el, kind } = item;
          if (kind === "logo") {
            // Entra con su propia animación (logo-fx--intro); acá solo la salida
            const p = clamp(-top / (heights[k] * 0.75));
            const key = p.toFixed(3);
            if (item.last === key) return;
            item.last = key;
            el.style.opacity = String(1 - smooth(0.1, 0.9, p));
            el.style.pointerEvents = p > 0.5 ? "none" : "";
            el.style.willChange = p > 0 && p < 1 ? "transform, opacity" : "";
            if (reduced) return;
            el.style.transform = p > 0 ? `translate3d(0, ${(-top).toFixed(1)}px, 0) scale(${(1 + p * p * 2.2).toFixed(3)})` : "";
            return;
          }
          // Escalonado: cada elemento arranca un poco después que el anterior;
          // las tarjetas tienen su propio escalonado para deslizarse en fila.
          const delay =
            kind === "card" || kind === "zoom" || kind === "fade" ? Math.min(0.12 + cardN++ * 0.1, 0.6) : Math.min(n * 0.05, 0.55);
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
          // Cerca del final se deja el elemento limpio (sin desplazamiento
          // residual), así los botones quedan exactamente con su forma.
          if (v >= 0.985) {
            el.style.opacity = "";
            el.style.transform = "";
            el.style.filter = "";
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
              el.style.transform = `translate3d(0, ${(w * 30 * dir).toFixed(1)}px, 0) scale(${(1 - w * 0.12).toFixed(3)})`;
              break;
            case "card": // se desliza desde la derecha, en fila
              el.style.transform = `perspective(1000px) translate3d(${(w * 180 * (entering ? 1 : -0.6)).toFixed(1)}px, ${(w * 20).toFixed(1)}px, 0) rotateY(${(-w * 14).toFixed(1)}deg)`;
              break;
            case "zoom": // crece desde su centro, desde cero (logos de compañías)
              el.style.transform = `scale(${v.toFixed(3)})`;
              el.style.opacity = String(smooth(0, 0.5, v));
              return;
            case "fade": // queda fija en su lugar y aparece de difuminada a nítida
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
        counters[k].forEach((el) => {
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

    // Paso de página: cada barrida con el dedo (o ruedita / flechas) lleva a
    // la parada siguiente o anterior con una transición corta y frena justo
    // ahí, nunca a mitad de camino. Las paradas son el comienzo de cada sección
    // y, en las que no entran en la pantalla, pasos intermedios hasta su final.
    // Los links internos (#seccion) también bajan así, en un solo recorrido.
    const root = document.documentElement;
    const PAGE_MS = 650;
    const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
    let glide = 0;
    let goal = -1; // parada hacia la que va la página (-1: quieta)
    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
      goal = -1;
    };
    const glideTo = (to: number, ms: number) => {
      stopGlide();
      const from = window.scrollY;
      if (Math.abs(to - from) < 1) return;
      goal = to;
      const t0 = performance.now();
      const step = (now: number) => {
        const v = clamp((now - t0) / ms);
        window.scrollTo({ top: from + (to - from) * ease(v), behavior: "instant" });
        if (v < 1) glide = requestAnimationFrame(step);
        else stopGlide();
      };
      glide = requestAnimationFrame(step);
    };
    const nearest = (y: number) => stops.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a), 0);
    const next = (y: number, dir: number) =>
      dir > 0 ? stops.find((s) => s > y + 2) : [...stops].reverse().find((s) => s < y - 2);
    const page = (dir: number) => {
      const to = next(goal >= 0 ? goal : window.scrollY, dir);
      if (to !== undefined) glideTo(to, PAGE_MS);
    };
    // Gestos que no son para pasar de página: varios dedos, campos de texto,
    // ventanas emergentes (las fichas de ramas) y el botón flotante.
    const ignored = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest("input, textarea, select, .fixed");

    let touchY0 = 0;
    let touchY = 0;
    let touchScroll = 0;
    let touchT0 = 0;
    let dragging = false;
    const onTouchStart = (ev: TouchEvent) => {
      dragging = ev.touches.length === 1 && !ignored(ev.target);
      if (!dragging) return;
      stopGlide();
      touchY0 = touchY = ev.touches[0].clientY;
      touchScroll = window.scrollY;
      touchT0 = performance.now();
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (!dragging) return;
      if (ev.touches.length !== 1) {
        dragging = false;
        return;
      }
      ev.preventDefault(); // la página sigue al dedo, sin el scroll libre del navegador
      touchY = ev.touches[0].clientY;
      window.scrollTo({ top: touchScroll + (touchY0 - touchY), behavior: "instant" });
    };
    const onTouchEnd = () => {
      if (!dragging) return;
      dragging = false;
      const d = touchY0 - touchY;
      const speed = Math.abs(d) / Math.max(1, performance.now() - touchT0);
      const to = Math.abs(d) > 30 || speed > 0.3 ? (next(touchScroll, d) ?? nearest(touchScroll)) : nearest(touchScroll);
      glideTo(to, Math.min(PAGE_MS, Math.max(300, 250 + Math.abs(to - window.scrollY) * 0.6)));
    };

    // Ruedita / trackpad: un paso por gesto. El trackpad sigue mandando
    // eventos por inercia un rato; solo cuenta como gesto nuevo si hubo una
    // pausa o si ya pasó bastante desde el último paso.
    let lastWheel = 0;
    let lastStep = 0;
    const onWheel = (ev: WheelEvent) => {
      if (ev.ctrlKey || ignored(ev.target)) return; // ctrl + ruedita = zoom
      ev.preventDefault();
      const now = performance.now();
      const fresh = now - lastWheel > 220;
      lastWheel = now;
      if (Math.abs(ev.deltaY) < 4 || (!fresh && now - lastStep < 1100)) return;
      lastStep = now;
      page(Math.sign(ev.deltaY));
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ignored(ev.target) || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      const dir = { ArrowDown: 1, PageDown: 1, " ": ev.shiftKey ? -1 : 1, ArrowUp: -1, PageUp: -1 }[ev.key];
      if (!dir) return;
      ev.preventDefault();
      page(dir);
    };

    const onClick = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      const link = (ev.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!link || !target) return;
      ev.preventDefault();
      // Desde la portada, el logo da su giro con brillo mientras nos alejamos
      link.closest("[data-scene]")?.querySelector(".logo-fx")?.classList.add("is-playing");
      const headerH = parseFloat(root.style.getPropertyValue("--header-h")) || 0;
      const to = nearest(target.getBoundingClientRect().top + window.scrollY - headerH);
      glideTo(to, Math.min(1300, Math.max(800, 550 + Math.abs(to - window.scrollY) * 0.25)));
      history.pushState(null, "", `#${id}`);
    };

    // Medidas: al cargar, si cambia el ancho (no la barra del navegador del
    // celular, que cambia el alto al scrollear) y si cambia el tamaño de alguna
    // sección (imágenes o fuentes que terminan de cargar).
    const remeasure = () => {
      measure();
      request();
    };
    const onResize = () => {
      if (window.innerWidth !== vw || Math.abs(document.documentElement.clientHeight - vh) > 160) {
        vw = window.innerWidth;
        vh = document.documentElement.clientHeight;
        remeasure();
      }
    };
    measure();
    const ro = new ResizeObserver(remeasure);
    sections.forEach((sec) => ro.observe(sec));

    // Las fotos se decodifican de antemano para que no haya un tirón la
    // primera vez que aparece cada una.
    SCENES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
    });

    render();
    document.addEventListener("click", onClick);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      stopGlide();
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", onResize);
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
