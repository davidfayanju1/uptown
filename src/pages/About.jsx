// pages/About.jsx — The World of Uptown, the maison's story as one long read.
// Every section follows the same beat: the image floats in first, the words
// arrive after it has settled.
import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import PrimaryLayout from "../layout/PrimaryLayout";

const EASE = [0.22, 1, 0.36, 1];

// Images drift up and settle out of a slight over-scale — the "float in".
const imageMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 28, scale: 1.05 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 1.3, delay, ease: EASE },
});

// Text follows the image rather than racing it, so the delays start after the
// image has had most of its run.
const textMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.8, delay, ease: EASE },
});

// The photograph holds still while the panel travels the height of the frame,
// starting flush at the top the way the artwork lays it out. When the panel
// lands at the bottom the pin releases and the next section carries on.
const PanelOverFixedImage = ({ src, narrowSrc, alt, children }) => {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    const place = () => {
      const section = sectionRef.current;
      const frame = frameRef.current;
      const stage = stageRef.current;
      const panel = panelRef.current;
      if (!section || !frame || !stage || !panel) return;

      const rect = section.getBoundingClientRect();
      // How far the section scrolls while the frame stays pinned.
      const pinned = rect.height - frame.clientHeight;
      const progress =
        pinned > 0 ? Math.min(1, Math.max(0, -rect.top / pinned)) : 0;
      // The panel travels within the photograph, not the frame around it, and
      // the inset it starts at is mirrored at the foot.
      const travel = Math.max(
        0,
        stage.clientHeight - panel.offsetTop * 2 - panel.offsetHeight
      );

      panel.style.transform = `translate3d(0, ${progress * travel}px, 0)`;
    };

    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    const observer = new ResizeObserver(place);
    observer.observe(stageRef.current);
    observer.observe(panelRef.current);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[155svh]">
      <div
        ref={frameRef}
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-3"
      >
        {/* The photograph keeps its own proportions — the frame centres it
            rather than cropping it to fill. */}
        <div ref={stageRef} className="relative w-full">
          <picture className="block w-full">
            <source media="(min-width: 640px)" srcSet={src} />
            <img src={narrowSrc} alt={alt} className="block w-full" />
          </picture>
          <div
            ref={panelRef}
            className="absolute inset-x-8 top-8 bg-white px-5 py-8 will-change-transform sm:inset-x-20 sm:px-10 sm:py-9"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

// Two-up scroll-snap carousel with the dots reading their state off the scroll
// position — same approach the Daily Project cards use.
const Carousel = ({ slides }) => {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / (el.clientWidth * 0.86));
    setActive((prev) => (prev === index ? prev : Math.min(index, slides.length - 1)));
  }, [slides.length]);

  const goTo = (index) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth * 0.86, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex w-full snap-x snap-mandatory overflow-x-auto no-scrollbar"
      >
        {slides.map((slide) => (
          <div key={slide.src} className="w-[86%] flex-shrink-0 snap-start pr-[2px]">
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => goTo(i)}
            aria-label={`Image ${i + 1} of ${slides.length}`}
            className={
              i === active
                ? "grid h-4 w-4 place-items-center rounded-full border border-black"
                : "h-[7px] w-[7px] rounded-full bg-black/25 hover:bg-black/45"
            }
          >
            {i === active && (
              <span className="block h-[7px] w-[7px] rounded-full bg-black" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const About = () => {
  return (
    <PrimaryLayout>
      <div className="bg-[#f2f0ec]">
        <div className="mx-auto w-full max-w-[860px] bg-white pt-[4rem] md:pt-[5rem]">
          {/* ── The World of Uptown ─────────────────────────────────── */}
          <section className="overflow-x-clip pb-20">
            <motion.img
              src="/images/about/hero-wall.jpg"
              alt="Sunlight breaking across a red plastered wall"
              className="w-full object-cover"
              initial={{ opacity: 0, y: 28, scale: 1.05 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.4, ease: EASE }}
            />

            <div className="px-6 sm:px-12">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
                className="mt-14 text-center font-now text-[2rem] sm:text-[2.75rem] font-normal leading-tight tracking-tight text-[#111]"
              >
                The World of Uptown
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.0, ease: EASE }}
                className="mt-8 text-center font-now text-[1.15rem] sm:text-[1.4rem] font-normal leading-[1.55] text-[#111]"
              >
                “before there was Uptown,
                <br />
                there was a fascination with
                <br />
                things made well”
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.25, ease: EASE }}
                className="mx-auto mt-10 max-w-[34rem] text-center font-now text-[0.95rem] leading-[1.85] text-[#333]"
              >
                Uptown began long before there was a name, a logo, or a
                collection. It began with an obsession, a quiet fascination with
                things created with such intention that they seemed to transcend
                their purpose.
              </motion.p>
            </div>
          </section>

          {/* ── What makes something worth keeping ──────────────────── */}
          <section className="pb-16">
            <div className="relative px-6 sm:px-12">
              <motion.img
                {...imageMotion()}
                src="/images/about/london-facade.jpg"
                alt="A brick and terracotta London facade"
                className="w-[76%] object-cover"
                loading="lazy"
              />
              <motion.img
                {...imageMotion(0.15)}
                src="/images/about/london-bench.jpg"
                alt="A figure seated on a bench in a London square"
                className="relative -mt-[12%] ml-auto w-[76%] object-cover"
                loading="lazy"
              />
            </div>
          </section>

          <PanelOverFixedImage
            src="/images/about/worth-keeping.jpg"
            narrowSrc="/images/about/worth-keeping-portrait.jpg"
            alt="A man in tailoring stepping out of a doorway"
          >
            <p className="w-full text-center font-now text-[12.2px] leading-[1.95] text-[#222]">
              We believe a product’s true life begins the moment it leaves
              the box.
              <br />
              Long after it’s engineered.
              <br />
              Long after it’s purchased.
              <br />
              Most things simply fade into the background.
              <br />
              But a rare few become part of your story.
              <br />
              They move with you.
              <br />
              They capture the celebrations.
              <br />
              Endure the difficult moments.
              <br />
              And empower new beginnings.
              <br />
              It drives us to ask one simple question with everything we
              make:
              <br />
              <span className="font-semibold">
                What makes something worth keeping?
              </span>
            </p>
          </PanelOverFixedImage>

          <section className="overflow-x-clip py-20">
            <motion.p
              {...textMotion(0.1)}
              className="mx-auto max-w-[34rem] px-6 text-center font-now text-[0.95rem] leading-[1.9] text-[#333]"
            >
              We find ourselves reflecting on this very inquiry endlessly.
              <br />
              Because the answer, elusive as it may be…
              <br />
              Has profoundly little to do with the physical artifact itself, and
              entirely to do with the legacy it inspires.
            </motion.p>
          </section>

          {/* ── Excellence leaves fingerprints ──────────────────────── */}
          <section className="overflow-x-clip pb-20">
            <motion.div {...imageMotion()} className="pl-6 sm:pl-12">
              <Carousel
                slides={[
                  {
                    src: "/images/about/good-yarn.jpg",
                    alt: "A row of shopfronts on a London high street",
                  },
                  {
                    src: "/images/about/pantheon.jpg",
                    alt: "A classical cornice against a pink evening sky",
                  },
                ]}
              />
            </motion.div>

          </section>

          {/* The inverse of the panel above: here the words hold and the
              photograph is what moves, travelling up behind them. */}
          <section className="relative overflow-x-clip pb-[50svh]">
            <div className="sticky top-[4rem] z-10 mx-16 bg-white px-5 pb-10 pt-9 md:top-[5rem] sm:mx-32 sm:px-8">
              <motion.p
                {...textMotion(0.15)}
                className="mx-auto max-w-[34rem] text-center font-now text-[0.95rem] leading-[1.9] text-[#333]"
              >
                We realised it had very little to do with the object itself.
                <br />
                It had everything to do with the decisions behind it.
                <br />
                Every revision.
                <br />
                Every compromise refused.
                <br />
                Every material reconsidered.
                <br />
                Every hour no one would ever see.
                <br />
                Excellence leaves fingerprints long before it leaves the
                workshop.
              </motion.p>
            </div>

            <img
              src="/images/about/workshop.jpg"
              alt="A craftsman at his bench"
              width="1600"
              height="1329"
              className="mt-[30svh] w-full object-cover px-8 sm:px-16"
              loading="lazy"
            />
          </section>

          {/* ── Registry & Provenance ───────────────────────────────── */}
          <section className="overflow-x-clip pb-20">
            <div className="px-6 sm:px-12">
              <motion.img
                {...imageMotion()}
                src="/images/about/leonardo.jpg"
                alt="A monument to Leonardo under autumn trees"
                className="w-[70%] object-cover"
                loading="lazy"
              />
              <motion.img
                {...imageMotion(0.15)}
                src="/images/about/louvre.jpg"
                alt="The Mona Lisa on the wall of a gallery"
                className="relative -mt-[6%] ml-auto w-[70%] object-cover"
                loading="lazy"
              />
            </div>

            <motion.h2
              {...textMotion(0.15)}
              className="mt-16 text-center font-now text-[1.1rem] font-bold tracking-[0.02em] text-[#111]"
            >
              <span className="border-b-[3px] border-[#111] pb-1">
                REGISTRY &amp; PROVENANCE
              </span>
            </motion.h2>

            <motion.p
              {...textMotion(0.25)}
              className="mx-auto mt-10 max-w-[34rem] px-6 text-center font-now text-[0.95rem] leading-[1.9] text-[#333]"
            >
              We do not believe an object’s story ends when it leaves our hands.
              <br />
              Every Uptown creation is issued with a digital Certificate of
              Ownership that can accompany it throughout its lifetime. Whether
              it is kept, gifted, or resold, its history continues to grow,
              preserving an unbroken record of its provenance for generations to
              come.
              <br />
              Because true value is not only found in what an object is, but in
              the story it carries.
            </motion.p>
          </section>

          {/* ── Daily Project ──────────────────────────────────────── */}
          <section className="overflow-hidden pb-24">
            <motion.img
              {...textMotion()}
              src="/images/about/daily-project-script.png"
              alt=""
              aria-hidden="true"
              className="mx-auto w-[52%] max-w-[16rem]"
              loading="lazy"
            />

            <div className="relative mt-4">
              <motion.img
                {...imageMotion(0.1)}
                src="/images/about/dailyproject-bag.jpg"
                alt="The Daily Project shopping bag"
                className="mx-auto w-[64%] object-contain"
                loading="lazy"
              />

              {/* The wordmark scatters across the bag the way it does on the
                  packaging — decorative, so it stays out of the a11y tree. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[6%]">
                {[
                  { left: "6%", width: "42%", red: false },
                  { left: "44%", width: "42%", red: true },
                  { left: "2%", width: "40%", red: true },
                ].map((mark, i) => (
                  <motion.img
                    key={i}
                    {...textMotion(0.25 + i * 0.12)}
                    src="/images/dailyproject-red.png"
                    alt=""
                    style={{
                      left: mark.left,
                      width: mark.width,
                      top: `${i * 6.5}rem`,
                      filter: mark.red ? undefined : "brightness(0)",
                    }}
                    className="absolute"
                  />
                ))}
              </div>
            </div>

            <motion.h2
              {...textMotion(0.1)}
              className="mt-12 px-6 text-center font-now text-[1.05rem] font-bold tracking-[0.02em] text-[#111]"
            >
              THE EVERYDAY, RECONSIDERED.
            </motion.h2>

            <motion.div
              {...textMotion(0.2)}
              className="mx-6 mt-8 bg-[#2b2b2b] px-6 py-10 sm:mx-12 sm:px-12"
            >
              <p className="text-center font-now text-[0.95rem] leading-[1.9] text-white/90">
                The day is rarely beautiful.
                <br />
                Neither are we trying to make it so.
                <br />
                Daily Project is Uptown Maison’s everyday/workwear line made for
                the gifted, the disturbed, and the unfinished.
                <br />
                Good materials. Awkward proportions. Useful clothes.
                <br />
                A taste for the strange, the worn, the imperfect.
                <br />
                We make things to be lived in, not preserved. Worn hard. Worn
                often. Worn again.
                <br />
                Quality stays. The price doesn’t have to hurt.
                <br />
                For the everyday. Especially the ugly parts.
              </p>
            </motion.div>

            <div aria-hidden="true" className="mt-10 space-y-3">
              {[
                { left: "42%", width: "44%", red: true },
                { left: "38%", width: "42%", red: false },
                { left: "40%", width: "42%", red: false },
                { left: "36%", width: "44%", red: false },
              ].map((mark, i) => (
                <motion.img
                  key={i}
                  {...textMotion(0.1 + i * 0.1)}
                  src="/images/dailyproject-red.png"
                  alt=""
                  style={{
                    marginLeft: mark.left,
                    width: mark.width,
                    filter: mark.red ? undefined : "brightness(0)",
                  }}
                  className="block"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default About;
