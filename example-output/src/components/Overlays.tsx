import { useEffect, useRef, useState } from "react";
import { graphiteAudio } from "../lib/audio";

/* ---------- SVG FILTER DEFS ---------- */
export function FilterDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="pencil-roughen">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.09" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="pencil-roughen-soft">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.12" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="smudge-soften">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="2" result="n" />
          <feDisplacementMap in="b" in2="n" scale="3" />
        </filter>
      </defs>
    </svg>
  );
}

/* ---------- BLENDING STUMP CURSOR + GRAPHITE DUST ---------- */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Position, velocity, and dynamic rotation tracking
  const pos = useRef({
    x: -100,
    y: -100,
    rx: -100,
    ry: -100,
    tilt: 0,
    scale: 1,
    initialized: false,
  });
  const vel = useRef({ x: 0, y: 0, mag: 0 });

  // Refs for animation loop stability (prevent restarting RAF & wiping dust)
  const isDownRef = useRef(false);
  const isVisibleRef = useRef(false);
  const hoverKindRef = useRef<string | null>(null);
  const isInteractiveRef = useRef(false);

  // React state for reactive UI classes
  const [hoverKind, setHoverKind] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFine, setIsFine] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });

  // Track media query changes for responsive pointer devices
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsFine(e.matches);
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!isFine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      size: number;
      dark: boolean;
      rot: number;
      vrot: number;
    };
    let parts: P[] = [];

    const spawnDust = (x: number, y: number, count: number, force = 1) => {
      if (parts.length > 450) return;
      const isDark = document.documentElement.dataset.theme === "dark";
      for (let i = 0; i < count; i++) {
        const spreadAngle = Math.random() * Math.PI * 2;
        const speed = (0.5 + Math.random() * 2.0) * force;
        parts.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: vel.current.x * 0.04 + Math.cos(spreadAngle) * speed,
          vy: vel.current.y * 0.04 + Math.sin(spreadAngle) * speed - 0.35,
          life: 0,
          max: 40 + Math.random() * 60,
          size: 0.7 + Math.random() * 2.2,
          dark: isDark,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.12,
        });
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!pos.current.initialized) {
        pos.current.x = e.clientX;
        pos.current.y = e.clientY;
        pos.current.rx = e.clientX;
        pos.current.ry = e.clientY;
        pos.current.initialized = true;
      }
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const dx = e.clientX - pos.current.x;
      const dy = e.clientY - pos.current.y;
      vel.current.x = vel.current.x * 0.65 + dx * 0.35;
      vel.current.y = vel.current.y * 0.65 + dy * 0.35;
      vel.current.mag = Math.hypot(vel.current.x, vel.current.y);

      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      // Realistic pencil tilt responding to lateral motion (up to ±26deg)
      pos.current.tilt = Math.max(-26, Math.min(26, vel.current.x * 1.4));

      graphiteAudio.drag(vel.current.mag, isDownRef.current);

      // Kick up graphite dust on swift gestures
      if (vel.current.mag > 7.5 && parts.length < 400) {
        const n = Math.min(5, Math.floor(vel.current.mag / 5.5));
        spawnDust(e.clientX, e.clientY, n, Math.min(2.5, vel.current.mag * 0.08));
      }

      // Hover detection for tactile feedback
      const target = e.target as HTMLElement | null;
      const cursorEl = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const interactiveEl = target?.closest?.("a, button, [role='button'], input, textarea, select") as HTMLElement | null;

      const nextHover = cursorEl?.dataset.cursor ?? null;
      const nextInteractive = !!(cursorEl || interactiveEl);

      if (nextHover !== hoverKindRef.current) {
        hoverKindRef.current = nextHover;
        setHoverKind(nextHover);
      }
      if (nextInteractive !== isInteractiveRef.current) {
        isInteractiveRef.current = nextInteractive;
        setIsInteractive(nextInteractive);
      }
    };

    const onDown = (e: MouseEvent) => {
      isDownRef.current = true;
      setIsDown(true);
      // Subtle lead bite flecks on contact with cotton paper
      spawnDust(e.clientX, e.clientY, 3, 0.7);
      graphiteAudio.tap("pencil");
      graphiteAudio.drag(Math.max(5, vel.current.mag), true);
    };

    const onUp = () => {
      isDownRef.current = false;
      setIsDown(false);
      graphiteAudio.drag(vel.current.mag, false);
    };

    const onLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const onEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let raf = 0;
    const loop = () => {
      // Smooth physical lag for the blending stump tortillon (spring inertia)
      pos.current.rx += (pos.current.x - pos.current.rx) * 0.2;
      pos.current.ry += (pos.current.y - pos.current.ry) * 0.2;
      vel.current.mag *= 0.93;

      // Target scale calculation for tactile feedback
      let targetScale = 1;
      if (isDownRef.current) {
        targetScale = 0.84; // Lead compression into paper
      } else if (hoverKindRef.current) {
        targetScale = 1.42; // Action aperture expansion
      } else if (isInteractiveRef.current) {
        targetScale = 1.22; // Subtle focus expansion on links/buttons
      } else {
        targetScale = 1 + Math.min(0.35, vel.current.mag * 0.015);
      }

      pos.current.scale += (targetScale - pos.current.scale) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        const ringRotation = pos.current.rx * 0.04 + pos.current.tilt * 0.8;
        ringRef.current.style.transform = `translate3d(${pos.current.rx}px, ${pos.current.ry}px, 0) scale(${pos.current.scale}) rotate(${ringRotation}deg)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      // Render graphite dust & charcoal flecks
      ctx.clearRect(0, 0, w, h);
      const isDark = document.documentElement.dataset.theme === "dark";
      parts = parts.filter((p) => p.life < p.max);
      for (const p of parts) {
        p.life++;
        p.vy += 0.022; // subtle gravity
        p.vx *= 0.986;
        p.vy *= 0.988;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        const progress = p.life / p.max;
        const alpha = (1 - progress) * (isDark ? 0.72 : 0.65);
        const radius = p.size * (1 - progress * 0.4);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        // Slightly faceted grain instead of perfect circle
        ctx.ellipse(0, 0, radius, radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(232, 234, 237, ${alpha})`
          : `rgba(26, 25, 24, ${alpha})`;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [isFine]);

  if (!isFine) return null;

  return (
    <>
      {/* Graphite dust canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[95]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.25s ease-out",
        }}
      />

      {/* Blending stump / drafting caliper ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[96] -ml-[25px] -mt-[25px] h-[50px] w-[50px]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.25s ease-out",
        }}
      >
        <div
          className={`relative h-full w-full rounded-full border-white mix-blend-difference transition-colors duration-150 ${
            isDown ? "bg-white/15" : ""
          }`}
          style={{ borderWidth: 1.5, borderStyle: "solid" }}
        >
          {/* Inner spiral tooth ring representing rolled tortillon layers */}
          <div className="absolute inset-[6px] rounded-full border border-dashed border-white/60" />

          {/* Drafting tilt needle at top */}
          <div className="absolute left-1/2 -top-[10px] h-[10px] w-[1.5px] -translate-x-1/2 bg-white" />

          {/* Precision drafting reticle crosshair ticks */}
          <div className="absolute -left-[5px] top-1/2 h-[1px] w-[5px] -translate-y-1/2 bg-white/70" />
          <div className="absolute -right-[5px] top-1/2 h-[1px] w-[5px] -translate-y-1/2 bg-white/70" />
          <div className="absolute bottom-[-5px] left-1/2 h-[5px] w-[1px] -translate-x-1/2 bg-white/70" />
        </div>
      </div>

      {/* Graphite lead contact point */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[97] -ml-[3px] -mt-[3px]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease-out",
        }}
      >
        <div
          className={`rounded-full bg-white mix-blend-difference transition-transform duration-100 ${
            isDown
              ? "scale-[2.4]"
              : hoverKind
              ? "scale-[0.5]"
              : isInteractive
              ? "scale-[1.3]"
              : "scale-100"
          }`}
          style={{ width: "6px", height: "6px" }}
        />
      </div>

      {/* Drafting monospace badge / label */}
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[98]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease-out",
        }}
      >
        <div
          className={`ml-8 mt-3 inline-flex items-center gap-2 border border-white/90 bg-black/60 px-2.5 py-1 font-mono2 text-[9px] uppercase tracking-[0.25em] text-white mix-blend-difference backdrop-blur-[2px] transition-all duration-200 ${
            hoverKind || (isInteractive && !hoverKind)
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-1.5 scale-95 opacity-0"
          }`}
        >
          <span className="inline-block h-1 w-1 bg-white" />
          <span>
            {hoverKind === "smudge"
              ? "◍ smudge tooth"
              : hoverKind === "draw"
              ? "✎ leave lead"
              : hoverKind === "drag"
              ? "↔ drag mass"
              : hoverKind
              ? hoverKind
              : "focus ↗"}
          </span>
        </div>
      </div>
    </>
  );
}

/* ---------- TOP BAR ---------- */
export function TopBar({ soundOn, onToggleSound }: { soundOn: boolean; onToggleSound: () => void }) {
  const [tilt, setTilt] = useState(42);
  const [friction, setFriction] = useState(12);
  const [pressure, setPressure] = useState("8B");
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    let lastY = window.scrollY;
    let vel = 0;
    const onScroll = () => {
      const y = window.scrollY;
      vel = vel * 0.85 + Math.abs(y - lastY) * 0.15;
      lastY = y;
      setFriction(Math.min(99, Math.round(8 + vel * 3.2)));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;
      setProgress(p);
      setPressure(p < 0.25 ? "2H" : p < 0.45 ? "HB" : p < 0.65 ? "6B" : p < 0.85 ? "8B" : "9B+");
    };
    const onMouse = (e: MouseEvent) => {
      setTilt(Math.round(18 + (e.clientX / window.innerWidth) * 52));
    };
    const tickTime = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`);
    };
    tickTime();
    const iv = setInterval(tickTime, 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      clearInterval(iv);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[80] mix-blend-difference">
      <div className="flex items-center justify-between px-4 py-3 text-white md:px-8">
        <a href="#top" data-cursor="↖ back to white" className="font-mono2 text-[10px] uppercase tracking-[0.18em] md:text-[11px]">
          Fig. 001 <span className="opacity-50">//</span> Anatomy of a stroke
        </a>
        <div className="hidden items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.22em] opacity-90 lg:flex">
          <span>Tilt: {tilt}°</span>
          <span className="opacity-40">—</span>
          <span>Pressure: {pressure}</span>
          <span className="opacity-40">—</span>
          <span>Friction: {friction}%</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono2 text-[10px] tracking-[0.2em] opacity-60 md:block">{time}</span>
          <button
            onClick={onToggleSound}
            data-cursor={soundOn ? "mute the room" : "hear the grain"}
            className="group flex items-center gap-2 border border-white/40 px-3 py-1.5 font-mono2 text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black"
          >
            <span className={`inline-block h-[6px] w-[6px] rounded-full ${soundOn ? "animate-blink-soft bg-current" : "bg-current opacity-30"}`} />
            {soundOn ? "Sound: on" : "Sound: off"}
          </button>
        </div>
      </div>
      <div className="mx-4 h-px bg-white/15 md:mx-8">
        <div className="h-full bg-white transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
    </header>
  );
}

/* ---------- SIDE RAILS ---------- */
export function SideRails() {
  return (
    <>
      <div className="pointer-events-none fixed left-3 top-1/2 z-[70] hidden -translate-y-1/2 -rotate-90 items-center gap-3 font-mono2 text-[9px] uppercase tracking-[0.35em] mix-blend-difference text-white/70 xl:flex">
        <span>9B</span><span className="h-px w-8 bg-current opacity-40" /><span>soft — flat — smudged</span><span className="h-px w-8 bg-current opacity-40" /><span>2H</span>
      </div>
      <div className="pointer-events-none fixed right-3 top-1/2 z-[70] hidden -translate-y-1/2 rotate-90 items-center gap-3 font-mono2 text-[9px] uppercase tracking-[0.35em] mix-blend-difference text-white/70 xl:flex">
        <span>cold-press</span><span className="h-px w-8 bg-current opacity-40" /><span>cotton 640gsm</span>
      </div>
    </>
  );
}

/* ---------- INTRO VEIL ---------- */
export function IntroVeil({ done }: { done: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#F5F2EB] transition-all duration-[1100ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${done ? "-translate-y-full" : "translate-y-0"}`}
      style={{ clipPath: done ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)" }}
    >
      <div className="paper-surface absolute inset-0" />
      <div className="relative px-6 text-center">
        <p className="font-mono2 text-[10px] uppercase tracking-[0.4em] text-[#4A4743]">Tilt the lead flat</p>
        <h1 className="roughen-soft mt-4 font-display text-[13vw] uppercase leading-[0.85] tracking-tight text-[#1A1918] md:text-[7vw]">
          <span className="graphite-rub">Smudging</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[280px] font-hand text-xl leading-tight text-[#4A4743]">sharpening the carpenter's pencil… loading the tooth of the paper</p>
        <div className="mx-auto mt-8 h-[3px] w-56 overflow-hidden bg-[#1A1918]/10">
          <div className={`h-full bg-[#1A1918] transition-all duration-[1400ms] ease-out ${done ? "w-full" : "w-[12%]"}`} />
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#4A4743]/70">
          <span className="h-1.5 w-1.5 animate-blink-soft rounded-full bg-[#1A1918]" /> friction 94%
        </div>
      </div>
      {/* smudge bands sweeping during load */}
      <div className="smudge-band pointer-events-none absolute left-[-10%] top-[22%] h-16 w-[120%] -rotate-2 opacity-40" />
      <div className="smudge-band pointer-events-none absolute bottom-[20%] left-[-10%] h-10 w-[120%] rotate-1 opacity-25" />
    </div>
  );
}

/* ---------- DOODLE PRIMITIVES ---------- */
export function SquiggleArrow({ className = "", flip = false, color = "currentColor" }: { className?: string; flip?: boolean; color?: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M4 48 C 30 44, 44 10, 72 14 C 92 17, 88 38, 104 36 M104 36 l-9 -7 M104 36 l-11 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M20 3 L22.5 15 L35 12 L25 20 L32 31 L20 24 L9 32 L14 20 L4 14 L17 15 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="20" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function CircleScribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} preserveAspectRatio="none">
      <path d="M8 30 C 8 12, 40 6, 66 8 C 94 10, 114 16, 112 32 C 110 48, 78 55, 50 53 C 24 51, 6 46, 10 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 34 C 30 44, 70 48, 100 38" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function UnderlineScribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" fill="none" className={className} preserveAspectRatio="none">
      <path d="M3 13 C 40 6, 70 16, 110 10 C 140 6, 170 12, 197 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 17 C 60 12, 120 18, 190 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
