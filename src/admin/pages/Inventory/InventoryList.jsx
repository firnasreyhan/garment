import React, { useCallback, useEffect, useState, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInventories, deleteInventory } from '../../../api/Inventory/inventory';
import { createInventoryRelocation } from '../../../api/Inventory/inventoryRelocation';
import { getInventoryCategories } from '../../../api/Inventory/inventoryCategory';
import { getInventorySubCategories } from '../../../api/Inventory/inventorySubCategory';
import { getWarehouses } from '../../../api/Inventory/inventoryWarehouse';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { hasPermission } from '../../../api/auth';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const PAGE_LIMIT = 10;

function ActionDropdown({ onEdit, onTransfer, onDelete, canEdit, canTransfer, canDelete }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  if (!canEdit && !canTransfer && !canDelete) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    return () => { };
  }, [open]);

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

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primaryColor"
        onClick={open ? handleClose : handleOpen}
        type="button"
      >
        <ChevronDownIcon className="w-6 h-6 text-primaryColor" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className={"absolute right-0 z-10 w-44 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 flex flex-col gap-3 max-h-96 overflow-y-auto mt-2 origin-top-right"}
        >
          {canEdit && (
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all mb-1"
              style={{ backgroundColor: '#FBA15C' }}
            >
              Edit
            </button>
          )}

          {canTransfer && (
            <button
              onClick={() => { onTransfer(); setOpen(false); }}
              className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all mb-1"
              style={{ backgroundColor: '#4AD991' }}
            >
              Transfer
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all border"
              style={{ backgroundColor: '#FB5C5C', borderColor: '#FB5C5C', boxShadow: '0 2px 8px 0 #FB5C5C33' }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// CustomDropdown reusable component
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
      <span className="px-4 py-2 bg-[#295B5B] text-white font-bold rounded-l-xl border border-[#295B5B] border-r-0 text-base flex items-center justify-center" style={{ height: height, minWidth: labelMinWidth, lineHeight: height }}>{label}</span>
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

const InventoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [deletingInventory, setDeletingInventory] = useState(null);

  const [formLoading, setFormLoading] = useState(false);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync page state with query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get('page'), 10);
    if (pageParam && pageParam !== page) {
      setPage(pageParam);
    }
    // eslint-disable-next-line
  }, [location.search]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [searchExpanded, setSearchExpanded] = useState(false);

  // Tambahkan state untuk modal transfer dan data transfer
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferInventory, setTransferInventory] = useState(null);
  const [transferForm, setTransferForm] = useState({
    iwId: '', // Gudang tujuan
    unitCategory: '',
    unit: '',
    amount: '',
  });
  const [transferResult, setTransferResult] = useState({
    irAmount: '',
    baseUnit: '',
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');

  const unitOptions = {
    panjang: [
      { label: 'Meter', value: 'Meter', factor: 1 },
      { label: 'Yard', value: 'Yard', factor: 0.9144 },
      { label: 'Kilometer', value: 'Kilometer', factor: 1000 }
    ],
    banyak: [
      { label: 'Biji', value: 'Biji', factor: 1 },
      { label: 'Lusin', value: 'Lusin', factor: 12 },
      { label: 'Rim', value: 'Rim', factor: 500 },
      { label: 'Gross', value: 'Gross', factor: 144 },
      { label: 'Mass', value: 'Mass', factor: 1440 },
      { label: 'Kodi', value: 'Kodi', factor: 20 }
    ]
  };

  const fetchData = useCallback(async (goToPage, currentSearch, categoryFilter, subCategoryFilter) => {
    setLoading(true);
    setError('');
    try {
      const params = { pageLimit: PAGE_LIMIT, pageNumber: goToPage };
      if (currentSearch) {
        params.search = currentSearch;
      }
      if (categoryFilter) {
        params.filterIcId = categoryFilter;
      }
      if (subCategoryFilter) {
        params.filterIsId = subCategoryFilter;
      }
      const res = await getInventories(params);
      console.log('Fetched inventories:', res.data);
      const inventoriesData = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      setInventories(inventoriesData);

      // Extract pagination info from response - check both possible locations
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;

      setTotalPage(Math.max(1, pageLast)); // Ensure at least 1 page

      console.log('Inventories set:', inventoriesData.length, 'items');
      console.log('Total pages:', pageLast);
      console.log('Current page:', goToPage);
      console.log('Page limit:', PAGE_LIMIT);
      console.log('Full pagination object:', pagination);
    } catch (err) {
      console.error('Error fetching inventories:', err);
      setError('Gagal memuat data inventory');
    }
    setLoading(false);
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [categoriesRes, subCategoriesRes, warehousesRes] = await Promise.all([
        getInventoryCategories({ pageLimit: -1 }),
        getInventorySubCategories({ pageLimit: -1 }),
        getWarehouses({ pageLimit: -1 }),
      ]);
      setCategories(Array.isArray(categoriesRes.data.data.listData) ? categoriesRes.data.data.listData : []);
      setSubCategories(Array.isArray(subCategoriesRes.data.data.listData) ? subCategoriesRes.data.data.listData : []);
      setWarehouses(Array.isArray(warehousesRes.data.data.listData) ? warehousesRes.data.data.listData : []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData(page, search, selectedCategory, selectedSubCategory);
  }, [page, search, selectedCategory, selectedSubCategory, fetchData]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handlePageChange = (newPage) => {
    console.log('handlePageChange called with:', newPage, 'totalPage:', totalPage);
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
      // Update URL with page parameter
      const params = new URLSearchParams(location.search);
      params.set('page', newPage.toString());
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    } else {
      console.warn('Invalid page number:', newPage, 'totalPage:', totalPage);
    }
  };

  const handleDeleteClick = (inventory) => {
    setDeletingInventory(inventory);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInventory) return;
    setFormLoading(true);
    try {
      await deleteInventory(deletingInventory.iId);
      setShowDeleteModal(false);

      const currentPageData = inventories.filter(inv => inv.iId !== deletingInventory.iId);

      if (currentPageData.length === 0 && page > 1) {
        handlePageChange(page - 1);
      } else {
        fetchData(page, search, selectedCategory, selectedSubCategory);
      }
    } catch (err) {
      console.error("Failed to delete inventory", err);
    }
    setFormLoading(false);
  };

  const getCategoryName = (icId) => {
    const category = categories.find(cat => cat.icId === icId);
    return category ? category.icName : '-';
  };

  const getSubCategoryName = (isId) => {
    const subCategory = subCategories.find(sub => sub.isId === isId);
    return subCategory ? subCategory.isName : '-';
  };

  const getWarehouseName = (iwId) => {
    const warehouse = warehouses.find(wh => wh.iwId === iwId);
    return warehouse ? warehouse.iwName : '-';
  };

  const filteredSubCategories = selectedCategory
    ? subCategories.filter((sub) => String(sub.icId) === String(selectedCategory))
    : subCategories;

  const handleTransferClick = (inventory) => {
    setTransferInventory(inventory);

    // Tentukan kategori satuan berdasarkan satuan inventory
    let unitCategory = '';
    if (['meter', 'yard', 'kilometer'].includes(inventory.iUnit?.toLowerCase())) {
      unitCategory = 'panjang';
    } else if (['biji', 'lusin', 'rim', 'gross', 'mass', 'kodi'].includes(inventory.iUnit?.toLowerCase())) {
      unitCategory = 'banyak';
    }

    setTransferForm({
      iwId: '',
      unitCategory: unitCategory,
      unit: inventory.iUnit || '',
      amount: ''
    });
    setTransferResult({ irAmount: '', baseUnit: '' });
    setShowTransferModal(true);
  };

  const handleTransferFormChange = (field, value) => {
    const newForm = { ...transferForm, [field]: value };
    setTransferForm(newForm);

    // Hitung hasil konversi hanya jika ada jumlah yang diinput
    if (newForm.unitCategory && newForm.unit && newForm.amount) {
      const selected = unitOptions[newForm.unitCategory].find(opt => opt.value === newForm.unit);
      if (selected) {
        const amount = parseFloat(newForm.amount);
        if (!isNaN(amount) && amount > 0) {
          let irAmount = amount * selected.factor;
          // Pastikan irAmount adalah number, bukan string
          irAmount = Number(irAmount);
          const baseUnit = newForm.unitCategory === 'panjang' ? 'Meter' : 'Biji';
          setTransferResult({ irAmount, baseUnit });
        } else {
          setTransferResult({ irAmount: '', baseUnit: '' });
        }
      } else {
        setTransferResult({ irAmount: '', baseUnit: '' });
      }
    } else {
      setTransferResult({ irAmount: '', baseUnit: '' });
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferMessage('');

    // Validasi value dengan lebih ketat
    const iId = parseInt(transferInventory?.iId, 10);
    const iCode = transferInventory?.iCode?.toString().trim();
    const iwIdTo = parseInt(transferForm?.iwId, 10);
    const irAmount = parseFloat(transferResult?.irAmount);

    // Debug log tipe data
    console.log('Raw transferInventory:', transferInventory);
    console.log('Raw transferForm:', transferForm);
    console.log('Raw transferResult:', transferResult);
    console.log('Parsed values:');
    console.log('iId:', iId, typeof iId);
    console.log('iCode:', iCode, typeof iCode);
    console.log('iwIdTo:', iwIdTo, typeof iwIdTo);
    console.log('irAmount:', irAmount, typeof irAmount);

    // Validasi yang lebih ketat
    if (
      !iId || iId <= 0 ||
      !iCode || iCode === '' ||
      !iwIdTo || iwIdTo <= 0 ||
      !irAmount || irAmount <= 0 || isNaN(irAmount)
    ) {
      console.error('Validation failed:');
      console.error('iId valid:', !iId || iId <= 0 ? false : true);
      console.error('iCode valid:', !iCode || iCode === '' ? false : true);
      console.error('iwIdTo valid:', !iwIdTo || iwIdTo <= 0 ? false : true);
      console.error('irAmount valid:', !irAmount || irAmount <= 0 || isNaN(irAmount) ? false : true);
      setTransferMessage('Semua field harus diisi dengan benar!');
      setTransferLoading(false);
      return;
    }

    // Pastikan payload sesuai dengan dokumentasi API
    const payload = {
      iId: iId,
      iCode: iCode,
      iwIdTo: iwIdTo,
      irAmount: irAmount
    };

    console.log('Final payload transfer:', payload);
    console.log('Payload JSON:', JSON.stringify(payload));

    try {
      const response = await createInventoryRelocation(payload);
      console.log('Transfer response:', response);
      setTransferMessage('Transfer berhasil di-hold, menunggu approval.');
      setShowTransferModal(false);
      fetchData(page, search, selectedCategory, selectedSubCategory);
    } catch (err) {
      console.error('Transfer error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      setTransferMessage(err.response?.data?.remark || err.response?.data?.message || 'Gagal melakukan transfer');
    }
    setTransferLoading(false);
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
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
        <div className="max-w-7xl mx-auto py-10 px-4">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2 font-montserrat">DAFTAR INVENTORY</h1>
          <p className="text-center text-gray-800 mb-8 font-montserrat">Berikut adalah daftar inventory yang terdaftar dalam sistem.</p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Search Bar Expandable */}
            <div className="flex-shrink-0">
              {/* Search bar form, pindahkan dari bawah ke sini */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={searchExpanded ? 'Cari di sini' : ''}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => setSearchExpanded(true)}
                    className={`bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondaryColor transition-all duration-300 ease-in-out px-4 py-2 rounded-full text-black ${searchExpanded ? 'w-40 md:w-56 pl-10 pr-10' : 'w-0 px-0 border-transparent cursor-pointer'} min-w-0`}
                    style={{ zIndex: 1 }}
                  />
                  <MagnifyingGlassIcon className={`absolute ml-3 w-5 h-5 text-[#E87722] pointer-events-none transition-opacity duration-300 ${searchExpanded ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 2 }} />
                </div>
                <button
                  type={searchExpanded ? 'submit' : 'button'}
                  onClick={() => { if (!searchExpanded) setSearchExpanded(true); }}
                  className="flex items-center gap-2 bg-[#E87722] hover:bg-[#d96c1f] text-white px-7 py-3 rounded-full font-semibold shadow transition-all duration-300 relative"
                  style={{ marginLeft: searchExpanded ? '-2.5rem' : '0', zIndex: 4 }}
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className={`${searchExpanded ? 'inline' : 'hidden'} md:inline`}>Search</span>
                  {searchExpanded && (
                    <span
                      onClick={e => { e.preventDefault(); setSearchExpanded(false); setSearchInput(''); }}
                      className="ml-2 flex items-center cursor-pointer"
                      tabIndex={-1}
                    >
                      <XCircleIcon className="w-5 h-5 text-white hover:text-gray-200" />
                    </span>
                  )}
                </button>
              </form>
            </div>
            {/* Filter Kategori */}
            <CustomDropdown
              label="Kategori"
              options={categories.map(cat => ({ value: cat.icId, label: cat.icName }))}
              value={selectedCategory}
              onChange={val => { setSelectedCategory(val); setPage(1); }}
              placeholder="Tentukan Kategori"
              searchPlaceholder="Cari kategori..."
            />
            {/* Filter Barang */}
            <CustomDropdown
              label="Barang"
              options={filteredSubCategories.map(sub => ({ value: sub.isId, label: sub.isName }))}
              value={selectedSubCategory}
              onChange={val => { setSelectedSubCategory(val); setPage(1); }}
              placeholder="Tentukan Barang"
              searchPlaceholder="Cari barang..."
              labelMinWidth="70px"
            />
            {/* Button Tambah Inventory */}
            {hasPermission('inventory.items.create') && (
              <button
                type="button"
                className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                onClick={() => navigate('/admin/inventory/add')}
                style={{ minWidth: '200px' }}
              >
                <PlusIcon className="w-5 h-5" />
                Tambah Inventory
              </button>
            )}
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 overflow-x-auto font-montserrat">
            {loading ? (
              <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
                <thead>
                  <tr className="text-primaryColor">
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Barang</th>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Satuan</th>
                    <th className="px-4 py-3">Gudang</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-gray-400">Tidak ada data inventory</td>
                    </tr>
                  ) : (
                    inventories.map((inv) => (
                      <tr key={inv.iId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3">{getCategoryName(inv.icId)}</td>
                        <td className="px-4 py-3">{getSubCategoryName(inv.isId)}</td>
                        <td className="px-4 py-3 font-medium">{inv.iCode}</td>
                        <td className="px-4 py-3">{inv.iAmount}</td>
                        <td className="px-4 py-3">{inv.iUnit}</td>
                        <td className="px-4 py-3">{getWarehouseName(inv.iwId)}</td>
                        <td className="px-4 py-3">
                          <ActionDropdown
                            onEdit={() => navigate(`/admin/inventory/edit/${inv.iId}`)}
                            onTransfer={() => handleTransferClick(inv)}
                            onDelete={() => handleDeleteClick(inv)}
                            canEdit={hasPermission('inventory.items.edit')}
                            canTransfer={hasPermission('inventory.relocation.create')}
                            canDelete={hasPermission('inventory.items.delete')}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
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
                className={`px-3 py-1 rounded border text-primaryColor font-semibold ${p === page ? 'bg-primaryColor text-white' : 'border-gray-300'}`}
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

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#E51B1B]">
                  <XCircleIcon className="h-10 w-10 text-[#E51B1B]" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Anda Yakin?</h2>
                <p className="text-gray-500 mt-2">
                  Apakah Anda ingin menghapus data inventory ini dari sistem? Proses ini tidak dapat dibatalkan setelah Anda konfirmasi.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="button"
                    className="w-full rounded-lg bg-primaryColor px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryColor/90"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={formLoading}>
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="w-full rounded-lg bg-[#E51B1B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E51B1B]/90"
                    disabled={formLoading}>
                    {formLoading ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Modal */}
          {showTransferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl text-center">
                <h2 className="text-2xl font-bold mb-4">Transfer Inventory</h2>
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <CustomDropdown
                      label={<span className="whitespace-nowrap">Pilih Gudang Tujuan<span className="text-red-500 ml-1">*</span></span>}
                      options={warehouses.filter(wh => wh.iwId !== (transferInventory?.iwId)).map(wh => ({ value: wh.iwId, label: wh.iwName }))}
                      value={transferForm.iwId}
                      onChange={val => handleTransferFormChange('iwId', val)}
                      placeholder="Gudang Tujuan"
                    />
                    <div className="flex items-center w-auto">
                      <span className="px-4 py-2 bg-[#295B5B] text-white font-bold rounded-l-xl border border-[#295B5B] border-r-0 text-base flex items-center justify-center h-[38px] min-w-[120px]">Kategori Satuan</span>
                      <input
                        type="text"
                        disabled
                        className="w-[160px] px-3 py-2 border border-[#295B5B] border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none h-[38px] text-sm"
                        value={transferForm.unitCategory === 'panjang' ? 'Panjang' : transferForm.unitCategory === 'banyak' ? 'Banyak' : ''}
                      />
                    </div>
                    <CustomDropdown
                      label={<span className="whitespace-nowrap">Satuan<span className="text-red-500 ml-1">*</span></span>}
                      options={transferForm.unitCategory ? unitOptions[transferForm.unitCategory] : []}
                      value={transferForm.unit}
                      onChange={val => handleTransferFormChange('unit', val)}
                      placeholder="Satuan"
                    />
                  </div>
                  <div className="flex gap-6 items-center justify-center">
                    <div className="flex flex-col items-start">
                      <label className="font-semibold mb-1">Masukkan Jumlah <span className="text-red-500 ml-1">*</span></label>
                      <input
                        type="number"
                        min="1"
                        className="border border-primaryColor rounded px-3 py-2 w-32"
                        value={transferForm.amount}
                        onChange={e => handleTransferFormChange('amount', e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        required
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <label className="font-semibold mb-1">Hasil Konversi</label>
                      <input
                        type="text"
                        className="border border-primaryColor rounded px-3 py-2 w-32 bg-gray-100"
                        value={transferResult.irAmount}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <label className="font-semibold mb-1">Satuan Dasar</label>
                      <input
                        type="text"
                        className="border border-primaryColor rounded px-3 py-2 w-32 bg-gray-100"
                        value={transferResult.baseUnit}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      type="submit"
                      className="w-32 rounded-lg bg-[#4AD991] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3ecb7c]"
                      disabled={transferLoading}
                    >
                      {transferLoading ? 'Mentransfer...' : 'Transfer'}
                    </button>
                    <button
                      type="button"
                      className="w-32 rounded-lg bg-[#FB5C5C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e04a4a]"
                      onClick={() => setShowTransferModal(false)}
                      disabled={transferLoading}
                    >
                      Cancel
                    </button>
                  </div>
                  {transferMessage && (
                    <div className="mt-2 text-sm font-semibold text-primaryColor">{transferMessage}</div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryList;