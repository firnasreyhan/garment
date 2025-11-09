import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetail } from "../api/Order/order";
import StickyNavbar from "../components/Navbar";
import OrderDetail from "../components/order-detail";
import BackgroundImage from '../assets/background/bg-zumar.png';

export default function OrderHistoryDetail() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();


  const fetchOrderDetails = async (orderId) => {
    setLoading(true);

    if (!orderId) {
      setError('ID order tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      const response = await getOrderDetail(orderId);
      const responseData = response.data.data;
      if (!responseData) {
        setError('Order tidak ditemukan');
        setLoading(false);
        return;
      }

      setOrderData(responseData);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchOrderDetails(id);
  }, [id]);



  return (
    <>
      <StickyNavbar />
      <div
        className="flex min-h-screen w-full justify-center py-[120px]"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '1000px auto',
          backgroundPosition: 'center',
          opacity: 1
        }}
      >
        {loading ? <div className="flex items-center justify-center">
          <div className="text-lg text-gray-500">Memuat detail pesanan...</div>
        </div> : (error || !orderData) ? (<div className="text-center">
          <div className="text-xl text-red-500 font-semibold mb-2">Error</div>
          <div className="text-gray-500">{error || 'Produk tidak ditemukan'}</div>
          <button
            onClick={() => navigate("/history-order")}
            className="mt-4 px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors"
          >
            Kembali ke Daftar Order History
          </button>
        </div>) : <OrderDetail order={orderData} />}
      </div>
    </>
  );
}
