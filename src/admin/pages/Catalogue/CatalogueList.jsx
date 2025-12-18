import React, { useCallback, useEffect, useState, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { hasPermission } from '../../../api/auth';
import { getCatalogueProducts, deleteCatalogueProduct } from '../../../api/Catalogue/catalogue';
import { getCatalogueCategories } from '../../../api/Catalogue/catalogueCategory';
import { getCatalogueSubCategories } from '../../../api/Catalogue/catalogueSubCategory';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

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
                className={`w-full text-left px-4 py-2 cursor-pointer ${String(opt.value) === String(value) ? 'bg-secondaryColor/10 text-black' : 'text-black'
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

const CatalogueList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  // Modal states dan form states yang tidak dipakai dihapus
  // const [showAddModal, setShowAddModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [newProductName, setNewProductName] = useState('');
  // const [newProductDesc, setNewProductDesc] = useState('');
  // const [newProductCategoryId, setNewProductCategoryId] = useState('');
  // const [newProductSubCategoryId, setNewProductSubCategoryId] = useState('');
  // const [newProductImage, setNewProductImage] = useState(null);
  // const [newProductStatus, setNewProductStatus] = useState(1);
  // const [editingProduct, setEditingProduct] = useState(null);
  // const [editedProductName, setEditedProductName] = useState('');
  // const [editedProductDesc, setEditedProductDesc] = useState('');
  // const [editedProductCategoryId, setEditedProductCategoryId] = useState('');
  // const [editedProductSubCategoryId, setEditedProductSubCategoryId] = useState('');
  // const [editedProductImage, setEditedProductImage] = useState(null);
  // const [editedProductStatus, setEditedProductStatus] = useState(1);
  // const [formError, setFormError] = useState('');
  // const [formLoading, setFormLoading] = useState(false);
  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCatalogueCategories({ pageLimit: 100, pageNumber: 1 });
      const data = res.data.data.listData || [];
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchSubCategories = useCallback(async () => {
    try {
      const res = await getCatalogueSubCategories({ pageLimit: 100, pageNumber: 1 });
      const data = res.data.data.listData || [];
      setSubCategories(data);
    } catch {
      setSubCategories([]);
    }
  }, []);

  const fetchData = useCallback(async (goToPage) => {
    setLoading(true);
    setError('');
    try {
      const params = { pageLimit: PAGE_LIMIT, pageNumber: goToPage };


      if (search) {
        params.search = search;
      }


      if (selectedCategory) {
        params.filterCcId = selectedCategory;
      }


      if (selectedSubCategory) {
        params.filterCsId = selectedSubCategory;
      }

      const res = await getCatalogueProducts(params);
      let productsData = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];


      if (selectedCategory && !res.data.data.listData.some(p => p.ccId === selectedCategory)) {
        productsData = productsData.filter(prod => prod.ccId === selectedCategory);
      }

      if (selectedSubCategory && !res.data.data.listData.some(p => p.csId === selectedSubCategory)) {
        productsData = productsData.filter(prod => prod.csId === selectedSubCategory);
      }

      setProducts(productsData);
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
      setPage(goToPage);
    } catch {
      setError('Gagal memuat data produk katalog');
    }
    setLoading(false);
  }, [search, selectedCategory, selectedSubCategory]);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchData(1);
  }, [fetchCategories, fetchSubCategories, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === 'category') {
      setSelectedCategory(value);
      setSelectedSubCategory('');
    } else if (filterType === 'subCategory') {
      setSelectedSubCategory(value);
    }
    setPage(1);
  }, []);

  const handleEditClick = (product) => {
    navigate(`/admin/catalogue/edit/${product.cpId}`);
  };

  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setFormLoading(true);
    setFormError('');
    try {
      await deleteCatalogueProduct(deletingProduct.cpId);
      setShowDeleteModal(false);
      setDeletingProduct(null);
      const currentPageData = products.filter(prod => prod.cpId !== deletingProduct.cpId);
      if (currentPageData.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        fetchData(page);
      }
    } catch {
      setFormError('Gagal menghapus produk');
    }
    setFormLoading(false);
  };

  const stripHtml = (htmlString) => {
    if (!htmlString) return "";
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    const cleanText = stripHtml(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  // Filter sub kategori berdasarkan kategori yang dipilih
  // const filteredSubCategories = newProductCategoryId
  //   ? subCategories.filter(sub => String(sub.ccId) === String(newProductCategoryId))
  //   : subCategories;
  // const filteredEditSubCategories = editedProductCategoryId
  //   ? subCategories.filter(sub => String(sub.ccId) === String(editedProductCategoryId))
  //   : subCategories;

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
        <div className="max-w-7xl mx-auto py-10 px-4 font-montserrat">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">DAFTAR PRODUK KATALOG</h1>
          <p className="text-center text-gray-500 mb-8">Berikut adalah daftar produk katalog yang terdaftar dalam sistem.</p>

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
            {hasPermission('catalogue.product.create') && (
              <button type="button" className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2" onClick={() => navigate('/admin/catalogue/add')}>
                <PlusIcon className="w-5 h-5" />
                Tambah Produk
              </button>
            )}
          </form>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Filter Kategori */}
            <CustomDropdown
              label="Kategori"
              options={[
                { value: '', label: 'Semua Kategori' },
                ...categories.map(cat => ({ value: cat.ccId, label: cat.ccName }))
              ]}
              value={selectedCategory}
              onChange={val => handleFilterChange('category', val)}
              placeholder="Pilih Kategori"
              searchPlaceholder="Cari kategori..."
              labelMinWidth="80px"
            />

            {/* Filter Sub Kategori */}
            <CustomDropdown
              label="Sub Kategori"
              options={[
                { value: '', label: 'Semua Sub Kategori' },
                ...subCategories
                  .filter(sub => !selectedCategory || sub.ccId === selectedCategory)
                  .map(sub => ({ value: sub.csId, label: sub.csName }))
              ]}
              value={selectedSubCategory}
              onChange={val => handleFilterChange('subCategory', val)}
              placeholder="Pilih Sub Kategori"
              searchPlaceholder="Cari sub kategori..."
              labelMinWidth="100px"
            />
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 overflow-x-auto font-montserrat">
            {loading ? (
              <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[900px]">
                <thead>
                  <tr className="text-primaryColor">
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Sub Kategori</th>
                    <th className="px-4 py-3">Nama Produk</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400">Tidak ada data produk</td>
                    </tr>
                  ) : (
                    products.map((prod) => {
                      const category = categories.find(cat => cat.ccId === prod.ccId);
                      const subCategory = subCategories.find(sub => sub.csId === prod.csId);
                      return (
                        <tr key={prod.cpId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                          <td className="px-4 py-3">{category ? category.ccName : prod.ccName || '-'}</td>
                          <td className="px-4 py-3">{subCategory ? subCategory.csName : prod.csName || '-'}</td>
                          <td className="px-4 py-3 font-medium">{prod.cpName}</td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="block truncate" title={stripHtml(prod.cpDescription)}>
                              {truncateText(prod.cpDescription)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ActionDropdown
                              onEdit={() => handleEditClick(prod)}
                              onDelete={() => handleDeleteClick(prod)}
                              canEdit={hasPermission('catalogue.product.edit')}
                              canDelete={hasPermission('catalogue.product.delete')}
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

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#E51B1B]">
                  <XCircleIcon className="h-10 w-10 text-[#E51B1B]" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Anda Yakin?</h2>
                <p className="text-gray-500 mt-2">
                  Apakah Anda ingin menghapus data produk ini dari sistem? Proses ini tidak dapat dibatalkan setelah Anda konfirmasi.
                </p>
                {formError && <div className="text-red-500 mt-2 text-sm">{formError}</div>}
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

export default CatalogueList;
