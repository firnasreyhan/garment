import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getOperationalUtilityTemplateDetail,
  updateOperationalUtilityTemplate,
} from "../../../api/rab-template/rab-template";
import { formatCurrency } from "../../../utils";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

export default function RABTemplateDetail() {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    outName: "",
    outOperational: [
      {
        name: "",
        price: 0,
      },
    ],
    outUtility: [
      {
        name: "",
        price: 0,
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleOutOperationalChange = (index, value) => {
    setFormData((prev) => {
      const newOperational = prev.outOperational
        ? [...prev.outOperational]
        : [];
      newOperational[index] = value;
      return {
        ...prev,
        outOperational: newOperational,
      };
    });
  };

  const handleOutUtilityChange = (index, value) => {
    setFormData((prev) => {
      const newUtility = prev.outUtility ? [...prev.outUtility] : [];
      newUtility[index] = value;
      return {
        ...prev,
        outUtility: newUtility,
      };
    });
  };

  const fetchTemplateDetail = async (templateId) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getOperationalUtilityTemplateDetail(templateId);
      const data = response.data.data;
      setFormData(data);
    } catch (error) {
      console.log("Error fetching template detail:", error);
      setErrorMessage("Gagal mendapatkan template");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTemplateDetail(id);
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await updateOperationalUtilityTemplate({
        outId: Number(id),
        outName: formData.outName,
        outOperational: formData.outOperational,
        outUtility: formData.outUtility,
      });

      setSuccessMessage("Berhasil menyimpan template");
      fetchTemplateDetail(id);
    } catch (error) {
      console.log("Error saving template:", error);
      setErrorMessage("Gagal menyimpan template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen overflow-x-hidden"
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
      />
      <div className="flex-1 min-w-0">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />

        <div className="mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/rab-template")}
              className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primaryColor">
                Edit Template RABP
              </h1>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <XMarkIcon className="w-5 h-5 mr-2" />
                {errorMessage}
              </div>
            </div>
          )}

          <div className={`p-6 space-y-8`}>
            <form>
              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-black text-sm w-1/4">
                      Nama Template
                    </span>
                    <input
                      type="text"
                      value={formData.outName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          outName: e.target.value,
                        }))
                      }
                      required
                      placeholder="Masukkan nama template"
                      className="w-3/4 px-2 py-1  border border-gray-300 rounded text-black bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Kalkulasi Jasa Operasional */}
              <div className="bg-primaryColor rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-white">
                    Kalkulasi Jasa Operasional
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => {
                        return {
                          ...prev,
                          outOperational: [
                            ...prev.outOperational,
                            {
                              name: "",
                              price: 0,
                            },
                          ],
                        };
                      });
                    }}
                    className="bg-white text-primaryColor px-2 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-1 text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    {formData.outOperational?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              setFormData((prev) => {
                                return {
                                  ...prev,
                                  outOperational: [...prev.outOperational].map(
                                    (item, i) => {
                                      if (i === index) {
                                        return {
                                          ...item,
                                          name: e.target.value,
                                        };
                                      }
                                      return item;
                                    },
                                  ),
                                };
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                            placeholder="Nama Jasa"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.outOperational[index]?.price || 0}
                            onChange={(e) =>
                              handleOutOperationalChange(index, {
                                ...item,
                                price: parseInt(e.target.value) || 0,
                              })
                            }
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.outOperational.length === 1) return;

                            const newOperational =
                              formData.outOperational.filter(
                                (_, i) => i !== index,
                              );
                            setFormData((prev) => ({
                              ...prev,
                              outOperational: newOperational,
                            }));
                          }}
                          className="text-white hover:text-red-200"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium text-sm">
                        Jasa Operasional
                      </span>
                      <span className="text-white font-bold">
                        {formatCurrency(
                          formData.outOperational.reduce(
                            (total, item) => total + item.price,
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kalkulasi Utilities/Bekakas */}
              <div className="bg-secondaryColor rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-white">
                    Kalkulasi Utilities & Bekakas
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => {
                        return {
                          ...prev,
                          outUtility: [
                            ...prev.outUtility,
                            {
                              name: "",
                              price: 0,
                            },
                          ],
                        };
                      });
                    }}
                    className="bg-white text-primaryColor px-2 py-1 rounded-lg hover:bg-orange-50 flex items-center gap-1 text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    {formData.outUtility?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              setFormData((prev) => {
                                return {
                                  ...prev,
                                  outUtility: [...prev.outUtility].map(
                                    (item, i) => {
                                      if (i === index) {
                                        return {
                                          ...item,
                                          name: e.target.value,
                                        };
                                      }
                                      return item;
                                    },
                                  ),
                                };
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                            placeholder="Nama Utility"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            step="1"
                            value={formData.outUtility[index]?.price || 0}
                            onChange={(e) =>
                              handleOutUtilityChange(index, {
                                ...item,
                                price: parseInt(e.target.value) || 0,
                              })
                            }
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.outUtility.length === 1) return;
                            const newUtility = formData.outUtility.filter(
                              (_, i) => i !== index,
                            );
                            setFormData((prev) => ({
                              ...prev,
                              outUtility: newUtility,
                            }));
                          }}
                          className="text-white hover:text-red-200"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-orange-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium text-sm">
                        Utilities & Bekakas
                      </span>
                      <span className="text-white font-bold">
                        {formatCurrency(
                          formData.outUtility.reduce(
                            (total, item) => total + item.price,
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6 gap-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Template RABP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
