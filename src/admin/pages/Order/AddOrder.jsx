import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCatalogueCategories } from "../../../api/Catalogue/catalogueCategory";
import { getCatalogueSubCategories } from "../../../api/Catalogue/catalogueSubCategory";
import {
  createOrder,
  getCatalogueProducts,
  getInventorySubcategories,
  getSizes,
  uploadOrderMockupImage,
} from "../../../api/Order/order";
import SearchableDropdown from "../../../components/SearchableDropdown";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const AddOrder = () => {
  const navigate = useNavigate();

  // States
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states sesuai dengan Swagger specification
  const [formData, setFormData] = useState({
    oPoNumber: "",
    oNotes: "",
    oName: "",
    oPhone: "",
    oAddress: "",
    oDeadlineAt: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm (Required field)
    oItems: [
      {
        cpId: 0,
        isId: 0,
        oiMockupImage: [],
        oiSizes: [
          {
            sId: 0,
            oisAmount: 0,
          },
        ],
      },
    ],
  });

  // Data for dropdowns
  const [catalogueProducts, setCatalogueProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [inventoryStocks, setInventoryStocks] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Image preview states (like AddCatalogue)
  const [imagePreviewUrls, setImagePreviewUrls] = useState({});

  // Cleanup preview URLs on unmount (like AddCatalogue)
  useEffect(() => {
    return () => {
      Object.values(imagePreviewUrls).forEach((urls) => {
        if (Array.isArray(urls)) {
          urls.forEach((url) => URL.revokeObjectURL(url));
        }
      });
    };
  }, [imagePreviewUrls]);

  // Upload images function
  const uploadImages = async (files) => {
    const imageUrls = [];

    for (const file of files) {
      const response = await uploadOrderMockupImage(file);
      if (response.data && response.data.url) {
        imageUrls.push(response.data.url);
      }
    }

    return imageUrls;
  };

  // Extract data helper
  const extractData = useCallback((response) => {
    if (!response || !response.data) return [];

    // Check for paginated response format
    if (response.data.data && Array.isArray(response.data.data.listData)) {
      return response.data.data.listData;
    }
    // Check for direct array response
    else if (Array.isArray(response.data)) {
      return response.data;
    }
    // Check for nested data structure
    else if (response.data.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }

    return [];
  }, []);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      setFetchError(null);

      let hasErrors = false;
      const errors = [];

      try {
        console.log("Starting data fetch...");

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
        let productsData = [];
        try {
          const productsRes = await getCatalogueProducts();
          console.log("Products response:", productsRes);
          productsData = extractData(productsRes);
          console.log("Extracted products data:", productsData);

          if (productsData.length === 0) {
            errors.push("Produk katalog tidak ditemukan");
            hasErrors = true;
            productsData = [
              {
                cpId: 1,
                cpName: "Test Product 1",
                ccId: 1,
                ccName: "Category 1",
              },
              {
                cpId: 2,
                cpName: "Test Product 2",
                ccId: 1,
                ccName: "Category 1",
              },
            ];
          }
        } catch (err) {
          console.error("Error fetching products:", err);
          errors.push("Gagal memuat produk katalog");
          hasErrors = true;
          productsData = [
            {
              cpId: 1,
              cpName: "Test Product 1",
              ccId: 1,
              ccName: "Category 1",
            },
            {
              cpId: 2,
              cpName: "Test Product 2",
              ccId: 1,
              ccName: "Category 1",
            },
          ];
        }
        setCatalogueProducts(productsData);

        // Fetch inventory stocks
        let inventoriesData = [];
        try {
          const inventoriesRes = await getInventorySubcategories();
          console.log("Inventories response:", inventoriesRes);
          inventoriesData = extractData(inventoriesRes);
          console.log("Extracted inventories data:", inventoriesData);

          if (inventoriesData.length === 0) {
            errors.push("Data inventory tidak ditemukan");
            hasErrors = true;
            inventoriesData = [
              {
                iId: 1,
                isId: 1,
                iCode: "STOCK001",
                iDescription: "Test Stock 1",
              },
              {
                iId: 2,
                isId: 2,
                iCode: "STOCK002",
                iDescription: "Test Stock 2",
              },
            ];
          }
        } catch (err) {
          console.error("Error fetching inventories:", err);
          errors.push("Gagal memuat data inventory");
          hasErrors = true;
          inventoriesData = [
            {
              iId: 1,
              isId: 1,
              iCode: "STOCK001",
              iDescription: "Test Stock 1",
            },
            {
              iId: 2,
              isId: 2,
              iCode: "STOCK002",
              iDescription: "Test Stock 2",
            },
          ];
        }
        setInventoryStocks(inventoriesData);

        // Fetch sizes
        let sizesData = [];
        try {
          const sizesRes = await getSizes();
          console.log("Sizes response:", sizesRes);
          sizesData = extractData(sizesRes);
          console.log("Extracted sizes data:", sizesData);

          if (sizesData.length === 0) {
            errors.push("Data ukuran tidak ditemukan");
            hasErrors = true;
            sizesData = [
              { sId: 1, sName: "S" },
              { sId: 2, sName: "M" },
              { sId: 3, sName: "L" },
              { sId: 4, sName: "XL" },
            ];
          }
        } catch (err) {
          console.error("Error fetching sizes:", err);
          errors.push("Gagal memuat data ukuran");
          hasErrors = true;
          sizesData = [
            { sId: 1, sName: "S" },
            { sId: 2, sName: "M" },
            { sId: 3, sName: "L" },
            { sId: 4, sName: "XL" },
          ];
        }
        setSizes(sizesData);

        // Set error message if any data failed to load
        if (hasErrors) {
          const errorMessage = `Data berikut tidak berhasil dimuat: ${errors.join(", ")}. Menggunakan data fallback untuk testing.`;
          setFetchError(errorMessage);
          console.warn("Data loading completed with errors:", errorMessage);
        } else {
          console.log("All data loaded successfully");
        }
      } catch (err) {
        console.error("Critical error during data fetch:", err);
        setFetchError(
          "Terjadi kesalahan sistem saat memuat data. Menggunakan data fallback.",
        );

        // Set all fallback data
        setCatalogueProducts([
          { cpId: 1, cpName: "Test Product 1", ccId: 1 },
          { cpId: 2, cpName: "Test Product 2", ccId: 1 },
        ]);

        setInventoryStocks([
          { iId: 1, isId: 1, iCode: "STOCK001", iDescription: "Test Stock 1" },
          { iId: 2, isId: 2, iCode: "STOCK002", iDescription: "Test Stock 2" },
        ]);

        setSizes([
          { sId: 1, sName: "S" },
          { sId: 2, sName: "M" },
          { sId: 3, sName: "L" },
          { sId: 4, sName: "XL" },
        ]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [extractData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "oDeadlineAt"
          ? value || new Date().toISOString().slice(0, 16)
          : value,
    }));
  };

  // Debug: Log state changes (simplified)
  useEffect(() => {
    console.log("Dropdown data loaded:", {
      products: catalogueProducts?.length || 0,
      stocks: inventoryStocks?.length || 0,
      sizes: sizes?.length || 0,
    });
  }, [catalogueProducts, inventoryStocks, sizes]);

  const handleOrderItemChange = (itemIndex, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.oItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        [field]: value,
      };
      return {
        ...prev,
        oItems: newItems,
      };
    });
  };

  const handleSizeChange = (itemIndex, sizeIndex, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.oItems];
      newItems[itemIndex].oiSizes[sizeIndex] = {
        ...newItems[itemIndex].oiSizes[sizeIndex],
        [field]: value,
      };
      return {
        ...prev,
        oItems: newItems,
      };
    });
  };

  const addOrderItem = () => {
    setFormData((prev) => ({
      ...prev,
      oItems: [
        ...prev.oItems,
        {
          cpId: "",
          isId: "",
          oiMockupImage: [],
          oiSizes: [
            {
              sId: "",
              oisAmount: "",
            },
          ],
        },
      ],
    }));
  };

  const removeOrderItem = (itemIndex) => {
    if (formData.oItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        oItems: prev.oItems.filter((_, index) => index !== itemIndex),
      }));
    }
  };

  const addSizeToItem = (itemIndex) => {
    setFormData((prev) => {
      const newItems = [...prev.oItems];
      const currentItem = { ...newItems[itemIndex] };
      currentItem.oiSizes = [
        ...currentItem.oiSizes,
        {
          sId: "",
          oisAmount: "",
        },
      ];
      newItems[itemIndex] = currentItem;
      return {
        ...prev,
        oItems: newItems,
      };
    });
  };

  const removeSizeFromItem = (itemIndex, sizeIndex) => {
    setFormData((prev) => {
      const newItems = [...prev.oItems];
      if (newItems[itemIndex].oiSizes.length > 1) {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          oiSizes: newItems[itemIndex].oiSizes.filter(
            (_, index) => index !== sizeIndex,
          ),
        };
      }
      return {
        ...prev,
        oItems: newItems,
      };
    });
  };

  const handleMockupImageChange = (itemIndex, files) => {
    const imageFiles = Array.from(files);

    // Validasi file
    const validFiles = imageFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
        file.type,
      );
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== imageFiles.length) {
      toast.error(
        "Beberapa file tidak valid. Hanya file JPG, PNG dengan ukuran maksimal 5MB yang diperbolehkan.",
      );
      return;
    }

    setFormData((prev) => {
      const newItems = [...prev.oItems];
      newItems[itemIndex].oiMockupImage = validFiles;
      return {
        ...prev,
        oItems: newItems,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation sesuai dengan struktur data yang benar
    const validationErrors = [];

    // Required fields validation (based on Swagger specification)
    if (!formData.oDeadlineAt) validationErrors.push("Deadline wajib diisi");

    // Order items validation
    if (formData.oItems.length === 0) {
      validationErrors.push("Minimal harus ada satu item pesanan");
    } else {
      formData.oItems.forEach((item, index) => {
        if (!item.cpId || item.cpId === 0) {
          validationErrors.push(
            `Item ${index + 1}: Produk katalog wajib dipilih`,
          );
        }
        if (!item.isId || item.isId === 0) {
          validationErrors.push(
            `Item ${index + 1}: Inventory stock wajib dipilih`,
          );
        }
        if (!item.oiSizes || item.oiSizes.length === 0) {
          validationErrors.push(
            `Item ${index + 1}: Minimal satu ukuran harus dipilih`,
          );
        } else {
          item.oiSizes.forEach((size, sizeIndex) => {
            if (!size.sId || size.sId === 0) {
              validationErrors.push(
                `Item ${index + 1} Ukuran ${sizeIndex + 1}: Ukuran wajib dipilih`,
              );
            }
            if (!size.oisAmount || size.oisAmount <= 0) {
              validationErrors.push(
                `Item ${index + 1} Ukuran ${sizeIndex + 1}: Jumlah harus lebih dari 0`,
              );
            }
          });
        }
      });
    }

    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    setSaving(true);
    setUploading(true);
    try {
      // Prepare data for submission sesuai example value
      const submitData = {
        oPoNumber: formData.oPoNumber || "",
        oNotes: formData.oNotes || "",
        oName: formData.oName,
        oPhone: formData.oPhone,
        oAddress: formData.oAddress,
        oDeadlineAt: new Date(formData.oDeadlineAt).toISOString(), // Convert to full ISO string for API
        oItems: formData.oItems.map((item) => ({
          cpId: parseInt(item.cpId) || 0,
          isId: parseInt(item.isId) || 0,
          oiMockupImage: [], // Will be populated after upload
          oiSizes: item.oiSizes.map((size) => ({
            sId: parseInt(size.sId) || 0,
            oisAmount: parseInt(size.oisAmount) || 0,
          })),
        })),
      };

      // Upload mockup images per item
      for (let i = 0; i < formData.oItems.length; i++) {
        const item = formData.oItems[i];
        if (item.oiMockupImage && item.oiMockupImage.length > 0) {
          const urls = await uploadImages(item.oiMockupImage);
          submitData.oItems[i].oiMockupImage = urls;
        }
      }

      setUploading(true);

      await createOrder(submitData);
      // Show success toast
      toast.success(
        "Pesanan berhasil dibuat! Tim kami akan segera menghubungi Anda.",
      );
      navigate("/admin/order/list");
    } catch (err) {
      setUploading(false);
      toast.error(
        "Gagal membuat pesanan: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div className="flex-1 overflow-x-hidden">
          <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
              <p className="text-primaryColor font-semibold">Memuat data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "1000px auto",
        backgroundPosition: "center",
        opacity: 1,
      }}
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 font-montserrat">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/order/list")}
              className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primaryColor">
                Tambah Pesanan Baru
              </h1>
              <p className="text-gray-600">
                Buat pesanan baru dengan detail lengkap
              </p>
            </div>
          </div>

          {/* Error Message */}
          {fetchError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{fetchError}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                    >
                      Refresh Halaman
                    </button>
                    <button
                      onClick={() => setFetchError(null)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      Tutup Peringatan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Informasi Pesanan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nomor PO
                  </label>
                  <input
                    type="text"
                    value={formData.oPoNumber}
                    onChange={(e) =>
                      handleInputChange("oPoNumber", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    placeholder="Contoh: PO123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Pemesan<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.oName}
                    onChange={(e) => handleInputChange("oName", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    placeholder="Budi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telepon<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.oPhone}
                    onChange={(e) => {
                      // Hanya izinkan angka
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange("oPhone", value);
                    }}
                    onKeyPress={(e) => {
                      // Prevent non-numeric input
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    placeholder="081234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deadline<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.oDeadlineAt}
                    onChange={(e) =>
                      handleInputChange("oDeadlineAt", e.target.value)
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)}
                    onKeyDown={(e) => e.preventDefault()}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Alamat<span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={formData.oAddress}
                    onChange={(e) =>
                      handleInputChange("oAddress", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    placeholder="Alamat lengkap pemesan"
                    rows={3}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Catatan Pesanan
                  </label>
                  <textarea
                    value={formData.oNotes}
                    onChange={(e) =>
                      handleInputChange("oNotes", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                    placeholder="Catatan untuk seluruh pesanan"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primaryColor mb-4">
                Item Pesanan
              </h2>

              <div className="space-y-4">
                {formData.oItems.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg text-primaryColor">
                        Item #{itemIndex + 1}
                      </h3>
                      {formData.oItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrderItem(itemIndex)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Hapus Item
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Kategori <span className="text-red-500 ml-1">*</span>
                        </label>
                        <SearchableDropdown
                          data={categories}
                          value={item.ccId ? item.ccId : ""}
                          onSelect={(value) => {
                            if (item.ccId === value.ccId) return;
                            handleOrderItemChange(
                              itemIndex,
                              "ccId",
                              value.ccId,
                            );
                          }}
                          onChange={(searchTerm) => {
                            if (!searchTerm) {
                              handleOrderItemChange(itemIndex, "ccId", 0);
                              handleOrderItemChange(itemIndex, "csId", 0);
                              handleOrderItemChange(itemIndex, "cpId", 0);
                              handleOrderItemChange(itemIndex, "isId", 0);
                            }
                          }}
                          labelKey="ccName"
                          valueKey="ccId"
                          placeholder={"Pilih Kategori"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Sub Kategori{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <SearchableDropdown
                          data={subcategories.filter(
                            (i) => i.ccId === item.ccId,
                          )}
                          labelKey="csName"
                          valueKey="csId"
                          value={item.csId ? item.csId : ""}
                          onSelect={(value) => {
                            if (item.csId === value.csId) return;
                            handleOrderItemChange(
                              itemIndex,
                              "csId",
                              value.csId,
                            );
                          }}
                          onChange={(searchTerm) => {
                            if (!searchTerm) {
                              handleOrderItemChange(itemIndex, "csId", 0);
                              handleOrderItemChange(itemIndex, "cpId", 0);
                              handleOrderItemChange(itemIndex, "isId", 0);
                            }
                          }}
                          placeholder={"Pilih Sub Katgori"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Produk <span className="text-red-500 ml-1">*</span>
                        </label>
                        <SearchableDropdown
                          data={catalogueProducts.filter(
                            (product) => product.csId === item.csId,
                          )}
                          value={item.cpId ? item.cpId : ""}
                          onSelect={(value) => {
                            if (item.cpId === value.cpId) return;
                            handleOrderItemChange(
                              itemIndex,
                              "cpId",
                              value.cpId,
                            );
                          }}
                          onChange={(searchTerm) => {
                            if (!searchTerm) {
                              handleOrderItemChange(itemIndex, "cpId", 0);
                              handleOrderItemChange(itemIndex, "isId", 0);
                            }
                          }}
                          labelKey="cpName"
                          valueKey="cpId"
                          placeholder={"Pilih Produk"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Bahan <span className="text-red-500 ml-1">*</span>
                        </label>
                        <SearchableDropdown
                          data={
                            catalogueProducts?.find(
                              (product) => product.cpId === item.cpId,
                            )?.cpIsItems || []
                          }
                          value={item.isId ? item.isId : ""}
                          labelKey="isName"
                          valueKey="isId"
                          onChange={(searchTerm) => {
                            if (!searchTerm) {
                              handleOrderItemChange(itemIndex, "isId", 0);
                            }
                          }}
                          onSelect={(value) => {
                            if (item.isId === value.isId) return;
                            handleOrderItemChange(
                              itemIndex,
                              "isId",
                              value.isId,
                            );
                          }}
                          placeholder={"Pilih Bahan"}
                        />
                      </div>
                    </div>

                    {/* Mockup Images */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Mockup Images
                      </label>
                      <input
                        type="file"
                        id={`mockup-upload-${itemIndex}`}
                        multiple
                        siz
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) =>
                          handleMockupImageChange(itemIndex, e.target.files)
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor={`mockup-upload-${itemIndex}`}
                        className="bg-primaryColor text-white px-6 py-2 rounded hover:bg-primaryColor/90 cursor-pointer inline-block"
                      >
                        Upload
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Format: JPG, JPEG, PNG. Maksimal 5MB per file.
                      </p>

                      {/* Image Preview */}
                      <div className="space-y-2 mt-4">
                        {item.oiMockupImage.length === 0 ? (
                          <div className="text-gray-400 text-sm">
                            No files uploaded yet
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.oiMockupImage.map((img, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 bg-gray-50 p-2 rounded"
                              >
                                <span
                                  className="font-semibold text-gray-700 truncate flex-1"
                                  title={img.name}
                                >
                                  {img.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({Math.round(img.size / 1024)}KB)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFiles = [...item.oiMockupImage];
                                    newFiles.splice(idx, 1);
                                    handleOrderItemChange(
                                      itemIndex,
                                      "oiMockupImage",
                                      newFiles,
                                    );

                                    // Cleanup preview URL
                                    if (
                                      imagePreviewUrls[itemIndex] &&
                                      imagePreviewUrls[itemIndex][idx]
                                    ) {
                                      URL.revokeObjectURL(
                                        imagePreviewUrls[itemIndex][idx],
                                      );
                                      const newUrls = { ...imagePreviewUrls };
                                      newUrls[itemIndex].splice(idx, 1);
                                      setImagePreviewUrls(newUrls);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sizes and Amounts */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">
                          Ukuran dan Jumlah
                        </h4>
                        <button
                          type="button"
                          onClick={() => addSizeToItem(itemIndex)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Tambah Ukuran
                        </button>
                      </div>

                      <div className="space-y-3">
                        {item.oiSizes.map((size, sizeIndex) => (
                          <div
                            key={sizeIndex}
                            className="flex items-center gap-3"
                          >
                            <div className="flex-1">
                              <label className="block text-xs font-medium mb-1">
                                Ukuran{" "}
                                <span className="text-red-500 ml-1">*</span>
                              </label>
                              <SearchableDropdown
                                options={sizes.map((product) => ({
                                  id: product.sId,
                                  name: product.sName,
                                }))}
                                data={sizes}
                                labelKey="sName"
                                valueKey="sId"
                                onSelect={(value) => {
                                  handleSizeChange(
                                    itemIndex,
                                    sizeIndex,
                                    "sId",
                                    value.sId,
                                  );
                                }}
                                placeholder={"Pilih Ukuran"}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium mb-1">
                                Jumlah{" "}
                                <span className="text-red-500 ml-1">*</span>
                              </label>
                              <input
                                type="number"
                                value={size.oisAmount}
                                onChange={(e) =>
                                  handleSizeChange(
                                    itemIndex,
                                    sizeIndex,
                                    "oisAmount",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor text-sm"
                                placeholder="Jumlah pcs"
                                min="1"
                                onWheel={(e) => e.currentTarget.blur()}
                                required
                              />
                            </div>
                            {item.oiSizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeSizeFromItem(itemIndex, sizeIndex)
                                }
                                className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 mt-5"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="flex items-center gap-2 px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Item
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/order/list")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-6 py-3 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 disabled:opacity-50"
              >
                {uploading
                  ? "Mengupload gambar..."
                  : saving
                    ? "Menyimpan..."
                    : "Buat Pesanan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;
