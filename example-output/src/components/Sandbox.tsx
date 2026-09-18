import { useEffect, useRef, useState } from "react";
import { CircleScribble, SquiggleArrow, StarDoodle } from "./Overlays";
import { graphiteAudio } from "../lib/audio";

type Tool = "2H" | "HB" | "6B" | "9B" | "stump" | "eraser";

const TOOLS: { id: Tool; label: string; hint: string }[] = [
  { id: "2H", label: "2H", hint: "whisper" },
  { id: "HB", label: "HB", hint: "daily" },
  { id: "6B", label: "6B", hint: "buttery" },
  { id: "9B", label: "9B", hint: "greasy" },
  { id: "stump", label: "◍", hint: "tortillon" },
  { id: "eraser", label: "⌫", hint: "kneaded" },
];

export function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("6B");
  const [marks, setMarks] = useState<string[]>([]);
  const [strokes, setStrokes] = useState(0);

  // setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = wrap.getBoundingClientRect();
      // preserve drawing
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width; tmp.height = canvas.height;
      if (canvas.width > 0) tmp.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (tmp.width > 0) ctx.drawImage(tmp, 0, 0, r.width, r.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    // seed with a faint starter scribble
    setTimeout(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.strokeStyle = "rgba(74,71,67,0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const w = wrap.getBoundingClientRect().width;
      ctx.moveTo(w * 0.3, 90);
      ctx.bezierCurveTo(w * 0.4, 130, w * 0.55, 60, w * 0.68, 110);
      ctx.stroke();
      ctx.restore();
    }, 600);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const drawSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const speed = Math.hypot(to.x - from.x, to.y - from.y);
    ctx.save();
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = 26;
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    } else if (tool === "stump") {
      // smudge: soft paper-colored blur drag
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(232,227,215,0.5)";
      ctx.lineWidth = 30;
      ctx.globalAlpha = 0.35;
      ctx.shadowColor = "rgba(74,71,67,0.35)";
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(120,114,100,0.25)";
      ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    } else {
      const cfg = {
        "2H": { c: "74,71,67", w: 1.6, a: 0.4 },
        HB: { c: "44,42,41", w: 3.2, a: 0.62 },
        "6B": { c: "26,25,24", w: 8, a: 0.78 },
        "9B": { c: "12,12,12", w: 15, a: 0.92 },
      }[tool]!;
      ctx.globalCompositeOperation = "source-over";
      // pressure: faster = lighter & thinner
      const press = Math.max(0.4, 1 - speed * 0.014);
      // main stroke — 3 offset passes for tooth
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(${cfg.c},${cfg.a * (i === 0 ? 1 : 0.4)})`;
        ctx.lineWidth = cfg.w * press * (i === 0 ? 1 : 0.55);
        ctx.globalAlpha = i === 0 ? 1 : 0.5;
        const jx = (Math.random() - 0.5) * cfg.w * 0.35;
        const jy = (Math.random() - 0.5) * cfg.w * 0.35;
        ctx.beginPath();
        ctx.moveTo(from.x + jx, from.y + jy);
        ctx.lineTo(to.x + jx, to.y + jy);
        ctx.stroke();
      }
      // graphite speckle
      const dots = tool === "2H" ? 1 : tool === "HB" ? 3 : 7;
      ctx.fillStyle = `rgba(${cfg.c},${cfg.a * 0.7})`;
      for (let i = 0; i < dots; i++) {
        const t = Math.random();
        const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * cfg.w * 1.6;
        const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * cfg.w * 1.6;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    graphiteAudio.drag(Math.min(18, speed * 0.8), true);
  };

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    setStrokes((s) => s + 1);
    graphiteAudio.tap("pencil");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pos(e);
    drawSegment(last.current, p);
    last.current = p;
  };
  const onUp = () => (drawing.current = false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    graphiteAudio.tap("eraser");
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    graphiteAudio.tap("pencil");
    setMarks((m) => [canvas.toDataURL("image/png"), ...m].slice(0, 6));
  };

  return (
    <section id="sandbox" className="dark-surface relative overflow-hidden text-[#E8EAED]">
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.4em] text-[#7E8084]">Chapter 04 — The blending-stump archive</p>
            <h2 className="roughen mt-3 font-display uppercase leading-[0.85]">
              <span className="block text-[13vw] md:text-[7vw]"><span className="graphite-rub-light">The stroke</span></span>
              <span className="block text-[13vw] md:text-[7vw]"><span className="graphite-rub-light">Remains.</span></span>
            </h2>
          </div>
          <div className="max-w-xs rotate-2 border border-[#E8EAED]/25 bg-white/[0.04] p-4">
            <p className="font-hand text-xl leading-tight text-[#C8D0D8]">pick a lead, drag like you mean it. the paper remembers everything ☺</p>
          </div>
        </div>

        {/* toolbar */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTool(t.id); graphiteAudio.tap("pencil"); }}
              data-cursor={t.id === "stump" || t.id === "eraser" ? "smudge" : "draw"}
              className={`tool-btn tool-btn-dark flex items-center gap-2 border border-[#E8EAED]/30 px-4 py-2.5 font-mono2 text-xs uppercase tracking-[0.2em] ${tool === t.id ? "active" : "hover:bg-white/10"}`}
            >
              <span className="text-base">{t.label}</span>
              <span className="opacity-60">{t.hint}</span>
            </button>
          ))}
          <div className="ml-auto flex gap-3">
            <button onClick={clear} data-cursor="fresh paper" className="border border-[#E8EAED]/30 px-4 py-2.5 font-mono2 text-xs uppercase tracking-[0.2em] transition-all hover:bg-[#E8EAED] hover:text-black">Clear</button>
            <button onClick={save} data-cursor="pin it up!" className="relative bg-[#E8EAED] px-5 py-2.5 font-mono2 text-xs uppercase tracking-[0.2em] text-black transition-transform hover:-rotate-2">
              <CircleScribble className="pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] text-[#E8EAED]/70" />
              Leave your mark
            </button>
          </div>
        </div>

        {/* canvas */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div ref={wrapRef} className="paper-surface relative h-[480px] overflow-hidden border-2 border-[#E8EAED]/40 shadow-[0_0_80px_rgba(232,234,237,0.08)] md:h-[560px]" data-cursor="draw">
            <div className="draft-grid-fine pointer-events-none absolute inset-0 opacity-50" />
            <canvas
              ref={canvasRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              className="absolute inset-0 touch-none"
            />
            {/* overlay hints */}
            <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#4A4743]/70">
              <span>sheet Nº {String(strokes).padStart(3, "0")} · {tool}</span>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-xl text-[#4A4743]/60">
              {strokes === 0 ? "← drag here, make a beautiful mess →" : "nice. dirtier. dirtier."}
            </div>
            <SquiggleArrow className="pointer-events-none absolute right-8 top-8 h-12 w-28 rotate-12 text-[#1A1918]/50" />
          </div>

          {/* side meta */}
          <div className="flex flex-col gap-4">
            <div className="border border-[#E8EAED]/20 p-5">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#7E8084]">Lead index</p>
              <ul className="mt-3 space-y-2 font-hand text-xl leading-tight text-[#C8D0D8]">
                <li><b className="font-mono2 text-xs">2H</b> — a rumor of grey</li>
                <li><b className="font-mono2 text-xs">HB</b> — the honest worker</li>
                <li><b className="font-mono2 text-xs">6B</b> — warm butter drag</li>
                <li><b className="font-mono2 text-xs">9B</b> — midnight, greasy</li>
                <li><b className="font-mono2 text-xs">◍</b> — fingertip lies (softens all)</li>
              </ul>
            </div>
            <div className="flex-1 border border-dashed border-[#E8EAED]/25 p-5">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#7E8084]">Collective wall · {marks.length}/6</p>
              {marks.length === 0 ? (
                <p className="mt-3 font-hand text-xl leading-tight text-[#7E8084]">nothing pinned yet… your smudge could be the first star on this wall <StarDoodle className="inline h-5 w-5" /></p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {marks.map((m, i) => (
                    <div key={i} className="paper-surface relative border border-black/20 p-1.5">
                      <img src={m} alt={`mark ${i}`} className="h-20 w-full bg-[#F5F2EB] object-cover" />
                      <p className="mt-1 font-mono2 text-[8px] uppercase tracking-[0.2em] text-[#4A4743]">mark #{marks.length - i}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#E8EAED]/15 bg-[#070708] text-[#E8EAED]">
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-14 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="max-w-md">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.4em] text-[#7E8084]">Colophon — set in dirt</p>
            <p className="mt-4 font-hand text-2xl leading-snug text-[#C8D0D8]">
              Set in Anton rubbings, Caveat confessions & Space Mono measurements. No vectors were cleaned. All smudges intentional. If your screen looks dusty — good.
            </p>
            <div className="mt-5 flex items-center gap-3 font-scribble text-[11px] text-[#7E8084]">
              <span>made with flat lead & stubbornness</span>
              <StarDoodle className="h-5 w-5" />
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-x-16 gap-y-3 font-mono2 text-[11px] uppercase tracking-[0.25em]">
            {[
              ["The gesture", "#gesture"],
              ["Cellular friction", "#cellular"],
              ["Great smear", "#inversion-sensor"],
              ["Monoliths", "#monoliths"],
              ["Sandbox", "#sandbox"],
              ["Back to white ↑", "#top"],
            ].map(([l, h]) => (
              <a key={l} href={h} data-cursor="go" onClick={() => graphiteAudio.tap("pencil")} className="group flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
                <span className="h-px w-4 bg-current transition-all group-hover:w-8" />{l}
              </a>
            ))}
          </nav>
          <div className="text-right font-mono2 text-[10px] uppercase leading-loose tracking-[0.25em] text-[#7E8084]">
            Fig. 001 — 004<br />Tilt 42° · Friction 94%<br />© MMXXVI smudge dept.
          </div>
        </div>

        <div className="roughen mt-12 select-none overflow-hidden whitespace-nowrap font-display uppercase leading-none">
          <div className="animate-marquee flex w-max gap-6 text-[13vw] md:text-[7vw]">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="graphite-rub-light opacity-90">Leave a mark — Leave a mark —&nbsp;</span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EAED]/10 pt-5 font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#7E8084]">
          <span>Anatomy of a stroke · a tactile monograph</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-cursor="back to white" className="border border-[#E8EAED]/25 px-4 py-2 transition-all hover:bg-[#E8EAED] hover:text-black">↑ rewind the pencil</button>
        </div>
      </div>
    </footer>
  );
}
