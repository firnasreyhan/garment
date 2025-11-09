import React, { useRef, useEffect, useState } from "react";
import StickyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTopButton from "../components/BackToTopButton";
import { useParams } from "react-router-dom";
import { getOrderDetail } from "../api/Order/order";

// Dummy QR code image
const qrImage =
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ContohQR";

export default function PaymentSuccess() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const mainRef = useRef(null);
  const [mainHeight, setMainHeight] = useState(0);
  const [animatePage, setAnimatePage] = useState(false);

  // --- Fetch API ---
  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const response = await getOrderDetail(orderId);
      const responseData = response.data.data;
      if (!responseData) {
        setError("Order tidak ditemukan");
        return;
      }
      setOrderData(responseData);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

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

  const formatPrice  = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <StickyNavbar />
      <div className="relative min-h-screen flex flex-col bg-gray-100 overflow-x-hidden">
        <main
          ref={mainRef}
          className={`flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-8 pb-32 md:pb-40 mb-16 transition-opacity duration-700 ${
            animatePage ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Segitiga dekorasi */}
          <div
            className="hidden md:block absolute left-0 bottom-0 z-0 pointer-events-none"
            style={{
              height: mainHeight ? Math.min(mainHeight, 340) : 340,
              width: "25vw",
              maxWidth: 340,
              transform: "translateY(40px)",
            }}
          >
            <svg viewBox="0 0 600 600" className="w-full h-full">
              <polygon points="0,0 600,600 0,600" fill="#245156" />
            </svg>
          </div>
          <div
            className="hidden md:block absolute right-0 bottom-0 z-0 pointer-events-none"
            style={{
              height: mainHeight ? Math.min(mainHeight, 340) : 340,
              width: "25vw",
              maxWidth: 340,
              transform: "translateY(40px)",
            }}
          >
            <svg viewBox="0 0 600 600" className="w-full h-full">
              <polygon points="600,0 600,600 0,600" fill="#E26C02" />
            </svg>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-primaryColor rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-red-500 font-semibold">{error}</div>
          )}

          {/* Content */}
          {!loading && !error && orderData && (
            <div className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-start justify-center md:justify-between gap-8 md:gap-0 relative z-10">
              {/* Kiri */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pl-16 md:pl-48">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primaryColor leading-tight mb-6 font-poppins">
                  Order<br />Payment<br />Gateway
                </h1>
                <p className="text-black font-montserrat text-sm md:text-base max-w-xs mb-4">
                  Lorem ipsum dolor sit amet consectetur. Non sed commodo sed
                  fermentum aliquam vulputate volutpat tortor hac.
                </p>
              </div>

              {/* Kanan */}
              <div className="flex-1 flex font-montserrat justify-end w-full md:pr-8">
                <div
                  className={`bg-gray-200 rounded-3xl shadow-2xl p-6 md:p-12 w-full flex flex-col items-center relative transition-all duration-700 ${
                    animatePage
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  {/* Badge */}
                  <div className="w-full flex justify-center mb-8">
                    <span className="bg-secondaryColor text-white text-sm font-semibold rounded-full px-6 py-2 shadow">
                      Approved: {orderData.status || "Waiting for Payment"}
                    </span>
                  </div>

                  {/* Grid info */}
                  <div className="w-full flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full">
                      <div className="mb-4">
                        <div className="text-xs text-primaryColor font-semibold mb-1">
                          ORDER NUMBER
                        </div>
                        <div className="text-base text-primaryColor mb-1">
                          {orderData.oNumber || "-"}
                        </div>
                        <div className="border-b border-primaryColor w-full" />
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-primaryColor font-semibold mb-1">
                          TOTAL
                        </div>
                        <div className="text-lg text-primaryColor font-bold mb-1">
                          {formatPrice(orderData.ocbpsItem.ocbpsTotalOff ?? 0)}
                        </div>
                        <div className="border-b-2 border-primaryColor w-full" />
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-secondaryColor font-semibold mb-1">
                          DOWN PAYMENT
                        </div>
                        <div className="text-lg text-secondaryColor font-bold mb-1">
                          {formatPrice(orderData.oDownPayment ?? 0)}
                        </div>
                        <div className="border-b-2 border-secondaryColor w-full" />
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center w-full md:w-64">
                      <div className="bg-gray-200 border border-gray-200 rounded-lg p-2 w-full flex flex-col items-center">
                        <img
                          src={qrImage}
                          alt="QR Code"
                          className="w-40 h-40 object-contain mx-auto"
                        />
                        <div className="text-xs text-gray-700 font-semibold mt-2 text-center">
                          PROSPEK MITRA ABADI
                          <br />
                          NMID : ID2042316474447
                        </div>
                        <div className="text-xs text-gray-700 mt-1 text-center">
                          SATU QRIS UNTUK SEMUA
                          <br />
                          Cek aplikasi pembayaran anda
                        </div>
                        <div className="text-[10px] text-gray-700 mt-1 text-center">
                          Diterima oleh: 890805054
                          <br />
                          Versi QRIS : 1.0.2-2020
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <BackToTopButton />
        </main>
      </div>
      <Footer />
    </>
  );
}
