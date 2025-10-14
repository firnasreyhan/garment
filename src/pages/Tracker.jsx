import { useEffect, useState } from 'react';
import { getOrders } from '../api/Order/order';
import Footer from '../components/Footer';
import StickyNavbar from '../components/Navbar';
import OrderDetail from '../components/order-detail';
import BackgroundImage from '../assets/background/bg-zumar.png';

const Tracker = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  function isValidOrderNumber(orderNumber) {
    if(!orderNumber) {
      return false;
    }
    // Format: ZGI + 6 digit tanggal + 4 digit urut
    const regex = /^ZGI\d{6}\d{4}$/;
    return regex.test(orderNumber);
  }

  const fetchOrderDetails = async (orderNumber) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getOrders({
        search: orderNumber,
        pageLimit: 1,
        pageNumber: 1,
      })

      const responseData = response.data.data.listData;


      if (responseData.length > 0) {
        setOrderDetails(responseData[0]);
        setError('');
      } else {
        setError('Order Number not found. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = () => {
    if (!isValidOrderNumber(orderNumber)) {
      setError('Please enter a valid order number.');
      setOrderDetails(null);
      return;
    }
    fetchOrderDetails(orderNumber);
  };

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{
      backgroundImage: `url(${BackgroundImage})`,
      backgroundRepeat: 'repeat',
      backgroundSize: '1000px auto',
      backgroundPosition: 'center',
    }}
    >
      <StickyNavbar />
      <main className={`flex-grow flex flex-col items-center justify-center p-4 transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'} py-[120px]`}>
        <div className="w-full max-w-2xl text-center mb-8">
          <h1 className="text-2xl text-primaryColor font-montserrat mb-4">
            Please insert your Order Number
          </h1>
          <div className="flex w-full max-w-md mx-auto shadow-md rounded-[20px] overflow-hidden">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="12345678910AB"
              className="w-full px-6 py-3 text-gray-700 focus:outline-none font-montserrat text-sm text-center bg-[#F5F5F5]r"
            />
            <button
              onClick={handleSearch}
              className="bg-primaryColor text-white font-semibold px-8 py-3 hover:bg-secondaryColor transition-colors"
            >
              Search
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {!isLoading && orderDetails && <OrderDetail order={orderDetails} />}
      </main>
      <Footer />
    </div>
  );
};

export default Tracker;
