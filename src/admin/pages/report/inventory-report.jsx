import { useState, useEffect, useCallback, useRef } from "react";

const PAGE_LIMIT = 10;
import BackgroundImage from "../../../assets/background/bg-zumar.png";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import { generateInventoryReport } from "../../../utils/pdfGenerator";
import { getInventories } from "../../../api/Inventory/inventory";
import { getInventoryCategories } from "../../../api/Inventory/inventoryCategory";
import { getWarehouses } from "../../../api/Inventory/inventoryWarehouse";
import { ChevronDownIcon, PrinterIcon } from "@heroicons/react/24/solid";


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
                className={`w-full text-left px-4 py-2 cursor-pointer ${String(opt.value) === String(value) ? 'bg-secondaryColor/10 text-black' : 'text-black'} hover:bg-secondaryColor/20`}
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

const InventoryReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState('');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [allInventories, setAllInventories] = useState([]);


  const fetchInventoryData = useCallback(async () => {
    if (!userHasInteracted) {
      setInventories([]);
      setAllInventories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = { pageLimit: PAGE_LIMIT, pageNumber: page };
      
      if (selectedCategory && selectedCategory !== '') {
        params.filterIcId = selectedCategory;
      }
      if (selectedWarehouse && selectedWarehouse !== '') {
        params.filterIwId = selectedWarehouse;
      }
      
      const res = await getInventories(params);
      let inventoriesData = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      
      setInventories(inventoriesData);
      
      // Set pagination info
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
      
      // Fetch all data
      if (page === 1) {
        const allParams = { pageLimit: -1 };
        
        if (selectedCategory && selectedCategory !== '') {
          allParams.filterIcId = selectedCategory;
        }
        if (selectedWarehouse && selectedWarehouse !== '') {
          allParams.filterIwId = selectedWarehouse;
        }
        
        const allRes = await getInventories(allParams);
        let allInventoriesData = Array.isArray(allRes.data.data.listData) ? allRes.data.data.listData : [];
        setAllInventories(allInventoriesData);
      }
      
    } catch (err) {
      console.error('Error fetching inventories:', err);
      setError('Gagal memuat data inventory');
    }
    setLoading(false);
  }, [userHasInteracted, selectedCategory, selectedWarehouse, page]);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      const [categoriesRes, warehousesRes] = await Promise.all([
        getInventoryCategories({ pageLimit: -1 }),
        getWarehouses({ pageLimit: -1 }),
      ]);
      setCategories(Array.isArray(categoriesRes.data.data.listData) ? categoriesRes.data.data.listData : []);
      setWarehouses(Array.isArray(warehousesRes.data.data.listData) ? warehousesRes.data.data.listData : []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);
  
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
    }
  }, [totalPage]);
  
  const handleFilterChange = useCallback((filterType, value) => {
    setUserHasInteracted(true);
    if (filterType === 'category') {
      setSelectedCategory(value);
    } else if (filterType === 'warehouse') {
      setSelectedWarehouse(value);
    }
    setPage(1); 
  }, []);

  const getCategoryName = (icId) => {
    const category = categories.find(cat => cat.icId === icId);
    return category ? category.icName : '-';
  };

  const getWarehouseName = (iwId) => {
    const warehouse = warehouses.find(wh => wh.iwId === iwId);
    return warehouse ? warehouse.iwName : '-';
  };

  const handleGeneratePDF = () => {
    if (!userHasInteracted) {
      alert('Silakan pilih filter terlebih dahulu');
      return;
    }
    
    if (allInventories.length === 0) {
      alert('Tidak ada data inventory untuk digenerate');
      return;
    }
    
    try {
      const filterInfo = {
        selectedCategory,
        selectedWarehouse
      };
      
      console.log(`PDF Export - Using ${allInventories.length} total records`);
      
      generateInventoryReport(allInventories, filterInfo, categories, warehouses);
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
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2 font-montserrat">LAPORAN INVENTORY</h1>
          <p className="text-center text-gray-800 mb-8 font-montserrat">Berikut adalah laporan inventory yang terdaftar dalam sistem.</p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Filter Kategori */}
            <CustomDropdown
              label="Kategori"
              options={[
                { value: '', label: 'Semua Kategori' },
                ...categories.map(cat => ({ value: cat.icId, label: cat.icName }))
              ]}
              value={selectedCategory}
              onChange={val => handleFilterChange('category', val)}
              placeholder="Pilih Kategori"
              searchPlaceholder="Cari kategori..."
            />
            {/* Filter Gudang */}
            <CustomDropdown
              label="Gudang"
              options={[
                { value: '', label: 'Semua Gudang' },
                ...warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))
              ]}
              value={selectedWarehouse}
              onChange={val => handleFilterChange('warehouse', val)}
              placeholder="Pilih Gudang"
              searchPlaceholder="Cari gudang..."
            />
            <div className="ml-auto flex items-center gap-4">
              <button
                onClick={handleGeneratePDF}
                className="bg-primaryColor hover:bg-secondaryColor text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg"
              >
                <PrinterIcon className="w-4 h-4" />
                Print Inventory
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 overflow-x-auto font-montserrat">
            {!userHasInteracted ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Laporan Inventori
                </h3>
                <p className="text-gray-500">
                  Data Real-time: {new Date().toLocaleDateString('id-ID')}
                </p>
                <p className="text-gray-400 mt-4">
                  Silakan pilih filter untuk melihat data inventori.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
                <thead>
                  <tr className="text-primaryColor">
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Satuan</th>
                    <th className="px-4 py-3">Gudang</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">Tidak ada data inventory</td>
                    </tr>
                  ) : (
                    inventories.map((inv) => (
                      <tr key={inv.iId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3">{getCategoryName(inv.icId)}</td>
                        <td className="px-4 py-3 font-medium">{inv.iCode}</td>
                        <td className="px-4 py-3">{inv.iAmount}</td>
                        <td className="px-4 py-3">{inv.iUnit}</td>
                        <td className="px-4 py-3">{getWarehouseName(inv.iwId)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {userHasInteracted && inventories.length > 0 && (
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

export default InventoryReport;