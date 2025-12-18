import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  PrinterIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getInventories } from "../../../api/Inventory/inventory";
import {
  getOrderCostBudgetPlanSummary,
  updateOrderCostBudgetPlan,
  updateOrderCostBudgetPlanSummaryPercentage,
} from "../../../api/Order/order";
import { getOperationalUtilityTemplateList } from "../../../api/rab-template/rab-template";
import SearchableDropdown from "../../../components/SearchableDropdown";
import { calculateRABItemValues, formatCurrency } from "../../../utils";
import { generateRABPReport } from "../../../utils/pdfGenerator";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import { hasPermission } from '../../../api/auth';
import { LockableInput } from "../../components/lockable-input";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

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
  tab: "inline-flex overflow-hidden border-b border-gray-200",
  tabButton:
    "border-none outline-none cursor-pointer py-3 px-6 transition-all duration-300 font-medium",
  activeTabButton: "bg-primaryColor text-white",
  inactiveTabButton: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  filledTabButton: "bg-secondaryColor text-white",
  tabContent: "p-6 bg-white rounded-b-xl shadow-md",
};

const getName = (
  item,
  nameFields = [
    "isName",
    "iCode",
    "iDescription",
    "name",
    "description",
    "code",
  ],
) => {
  for (const field of nameFields) {
    if (item[field] !== undefined && item[field] !== null && item[field] !== "")
      return item[field];
  }
  return "Unknown";
};


const RABItemsSection = ({
  summary,
  inventories,
  templates,
  handleSubmit,
  setSummary,
  isSaving,
  formRef,
}) => {
  const [activeItemTab, setActiveItemTab] = useState(
    summary?.ocbpItems?.[0]?.ocbpId || 0,
  );

  // Handler untuk pergantian tab
  const handleTabChange = (item) => {
    setActiveItemTab(item.ocbpId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md max-w-full mb-6">
      <div className="p-4 bg-white border-b overflow-x-auto">
        {/* Size Tabs */}
        <div className={tabStyles.tab}>
          {summary?.ocbpItems?.map((item) => {
            return (
              <button
                key={item.ocbpId}
                className={`${tabStyles.tabButton} whitespace-nowrap ${activeItemTab === item.ocbpId
                  ? tabStyles.activeTabButton
                  : ((item.ocbpMaterialNeedPriceTotal !== null) && (item.ocbpTotalOff !== null) && (item.ocbpsMarginTotal !== null))
                    ? tabStyles.filledTabButton
                    : tabStyles.inactiveTabButton
                  }`}
                onClick={() => handleTabChange(item)}
              >
                {`${item.cpName} - Size ${item.sGroup} (${item.ocbpAmount})`}
              </button>
              // <button
              //   key={item.ocbpId}
              //   className={`${tabStyles.tabButton} whitespace-nowrap ${
              //     activeItemTab === item.ocbpId
              //       ? tabStyles.activeTabButton
              //       : tabStyles.inactiveTabButton
              //   }`}
              //   onClick={() => handleTabChange(item)}
              // >
              //   {`${item.cpName} - Size ${item.sGroup} (${item.ocbpAmount})`}
              // </button>
            );
          })}
        </div>
      </div>
      {summary?.ocbpItems?.map((item) => {
        return (
          <RABItem
            handleSubmit={handleSubmit}
            item={item}
            key={item.ocbpId}
            inventories={inventories}
            templates={templates}
            activeItemTab={activeItemTab}
            setSummary={setSummary}
            isSaving={isSaving}
            formRef={formRef}
          />
        );
      })}
    </div>
  );
};

const RABItem = ({
  item,
  activeItemTab,
  inventories,
  templates,
  handleSubmit,
  setSummary,
  isSaving,
  formRef,
}) => {
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isFieldLocked, setIsFieldLocked] = useState(
    !!item.ocbpMaterialNeed ||
    !!item.ocbpMaterialPrice ||
    !!item.ocbpPriceOff ||
    !!item.ocbpSettingMarginPercentage,
  );

  const handleNumericInput = (value, allowEmpty = false) => {
    if (value === "" && allowEmpty) return "";
    if (value === "") return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    if (inventories.length > 0) {
      const selectedInventory = inventories.find(
        (inv) =>
          getName(inv, ["isName"]) === item.ocbpMaterialName &&
          getName(inv, ["iCode"]) === item.ocbpMaterialCode,
      );
      console.log("Inventories:", inventories);
      console.log("Selected Inventory:", selectedInventory);
      if (selectedInventory) {
        setSelectedInventory(selectedInventory);
      }
    }
  }, [
    inventories.length,
    item.ocbpMaterialName,
    item.ocbpMaterialCode,
    inventories,
  ]);

  const handleUpdateRABItem = (newData) => {
    setSummary((prev) => {
      const updatedOcbpItems = prev.ocbpItems.map((itm) => {
        if (itm.ocbpId === item.ocbpId) {
          return {
            ...itm,
            ...newData,
          };
        }
        return itm;
      });
      return { ...prev, ocbpItems: updatedOcbpItems };
    });
  };

  // Saat pilih dari dropdown
  const handleSelectOutput = (selectedOutput) => {
    if (!selectedOutput) return;

    const updatedData = {
      ocbpOperationalServiceColumn: selectedOutput.outOperational.map(
        (op) => op.name,
      ),
      ocbpOperationalServiceValue: selectedOutput.outOperational.map(
        (op) => op.price,
      ),
      ocbpUtilityColumn: selectedOutput.outUtility.map((ut) => ut.name),
      ocbpUtilityValue: selectedOutput.outUtility.map((ut) => ut.price),
    };

    handleUpdateRABItem(updatedData);
  };

  const rabItemValues = calculateRABItemValues(item);

  return (
    <div
      className={`p-6 space-y-8 ${activeItemTab === item.ocbpId ? "" : "hidden"}`}
    >
      <form ref={formRef}>
        {/* Material Info */}
        <div className="flex w-full justify-end pr-4">
          {hasPermission('rab.lock', 'rab.unlock') && (
            <button
              type="button"
              onClick={() => {
                setIsFieldLocked((prev) => !prev);
              }}
              className={isFieldLocked ? "bg-primaryColor text-white px-4 py-1 rounded-lg text-sm hover:bg-primaryColor-700 inline-flex gap-2 items-center" : "bg-secondaryColor text-white px-4 py-1 rounded-lg text-sm hover:bg-secondaryColor-700 inline-flex gap-2 items-center"}
            >
              {isFieldLocked ? (
                <LockIcon className="w-4 h-4 inline" />
              ) : (
                <UnlockIcon className="w-4 h-4 inline" />
              )}{" "}
              {isFieldLocked ? "View Mode" : "Edit Mode"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 bg-white rounded-xl p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Nama Produk</span>
              <input
                type="text"
                readOnly
                value={item.cpName}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Ukuran Produk</span>
              <input
                type="text"
                value={item.sGroup}
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Jumlah Order</span>
              <input
                type="text"
                value={item.ocbpAmount}
                onChange={(e) => {
                  handleUpdateRABItem({
                    ocbpAmount: handleNumericInput(e.target.value, true),
                  });
                }}
                readOnly
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Nama Bahan</span>

              <div className="relative w-48">
                {!isFieldLocked ? (
                  <>
                    <SearchableDropdown
                      data={inventories}
                      labelKey="isName"
                      value={selectedInventory ? selectedInventory.iId : ""}
                      valueKey="iId"
                      onSelect={(value) => {
                        setSelectedInventory(value);

                        if (value) {
                          handleUpdateRABItem({
                            ocbpMaterialName: value.isName || "",
                            ocbpMaterialCode: value.iCode || "",
                          });
                        } else {
                          handleUpdateRABItem({
                            ocbpMaterialName: "",
                            ocbpMaterialCode: "",
                          });
                        }
                      }}
                      onChange={(searchTerm) => {
                        if (!searchTerm) {
                          setSelectedInventory(null);

                          handleUpdateRABItem({
                            ocbpMaterialName: "",
                            ocbpMaterialCode: "",
                          });
                        }
                      }}
                      placeholder={"Pilih Bahan"}
                    />
                    <ChevronDownIcon className="w-4 h-4 absolute right-2 top-2 text-gray-400 pointer-events-none" />
                  </>
                )
                  : (
                    <input
                      type="text"
                      value={item.ocbpMaterialName}
                      readOnly
                      className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                      placeholder="Kode akan terisi otomatis"
                    />
                  )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Kode Bahan</span>
              <input
                type="text"
                value={item.ocbpMaterialCode}
                readOnly
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                placeholder="Kode akan terisi otomatis"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">
                Kebutuhan Kain/Unit <span className="text-red-500 ml-1">*</span>
              </span>
              <LockableInput
                min={0.01}
                step={0.01}
                required
                type="number"
                locked={isFieldLocked}
                // toggleDisabled
                disabledByDefault={!!item.ocbpMaterialNeed}
                value={item.ocbpMaterialNeed}
                onChange={(e) =>
                  handleUpdateRABItem({
                    ocbpMaterialNeed: Number(e.target.value),
                  })
                }
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                placeholder="0.00"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Total Kebutuhan (M)</span>
              <input
                type="number"
                value={(item.ocbpMaterialNeed * item.ocbpAmount).toFixed(2)}
                readOnly
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">
                Harga/M <span className="text-red-500 ml-1">*</span>
              </span>

              <LockableInput
                type="number"
                disabledByDefault={!!item.ocbpMaterialPrice}
                value={item.ocbpMaterialPrice}
                onChange={(e) =>
                  handleUpdateRABItem({
                    ocbpMaterialPrice: parseInt(e.target.value) || 0,
                  })
                }
                locked={isFieldLocked}
                toggleDisabled
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                placeholder="0"
                onWheel={(e) => e.currentTarget.blur()}
                min={1}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">Total Harga Bahan</span>
              <input
                type="text"
                value={formatCurrency(rabItemValues.totalHargaBahan)}
                readOnly
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-sm">
                Grand Total Harga Bahan
              </span>
              <input
                type="text"
                value={formatCurrency(rabItemValues.grandTotalHargaBahan)}
                readOnly
                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
              />
            </div>
            {!isFieldLocked && (
              <div className="flex justify-between items-center">
                <span className="text-black text-sm">Template RABP</span>
                <div className="relative w-48">
                  <SearchableDropdown
                    data={templates}
                    labelKey="outName"
                    valueKey="outId"
                    onSelect={(value) => {
                      handleSelectOutput(value);
                    }}
                    placeholder={"Pilih Template"}
                  />
                  <ChevronDownIcon className="w-4 h-4 absolute right-2 top-2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kalkulasi Jasa Operasional */}
        <div className="bg-primaryColor rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-white">
              Kalkulasi Jasa Operasional
            </h3>
            {!isFieldLocked && (
              <button
                type="button"
                onClick={() => {
                  setSummary((prev) => {
                    const updatedOcbpItems = prev.ocbpItems.map((itm) => {
                      if (itm.ocbpId === item.ocbpId) {
                        return {
                          ...itm,
                          ocbpOperationalServiceColumn:
                            itm.ocbpOperationalServiceColumn
                              ? [...itm.ocbpOperationalServiceColumn, ""]
                              : [""],
                          ocbpOperationalServiceValue:
                            itm.ocbpOperationalServiceValue
                              ? [...itm.ocbpOperationalServiceValue, 0]
                              : [0],
                        };
                      }
                      return itm;
                    });
                    return { ...prev, ocbpItems: updatedOcbpItems };
                  });
                }}
                className="bg-white text-primaryColor px-2 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-1 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Tambah
              </button>
            )}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {item.ocbpOperationalServiceColumn?.map((serviceName, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <LockableInput
                      type="text"
                      value={serviceName}
                      onChange={(e) => {
                        const newColumns = [
                          ...item.ocbpOperationalServiceColumn,
                        ];
                        newColumns[index] = e.target.value;

                        handleUpdateRABItem({
                          ocbpOperationalServiceColumn: newColumns,
                        });
                      }}
                      toggleDisabled
                      locked={isFieldLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      placeholder="Nama Jasa"
                      onWheel={(e) => e.currentTarget.blur()}
                      disabledByDefault={!!item.ocbpOperationalServiceColumn}
                      right
                    />
                    {/* <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => {
                        const newColumns = [
                          ...item.ocbpOperationalServiceColumn,
                        ];
                        newColumns[index] = e.target.value;

                        handleUpdateRABItem({
                          ocbpOperationalServiceColumn: newColumns,
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      placeholder="Nama Jasa"
                    /> */}
                  </div>
                  <div className="w-24">
                    <LockableInput
                      type="number"
                      min="0"
                      step="1"
                      value={item.ocbpOperationalServiceValue[index] || 0}
                      onChange={(e) => {
                        const newValues = [...item.ocbpOperationalServiceValue];
                        newValues[index] = Number(e.target.value);
                        handleUpdateRABItem({
                          ocbpOperationalServiceValue: newValues,
                        });
                      }}
                      toggleDisabled
                      locked={isFieldLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                      placeholder="0"
                      onWheel={(e) => e.currentTarget.blur()}
                      disabledByDefault={!!item.ocbpOperationalServiceValue[index] || 0}
                      left
                    />
                    {/* <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.ocbpOperationalServiceValue[index] || 0}
                      onChange={(e) => {
                        const newValues = [...item.ocbpOperationalServiceValue];
                        newValues[index] = Number(e.target.value);
                        handleUpdateRABItem({
                          ocbpOperationalServiceValue: newValues,
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                      placeholder="0"
                      onWheel={(e) => e.currentTarget.blur()}
                    /> */}
                  </div>
                  {!isFieldLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        const newColumns =
                          item.ocbpOperationalServiceColumn.filter(
                            (_, i) => i !== index,
                          );
                        const newValues = item.ocbpOperationalServiceValue.filter(
                          (_, i) => i !== index,
                        );
                        handleUpdateRABItem({
                          ocbpOperationalServiceColumn: newColumns,
                          ocbpOperationalServiceValue: newValues,
                        });
                      }}
                      className="text-white hover:text-red-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-blue-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Jasa Operasional
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(rabItemValues.jasaOperasional)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Total Jasa Operasional
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(rabItemValues.totalJasaOperasional)}
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
            {!isFieldLocked && (
              <button
                type="button"
                onClick={() => {
                  setSummary((prev) => {
                    const updatedOcbpsItems = prev.ocbpItems.map((itm) => {
                      if (itm.ocbpId === item.ocbpId) {
                        return {
                          ...itm,
                          ocbpUtilityColumn: itm.ocbpUtilityColumn
                            ? [...itm.ocbpUtilityColumn, ""]
                            : [""],
                          ocbpUtilityValue: itm.ocbpUtilityValue
                            ? [...itm.ocbpUtilityValue, 0]
                            : [0],
                        };
                      }
                      return itm;
                    });
                    return { ...prev, ocbpItems: updatedOcbpsItems };
                  });
                }}
                className="bg-white text-primaryColor px-2 py-1 rounded-lg hover:bg-orange-50 flex items-center gap-1 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Tambah
              </button>
            )}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {item.ocbpUtilityColumn?.map((serviceName, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <LockableInput
                      type="text"
                      value={serviceName}
                      onChange={(e) => {
                        const newColumns = [...item.ocbpUtilityColumn];
                        newColumns[index] = e.target.value;

                        handleUpdateRABItem({
                          ocbpUtilityColumn: newColumns,
                        });
                      }}
                      toggleDisabled
                      locked={isFieldLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      placeholder="Nama Utility"
                      onWheel={(e) => e.currentTarget.blur()}
                      disabledByDefault={!!serviceName}
                      right
                    />
                    {/* <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => {
                        const newColumns = [...item.ocbpUtilityColumn];
                        newColumns[index] = e.target.value;

                        handleUpdateRABItem({
                          ocbpUtilityColumn: newColumns,
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      placeholder="Nama Jasa"
                    /> */}
                  </div>
                  <div className="w-24">
                    <LockableInput
                      type="number"
                      min="0"
                      step="1"
                      value={item.ocbpUtilityValue[index] || 0}
                      onChange={(e) => {
                        const newValues = [...item.ocbpUtilityValue];
                        newValues[index] = Number(e.target.value);
                        handleUpdateRABItem({
                          ocbpUtilityValue: newValues,
                        });
                      }}
                      toggleDisabled
                      locked={isFieldLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                      placeholder="0"
                      onWheel={(e) => e.currentTarget.blur()}
                      disabledByDefault={!!item.ocbpUtilityValue[index] || 0}
                      left
                    />
                    {/* <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.ocbpUtilityValue[index] || 0}
                      onChange={(e) => {
                        const newValues = [...item.ocbpUtilityValue];
                        newValues[index] = Number(e.target.value);
                        handleUpdateRABItem({
                          ocbpUtilityValue: newValues,
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                      placeholder="0"
                      onWheel={(e) => e.currentTarget.blur()}
                    /> */}
                  </div>
                  {!isFieldLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        const newColumns = item.ocbpUtilityColumn.filter(
                          (_, i) => i !== index,
                        );
                        const newValues = item.ocbpUtilityValue.filter(
                          (_, i) => i !== index,
                        );
                        handleUpdateRABItem({
                          ocbpUtilityColumn: newColumns,
                          ocbpUtilityValue: newValues,
                        });
                      }}
                      className="text-white hover:text-red-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-orange-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Utilities & Bekakas
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(rabItemValues.utilitiesDanBekakas)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">
                  Total Utilities & Bekakas
                </span>
                <span className="text-white font-bold">
                  {formatCurrency(rabItemValues.totalUtilitiesDanBekakas)}
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
                <LockableInput
                  type="number"
                  value={item.ocbpPriceOff}
                  onChange={(e) =>
                    handleUpdateRABItem({
                      ocbpPriceOff: parseInt(e.target.value) || 0, // ✅ sama dengan value
                    })
                  }
                  toggleDisabled
                  locked={isFieldLocked}
                  className="w-24 px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm text-black"
                  placeholder="0"
                  onWheel={(e) => e.currentTarget.blur()}
                  disabledByDefault={!!item.ocbpPriceOff}
                  left
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Margin (%)</span>

                <LockableInput
                  disabledByDefault={!!item.ocbpSettingMarginPercentage}
                  type="number"
                  step="0.1"
                  value={item.ocbpSettingMarginPercentage}
                  onChange={(e) =>
                    handleUpdateRABItem({
                      ocbpSettingMarginPercentage:
                        parseFloat(e.target.value) || 0,
                    })
                  }
                  toggleDisabled
                  locked={isFieldLocked}
                  className="w-24 px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm text-black"
                  placeholder="0"
                  onWheel={(e) => e.currentTarget.blur()}
                  left
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Total Off</span>
                <div className="flex-1">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(rabItemValues.totalOff)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Margin</span>
                <div className="flex-1">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(rabItemValues.margin)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">HPP</span>
                <div className="flex-1">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(rabItemValues.hpp)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">
                  Nominal Margin
                </span>
                <div className="flex-1">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(rabItemValues.nominalMargin)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2"></div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm flex-1">Total Margin</span>
                <div className="flex-1">
                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                    {formatCurrency(rabItemValues.totalMargin)}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm flex-1">Sisa Untung</span>
                  <div className="flex-1">
                    <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                      {formatCurrency(rabItemValues.sisaUntung)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm flex-1">
                    Total Sisa Untung
                  </span>
                  <div className="flex-1">
                    <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                      {formatCurrency(rabItemValues.totalSisaUntung)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm">Percent</span>
                <span className="text-white font-bold">
                  {rabItemValues.percent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          {hasPermission('rab.edit') && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              // className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              className={((item.ocbpMaterialNeedPriceTotal !== null) && (item.ocbpTotalOff !== null) && (item.ocbpsMarginTotal !== null)) ? "bg-secondaryColor text-white px-6 py-2 rounded-lg hover:bg-secondaryColor disabled:opacity-50 disabled:cursor-not-allowed" : "bg-primaryColor text-white px-6 py-2 rounded-lg hover:bg-primaryColor disabled:opacity-50 disabled:cursor-not-allowed"}
            >
              {isSaving ? "Menyimpan..." : ((item.ocbpMaterialNeedPriceTotal !== null) && (item.ocbpTotalOff !== null) && (item.ocbpsMarginTotal !== null)) ? "Update RABP" : "Simpan RABP"}
              {/* {isSaving ? "Menyimpan..." : "Simpan RABP"} */}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default function EditRabOrder() {
  const { orderId } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
  const [inventories, setInventories] = useState([]);
  const [templates, setTemplates] = useState(null);

  const [isFieldLocked] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getOrderCostBudgetPlanSummary(orderId);
      const data = response.data.data;
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const fetchInventories = useCallback(async () => {
    try {
      const response = await getInventories({
        pageLimit: -1,
        pageNumber: 1,
      });

      const data = response.data.data.listData;

      setInventories(data);
    } catch (error) {
      console.error("Error fetching inventories:", error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await getOperationalUtilityTemplateList({
        pageLimit: -1,
        pageNumber: 1,
      });

      const data = response.data.data.listData;

      setTemplates(data);
    } catch (error) {
      console.error("Error fetching tenplate:", error);
    }
  }, []);

  useEffect(() => {
    async function fetchTogether() {
      await Promise.all([fetchSummary(), fetchInventories(), fetchTemplates()]);
    }
    if (orderId) {
      fetchTogether();
    }
  }, [orderId, fetchSummary, fetchInventories, fetchTemplates]);

  const handleUpdatePercentage = async () => {
    try {
      setIsUpdatingPercentage(true);
      setErrorMessage("");

      const payload = {
        ocbpsId: summary.ocbpsId,
        ocbpsSettingMainDevelopPercentage: percentageForm.mainDevelop,
        ocbpsSettingIncentivePercentage: percentageForm.incentive,
        ocbpsSettingMarketingPercentage: percentageForm.marketing,
      };

      await updateOrderCostBudgetPlanSummaryPercentage(payload);

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

  const handleSubmitPercentage = async () => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const percentagePayload = {
        ocbpsId: summary.ocbpsId,
        ocbpsSettingMainDevelopPercentage:
          summary.ocbpsSettingMainDevelopPercentage,
        ocbpsSettingIncentivePercentage:
          summary.ocbpsSettingIncentivePercentage,
        ocbpsSettingMarketingPercentage:
          summary.ocbpsSettingMarketingPercentage,
      };

      await updateOrderCostBudgetPlanSummaryPercentage(percentagePayload);

      setSuccessMessage("Persentase berhasil disimpan");

      await fetchSummary();
    } catch (error) {
      console.log("Error saving item:", error);
      setErrorMessage("Gagal menyimpan item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const invalidItem = summary.ocbpItems.find((item) => {
    //   const ocbpMaterialNeed = Number(item.ocbpMaterialNeed) || 0;
    //   const ocbpMaterialPrice = Number(item.ocbpMaterialPrice) || 0;
    //   const ocbpPriceOff = Number(item.ocbpPriceOff) || 0;

    //   return (
    //     ocbpMaterialNeed === 0 || ocbpMaterialPrice === 0 || ocbpPriceOff === 0
    //   );
    // });

    // if (invalidItem) {
    //   toast.error(
    //     `Nilai dari kebutuhan kain per unit/harga per meter/price off dari item ${`${invalidItem.cpName} - Size ${invalidItem.sGroup} (${invalidItem.ocbpAmount})`} harus lebih dari 0`,
    //   );
    //   return;
    // }

    const isValidItem = (item) =>
      (item.ocbpMaterialNeed ?? 0) !== 0 &&
      (item.ocbpMaterialPrice ?? 0) !== 0 &&
      (item.ocbpPriceOff ?? 0) !== 0;

    const filteredItems = summary.ocbpItems.filter(isValidItem);

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      const payload = {
        ocbpsId: summary.ocbpsId,
        ocbpItems: filteredItems.map((item) => {
          return {
            ocbpId: item.ocbpId,
            ocbpName: item.ocbpName,
            ocbpSize: item.ocbpSize,
            ocbpAmount: item.ocbpAmount,
            ocbpMaterialName: item.ocbpMaterialName,
            ocbpMaterialCode: item.ocbpMaterialCode,
            ocbpMaterialNeed: item.ocbpMaterialNeed || 0,
            ocbpMaterialPrice: item.ocbpMaterialPrice || 0,
            ocbpOperationalServiceColumn:
              item.ocbpOperationalServiceColumn || [],
            ocbpOperationalServiceValue: item.ocbpOperationalServiceValue || [],
            ocbpUtilityColumn: item.ocbpUtilityColumn || [],
            ocbpUtilityValue: item.ocbpUtilityValue || [],
            ocbpPriceOff: item.ocbpPriceOff || 0,
            ocbpSettingMarginPercentage: item.ocbpSettingMarginPercentage || 0,
          };
        }),
      };

      const percentagePayload = {
        ocbpsId: summary.ocbpsId,
        ocbpsSettingMainDevelopPercentage:
          summary.ocbpsSettingMainDevelopPercentage,
        ocbpsSettingIncentivePercentage:
          summary.ocbpsSettingIncentivePercentage,
        ocbpsSettingMarketingPercentage:
          summary.ocbpsSettingMarketingPercentage,
      };

      await updateOrderCostBudgetPlanSummaryPercentage(percentagePayload);

      await updateOrderCostBudgetPlan(payload);

      setSuccessMessage("Item berhasil disimpan");

      await fetchSummary();
    } catch (error) {
      console.log("Error saving item:", error);
      setErrorMessage("Gagal menyimpan item");
    } finally {
      setIsSaving(false);
    }
  };

  const formRef = useRef(null);

  const totals = summary?.ocbpItems?.reduce(
    (acc, item) => {
      const rabItemValues = calculateRABItemValues(item);
      return {
        totalBahan: acc.totalBahan + rabItemValues.grandTotalHargaBahan,
        totalJasaOperasional:
          acc.totalJasaOperasional + rabItemValues.totalJasaOperasional,
        totalUtilitiesDanBekakas:
          acc.totalUtilitiesDanBekakas + rabItemValues.totalUtilitiesDanBekakas,
        totalOff: acc.totalOff + rabItemValues.totalOff,
        totalMargin: acc.totalMargin + rabItemValues.totalMargin,
        totalSisaUntung: acc.totalSisaUntung + rabItemValues.totalSisaUntung,
        nilaiPO: acc.nilaiPO + rabItemValues.totalOff,
      };
    },
    {
      totalBahan: 0,
      totalJasaOperasional: 0,
      totalUtilitiesDanBekakas: 0,
      totalOff: 0,
      totalMargin: 0,
      totalSisaUntung: 0,
      nilaiPO: 0,
    },
  );

  const nilaiUntung =
    totals?.nilaiPO -
    totals?.totalBahan -
    totals?.totalJasaOperasional -
    totals?.totalUtilitiesDanBekakas;

  const totalUntung = totals?.totalMargin + totals?.totalSisaUntung;

  const selisihUntung = nilaiUntung - totalUntung;

  const percent =
    (totalUntung /
      (totals?.totalBahan +
        totals?.totalJasaOperasional +
        totals?.totalUtilitiesDanBekakas)) *
    100;

  const biayaMainDanDevelop =
    (summary?.ocbpsSettingMainDevelopPercentage * totals?.totalSisaUntung) /
    100;

  const biayaInsentif =
    (summary?.ocbpsSettingIncentivePercentage * totals?.totalSisaUntung) / 100;

  const biayaMarketing =
    (summary?.ocbpsSettingMarketingPercentage * totals?.totalSisaUntung) / 100;

  const sisaUntungBersih =
    totals?.totalSisaUntung -
    (biayaMainDanDevelop + biayaInsentif + biayaMarketing);

  const percentKeuntunganTergerus =
    ((totals?.totalMargin + sisaUntungBersih) /
      (totals?.totalBahan +
        totals?.totalJasaOperasional +
        totals?.totalUtilitiesDanBekakas)) *
    100;

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
        <AdminNavbar />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
            <p className="text-primaryColor font-semibold">
              Memuat data simulasi RABP...
            </p>
          </div>
        ) : (
          summary && (
            <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => navigate("/admin/order/list")}
                  className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Kembali
                </button>

                <div className="flex items-center justify-between flex-1">
                  <h1 className="text-3xl font-bold text-primaryColor">
                    Edit RABP Pesanan
                  </h1>

                  {/* RABP Report Button */}
                  {hasPermission('reports.rabp') && (
                    <button
                      onClick={async () => {
                        try {
                          const result = await generateRABPReport(summary, orderId);
                          if (result && result.success) {
                            toast.success(`Laporan RABP berhasil di-generate: ${result.fileName}`);
                          }
                        } catch (error) {
                          console.error("Error generating RABP report:", error);
                          toast.error("Gagal generate laporan RABP: " + error.message);
                        }
                      }}
                      disabled={!summary || !summary.ocbpItems || summary.ocbpItems.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-secondaryColor hover:bg-secondaryColor-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PrinterIcon className="w-4 h-4" />
                      Print RABP
                    </button>
                  )}
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
                        {formatCurrency(totals.totalBahan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Jasa Operasional
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(totals.totalJasaOperasional)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Utilities & Bekakas
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(totals.totalUtilitiesDanBekakas)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Untung</span>
                      <span className="font-semibold">
                        {formatCurrency(totalUntung)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Percent</span>
                      <span className="font-bold text-green-600">
                        {Number.isFinite(percent) ? percent?.toFixed(2) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Margin</span>
                      <span className="font-semibold">
                        {formatCurrency(totals.totalMargin)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sisa Untung</span>
                      <span className="font-semibold">
                        {formatCurrency(totals.totalSisaUntung)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nilai PO</span>
                      <span className="font-semibold">
                        {formatCurrency(totals.nilaiPO)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nilai Untung</span>
                      <span className="font-semibold">
                        {formatCurrency(nilaiUntung)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Selisih Untung</span>
                      <span className="font-bold text-green-600">
                        {selisihUntung === 0
                          ? "BALANCE"
                          : formatCurrency(selisihUntung)}
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
                        // setShowPercentageModal(true);
                        // setPercentageForm({
                        //   incentive: summary.ocbpsSettingIncentivePercentage,
                        //   mainDevelop:
                        //     summary.ocbpsSettingMainDevelopPercentage,
                        //   marketing: summary.ocbpsSettingMarketingPercentage,
                        // });
                        handleSubmitPercentage();
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
                          Persentase Main & Develop (%)
                        </span>
                        {/* <span className="font-semibold">
                          {summary.ocbpsSettingMainDevelopPercentage || 0}%
                        </span> */}
                        <LockableInput
                          type="number"
                          value={summary.ocbpsSettingMainDevelopPercentage || 0}
                          onChange={(e) => {
                            setSummary((prev) => {
                              return {
                                ...prev,
                                ocbpsSettingMainDevelopPercentage:
                                  e.target.valueAsNumber,
                              };
                            });
                          }}
                          min={0}
                          max={100}
                          toggleDisabled
                          locked={isFieldLocked}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm text-right"
                          placeholder="0"
                          onWheel={(e) => e.currentTarget.blur()}
                          disabledByDefault={!!summary.ocbpsSettingMainDevelopPercentage || 0}
                          left
                        />
                        {/* <input
                          type="number"
                          value={summary.ocbpsSettingMainDevelopPercentage || 0}
                          onChange={(e) => {
                            setSummary((prev) => {
                              return {
                                ...prev,
                                ocbpsSettingMainDevelopPercentage:
                                  e.target.valueAsNumber,
                              };
                            });
                          }}
                          min={0}
                          max={100}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm text-right"
                        /> */}
                      </div>
                      <div className="flex justify-between mt-2 ">
                        <span className="text-gray-600">
                          Biaya Main & Develop
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(biayaMainDanDevelop)}
                        </span>
                      </div>
                    </div>

                    {/* Incentive Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Persentase Insentif (%)
                        </span>
                        {/* <span className="font-semibold">
                          {summary.ocbpsSettingIncentivePercentage || 0}%
                        </span> */}
                        <LockableInput
                          type="number"
                          value={summary.ocbpsSettingIncentivePercentage || 0}
                          onChange={(e) => {
                            setSummary((prev) => {
                              return {
                                ...prev,
                                ocbpsSettingIncentivePercentage:
                                  e.target.valueAsNumber,
                              };
                            });
                          }}
                          min={0}
                          max={100}
                          toggleDisabled
                          locked={isFieldLocked}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm text-right"
                          placeholder="0"
                          onWheel={(e) => e.currentTarget.blur()}
                          disabledByDefault={!!summary.ocbpsSettingIncentivePercentage || 0}
                          left
                        />
                        {/* <input
                          type="number"
                          value={summary.ocbpsSettingIncentivePercentage || 0}
                          onChange={(e) => {
                            setSummary((prev) => {
                              return {
                                ...prev,
                                ocbpsSettingIncentivePercentage:
                                  e.target.valueAsNumber,
                              };
                            });
                          }}
                          min={0}
                          max={100}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm text-right"
                        /> */}
                      </div>
                      <div className="flex justify-between mt-2 ">
                        <span className="text-gray-600">Biaya Insentif</span>
                        <span className="font-semibold">
                          {formatCurrency(biayaInsentif)}
                        </span>
                      </div>
                    </div>

                    {/* Marketing Section */}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Persentase Marketing
                        </span>
                        {/* <span className="font-semibold">
                          {summary.ocbpsSettingMarketingPercentage || 0}%
                        </span> */}
                        <LockableInput
                          type="number"
                          value={summary.ocbpsSettingMarketingPercentage || 0}
                          onChange={(e) => {
                            setSummary((prev) => {
                              return {
                                ...prev,
                                ocbpsSettingMarketingPercentage:
                                  e.target.valueAsNumber,
                              };
                            });
                          }}
                          min={0}
                          max={100}
                          toggleDisabled
                          locked={isFieldLocked}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm text-right"
                          placeholder="0"
                          onWheel={(e) => e.currentTarget.blur()}
                          disabledByDefault={!!summary.ocbpsSettingMarketingPercentage || 0}
                          left
                        />
                        {/* <input
                          type="number"
                          value={summary.ocbpsSettingMarketingPercentage || 0}
                          onChange={(e) => {
                            setSummary((prev) => {
                              return {
                                ...prev,
                                ocbpsSettingMarketingPercentage:
                                  e.target.valueAsNumber,
                              };
                            });
                          }}
                          min={0}
                          max={100}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm text-right"
                        /> */}
                      </div>
                      <div className="flex justify-between mt-2 ">
                        <span className="text-gray-600">Biaya Marketing</span>
                        <span className="font-semibold">
                          {formatCurrency(biayaMarketing)}
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
                          {formatCurrency(sisaUntungBersih)}
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
                          {Number.isFinite(percentKeuntunganTergerus)
                            ? percentKeuntunganTergerus?.toFixed(2)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <RABItemsSection
                handleSubmit={handleSubmit}
                summary={summary}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                fetchSummary={fetchSummary}
                inventories={inventories}
                templates={templates}
                setSummary={setSummary}
                isSaving={isSaving}
                formRef={formRef}
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
