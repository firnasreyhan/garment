import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCatalogueProductById } from "../api/Catalogue/catalogue";
import BackToTopButton from "../components/BackToTopButton";
import Footer from "../components/Footer";
import StickyNavbar from "../components/Navbar";
import { ProductGallery } from "../components/product-gallery";
import DOMPurify from "dompurify";
import { formatCurrency } from "../utils";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animatePage, setAnimatePage] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID produk tidak ditemukan");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCatalogueProductById(id);
        const productData = response.data.data;

        if (!productData) {
          setError("Produk tidak ditemukan");
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Set main image to first image if available
        if (productData.cpImage && productData.cpImage.length > 0) {
          setMainImage(productData.cpImage[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    if (!mainImage) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );

    setZoomPosition({ x, y });
  };

  // Get product images for gallery
  const productImages =
    product && product.cpImage && product.cpImage.length > 0
      ? product.cpImage
      : [];

  if (loading) {
    return (
      <>
        <StickyNavbar />
        <div className="min-h-screen bg-gray-100 font-montserrat py-8 px-4 md:px-12 lg:px-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-primaryColor font-semibold mb-2">
              Loading...
            </div>
            <div className="text-gray-500">Memuat detail produk</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <StickyNavbar />
        <div className="min-h-screen bg-gray-100 font-montserrat py-8 px-4 md:px-12 lg:px-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-red-500 font-semibold mb-2">Error</div>
            <div className="text-gray-500">
              {error || "Produk tidak ditemukan"}
            </div>
            <button
              onClick={() => navigate("/catalog")}
              className="mt-4 px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <StickyNavbar />
      <div
        className={`min-h-screen bg-gray-100 font-montserrat py-8 px-4 md:px-12 lg:px-24 flex flex-col transition-opacity duration-700 ${animatePage ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage:
            "url('/src/assets/background-image/logobg-zumar.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "1000px auto",
          backgroundPosition: "center",
          opacity: 1,
        }}
      >
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto">
          {/* Left: Info */}
          <div
            className={`flex-1 flex flex-col justify-start transition-all duration-700 ${animatePage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-2 mb-4 w-fit">
              <button
                className="text-secondaryColor font-bold text-lg p-0"
                onClick={() => navigate("/catalog")}
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-primaryColor">
                {product.cpName}
              </h1>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primaryColor mb-1 tracking-wide">
                Informasi Produk
              </h3>
              <p className="text-black-500 text-base mt-1">
                Kategori: {product.ccName || "Tidak tersedia"}
              </p>
              <p className="text-black-500 text-base">
                Sub Kategori: {product.csName || "Tidak tersedia"}
              </p>
            </div>
            <h3 className="text-lg font-bold text-primaryColor mb-1 tracking-wide">
              Deskripsi Produk
            </h3>
            {/* <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-4 max-w-md">
              {product.cpDescription || "Deskripsi produk tidak tersedia"}
            </p> */}
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.cpDescription) }} />
            <div className="mt-6">
              <h3 className="text-lg font-bold text-primaryColor mb-1 tracking-wide">
                Pilihan Bahan & Harga
              </h3>
              {product.cpIsItems.map((item, index) => (
                <p key={item.isId} className="text-black-500 text-base mt-1">
                  {index + 1}. {item.isName} - {formatCurrency(item.price)}
                </p>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-bold text-primaryColor mb-1 tracking-wide">
                S & K
              </h3>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.cpSnk) }} />
            </div>
          </div>
          <ProductGallery
            images={product.cpImage.map((img, idx) => ({
              src: img,
              alt: product.cpName + " " + (idx + 1),
            }))}
          />
        </div>
        {/* BackToTopButton */}
        <div className="fixed bottom-8 right-8 z-50">
          <BackToTopButton />
        </div>
      </div>
      <Footer />
    </>
  );
}
