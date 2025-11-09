import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createCatalogueProduct,
  uploadCatalogueImages,
} from "../../../api/Catalogue/catalogue";
import { getCatalogueCategories } from "../../../api/Catalogue/catalogueCategory";
import { getCatalogueSubCategories } from "../../../api/Catalogue/catalogueSubCategory";
import { getInventorySubcategories } from "../../../api/Order/order";
import CKEditorInput from "../../../components/ckeditor-input";
import SearchableDropdown from "../../../components/SearchableDropdown";
import { checkDuplicatedItems } from "../../../utils";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const AddCatalogue = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [inventorySubcategories, setInventorySubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [newProduct, setNewProduct] = useState({
    ccId: "",
    csId: "",
    cpName: "",
    cpDescription: "",
    cpIsItems: [{ isId: 0, isName: "", price: 0 }],
    cpSnk: "",
    cpImage: [],
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesRes, subCategoriesRes, inventorySubcategoriesRes] =
          await Promise.all([
            getCatalogueCategories({ pageLimit: -1, pageNumber: 1 }),
            getCatalogueSubCategories({ pageLimit: -1, pageNumber: 1 }),
            getInventorySubcategories({ pageLimit: -1, pageNumber: 1 }),
          ]);
        setCategories(
          Array.isArray(categoriesRes.data.data.listData)
            ? categoriesRes.data.data.listData
            : [],
        );
        setSubCategories(
          Array.isArray(subCategoriesRes.data.data.listData)
            ? subCategoriesRes.data.data.listData
            : [],
        );
        setInventorySubcategories(
          Array.isArray(inventorySubcategoriesRes.data.data.listData)
            ? inventorySubcategoriesRes.data.data.listData
            : [],
        );
      } catch {
        setFormError("Gagal memuat data dropdown.");
      }
    };
    fetchDropdownData();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const filteredSubCategories = newProduct.ccId
    ? subCategories.filter(
        (sub) => String(sub.ccId) === String(newProduct.ccId),
      )
    : subCategories;

  // Fungsi upload gambar, return array URL gambar
  async function uploadImages(files) {
    try {
      // Upload satu per satu untuk menghindari masalah
      const imageUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await uploadCatalogueImages(formData);

          if (response.data && response.data.data && response.data.data.url) {
            imageUrls.push(response.data.data.url);
          } else {
            throw new Error(
              `Response format tidak sesuai untuk file ${file.name}`,
            );
          }
        } catch (fileError) {
          throw new Error(
            `Gagal upload file ${file.name}: ${fileError.message}`,
          );
        }
      }

      return imageUrls;
    } catch (error) {
      throw new Error(error.message || "Gagal upload gambar");
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    // Validasi gambar wajib diupload
    if (!newProduct.cpImage || newProduct.cpImage.length === 0) {
      setFormError("Gambar produk wajib diupload!");
      return;
    }

    const hasDuplicateItems = checkDuplicatedItems(
      newProduct.cpIsItems,
      "isId",
    );

    if (hasDuplicateItems) {
      setFormError("Bahan tidak boleh sama.");
      toast.error("Bahan tidak boleh sama.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload gambar dulu
      let imageUrls = [];
      if (newProduct.cpImage && newProduct.cpImage.length > 0) {
        try {
          imageUrls = await uploadImages(newProduct.cpImage);
        } catch (uploadError) {
          setFormError(`Gagal upload gambar: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      // 2. Submit katalog dengan JSON
      const payload = {
        csId: newProduct.csId,
        cpName: newProduct.cpName,
        cpDescription: newProduct.cpDescription,
        cpSnk: newProduct.cpSnk,
        cpImage: imageUrls, // array of URL
        cpIsItems: newProduct.cpIsItems.filter(
          (item) => item.isId && item.price >= 0,
        ),
      };

      console.log("AddCatalogue - Full payload:", payload);

      const response = await createCatalogueProduct(payload);
      console.log("AddCatalogue - Create response:", response.data);
      navigate("/admin/catalogue/list");
    } catch (err) {
      setFormError(
        err.response?.data?.remark || err.message || "Gagal menambah produk",
      );
    }
    setLoading(false);
  };

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
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
        <div className="max-w-4xl mx-auto py-10 px-4 font-montserrat">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/catalogue/list")}
              className="flex items-center gap-2 text-primaryColor hover:text-primaryColor/80"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-8 font-montserrat">
            <h1 className="text-3xl font-bold text-center text-primaryColor mb-2">
              TAMBAH PRODUK KATALOG
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Silakan isi form di bawah ini untuk menambah produk katalog baru.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex w-full flex-col">
                  <label
                    htmlFor="productCategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kategori<span className="text-red-500 ml-1">*</span>
                  </label>
                  <SearchableDropdown
                    data={categories}
                    labelKey="ccName"
                    valueKey="ccId"
                    placeholder="Cari kategori..."
                    value={newProduct.ccId}
                    onSelect={(category) => {
                      setNewProduct({
                        ...newProduct,
                        ccId: category.ccId,
                        csId: "",
                      });
                    }}
                  />
                  {/* <select
                    id="productCategory"
                    value={newProduct.ccId}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        ccId: e.target.value,
                        csId: "",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.ccId} value={cat.ccId}>
                        {cat.ccName}
                      </option>
                    ))}
                  </select> */}
                </div>
                <div className="flex w-full flex-col">
                  <label
                    htmlFor="productSubCategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sub Kategori<span className="text-red-500 ml-1">*</span>
                  </label>
                  <SearchableDropdown
                    data={filteredSubCategories}
                    labelKey="csName"
                    valueKey="csId"
                    placeholder="Cari sub kategori..."
                    value={newProduct.csId}
                    onSelect={(subcategory) => {
                      setNewProduct({
                        ...newProduct,
                        csId: subcategory.csId,
                      });
                    }}
                  />
                  {/* <select
                    id="productSubCategory"
                    value={newProduct.csId}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, csId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    required
                  >
                    <option value="">Pilih Sub Kategori</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub.csId} value={sub.csId}>
                        {sub.csName}
                      </option>
                    ))}
                  </select> */}
                </div>
                <div className="flex w-full flex-col md:flex-row md:col-span-2 gap-6">
                  <div className="flex w-full flex-col md:w-1/2">
                    <div className="flex w-full flex-col mb-6">
                      <label
                        htmlFor="productName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nama Produk<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id="productName"
                        type="text"
                        placeholder="Nama produk"
                        value={newProduct.cpName}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            cpName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                        required
                      />
                    </div>
                    <div className="flex w-full flex-col">
                      <label
                        htmlFor="productImage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Upload Gambar<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id="productImage"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          // Validasi file
                          const validFiles = files.filter((file) => {
                            const isValidType = [
                              "image/jpeg",
                              "image/jpg",
                              "image/png",
                            ].includes(file.type);
                            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
                            return isValidType && isValidSize;
                          });

                          if (validFiles.length !== files.length) {
                            setFormError(
                              "Beberapa file tidak valid. Hanya file JPG, PNG dengan ukuran maksimal 5MB yang diperbolehkan.",
                            );
                          } else {
                            setFormError("");
                          }

                          // Cleanup previous preview URLs
                          previewUrls.forEach((url) =>
                            URL.revokeObjectURL(url),
                          );

                          // Create new preview URLs
                          const newPreviewUrls = validFiles.map((file) =>
                            URL.createObjectURL(file),
                          );
                          setPreviewUrls(newPreviewUrls);

                          setNewProduct({ ...newProduct, cpImage: validFiles });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format yang didukung: JPG, PNG, WebP. Maksimal 5MB per
                        file.
                      </p>
                      {Array.isArray(newProduct.cpImage) &&
                        newProduct.cpImage.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {newProduct.cpImage.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img
                                  src={previewUrls[idx]}
                                  alt={`Preview ke-${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded-full">
                                  {Math.round(img.size / 1024)}KB
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex w-full flex-col md:w-1/2">
                    <label
                      htmlFor="productDesc"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Deskripsi
                    </label>
                    <CKEditorInput
                      id="productDesc"
                      placeholder="Deskripsi produk"
                      value={newProduct.cpDescription}
                      onChange={(value) => {
                        setNewProduct({
                          ...newProduct,
                          cpDescription: value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex w-full flex-col md:flex-row md:col-span-2 gap-6">
                  <div className="flex w-full flex-col md:w-1/2">
                    <div className="flex w-full flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bahan & Harga<span className="text-red-500 ml-1">*</span>
                      </label>
                      {newProduct.cpIsItems.map((item, index) => (
                        <div
                          className="shadow p-3 rounded-lg bg-white space-y-3 relative"
                          key={index}
                        >
                          {newProduct.cpIsItems.length > 1 && (
                            <button
                              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition"
                              type="button"
                              onClick={() => {
                                const updatedItems =
                                  newProduct.cpIsItems.filter(
                                    (_, i) => i !== index,
                                  );
                                setNewProduct({
                                  ...newProduct,
                                  cpIsItems: updatedItems,
                                });
                              }}
                            >
                              {" "}
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          )}

                          <div className="flex w-full flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Bahan {index + 1}<span className="text-red-500 ml-1">*</span>
                            </label>
                            <SearchableDropdown
                              data={inventorySubcategories}
                              labelKey="isName"
                              valueKey="isId"
                              placeholder="Cari bahan..."
                              value={newProduct.cpIsItems[index].isId}
                              onSelect={(inventory) => {
                                const updatedItems = [...newProduct.cpIsItems];
                                updatedItems[index] = {
                                  ...updatedItems[index],
                                  isId: inventory.isId,
                                  isName: inventory.isName,
                                };
                                setNewProduct({
                                  ...newProduct,
                                  cpIsItems: updatedItems,
                                });
                              }}
                              onChange={(searchTerm) => {
                                if (!searchTerm) {
                                  const updatedItems = [
                                    ...newProduct.cpIsItems,
                                  ];
                                  updatedItems[index] = {
                                    ...updatedItems[index],
                                    isId: 0,
                                    isName: "",
                                  };
                                  setNewProduct({
                                    ...newProduct,
                                    cpIsItems: updatedItems,
                                  });
                                }
                              }}
                              required
                            />
                          </div>
                          <div className="flex w-full flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Harga Bahan {index + 1}<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              type="number"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                              placeholder="Harga Bahan"
                              value={newProduct.cpIsItems[index].price}
                              onChange={(e) => {
                                const updatedItems = [...newProduct.cpIsItems];
                                updatedItems[index] = {
                                  ...updatedItems[index],
                                  price: e.target.value,
                                };
                                setNewProduct({
                                  ...newProduct,
                                  cpIsItems: updatedItems,
                                });
                              }}
                              required
                              min={0}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border-primaryColor border text-primaryColor font-bold text-sm transition-colors disabled:opacity-50 inline-flex w-max justify-center items-center gap-2 hover:bg-primaryColor/10"
                        onClick={() => {
                          setNewProduct({
                            ...newProduct,
                            cpIsItems: [
                              ...newProduct.cpIsItems,
                              { isId: 0, isName: "", price: 0 },
                            ],
                          });
                        }}
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Bahan
                      </button>
                    </div>
                  </div>
                  <div className="flex w-full flex-col md:w-1/2">
                    <label
                      htmlFor="productSnk"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      S&K
                    </label>

                    <CKEditorInput
                      id="productSnk"
                      placeholder="S&K produk"
                      value={newProduct.cpSnk}
                      onChange={(value) => {
                        setNewProduct({
                          ...newProduct,
                          cpSnk: value,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}
              <div className="flex justify-center gap-6 pt-8">
                <button
                  type="submit"
                  className="px-10 py-3 rounded-lg bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold text-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/catalogue/list")}
                  className="px-10 py-3 rounded-lg bg-[#FB5C5C] hover:bg-[#e04a4a] text-white font-bold text-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCatalogue;
