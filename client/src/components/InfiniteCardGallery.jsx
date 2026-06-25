import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { Sparkles, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, Draggable);

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    quote: "The AI feedback helped me land my dream job at Google. The smart follow-ups are incredible.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1519085184946-7a597bbdf1f1?w=400&q=80",
    quote: "Most realistic mock interview I've ever experienced. It truly mimics a real technical screening.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Data Scientist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    quote: "Invaluable for overcoming interview anxiety. The real-time evaluation is a game changer.",
    rating: 4,
  },
  {
    name: "Mark Thompson",
    role: "Frontend Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    quote: "The adaptive difficulty pushed me out of my comfort zone. Highly recommended!",
    rating: 5,
  },
  {
    name: "Amara Okoro",
    role: "AI/ML Researcher",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    quote: "Cleanest UI and most natural AI voice interaction I've seen in the market.",
    rating: 5,
  },
];

export default function InfiniteCardGallery() {
  const containerRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".gallery-card");
      
      // Horizontal Loop Logic
      function horizontalLoop(items, config) {
        items = gsap.utils.toArray(items);
        config = config || {};
        let tl = gsap.timeline({
            repeat: config.repeat,
            paused: config.paused,
            defaults: { ease: "none" },
            onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
          }),
          length = items.length,
          startX = items[0].offsetLeft,
          times = [],
          widths = [],
          xPercents = [],
          curIndex = 0,
          pixelsPerSecond = (config.speed || 1) * 100,
          snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1),
          totalWidth,
          curX,
          distanceToStart,
          distanceToLoop,
          item,
          i;
        
        gsap.set(items, {
          xPercent: (i, target) => {
            let x = (xPercents[i] = parseFloat(gsap.getProperty(target, "xPercent", "px")));
            return x;
          },
        });
        
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (item.offsetLeft / item.offsetWidth) * 100;
          xPercents[i] = curX;
          widths[i] = item.offsetWidth;
          totalWidth = items[length - 1].offsetLeft + (xPercents[length - 1] / 100) * widths[length - 1] - startX + items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0);
        }

        // Simplified loop logic for React
        const loopTl = gsap.to(items, {
          xPercent: "-=" + (100 * length),
          duration: length * 5,
          ease: "none",
          repeat: -1,
          modifiers: {
            xPercent: gsap.utils.unitize(gsap.utils.wrap(-100, (length - 1) * 100))
          }
        });

        return loopTl;
      }

      // We'll use a simpler version for robustness
      const totalWidth = cards.length * 400; // rough width
      
      const tl = gsap.to(cards, {
        x: `-=${totalWidth}`,
        duration: 30,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => {
            return parseFloat(x) % totalWidth;
          })
        }
      });

      // Scroll interaction
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          // Speed up on scroll
          gsap.to(tl, { timeScale: 1 + self.getVelocity() / 300, duration: 0.5 });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full py-32 overflow-hidden bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Trusted by <span className="text-green-600">50,000+</span> Professionals
        </h2>
        <p className="mt-4 text-gray-500 text-xl max-w-2xl mx-auto">
          See how our AI interviewer is helping candidates secure positions at world-class companies.
        </p>
      </div>

      <div className="flex gap-8 px-4" style={{ width: "fit-content" }}>
        {[...testimonials, ...testimonials].map((t, idx) => (
          <div
            key={idx}
            className="gallery-card w-[400px] flex-shrink-0 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative group transition-all duration-500 hover:border-green-300"
          >
            <div className="absolute top-6 right-8 text-gray-100 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles size={40} />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <img
                src={t.image}
                alt={t.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-100"
              />
              <div>
                <h4 className="font-bold text-gray-900">{t.name}</h4>
                <p className="text-sm text-green-600 font-medium">{t.role}</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed italic">
              "{t.quote}"
            </p>

            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Alumnus</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 flex justify-center">
        <button className="flex items-center gap-2 text-green-600 font-bold hover:gap-4 transition-all">
          Explore Success Stories <span>→</span>
        </button>
      </div>
    </div>
  );
}