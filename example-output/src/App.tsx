import { useEffect, useState } from "react";
import Lenis from "lenis";
import { Cursor, FilterDefs, IntroVeil, SideRails, TopBar } from "./components/Overlays";
import { Hero, Manifesto, Chapter01, Chapter02, Inversion, Chapter03 } from "./components/Sections";
import { Sandbox, Footer } from "./components/Sandbox";
import { graphiteAudio } from "./lib/audio";

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [toast, setToast] = useState(true);

  useEffect(() => {
    if (!introDone) return;
    const t = setTimeout(() => setToast(false), 14000);
    return () => clearTimeout(t);
  }, [introDone]);

  useEffect(() => {
    // buttery graphite glide
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // anchor glide
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
    };
    document.addEventListener("click", onClick);

    const t1 = setTimeout(() => setIntroDone(true), 1900);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      clearTimeout(t1);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = introDone ? "" : "hidden";
  }, [introDone]);

  useEffect(() => () => graphiteAudio.destroy(), []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    graphiteAudio.setEnabled(next);
    if (next) setTimeout(() => graphiteAudio.tap("pencil"), 350);
  };

  return (
    <div className="min-h-screen">
      <FilterDefs />
      <div className="grain-overlay" />
      <Cursor />
      <TopBar soundOn={soundOn} onToggleSound={toggleSound} />
      <SideRails />
      <IntroVeil done={introDone} />

      <main>
        <Hero />
        <Manifesto />
        <Chapter01 />
        <Chapter02 />
        <Inversion />
        <Chapter03 />
        <Sandbox />
      </main>
      <Footer />

      {/* hidden sound hint toast */}
      {!soundOn && introDone && toast && (
        <button
          onClick={() => { setToast(false); toggleSound(); }}
          data-cursor="hear the grain"
          className="fixed bottom-5 left-1/2 z-[75] hidden -translate-x-1/2 -rotate-2 items-center gap-3 border border-[#1A1918] bg-[#F5F2EB] px-5 py-3 shadow-[5px_5px_0_#1A1918] mix-blend-normal md:flex"
        >
          <span className="h-2 w-2 animate-blink-soft rounded-full bg-[#1A1918]" />
          <span className="font-hand text-xl leading-none text-[#1A1918]">psst — turn the sound on, the paper crackles ♪</span>
        </button>
      )}
    </div>
  );
}
