import React, { useRef, useEffect, useState } from "react";
import StickyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTopButton from "../components/BackToTopButton";
import secondaryLogo from "../assets/Logo/secondary_logo.png";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetail } from "../api/Order/order";

export default function PaymentAwait() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const mainRef = useRef(null);
  const [mainHeight, setMainHeight] = useState(0);
  const [animatePage, setAnimatePage] = useState(false);

  // polling API tiap 5 detik sampai kondisi terpenuhi
  useEffect(() => {
    if (!id) return;

    let intervalId;

    const pollOrderDetails = async () => {
      try {
        const response = await getOrderDetail(id);
        const responseData = response.data.data;

        if (!responseData) {
          setError("Order tidak ditemukan");
          return;
        }

        setOrderData(responseData);

        // ✅ stop polling jika status sudah "PAID"
        if (responseData.oApprovalStatus === 2) {
          clearInterval(intervalId);
          setLoading(false);
          // opsional: redirect ke halaman sukses
          navigate(`/payment-success/${id}`);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Gagal memuat detail pesanan");
      } finally {
        setLoading(false);
      }
    };

    // panggil pertama kali
    pollOrderDetails();
    // set interval polling 5 detik
    intervalId = setInterval(pollOrderDetails, 5000);

    // cleanup interval saat unmount
    return () => clearInterval(intervalId);
  }, [id, navigate]);

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
          {/* Kanan: Logo, teks besar, teks kecil, spinner */}
          <div className="flex flex-col md:flex-row items-center md:items-start w-full md:w-1/2 gap-0 md:gap-6">
            {/* Logo kiri */}
            <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-start w-auto md:w-auto mb-2 md:mb-0 md:mr-0 mr-4">
              <img src={secondaryLogo} alt="Zumar Apparels" className="w-24 md:w-32 mb-0 md:mb-4" />
            </div>
            {/* Teks kanan logo */}
            <div className="flex flex-col items-center md:items-start w-full text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold text-secondaryColor leading-tight mb-2 font-poppins w-full">
                Mohon<br />Tunggu<br />Sebentar
              </h1>
              <p className="text-gray-400 text-xs md:text-sm max-w-xs mb-4 w-full font-montserrat">
                Lorem ipsum dolor sit amet consectetur. Non sed commodo sed fermentum aliquam vulputate volutpat tortor hac.
              </p>
              {/* Spinner */}
              <div className="flex justify-center w-full mt-2">
                <span className="inline-block w-8 h-8 border-4 border-secondaryColor border-t-transparent rounded-full animate-spin"></span>
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
