import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getOrderDetail,
  getOrderItemSizes,
  getOrderProgressMain,
} from "../../../api/Order/order";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const ProgressBarStatus = ({ percent }) => {
  return (
    <div className="flex items-center gap-2 w-full my-6">
      {/* Progress Bar */}
      <div className="flex items-center w-full bg-gray-100 rounded-full overflow-hidden h-8">
        {/* Percent Bubble */}
        {percent === 0 && (
          <div className="text-primaryColor w-full text-center font-bold text-sm">
            0%
          </div>
        )}
        {percent > 0 && (
          <div
            className="flex items-center justify-center bg-teal-800 text-white font-bold text-sm rounded-full py-2"
            style={{ width: `${percent}%` }}
          >
            {percent}%
          </div>
        )}
      </div>

      {/* Status Label */}
      <span
        className={`${percent < 100 ? "bg-orange-600" : "bg-green-600"} text-white font-semibold text-sm px-6 py-2 rounded-full whitespace-nowrap`}
      >
        {percent < 100 ? "On Progress" : "Done"}
      </span>
    </div>
  );
};

const ProgressCard = ({ title, percent }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-green-400 pb-2">
        <h2 className="font-bold text-primaryColor">{title}</h2>
        <span className="text-[#4AD991] font-semibold">{percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden">
        <div className="h-full bg-[#4AD991]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { oId } = useParams();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderProgress, setOrderProgress] = useState([]);
  
  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!oId) return;

      setLoading(true);
      setError("");

      try {
        // Fetch 3 APIs in parallel
        const [detailRes, itemsRes, progressRes] = await Promise.all([
          getOrderDetail(oId),
          getOrderItemSizes(oId),
          getOrderProgressMain(oId).catch((err) => {
            console.log("Order Progress API Error:", err);
            return { data: { data: [] } };
          }), // Optional API
        ]);

        console.log("Order Detail Response:", detailRes);
        console.log("Order Items Response:", itemsRes);
        console.log("Order Progress Main Response:", progressRes);

        // Set order basic data
        if (detailRes.data && detailRes.data.data) {
          setOrderData(detailRes.data.data);
        }

        // Set order items data
        if (itemsRes.data && itemsRes.data.data) {
          const itemsData = Array.isArray(itemsRes.data.data.listData)
            ? itemsRes.data.data.listData
            : itemsRes.data.data;
          setOrderItems(Array.isArray(itemsData) ? itemsData : []);
        }

        // Set order progress data (optional)
        if (progressRes.data && progressRes.data.data) {
          const progressData = Array.isArray(progressRes.data.data.listData)
            ? progressRes.data.data.listData
            : progressRes.data.data;
          setOrderProgress(Array.isArray(progressData) ? progressData : []);
        }
      } catch (err) {
        console.error("Error fetching order data:", err);
        setError("Gagal memuat data detail pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [oId]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Lightbox functions
  const openLightbox = (images, index = 0) => {
    const lightboxSlides = images.map((image, idx) => ({
      src: image,
      title: `Mockup Image ${idx + 1}`,
      alt: `Mockup ${idx + 1}`,
    }));
    setLightboxImages(lightboxSlides);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const getApprovalStatusText = (status) => {
    switch (status) {
      case 1:
        return "Menunggu Konfirmasi";
      case 2:
        return "Order Dibuat";
      case 3:
        return "Order Selesai";
      case 4:
        return "Order ditolak";
      default:
        return "Unknown";
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 1:
        return "text-yellow-600 bg-yellow-100";
      case 2:
        return "text-green-600 bg-green-100";
      case 3:
        return "text-green-600 bg-green-100";
      case 4:
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case 1:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
      case 2:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
      case 3:
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
      case 4:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 1:
        return "Belum Dibayar";
      case 2:
        return "Bayar Down Payment";
      case 3:
        return "Dibayar Lunas";
      default:
        return "Unknown";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 1:
        return "text-red-600 bg-red-100";
      case 2:
        return "text-orange-600 bg-orange-100";
      case 3:
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div className="flex-1 overflow-x-hidden">
          <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
              <p className="text-primaryColor font-semibold">
                Memuat detail pesanan...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div className="flex-1 overflow-x-hidden">
          <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-semibold">{error}</p>
              <button
                onClick={() => navigate("/admin/order/list")}
                className="mt-4 px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90"
              >
                Kembali ke Daftar Pesanan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "1000px auto",
        backgroundPosition: "center",
        opacity: 1,
      }}
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex-1 overflow-x-hidden">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/order/list")}
              className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primaryColor">
                Detail Pesanan
              </h1>
              <p className="text-gray-500">
                {orderData?.oPoNumber
                  ? `No. PO: ${orderData.oPoNumber}`
                  : `Order ID: ${oId}`}
              </p>
            </div>
          </div>

          {/* Order Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Informasi Pemesan
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nama Pemesan</p>
                    <p className="font-semibold">{orderData?.oName || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-semibold">{orderData?.oPhone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="font-semibold">
                      {orderData?.oAddress || "-"}
                    </p>
                  </div>
                </div>
                {orderData?.oNotes && (
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Catatan</p>
                      <p className="font-semibold">{orderData.oNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6" />
                Status Pesanan
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-semibold">
                      {formatDate(orderData?.oDeadlineAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getApprovalStatusIcon(orderData?.oApprovalStatus)}
                  <div>
                    <p className="text-sm text-gray-500">Status Approval</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(orderData?.oApprovalStatus)}`}
                    >
                      {getApprovalStatusText(orderData?.oApprovalStatus)}
                    </span>
                  </div>
                </div>
                {orderData.oApprovalNotes && (
                  <div className="flex items-center gap-3">
                    {getApprovalStatusIcon(orderData?.oApprovalStatus)}
                    <div>
                      <p className="text-sm text-gray-500">Alasan Ditolak</p>
                      <p className="font-bold text-lg text-primaryColor">
                        {orderData.oApprovalNotes}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Status Pembayaran</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(orderData?.oStatusPayment)}`}
                    >
                      {getPaymentStatusText(orderData?.oStatusPayment)}
                    </span>
                  </div>
                </div>
                {orderData.ocbpsItem?.ocbpsTotalOff && (
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Harga</p>
                      <p className="font-bold text-lg text-primaryColor">
                        {formatCurrency(orderData.ocbpsItem?.ocbpsTotalOff)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-primaryColor mb-4">
              Item Pesanan
            </h2>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada data item pesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderData.oItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Item #{index + 1}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">
                              Nama Katalog Produk:
                            </span>{" "}
                            {item.cpName || "-"}
                          </p>
                          <p>
                            <span className="font-medium">
                              Inventory Subcategory:
                            </span>{" "}
                            {item.isName || "-"}
                          </p>

                          {item.sName && (
                            <p>
                              <span className="font-medium">Ukuran:</span>{" "}
                              {item.sName}
                            </p>
                          )}
                          {item.oisAmount && (
                            <p>
                              <span className="font-medium">Jumlah:</span>{" "}
                              {item.oisAmount} pcs
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {item.oiSizes.map((item) => (
                            <div
                              key={item.oisId}
                              className={`flex w-full h-12 rounded border text-xs font-semibold overflow-hidden border-primaryColor relative`}
                            >
                              <span
                                className={`flex items-center justify-center h-full bg-primaryColor text-white w-[40%] font-montserrat font-bold text-sm`}
                              >
                                {item.sName}
                              </span>
                              <input
                                type="number"
                                min="0"
                                className="flex items-center justify-center w-[60%] h-full bg-gray-100 text-primaryColor text-center outline-none border-0 appearance-none font-montserrat font-normal text-sm"
                                style={{ MozAppearance: "textfield" }}
                                value={item.oisAmount}
                                onWheel={(e) => e.currentTarget.blur()}
                                readOnly
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mockup Images */}
                      {item.oiMockupImage && item.oiMockupImage.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Mockup Images</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.oiMockupImage.map((image, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() => openLightbox(item.oiMockupImage, imgIndex)}
                                className="w-16 h-16 object-cover rounded border border-gray-200 hover:border-primaryColor hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              >
                                <img
                                  src={image}
                                  alt={`Mockup ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-primaryColor mb-4">
              Progress Pesanan
            </h2>
            <ProgressBarStatus percent={orderData.oProgress} />
            {orderProgress.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada data progress pesanan</p>
                <p className="text-xs mt-1">
                  API: /api/order-progress/detail?opId={oId}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {orderProgress.map((item, index) => (
                  <ProgressCard
                    key={index}
                    title={item.opmName}
                    percent={item.opmProgress}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox component */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={lightboxImages}
        plugins={[Fullscreen, Zoom]}
        index={lightboxIndex}
      />
    </div>
  );
};

export default OrderDetail;
