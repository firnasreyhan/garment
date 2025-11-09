import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInventories } from '../../../api/Inventory/inventory';
import {
  getOrderCostBudgetPlanSummary,
  updateOrderCostBudgetPlan,
  updateOrderCostBudgetPlanSummaryPercentage
} from '../../../api/Order/order';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const PercentageModal = ({ handleUpdatePercentage, handleCancel, percentageForm, setPercentageForm, isUpdatingPercentage }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h3 className="text-lg font-bold mb-4">Edit Persentase Pembagian</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Main & Develop (%)</label>
            <input
              type="number"
              value={percentageForm.mainDevelop}
              onChange={(e) => setPercentageForm(prev => ({ ...prev, mainDevelop: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isUpdatingPercentage}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Insentif (%)</label>
            <input
              type="number"
              value={percentageForm.incentive}
              onChange={(e) => setPercentageForm(prev => ({ ...prev, incentive: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isUpdatingPercentage}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marketing (%)</label>
            <input
              type="number"
              value={percentageForm.marketing}
              onChange={(e) => setPercentageForm(prev => ({ ...prev, marketing: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isUpdatingPercentage}
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {percentageForm.mainDevelop + percentageForm.incentive + percentageForm.marketing}%
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
              'Simpan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditRabOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // State untuk data utama
  // const [orderData, setOrderData] = useState(null);
  // State untuk operational services sudah dipindah ke formData

  // State untuk menyimpan form data untuk setiap kombinasi cpId dan sName
  const [formDataMap, setFormDataMap] = useState({});
  const [isUpdatingPercentage, setIsUpdatingPercentage] = useState(false);


  // State untuk form input aktif
  const [formData, setFormData] = useState({
    ocbpId: 0,
    ocbpAmount: 0,
    ocbpMaterialName: '',
    ocbpMaterialCode: '',
    ocbpMaterialNeed: 0,
    ocbpMaterialNeedTotal: 0,
    ocbpMaterialPrice: 0,
    ocbpMaterialNeedPrice: 0,
    ocbpMaterialNeedPriceTotal: 0,
    ocbpOperationalServiceColumn: [],
    ocbpOperationalServiceValue: [],
    ocbpOperationalServiceValueTotal: 0,
    ocbpUtilityColumn: [],
    ocbpUtilityValue: [],
    ocbpUtilityValueTotal: 0,
    ocbpCogs: 0,
    ocbpPriceOff: 0,
    ocbpTotalOff: 0,
    ocbpSettingMarginPercentage: 0,
    ocbpMargin: 0,
    ocbpMarginNominal: 0,
    ocbpMarginTotal: 0,
    ocbpProfitRemaining: 0,
    ocbpProfitRemainingTotal: 0,
    ocbpPercent: 0
  });

  // State untuk summary
  const [summary, setSummary] = useState({
    ocbpsId: 0,
    oId: 0,
    ocbpsAmount: 0,
    ocbpsMaterialNeedTotal: 0,
    ocbpsMaterialNeedPriceTotal: 0,
    ocbpsOperationalServiceColumn: [],
    ocbpsOperationalServiceValueTotal: [],
    ocbpsUtilityColumn: [],
    ocbpsUtilityValueTotal: [],
    ocbpsOperationalTotal: 0,
    ocbpsCogs: 0,
    ocbpsTotalOff: 0,
    ocbpsMargin: 0,
    ocbpsMarginNominal: 0,
    ocbpsMarginTotal: 0,
    ocbpsProfitRemaining: 0,
    ocbpsProfitRemainingTotal: 0,
    ocbpsProfitTotal: 0,
    ocbpsProfitValue: 0,
    ocbpsProfitDifference: 0,
    ocbpsSettingMainDevelopPercentage: 0,
    ocbpsMainDevelop: 0,
    ocbpsSettingIncentivePercentage: 0,
    ocbpsIncentive: 0,
    ocbpsSettingMarketingPercentage: 0,
    ocbpsMarketing: 0,
    ocbpsProfitNet: 0,
    ocbpsPercent: 0,
    ocbpsPercentEroded: 0,
    ocbpItems: [],
  });

  // State untuk edit percentage modal
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  const [activeItemTabs, setActiveItemTabs] = useState(0);
  const [percentageForm, setPercentageForm] = useState({
    mainDevelop: 0,
    incentive: 0,
    marketing: 0
  });

  // State untuk inventory data
  const [inventories, setInventories] = useState([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');

  // CSS untuk tab
  const tabStyles = {
    tab: "overflow-hidden border-b border-gray-200",
    tabButton: "float-left border-none outline-none cursor-pointer py-3 px-6 transition-all duration-300 font-medium",
    activeTabButton: "bg-primaryColor text-white",
    inactiveTabButton: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    tabContent: "p-6 bg-white rounded-b-xl shadow-md"
  };

  // Helper functions untuk mendapatkan ID dan nama dari berbagai format API
  const getId = (item, idFields = ['id', 'iId', 'isId', 'inventoryId']) => {
    for (const field of idFields) {
      if (item[field] !== undefined) return item[field];
    }
    return '';
  };

  const getName = (item, nameFields = ['isName', 'iCode', 'iDescription', 'name', 'description', 'code']) => {
    for (const field of nameFields) {
      if (item[field] !== undefined && item[field] !== null && item[field] !== '')
        return item[field];
    }
    return 'Unknown';
  };

  // Helper function untuk menyimpan form data ke map
  const saveFormDataToMap = (ocbpId, data) => {
    console.log("saveFormDataToMap", ocbpId, data)
    const key = `${ocbpId}`;
    setFormDataMap(prev => ({
      ...prev,
      [key]: { ...data }
    }));
  };

  // Helper function untuk memuat form data dari map
  const loadFormDataFromMap = (ocbpId) => {
    console.log("loadFormDataFromMap", ocbpId)
    const key = `${ocbpId}`
    const savedData = formDataMap[key];
    console.log("savedData", savedData)

    if (savedData) {
      setFormData(savedData);
    } else {
      console.log("savedData", "set data awal")
      // Set data awal jika belum ada
      setFormData(prev => ({
        ...prev,
        ocbpId: ocbpId,
        ocbpAmount: summary?.ocbpItems?.find(item => item.ocbpId === ocbpId)?.ocbpAmount,
        ocbpOperationalServiceColumn: [],
        ocbpOperationalServiceValue: [],
        ocbpUtilityColumn: [],
        ocbpUtilityValue: []
      }));
    }
  };


  // Handler untuk pergantian tab
  const handleTabChange = (item) => {
    console.log("handleTabChange", item)
    // Simpan form data saat ini ke map sebelum pindah tab
    saveFormDataToMap(formData.ocbpId, formData);


    // Load form data untuk tab baru
    loadFormDataFromMap(item.ocbpId);

    // Update active tab
    setActiveItemTabs(item.ocbpId);
  };

  // Fetch inventory data
  const fetchInventoryData = useCallback(async () => {
    try {
      const inventoriesRes = await getInventories({
        pageLimit: -1,
        pageNumber: 1
      });

      // Extract data dari response
      let inventoriesData = [];
      if (inventoriesRes.data?.data?.listData) {
        inventoriesData = inventoriesRes.data.data.listData;
      } else if (inventoriesRes.data?.listData) {
        inventoriesData = inventoriesRes.data.listData;
      } else if (inventoriesRes.data?.data) {
        inventoriesData = Array.isArray(inventoriesRes.data.data) ? inventoriesRes.data.data : [];
      }

      setInventories(inventoriesData);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      // Fallback data
      setInventories([
        { iId: 1, iCode: 'DRILL', iName: 'American Drill', iDescription: 'American Drill' },
        { iId: 2, iCode: 'CANVAS', iName: 'Kanvas', iDescription: 'Kanvas' }
      ]);
    }
  }, []);

  // Operational services are included in RAB response

  // Fetch detail order dan RAB
  const fetchOrderDetail = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch order detail
      // const orderResponse = await getOrderDetail(orderId);
      // const orderData = orderResponse.data.data;
      // setOrderData(orderData);

      // Fetch RAB summary
      try {
        const summaryResponse = await getOrderCostBudgetPlanSummary(orderId);
        const summaryData = summaryResponse.data.data;

        if (summaryData) {
          setSummary(prev => ({
            ...prev,
            ocbpsId: summaryData.ocbpsId,
            totalBahan: summaryData.ocbpsTotalMaterial || 0,
            totalOperasional: summaryData.ocbpsTotalOperational || 0,
            totalUtilities: summaryData.ocbpsTotalUtility || 0,
            totalCOGS: summaryData.ocbpsTotalCOGS || 0,
            totalMargin: summaryData.ocbpsTotalMargin || 0,
            finalPrice: summaryData.ocbpsTotalPrice || 0,
            // nilaiPO: orderData.oPrice || 0,
            // nilaiUntung: orderData.oMargin || 0,
            marginPercentage: summaryData.ocbpsSettingMarginPercentage || 0,
            // biayaMainDevelop: orderData.oMainDevelop || 0,
            // biayaInsentif: orderData.oIncentive || 0,
            // biayaMarketing: orderData.oMarketing || 0,
            // sisaUntungBersih: orderData.oProfitRemaining || 0,
            ocbpsSettingMainDevelopPercentage: summaryData.ocbpsSettingMainDevelopPercentage || 0,
            ocbpItems: summaryData.ocbpItems,
            ocbpsSettingIncentivePercentage: summaryData.ocbpsSettingIncentivePercentage || 0,
            ocbpsSettingMarketingPercentage: summaryData.ocbpsSettingMarketingPercentage || 0,
            mainDevelopPercentage: summaryData.ocbpsSettingMainDevelopPercentage || 0,
            incentivePercentage: summaryData.ocbpsSettingIncentivePercentage || 0,
            marketingPercentage: summaryData.ocbpsSettingMarketingPercentage || 0,
            ocbpsProfitValue: summaryData.ocbpsProfitValue,
            ocbpsProfitTotal: summaryData.ocbpsProfitTotal,
            ocbpsProfitDifference: summaryData.ocbpsProfitDifference,
            ocbpsProfitRemaining: summaryData.ocbpsProfitRemaining,
            ocbpsProfitRemainingTotal: summaryData.ocbpsProfitRemainingTotal,
            ocbpsProfitNet: summaryData.ocbpsProfitNet,
            ocbpsMargin: summaryData.ocbpsMargin,
            ocbpsMarginNominal: summaryData.ocbpsMarginNominal,
            ocbpsPercentEroded: summaryData.ocbpsPercentEroded,
            ocbpsTotalOff: summaryData.ocbpsTotalOff,
          }));

          // Set form data dari RAB item pertama jika ada
          if (summaryData.ocbpItems?.length > 0 && activeItemTabs === 0) {
            const rabItem = summaryData.ocbpItems[0];


            setFormData(prev => ({
              ...prev,
              ocbpId: rabItem.ocbpId || 0,
              cpId: rabItem.cpId || 0,
              cpName: rabItem.cpName || '',
              sGroup: rabItem.sGroup || '',
              ocbpAmount: rabItem.ocbpAmount || 0,
              ocbpMaterialName: rabItem.ocbpMaterialName || '',
              ocbpMaterialCode: rabItem.ocbpMaterialCode || '',
              ocbpMaterialNeed: rabItem.ocbpMaterialNeed || 0,
              ocbpMaterialNeedTotal: rabItem.ocbpMaterialNeedTotal || 0,
              ocbpMaterialPrice: rabItem.ocbpMaterialPrice || 0,
              ocbpMaterialNeedPrice: rabItem.ocbpMaterialNeedPrice || 0,
              ocbpMaterialNeedPriceTotal: rabItem.ocbpMaterialNeedPriceTotal || 0,
              ocbpOperationalServiceColumn: rabItem.ocbpOperationalServiceColumn || [],
              ocbpOperationalServiceValue: rabItem.ocbpOperationalServiceValue || [],
              ocbpOperationalServiceValueTotal: rabItem.ocbpOperationalServiceValueTotal || 0,
              ocbpUtilityColumn: rabItem.ocbpUtilityColumn || [],
              ocbpUtilityValue: rabItem.ocbpUtilityValue || [],
              ocbpUtilityValueTotal: rabItem.ocbpUtilityValueTotal || 0,
              ocbpCogs: rabItem.ocbpCogs || 0,
              ocbpPriceOff: rabItem.ocbpPriceOff || 0,
              ocbpTotalOff: rabItem.ocbpTotalOff || 0,
              ocbpSettingMarginPercentage: rabItem.ocbpSettingMarginPercentage || 0,
              ocbpMargin: rabItem.ocbpMargin || 0,
              ocbpMarginNominal: rabItem.ocbpMarginNominal || 0,
              ocbpMarginTotal: rabItem.ocbpMarginTotal || 0,
              ocbpProfitRemaining: rabItem.ocbpProfitRemaining || 0,
              ocbpProfitRemainingTotal: rabItem.ocbpProfitRemainingTotal || 0,
              ocbpPercent: rabItem.ocbpPercent || 0
            }));
          }
        }
      } catch (error) {
        console.warn('RAB summary not found, will create new one:', error);
      }

      // Set order items jika ada
      if (summary.ocbpItems?.length > 0) {
        const firstItem = summary.ocbpItems[0];
        setFormData(prev => ({
          ...prev,
          namaProduk: firstItem.cpName || '',
          ukuran: firstItem.oiSizes?.map(size => `${size.sName}: ${size.oisAmount}`).join(', ') || '',
          jumlahOrder: firstItem.oiSizes?.reduce((total, size) => total + size.oisAmount, 0) || 0
        }));
      }

      // Set percentage form
      setPercentageForm(prev => ({
        ...prev,
        mainDevelop: summary.ocbpsSettingMainDevelopPercentage || prev.mainDevelop,
        incentive: summary.ocbpsSettingIncentivePercentage || prev.incentive,
        marketing: summary.ocbpsSettingMarketingPercentage || prev.marketing
      }));

    } catch (err) {
      console.error('Error fetching order detail:', err);
      setErrorMessage('Gagal memuat detail order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, summary]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [
          // orderResponse
          summaryResponse] = await Promise.all([
            // getOrderDetail(orderId),
            getOrderCostBudgetPlanSummary(orderId)
          ]);


        const summaryData = summaryResponse.data.data;



        // setOrderData(orderData);
        const items = summaryData.ocbpItems || [];


        // Set initial active tabs if needed
        if (activeItemTabs === 0 && items.length > 0) {
          const firstItem = items[0];
          setActiveItemTabs(firstItem.ocbpId);
          setFormData({
            ocbpId: firstItem.ocbpId || 0,
            cpId: firstItem.cpId || 0,
            cpName: firstItem.cpName || '',
            sGroup: firstItem.sGroup || '',
            ocbpAmount: firstItem.ocbpAmount || 0,
            ocbpMaterialName: firstItem.ocbpMaterialName || '',
            ocbpMaterialCode: firstItem.ocbpMaterialCode || '',
            ocbpMaterialNeed: firstItem.ocbpMaterialNeed || 0,
            ocbpMaterialNeedTotal: firstItem.ocbpMaterialNeedTotal || 0,
            ocbpMaterialPrice: firstItem.ocbpMaterialPrice || 0,
            ocbpMaterialNeedPrice: firstItem.ocbpMaterialNeedPrice || 0,
            ocbpMaterialNeedPriceTotal: firstItem.ocbpMaterialNeedPriceTotal || 0,
            ocbpOperationalServiceColumn: firstItem.ocbpOperationalServiceColumn || [],
            ocbpOperationalServiceValue: firstItem.ocbpOperationalServiceValue || [],
            ocbpOperationalServiceValueTotal: firstItem.ocbpOperationalServiceValueTotal || 0,
            ocbpUtilityColumn: firstItem.ocbpUtilityColumn || [],
            ocbpUtilityValue: firstItem.ocbpUtilityValue || [],
            ocbpUtilityValueTotal: firstItem.ocbpUtilityValueTotal || 0,
            ocbpCogs: firstItem.ocbpCogs || 0,
            ocbpPriceOff: firstItem.ocbpPriceOff || 0,
            ocbpTotalOff: firstItem.ocbpTotalOff || 0,
            ocbpSettingMarginPercentage: firstItem.ocbpSettingMarginPercentage || 0,
            ocbpMargin: firstItem.ocbpMargin || 0,
            ocbpMarginNominal: firstItem.ocbpMarginNominal || 0,
            ocbpMarginTotal: firstItem.ocbpMarginTotal || 0,
            ocbpProfitRemaining: firstItem.ocbpProfitRemaining || 0,
            ocbpProfitRemainingTotal: firstItem.ocbpProfitRemainingTotal || 0,
            ocbpPercent: firstItem.ocbpPercent || 0
          });
        }


        if (summaryData) {
          summaryData.ocbpItems.map(item => {
            const key = item.ocbpId;
            setFormDataMap(prev => ({
              ...prev,
              [key]: {
                ...item,
                "ocbpOperationalServiceColumn": item.ocbpOperationalServiceColumn || [],
                "ocbpOperationalServiceValue": item.ocbpOperationalServiceValue || [],
                "ocbpUtilityColumn": item.ocbpUtilityColumn || [],
                "ocbpUtilityValue": item.ocbpUtilityValue || [],
                "ocbpPriceOff": item.ocbpPriceOff || 0,
                "ocbpSettingMarginPercentage": item.ocbpSettingMarginPercentage || 0
              }
            }));
          })
          setSummary(prev => ({
            ...prev,
            ocbpsId: summaryData.ocbpsId,
            ocbpsMaterialNeedPriceTotal: summaryData.ocbpsMaterialNeedPriceTotal,
            ocbpsOperationalTotal: summaryData.ocbpsOperationalTotal,
            ocbpsUtilityTotal: summaryData.ocbpsUtilityValueTotal?.reduce((a, b) => a + b, 0) || 0,
            ocbpsCogs: summaryData.ocbpsCogs,
            ocbpsMarginTotal: summaryData.ocbpsMarginTotal,
            ocbpsTotalOff: summaryData.ocbpsTotalOff,
            ocbpsPercent: summaryData.ocbpsPercent,
            biayaMainDevelop: summaryData.ocbpsMainDevelop,
            biayaInsentif: summaryData.ocbpsIncentive,
            biayaMarketing: summaryData.ocbpsMarketing,
            sisaUntungBersih: summaryData.ocbpsProfitNet,
            ocbpsSettingMainDevelopPercentage: summaryData.ocbpsSettingMainDevelopPercentage || 0,
            ocbpsSettingIncentivePercentage: summaryData.ocbpsSettingIncentivePercentage || 0,
            ocbpsSettingMarketingPercentage: summaryData.ocbpsSettingMarketingPercentage || 0,
            mainDevelopPercentage: summaryData.ocbpsSettingMainDevelopPercentage,
            incentivePercentage: summaryData.ocbpsSettingIncentivePercentage,
            marketingPercentage: summaryData.ocbpsSettingMarketingPercentage,
            ocbpItems: summaryData.ocbpItems,
            ocbpsProfitValue: summaryData.ocbpsProfitValue,
            ocbpsProfitTotal: summaryData.ocbpsProfitTotal,
            ocbpsProfitDifference: summaryData.ocbpsProfitDifference,
            ocbpsProfitRemaining: summaryData.ocbpsProfitRemaining,
            ocbpsProfitRemainingTotal: summaryData.ocbpsProfitRemainingTotal,
            ocbpsProfitNet: summaryData.ocbpsProfitNet,
            ocbpsMargin: summaryData.ocbpsMargin,
            ocbpsMarginNominal: summaryData.ocbpsMarginNominal,
            ocbpsPercentEroded: summaryData.ocbpsPercentEroded,
          }));

          // if (summaryData.ocbpItems?.[0]) {
          //   const rabItem = summaryData.ocbpItems[0];
          //   setFormData({
          //     ocbpId: rabItem.ocbpId || 0,
          //     cpId: rabItem.cpId || 0,
          //     cpName: rabItem.cpName || '',
          //     sGroup: rabItem.sGroup || '',
          //     ocbpAmount: rabItem.ocbpAmount || 0,
          //     ocbpMaterialName: rabItem.ocbpMaterialName || '',
          //     ocbpMaterialCode: rabItem.ocbpMaterialCode || '',
          //     ocbpMaterialNeed: rabItem.ocbpMaterialNeed || 0,
          //     ocbpMaterialNeedTotal: rabItem.ocbpMaterialNeedTotal || 0,
          //     ocbpMaterialPrice: rabItem.ocbpMaterialPrice || 0,
          //     ocbpMaterialNeedPrice: rabItem.ocbpMaterialNeedPrice || 0,
          //     ocbpMaterialNeedPriceTotal: rabItem.ocbpMaterialNeedPriceTotal || 0,
          //     ocbpOperationalServiceColumn: rabItem.ocbpOperationalServiceColumn || [],
          //     ocbpOperationalServiceValue: rabItem.ocbpOperationalServiceValue || [],
          //     ocbpOperationalServiceValueTotal: rabItem.ocbpOperationalServiceValueTotal || 0,
          //     ocbpUtilityColumn: rabItem.ocbpUtilityColumn || [],
          //     ocbpUtilityValue: rabItem.ocbpUtilityValue || [],
          //     ocbpUtilityValueTotal: rabItem.ocbpUtilityValueTotal || 0,
          //     ocbpCogs: rabItem.ocbpCogs || 0,
          //     ocbpPriceOff: rabItem.ocbpPriceOff || 0,
          //     ocbpTotalOff: rabItem.ocbpTotalOff || 0,
          //     ocbpSettingMarginPercentage: rabItem.ocbpSettingMarginPercentage || 0,
          //     ocbpMargin: rabItem.ocbpMargin || 0,
          //     ocbpMarginNominal: rabItem.ocbpMarginNominal || 0,
          //     ocbpMarginTotal: rabItem.ocbpMarginTotal || 0,
          //     ocbpProfitRemaining: rabItem.ocbpProfitRemaining || 0,
          //     ocbpProfitRemainingTotal: rabItem.ocbpProfitRemainingTotal || 0,
          //     ocbpPercent: rabItem.ocbpPercent || 0
          //   });
          // }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setErrorMessage('Gagal memuat data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [orderId, activeItemTabs]);

  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // useEffect(() => {
  //   if (inventories.length > 0) {
  //     if (!formData.ocbpMaterialName) return;
  //     console.log('trigger')
  //     const firstMatchInventorySubcategory = inventories.find(item => item.iCode === formData.ocbpMaterialCode && item.isName === formData.ocbpMaterialName);
  //     if (firstMatchInventorySubcategory) {
  //       setSelectedInventoryId(firstMatchInventorySubcategory.iId);
  //     }
  //   }
  // }, [formData.ocbpMaterialCode, formData.ocbpMaterialName, inventories])

  // Summary data is updated through loadInitialData

  // Handlers
  // Removed handleItemChange function

  const handleNumericInput = (value, allowEmpty = false) => {
    if (value === '' && allowEmpty) return '';
    if (value === '') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleOperationalServiceChange = async (index, value) => {
    setFormData(prev => {
      const newOperationalServiceValue = [...prev.ocbpOperationalServiceValue];
      newOperationalServiceValue[index] = handleNumericInput(value);
      return {
        ...prev,
        ocbpOperationalServiceValue: newOperationalServiceValue
      };
    });
    await handleSubmit();
  };

  const handleUtilityChange = (index, value) => {
    setFormData(prev => {
      const newUtilityValue = [...prev.ocbpUtilityValue];
      newUtilityValue[index] = handleNumericInput(value);
      return {
        ...prev,
        ocbpUtilityValue: newUtilityValue
      };
    });
  };

  // Removed handleUpdatePercentage function

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Simpan form data saat ini ke map sebelum submit
      saveFormDataToMap(formData.ocbpId);

      // Buat array dari semua data yang tersimpan
      const allFormData = [];

      // Loop melalui semua item dan size untuk mengumpulkan data
      summary?.ocbpItems?.forEach(item => {
        const key = `${item.ocbpI}`
        const savedData = formDataMap[key];

        if (savedData) {
          allFormData.push({
            ocbpId: savedData.ocbpId,
            ocbpAmount: savedData.ocbpAmount,
            ocbpMaterialName: savedData.ocbpMaterialName,
            ocbpMaterialCode: savedData.ocbpMaterialCode,
            ocbpMaterialNeed: savedData.ocbpMaterialNeed,
            ocbpMaterialPrice: savedData.ocbpMaterialPrice,
            ocbpOperationalServiceColumn: savedData.ocbpOperationalServiceColumn,
            ocbpOperationalServiceValue: savedData.ocbpOperationalServiceValue,
            ocbpUtilityColumn: savedData.ocbpUtilityColumn,
            ocbpUtilityValue: savedData.ocbpUtilityValue,
            ocbpPriceOff: savedData.ocbpPriceOff,
            ocbpSettingMarginPercentage: savedData.ocbpSettingMarginPercentage
          });
        }
      });


      // Jika tidak ada data tersimpan, gunakan form data saat ini
      if (allFormData.length === 0 && formData.ocbpId) {
        allFormData.push({
          ocbpId: formData.ocbpId,
          ocbpAmount: formData.ocbpAmount,
          ocbpMaterialName: formData.ocbpMaterialName,
          ocbpMaterialCode: formData.ocbpMaterialCode,
          ocbpMaterialNeed: formData.ocbpMaterialNeed,
          ocbpMaterialPrice: formData.ocbpMaterialPrice,
          ocbpOperationalServiceColumn: formData.ocbpOperationalServiceColumn,
          ocbpOperationalServiceValue: formData.ocbpOperationalServiceValue,
          ocbpUtilityColumn: formData.ocbpUtilityColumn,
          ocbpUtilityValue: formData.ocbpUtilityValue,
          ocbpPriceOff: formData.ocbpPriceOff,
          ocbpSettingMarginPercentage: formData.ocbpSettingMarginPercentage
        });
      }

      const rabPayload = {
        ocbpsId: summary.ocbpsId,
        ocbpItems: allFormData
      };

      await updateOrderCostBudgetPlan(rabPayload);
      console.log("updateOrderCostBudgetPlan", rabPayload)

      // Update order price
      // const pricePayload = {
      //   oId: summary.oId,
      //   oPrice: summary.ocbpsTotalOff,
      //   oDownPayment: 0,
      //   oPaid: 0,
      //   oCogs: summary.ocbpsCogs,
      //   oMargin: summary.ocbpsMarginTotal,
      //   oProfitRemaining: summary.ocbpsProfitRemaining,
      //   oMarketing: summary.ocbpsMarketing,
      //   oIncentive: summary.ocbpsIncentive,
      //   oMainDevelop: summary.ocbpsMainDevelop
      // };

      // await updateOrderPrice(pricePayload);

      // console.log("updateOrderPrice", pricePayload)

      setSuccessMessage('RAB berhasil diupdate');
      fetchOrderDetail();
    } catch (err) {
      console.error('Error updating RAB:', err);
      setErrorMessage('Gagal mengupdate RAB: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency  = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdatePercentage = async () => {
    try {
      setIsUpdatingPercentage(true);
      setErrorMessage('');

      const payload = {
        ocbpsId: summary.ocbpsId,
        ocbpsSettingMainDevelopPercentage: percentageForm.mainDevelop,
        ocbpsSettingIncentivePercentage: percentageForm.incentive,
        ocbpsSettingMarketingPercentage: percentageForm.marketing
      };

      // Gunakan function yang sudah ada di file API kamu
      await updateOrderCostBudgetPlanSummaryPercentage(payload);

      setSummary(prev => ({
        ...prev,
        ocbpsSettingMainDevelopPercentage: percentageForm.mainDevelop,
        ocbpsSettingIncentivePercentage: percentageForm.incentive,
        ocbpsSettingMarketingPercentage: percentageForm.marketing
      }));

      setSuccessMessage('Persentase pembagian berhasil diupdate');
      setShowPercentageModal(false);

      // Refresh data
      await fetchOrderDetail();

    } catch (error) {
      console.error('Error updating percentage:', error);
      setErrorMessage('Gagal mengupdate persentase: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdatingPercentage(false);
    }
  };

  const handleCancel = () => {
    setShowPercentageModal(false);
  };

  return (
    <div
      className="flex min-h-screen overflow-x-hidden"
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
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />

        <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/order/list')}
              className="flex items-center gap-2 px-4 py-2 text-primaryColor hover:bg-primaryColor hover:text-white rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primaryColor">Edit RAB Pesanan</h1>
              <div className="space-y-1">
                {summary?.oPoNumber && (
                  <p className="text-black">No. PO: {summary.oPoNumber}</p>
                )}
                <p className="text-black">No. Order: {summary?.oNumber || orderId}</p>
              </div>
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
                <h2 className="text-xl font-bold">REKAP RAB</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bahan</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsMaterialNeedPriceTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Jasa Operasional</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsOperationalTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Utilities & Bekakas</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsUtilityValueTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Untung</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsProfitTotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Percent</span>
                  <span className="font-bold text-green-600">{summary.ocbpsPercent?.toFixed(2)}%</span>
                </div>
                {/* <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total HPP</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsCogs)}</span>
                </div> */}
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Total Off</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsTotalOff)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nominal Margin</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsMarginNominal)}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Margin</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsMarginTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sisa Untung</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsProfitRemainingTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nilai PO</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsTotalOff)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nilai PO</span>
                  <span className="font-semibold">{formatCurrency(summary.ocbpsProfitValue)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Selisih Untung</span>
                  {summary.ocbpsProfitDifference === 0 ? (
                    <span className="font-bold text-green-600">BALANCE</span>
                  ) : (
                    <span className="font-bold text-green-600">
                      {formatCurrency(summary.ocbpsProfitDifference)}
                    </span>
                  )}
                </div>
                {/* <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Harga Final</span>
                  <span className="font-bold text-green-600">{formatCurrency(summary.ocbpsTotalOff)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin %</span>
                  <span className="font-semibold">{summary.ocbpsPercent?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin % Eroded</span>
                  <span className="font-semibold">{summary.ocbpsPercentEroded?.toFixed(2)}%</span>
                </div> */}
              </div>
            </div>

            {/* REKAP PEMBAGIAN SISA UNTUNG Card */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">REKAP PEMBAGIAN SISA UNTUNG</h2>
                <button
                  onClick={() => {
                    setShowPercentageModal(true)
                    setPercentageForm({
                      incentive: summary.ocbpsSettingIncentivePercentage,
                      mainDevelop: summary.ocbpsSettingMainDevelopPercentage,
                      marketing: summary.ocbpsSettingMarketingPercentage,
                    })
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
                    <span className="text-gray-600">Persentase Main & Develop</span>
                    <span className="font-semibold">{summary.ocbpsSettingMainDevelopPercentage}%</span>
                  </div>
                  <div className="flex justify-between mt-2 hidden">
                    <span className="text-gray-600">Biaya Main & Develop</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsMainDevelop)}</span>
                  </div>
                </div>

                {/* Incentive Section */}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Persentase Insentif</span>
                    <span className="font-semibold">{summary.ocbpsSettingIncentivePercentage}%</span>
                  </div>
                  <div className="flex justify-between mt-2 hidden">
                    <span className="text-gray-600">Biaya Insentif</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsIncentive)}</span>
                  </div>
                </div>

                {/* Marketing Section */}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Persentase Marketing</span>
                    <span className="font-semibold">{summary.ocbpsSettingMarketingPercentage}%</span>
                  </div>
                  <div className="flex justify-between mt-2 hidden">
                    <span className="text-gray-600">Biaya Marketing</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsMarketing)}</span>
                  </div>
                </div>

                {/* Profit Section */}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Value</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsProfitValue)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Total Profit</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsProfitTotal)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Profit Difference</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsProfitDifference)}</span>
                  </div>
                </div>

                {/* Remaining Profit Section */}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Remaining</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsProfitRemaining)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Total Profit Remaining</span>
                    <span className="font-semibold">{formatCurrency(summary.ocbpsProfitRemainingTotal)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Sisa Untung Bersih</span>
                    <span className="font-bold text-green-600">{formatCurrency(summary.ocbpsProfitNet)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="flex flex-col p-4 bg-white border-b">
                  {/* Size Tabs */}
                  <div className={tabStyles.tab}>
                    {summary?.ocbpItems?.map((item) => {
                      return <button
                        key={item.ocbpId}
                        className={`${tabStyles.tabButton} ${activeItemTabs === item.ocbpId ? tabStyles.activeTabButton : tabStyles.inactiveTabButton
                          }`}
                        onClick={() => handleTabChange(item)}
                      >
                        {`${item.cpName} - Size ${item.sGroup} (${item.ocbpAmount})`}
                      </button>
                    })}
                  </div>
                </div>
                {summary?.ocbpItems?.map((item) => {
                  // Set active tab untuk item ini jika belum ada
                  if (activeItemTabs === 0 && item.length > 0) {
                    setActiveItemTabs(item.ocbpId);
                  }

                  return (
                    <div
                      key={item.ocbpId + "_" + item.sGroup}
                      className={`p-6 space-y-8 ${activeItemTabs === item.ocbpId ? '' : 'hidden'}`}
                    >
                      <form onSubmit={handleSubmit}>
                        {/* Material Info */}
                        <div className="grid grid-cols-2 gap-x-4 bg-white rounded-xl p-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Nama Produk</span>
                              <input
                                type="text"
                                value={`${item.cpName} - Size ${item.sGroup}`}
                                readOnly
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Jumlah Order</span>
                              <input
                                type="text"
                                value={item.ocbpAmount}
                                readOnly
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Nama Bahan</span>
                              <div className="relative">
                                <select
                                  value={selectedInventoryId}
                                  onChange={(e) => {
                                    const inventoryId = e.target.value;
                                    setSelectedInventoryId(inventoryId);

                                    if (inventoryId) {
                                      const selectedInventory = inventories.find(inv => getId(inv, ['id', 'iId', 'isId']) == inventoryId);
                                      if (selectedInventory) {
                                        setFormData(prev => ({
                                          ...prev,
                                          ocbpMaterialName: getName(selectedInventory, ['isName', 'iCode', 'iDescription']),
                                          ocbpMaterialCode: selectedInventory.iCode || ''
                                        }));
                                      }
                                    } else {
                                      setFormData(prev => ({
                                        ...prev,
                                        ocbpMaterialName: '',
                                        ocbpMaterialCode: ''
                                      }));
                                    }
                                  }}
                                  className="w-48 px-2 py-1 border border-gray-300 rounded text-black text-sm appearance-none pr-8"
                                >
                                  <option value="">Pilih Bahan</option>
                                  {(() => {
                                    // Filter inventories to remove duplicates based on name
                                    const uniqueInventories = Array.isArray(inventories) ? inventories.reduce((acc, inventory) => {
                                      const inventoryCode = getName(inventory, ['iCode', 'iDescription']);
                                      const existingIndex = acc.findIndex(item =>
                                        getName(item, ['iCode', 'iDescription']) === inventoryCode
                                      );

                                      if (existingIndex === -1) {
                                        acc.push(inventory);
                                      }
                                      return acc;
                                    }, []) : [];


                                    return uniqueInventories.map((inventory) => (
                                      <option key={getId(inventory, ['id', 'iId', 'isId'])} value={getId(inventory, ['id', 'iId', 'isId'])}>
                                        {getName(inventory, ['isName', 'iCode', 'iDescription'])}
                                      </option>
                                    ));
                                  })()}
                                </select>
                                <ChevronDownIcon className="w-4 h-4 absolute right-2 top-2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Kode Bahan</span>
                              <input
                                type="text"
                                value={formData.ocbpMaterialCode}
                                readOnly
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                                placeholder="Kode akan terisi otomatis"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Kebutuhan Kain/Unit</span>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.ocbpMaterialNeed}
                                onChange={(e) => setFormData(prev => ({ ...prev, ocbpMaterialNeed: Number(e.target.value) }))}
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
                                value={(formData.ocbpMaterialNeed * item.ocbpAmount).toFixed(2)}
                                readOnly
                                onWheel={(e) => e.currentTarget.blur()}
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Harga/M</span>
                              <input
                                type="number"
                                step="1"
                                value={formData.ocbpMaterialPrice}
                                onChange={(e) => setFormData(prev => ({ ...prev, ocbpMaterialPrice: parseInt(e.target.value) || 0 }))}
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                                placeholder="0"
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Total Harga Bahan</span>
                              <input
                                type="text"
                                value={formatCurrency(formData.ocbpMaterialPrice * formData.ocbpMaterialNeed)}
                                readOnly
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-sm">Grand Total Harga Bahan</span>
                              <input
                                type="text"
                                value={formatCurrency(formData.ocbpAmount * formData.ocbpMaterialPrice * formData.ocbpMaterialNeed)}
                                readOnly
                                className="w-48 px-2 py-1 border border-gray-300 rounded text-black bg-gray-50 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Kalkulasi Jasa Operasional */}
                        <div className="bg-primaryColor rounded-xl p-4 mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-semibold text-white">Kalkulasi Jasa Operasional</h3>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  ocbpOperationalServiceColumn: [...prev.ocbpOperationalServiceColumn, ''],
                                  ocbpOperationalServiceValue: [...prev.ocbpOperationalServiceValue, 0]
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
                              {formData.ocbpOperationalServiceColumn?.map((serviceName, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={serviceName}
                                      onChange={(e) => {
                                        const newColumns = [...formData.ocbpOperationalServiceColumn];
                                        newColumns[index] = e.target.value;
                                        setFormData(prev => ({
                                          ...prev,
                                          ocbpOperationalServiceColumn: newColumns
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
                                      value={formData.ocbpOperationalServiceValue[index] || 0}
                                      onChange={(e) => handleOperationalServiceChange(index, e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                                      placeholder="0"
                                      onWheel={(e) => e.currentTarget.blur()}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newColumns = formData.ocbpOperationalServiceColumn.filter((_, i) => i !== index);
                                      const newValues = formData.ocbpOperationalServiceValue.filter((_, i) => i !== index);
                                      setFormData(prev => ({
                                        ...prev,
                                        ocbpOperationalServiceColumn: newColumns,
                                        ocbpOperationalServiceValue: newValues
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
                                <span className="text-white font-medium text-sm">Total Operasional</span>
                                <span className="text-white font-bold">{formatCurrency(formData.ocbpOperationalServiceValueTotal)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Kalkulasi Utilities/Bekakas */}
                        <div className="bg-secondaryColor rounded-xl p-4 mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-semibold text-white">Kalkulasi Utilities & Bekakas</h3>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  ocbpUtilityColumn: [...prev.ocbpUtilityColumn, ''],
                                  ocbpUtilityValue: [...prev.ocbpUtilityValue, 0]
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
                              {formData.ocbpUtilityColumn?.map((name, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={name}
                                      onChange={(e) => {
                                        const newColumns = [...formData.ocbpUtilityColumn];
                                        newColumns[index] = e.target.value;
                                        setFormData(prev => ({
                                          ...prev,
                                          ocbpUtilityColumn: newColumns
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
                                      value={formData.ocbpUtilityValue[index] || 0}
                                      onChange={(e) => handleUtilityChange(index, e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm"
                                      placeholder="0"
                                      onWheel={(e) => e.currentTarget.blur()}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newColumns = formData.ocbpUtilityColumn.filter((_, i) => i !== index);
                                      const newValues = formData.ocbpUtilityValue.filter((_, i) => i !== index);
                                      setFormData(prev => ({
                                        ...prev,
                                        ocbpUtilityColumn: newColumns,
                                        ocbpUtilityValue: newValues
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
                                <span className="text-white font-medium text-sm">Total Utilities</span>
                                <span className="text-white font-bold">{formatCurrency(formData.ocbpUtilityValueTotal)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Kalkulasi HPP & Profit */}
                        <div className="bg-teal-700 rounded-xl p-4 mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-semibold text-white">Kalkulasi HPP & Profit</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm flex-1">Price Off</span>
                                <div className="w-24">
                                  <input
                                    type="number"
                                    step="1"
                                    value={formData.ocbpPriceOff}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ocbpPriceOff: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm text-black"
                                    placeholder="0"
                                    onWheel={(e) => e.currentTarget.blur()}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm flex-1">COGS (HPP)</span>
                                <div className="w-24">
                                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                                    {formatCurrency(formData.ocbpCogs)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm flex-1">Margin (%)</span>
                                <div className="w-24">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={formData.ocbpSettingMarginPercentage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ocbpSettingMarginPercentage: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-right text-sm text-black"
                                    placeholder="0"
                                    onWheel={(e) => e.currentTarget.blur()}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm flex-1">Nominal Margin</span>
                                <div className="w-24">
                                  <div className="w-full px-2 py-1 text-right text-sm text-white font-medium">
                                    {formatCurrency(formData.ocbpMarginNominal)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-gray-300 pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium text-sm">Harga Final</span>
                                <span className="text-white font-bold">{formatCurrency(formData.ocbpTotalOff)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? 'Menyimpan...' : 'Simpan RAB'}
                          </button>
                        </div>
                      </form>
                    </div>

                  );
                })}
              </div>
            </div>
          )}


        </div>
      </div>
      {showPercentageModal && <PercentageModal isUpdatingPercentage={isUpdatingPercentage} handleCancel={handleCancel} percentageForm={percentageForm} handleUpdatePercentage={handleUpdatePercentage} setPercentageForm={setPercentageForm} />}
    </div>
  );
};

export default EditRabOrder;