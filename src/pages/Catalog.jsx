import Carousel from "../components/Carousel";
import catalogImage from "../assets/Slider/img_slider1.png";
import secondaryLogoWhite from "../assets/Logo/secondary_logo_white.png";
import StickyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import BackToTopButton from "../components/BackToTopButton";
import { Link } from "react-router-dom";
import { getCatalogueProducts } from "../api/Catalogue/catalogue";
import BackgroundImage from '../assets/background/bg-zumar.png';

const catalogSlides = [
  {
    id: 1,
    title: "Produk\nKebutuhan\nMedis",
    description: "Lorem ipsum dolor sit amet consectetur. Non sed commodo sed fermentum aliquam vulputate volutpat tortor hac.",
    image: catalogImage,
  },
  {
    id: 2,
    title: "Produk\nKebutuhan\nMedis",
    description: "Lorem ipsum dolor sit amet consectetur. Non sed commodo sed fermentum aliquam vulputate volutpat tortor hac.",
    image: catalogImage,
  }
  // Tambahkan slide lain jika perlu
];

const PRODUCTS_PER_PAGE = 6;

function rightContent() {
  return (
    <div className="relative w-full h-full">
      <img src={secondaryLogoWhite} alt="Zumar Logo" className="w-48 absolute bottom-8 right-8" />
    </div>
  );
}

function ProductGrid({ products, animate }) {
  // State untuk menyimpan transformasi tilt tiap card
  const [tilt, setTilt] = useState(Array(products.length).fill({ x: 0, y: 0 }));

  // Handler mouse move
  const handleMouseMove = (e, idx) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Nilai tilt, semakin kecil divisor semakin miring
    const rotateX = ((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt((prev) => prev.map((t, i) => i === idx ? { x: rotateX, y: rotateY } : t));
  };
  // Reset tilt
  const handleMouseLeave = (idx) => {
    setTilt((prev) => prev.map((t, i) => i === idx ? { x: 0, y: 0 } : t));
  };

  const stripHtml = (htmlString) => {
    if (!htmlString) return "";
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  return (
    // <div
    //   className={`grid grid-cols-1 font-montserrat sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}
    // >
    //   {products.map((product, idx) => (
    //     <div
    //       key={product.cpId}
    //       className="relative bg-gray-100 rounded-3xl border border-gray-100 p-0 flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden hover:scale-[1.03]"
    //       style={{
    //         transform: `perspective(1000px) rotateX(${tilt[idx].x}deg) rotateY(${tilt[idx].y}deg)`,
    //         transition: tilt[idx].x === 0 && tilt[idx].y === 0 ? 'transform 0.45s cubic-bezier(.03,.98,.52,.99)' : 'transform 0.1s',
    //       }}
    //       onMouseMove={e => handleMouseMove(e, idx)}
    //       onMouseLeave={() => handleMouseLeave(idx)}
    //     >
    //       <div className="relative h-56 overflow-hidden rounded-t-3xl">
    //         <img
    //           src={product.cpImage && product.cpImage.length > 0 ? product.cpImage[0] : catalogImage}
    //           alt={product.cpName}
    //           className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-3xl"
    //         />
    //         {/* Overlay on hover */}
    //         <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 rounded-t-3xl">
    //           <Link
    //             to={`/product/${product.cpId}`}
    //             className="bg-primaryColor text-white font-semibold rounded-full px-6 py-2 text-sm shadow-lg hover:bg-secondaryColor hover:text-white transition-colors duration-200"
    //           >
    //             Lihat Detail
    //           </Link>
    //         </div>
    //       </div>
    //       <div className="flex-1 flex flex-col px-5 py-4">
    //         <Link
    //           to={`/product/${product.cpId}`}
    //           className="text-secondaryColor font-bold text-lg mb-1 hover:underline focus:underline outline-none truncate"
    //         >
    //           {product.cpName}
    //         </Link>
    //         <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{product.cpDescription}</p>
    //         {/* Price Badge moved here */}
    //         {/* <span className="bg-primaryColor text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg self-start">
    //           Start From Rp {product.price?.toLocaleString("id-ID")}
    //         </span> */}
    //       </div>
    //     </div>
    //   ))}
    // </div>
    <div
  className={`grid grid-cols-1 font-montserrat sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-700 ${
    animate ? "opacity-100" : "opacity-0"
  }`}
>
  {products.map((product) => (
    <div
      key={product.cpId}
      className="bg-white border border-gray-300 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Gambar Produk */}
      <div className="px-4 pt-4">
        <img
          src={
            product.cpImage && product.cpImage.length > 0
              ? product.cpImage[0]
              : catalogImage
          }
          alt={product.cpName}
          className="w-full h-64 object-cover rounded-xl"
        />
      </div>

      {/* Konten */}
     <div className="flex-1 flex flex-col px-5 pt-3 pb-5">
        <h3 className="text-secondaryColor font-bold text-lg mb-2">
          {product.cpName}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
          {stripHtml(product.cpDescription)}
        </p>

        {/* Tombol Lihat Detail */}
        {/* <Link
          to={`/product/${product.cpId}`}
          className="bg-primaryColor text-white font-semibold rounded-md px-5 py-2 text-sm shadow hover:bg-primaryColor transition-colors duration-200 w-fit"
        >
          Lihat Detail
        </Link> */}
        <div className="flex items-center gap-2">
          <Link
            to={`/product/${product.cpId}`}
            className="bg-primaryColor text-white font-semibold rounded-md px-5 py-2 text-sm shadow hover:bg-primaryColor transition-colors duration-200"
          >
            Lihat Detail
          </Link>
          <Link
            to={`/order`}
            className="bg-secondaryColor text-white font-semibold rounded-md px-3 py-2 text-sm shadow hover:secondaryColor transition-colors duration-200 flex items-center gap-2"
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" 
              alt="Cart" 
              className="w-5 h-5 invert" 
            /> Pesan
          </Link>
        </div>
      </div>
    </div>
  ))}
</div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center mt-8 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border text-primaryColor border-primaryColor disabled:opacity-50"
      >
        Prev
      </button>
      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx}
          onClick={() => onPageChange(idx + 1)}
          className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-primaryColor text-white' : 'text-primaryColor border-primaryColor'}`}
        >
          {idx + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border text-primaryColor border-primaryColor disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animateGrid, setAnimateGrid] = useState(false);
  const [hasPaginated, setHasPaginated] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const mainSectionRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare filter parameters
      const filterParams = {
        pageLimit: PRODUCTS_PER_PAGE, 
        pageNumber: currentPage
      };

      // Add filter based on active filter
      if (activeFilter) {
        if (activeFilter.type === 'subcategory') {
          filterParams.filterCsId = activeFilter.value;
        } else if (activeFilter.type === 'category') {
          filterParams.filterCcId = activeFilter.value;
        }
      }

      const res = await getCatalogueProducts(filterParams);
      const list = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      setProducts(list);
      const pagination = res.data.pagination || res.data.data?.pagination || {};
      setTotalPages(Math.max(1, pagination.pageLast || 1));
    } catch {
      setProducts([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, [currentPage, activeFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (hasPaginated && mainSectionRef.current) {
      mainSectionRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      window.scrollBy(0, -80);
    }
  }, [currentPage, hasPaginated]);

  useEffect(() => {
    setAnimateGrid(false);
    const timeout = setTimeout(() => setAnimateGrid(true), 50);
    return () => clearTimeout(timeout);
  }, [products]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setHasPaginated(true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
    setHasPaginated(false);
  };

  return (
    <>
      <StickyNavbar />
      <Carousel slides={catalogSlides} rightContent={rightContent} navigationPosition="center" height="h-[60vh]" />
      <div
        className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-8"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '1000px auto',
          backgroundPosition: 'center',
        }}
        ref={mainSectionRef}
      >
        <Sidebar onFilterChange={handleFilterChange} activeFilter={activeFilter} />
        <div className="flex-1 min-w-0">
          {/* Filter Status Display */}
          {activeFilter && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primaryColor/10 to-secondaryColor/10 rounded-2xl border border-primaryColor/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Menampilkan produk untuk:</p>
                  <p className="text-lg font-bold text-primaryColor">{activeFilter.name}</p>
                </div>
                <button
                  onClick={() => handleFilterChange(null)}
                  className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors duration-200"
                >
                  Hapus Filter
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-lg mb-2">
                {activeFilter ? `Tidak ada produk untuk ${activeFilter.name}` : 'Tidak ada produk tersedia'}
              </p>
              {activeFilter && (
                <button
                  onClick={() => handleFilterChange(null)}
                  className="text-primaryColor hover:text-secondaryColor font-medium underline"
                >
                  Lihat semua produk
                </button>
              )}
            </div>
          ) : (
            <ProductGrid products={products} animate={animateGrid} />
          )}
          {products.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      </div>
      <Footer />
      <BackToTopButton />
    </>
  );
}