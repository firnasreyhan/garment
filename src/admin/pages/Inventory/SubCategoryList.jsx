import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { hasPermission } from '../../../api/auth';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getInventorySubCategories, createInventorySubCategory, updateInventorySubCategory, deleteInventorySubCategory } from '../../../api/Inventory/inventorySubCategory';
import { getInventoryCategories } from '../../../api/Inventory/inventoryCategory';
import { Menu } from '@headlessui/react';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const PAGE_LIMIT = 10;

function ActionDropdown({ onEdit, onDelete, canEdit, canDelete }) {
  const [openUpwards, setOpenUpwards] = useState(false);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  if (!canEdit && !canDelete) return null;

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

const SubCategoryList = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // For dropdowns
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newParentCategoryId, setNewParentCategoryId] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [editedSubCategoryName, setEditedSubCategoryName] = useState('');
  const [editedParentCategoryId, setEditedParentCategoryId] = useState(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState(null);

  // Search states for dropdowns
  const [parentCategorySearch, setParentCategorySearch] = useState('');
  const [editParentCategorySearch, setEditParentCategorySearch] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New state for search expansion
  const [searchExpanded, setSearchExpanded] = useState(false);

  const fetchSubCategories = useCallback(async (goToPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await getInventorySubCategories({ pageLimit: PAGE_LIMIT, pageNumber: goToPage, search });
      // Fix: Access the correct data structure - sub-categories are in res.data.data.listData
      setSubCategories(Array.isArray(res.data.data.listData) ? res.data.data.listData : []);
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
      setPage(goToPage);
    } catch {
      setError('Gagal memuat data barang');
    }
    setLoading(false);
  }, [search]);

  // Fetch all categories for the dropdowns
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await getInventoryCategories({ pageLimit: 999, pageNumber: 1 });

        let categories = [];
        if (res && res.data) {
          // Log the raw response object structure for detailed inspection
          console.log("Raw category API response structure:", JSON.stringify(res.data, null, 2));

          // Fix: Access the correct data structure - categories are in res.data.data.listData
          const responseData = res.data.data.listData;

          if (Array.isArray(responseData)) {
            categories = responseData;
          } else {
            console.error("Category data from API (res.data.data.listData) is not an array. Actual content:", responseData);
          }
        }

        setAllCategories(categories);
        if (categories.length > 0 && !newParentCategoryId) {
          setNewParentCategoryId(categories[0].icId);
        }

      } catch (err) {
        console.error("Failed to fetch categories for dropdown", err);
        if (err.response) {
          console.error("Error response data structure:", JSON.stringify(err.response.data, null, 2));
        }
        setAllCategories([]); // Clear on error
      }
    };
    fetchAllCategories();
  }, [newParentCategoryId]);

  useEffect(() => {
    fetchSubCategories(page);
  }, [page, fetchSubCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const resetAddModal = () => {
    setNewSubCategoryName('');
    setNewParentCategoryId(null);
    setParentCategorySearch('');
    setFormError('');
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();

    // Validation
    if (!newParentCategoryId) {
      setFormError('Silakan pilih kategori induk');
      return;
    }

    if (!newSubCategoryName.trim()) {
      setFormError('Silakan masukkan nama barang');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      await createInventorySubCategory({ isName: newSubCategoryName, icId: newParentCategoryId });
      setShowAddModal(false);
      resetAddModal();
      const res = await getInventorySubCategories({ pageLimit: PAGE_LIMIT, pageNumber: 1, search: '' });
      // Fix: Access the correct data structure
      const lastPage = res?.data?.data?.pagination?.pageLast || 1;
      fetchSubCategories(lastPage);
    } catch (err) {
      setFormError(err.response?.data?.remark || 'Gagal menambah barang');
    }
    setFormLoading(false);
  };

  const handleEditClick = (subCategory) => {
    setEditingSubCategory(subCategory);
    setEditedSubCategoryName(subCategory.isName);
    setEditedParentCategoryId(subCategory.icId || null);
    setEditParentCategorySearch('');
    setShowEditModal(true);
    setFormError('');
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    if (!editingSubCategory) return;

    // Validation
    if (!editedParentCategoryId) {
      setFormError('Silakan pilih kategori induk');
      return;
    }

    if (!editedSubCategoryName.trim()) {
      setFormError('Silakan masukkan nama barang');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      await updateInventorySubCategory(editingSubCategory.isId, { isName: editedSubCategoryName, icId: editedParentCategoryId });
      setShowEditModal(false);
      fetchSubCategories(page);
    } catch (err) {
      setFormError(err.response?.data?.remark || 'Gagal mengubah barang');
    }
    setFormLoading(false);
  };

  const handleDeleteClick = (subCategory) => {
    setDeletingSubCategory(subCategory);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubCategory) return;
    setFormLoading(true);
    try {
      await deleteInventorySubCategory(deletingSubCategory.isId);
      setShowDeleteModal(false);
      const newPage = subCategories.length === 1 && page > 1 ? page - 1 : page;
      fetchSubCategories(newPage);
    } catch (err) {
      console.error("Failed to delete sub-category", err);
    }
    setFormLoading(false);
  };

  // Filter categories based on search
  const filteredCategories = allCategories.filter(cat =>
    cat.icName.toLowerCase().includes(parentCategorySearch.toLowerCase())
  );

  const filteredEditCategories = allCategories.filter(cat =>
    cat.icName.toLowerCase().includes(editParentCategorySearch.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">DAFTAR BARANG</h1>
          <p className="text-center text-gray-500 mb-8">Berikut adalah daftar barang (sub-kategori) yang terdaftar dalam sistem.</p>

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
            {hasPermission('inventory.subcategory.create') && (
              <button type="button" className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2" onClick={() => { resetAddModal(); setShowAddModal(true); }}>
                <PlusIcon className="w-5 h-5" />
                Tambah Barang
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
                    <th className="px-4 py-3">Nama Barang</th>
                    <th className="px-4 py-3">Kategori Induk</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subCategories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-400">Tidak ada data barang</td>
                    </tr>
                  ) : (
                    subCategories.map((sub) => (
                      <tr key={sub.isId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3 font-medium">{sub.isName}</td>
                        <td className="px-4 py-3">{sub.icName}</td>
                        <td className="px-4 py-3">
                          <ActionDropdown
                            onEdit={() => handleEditClick(sub)}
                            onDelete={() => handleDeleteClick(sub)}
                            canEdit={hasPermission('inventory.subcategory.edit')}
                            canDelete={hasPermission('inventory.subcategory.delete')}
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
            <button className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              {'<'}
            </button>
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`px-3 py-1 rounded border text-primaryColor font-semibold ${p === page ? 'bg-primaryColor text-white' : 'border-gray-300'}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPage, p + 1))} disabled={page === totalPage}>
              {'>'}
            </button>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Tambah Barang</h2>
                <form onSubmit={handleAddSubCategory}>
                  <div className='mb-4'>
                    <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">Kategori Induk<span className="text-red-500 ml-1">*</span></label>
                    <Menu as="div" className="relative inline-block w-full text-left">
                      <div>
                        <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-secondaryColor">
                          {newParentCategoryId ? allCategories.find(c => c.icId === newParentCategoryId)?.icName : "Pilih Kategori Induk"}
                          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Menu.Button>
                      </div>

                      <Menu.Items className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="p-1">
                          <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={parentCategorySearch}
                            onChange={(e) => setParentCategorySearch(e.target.value)}
                            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
                          />
                          <div className="max-h-60 overflow-y-auto">
                            {filteredCategories.map(cat => (
                              <Menu.Item key={cat.icId}>
                                {({ active }) => (
                                  <button
                                    type="button"
                                    onClick={() => setNewParentCategoryId(cat.icId)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                  >
                                    {cat.icName}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </div>
                      </Menu.Items>
                    </Menu>
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-1">
                      Categories loaded: {filteredCategories.length} | Selected: {newParentCategoryId}
                    </div>
                  </div>
                  <div className='mb-4'>
                    <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 mb-1">Nama Barang<span className="text-red-500 ml-1">*</span></label>
                    <input
                      id="subCategoryName"
                      type="text"
                      placeholder="e.g., Katun Jepang, Kancing Batok"
                      value={newSubCategoryName}
                      onChange={(e) => setNewSubCategoryName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>
                  {formError && <div className="text-red-500 mb-2 text-sm">{formError}</div>}
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setShowAddModal(false); resetAddModal(); }} disabled={formLoading}>Batal</button>
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
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Edit Barang</h2>
                <form onSubmit={handleUpdateSubCategory}>
                  <div className='mb-4'>
                    <label htmlFor="editParentCategory" className="block text-sm font-medium text-gray-700 mb-1">Kategori Induk<span className="text-red-500 ml-1">*</span></label>
                    <Menu as="div" className="relative inline-block w-full text-left">
                      <div>
                        <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-secondaryColor">
                          {editedParentCategoryId ? allCategories.find(c => c.icId === editedParentCategoryId)?.icName : "Pilih Kategori Induk"}
                          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Menu.Button>
                      </div>

                      <Menu.Items className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="p-1">
                          <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={editParentCategorySearch}
                            onChange={(e) => setEditParentCategorySearch(e.target.value)}
                            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
                          />
                          <div className="max-h-60 overflow-y-auto">
                            {filteredEditCategories.map(cat => (
                              <Menu.Item key={cat.icId}>
                                {({ active }) => (
                                  <button
                                    type="button"
                                    onClick={() => setEditedParentCategoryId(cat.icId)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                  >
                                    {cat.icName}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </div>
                  <div className='mb-4'>
                    <label htmlFor="editSubCategoryName" className="block text-sm font-medium text-gray-700 mb-1">Nama Barang<span className="text-red-500 ml-1">*</span></label>
                    <input
                      id="editSubCategoryName"
                      type="text"
                      value={editedSubCategoryName}
                      onChange={(e) => setEditedSubCategoryName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>
                  {formError && <div className="text-red-500 mb-2 text-sm">{formError}</div>}
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setShowEditModal(false); setFormError(''); }} disabled={formLoading}>Batal</button>
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

export default SubCategoryList; 