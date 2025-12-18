import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../../../api/Inventory/inventoryWarehouse';
import { getToken } from '../../../utils/tokenManager';
import { hasPermission } from '../../../api/auth';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const PAGE_LIMIT = 10;

function ActionDropdown({ onEdit, onDelete, canEdit, canDelete }) {
  const [openUpwards, setOpenUpwards] = useState(false);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  // Don't show dropdown if no actions available
  if (!canEdit && !canDelete) {
    return null;
  }

  const checkDropdownPosition = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const estimatedDropdownHeight = 120; // px (2 tombol)
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < estimatedDropdownHeight);
    }
  };

  const handleOpen = () => {
    checkDropdownPosition();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const handle = () => checkDropdownPosition();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
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
          className={`absolute right-0 z-10 w-44 rounded-2xl bg-gray-100 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 flex flex-col gap-3 max-h-96 overflow-y-auto ${openUpwards ? 'bottom-full mb-2 origin-bottom-right' : 'mt-2 origin-top-right'}`}
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

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // State for Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editedName, setEditedName] = useState('');

  // State for Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);

  // State for form submissions
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for search expansion
  const [searchExpanded, setSearchExpanded] = useState(false);

  const fetchData = useCallback(async (goToPage) => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError('Anda harus login terlebih dahulu');
        setLoading(false);
        return;
      }
      const res = await getWarehouses({ pageLimit: PAGE_LIMIT, pageNumber: goToPage, search });
      const resData = res?.data?.data || {};
      setWarehouses(Array.isArray(resData.listData) ? resData.listData : []);
      const pagination = res.data.pagination || resData.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
      setPage(goToPage);
    } catch {
      setError('Gagal memuat data warehouse');
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await createWarehouse({ iwName: newName });
      setShowAddModal(false);
      setNewName('');
      // Fetch data and go to the last page to see the new item
      const res = await getWarehouses({ pageLimit: PAGE_LIMIT, pageNumber: 1, search: '' });
      const lastPage = res?.data?.data?.pagination?.pageLast || 1;
      fetchData(lastPage);
    } catch (err) {
      const errorMessage = err.response?.data?.remark || 'Gagal menambah warehouse';
      setFormError(errorMessage);
    }
    setFormLoading(false);
  };

  const handleEditClick = (warehouse) => {
    setEditingWarehouse(warehouse);
    setEditedName(warehouse.iwName);
    setShowEditModal(true);
    setFormError('');
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    setFormLoading(true);
    setFormError('');
    try {
      await updateWarehouse(editingWarehouse.iwId, { iwName: editedName });
      setShowEditModal(false);
      setEditingWarehouse(null);
      fetchData(page); // Refresh current page
    } catch (err) {
      const errorMessage = err.response?.data?.remark || 'Gagal mengubah warehouse';
      setFormError(errorMessage);
    }
    setFormLoading(false);
  };

  const handleDeleteClick = (warehouse) => {
    setDeletingWarehouse(warehouse);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWarehouse) return;
    setFormLoading(true);
    try {
      await deleteWarehouse(deletingWarehouse.iwId);
      setShowDeleteModal(false);
      setDeletingWarehouse(null);
      fetchData(page); // Refresh current page
    } catch (err) {
      // Tambahkan log error detail dari backend
      console.error("Failed to delete warehouse", err, err.response?.data);
    }
    setFormLoading(false);
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
        <div className="max-w-5xl mx-auto py-10 px-4 font-montserrat">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">DAFTAR WAREHOUSE</h1>
          <p className="text-center text-gray-500 mb-8">Berikut adalah daftar warehouse yang terdaftar dalam sistem.</p>

          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-shrink-0 flex items-center">
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
            </div>
            {hasPermission('inventory.warehouse.create') && (
              <button type="button" className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2" onClick={() => setShowAddModal(true)}>
                <PlusIcon className="w-5 h-5" />
                Tambah Warehouse
              </button>
            )}
          </form>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6">
            {loading ? (
              <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-primaryColor">
                    <th className="px-4 py-3">Nama Gudang</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-6 text-gray-400">Tidak ada data warehouse</td>
                    </tr>
                  ) : (
                    warehouses.map((wh) => (
                      <tr key={wh.iwId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3 font-medium">{wh.iwName}</td>
                        <td className="px-4 py-3">
                          <ActionDropdown
                            onEdit={() => handleEditClick(wh)}
                            onDelete={() => handleDeleteClick(wh)}
                            canEdit={hasPermission('inventory.warehouse.edit')}
                            canDelete={hasPermission('inventory.warehouse.delete')}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {'<'}
            </button>
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded border text-primaryColor font-semibold ${p === page ? 'bg-primaryColor text-white' : 'border-gray-300'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
            >
              {'>'}
            </button>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Tambah Warehouse</h2>
                <form onSubmit={handleAddWarehouse}>
                  <input
                    type="text"
                    placeholder="Nama Gudang *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    required
                  />
                  {formError && <div className="text-red-500 mb-2 text-sm">{formError}</div>}
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setShowAddModal(false)} disabled={formLoading}>Batal</button>
                    <button type="submit" className="px-4 py-2 rounded bg-secondaryColor hover:bg-secondaryColor/90 text-white font-semibold" disabled={formLoading}>
                      {formLoading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Edit Warehouse</h2>
                <form onSubmit={handleUpdateWarehouse}>
                  <input
                    type="text"
                    placeholder="Nama Gudang"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    required
                  />
                  {formError && <div className="text-red-500 mb-2 text-sm">{formError}</div>}
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setShowEditModal(false)} disabled={formLoading}>Batal</button>
                    <button type="submit" className="px-4 py-2 rounded bg-secondaryColor hover:bg-secondaryColor/90 text-white font-semibold" disabled={formLoading}>
                      {formLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#E51B1B]">
                  <XCircleIcon className="h-10 w-10 text-[#E51B1B]" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Anda Yakin?</h2>
                <p className="text-gray-500 mt-2">
                  Apakah Anda ingin menghapus data ini dari sistem? Proses ini tidak dapat dibatalkan setelah Anda konfirmasi.
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

        </div>
      </div>
    </div>
  );
};

export default WarehouseList;

