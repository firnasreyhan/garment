import { useState, useEffect, useCallback, useRef } from "react";
import BackgroundImage from "../../../assets/background/bg-zumar.png";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import { generateCatalogueReport } from "../../../utils/pdfGenerator";
import { getCatalogueProducts } from "../../../api/Catalogue/catalogue";
import { getCatalogueCategories } from "../../../api/Catalogue/catalogueCategory";
import { getCatalogueSubCategories } from "../../../api/Catalogue/catalogueSubCategory";
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

const CatalogueReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [error, setError] = useState('');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
    }
  }, [totalPage]);
  
  const handleFilterChange = useCallback((filterType, value) => {
    setUserHasInteracted(true);
    if (filterType === 'category') {
      setSelectedCategory(value);
      setSelectedSubCategory('');
    } else if (filterType === 'subCategory') {
      setSelectedSubCategory(value);
    }
    setPage(1);
  }, []);

  const fetchCatalogData = useCallback(async () => {
    if (!userHasInteracted) {
      setProducts([]);
      setAllProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = { pageLimit: PAGE_LIMIT, pageNumber: page };
      
      if (selectedCategory && selectedCategory !== '') {
        params.filterCcId = selectedCategory;
      }
      if (selectedSubCategory && selectedSubCategory !== '') {
        params.filterCsId = selectedSubCategory;
      }
      
      const res = await getCatalogueProducts(params);
      let productsData = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      
      if (selectedCategory && selectedCategory !== '') {
        productsData = productsData.filter(prod => prod.ccId === selectedCategory);
      }
      if (selectedSubCategory && selectedSubCategory !== '') {
        productsData = productsData.filter(prod => prod.csId === selectedSubCategory);
      }
      
      setProducts(productsData);
      
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      const pageLast = pagination.pageLast || 1;
      setTotalPage(Math.max(1, pageLast));
      
      if (page === 1) {
        const allParams = { pageLimit: -1 };
        
        if (selectedCategory && selectedCategory !== '') {
          allParams.filterCcId = selectedCategory;
        }
        if (selectedSubCategory && selectedSubCategory !== '') {
          allParams.filterCsId = selectedSubCategory;
        }
        
        const allRes = await getCatalogueProducts(allParams);
        let allProductsData = Array.isArray(allRes.data.data.listData) ? allRes.data.data.listData : [];
        
        if (selectedCategory && selectedCategory !== '') {
          allProductsData = allProductsData.filter(prod => prod.ccId === selectedCategory);
        }
        if (selectedSubCategory && selectedSubCategory !== '') {
          allProductsData = allProductsData.filter(prod => prod.csId === selectedSubCategory);
        }
        
        setAllProducts(allProductsData);
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Gagal memuat data produk katalog');
    }
    setLoading(false);
  }, [userHasInteracted, selectedCategory, selectedSubCategory, page]);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      const [categoriesRes, subCategoriesRes] = await Promise.all([
        getCatalogueCategories({ pageLimit: -1 }),
        getCatalogueSubCategories({ pageLimit: -1 }),
      ]);
      setCategories(Array.isArray(categoriesRes.data.data.listData) ? categoriesRes.data.data.listData : []);
      setSubCategories(Array.isArray(subCategoriesRes.data.data.listData) ? subCategoriesRes.data.data.listData : []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  const getCategoryName = (ccId) => {
    const category = categories.find(cat => cat.ccId === ccId);
    return category ? category.ccName : '-';
  };

  const getSubCategoryName = (csId) => {
    const subCategory = subCategories.find(sub => sub.csId === csId);
    return subCategory ? subCategory.csName : '-';
  };

  const stripHtml = (htmlString) => {
    if (!htmlString) return "";
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    const cleanText = stripHtml(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  const getMainImage = (product) => {
    if (product.cpImage && Array.isArray(product.cpImage) && product.cpImage.length > 0) {
      return product.cpImage[0];
    }
    return null;
  };

  const handleGeneratePDF = async () => {
    if (!userHasInteracted) {
      alert('Silakan pilih filter Kategori atau Sub Kategori terlebih dahulu');
      return;
    }
    
    if (allProducts.length === 0) {
      alert('Tidak ada data produk katalog untuk digenerate');
      return;
    }
    
    try {
      const filterInfo = {
        selectedCategory,
        selectedSubCategory
      };
      
      console.log(`PDF Export - Using ${allProducts.length} total records`);
      
      const originalText = 'Buat Laporan PDF';
      document.querySelector('[data-pdf-button]').textContent = 'Generating PDF...';
      document.querySelector('[data-pdf-button]').disabled = true;
      
      await generateCatalogueReport(allProducts, filterInfo, categories, subCategories);
      
      document.querySelector('[data-pdf-button]').textContent = originalText;
      document.querySelector('[data-pdf-button]').disabled = false;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal generate PDF. Silakan coba lagi.');
      
      document.querySelector('[data-pdf-button]').textContent = 'Buat Laporan PDF';
      document.querySelector('[data-pdf-button]').disabled = false;
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
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2 font-montserrat">LAPORAN KATALOG</h1>
          <p className="text-center text-gray-800 mb-8 font-montserrat">Berikut adalah laporan produk katalog yang terdaftar dalam sistem.</p>

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
            
            <div className="ml-auto flex items-center gap-4">
              <button
                onClick={handleGeneratePDF}
                data-pdf-button
                className="bg-primaryColor hover:bg-secondaryColor text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
              >
                <PrinterIcon className="w-4 h-4" />
                Print Katalog
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 overflow-x-auto font-montserrat">
            {!userHasInteracted ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Laporan Katalog
                </h3>
                <p className="text-gray-500">
                  Data Real-time: {new Date().toLocaleDateString('id-ID')}
                </p>
                <p className="text-gray-400 mt-4">
                  Silakan pilih filter Kategori atau Sub Kategori untuk melihat data produk katalog.
                </p>
              </div>
            ) : loading ? (
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
                    <th className="px-4 py-3">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">Tidak ada data produk katalog</td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod.cpId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3">{getCategoryName(prod.ccId)}</td>
                        <td className="px-4 py-3">{getSubCategoryName(prod.csId)}</td>
                        <td className="px-4 py-3 font-medium">{prod.cpName}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <span className="block truncate" title={stripHtml(prod.cpDescription)}>
                            {truncateText(prod.cpDescription)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getMainImage(prod) ? (
                            <img 
                              src={getMainImage(prod)} 
                              alt={prod.cpName}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs"
                            style={{ display: getMainImage(prod) ? 'none' : 'flex' }}
                          >
                            No Image
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
          {userHasInteracted && products.length > 0 && (
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

export default CatalogueReport;