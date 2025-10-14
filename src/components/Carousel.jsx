import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

export default function Carousel({ slides, rightContent, navigationPosition = "content", autoPlay = true, autoPlayInterval = 4000, height = "h-[90vh]" }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % slides.length), [slides.length]);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrent(index);

  // Autoplay effect
  useEffect(() => {
    if (!autoPlay) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearTimeout(timeoutRef.current);
  }, [current, autoPlay, autoPlayInterval, slides.length, nextSlide]);

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      <div
        className="flex transition-transform duration-700 ease-in-out h-full will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 bg-cover bg-center flex items-center relative"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="max-w-7xl w-full mx-auto px-10 md:px-20 flex items-center h-full relative z-10">
              {/* Kiri: Teks */}
              <div className="w-full md:w-1/2 text-white space-y-5 relative">
                <h2 className="text-2xl md:text-5xl font-semibold font-poppins whitespace-pre-line leading-tight">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-base max-w-md text-white font-montserrat font-light">
                  {slide.description}
                </p>
                {slide.cta && (
                  <button className="mt-4 font-montserrat text-sm inline-block px-6 py-3 bg-primaryColor hover:bg-secondaryColor text-white rounded-full shadow-lg md:font-semibold">
                    {slide.cta}
                  </button>
                )}
                {/* Bullet navigation di bawah CTA jika navigationPosition !== 'center' */}
                {navigationPosition !== "center" && (
                  <div className="flex gap-3 mt-8">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={clsx(
                          "h-[4px] rounded-full transition-all duration-300",
                          current === i ? "w-6 bg-secondaryColor" : "w-3 bg-white/70"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Kanan: Custom Content */}
              {rightContent && (
                <div className="hidden md:flex flex-col items-center justify-center w-1/2 h-full">
                  {rightContent(slide, idx)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-gray-800 shadow md:left-4"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-gray-800 shadow md:right-4"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Bullet navigation di tengah bawah jika navigationPosition === 'center' */}
      {navigationPosition === "center" && (
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-3 bottom-[3rem]">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={clsx(
                "h-[4px] rounded-full transition-all duration-300",
                current === i ? "w-6 bg-secondaryColor" : "w-3 bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
