import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, Draggable);

const images = [
  "https://assets.codepen.io/16327/portrait-number-01.png",
  "https://assets.codepen.io/16327/portrait-number-02.png",
  "https://assets.codepen.io/16327/portrait-number-03.png",
  "https://assets.codepen.io/16327/portrait-number-04.png",
  "https://assets.codepen.io/16327/portrait-number-05.png",
  "https://assets.codepen.io/16327/portrait-number-06.png",
  "https://assets.codepen.io/16327/portrait-number-07.png",
];

export default function InfiniteCardGallery() {
  const galleryRef = useRef(null);

  useEffect(() => {
    const cards = gsap.utils.toArray(".gallery-card");

    gsap.set(cards, {
      xPercent: 400,
      opacity: 0,
      scale: 0,
    });

    let iteration = 0;
    const spacing = 0.1;
    const snapTime = gsap.utils.snap(spacing);

    const animateFunc = (element) => {
      const tl = gsap.timeline();

      tl.fromTo(
        element,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          zIndex: 100,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power1.in",
          immediateRender: false,
        }
      ).fromTo(
        element,
        { xPercent: 400 },
        {
          xPercent: -400,
          duration: 1,
          ease: "none",
          immediateRender: false,
        },
        0
      );

      return tl;
    };

    function buildSeamlessLoop(items, spacing, animateFunc) {
      let overlap = Math.ceil(1 / spacing),
        startTime = items.length * spacing + 0.5,
        loopTime = (items.length + overlap) * spacing + 1,
        rawSequence = gsap.timeline({ paused: true }),
        seamlessLoop = gsap.timeline({
          paused: true,
          repeat: -1,
        }),
        l = items.length + overlap * 2;

      for (let i = 0; i < l; i++) {
        let index = i % items.length;
        let time = i * spacing;
        rawSequence.add(animateFunc(items[index]), time);
      }

      rawSequence.time(startTime);

      seamlessLoop
        .to(rawSequence, {
          time: loopTime,
          duration: loopTime - startTime,
          ease: "none",
        })
        .fromTo(
          rawSequence,
          { time: overlap * spacing + 1 },
          {
            time: startTime,
            duration: startTime - (overlap * spacing + 1),
            ease: "none",
            immediateRender: false,
          }
        );

      return seamlessLoop;
    }

    const seamlessLoop = buildSeamlessLoop(
      cards,
      spacing,
      animateFunc
    );

    const playhead = { offset: 0 };

    const wrapTime = gsap.utils.wrap(
      0,
      seamlessLoop.duration()
    );

    const scrub = gsap.to(playhead, {
      offset: 0,
      duration: 0.5,
      ease: "power3",
      paused: true,
      onUpdate: () => {
        seamlessLoop.time(wrapTime(playhead.offset));
      },
    });

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "+=3000",
      pin: galleryRef.current,
      onUpdate(self) {
        let scroll = self.scroll();

        if (scroll > self.end - 1) {
          iteration++;
          self.scroll(2);
        } else if (scroll < 1 && self.direction < 0) {
          iteration--;
          self.scroll(self.end - 2);
        } else {
          scrub.vars.offset =
            (iteration + self.progress) *
            seamlessLoop.duration();

          scrub.invalidate().restart();
        }
      },
    });

    const progressToScroll = (progress) =>
      gsap.utils.clamp(
        1,
        trigger.end - 1,
        gsap.utils.wrap(0, 1, progress) * trigger.end
      );

    const scrollToOffset = (offset) => {
      let snappedTime = snapTime(offset);

      let progress =
        (snappedTime -
          seamlessLoop.duration() * iteration) /
        seamlessLoop.duration();

      let scroll = progressToScroll(progress);

      trigger.scroll(scroll);
    };

    document
      .querySelector(".gallery-next")
      ?.addEventListener("click", () =>
        scrollToOffset(scrub.vars.offset + spacing)
      );

    document
      .querySelector(".gallery-prev")
      ?.addEventListener("click", () =>
        scrollToOffset(scrub.vars.offset - spacing)
      );

    Draggable.create(".drag-proxy", {
      type: "x",
      trigger: ".cards",
      onPress() {
        this.startOffset = scrub.vars.offset;
      },
      onDrag() {
        scrub.vars.offset =
          this.startOffset +
          (this.startX - this.x) * 0.001;

        scrub.invalidate().restart();
      },
      onDragEnd() {
        scrollToOffset(scrub.vars.offset);
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={galleryRef}
      className="relative h-screen overflow-hidden bg-black"
    >
      <ul className="cards absolute left-1/2 top-[40%] h-[18rem] w-[14rem] -translate-x-1/2 -translate-y-1/2">
        {[...images, ...images].map((img, index) => (
          <li
            key={index}
            className="gallery-card absolute left-0 top-0 w-[14rem] rounded-xl bg-contain bg-no-repeat"
            style={{
              backgroundImage: `url(${img})`,
              aspectRatio: "9/16",
            }}
          />
        ))}
      </ul>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
        <button className="gallery-prev rounded bg-white px-5 py-2">
          Prev
        </button>

        <button className="gallery-next rounded bg-white px-5 py-2">
          Next
        </button>
      </div>

      <div className="drag-proxy invisible absolute" />
    </div>
  );
}