import {
  ChevronDownIcon,
  ExclamationCircleIcon,
  PlusIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCatalogueProducts } from "../api/Catalogue/catalogue";
import { getCatalogueCategories } from "../api/Catalogue/catalogueCategory";
import { getCatalogueSubCategories } from "../api/Catalogue/catalogueSubCategory";
import {
  createOrder,
  getInventorySubcategories,
  getSizes,
  uploadOrderMockupImage,
} from "../api/Order/order";
import secondaryLogoWhite from "../assets/Logo/secondary_logo_white.png";
import StickyNavbar from "../components/Navbar";
import SearchableDropdown from "../components/SearchableDropdown";
import { checkImageValidity } from "../utils";

// Size data akan di-fetch dari API

// Komponen untuk setiap order
const OrderSection = ({
  orderNumber,
  isExpanded,
  onToggle,
  onDelete,
  totalOrders,
  catalogueProducts,
  categories,
  subcategories,
  inventories,
  sizes,
  onOrderDataChange,
}) => {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [mockupFiles, setMockupFiles] = useState([]);

  // Initialize selectedSizes when sizes prop changes
  useEffect(() => {
    if (sizes && sizes.length > 0) {
      const initialSelectedSizes = sizes.map((size) => ({
        sId: size.sId,
        sName: size.sName,
        value: 0,
      }));
      setSelectedSizes(initialSelectedSizes);
    }
  }, [sizes]);

  // Report order data changes to parent component
  useEffect(() => {
    if (!onOrderDataChange) return;

    // Create order data structure matching API format from example value
    const orderData = {
      orderNumber,
      cpId: selectedProductId ? parseInt(selectedProductId) : null,
      isId: selectedInventoryId ? parseInt(selectedInventoryId) : null,
      oiMockupImage: mockupFiles.map((file) => URL.createObjectURL(file)), // Temporary URLs for preview
      mockupFiles: mockupFiles, // Keep files for actual upload
      oiSizes: selectedSizes
        .filter((size) => size.value && parseInt(size.value) > 0)
        .map((size) => ({
          sId: size.sId,
          oisAmount: parseInt(size.value),
        })),
    };

    onOrderDataChange(orderNumber, orderData);
  }, [
    selectedProductId,
    selectedInventoryId,
    mockupFiles,
    selectedSizes,
    orderNumber,
    onOrderDataChange,
    catalogueProducts,
    inventories,
  ]);

  const handleSizeChange = (index, newValue) => {
    let cleanValue = newValue.replace(/^0+(?!$)/, "");
    if (cleanValue === "") cleanValue = "0";
    const updatedSelectedSizes = selectedSizes.map((size, i) =>
      i === index ? { ...size, value: cleanValue } : size,
    );
    setSelectedSizes(updatedSelectedSizes);
  };

  // Helper untuk mendapatkan nama/label dari berbagai format API
  const getName = (
    item,
    nameFields = [
      "name",
      "csName",
      "ccName",
      "cpName",
      "iCode",
      "iDescription",
      "isName",
    ],
  ) => {
    for (const field of nameFields) {
      if (
        item[field] !== undefined &&
        item[field] !== null &&
        item[field] !== ""
      )
        return item[field];
    }
    return "Unknown";
  };

  // Helper untuk truncate nama file
  const truncateFileName = (fileName, maxLength = 25) => {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const maxNameLength = maxLength - extension.length - 4; // 4 untuk "..."

    if (maxNameLength <= 0) {
      return `...${extension}`;
    }

    return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Header Order */}
      <div
        className="bg-primaryColor text-white px-4 py-3 rounded-t-lg flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <span className="font-semibold">ORDER {orderNumber}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
              totalOrders === 1
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            disabled={totalOrders === 1}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Content Order */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Categories */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kategori<span className="text-red-400 ml-1">*</span></label>
            <SearchableDropdown
              data={categories}
              labelKey="ccName"
              valueKey="ccId"
              placeholder="Cari kategori..."
              value={selectedCategory ? selectedCategory.ccId : ""}
              onSelect={(category) => {
                if (category.ccId === selectedCategory?.ccId) return; // No change
                setSelectedCategory(category);
                setSelectedSubcategory(null);
                setSelectedProductId(null);
                setSelectedProductDetails(null);
                  setSelectedInventoryId(null);
              }}
              onChange={(searchTerm) => {
                if (!searchTerm) {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSelectedProductId(null);
                  setSelectedProductDetails(null);
                  setSelectedInventoryId(null);
                }
              }}
            />
          </div>

          {/* SubCategories */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Sub Kategori<span className="text-red-400 ml-1">*</span>
            </label>
            <SearchableDropdown
              data={
                selectedCategory
                  ? subcategories.filter(
                      (i) => i.ccId === selectedCategory.ccId,
                    )
                  : []
              }
              labelKey="csName"
              valueKey="csId"
              placeholder="Cari sub kategori..."
              value={selectedSubcategory ? selectedSubcategory.csId : ""}
              onSelect={(subcategory) => {
                if (subcategory.csId === selectedSubcategory?.csId) return; // No change
                setSelectedSubcategory(subcategory);
                setSelectedProductId(null);
                setSelectedProductDetails(null);
                  setSelectedInventoryId(null);
              }}
              onChange={(searchTerm) => {
                if (!searchTerm) {
                  setSelectedSubcategory(null);
                  setSelectedProductId(null);
                  setSelectedProductDetails(null);
                  setSelectedInventoryId(null);
                }
              }}
            />
          </div>

          {/* Produk */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Produk<span className="text-red-400 ml-1">*</span></label>
            <SearchableDropdown
              data={
                selectedSubcategory
                  ? catalogueProducts.filter(
                      (i) => i.csId === selectedSubcategory.csId,
                    )
                  : []
              }
              value={selectedProductId ? selectedProductId : ""}
              labelKey="cpName"
              valueKey="cpId"
              placeholder="Cari produk..."
              onSelect={(product) => {
                if (product.cpId === selectedProductId) return; // No change
                setSelectedProductId(product.cpId);
                setSelectedProductDetails(product);
                setSelectedInventoryId(null);
                  setSelectedInventoryId(null);
              }}
              onChange={(searchTerm) => {
                if (!searchTerm) {
                  setSelectedProductId(null);
                  setSelectedProductDetails(null);
                  setSelectedInventoryId(null);
                }
              }}
            />

            {/* Info Box Produk */}
            {selectedProductDetails && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-md mt-2 text-sm">
                <p className="font-semibold text-gray-700 mb-1">
                  Detail Produk:
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Nama Produk:</span>{" "}
                  {getName(selectedProductDetails, ["cpName", "name"])}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Kategori:</span>{" "}
                  {getName(selectedProductDetails, ["ccName", "name"])}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Sub Kategori:</span>{" "}
                  {getName(selectedProductDetails, ["csName", "name"])}
                </p>
              </div>
            )}
          </div>

          {/* Bahan */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bahan<span className="text-red-400 ml-1">*</span></label>
            <SearchableDropdown
              data={selectedProductDetails?.cpIsItems || []}
              value={selectedInventoryId ? selectedInventoryId : ""}
              labelKey="isName"
              valueKey="isId"
              placeholder="Cari bahan..."
              onSelect={(inventory) => {
                setSelectedInventoryId(inventory.isId);
              }}
            />
          </div>

          {/* Size Selector */}
          <div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {selectedSizes.map((size, idx) => (
                <div
                  key={size.sId}
                  className={`flex w-full h-12 rounded border text-xs font-semibold overflow-hidden border-primaryColor`}
                >
                  <span
                    className={`flex items-center justify-center w-1/2 h-full bg-primaryColor text-white`}
                  >
                    {size.sName}
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="flex items-center justify-center w-1/2 h-full bg-gray-100 text-primaryColor text-center outline-none border-0 appearance-none"
                    style={{ MozAppearance: "textfield" }}
                    placeholder="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => handleSizeChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col items-center w-full">
            <label className="block text-gray-500 mb-2 text-center w-full font-semibold text-base">
              Please send us your design/mockup
            </label>
            <input
              type="file"
              id={`mockup-upload-${orderNumber}`}
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const validFiles = files.filter((file) =>
                  checkImageValidity(file),
                );

                if (validFiles.length !== files.length) {
                  toast.error(
                    "Beberapa file tidak valid. Hanya file JPG, PNG dengan ukuran maksimal 5MB yang diperbolehkan.",
                  );
                  return;
                }

                setMockupFiles((prev) => [...prev, ...files]);
              }}
              className="hidden"
            />
            <label
              htmlFor={`mockup-upload-${orderNumber}`}
              className="bg-primaryColor text-white px-10 py-3 rounded hover:bg-secondaryColor mb-6 font-bold text-lg cursor-pointer"
            >
              Upload
            </label>
            <div className="space-y-4 w-full flex flex-col items-center">
              {mockupFiles.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No files uploaded yet
                </div>
              ) : (
                <div className="space-y-2 w-full max-w-full overflow-hidden">
                  {mockupFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center text-base w-full justify-center gap-4 bg-gray-50 p-2 rounded overflow-hidden"
                    >
                      <span
                        className="font-semibold text-gray-700 truncate max-w-xs"
                        title={file.name}
                      >
                        {truncateFileName(file.name)}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({Math.round(file.size / 1024)}KB)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setMockupFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="text-red-500 hover:underline font-semibold text-sm flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OrderSection.propTypes = {
  orderNumber: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  totalOrders: PropTypes.number.isRequired,
  catalogueCategories: PropTypes.arrayOf(PropTypes.object),
  catalogueSubCategories: PropTypes.arrayOf(PropTypes.object),
  inventories: PropTypes.arrayOf(PropTypes.object),
  sizes: PropTypes.arrayOf(PropTypes.object),
  onOrderDataChange: PropTypes.func,
};

OrderSection.defaultProps = {
  catalogueCategories: [],
  catalogueSubCategories: [],
  inventories: [],
  sizes: [],
  onOrderDataChange: null,
};

export default function Order() {
  const navigate = useNavigate();
  const [leftSectionStyle, setLeftSectionStyle] = useState({
    position: "fixed",
    top: 80,
  });
  const leftSectionRef = useRef(null);
  const [animatePage, setAnimatePage] = useState(false);
  const [orders, setOrders] = useState([{ id: 1, isExpanded: true }]);

  // API Data States
  const [catalogueProducts, setCatalogueProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Data States
  const [formData, setFormData] = useState({
    posNumber: "",
    deadline: "",
    contactName: "",
    contactPhone: "",
    contactAddress: "",
  });
  const [note, setNote] = useState("");

  // Order Items Data State
  const [orderItemsData, setOrderItemsData] = useState({});

  // Improved extract data function
  const extractData = useCallback((response) => {
    if (!response || !response.data) return [];

    // Cek berbagai kemungkinan struktur data
    if (response.data.listData && Array.isArray(response.data.listData)) {
      return response.data.listData;
    } else if (
      response.data.data &&
      response.data.data.listData &&
      Array.isArray(response.data.data.listData)
    ) {
      return response.data.data.listData;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    } else if (response.data.content && Array.isArray(response.data.content)) {
      return response.data.content;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }

    // Jika tidak ada struktur yang sesuai, coba cek apakah ada field lain yang berisi array
    const possibleArrayFields = [
      "list",
      "records",
      "rows",
      "elements",
      "collection",
    ];
    for (const field of possibleArrayFields) {
      if (response.data[field] && Array.isArray(response.data[field])) {
        return response.data[field];
      }
    }

    // Cek nested structure lebih dalam
    if (response.data.data && typeof response.data.data === "object") {
      const nestedKeys = Object.keys(response.data.data);
      for (const key of nestedKeys) {
        if (response.data.data[key] && Array.isArray(response.data.data[key])) {
          return response.data.data[key];
        }
      }
    }

    return [];
  }, []);

  // Fetch API data on component mount with better error handling
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      setError(null);

      // Fetch catalogue categories
      try {
        const categoriesRes = await getCatalogueCategories({
          pageLimit: -1,
          pageNumber: 1,
        });
        const categorieData = extractData(categoriesRes);
        setCategories(categorieData);
      } catch (error) {
        setError((prev) => ({ ...prev, products: error.message }));
      }

      // Fetch catalogue subcategories
      try {
        const subcategoriesRes = await getCatalogueSubCategories({
          pageLimit: -1,
          pageNumber: 1,
        });
        const subcategoriesData = extractData(subcategoriesRes);
        setSubCategories(subcategoriesData);
      } catch (error) {
        setError((prev) => ({ ...prev, products: error.message }));
      }

      // Fetch catalogue products
      try {
        const productsRes = await getCatalogueProducts({
          pageLimit: -1,
          pageNumber: 1,
        });
        const productsData = extractData(productsRes);
        setCatalogueProducts(productsData);
      } catch (error) {
        setError((prev) => ({ ...prev, products: error.message }));
        // Fallback data
        setCatalogueProducts([
          {
            cpId: 1,
            cpName: "Jaket Pharaoh",
            ccId: 1,
            ccName: "Apparel",
            csId: 1,
            csName: "Jaket",
          },
          {
            cpId: 2,
            cpName: "Kemeja Lengan Panjang",
            ccId: 1,
            ccName: "Apparel",
            csId: 2,
            csName: "Kemeja",
          },
        ]);
      }

      // Fetch inventories
      try {
        const inventoriesRes = await getInventorySubcategories({
          pageLimit: -1,
          pageNumber: 1,
        });
        const inventoriesData = extractData(inventoriesRes);
        setInventories(inventoriesData);
      } catch (error) {
        setError((prev) => ({ ...prev, inventories: error.message }));
        // Fallback data
        setInventories([
          { iId: 1, iCode: "DRILL", iDescription: "American Drill" },
          { iId: 2, iCode: "CANVAS", iDescription: "Kanvas" },
        ]);
      }

      // Fetch sizes
      try {
        const sizesRes = await getSizes();
        const sizesData = extractData(sizesRes);
        setSizes(sizesData);
      } catch (error) {
        setError((prev) => ({ ...prev, sizes: error.message }));
        // Fallback data
        setSizes([
          { sId: 1, sName: "S" },
          { sId: 2, sName: "M" },
          { sId: 3, sName: "L" },
          { sId: 4, sName: "XL" },
          { sId: 5, sName: "XXL" },
        ]);
      }

      setDataLoading(false);
    };

    fetchData();
  }, [extractData]);

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!leftSectionRef.current) return;
          // Simple fixed positioning - no footer interaction needed
          setLeftSectionStyle({ position: "fixed", top: 80 });
          ticking = false;
        });
        ticking = true;
      }
    }

    function handleResize() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!leftSectionRef.current) return;
          setLeftSectionStyle({ position: "fixed", top: 80 });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [leftSectionRef]);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  const addOrder = useCallback(() => {
    setOrders((prev) => {
      const newOrder = {
        id: Math.max(...prev.map((o) => o.id)) + 1,
        isExpanded: true,
      };
      return [...prev, newOrder];
    });
  }, []);

  const toggleOrder = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, isExpanded: !order.isExpanded }
          : order,
      ),
    );
  }, []);

  const deleteOrder = useCallback((orderId) => {
    setOrders((prev) => {
      // Mencegah penghapusan jika hanya ada satu order
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((order) => order.id !== orderId);
    });

    setOrderItemsData((prev) => {
      const newData = { ...prev };
      delete newData[orderId]; // Hapus data order yang dihapus
      return newData;
    });
  }, []);

  // Handle order data changes from OrderSection
  const handleOrderDataChange = useCallback((orderNumber, orderData) => {
    setOrderItemsData((prev) => ({
      ...prev,
      [orderNumber]: orderData,
    }));
  }, []);

  const handleSubmitOrder = useCallback(async () => {
    // Validate form data
    const requiredFields = [
      "contactName",
      "contactPhone",
      "contactAddress",
      "deadline",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      const fieldNames = {
        contactName: "Nama",
        contactPhone: "Nomor Telepon",
        contactAddress: "Alamat",
        deadline: "Deadline",
      };
      const missingFieldNames = missingFields
        .map((field) => fieldNames[field])
        .join(", ");
      toast.error(`Mohon lengkapi: ${missingFieldNames}`);
      return;
    }

    // Validate order items data
    const orderItemsArray = Object.values(orderItemsData);
    if (orderItemsArray.length === 0) {
      toast.error("Mohon lengkapi minimal satu item pesanan!");
      return;
    }

    // Validate each order item
    const invalidOrders = [];
    for (const [orderNum, orderData] of Object.entries(orderItemsData)) {
      if (
        !orderData.cpId ||
        !orderData.isId ||
        orderData.oiSizes.length === 0
      ) {
        invalidOrders.push(orderNum);
      }
    }

    if (invalidOrders.length > 0) {
      toast.error(
        `Order ${invalidOrders.join(", ")}: Mohon lengkapi produk, bahan, dan minimal satu ukuran!`,
      );
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading("Mengirim pesanan...");

    try {
      // Prepare submission data matching API structure from example value
      const submissionData = {
        oPoNumber: formData.posNumber || "-", // Auto-fill with "-" if empty
        oNotes: note || "", // Global notes for all orders
        oName: formData.contactName,
        oPhone: formData.contactPhone,
        oAddress: formData.contactAddress,
        oDeadlineAt: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : new Date().toISOString(),
        oItems: orderItemsArray.map((orderData) => ({
          cpId: orderData.cpId,
          isId: orderData.isId,
          oiMockupImage: [], // Will be populated after file upload
          oiSizes: orderData.oiSizes,
        })),
      };

      // Upload mockup images first
      // for (const orderData of orderItemsArray) {
      //   if (orderData.mockupFiles && orderData.mockupFiles.length > 0) {
      //     for (const file of orderData.mockupFiles) {
      //       const uploadRes = await uploadOrderMockupImage(file);
      //       if (uploadRes.data && uploadRes.data.url) {
      //         mockupUrls.push(uploadRes.data.url);
      //       }
      //     }
      //   }
      // }

      const mockupUrls = await Promise.all(
        orderItemsArray.map(async (orderData) => {
          const tempUrls = await Promise.all(
            orderData.mockupFiles.map(async (file) => {
              const uploadRes = await uploadOrderMockupImage(file);
              return uploadRes.data?.url || null;
            }),
          );

          // filter null (kalau ada gagal upload)
          return tempUrls.filter(Boolean);
        }),
      );

      console.log("Mockup URLs:", mockupUrls);

      submissionData.oItems = submissionData.oItems.map((item, index) => {
        return {
          ...item,
          oiMockupImage: mockupUrls[index] || [], // Assign the mockup URLs for each order item
        };
      });

      // Update submission data with mockup URLs
      // submissionData.oItems = submissionData.oItems.map(item => ({
      //   ...item,
      //   oiMockupImage: mockupUrls
      // }));

      console.log("Submission Data:", submissionData);

      // Create order
      const order = await createOrder(submissionData);
      const orderId = order.data.data.oId;

      // Show success toast
      toast.update(loadingToastId, {
        render:
          "Pesanan berhasil dikirim! Tim kami akan segera menghubungi Anda.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Reset form after successful submission
      setFormData({
        posNumber: "",
        deadline: new Date().toISOString().slice(0, 16),
        contactName: "",
        contactPhone: "",
        contactAddress: "",
      });
      setNote("");
      setOrderItemsData({});
      // Navigate to Payment Await page
      navigate(`/payment-await/${orderId}`);
    } catch (error) {
      // Show error toast
      toast.update(loadingToastId, {
        render:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  }, [formData, orderItemsData, navigate, note]);

  return (
    <>
      <StickyNavbar />
      <div
        className={`flex flex-row items-start mb-16 bg-gray-100 min-h-screen relative transition-opacity duration-700 ${animatePage ? "opacity-100" : "opacity-0"}`}
      >
        {/* Left Section */}
        <div
          id="left-section"
          ref={leftSectionRef}
          style={{
            position: leftSectionStyle.position,
            top: leftSectionStyle.top,
            left: 0,
            height:
              leftSectionStyle.position === "absolute"
                ? "calc(100% - 5rem)"
                : undefined,
            width: "50%",
            zIndex: 10,
            transition: "top 0.3s, position 0.3s",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className={
            "hidden md:flex flex-row items-start rounded-tr-[30px] rounded-br-[30px] px-12 pt-10 relative " +
            (leftSectionStyle.position === "fixed"
              ? " h-[calc(100vh-5rem)]"
              : "")
          }
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 rounded-tr-[30px] rounded-br-[30px] z-0" />
          {/* Konten teks di atas overlay */}
          <div className="relative z-10 flex flex-row items-start w-full">
            <img
              src={secondaryLogoWhite}
              alt="Zumar Logo"
              className="w-56 max-w-[220px] flex-shrink-0 mr-10"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-white text-5xl font-bold font-poppins leading-[1.1] mb-6 text-left">
                Jelasin
                <br />
                Kebutuhan
                <br />
                Kamu
              </h1>
              <p className="text-[#D9D9D9] text-base max-w-md font-montserrat text-left">
                Lorem ipsum dolor sit amet consectetur. Non sed commodo sed
                fermentum aliquam vulputate volutpat tortor hac.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex flex-col items-center py-10 px-4 md:px-16 md:ml-[50%]">
          {dataLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryColor mx-auto mb-6"></div>
                <p className="text-primaryColor font-semibold text-lg">
                  Memuat data...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Mohon tunggu sebentar
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`w-full max-w-xl space-y-6 font-montserrat transition-all duration-700 ${animatePage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {/* Menampilkan error jika ada */}
              {error && Object.keys(error).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-semibold">
                        Terjadi beberapa error saat memuat data. Menggunakan
                        data fallback.
                      </p>
                      <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                        {error.products && <li>Products: {error.products}</li>}
                        {error.subCategories && (
                          <li>Subcategories: {error.subCategories}</li>
                        )}
                        {error.inventories && (
                          <li>Inventories: {error.inventories}</li>
                        )}
                        {error.sizes && <li>Sizes: {error.sizes}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Nomor POS - hanya muncul sekali */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Nomor POS
                </label>
                <div className="relative flex items-center group">
                  <input
                    type="text"
                    placeholder="Masukkan Nomor POS"
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-2 px-0 text-base focus:outline-none focus:border-primaryColor placeholder:text-gray-400"
                    value={formData.posNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        posNumber: e.target.value,
                      }))
                    }
                  />
                  <div className="absolute right-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-secondaryColor" />
                  </div>
                  {/* Hover Info */}
                  <div className="absolute right-0 top-8 bg-orange-50 border border-orange-200 rounded p-2 w-64 text-xs text-secondaryColor opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Nomor POS adalah nomor pemesanan atau referensi yang
                    diberikan oleh sistem atau admin. Jika tidak tahu, silakan
                    kosongkan.
                  </div>
                </div>
              </div>

              {/* Pilih Deadline - hanya muncul sekali */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Pilih Deadline<span className="text-red-400 ml-1">*</span>
                </label>

                <div className="relative flex items-center">
                  <input
                    type="date"
                    placeholder="dd/mm/yyyy"
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-2 px-0 text-base focus:outline-none focus:border-primaryColor"
                    min={new Date().toISOString().slice(0, 16)}
                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)}
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Teks tambahan di bawah input */}
                <p className="text-xs text-black-400 mt-1">
                  Pengambilan pesanan hanya dilayani mulai jam 07.00 s/d 19.00<span className="text-black-400 ml-1">*</span>
                </p>
              </div>

              {/* Orders Sections */}
              {orders.map((order) => (
                <OrderSection
                  key={order.id}
                  orderNumber={order.id}
                  isExpanded={order.isExpanded}
                  onToggle={() => toggleOrder(order.id)}
                  onDelete={() => deleteOrder(order.id)}
                  totalOrders={orders.length}
                  catalogueProducts={catalogueProducts}
                  categories={categories}
                  subcategories={subcategories}
                  inventories={inventories}
                  sizes={sizes}
                  onOrderDataChange={handleOrderDataChange}
                />
              ))}

              {/* Tambah Order Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addOrder}
                  className="flex items-center gap-2 bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-secondaryColor transition-colors font-semibold"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Order
                </button>
              </div>

              {/* Notes Section - Global untuk semua order */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm text-gray-500 mb-2">
                  Any note you want to tell us?
                </label>
                <textarea
                  className="w-full border border-primaryColor bg-transparent py-2 px-3 text-base focus:outline-none placeholder:text-gray-400 text-center resize-none rounded-none"
                  placeholder="Any note you want to tell us?"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informasi Kontak Pemesan
                </h3>

                {/* Nama */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Nama<span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Budi"
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-2 px-0 text-base focus:outline-none focus:border-primaryColor placeholder:text-gray-400"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactName: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Nomor Telepon<span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="081123456789"
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-2 px-0 text-base focus:outline-none focus:border-primaryColor placeholder:text-gray-400"
                    value={formData.contactPhone}
                    onChange={(e) => {
                      // Hanya izinkan angka
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({ ...prev, contactPhone: value }));
                    }}
                    onKeyPress={(e) => {
                      // Prevent non-numeric input
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                {/* Alamat Pengiriman */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Alamat Pengiriman<span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Jl. Blimbingham No.12"
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-2 px-0 text-base focus:outline-none focus:border-primaryColor placeholder:text-gray-400"
                    value={formData.contactAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactAddress: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-semibold ${
                    dataLoading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-primaryColor text-white hover:bg-secondaryColor hover:scale-105 active:scale-95"
                  }`}
                  disabled={dataLoading}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {dataLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </span>
                  ) : (
                    "Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
