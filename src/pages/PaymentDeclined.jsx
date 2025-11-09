import React, { useRef, useEffect, useState } from "react";
import StickyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTopButton from "../components/BackToTopButton";
import secondaryLogo from "../assets/Logo/secondary_logo.png";

export default function PaymentDeclined() {
  const mainRef = useRef(null);
  const [mainHeight, setMainHeight] = useState(0);
  const [animatePage, setAnimatePage] = useState(false);

  useEffect(() => {
    if (mainRef.current) {
      setMainHeight(mainRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (mainRef.current) {
        setMainHeight(mainRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  return (
    <>
    <StickyNavbar />
    <div className="relative min-h-screen flex flex-col bg-gray-100 overflow-x-hidden">
      <main ref={mainRef} className={`flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-8 pb-32 md:pb-40 mb-16 transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
        {/* Segitiga oranye kiri bawah */}
        <div
          className="hidden md:block absolute left-0 bottom-0 z-0 pointer-events-none"
          style={{ height: mainHeight ? Math.min(mainHeight, 340) : 340, width: '25vw', maxWidth: 340, transform: 'translateY(40px)' }}
        >
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <polygon points="0,0 600,600 0,600" fill="#245156" />
          </svg>
        </div>
        {/* Segitiga hijau kanan bawah */}
        <div
          className="hidden md:block absolute right-0 bottom-0 z-0 pointer-events-none"
          style={{ height: mainHeight ? Math.min(mainHeight, 340) : 340, width: '25vw', maxWidth: 340, transform: 'translateY(40px)' }}
        >
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <polygon points="600,0 600,600 0,600" fill="#E26C02" />
          </svg>
        </div>
        <div className={`w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-8 md:gap-12 relative z-10 transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Kiri: Orang duduk dan kursi */}
          <div className="flex items-center justify-center md:justify-start md:w-1/2 w-full mb-6 md:mb-0">
            <img
              src="https://media.gettyimages.com/id/500912018/photo/three-people-waiting-for-the-subway-sitting-on-a-bench-135-st-station-new-york-usa.jpg?s=1024x1024&w=gi&k=20&c=PL-_O1gW2rFCziPmpe9Pw8wRKyIPWleKeyEubcbKB60="
              alt="People waiting on a long bench"
              className="w-full max-w-md h-40 md:h-64 object-cover rounded-3xl shadow-xl border border-gray-200"
            />
          </div>
          {/* Kanan: Logo, teks, dan alasan penolakan */}
          <div className="flex flex-col md:w-1/2 w-full">
            {/* Logo dan teks dalam satu baris */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
              {/* Logo kiri */}
              <div className="flex-shrink-0">
                <img src={secondaryLogo} alt="Zumar Apparels" className="w-24 md:w-32" />
              </div>
              {/* Teks kanan */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-extrabold text-red-600 leading-tight mb-2 font-poppins">
                  Produk Tidak Disetujui
                </h1>
                <p className="text-gray-400 text-xs md:text-sm max-w-xs font-montserrat">
                  Mohon maaf, produk yang Anda ajukan belum dapat kami proses.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* BackToTopButton di kanan bawah */}
        <BackToTopButton />
      </main>
    </div>
    <Footer />
    </>
  );
}
