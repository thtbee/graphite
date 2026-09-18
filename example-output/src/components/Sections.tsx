import { useEffect, useRef, useState } from "react";
import { SquiggleArrow, StarDoodle, CircleScribble, UnderlineScribble } from "./Overlays";
import { graphiteAudio } from "../lib/audio";

/* ---------- helpers ---------- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add("is-visible")),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const done = Math.min(Math.max(-r.top / (total || 1), 0), 1);
      setP(done);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { ref, p };
}

/* ================= HERO ================= */
export function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="paper-surface paper-fibers relative overflow-hidden pt-24 md:pt-28">
      <div className="draft-grid-fine pointer-events-none absolute inset-0 opacity-60" />
      {/* deckled side shadows */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#d8d2c2]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#d8d2c2]/60 to-transparent" />

      {/* floating smudge bands */}
      <div className="smudge-band pointer-events-none absolute left-[-8%] top-[16%] h-24 w-[116%] -rotate-2 opacity-30" style={{ transform: `translateY(${y * 0.08}px) rotate(-2deg)` }} />
      <div className="smudge-band pointer-events-none absolute bottom-[26%] left-[-8%] h-14 w-[116%] rotate-1 opacity-20" style={{ transform: `translateY(${y * -0.05}px) rotate(1deg)` }} />

      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#4A4743]">
          <span className="border border-[#1A1918]/25 px-3 py-1.5">Monograph Nº 06 — tactile edition</span>
          <span className="hidden md:block">soft lead · broad side · cold-press cotton</span>
          <span className="border border-[#1A1918]/25 px-3 py-1.5">MMXXVI · 640gsm</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-4">
          {/* TITLE */}
          <div className="relative">
            <p className="font-hand text-2xl text-[#4A4743] md:text-3xl">
              <span className="inline-block -rotate-2">psst — tilt your pencil flat</span>
              <SquiggleArrow className="ml-2 inline-block h-8 w-20 -scale-x-100 text-[#1A1918]" />
            </p>
            <h1 className="roughen mt-2 font-display uppercase leading-[0.82] tracking-tight">
              <span className="graphite-rub block text-[19vw] md:text-[11.5vw] lg:text-[9.2vw]">Anatomy</span>
              <span className="flex items-center gap-4 text-[8vw] md:text-[4.5vw] lg:text-[3.6vw]">
                <span className="font-serif2 font-normal normal-case italic text-[#4A4743]">of&nbsp;a</span>
                <span className="h-[0.09em] min-h-[3px] flex-1 bg-[#1A1918]/80" style={{ transform: "rotate(-0.6deg)" }} />
                <span className="font-mono2 text-[10px] tracking-[0.35em] text-[#4A4743] md:text-xs">FIG.A — FRICTION STUDY</span>
              </span>
              <span className="graphite-rub block text-[19vw] md:text-[11.5vw] lg:text-[9.2vw]">Stroke<span className="text-[#1A1918]">.</span></span>
            </h1>

            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[440px] font-hand text-[22px] leading-[1.25] text-[#2C2A29] md:text-2xl">
                Every monument was once a spasm of lead. We lay the graphite on its side and{" "}
                <span className="hand-circle font-bold">drag<CircleScribble className="text-[#1A1918]" /></span>{" "}
                mass out of the{" "}
                <span className="hand-underline font-bold">white silence<UnderlineScribble className="text-[#1A1918]/70" /></span>
                {" "}— one smudgy breath at a time.
              </p>
              <div className="flex items-center gap-4">
                <a href="#gesture" data-cursor="drag" onClick={() => graphiteAudio.tap("pencil")} className="group relative inline-flex items-center gap-3 bg-[#1A1918] px-7 py-4 font-mono2 text-[11px] uppercase tracking-[0.25em] text-[#F5F2EB]">
                  <span>Begin the rub</span>
                  <span className="transition-transform group-hover:translate-y-1">↓</span>
                  <span className="absolute -right-2 -top-2 h-4 w-4 rotate-12 bg-[#E8E3D7] shadow" />
                </a>
                <StarDoodle className="h-10 w-10 animate-wobble text-[#1A1918]" />
              </div>
            </div>

            {/* telemetry strip */}
            <div className="mt-8 grid grid-cols-3 divide-x divide-[#1A1918]/15 border-y border-[#1A1918]/20 font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#4A4743]">
              {[
                ["Lead", "6B — 9B carpenter"],
                ["Tooth", "cold-press · deep"],
                ["Gesture", "broad-side drag"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 px-4 py-3">
                  <span className="opacity-60">{k}</span>
                  <span className="text-[#1A1918]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FIGURE */}
          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none" style={{ transform: `translateY(${y * -0.04}px)` }}>
            <div className="relative border border-[#1A1918]/25 bg-white/40 p-3 shadow-[8px_10px_0_rgba(26,25,24,0.12)]">
              <div className="tape absolute -top-3 left-8 h-6 w-20 -rotate-6" />
              <div className="tape absolute -top-3 right-8 h-6 w-20 rotate-6" />
              <div className="relative overflow-hidden bg-[#FBFAF6]">
                <img src="/images/body-scribble.png" alt="Scribble figure reaching" className="h-[440px] w-full object-cover object-top md:h-[560px]" style={{ mixBlendMode: "multiply" }} />
                <div className="hatch-overlay pointer-events-none absolute inset-0 opacity-40" />
                {/* corner drafting marks */}
                <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-[#1A1918]/60" />
                <span className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-[#1A1918]/60" />
                <span className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-[#1A1918]/60" />
                <span className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-[#1A1918]/60" />
              </div>
              <div className="flex items-center justify-between px-1 pb-1 pt-3">
                <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#4A4743]">Fig. A — the spasm before form</p>
                <p className="font-hand text-lg leading-none text-[#1A1918]">nervous lines!</p>
              </div>
            </div>
            {/* marginalia */}
            <div className="absolute -left-10 top-16 hidden -rotate-12 md:block">
              <p className="font-scribble text-[11px] text-[#2C2A29]">don't press<br />too hard here</p>
              <SquiggleArrow className="mt-1 h-10 w-24 text-[#1A1918]" />
            </div>
            <div className="absolute -right-4 bottom-24 hidden rotate-6 md:block">
              <StarDoodle className="h-8 w-8 text-[#1A1918]" />
              <p className="mt-1 font-hand text-lg leading-tight">scroll = stroke ↓</p>
            </div>
            {/* pressure badge */}
            <div className="absolute -bottom-6 left-6 flex rotate-[-3deg] items-center gap-3 border border-[#1A1918] bg-[#F5F2EB] px-4 py-2 shadow-[4px_4px_0_#1A1918]">
              <span className="relative flex h-3 w-3"><span className="absolute h-full w-full animate-ping rounded-full bg-[#1A1918]/40" /><span className="h-3 w-3 rounded-full bg-[#1A1918]" /></span>
              <span className="font-mono2 text-[10px] uppercase tracking-[0.25em]">live graphite · 94% friction</span>
            </div>
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="relative mt-16 overflow-hidden border-y-2 border-[#1A1918] bg-[#1A1918] py-3 text-[#F5F2EB]">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap font-display text-xl uppercase tracking-wide md:text-2xl">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Flat lead", "Paper tooth", "Smudge", "Friction", "Powder", "Drag 42°", "6B Greasy mass", "Cotton rag"].map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-8">
                <span className={i % 2 ? "opacity-100" : "opacity-40"} style={i % 2 ? {} : { WebkitTextStroke: "1px #F5F2EB", color: "transparent" }}>{w}</span>
                <StarDoodle className="h-5 w-5 opacity-70" />
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= MANIFESTO ================= */
export function Manifesto() {
  const ref = useReveal();
  return (
    <section className="paper-surface relative px-5 py-20 md:px-10 md:py-28">
      <div ref={ref} className="reveal-mask mx-auto max-w-4xl text-center">
        <p className="font-mono2 text-[10px] uppercase tracking-[0.4em] text-[#4A4743]">— the thesis · read with dirty fingers —</p>
        <p className="mt-6 font-serif2 text-3xl leading-snug text-[#1A1918] md:text-5xl md:leading-tight">
          “Scrolling is not <em className="font-hand text-4xl md:text-6xl">scrolling</em> here. It is an invisible{" "}
          <span className="roughen-soft inline-block bg-[#1A1918] px-3 py-1 font-display uppercase not-italic text-[#F5F2EB]">broad stroke</span>{" "}
          — each pixel you drag lays tone, until wireframes grow{" "}
          <span className="hand-circle font-hand">fat with graphite<CircleScribble className="text-[#1A1918]" /></span>.”
        </p>
        <div className="mt-8 flex items-center justify-center gap-6 font-hand text-xl text-[#4A4743]">
          <span className="flex items-center gap-2"><StarDoodle className="h-5 w-5" /> fig. 002</span>
          <span className="h-px w-24 bg-[#1A1918]/30" />
          <span>signed, the smudge dept. ☺</span>
        </div>
      </div>
    </section>
  );
}

/* ================= CHAPTER 01 ================= */
export function Chapter01() {
  const { ref, p } = useSectionProgress<HTMLDivElement>();
  const stage = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
  const stageNames = ["i. nervous wireframe", "ii. midtone cross-hatch", "iii. greasy graphite mass"];

  return (
    <section id="gesture" className="paper-surface relative border-t-2 border-[#1A1918]">
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.4em] text-[#4A4743]">Chapter 01 — The initial friction</p>
            <h2 className="roughen mt-3 font-display uppercase leading-[0.85]">
              <span className="block text-[15vw] md:text-[8vw]"><span className="graphite-rub">01. The</span></span>
              <span className="block text-[15vw] md:text-[8vw]"><span className="graphite-rub">Gesture</span><span className="font-hand ml-4 align-middle text-[6vw] normal-case text-[#4A4743] md:text-[2.5vw]">(reach!)</span></span>
            </h2>
          </div>
          <div className="max-w-xs -rotate-2 border border-[#1A1918]/30 bg-white/50 p-4 shadow-[5px_5px_0_rgba(26,25,24,0.15)]">
            <p className="font-hand text-xl leading-tight text-[#2C2A29]">keep scrolling — watch the hand <b>get fat</b> with tone ↓</p>
          </div>
        </div>

        <div ref={ref} className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* STICKY VISUAL */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="relative border-2 border-[#1A1918] bg-[#FBFAF6] shadow-[10px_12px_0_rgba(26,25,24,0.9)]">
              <div className="flex items-center justify-between border-b-2 border-[#1A1918] px-4 py-2 font-mono2 text-[10px] uppercase tracking-[0.25em]">
                <span>Specimen H-01 · reaching hand</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 animate-blink-soft rounded-full bg-[#1A1918]" />{stageNames[stage]}</span>
              </div>
              <div className="relative overflow-hidden" data-cursor="smudge">
                <img
                  src="/images/hand-gesture.jpg"
                  alt="Reaching hand in graphite"
                  className="img-shade h-[420px] w-full object-cover md:h-[600px]"
                  style={{
                    filter: `grayscale(1) contrast(${1 + p * 0.55}) brightness(${1.06 - p * 0.22})`,
                    transform: `scale(${1 + p * 0.07})`,
                  }}
                />
                {/* progressive tone layers */}
                <div className="hatch-overlay-2 pointer-events-none absolute inset-0 transition-opacity duration-300" style={{ opacity: 0.25 + p * 0.75 }} />
                <div className="dither-dots pointer-events-none absolute inset-0 opacity-20" />
                {/* traveling broad strokes */}
                <div className="smudge-band pointer-events-none absolute left-[-20%] top-[18%] h-20 w-[140%] -rotate-3" style={{ transform: `translateX(${(p - 0.3) * 46}%) rotate(-3deg)`, opacity: 0.25 + p * 0.55 }} />
                <div className="smudge-band pointer-events-none absolute bottom-[24%] left-[-20%] h-28 w-[140%] rotate-2" style={{ transform: `translateX(${(0.7 - p) * 40}%) rotate(2deg)`, opacity: 0.2 + p * 0.5 }} />
                <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 90px rgba(26,25,24,0.35)" }} />
                {/* stage meter */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between font-mono2 text-[9px] uppercase tracking-[0.25em] text-[#F5F2EB] mix-blend-difference">
                    <span>wire</span><span>hatch</span><span>mass</span>
                  </div>
                  <div className="mt-1 h-[5px] bg-white/25"><div className="h-full bg-white" style={{ width: `${p * 100}%` }} /></div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-2 font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#4A4743]">
                <span>lead: flat 8B · tilt 42°</span>
                <span>tone: {Math.round(p * 100)}%</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 font-scribble text-[11px] text-[#2C2A29]">
              <SquiggleArrow flip className="h-8 w-20 -scale-y-100" />
              <span>too tight here — loosen the wrist, let it smear</span>
            </div>
          </div>

          {/* SCROLLING NARRATIVE */}
          <div className="flex flex-col gap-8 lg:pb-24">
            {[
              {
                n: "Stroke i",
                t: "The nervous wire",
                d: "We begin with panic — a thousand trembling contours searching for knuckles. The 2H barely kisses the peaks of the paper tooth. Nothing is decided; everything is possible.",
                note: "light! like petting a moth ☁",
              },
              {
                n: "Stroke ii",
                t: "The hatch takes root",
                d: "Now tilt flat and drag. Broad side-strokes wash over the scribble at 42°, cross-hatching at opposing angles. Valleys of the cotton fill with silver midtone. Fingers start to cast weight.",
                note: "hear that scrape? that's friction singing",
              },
              {
                n: "Stroke iii",
                t: "The greasy mass",
                d: "Finally the 8B surrenders fully — dense, oily graphite pools into shadow. The palm becomes sculpture. What was a spasm is now a monument you could bruise your knuckles on.",
                note: "smudge this part with your thumb →",
              },
            ].map((s, i) => (
              <article key={s.n} className={`relative border border-[#1A1918]/25 bg-white/45 p-6 transition-all duration-500 md:p-8 ${stage === i ? "shadow-[8px_8px_0_#1A1918] -rotate-1" : "opacity-70"}`}>
                <div className="flex items-center justify-between">
                  <span className="bg-[#1A1918] px-3 py-1 font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#F5F2EB]">{s.n}</span>
                  <span className={`font-mono2 text-[10px] uppercase tracking-[0.25em] ${stage === i ? "text-[#1A1918]" : "text-[#4A4743]/50"}`}>{stage === i ? "● laying tone" : "○ waiting"}</span>
                </div>
                <h3 className="mt-4 font-display text-3xl uppercase md:text-4xl">{s.t}</h3>
                <p className="mt-3 font-hand text-[22px] leading-[1.3] text-[#2C2A29]">{s.d}</p>
                <p className="mt-4 inline-block rotate-1 bg-[#E8E3D7] px-3 py-1 font-hand text-lg text-[#4A4743]">✎ {s.note}</p>
                {i === 2 && (
                  <div className="mt-5 border-t border-dashed border-[#1A1918]/30 pt-4">
                    <p className="font-hand text-xl leading-snug">“…coax mass out of the white <span className="hand-circle font-bold">silence ☺<CircleScribble className="text-[#1A1918]" /></span>.”</p>
                  </div>
                )}
              </article>
            ))}
            <div className="flex items-center gap-4 pl-2">
              <StarDoodle className="h-8 w-8 animate-spin-slow text-[#1A1918]" />
              <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#4A4743]">end of gesture · wipe your hands</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= CHAPTER 02 ================= */
export function Chapter02() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [sm, setSm] = useState({ x: 50, y: 40, active: false });

  const onMove = (e: React.MouseEvent) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    setSm({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
    graphiteAudio.smudge(6);
  };

  return (
    <section id="cellular" className="paper-surface paper-fibers relative overflow-hidden border-t-2 border-[#1A1918]">
      <div className="smudge-band pointer-events-none absolute right-[-10%] top-10 h-16 w-[70%] rotate-3 opacity-25" />
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.4em] text-[#4A4743]">Chapter 02 — Botanical equilibrium</p>
            <h2 className="roughen mt-3 font-display uppercase leading-[0.85]">
              <span className="block text-[13vw] md:text-[7.5vw]"><span className="graphite-rub">02. Cellular</span></span>
              <span className="block text-[13vw] md:text-[7.5vw]"><span className="graphite-rub">Friction</span></span>
            </h2>
          </div>
          <p className="max-w-sm -rotate-1 font-hand text-2xl leading-tight text-[#2C2A29]">
            try rubbing the blossom <span className="inline-block font-bold">↗</span> — your fingertip is a tortillon now.
          </p>
        </div>

        {/* technical frame */}
        <div className="mt-10 border-2 border-[#1A1918] bg-[#FBFAF6]/60">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1A1918] px-4 py-2 font-mono2 text-[10px] uppercase tracking-[0.25em]">
            <span>Project #0653 · Orchidaceae Xenoflora</span>
            <span className="hidden md:block">Sample description: perennial · pronounced abnormal softness</span>
            <span className="bg-[#1A1918] px-2 py-0.5 text-[#F5F2EB]">AV /// 2026</span>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr_300px]">
            {/* left tags */}
            <div className="hidden flex-col justify-between gap-6 border-r border-[#1A1918]/20 p-5 lg:flex">
              <div>
                <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#4A4743]">Field notes</p>
                <ul className="mt-3 space-y-3 font-hand text-xl leading-tight text-[#2C2A29]">
                  <li>① stipple the throat — 400 dots/min</li>
                  <li>② veins in 2H, <b>whisper-light</b></li>
                  <li>③ drown the stem in 6B shadow</li>
                </ul>
              </div>
              <div className="border border-dashed border-[#1A1918]/40 p-3">
                <p className="font-mono2 text-[10px] uppercase tracking-[0.25em]">⚠ warning</p>
                <p className="mt-1 font-hand text-lg leading-tight">pollen dust migrates if you smudge too lovingly. that's the point.</p>
              </div>
              <div className="font-mono2 text-[10px] uppercase leading-relaxed tracking-[0.2em] text-[#4A4743]">
                stem Ø 4.2mm<br />petal drag 31°<br />tooth depth: deep
              </div>
            </div>

            {/* CENTER — interactive smudge blossom */}
            <div
              ref={boxRef}
              onMouseMove={onMove}
              onMouseLeave={() => setSm((s) => ({ ...s, active: false }))}
              data-cursor="smudge"
              className="relative min-h-[480px] overflow-hidden md:min-h-[640px]"
            >
              <img src="/images/orchid-specimen.jpg" alt="Orchid specimen" className="absolute inset-0 h-full w-full object-cover" style={{ filter: "grayscale(1) contrast(1.12)" }} />
              <div className="dither-dots pointer-events-none absolute inset-0 opacity-25" />
              {/* smudged reveal follows finger */}
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: sm.active ? 1 : 0,
                  backgroundImage: "url(/images/orchid-specimen.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(1) brightness(1.35) blur(3px) contrast(0.85)",
                  WebkitMaskImage: `radial-gradient(circle 130px at ${sm.x}% ${sm.y}%, black 0%, rgba(0,0,0,0.6) 45%, transparent 72%)`,
                  maskImage: `radial-gradient(circle 130px at ${sm.x}% ${sm.y}%, black 0%, rgba(0,0,0,0.6) 45%, transparent 72%)`,
                }}
              />
              {/* fingertip ring */}
              <div
                className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#1A1918]/70 transition-opacity"
                style={{ left: `${sm.x}%`, top: `${sm.y}%`, opacity: sm.active ? 1 : 0 }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1A1918] px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#F5F2EB]">smudging…</span>
              </div>
              {/* drafting corners + measure lines */}
              <span className="absolute left-3 top-3 h-8 w-8 border-l-[3px] border-t-[3px] border-[#1A1918]" />
              <span className="absolute right-3 top-3 h-8 w-8 border-r-[3px] border-t-[3px] border-[#1A1918]" />
              <span className="absolute bottom-3 left-3 h-8 w-8 border-b-[3px] border-l-[3px] border-[#1A1918]" />
              <span className="absolute bottom-3 right-3 h-8 w-8 border-b-[3px] border-r-[3px] border-[#1A1918]" />
              <div className="absolute left-1/2 top-3 -translate-x-1/2 font-mono2 text-[9px] uppercase tracking-[0.3em] text-[#1A1918]/70">◂ 184mm ▸</div>
              <SquiggleArrow className="absolute bottom-8 right-8 h-14 w-28 -rotate-12 text-[#1A1918]" />
              <p className="absolute bottom-4 right-6 rotate-[-4deg] bg-[#F5F2EB] px-2 py-1 font-hand text-lg leading-none shadow">rub here!!</p>
            </div>

            {/* right copy */}
            <div className="flex flex-col justify-between gap-6 border-t border-[#1A1918]/20 p-5 lg:border-l lg:border-t-0">
              <div>
                <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#4A4743]">Narrative · silver gelatin voice</p>
                <p className="mt-3 font-hand text-[22px] leading-[1.3] text-[#2C2A29]">
                  “A stem does not grow in clean vectors. It <b>fractures through resistance</b>. In the grain of the paper lies memory: the harder you drag, the deeper the shadows take root.”
                </p>
              </div>
              <div className="space-y-2">
                {["petal I — stipple 82%", "petal II — flat wash 64%", "throat — mass 97%"].map((t) => (
                  <div key={t} className="flex items-center justify-between border border-[#1A1918]/25 px-3 py-2 font-mono2 text-[10px] uppercase tracking-[0.2em]">
                    <span>{t}</span><span>●</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between">
                <div className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#4A4743]">Project Manager:<br /><b className="text-[#1A1918]">Dr. E. V. Lead</b></div>
                <StarDoodle className="h-9 w-9 animate-wobble text-[#1A1918]" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-scribble text-xs text-[#4A4743]">* no orchids were vectorized in the making of this chapter — only smudged.</p>
      </div>
    </section>
  );
}

/* ================= INVERSION — THE GREAT SMEAR ================= */
export function Inversion() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const done = Math.min(Math.max(-r.top / (total || 1), 0), 1);
      setP(done);
      document.documentElement.dataset.theme = done > 0.45 ? "dark" : "light";
      if (done > 0.5 && !fired.current) {
        fired.current = true;
        graphiteAudio.tap("deep");
      }
      if (done < 0.3) fired.current = false;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.dataset.theme = "light";
    };
  }, []);

  const stumpX = p * 110 - 5;
  const stumpY = 30 + Math.sin(p * Math.PI * 3) * 18;

  return (
    <div ref={wrapRef} id="inversion-sensor" className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* paper base */}
        <div className="paper-surface absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ opacity: 1 - p * 1.6 }}>
          <p className="font-mono2 text-[11px] uppercase tracking-[0.45em] text-[#4A4743]">interlude — keep dragging downward</p>
          <h2 className="roughen mt-4 font-display text-[14vw] uppercase leading-[0.85] md:text-[8vw]"><span className="graphite-rub">The great</span></h2>
          <p className="mt-2 font-hand text-3xl text-[#4A4743]">something heavy is about to happen…</p>
        </div>

        {/* dark wipe */}
        <div className="dark-surface absolute inset-0" style={{ clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-mono2 text-[11px] uppercase tracking-[0.45em] text-[#7E8084]">you are now inside the shadow</p>
            <h2 className="roughen mt-4 font-display uppercase leading-[0.85]">
              <span className="block text-[13vw] md:text-[8vw]"><span className="graphite-rub-light">Smear into</span></span>
              <span className="block text-[13vw] md:text-[8vw]"><span className="graphite-rub-light">Darkness</span></span>
            </h2>
            <p className="mt-4 max-w-md font-hand text-2xl leading-tight text-[#C8D0D8]">velvet charcoal falling like night. pillars waking up below ↓</p>
          </div>
          {/* chalk dust */}
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#E8EAED]"
              style={{
                left: `${(i * 37.7) % 100}%`,
                top: `${(i * 53.3) % 100}%`,
                width: 1 + (i % 3),
                height: 1 + (i % 3),
                opacity: 0.2 + (i % 5) * 0.12,
                animation: `dust-twinkle ${2 + (i % 4)}s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* traveling smear bands — the wipe edge */}
        <div className="pointer-events-none absolute inset-x-[-10%] w-[120%]" style={{ top: `${(1 - p) * 100}%`, transform: "translateY(-50%)" }}>
          <div className="h-24 w-full -rotate-1 bg-[#1A1918] blur-[2px] md:h-32" style={{ filter: "blur(3px)" }} />
          <div className="smudge-band -mt-10 h-20 w-full rotate-1 opacity-80" />
          <div className="smudge-band-light -mt-16 h-16 w-full opacity-60" />
        </div>
        {/* horizontal sweeps */}
        {[0.15, 0.45, 0.72].map((o, i) => (
          <div
            key={o}
            className="pointer-events-none absolute h-14 w-[130%] bg-[#1A1918]/70 blur-md md:h-20"
            style={{
              top: `${o * 100}%`,
              left: "-15%",
              transform: `translateX(${(p - 0.5) * (i % 2 ? -60 : 60)}%) rotate(${i % 2 ? 1.5 : -1.5}deg)`,
              opacity: Math.sin(p * Math.PI) * 0.85,
            }}
          />
        ))}

        {/* blending stump traveler */}
        <div className="pointer-events-none absolute z-10" style={{ left: `${stumpX}%`, top: `${stumpY}%`, opacity: p > 0.04 && p < 0.96 ? 1 : 0 }}>
          <div className="relative -translate-x-1/2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-current bg-white/5 backdrop-blur-[1px] mix-blend-difference text-white">
              <span className="font-mono2 text-[9px] uppercase tracking-[0.2em]">stump</span>
            </div>
            <div className="absolute left-1/2 top-full h-24 w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/70 to-transparent" />
          </div>
        </div>

        {/* progress */}
        <div className="absolute inset-x-0 bottom-0 z-10 mix-blend-difference">
          <div className="flex items-center justify-between px-6 pb-3 font-mono2 text-[10px] uppercase tracking-[0.3em] text-white md:px-10">
            <span>{p < 0.45 ? "○ paper world" : "● slate world"}</span>
            <span className="text-2xl tracking-normal">{Math.round(p * 100)}%</span>
            <span>{p < 0.5 ? "dragging…" : "inverted ✓"}</span>
          </div>
          <div className="h-[3px] bg-white/20"><div className="h-full bg-white" style={{ width: `${p * 100}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

/* ================= CHAPTER 03 — DARK ================= */
export function Chapter03() {
  const { ref, p } = useSectionProgress<HTMLDivElement>();

  return (
    <section id="monoliths" className="dark-surface relative overflow-hidden text-[#E8EAED]">
      <div className="chalk-hatch pointer-events-none absolute inset-0 opacity-50" />
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.4em] text-[#7E8084]">Chapter 03 — Monolithic silence</p>
        <h2 className="roughen mt-3 font-display uppercase leading-[0.85]">
          <span className="block text-[12vw] md:text-[7.2vw]"><span className="graphite-rub-light">03. Architectural</span></span>
          <span className="block text-[12vw] md:text-[7.2vw]"><span className="graphite-rub-light">Ruins</span><span className="ml-4 align-middle font-hand text-[5vw] normal-case text-[#7E8084] md:text-[2vw]">(shhh… dust sleeps here)</span></span>
        </h2>

        <div ref={ref} className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden border border-[#E8EAED]/25" data-cursor="drag">
            <img
              src="/images/monoliths.jpg"
              alt="Chalk monolith columns"
              className="h-[480px] w-full object-cover md:h-[640px]"
              style={{ transform: `scale(${1.12 - p * 0.12}) translateY(${p * 30}px)`, filter: `contrast(${1.05 + p * 0.2}) brightness(${0.92 + p * 0.15})` }}
            />
            <div className="dither-dots-light pointer-events-none absolute inset-0 opacity-20" />
            <div className="smudge-band-light pointer-events-none absolute left-[-10%] top-[30%] h-24 w-[120%] -rotate-2" style={{ transform: `translateX(${(p - 0.5) * 60}px) rotate(-2deg)` }} />
            {/* dimension lines */}
            <div className="absolute left-6 top-6 font-mono2 text-[10px] tracking-[0.25em] text-[#E8EAED]/80">
              <div className="border-x border-t border-[#E8EAED]/50 px-3 py-1">12.4m</div>
            </div>
            <div className="absolute bottom-24 right-8 rotate-90 font-mono2 text-[10px] tracking-[0.25em] text-[#E8EAED]/80">
              <div className="border-x border-t border-[#E8EAED]/50 px-3 py-1">88°</div>
            </div>
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-5 pt-12 font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#E8EAED]/90">
              <span>Corinthian · Doric · Ruin</span>
              <span>stipple density {Math.round(62 + p * 36)}%</span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div className="border border-[#E8EAED]/20 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#7E8084]">Narrative · written in silver lead</p>
              <p className="mt-4 font-hand text-[24px] leading-[1.35] text-[#E8EAED]">
                “When the light is exhausted, we sculpt with <span className="hand-underline font-bold">dust<UnderlineScribble className="text-[#E8EAED]/60" /></span>. Pillars raised from crushed stone and stippled memory, standing immune to the erasure of time.”
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 font-mono2 text-center text-[10px] uppercase tracking-[0.2em]">
                {[["98%", "density"], ["4.2g", "dust"], ["9B+", "pressure"]].map(([v, k]) => (
                  <div key={k} className="border border-[#E8EAED]/20 px-2 py-3">
                    <div className="text-lg tracking-normal text-[#E8EAED]">{v}</div>
                    <div className="mt-1 text-[#7E8084]">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* whoops doodle */}
            <div className="relative -rotate-1 border border-dashed border-[#E8EAED]/30 p-5">
              <div className="flex items-center gap-5">
                <svg viewBox="0 0 80 90" className="h-20 w-16 shrink-0 -rotate-12 text-[#E8EAED]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 8 h40 M24 14 h32 M26 20 v52 M54 20 v52 M22 72 h36 M18 80 h44" strokeLinecap="round" />
                  <path d="M60 30 l14 -8 M62 44 l15 -2" strokeLinecap="round" opacity="0.6" />
                  <circle cx="68" cy="60" r="2" fill="currentColor" />
                </svg>
                <div>
                  <p className="font-hand text-2xl leading-tight text-[#E8EAED]">one column fell over…</p>
                  <p className="font-scribble text-xs text-[#7E8084]">whoops. — site foreman ☺</p>
                </div>
                <StarDoodle className="ml-auto h-8 w-8 animate-wobble text-[#E8EAED]/60" />
              </div>
            </div>

            <a href="#sandbox" data-cursor="draw" onClick={() => graphiteAudio.tap("eraser")} className="group flex items-center justify-between border border-[#E8EAED]/40 px-6 py-5 font-mono2 text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-[#E8EAED] hover:text-[#0D0D0E]">
              <span>Descend to the sandbox</span>
              <span className="transition-transform group-hover:translate-y-1">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
