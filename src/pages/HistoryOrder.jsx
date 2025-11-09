import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/Order/order';
import secondaryLogoWhite from '../assets/Logo/secondary_logo_white.png';
import StickyNavbar from '../components/Navbar';

export default function HistoryOrder() {
  const [leftSectionStyle, setLeftSectionStyle] = useState({ position: 'fixed', top: 80 });
  const footerRef = useRef(null);
  const leftSectionRef = useRef(null);
  const [animatePage, setAnimatePage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare filter parameters
      const filterParams = {
        pageLimit: ordersPerPage,
        pageNumber: currentPage
      };

      const res = await getOrders(filterParams);
      const list = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      setOrders(list);
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      setTotalPages(Math.max(1, pagination.pageLast || 1));
    } catch {
      setOrders([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, [currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    function handleScroll() {
      if (!footerRef.current || !leftSectionRef.current) return;
      const leftSectionHeight = leftSectionRef.current.offsetHeight;
      const leftSectionTop = leftSectionRef.current.offsetTop;
      const footerTop = footerRef.current.getBoundingClientRect().top + window.scrollY;
      const leftSectionBottom = window.scrollY + leftSectionTop + leftSectionHeight;
      if (leftSectionBottom >= footerTop) {
        setLeftSectionStyle({
          position: 'absolute',
          top: footerTop - leftSectionHeight - leftSectionTop,
        });
      } else {
        setLeftSectionStyle({ position: 'fixed', top: 80 });
      }
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);
  // Calculate pagination


  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'bg-yellow-700';
      case 2:
        return 'bg-blue-700';
      case 3:
        return 'bg-[#245156]';
      case 4:
        return 'bg-red-700';
      default:
        return 'bg-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Menunggu Konfirmasi';
      case 2:
        return 'Order Dibuat';
      case 3:
        return 'Order Selesai';
      case 4:
        return 'Order Ditolak';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <StickyNavbar />
      <div className={`flex flex-row items-start mb-16 bg-white min-h-screen relative transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left Section */}
        <div
          id="left-section"
          ref={leftSectionRef}
          style={{
            position: leftSectionStyle.position,
            top: leftSectionStyle.top,
            left: 0,
            height: leftSectionStyle.position === 'absolute' ? 'calc(100% - 5rem)' : leftSectionStyle.position === 'fixed' ? 'calc(100vh - 5rem)' : 'auto',
            width: '50%',
            zIndex: 10,
            transition: 'top 0.3s, position 0.3s',
            backgroundImage: 'url(https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={
            'hidden md:flex flex-row items-start rounded-tr-[30px] rounded-br-[30px] px-12 pt-10 relative ' +
            (leftSectionStyle.position === 'fixed' ? ' h-[calc(100vh-5rem)]' : '')
          }
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 rounded-tr-[30px] rounded-br-[30px] z-0" />
          {/* Konten teks di atas overlay */}
          <div className="relative z-10 flex flex-row items-start w-full">
            <img src={secondaryLogoWhite} alt="Zumar Logo" className="w-56 max-w-[220px] flex-shrink-0 mr-10" />
            <div className="flex flex-col justify-center">
              <h1 className="text-white text-5xl font-bold font-poppins leading-[1.1] mb-6 text-left">Riwayat<br />Pesanan<br />Kamu</h1>
              <p className="text-[#D9D9D9] text-base max-w-md font-montserrat text-left">Lihat dan lacak semua pesanan yang pernah kamu buat di sini. Kamu bisa cek status, detail, dan histori pemesananmu.</p>
            </div>
          </div>
        </div>
        {/* Right Section */}
        <div className="flex-1 flex flex-col items-center py-10 px-4 md:px-16 md:ml-[50%]">
          {loading ? <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div> : <div className={`w-full max-w-xl transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {orders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} formatDate={formatDate} getStatusColor={getStatusColor} getStatusText={getStatusText} />
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </div>}
        </div>
      </div>
    </>
  );
}

function Pagination({ setCurrentPage, currentPage, totalPages }) {
  return <div className="flex justify-center mt-8 gap-2 font-montserrat">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded border text-primaryColor border-primaryColor disabled:opacity-50"
    >
      Prev
    </button>
    {[...Array(totalPages)].map((_, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentPage(idx + 1)}
        className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-primaryColor text-white border-primaryColor' : 'text-primaryColor border-primaryColor'}`}
      >
        {idx + 1}
      </button>
    ))}
    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded border text-primaryColor border-primaryColor disabled:opacity-50"
    >
      Next
    </button>
  </div>;
}

function OrderHistoryCard({ order, formatDate, getStatusColor, getStatusText }) {
  const formatPrice  = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return <div key={order.id} className="rounded-[40px] shadow-lg px-12 py-8 mb-6 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
      <div className="col-span-2">
        <div className="grid grid-cols-2 gap-7 font-poppins">

          <div>
            <p className="text-xs text-primaryColor">ORDER NUMBER</p>
            <p className="text-sm font-medium text-gray-800 pl-2 mt-1">{order.oNumber || '-'}</p>
            <hr className="border-primaryColor mt-1" />
          </div>
          <div>
            <p className="text-xs text-[#E26C02]">ATAS NAMA</p>
            <p className="text-sm font-medium text-[#E26C02] pl-2 mt-1">{order.oName || '-'}</p>
            <hr className="border-[#E26C02]  mt-1" />
          </div>
          <div>
            <p className="text-xs text-primaryColor">PO NUMBER</p>
            <p className="text-sm font-medium text-gray-800 pl-2 mt-1">{order.oPoNumber || '-'}</p>
            <hr className="border-primaryColor mt-1" />
          </div>
          <div>
            <p className="text-xs text-[#E26C02]">HARGA PESANAN</p>
            <p className="text-sm font-medium text-[#E26C02] pl-2 mt-1">{formatPrice(order.ocbpsItem.ocbpsTotalOff ?? 0)}</p>
            <hr className="border-[#E26C02]  mt-1" />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start md:justify-center items-center mt-4 md:mt-0 gap-3">
        <Link to={`/history-order/${order.oId}`} className="bg-[#389587] text-white text-sm font-bold rounded-[20px] py-[15px] px-[48px] w-[141px] shadow-md hover:bg-primaryColor transition-colors font-montserrat tracking-wide">
          Detail
        </Link >
        <div className={` text-white text-sm font-bold rounded-[20px] w-[141px] py-[15px] shadow-md transition-colors font-montserrat tracking-wide text-center ${getStatusColor(order.oApprovalStatus)}`}>
          {getStatusText(order.oApprovalStatus)}
        </div>

        <p className="text-xs font-medium text-gray-800 font-poppins">{formatDate(order.oCreatedAt)}</p>

      </div>
    </div>
  </div>;
}
