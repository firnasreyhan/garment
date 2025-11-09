import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { ZoomableImage } from "./zoomable-image";

export function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  console.log(images);

  const handleImageChange = (index: number) => {
    setDirection(index > activeImage ? 1 : -1);
    setActiveImage(index);
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 120; // px per click (bisa disesuaikan)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="flex gap-4 flex-col xs:flex-row-reverse">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 flex-grow">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeImage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 z-0 flex h-full w-full items-center justify-center overflow-hidden"
            >
              {images[activeImage] ? (
                <ZoomableImage
                  alt={images[activeImage].alt}
                  src={images[activeImage].src}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-center text-sm text-gray-500">
                    No image available
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <button
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 p-2 text-black shadow-lg transition-all duration-300 hover:bg-white/80 hover:shadow-xl"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Search />
            <span className="sr-only">Open fullscreen</span>
          </button>
        </div>
       <div className="relative flex items-center">
          {/* Chevron kiri */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white transition"
          >
            <ChevronLeft size={18} />
          </button>

          {/* 🔹 Container dengan fixed width */}
          <div
            className={
              images.length < 4
                ? "flex xs:flex-col justify-center gap-4 overflow-x-auto pb-2 w-[calc(5*5rem+4*1rem)] scrollbar-hide scroll-smooth"
                : "flex xs:flex-col gap-4 overflow-x-auto pb-2 w-[calc(5*5rem+4*1rem)] scrollbar-hide scroll-smooth"
            }
            ref={scrollRef}
          >
            <div className="flex flex-row gap-4 w-max">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative aspect-square h-20 md:h-[100px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 transition-opacity duration-300 ${
                    activeImage === index
                      ? "opacity-100"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  onClick={() => handleImageChange(index)}
                  onFocus={() => handleImageChange(index)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="object-cover h-full w-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Chevron kanan */}
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={images.map((img) => ({ src: img.src, title: img.alt }))}
        plugins={[Fullscreen, Zoom]}
        index={activeImage}
      />
    </>
  );
}
