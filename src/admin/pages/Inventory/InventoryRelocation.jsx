import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDownIcon, CheckIcon, XMarkIcon, EyeIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { getInventoryRelocations, approveInventoryRelocation, rejectInventoryRelocation } from '../../../api/Inventory/inventoryRelocation';
import { getWarehouses } from '../../../api/Inventory/inventoryWarehouse';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import CustomDropdown from '../../components/CustomDropdown';
import { hasPermission } from '../../../api/auth';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const PAGE_LIMIT = 10;

const InventoryRelocation = () => {
  const [relocations, setRelocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Pagination & filter states
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedWarehouseFrom, setSelectedWarehouseFrom] = useState('');
  const [selectedWarehouseTo, setSelectedWarehouseTo] = useState('');
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRelocation, setSelectedRelocation] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState('');
  const [pendingRelocation, setPendingRelocation] = useState(null);
  const [receivedByInput, setReceivedByInput] = useState('');
  const isReceivedByValid = /\b(Bapak|Mas|Mbak|Ibu)\b/.test(receivedByInput.trim());

  // Fetch warehouses for dropdowns
  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await getWarehouses({ pageLimit: -1 });
      setWarehouses(Array.isArray(res.data.data.listData) ? res.data.data.listData : []);
    } catch {
      setWarehouses([]);
    }
  }, []);

  // Fetch relocations with filters
  const fetchRelocations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { pageLimit: PAGE_LIMIT, pageNumber: page };
      if (search) params.search = search;
      if (selectedWarehouseFrom) params.filterIwIdFrom = selectedWarehouseFrom;
      if (selectedWarehouseTo) params.filterIwIdTo = selectedWarehouseTo;
      const res = await getInventoryRelocations(params);
      setRelocations(Array.isArray(res.data.data.listData) ? res.data.data.listData : []);
      // Ambil pagination seperti di InventoryList
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
    } catch {
      setError('Gagal memuat data transfer inventory');
    }
    setLoading(false);
  }, [page, search, selectedWarehouseFrom, selectedWarehouseTo]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    fetchRelocations();
  }, [fetchRelocations]);

  // Handlers for search and pagination
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
    }
  };

  // Function to convert status code to readable text
  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 1:
        return 'Menunggu Konfirmasi';
      case 2:
        return 'Approve';
      case 3:
        return 'Reject';
      default:
        return '-';
    }
  };

  // Function to get status badge styling
  const getStatusBadge = (statusCode) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (statusCode) {
      case 1:
        return `${baseClasses} bg-yellow-100 text-black-800`;
      case 2:
        return `${baseClasses} bg-green-100 text-green-800`;
      case 3:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Action Dropdown Component
  function ActionDropdown({ relocation, onViewDetail, canApprove, canReject }) {
    const [open, setOpen] = useState(false);
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

    return (
      <div className="relative inline-block text-left">
        <button
          ref={btnRef}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primaryColor"
          onClick={() => setOpen(!open)}
          type="button"
        >
          <ChevronDownIcon className="w-6 h-6 text-primaryColor" />
        </button>
        {open && (
          <div
            ref={dropdownRef}
            className="absolute right-0 z-10 w-44 rounded-2xl bg-gray-100 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 flex flex-col gap-3 max-h-96 overflow-y-auto mt-2 origin-top-right"
          >
            {relocation.irApprovalStatus === 1 ? (
              <>
                {canApprove && (
                  <button
                    onClick={() => { setConfirmType('approve'); setPendingRelocation(relocation); setShowConfirmModal(true); setOpen(false); }}
                    className="w-full py-3 rounded-xl text-lg font-bold text-white shadow transition-all mb-2"
                    style={{ backgroundColor: '#4AD991' }}
                  >
                    <CheckIcon className="w-5 h-5 inline mr-2" />
                    Approve
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => { setConfirmType('reject'); setPendingRelocation(relocation); setShowConfirmModal(true); setOpen(false); }}
                    className="w-full py-3 rounded-xl text-lg font-bold text-white shadow transition-all border"
                    style={{ backgroundColor: '#FB5C5C', borderColor: '#FB5C5C', boxShadow: '0 2px 8px 0 #FB5C5C33' }}
                  >
                    <XMarkIcon className="w-5 h-5 inline mr-2" />
                    Reject
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => { onViewDetail(relocation); setOpen(false); }}
                className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all mb-1"
                style={{ backgroundColor: '#295B5B' }}
              >
                <EyeIcon className="w-5 h-5 inline mr-2" />
                Detail
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle approve action (now calls backend)
  const handleApprove = async (relocation, receivedBy) => {
    try {
      await approveInventoryRelocation(relocation.irId, receivedBy);
      await fetchRelocations();
    } catch (err) {
      console.error('Failed to approve relocation:', err);
    }
  };

  // Handle reject action (now calls backend)
  const handleReject = async (relocation) => {
    try {
      await rejectInventoryRelocation(relocation.irId);
      await fetchRelocations();
    } catch (err) {
      console.error('Failed to reject relocation:', err);
    }
  };

  // Handle view detail
  const handleViewDetail = (relocation) => {
    setSelectedRelocation(relocation);
    setShowDetailModal(true);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
        opacity: 1
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
        <div className="max-w-6xl mx-auto py-10 px-4 font-montserrat">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">DAFTAR TRANSFER INVENTORY</h1>
          <p className="text-center text-gray-500 mb-8">Berikut adalah daftar transfer inventory yang terdaftar dalam sistem.</p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Search Bar Expandable */}
            <div className="flex-shrink-0">
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
            {/* Filter Gudang Asal */}
            <CustomDropdown
              label="Gudang Asal"
              options={[
                { value: '', label: 'Semua Gudang' },
                ...warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))
              ]}
              // {warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))}
              value={selectedWarehouseFrom}
              onChange={val => { setSelectedWarehouseFrom(val); setPage(1); }}
              placeholder="Tentukan Gudang Asal"
              searchPlaceholder="Cari gudang..."
              height="44px"
              labelMinWidth="140px"
            />
            {/* Filter Gudang Tujuan */}
            <CustomDropdown
              label="Gudang Tujuan"
              options={[
                { value: '', label: 'Semua Gudang' },
                ...warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))
              ]}
              value={selectedWarehouseTo}
              onChange={val => { setSelectedWarehouseTo(val); setPage(1); }}
              placeholder="Tentukan Gudang"
              searchPlaceholder="Cari gudang..."
              height="44px"
              labelMinWidth="140px"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
          ) : (
            <div className="bg-gray-100 rounded-xl shadow p-4 overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[900px]">
                <thead>
                  <tr className="text-primaryColor">
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Gudang Asal</th>
                    <th className="px-4 py-3">Gudang Tujuan</th>
                    <th className="px-4 py-3">Jumlah Transfer</th>
                    <th className="px-4 py-3">Satuan Dasar</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {relocations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400">Tidak ada data transfer</td>
                    </tr>
                  ) : (
                    relocations.map((rel) => (
                      <tr key={rel.irId || rel.iId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3 font-medium">{rel.iCode}</td>
                        <td className="px-4 py-3">{rel.iwNameFrom || '-'}</td>
                        <td className="px-4 py-3">{rel.iwNameTo || '-'}</td>
                        <td className="px-4 py-3">{rel.irAmount}</td>
                        <td className="px-4 py-3">{rel.iUnit || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadge(rel.irApprovalStatus)}>
                            {getStatusText(rel.irApprovalStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ActionDropdown
                            relocation={rel}
                            onViewDetail={handleViewDetail}
                            canApprove={hasPermission('inventory.relocation.approve')}
                            canReject={hasPermission('inventory.relocation.reject')}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

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

          {/* Confirmation Modal */}
          {showConfirmModal && pendingRelocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-gray-100 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {confirmType === 'approve' ? 'Konfirmasi Approve' : 'Konfirmasi Reject'}
                </h2>
                <p className="mb-4">
                  {confirmType === 'approve'
                    ? 'Apakah Anda yakin ingin menyetujui transfer ini?'
                    : 'Apakah Anda yakin ingin menolak transfer ini?'}
                </p>
                {confirmType === 'approve' && (
                  <div className="mb-4 text-left">
                    <label htmlFor="receivedByInput" className="block font-semibold mb-1">Petugas Penerima <span className="text-red-500 ml-1">*</span></label>
                    <input
                      id="receivedByInput"
                      type="text"
                      className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primaryColor"
                      placeholder="Masukkan nama petugas penerima"
                      value={receivedByInput}
                      onChange={e => setReceivedByInput(e.target.value)}
                      required
                    />
                    <p className="text-xs mt-1">Contoh: Bapak Burhan/ Mas Naen atau Mbak Ria/ Ibu Ria</p>
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    className="w-32 rounded-lg bg-primaryColor px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryColor/90 disabled:opacity-50"
                    onClick={async () => {
                      if (confirmType === 'approve') {
                        await handleApprove(pendingRelocation, receivedByInput);
                      } else if (confirmType === 'reject') {
                        await handleReject(pendingRelocation);
                      }
                      setShowConfirmModal(false);
                      setReceivedByInput('');
                    }}
                    disabled={confirmType === 'approve' && (!receivedByInput.trim() || !isReceivedByValid)}
                  >
                    {confirmType === 'approve' ? 'Ya, Approve' : 'Ya, Reject'}
                  </button>
                  <button
                    className="w-32 rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-400"
                    onClick={() => { setShowConfirmModal(false); setReceivedByInput(''); }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          {showDetailModal && selectedRelocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-gray-100 rounded-xl shadow-lg p-8 w-full max-w-lg text-center overflow-y-auto max-h-[90vh]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 mb-4"
                  style={{
                    borderColor: selectedRelocation.irApprovalStatus === 2 ? '#4AD991' : '#FB5C5C',
                    backgroundColor: selectedRelocation.irApprovalStatus === 2 ? '#4AD991' : '#FB5C5C'
                  }}>
                  {selectedRelocation.irApprovalStatus === 2 ? (
                    <CheckIcon className="h-10 w-10 text-white" />
                  ) : (
                    <XMarkIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  {selectedRelocation.irApprovalStatus === 2 ? 'Transfer Disetujui' : 'Transfer Ditolak'}
                </h2>
                <div className="text-left space-y-3 mb-6">
                  <div>
                    <span className="font-semibold">Kode Inventory:</span>
                    <p className="text-gray-600">{selectedRelocation.iCode}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Gudang Asal:</span>
                    <p className="text-gray-600">{selectedRelocation.iwNameFrom || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Gudang Tujuan:</span>
                    <p className="text-gray-600">{selectedRelocation.iwNameTo || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Jumlah Transfer:</span>
                    <p className="text-gray-600">{selectedRelocation.irAmount} {selectedRelocation.iUnit || ''}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Kategori:</span>
                    <p className="text-gray-600">{selectedRelocation.icName || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Sub Kategori:</span>
                    <p className="text-gray-600">{selectedRelocation.isName || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">{selectedRelocation.irApprovalStatus === 2 ? 'Disetujui oleh:' : 'Ditolak oleh:'}</span>
                    <p className="text-gray-600">{selectedRelocation.irApprovalByName || 'Admin'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Diterima oleh:</span>
                    <p className="text-gray-600">{selectedRelocation.irReceivedBy ? selectedRelocation.irReceivedBy : 'None'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">{selectedRelocation.irApprovalStatus === 2 ? 'Tanggal Persetujuan:' : 'Tanggal Penolakan:'}</span>
                    <p className="text-gray-600">
                      {selectedRelocation.irUpdatedAt
                        ? new Date(selectedRelocation.irUpdatedAt).toLocaleString('id-ID')
                        : new Date().toLocaleString('id-ID')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="w-full rounded-lg bg-primaryColor px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryColor/90"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryRelocation; 