import { format, startOfYear, endOfYear } from "date-fns";
import { useState, useEffect, useCallback, useRef } from "react";
import BackgroundImage from "../../../assets/background/bg-zumar.png";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import DateRangeFilterReport from "../../../components/date-range-filter-report";
import { generateOrderRecapReport } from "../../../utils/pdfGenerator";
import { getOrders } from "../../../api/Order/order";
import { ChevronDownIcon, PrinterIcon } from "@heroicons/react/24/solid";

const PAGE_LIMIT = 10;

function CustomDropdown({ label, options, value, onChange, placeholder, searchPlaceholder = 'Cari...', labelMinWidth = '70px', width = '150px', mdWidth = '160px', height = '38px' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center w-auto">
      <span className="px-4 py-2 bg-[#295B5B] text-white font-bold rounded-l-xl border border-[#295B5B] border-r-0 text-base flex items-center justify-center" style={{height:height, minWidth: labelMinWidth, lineHeight:height}}>{label}</span>
      <div className={`relative w-[${width}] md:w-[${mdWidth}]`}>
        <button
          ref={btnRef}
          type="button"
          className="appearance-none w-full px-3 py-2 border border-[#295B5B] border-l-0 bg-white text-[#BDBDBD] font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[38px] text-sm flex items-center justify-between"
          onClick={() => setOpen(o => !o)}
        >
          <span className={value ? 'text-black truncate' : 'text-[#BDBDBD]'}>
            {value ? selectedOption?.label : placeholder}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-[#BDBDBD] ml-2" />
        </button>
        {open && (
          <div ref={dropdownRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto focus:outline-none">
            <div className="p-2 sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none text-sm"
                autoFocus
              />
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-400 text-sm">Tidak ditemukan</div>
            )}
            {filteredOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-4 py-2 cursor-pointer ${
                  String(opt.value) === String(value) ? 'bg-secondaryColor/10 text-black' : 'text-black'
                } hover:bg-secondaryColor/20`}
                onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const OrderRecapReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  // Filter states
  const [selectedApproval, setSelectedApproval] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfYear(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfYear(new Date()), "yyyy-MM-dd"),
  });
  const [userHasSelectedDate, setUserHasSelectedDate] = useState(false);
  
  // Pagination states 
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [allFilteredOrders, setAllFilteredOrders] = useState([]); 

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
    }
  }, [totalPage]);
  
  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === 'approval') {
      setSelectedApproval(value);
    } else if (filterType === 'payment') {
      setSelectedPayment(value);
    }
    setPage(1);
  }, []);

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
    setUserHasSelectedDate(true);
    setPage(1);
  }, []);

  const fetchOrderData = useCallback(async () => {
    console.log('=== FETCH ORDER DATA CALLED ===');
    console.log('userHasSelectedDate:', userHasSelectedDate);
    console.log('dateRange:', dateRange);
    
    if (!userHasSelectedDate || !dateRange.startDate || !dateRange.endDate) {
      console.log('Not fetching - conditions not met');
      setOrders([]);
      setAllFilteredOrders([]);
      setLoading(false);
      return;
    }
    
    console.log('Proceeding with fetch...');

    setLoading(true);
    setError('');
    try {
      const params = { 
        pageLimit: 1000, // Fetch semua data
        pageNumber: 1
      };
      

      if (selectedApproval && selectedApproval !== '') {
        params.filterOApprovalStatus = selectedApproval;
      }
      
      const res = await getOrders(params);
      let ordersData = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      
      console.log('=== ORDER RECAP DEBUG ===');
      console.log('API Response:', res.data);
      console.log('Raw orders data length:', ordersData.length);
      console.log('Date range:', dateRange);
      console.log('Selected filters:', { selectedApproval, selectedPayment });
      
      // Filter by payment
      if (selectedPayment && selectedPayment !== '') {
        const beforePaymentFilter = ordersData.length;
        ordersData = ordersData.filter(order => 
          String(order.oPaymentStatus || order.oStatusPayment) === String(selectedPayment)
        );
        console.log(`Payment filtering: ${beforePaymentFilter} → ${ordersData.length} orders`);
      }
      
      // Filter by date
      console.log('Before date filtering - orders count:', ordersData.length);
      if (ordersData.length > 0) {
        console.log('Sample order oCreatedAt:', ordersData[0].oCreatedAt);
        console.log('Sample order fields:', Object.keys(ordersData[0]));
      }
      
      if (dateRange.startDate || dateRange.endDate) {
        const beforeFilter = ordersData.length;
        ordersData = ordersData.filter(order => {
          if (!order.oCreatedAt) {
            console.log('Order missing oCreatedAt:', order.oId);
            return false;
          }
          const orderDate = new Date(order.oCreatedAt);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          const isInRange = orderDate >= startDate && orderDate <= endDate;
          
          if (!isInRange) {
            console.log('Order outside date range:', {
              orderId: order.oId,
              orderDate: orderDate.toISOString(),
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            });
          }
          
          return isInRange;
        });
        console.log(`Date filtering: ${beforeFilter} → ${ordersData.length} orders`);
      }
      
      console.log('Final orders count after all filtering:', ordersData.length);
      

      setAllFilteredOrders(ordersData);
      
      // Calculate total pages
      const totalItems = ordersData.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_LIMIT));
      setTotalPage(totalPages);
      
      // Pagination
      const startIndex = (page - 1) * PAGE_LIMIT;
      const endIndex = startIndex + PAGE_LIMIT;
      const paginatedOrders = ordersData.slice(startIndex, endIndex);
      
      console.log(`Frontend pagination: Page ${page}/${totalPages}, showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems}`);
      
      setOrders(paginatedOrders);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Gagal memuat data pesanan');
    }
    setLoading(false);
  }, [userHasSelectedDate, dateRange, selectedApproval, selectedPayment, page]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  const getApprovalStatusText = (status) => {
    switch (parseInt(status)) {
      case 1:
        return "Menunggu Konfirmasi";
      case 2:
        return "Order Dibuat";
      case 3:
        return "Order Selesai";
      case 4:
        return "Order Ditolak";
      default:
        return "Menunggu Konfirmasi";
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (parseInt(status)) {
      case 1:
        return "text-yellow-600 bg-yellow-100";
      case 2:
        return "text-blue-600 bg-blue-100";
      case 3:
        return "text-green-600 bg-green-100";
      case 4:
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (parseInt(status)) {
      case 1:
        return "Belum Dibayar";
      case 2:
        return "Bayar DP";
      case 3:
        return "Dibayar Lunas";
      default:
        return "Belum Dibayar";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (parseInt(status)) {
      case 1:
        return "text-red-600 bg-red-100";
      case 2:
        return "text-orange-600 bg-orange-100";
      case 3:
        return "text-green-600 bg-green-100";
      default:
        return "text-red-600 bg-red-100";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleGeneratePDF = async () => {
    if (!userHasSelectedDate) {
      alert('Silakan pilih rentang tanggal terlebih dahulu');
      return;
    }
    
    if (allFilteredOrders.length === 0) {
      alert('Tidak ada data pesanan untuk digenerate');
      return;
    }
    
    try {
      // Prepare filter info
      const filterInfo = {
        dateRange,
        selectedApproval,
        selectedPayment
      };
      
      console.log(`PDF Export - Using ${allFilteredOrders.length} total records`);
      
      await generateOrderRecapReport(allFilteredOrders, filterInfo);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal generate PDF. Silakan coba lagi.');
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
      }}
    >
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="max-w-7xl mx-auto py-10 px-4">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2 font-montserrat">LAPORAN REKAP ORDER</h1>
          <p className="text-center text-gray-800 mb-8 font-montserrat">Berikut adalah laporan rekap pesanan dengan statistik dan ringkasan data.</p>

          {/* Filter Section */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Date Range Filter */}
            <DateRangeFilterReport
              dateRange={dateRange}
              onDateChange={handleDateRangeChange}
            />
            
            {/* Filter Approval Status */}
            <CustomDropdown
              label="Approval"
              options={[
                { value: '', label: 'Semua Status' },
                { value: '1', label: 'Menunggu Konfirmasi' },
                { value: '2', label: 'Order Dibuat' },
                { value: '3', label: 'Order Selesai' },
                { value: '4', label: 'Order Ditolak' }
              ]}
              value={selectedApproval}
              onChange={val => handleFilterChange('approval', val)}
              placeholder="Pilih Status"
              searchPlaceholder="Cari status..."
              labelMinWidth="80px"
            />
            
            {/* Filter Payment Status */}
            <CustomDropdown
              label="Payment"
              options={[
                { value: '', label: 'Semua Status' },
                { value: '1', label: 'Belum Dibayar' },
                { value: '2', label: 'Bayar DP' },
                { value: '3', label: 'Dibayar Lunas' }
              ]}
              value={selectedPayment}
              onChange={val => handleFilterChange('payment', val)}
              placeholder="Pilih Status"
              searchPlaceholder="Cari status..."
              labelMinWidth="80px"
            />
          </div>

          <div className="flex justify-start mb-6">
            <button
              onClick={handleGeneratePDF}
              className="bg-primaryColor hover:bg-secondaryColor text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Rekap Order
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 overflow-x-auto font-montserrat">
            {!userHasSelectedDate ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Laporan Rekap Order
                </h3>
                <p className="text-gray-500">
                  Data Real-time: {new Date().toLocaleDateString('id-ID')}
                </p>
                <p className="text-gray-400 mt-4">
                  Silakan pilih rentang tanggal untuk melihat data rekap pesanan.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[1200px]">
                    <thead>
                      <tr className="text-primaryColor">
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          No. PO
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          No. Order
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[140px]">
                          Nama Pemesan
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[130px]">
                          Harga
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[100px]">
                          Deadline
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[140px]">
                          Status Approval
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[150px]">
                          Status Pembayaran
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">
                          Telepon
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[150px]">
                          Alamat
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-6 text-gray-400">Tidak ada data pesanan</td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr
                            key={order.oId}
                            className="bg-white hover:bg-secondaryColor/10 rounded-lg shadow-sm"
                          >
                            <td className="px-3 py-3 font-medium whitespace-nowrap text-sm">
                              {order.oPoNumber || order.oPo || "-"}
                            </td>
                            <td className="px-3 py-3 font-medium whitespace-nowrap text-sm">
                              {order.oNumber || order.oCode}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                              {order.oName || order.oCustomerName}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                              {formatCurrency(order.ocbpsItem?.ocbpsTotalOff ?? order.oPrice ?? 0)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                              {formatDate(order.oDeadlineAt || order.oDeadline)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(order.oApprovalStatus)}`}
                              >
                                {getApprovalStatusText(order.oApprovalStatus)}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.oStatusPayment || order.oPaymentStatus)}`}
                              >
                                {getPaymentStatusText(order.oStatusPayment || order.oPaymentStatus)}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                              {order.oPhone}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div
                                className="max-w-[150px] truncate"
                                title={order.oAddress}
                              >
                                {truncateText(order.oAddress, 25)}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {userHasSelectedDate && orders.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                {'<'}
              </button>
              {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded border text-primaryColor font-semibold ${
                    p === page ? 'bg-primaryColor text-white' : 'border-gray-300'
                  }`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPage}
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderRecapReport;