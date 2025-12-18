import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { hasPermission } from '../../../api/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getCatalogueSubCategories, createCatalogueSubCategory, updateCatalogueSubCategory, deleteCatalogueSubCategory } from '../../../api/Catalogue/catalogueSubCategory';
import { getCatalogueCategories } from '../../../api/Catalogue/catalogueCategory';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const PAGE_LIMIT = 10;

function ActionDropdown({ onEdit, onDelete, canEdit, canDelete }) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  if (!canEdit && !canDelete) {
    return null;
  }

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
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <ChevronDownIcon className="w-6 h-6 text-primaryColor" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 z-10 w-44 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 flex flex-col gap-3 max-h-96 overflow-y-auto mt-2 origin-top-right"
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryDesc, setNewSubCategoryDesc] = useState('');
  const [newParentCategoryId, setNewParentCategoryId] = useState('');
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [editedSubCategoryName, setEditedSubCategoryName] = useState('');
  const [editedSubCategoryDesc, setEditedSubCategoryDesc] = useState('');
  const [editedParentCategoryId, setEditedParentCategoryId] = useState('');
  const [deletingSubCategory, setDeletingSubCategory] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCatalogueCategories({ pageLimit: 100, pageNumber: 1 });
      const data = res.data.data.listData || [];
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchData = useCallback(async (goToPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await getCatalogueSubCategories({ pageLimit: PAGE_LIMIT, pageNumber: goToPage, search });
      const subCategoriesData = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      setSubCategories(subCategoriesData);
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
      setPage(goToPage);
    } catch {
      setError('Gagal memuat data sub kategori katalog');
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchCategories();
    fetchData(1);
  }, [fetchCategories, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await createCatalogueSubCategory({
        ccId: newParentCategoryId,
        csName: newSubCategoryName,
        csDescription: newSubCategoryDesc
      });
      setShowAddModal(false);
      setNewSubCategoryName('');
      setNewSubCategoryDesc('');
      setNewParentCategoryId('');
      setSearch('');
      setSearchInput('');
      if (page !== 1) {
        setPage(1);
      } else {
        fetchData(1);
      }
    } catch (err) {
      setFormError(err.response?.data?.remark || 'Gagal menambah sub kategori');
    }
    setFormLoading(false);
  };

  const handleEditClick = (subCategory) => {
    setEditingSubCategory(subCategory);
    setEditedSubCategoryName(subCategory.csName);
    setEditedSubCategoryDesc(subCategory.csDescription);
    setEditedParentCategoryId(subCategory.ccId);
    setShowEditModal(true);
    setFormError('');
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    if (!editingSubCategory) return;
    setFormLoading(true);
    setFormError('');
    try {
      await updateCatalogueSubCategory({
        csId: editingSubCategory.csId,
        ccId: editedParentCategoryId,
        csName: editedSubCategoryName,
        csDescription: editedSubCategoryDesc
      });
      setShowEditModal(false);
      fetchData(page);
    } catch (err) {
      setFormError(err.response?.data?.remark || 'Gagal mengubah sub kategori');
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
      await deleteCatalogueSubCategory(deletingSubCategory.csId);
      setShowDeleteModal(false);
      const currentPageData = subCategories.filter(sub => sub.csId !== deletingSubCategory.csId);
      if (currentPageData.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        fetchData(page);
      }
    } catch {
      setFormError('Gagal menghapus sub kategori');
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
      />
      <div className="flex-1">
        <AdminNavbar />
        <div className="max-w-5xl mx-auto py-10 px-4 font-montserrat">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">DAFTAR SUB KATEGORI KATALOG</h1>
          <p className="text-center text-gray-500 mb-8">Berikut adalah daftar sub kategori katalog yang terdaftar dalam sistem.</p>

          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-shrink-0 flex items-center">
              <input
                type="text"
                placeholder={searchExpanded ? 'Cari di sini' : ''}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSearchExpanded(true)}
                className={`bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondaryColor transition-all duration-300 ease-in-out px-4 py-2 rounded-full text-black ${searchExpanded ? 'w-40 md:w-56 pl-10 pr-10' : 'w-0 px-0 border-transparent cursor-pointer'} min-w-0`}
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
            {hasPermission('catalogue.subcategory.create') && (
              <button type="button" className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2" onClick={() => setShowAddModal(true)}>
                <PlusIcon className="w-5 h-5" />
                Tambah Sub Kategori
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
                    <th className="px-4 py-3">Nama Sub Kategori</th>
                    <th className="px-4 py-3">Kategori Induk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">Tidak ada data sub kategori</td>
                    </tr>
                  ) : (
                    subCategories.map((sub) => {
                      const parentCategory = categories.find(cat => cat.ccId === sub.ccId);
                      return (
                        <tr key={sub.csId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                          <td className="px-4 py-3 font-medium">{sub.csName}</td>
                          <td className="px-4 py-3">{parentCategory ? parentCategory.ccName : sub.ccName || '-'}</td>
                          <td className="px-4 py-3">{sub.csIsActive === 1 ? 'Aktif' : 'Nonaktif'}</td>
                          <td className="px-4 py-3">
                            <ActionDropdown
                              onEdit={() => handleEditClick(sub)}
                              onDelete={() => handleDeleteClick(sub)}
                              canEdit={hasPermission('catalogue.subcategory.edit')}
                              canDelete={hasPermission('catalogue.subcategory.delete')}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
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
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Tambah Sub Kategori</h2>
                <form onSubmit={handleAddSubCategory}>
                  <div className='mb-4'>
                    <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">Kategori Induk<span className="text-red-500 ml-1">*</span></label>
                    <select
                      id="parentCategory"
                      value={newParentCategoryId}
                      onChange={e => setNewParentCategoryId(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    >
                      <option value="">Pilih Kategori Induk</option>
                      {categories.map(cat => (
                        <option key={cat.ccId} value={cat.ccId}>{cat.ccName}</option>
                      ))}
                    </select>
                  </div>
                  <div className='mb-4'>
                    <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 mb-1">Nama Sub Kategori<span className="text-red-500 ml-1">*</span></label>
                    <input
                      id="subCategoryName"
                      type="text"
                      placeholder="e.g., Kemeja, Jaket"
                      value={newSubCategoryName}
                      onChange={e => setNewSubCategoryName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>
                  <div className='mb-4'>
                    <label htmlFor="subCategoryDesc" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <input
                      id="subCategoryDesc"
                      type="text"
                      placeholder="Deskripsi sub kategori"
                      value={newSubCategoryDesc}
                      onChange={e => setNewSubCategoryDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    />
                  </div>
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
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Edit Sub Kategori</h2>
                <form onSubmit={handleUpdateSubCategory}>
                  <div className='mb-4'>
                    <label htmlFor="editParentCategory" className="block text-sm font-medium text-gray-700 mb-1">Kategori Induk<span className="text-red-500 ml-1">*</span></label>
                    <select
                      id="editParentCategory"
                      value={editedParentCategoryId}
                      onChange={e => setEditedParentCategoryId(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    >
                      <option value="">Pilih Kategori Induk</option>
                      {categories.map(cat => (
                        <option key={cat.ccId} value={cat.ccId}>{cat.ccName}</option>
                      ))}
                    </select>
                  </div>
                  <div className='mb-4'>
                    <label htmlFor="editSubCategoryName" className="block text-sm font-medium text-gray-700 mb-1">Nama Sub Kategori<span className="text-red-500 ml-1">*</span></label>
                    <input
                      id="editSubCategoryName"
                      type="text"
                      value={editedSubCategoryName}
                      onChange={e => setEditedSubCategoryName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>
                  <div className='mb-4'>
                    <label htmlFor="editSubCategoryDesc" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <input
                      id="editSubCategoryDesc"
                      type="text"
                      value={editedSubCategoryDesc}
                      onChange={e => setEditedSubCategoryDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    />
                  </div>
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
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#E51B1B]">
                  <XCircleIcon className="h-10 w-10 text-[#E51B1B]" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Anda Yakin?</h2>
                <p className="text-gray-500 mt-2">
                  Apakah Anda ingin menghapus data sub kategori ini dari sistem? Proses ini tidak dapat dibatalkan setelah Anda konfirmasi.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button type="button" className="w-full rounded-lg bg-primaryColor px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryColor/90" onClick={() => setShowDeleteModal(false)} disabled={formLoading}>
                    Batal
                  </button>
                  <button onClick={handleConfirmDelete} className="w-full rounded-lg bg-[#E51B1B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E51B1B]/90" disabled={formLoading}>
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
