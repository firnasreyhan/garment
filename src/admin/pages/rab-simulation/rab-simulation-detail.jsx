import {
  ArrowLeftIcon,
  CheckIcon,
  ExclamationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createDummyOrderCostBudgetPlan,
  deleteDummyOrderCostBudgetPlanByDocbpId,
  getDummyOrderCostBudgetPlanSummaryDetail,
  updateDummyOrderCostBudgetPlan,
  updateDummyOrderCostBudgetPlanSummarySettingPercentage,
} from "../../../api/rab-simulation/rab-simulation";
import { formatCurrency } from "../../../utils";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

function sumArray(arr) {
  if (!Array.isArray(arr)) return 0; // antisipasi kalau bukan array
  return arr.reduce((total, num) => total + num, 0);
}

const PercentageModal = ({
  handleUpdatePercentage,
  handleCancel,
  percentageForm,
  setPercentageForm,
  isUpdatingPercentage,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h3 className="text-lg font-bold mb-4">Edit Persentase Pembagian</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Main & Develop (%)
            </label>
            <input
              type="number"
              value={percentageForm.mainDevelop}
              onChange={(e) =>
                setPercentageForm((prev) => ({
                  ...prev,
                  mainDevelop: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isUpdatingPercentage}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Insentif (%)
            </label>
            <input
              type="number"
              value={percentageForm.incentive}
              onChange={(e) =>
                setPercentageForm((prev) => ({
                  ...prev,
                  incentive: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isUpdatingPercentage}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Marketing (%)
            </label>
            <input
              type="number"
              value={percentageForm.marketing}
              onChange={(e) =>
                setPercentageForm((prev) => ({
                  ...prev,
                  marketing: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isUpdatingPercentage}
            />
          </div>
          <div className="text-sm text-gray-600">
            Total:{" "}
            {percentageForm.mainDevelop +
              percentageForm.incentive +
              percentageForm.marketing}
            %
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUpdatingPercentage}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleUpdatePercentage}
            disabled={isUpdatingPercentage}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdatingPercentage ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const tabStyles = {
  tab: "border-b border-gray-200",
  tabButton:
    "border-none outline-none cursor-pointer py-3 px-6 transition-all duration-300 font-medium",
  activeTabButton: "bg-primaryColor text-white",
  inactiveTabButton: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  tabContent: "p-6 bg-white rounded-b-xl shadow-md",
};

const DeleteConfirmationModal = ({ title, message, docbpId, fetchSummary }) => {
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleConfirmAction = async () => {
    setActionLoading(true);

    try {
      setShowModal(false);

      await deleteDummyOrderCostBudgetPlanByDocbpId(docbpId);

      await fetchSummary();
    } catch (err) {
      console.error("Error performing action:", err);
      setActionError(err.message || "Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className="flex items-center justify-center w-6 h-6 rounded-full transition-colors bg-red-500 text-white hover:bg-red-600"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-primaryColor">
              <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mt-4 text-primaryColor">
              {title}
            </h2>
            <p className="text-gray-500 mt-2">{message}</p>

            {actionError && (
              <div className="text-red-500 mt-2 text-sm">{actionError}</div>
            )}
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="button"
                className="w-full rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-400"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${"bg-red-500 hover:bg-red-600"}`}
                disabled={actionLoading}
              >
                {actionLoading ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RabSimulationItemsSection = ({
  summary,
  setErrorMessage,
  setSuccessMessage,
  fetchSummary,
}) => {
  const [activeItemTab, setActiveItemTab] = useState(
    summary?.docbpItems?.[0]?.docbpId || 0,
  );
  // Handler untuk pergantian tab
  const handleTabChange = (item) => {
    setActiveItemTab(item.docbpId);
  };

  const [showAddItemSection, setShowAddItemSection] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md mb-6 max-w-full">
      {!showAddItemSection && (
        <div className="p-4 bg-white border-b max-w-full overflow-x-auto">
          <div className={`${tabStyles.tab} inline-flex`}>
            {summary?.docbpItems?.map((item) => {
              return (
                <div
                  key={item.docbpId}
                  className={`${tabStyles.tabButton} flex items-center justify-center gap-4 ${
                    activeItemTab === item.docbpId
                      ? tabStyles.activeTabButton
                      : tabStyles.inactiveTabButton
                  }`}
                >
                  <button
                    onClick={() => handleTabChange(item)}
                    className=" whitespace-nowrap truncate"
                  >
                    {`${item.docbpName} - Size ${item.docbpSize} (${item.docbpAmount})`}
                  </button>
                  <DeleteConfirmationModal
                    title={"Hapus Item Simulasi RABP"}
                    message={`Apakah Anda yakin ingin menghapus item "${item.docbpName} - Size ${item.docbpSize}"?`}
                    docbpId={item.docbpId}
                    fetchSummary={fetchSummary}
                  />
                </div>
              );
            })}
            <button
              className="inline-flex items-center gap-2 bg-[#E87722] hover:bg-[#d96c1f] text-white p-3 transition-all"
              onClick={() => {
                setShowAddItemSection(true);
              }}
            >
              <PlusIcon className="w-5 h-5" />
              {summary.docbpItems.length > 0 ? "" : "Tambah Item"}
            </button>
          </div>
        </div>
      )}
      {showAddItemSection && (
        <RABSimulationItem
          item={{
            docbpsId: summary.docbpsId,
            docbpItems: [
              {
                docbpName: "",
                docbpSize: "",
                docbpAmount: 0,
                docbpMaterialName: "",
                docbpMaterialCode: "",
                docbpMaterialNeed: 0,
                docbpMaterialPrice: 0,
                docbpOperationalServiceColumn: [""],
                docbpOperationalServiceValue: [0],
                docbpUtilityColumn: [""],
                docbpUtilityValue: [0],
                docbpPriceOff: 0,
                docbpSettingMarginPercentage: 0,
              },
            ],
          }}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          fetchSummary={fetchSummary}
          showAddItemSection={showAddItemSection}
          setShowAddItemSection={setShowAddItemSection}
        />
      )}
      {!showAddItemSection &&
        summary.docbpItems.map((item) => {
          return (
            <RABSimulationItem
              item={item}
              key={item.docbpId}
              activeItemTab={activeItemTab}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              fetchSummary={fetchSummary}
            />
          );
        })}
    </div>
  );
};

const RABSimulationItem = ({
  item,
  activeItemTab,
  setErrorMessage,
  setSuccessMessage,
  fetchSummary,
  showAddItemSection,
  setShowAddItemSection,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    docbpId: 0,
    docbpAmount: 0,
    docbpMaterialName: "",
    docbpMaterialCode: "",
    docbpMaterialNeed: 0,
    docbpMaterialNeedTotal: 0,
    docbpMaterialPrice: 0,
    docbpMaterialNeedPrice: 0,
    docbpMaterialNeedPriceTotal: 0,
    docbpOperationalServiceColumn: [],
    docbpOperationalServiceValue: [],
    docbpOperationalServiceValueTotal: 0,
    docbpUtilityColumn: [],
    docbpUtilityValue: [],
    docbpUtilityValueTotal: 0,
    docbpCogs: 0,
    docbpPriceOff: 0,
    docbpTotalOff: 0,
    docbpSettingMarginPercentage: 0,
    docbpMargin: 0,
    docbpMarginNominal: 0,
    docbpMarginTotal: 0,
    docbpProfitRemaining: 0,
    docbpProfitRemainingTotal: 0,
    docbpPercent: 0,
    ...item,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current.reportValidity()) return;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (showAddItemSection) {
        const payload = {
          docbpsId: item.docbpsId,
          docbpItems: [
            {
              docbpName: formData.docbpName,
              docbpSize: formData.docbpSize,
              docbpAmount: formData.docbpAmount,
              docbpMaterialName: formData.docbpMaterialName,
              docbpMaterialCode: formData.docbpMaterialCode,
              docbpMaterialNeed: formData.docbpMaterialNeed,
              docbpMaterialPrice: formData.docbpMaterialPrice,
              docbpOperationalServiceColumn:
                formData.docbpOperationalServiceColumn || [],
              docbpOperationalServiceValue:
                formData.docbpOperationalServiceValue || [],
              docbpUtilityColumn: formData.docbpUtilityColumn || [],
              docbpUtilityValue: formData.docbpUtilityValue || [],
              docbpPriceOff: formData.docbpPriceOff,
              docbpSettingMarginPercentage:
                formData.docbpSettingMarginPercentage,
            },
          ],
        };

        await createDummyOrderCostBudgetPlan(payload);
        setSuccessMessage("Item berhasil disimpan");
      } else {
        const payload = {
          docbpsId: item.docbpsId,
          docbpItems: [
            {
              docbpId: formData.docbpId,
              docbpName: formData.docbpName,
              docbpSize: formData.docbpSize,
              docbpAmount: formData.docbpAmount,
              docbpMaterialName: formData.docbpMaterialName,
              docbpMaterialCode: formData.docbpMaterialCode,
              docbpMaterialNeed: formData.docbpMaterialNeed,
              docbpMaterialPrice: formData.docbpMaterialPrice,
              docbpOperationalServiceColumn:
                formData.docbpOperationalServiceColumn || [],
              docbpOperationalServiceValue:
                formData.docbpOperationalServiceValue || [],
              docbpUtilityColumn: formData.docbpUtilityColumn || [],
              docbpUtilityValue: formData.docbpUtilityValue || [],
              docbpPriceOff: formData.docbpPriceOff,
              docbpSettingMarginPercentage:
                formData.docbpSettingMarginPercentage,
            },
          ],
        };

        await updateDummyOrderCostBudgetPlan(payload);
        setSuccessMessage("Item baru berhasil dibuat");
      }

      await fetchSummary();
    } catch (error) {
      console.log("Error saving item:", error);
      setErrorMessage("Gagal menyimpan item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNumericInput = (value, allowEmpty = false) => {
    if (value === "" && allowEmpty) return "";
    if (value === "") return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleOperationalServiceChange = async (index, value) => {
    setFormData((prev) => {
      const newOperationalServiceValue = prev.docbpOperationalServiceValue
        ? [...prev.docbpOperationalServiceValue]
        : [];
      newOperationalServiceValue[index] = handleNumericInput(value);
      return {
        ...prev,
        docbpOperationalServiceValue: newOperationalServiceValue,
      };
    });
    await handleSubmit();
  };

  const handleUtilityChange = (index, value) => {
    setFormData((prev) => {
      const newUtilityValue = prev.docbpUtilityValue
        ? [...prev.docbpUtilityValue]
        : [];
      newUtilityValue[index] = handleNumericInput(value);
      return {
        ...prev,
        docbpUtilityValue: newUtilityValue,
      };
    });
  };

  const formRef = useRef(null);

  return (
    <div
      className={`p-6 space-y-8 ${activeItemTab === item.docbpId ? "" : "hidden"}`}
    >
      <form ref={formRef}>
        {/* Material Info */}
        <div className="grid grid-cols-2 gap-x-4 bg-white rounded-xl p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Nama Produk</span>
              <input
                type="text"
                value={formData.docbpName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpName: e.target.value,
                  }))
                }
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Ukuran Produk</span>
              <input
                type="text"
                value={formData.docbpSize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpSize: e.target.value,
                  }))
                }
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Jumlah Order <span className="text-red-500 ml-1">*</span></span>
              <input
                type="number"
                value={formData.docbpAmount}
                required
                step={1}
                min={1}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpAmount: handleNumericInput(e.target.value, true),
                  }))
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Nama Bahan</span>
              <input
                type="text"
                value={formData.docbpMaterialName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpMaterialName: e.target.value,
                  }))
                }
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                placeholder="Kode akan terisi otomatis"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Kode Bahan</span>
              <input
                type="text"
                value={formData.docbpMaterialCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpMaterialCode: e.target.value,
                  }))
                }
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                placeholder="Kode akan terisi otomatis"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Kebutuhan Kain/Unit <span className="text-red-500 ml-1">*</span></span>
              <input
                type="number"
                step="0.01"
                required
                min={0.01}
                value={formData.docbpMaterialNeed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpMaterialNeed: Number(e.target.value),
                  }))
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Total Kebutuhan (M)</span>
              <input
                type="number"
                value={(
                  formData.docbpMaterialNeed * formData.docbpAmount
                ).toFixed(2)}
                readOnly
                onWheel={(e) => e.currentTarget.blur()}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Harga/M <span className="text-red-500 ml-1">*</span></span>
              <input
                type="number"
                step="1"
                required
                min={1}
                value={formData.docbpMaterialPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    docbpMaterialPrice: parseInt(e.target.value) || 0,
                  }))
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Total Harga Bahan</span>
              <input
                type="text"
                value={formatCurrency(
                  formData.docbpMaterialPrice * formData.docbpMaterialNeed,
                )}
                readOnly
                onWheel={(e) => e.currentTarget.blur()}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">
                Grand Total Harga Bahan
              </span>
              <input
                type="text"
                value={formatCurrency(
                  formData.docbpAmount *
                    formData.docbpMaterialPrice *
                    formData.docbpMaterialNeed,
                )}
                readOnly
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
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
                setFormData((prev) => ({
                  ...prev,
                  docbpOperationalServiceColumn:
                    prev.docbpOperationalServiceColumn
                      ? [...prev.docbpOperationalServiceColumn, ""]
                      : [""],
                  docbpOperationalServiceValue:
                    prev.docbpOperationalServiceValue
                      ? [...prev.docbpOperationalServiceValue, 0]
                      : [0],
                }));
              }}
              className="bg-white text-primaryColor px-2 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-1 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Tambah
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {formData.docbpOperationalServiceColumn?.map(
                (serviceName, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => {
                          const newColumns =
                            formData.docbpOperationalServiceColumn
                              ? [...formData.docbpOperationalServiceColumn]
                              : [];
                          newColumns[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            docbpOperationalServiceColumn: newColumns,
                          }));
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
                        value={
                          formData.docbpOperationalServiceValue[index] || 0
                        }
                        onChange={(e) =>
                          handleOperationalServiceChange(index, e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newColumns =
                          formData.docbpOperationalServiceColumn.filter(
                            (_, i) => i !== index,
                          );
                        const newValues =
                          formData.docbpOperationalServiceValue.filter(
                            (_, i) => i !== index,
                          );
                        setFormData((prev) => ({
                          ...prev,
                          docbpOperationalServiceColumn: newColumns,
                          docbpOperationalServiceValue: newValues,
                        }));
                      }}
                      className="text-white hover:text-red-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ),
              )}
            </div>
            <div className="border-t border-blue-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Jasa Operasional
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(formData.docbpOperationalServiceValueTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Total Jasa Operasional
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(
                    formData.docbpOperationalServiceValueTotal *
                      formData.docbpAmount,
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
                setFormData((prev) => ({
                  ...prev,
                  docbpUtilityColumn: prev.docbpUtilityColumn
                    ? [...prev.docbpUtilityColumn, ""]
                    : [""],
                  docbpUtilityValue: prev.docbpUtilityValue
                    ? [...prev.docbpUtilityValue, 0]
                    : [0],
                }));
              }}
              className="bg-white text-primaryColor px-2 py-1 rounded-lg hover:bg-orange-50 flex items-center gap-1 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Tambah
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {formData.docbpUtilityColumn?.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const newColumns = [...formData.docbpUtilityColumn];
                        newColumns[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          docbpUtilityColumn: newColumns,
                        }));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      placeholder="Nama Utility"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="1"
                      value={formData.docbpUtilityValue[index] || 0}
                      onChange={(e) =>
                        handleUtilityChange(index, e.target.value)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newColumns = formData.docbpUtilityColumn.filter(
                        (_, i) => i !== index,
                      );
                      const newValues = formData.docbpUtilityValue.filter(
                        (_, i) => i !== index,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        docbpUtilityColumn: newColumns,
                        docbpUtilityValue: newValues,
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
                  {formatCurrency(formData.docbpUtilityValueTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Total Utilities & Bekakas
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(
                    formData.docbpUtilityValueTotal * formData.docbpAmount,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kalkulasi HPP & Profit */}
        <div className="bg-teal-700 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-white">
              Kalkulasi HPP & Profit
            </h3>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Price Off</span>
                <div className="w-24">
                  <input
                    type="number"
                    step="1"
                    value={formData.docbpPriceOff}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        docbpPriceOff: parseInt(e.target.value) || 0,
                      }))
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm text-black"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Margin (%)</span>
                <div className="w-24">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.docbpSettingMarginPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        docbpSettingMarginPercentage:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm text-black"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Total Off</span>
                <div className="w-24">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(formData.docbpTotalOff)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Margin</span>
                <div className="w-24">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(formData.docbpMargin)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">HPP</span>
                <div className="w-24">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(formData.docbpCogs)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">
                  Nominal Margin
                </span>
                <div className="w-24">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(formData.docbpMarginNominal)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2"></div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Total Margin</span>
                <div className="w-24">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(formData.docbpMarginTotal)}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm flex-1">Sisa Untung</span>
                  <div className="w-24">
                    <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                      {formatCurrency(formData.docbpProfitRemaining)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm flex-1">
                    Total Sisa Untung
                  </span>
                  <div className="w-24">
                    <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                      {formatCurrency(formData.docbpProfitRemainingTotal)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">Percent</span>
                <span className="text-white font-bold">
                  {/* {formData.docbpPercent?.toFixed(2) || 0}% */}
                  {(
                    ((formData.docbpPriceOff - formData.docbpCogs) /
                      formData.docbpCogs) *
                    100
                  )?.toFixed(2) || 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6 gap-4">
          {showAddItemSection && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowAddItemSection(false);
              }}
              type="button"
              disabled={isSaving}
              className="bg-gray-200  px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Menyimpan..." : "Simpan RABP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function RabSimulationDetail() {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdatingPercentage, setIsUpdatingPercentage] = useState(false);
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  const [percentageForm, setPercentageForm] = useState({
    mainDevelop: 0,
    incentive: 0,
    marketing: 0,
  });

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getDummyOrderCostBudgetPlanSummaryDetail(id);
      const data = response.data.data;
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchSummary();
    }
  }, [id, fetchSummary]);

  const handleUpdatePercentage = async () => {
    try {
      setIsUpdatingPercentage(true);
      setErrorMessage("");

      const payload = {
        docbpsId: summary.docbpsId,
        docbpsSettingMainDevelopPercentage: percentageForm.mainDevelop,
        docbpsSettingIncentivePercentage: percentageForm.incentive,
        docbpsSettingMarketingPercentage: percentageForm.marketing,
      };

      await updateDummyOrderCostBudgetPlanSummarySettingPercentage(payload);

      setSummary((prev) => ({
        ...prev,
        ocbpsSettingMainDevelopPercentage: percentageForm.mainDevelop,
        ocbpsSettingIncentivePercentage: percentageForm.incentive,
        ocbpsSettingMarketingPercentage: percentageForm.marketing,
      }));

      setSuccessMessage("Persentase pembagian berhasil diupdate");
      setShowPercentageModal(false);

      await fetchSummary();
    } catch (error) {
      console.error("Error updating percentage:", error);
      setErrorMessage(
        "Gagal mengupdate persentase: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsUpdatingPercentage(false);
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

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
            <p className="text-primaryColor font-semibold">
              Memuat data simulasi RABP...
            </p>
          </div>
        ) : (
          summary && (
            <div className="mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => navigate("/admin/rab-simulation")}
                  className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Kembali
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-primaryColor">
                    Edit Simulasi RABP
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

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* REKAP RABP Card */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">REKAP RABP</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Bahan</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.docbpsMaterialNeedPriceTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Jasa Operasional
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          summary.docbpsOperationalTotal -
                            sumArray(summary.docbpsUtilityValueTotal),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Utilities & Bekakas
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          summary.docbpsOperationalTotal -
                            sumArray(
                              summary.docbpsOperationalServiceValueTotal,
                            ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Untung</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.docbpsProfitTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Percent</span>
                      <span className="font-bold text-green-600">
                        {summary.docbpsPercent?.toFixed(2) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Margin</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.docbpsMarginTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sisa Untung</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.docbpsProfitRemainingTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nilai PO</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.docbpsTotalOff)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nilai Untung</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.docbpsProfitValue)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Selisih Untung</span>
                      <span className="font-bold text-green-600">
                        {summary.docbpsProfitDifference === 0
                          ? "BALANCE"
                          : formatCurrency(summary.docbpsProfitDifference)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* REKAP PEMBAGIAN SISA UNTUNG Card */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      REKAP PEMBAGIAN SISA UNTUNG
                    </h2>
                    <button
                      onClick={() => {
                        setShowPercentageModal(true);
                        setPercentageForm({
                          incentive: summary.docbpsSettingIncentivePercentage,
                          mainDevelop:
                            summary.docbpsSettingMainDevelopPercentage,
                          marketing: summary.docbpsSettingMarketingPercentage,
                        });
                      }}
                      className="bg-teal-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-teal-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {/* Main & Develop Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Persentase Main & Develop
                        </span>
                        <span className="font-semibold">
                          {summary.docbpsSettingMainDevelopPercentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 ">
                        <span className="text-gray-600">
                          Biaya Main & Develop
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(summary.docbpsMainDevelop)}
                        </span>
                      </div>
                    </div>

                    {/* Incentive Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Persentase Insentif
                        </span>
                        <span className="font-semibold">
                          {summary.docbpsSettingIncentivePercentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 ">
                        <span className="text-gray-600">Biaya Insentif</span>
                        <span className="font-semibold">
                          {formatCurrency(summary.docbpsIncentive)}
                        </span>
                      </div>
                    </div>

                    {/* Marketing Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Persentase Marketing
                        </span>
                        <span className="font-semibold">
                          {summary.docbpsSettingMarketingPercentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 ">
                        <span className="text-gray-600">Biaya Marketing</span>
                        <span className="font-semibold">
                          {formatCurrency(summary.docbpsMarketing)}
                        </span>
                      </div>
                    </div>

                    {/* Profit Net Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Sisa Untung Bersih
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(summary.docbpsProfitNet)}
                        </span>
                      </div>
                    </div>

                    {/* Percent Eroded Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Percent Keuntungan Tergerus
                        </span>
                        <span className="font-bold text-green-600">
                          {summary.docbpsPercentEroded?.toFixed(2) || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <RabSimulationItemsSection
                summary={summary}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                fetchSummary={fetchSummary}
              />
            </div>
          )
        )}
      </div>
      {showPercentageModal && (
        <PercentageModal
          isUpdatingPercentage={isUpdatingPercentage}
          handleCancel={() => {
            setShowPercentageModal(false);
          }}
          percentageForm={percentageForm}
          handleUpdatePercentage={handleUpdatePercentage}
          setPercentageForm={setPercentageForm}
        />
      )}
    </div>
  );
}
