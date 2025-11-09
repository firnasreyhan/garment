export const handleFormChange = (setter) => (e) => {
  const { name, value } = e.target;
  setter((prev) => ({
    ...prev,
    [name]: value,
  }));
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "-";
  amount = amount === 0 ? 0 : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const checkImageValidity = (file) => {
  const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
    file.type,
  );
  const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
  return isValidType && isValidSize;
};

export const checkDuplicatedItems = (items, key) => {
  const ids = items.map((item) => item[key]);
  return new Set(ids).size !== ids.length;
};

export const calculateRABItemValues = (item) => {
  const materialNeed = item.ocbpMaterialNeed || 0;
  const materialPrice = item.ocbpMaterialPrice || 0;
  const amount = item.ocbpAmount || 0;
  const marginPct = item.ocbpSettingMarginPercentage || 0;
  const priceOff = item.ocbpPriceOff || 0;

  const totalHargaBahan = materialPrice * materialNeed;

  const jasaOperasional =
    item.ocbpOperationalServiceValue?.reduce(
      (sum, val) => sum + parseFloat(val || 0),
      0,
    ) || 0;

  const totalJasaOperasional = jasaOperasional * amount;

  const utilitiesDanBekakas =
    item.ocbpUtilityValue?.reduce(
      (sum, val) => sum + parseFloat(val || 0),
      0,
    ) || 0;

  const totalUtilitiesDanBekakas = utilitiesDanBekakas * amount;

  const totalOff = priceOff * amount;

  const hpp = totalHargaBahan + jasaOperasional + utilitiesDanBekakas;

  const margin = hpp + (hpp * marginPct) / 100;
  const nominalMargin = margin - hpp;
  const sisaUntung = priceOff - margin;

  const percent = hpp > 0 ? ((priceOff - hpp) / hpp) * 100 : 0;

  const totalMargin = nominalMargin * amount;

  const totalSisaUntung = sisaUntung * amount;

  return {
    amount,
    totalHargaBahan,
    grandTotalHargaBahan: totalHargaBahan * amount,
    jasaOperasional,
    totalJasaOperasional,
    utilitiesDanBekakas,
    totalUtilitiesDanBekakas,
    totalOff,
    hpp,
    margin,
    totalMargin,
    nominalMargin,
    sisaUntung,
    totalSisaUntung,
    percent,
  };
};
