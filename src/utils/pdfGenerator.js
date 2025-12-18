import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from './index';
import { getCurrentUser } from '../api/auth';
import primaryLogo from '../assets/Logo/primary_logo.png';

const COMPANY_INFO = {
  name: 'CV. ZUMAR (Konveksi dan Bordir)',
  address: 'Jl. Zainal Arifin, Gg. Kabupaten 7, Klojen, Kota Malang, Jawa Timur 65119',
  phone: '0341-327613',
  customerCare: '085725964134',
  email: 'zumargarment@gmail.com'
};

const COLORS = {
  primary: '#245156',
  secondary: '#B2DFDB',
  text: '#000000',
  border: '#666666'
};


const CONFIG = {
  IMAGE_TIMEOUT: 8000,
  CANVAS_SIZE: 72,
  MIN_BASE64_LENGTH: 100,
  PDF_PAGE_HEIGHT: 200
};


const setFont = (doc, size, weight = 'normal') => {
  doc.setFontSize(size);
  doc.setFont('helvetica', weight);
};

const _safeValue = (value, fallback = '-') => value || fallback;
const unknownValue = (value, fallback = 'Tidak diketahui') => value || fallback;

// Universal print info section for all reports
const addPrintInfo = (doc, startY) => {
  // Get current user from JWT token
  const currentUser = getCurrentUser();
  const currentUserName = currentUser?.name || 'Admin';
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Dicetak oleh: ${currentUserName}`, 20, startY);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 20, startY + 8);
  
  return startY + 10; // Return next Y position after print info
};

// Universal signature section for all reports (all landscape now)
const addSignatureSection = (doc, startY) => {
  // Calculate total height needed for signature section
  const signatureHeight = 20 + 10 + 35 + 10 + 10 + 35 + 10; // spacing + text + box + spacing + text + box + final spacing = 130
  const pageHeight = doc.internal.pageSize.height; // ~210mm for A4
  const bottomMargin = 20; // Safe margin from bottom
  
  let yPos = startY + 0; // Add some spacing before signature
  
  // Check if signature section will fit on current page
  if (yPos + signatureHeight > pageHeight - bottomMargin) {
    // Not enough space, create new page
    doc.addPage('landscape');
    yPos = 20; // Start from top with some margin
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  // Define uniform box dimensions for landscape
  const boxWidth = 75;
  const boxHeight = 35;
  
  // Landscape positions (all reports are now landscape)
  const leftBoxX = 50;
  const rightBoxX = 180;
  const centerBoxX = 115;
  
  // Top row - Dibuat Oleh and Diketahui Oleh (centered above boxes)
  doc.text('DIBUAT OLEH', leftBoxX + boxWidth/2, yPos, { align: 'center' });
  doc.text('DIKETAHUI OLEH', rightBoxX + boxWidth/2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // Top row rectangles - uniform size
  doc.rect(leftBoxX, yPos, boxWidth, boxHeight);  // Dibuat Oleh
  doc.rect(rightBoxX, yPos, boxWidth, boxHeight); // Diketahui Oleh
  
  yPos += 45;
  
  // Bottom row - Disetujui Oleh (centered above box)
  doc.text('DISETUJUI OLEH', centerBoxX + boxWidth/2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // Bottom row rectangle - same uniform size
  doc.rect(centerBoxX, yPos, boxWidth, boxHeight); // Disetujui Oleh
  
  return yPos + boxHeight + 10; // Return final Y position
};

const getFormattedDate = (() => {
  let cache = {};
  return (dateFormat = 'yyyy-MM-dd_HH-mm') => {
    if (!cache[dateFormat]) {
      cache[dateFormat] = format(new Date(), dateFormat, { locale: id });
    }
    return cache[dateFormat];
  };
})();

// Layout Constants
const LAYOUT = {
  MARGIN_LEFT: 20,
  LOGO_OFFSET: -10,
  LINE_HEIGHT: 6,
  HEADER_LINE_Y: 50,
  LANDSCAPE_WIDTH: 277,
  PORTRAIT_WIDTH: 190,
  FONT_SIZE: {
    LARGE: 18,
    MEDIUM: 14,
    NORMAL: 12,
    SMALL: 10,
    TINY: 9
  },
  IMAGE: {
    INTERMEDIATE_SIZE: 200,
    RENDER_SIZE: 18,
    STANDARD_SIZE: 20
  }
};


const addCompanyHeader = (doc, reportTitle) => {

  const textStartY = 22;
  const textEndY = 40; 
  const textCenterY = (textStartY + textEndY) / 2;
  

  doc.addImage(primaryLogo, 'PNG', LAYOUT.MARGIN_LEFT, textCenterY + LAYOUT.LOGO_OFFSET);
  
  // Company info
  setFont(doc, LAYOUT.FONT_SIZE.NORMAL, 'bold');
  doc.text(COMPANY_INFO.name, 70, textStartY);
  
  setFont(doc, LAYOUT.FONT_SIZE.SMALL);
  doc.text(COMPANY_INFO.address, 70, textStartY + LAYOUT.LINE_HEIGHT);
  doc.text(`Telephone: ${COMPANY_INFO.phone} | Customer Care: ${COMPANY_INFO.customerCare}`, 70, textStartY + LAYOUT.LINE_HEIGHT * 2);
  doc.text(`Mail: ${COMPANY_INFO.email}`, 70, textStartY + LAYOUT.LINE_HEIGHT * 3);
  

  doc.setDrawColor(COLORS.border);
  const isLandscape = doc.internal.pageSize.width > doc.internal.pageSize.height;
  if (isLandscape) {
    doc.line(LAYOUT.MARGIN_LEFT, LAYOUT.HEADER_LINE_Y, LAYOUT.LANDSCAPE_WIDTH, LAYOUT.HEADER_LINE_Y);
  } else {
    doc.line(LAYOUT.MARGIN_LEFT, LAYOUT.HEADER_LINE_Y, LAYOUT.PORTRAIT_WIDTH, LAYOUT.HEADER_LINE_Y);
  }
  
  // Report title
  setFont(doc, LAYOUT.FONT_SIZE.LARGE, 'bold');
  const titleWidth = doc.getTextWidth(reportTitle);
  const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
  doc.text(reportTitle, titleX, 65);
  
  return 75;
};

// Function untuk generate dashboard report
export const generateDashboardReport = (dashboardData, categoryData, dateRange) => {
  const doc = new jsPDF('landscape');
  
  // Add header
  let yPos = addCompanyHeader(doc, 'Laporan Summary Dashboard');
  
  // Add print info
  yPos = addPrintInfo(doc, yPos + 10);
  
  // Add date range
  const dateText = `Periode: ${format(new Date(dateRange.startDate), 'dd MMMM yyyy', { locale: id })} - ${format(new Date(dateRange.endDate), 'dd MMMM yyyy', { locale: id })}`;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(dateText, 20, yPos);
  
  yPos += 25;
  
  // Table 1: Total Pesanan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pesanan: ${dashboardData?.orderTotal || 0}`, 20, yPos);
  yPos += 10;
  
  const orderDetails = [
    ['Menunggu Konfirmasi', dashboardData?.orderPendingTotal || 0],
    ['Dibuat', dashboardData?.orderProgressTotal || 0],
    ['Ditolak', (dashboardData?.orderTotal || 0) - (dashboardData?.orderPendingTotal || 0) - (dashboardData?.orderProgressTotal || 0)],
    ['Belum Lunas', dashboardData?.orderNotFullyPaidTotal || 0],
    ['Lunas', dashboardData?.orderFullyPaidTotal || 0],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Status', 'Jumlah']],
    body: orderDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [36, 81, 86], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219] 
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  // Table 2: Total Pemasukan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pemasukan: ${formatCurrency(dashboardData?.orderPriceTotal || 0)}`, 20, yPos);
  yPos += 10;
  
  const revenueDetails = [
    ['Total Sudah Dibayar', formatCurrency(dashboardData?.orderPaidTotal || 0)],
    ['Total HPP (COGS)', formatCurrency(dashboardData?.orderCogsTotal || 0)],
    ['Total Margin', formatCurrency(dashboardData?.orderMarginTotal || 0)],
    ['Total Sisa Untung', formatCurrency(dashboardData?.orderProfitRemainingTotalDonePayment || 0)],
    ['Total Piutang', formatCurrency(dashboardData?.orderReceivablesTotal || 0)],
    ['Total DP', formatCurrency(dashboardData?.orderDownPaymentTotal || 0)],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Keterangan', 'Nominal']],
    body: revenueDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [36, 81, 86],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  if (yPos > CONFIG.PDF_PAGE_HEIGHT) {
    doc.addPage();
    yPos = 20;
  }
  
  // Table 3: Total Sisa Untung
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Sisa Untung: ${formatCurrency(dashboardData?.orderProfitRemainingTotalDoneProgress || 0)}`, 20, yPos);
  yPos += 10;
  
  const profitDetails = [
    ['Maintenance - Develop', formatCurrency(dashboardData?.orderMainDevelopTotal || 0)],
    ['Bonus Insentif', formatCurrency(dashboardData?.orderIncentiveTotal || 0)],
    ['Pendapatan Marketing', formatCurrency(dashboardData?.orderMarketingTotal || 0)],
    ['Sisa Untung Bersih', formatCurrency(dashboardData?.orderProfitNetTotal || 0)],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Keterangan', 'Nominal']],
    body: profitDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [36, 81, 86],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  // Table 4: Rekap Kategori
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rekap Kategori: ${categoryData?.length || 0} Kategori`, 20, yPos);
  yPos += 10;
  
  const categoryDetails = categoryData?.map(category => [
    category.ccName,
    category.amount,
    formatCurrency(category.totalOff),
    formatCurrency(category.cogs)
  ]) || [];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Jumlah', 'Pendapatan', 'HPP']],
    body: categoryDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [36, 81, 86],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add signature section
  addSignatureSection(doc, doc.lastAutoTable.finalY);
  
  // Save PDF
  const fileName = `Laporan_Dashboard_${getFormattedDate()}.pdf`;
  doc.save(fileName);
};


export const generateInventoryReport = (inventoryData, filterInfo, categories = [], warehouses = []) => {
  const doc = new jsPDF('landscape');
  
  // Add header
  let yPos = addCompanyHeader(doc, 'LAPORAN INVENTORY');
  
  // Add print info
  yPos = addPrintInfo(doc, yPos + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let filterText = '';
  if (filterInfo.selectedCategory) {
    const categoryName = unknownValue(categories.find(cat => cat.icId === filterInfo.selectedCategory)?.icName);
    filterText += `Kategori: ${categoryName}`;
  }
  if (filterInfo.selectedWarehouse) {
    const warehouseName = unknownValue(warehouses.find(wh => wh.iwId === filterInfo.selectedWarehouse)?.iwName);
    filterText += filterText ? ` | Gudang: ${warehouseName}` : `Gudang: ${warehouseName}`;
  }
  if (!filterText) {
    filterText = 'Semua Data';
  }
  
  doc.text(`${filterText}`, 20, yPos + 10);
  
  yPos += 40;
  
  // Summary
  const totalItems = inventoryData.length;
  const uniqueCategories = new Set(inventoryData.map(inv => inv.icId)).size;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Items: ${totalItems} items`, 20, yPos);
  doc.text(`Total Categories: ${uniqueCategories} categories`, 120, yPos);
  
  yPos += 15;
  

  const getCategoryName = (icId) => {
    const category = categories.find(cat => cat.icId === icId);
    return category ? category.icName : '-';
  };
  
  const getWarehouseName = (iwId) => {
    const warehouse = warehouses.find(wh => wh.iwId === iwId);
    return warehouse ? warehouse.iwName : '-';
  };
  
  // Prepare table data
  const tableData = inventoryData.map(inv => [
    getCategoryName(inv.icId),
    inv.iCode || '-',
    inv.iAmount || '0',
    inv.iUnit || '-',
    '', // Aktual Qty - kolom kosong untuk pengecekan fisik
    getWarehouseName(inv.iwId)
  ]);
  
  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Kode', 'Jumlah', 'Satuan', 'Aktual Qty', 'Gudang']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Kategori
      1: { cellWidth: 25 }, // Kode
      2: { cellWidth: 20 }, // Jumlah
      3: { cellWidth: 20 }, // Satuan
      4: { cellWidth: 25 }, // Aktual Qty
      5: { cellWidth: 30 }  // Gudang
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add signature section
  addSignatureSection(doc, doc.lastAutoTable.finalY);
  
  const fileName = `Laporan_Inventory_${getFormattedDate()}.pdf`;
  doc.save(fileName);
};

export const generateInventoryRelocationReport = (relocationData, filterInfo, warehouses = []) => {
  const doc = new jsPDF('landscape');
  
  // Add header
  let yPos = addCompanyHeader(doc, 'LAPORAN TRANSFER INVENTORY');
  
  // Add print info
  yPos = addPrintInfo(doc, yPos + 10);
  
  // Add filter info dan metadata di header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Filter yang dipilih
  const { dateRange, selectedWarehouseFrom, selectedWarehouseTo } = filterInfo;
  let filterText = '';
  
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    filterText += `Periode: ${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}`;
  }
  
  if (selectedWarehouseFrom) {
    const warehouseName = warehouses.find(wh => wh.iwId === selectedWarehouseFrom)?.iwName || 'Tidak diketahui';
    filterText += filterText ? ` | Gudang Asal: ${warehouseName}` : `Gudang Asal: ${warehouseName}`;
  }
  
  if (selectedWarehouseTo) {
    const warehouseName = warehouses.find(wh => wh.iwId === selectedWarehouseTo)?.iwName || 'Tidak diketahui';
    filterText += filterText ? ` | Gudang Tujuan: ${warehouseName}` : `Gudang Tujuan: ${warehouseName}`;
  }
  
  if (!filterText) {
    filterText = 'Semua Data';
  }
  
  doc.text(`${filterText}`, 20, yPos + 10);
  
  yPos += 35;
  
  // Summary
  const totalTransfers = relocationData.length;
  const approvedCount = relocationData.filter(rel => rel.irApprovalStatus === 2).length;
  const rejectedCount = relocationData.filter(rel => rel.irApprovalStatus === 3).length;
  const pendingCount = relocationData.filter(rel => rel.irApprovalStatus === 1).length;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Transfers: ${totalTransfers}`, 20, yPos);
  doc.text(`Approved: ${approvedCount}`, 120, yPos);
  doc.text(`Rejected: ${rejectedCount}`, 180, yPos);
  doc.text(`Pending: ${pendingCount}`, 240, yPos);
  
  yPos += 15;
  

  const getWarehouseName = (iwId) => {
    const warehouse = warehouses.find(wh => wh.iwId === iwId);
    return warehouse ? warehouse.iwName : '-';
  };
  
  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return '-';
    }
  };
  
  // Prepare table data
  const tableData = relocationData.map(rel => [
    rel.irUpdatedAt ? format(new Date(rel.irUpdatedAt), 'dd/MM/yyyy') : '-',
    rel.iCode || '-',
    rel.iwNameFrom || getWarehouseName(rel.iwIdFrom) || '-',
    rel.iwNameTo || getWarehouseName(rel.iwIdTo) || '-',
    rel.irAmount || '0',
    rel.iUnit || '-',
    getStatusText(rel.irApprovalStatus)
  ]);
  
  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [['Tanggal', 'Kode Item', 'Gudang Asal', 'Gudang Tujuan', 'Jumlah', 'Satuan', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Tanggal
      1: { cellWidth: 30 }, // Kode Item
      2: { cellWidth: 40 }, // Gudang Asal
      3: { cellWidth: 40 }, // Gudang Tujuan
      4: { cellWidth: 20 }, // Jumlah
      5: { cellWidth: 20 }, // Satuan
      6: { cellWidth: 25 }  // Status
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add signature section
  addSignatureSection(doc, doc.lastAutoTable.finalY);
  
  const fileName = `Laporan_Transfer_Inventory_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

export const generateOrderReport = (/* _orderData, _dateRange */) => {
  const doc = new jsPDF('landscape');
  let yPos = addCompanyHeader(doc, 'Laporan Pesanan');
  addPrintInfo(doc, yPos + 10);
  doc.save(`Laporan_Pesanan_${getFormattedDate('yyyy-MM-dd_HH-mm-ss')}.pdf`);
};

export const generateCatalogueReport = async (catalogueData, filterInfo, categories = [], subCategories = []) => {
  const doc = new jsPDF('landscape');
  
  // Add header
  let yPos = addCompanyHeader(doc, 'LAPORAN KATALOG');
  
  // Add print info
  yPos = addPrintInfo(doc, yPos + 0);
  
  // Add filter info dan metadata di header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Filter yang dipilih
  let filterText = '';
  if (filterInfo.selectedCategory) {
    const categoryName = categories.find(cat => cat.ccId === filterInfo.selectedCategory)?.ccName || 'Tidak diketahui';
    filterText += `Kategori: ${categoryName}`;
  }
  if (filterInfo.selectedSubCategory) {
    const subCategoryName = subCategories.find(sub => sub.csId === filterInfo.selectedSubCategory)?.csName || 'Tidak diketahui';
    filterText += filterText ? ` | Sub Kategori: ${subCategoryName}` : `Sub Kategori: ${subCategoryName}`;
  }
  if (!filterText) {
    filterText = 'Semua Data';
  }
  
  doc.text(`${filterText}`, 20, yPos + 10);
  
  yPos += 20;
  
  // Summary
  const totalProducts = catalogueData.length;
  const productsWithImages = catalogueData.filter(prod => 
    prod.cpImage && Array.isArray(prod.cpImage) && prod.cpImage.length > 0
  ).length;
  const productsWithoutImages = totalProducts - productsWithImages;
  const uniqueCategories = new Set(catalogueData.map(prod => prod.ccId)).size;
  const uniqueSubCategories = new Set(catalogueData.map(prod => prod.csId)).size;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Produk: ${totalProducts}`, 20, yPos);
  doc.text(`Dengan Gambar: ${productsWithImages}`, 120, yPos);
  
  yPos += 8;
  doc.text(`Total Kategori: ${uniqueCategories}`, 20, yPos);
  doc.text(`Tanpa Gambar: ${productsWithoutImages}`, 120, yPos);
  
  yPos += 8;
  doc.text(`Total Sub Kategori: ${uniqueSubCategories}`, 20, yPos);
  
  yPos += 8;

  // Optimized WeServ proxy for reliable image conversion
  const convertImageToBase64 = async (imageUrl) => {
    try {
      // Strategy 1: High resolution download (72x72) for crisp rendering at 18x18
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&output=png&w=72&h=72&fit=cover&q=100`;
      console.log(`Trying WeServ strategy 1 for image: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
      
      const response = await fetch(proxyUrl, { 
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        const blob = await response.blob();
        console.log(`WeServ strategy 1 success, blob size: ${blob.size} bytes`);
        
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (result && result.length > CONFIG.MIN_BASE64_LENGTH) {
              console.log(`Base64 conversion success, length: ${result.length}`);
              resolve(result);
            } else {
              reject(new Error('Invalid base64 result'));
            }
          };
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(blob);
        });
        
        return base64;
      } else {
        console.log(`WeServ strategy 1 failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log('WeServ strategy 1 error:', error.message);
    }
    
    try {
      // Strategy 2: Medium resolution fallback (54x54) for crisp rendering
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&output=png&w=54&h=54&fit=cover&q=100`;
      console.log(`Trying WeServ strategy 2 for image: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
      
      const response = await fetch(proxyUrl, { 
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        const blob = await response.blob();
        console.log(`WeServ strategy 2 success, blob size: ${blob.size} bytes`);
        
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (result && result.length > CONFIG.MIN_BASE64_LENGTH) {
              console.log(`Base64 conversion success, length: ${result.length}`);
              resolve(result);
            } else {
              reject(new Error('Invalid base64 result'));
            }
          };
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(blob);
        });
        
        return base64;
      } else {
        console.log(`WeServ strategy 2 failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log('WeServ strategy 2 error:', error.message);
    }
    
    try {
      // Strategy 3: Basic resolution fallback (36x36) for crisp rendering
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&output=png&w=36&h=36&fit=cover&q=100`;
      console.log(`Trying WeServ strategy 3 for image: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
      
      const response = await fetch(proxyUrl, { 
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      if (response.ok) {
        const blob = await response.blob();
        console.log(`WeServ strategy 3 success, blob size: ${blob.size} bytes`);
        
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (result && result.length > CONFIG.MIN_BASE64_LENGTH) {
              console.log(`Base64 conversion success, length: ${result.length}`);
              resolve(result);
            } else {
              reject(new Error('Invalid base64 result'));
            }
          };
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(blob);
        });
        
        return base64;
      } else {
        console.log(`WeServ strategy 3 failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log('WeServ strategy 3 error:', error.message);
    }
    
    console.log(`All WeServ strategies failed for image: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
    return null;
  };

  const processImagesSequentially = async (catalogueData) => {
    const imageMap = new Map();
    let _successCount = 0;
    
    for (let i = 0; i < catalogueData.length; i++) {
      const prod = catalogueData[i];
      const imageInfo = getImageInfo(prod);
      
      if (imageInfo.hasImage) {
        const base64Image = await convertImageToBase64(imageInfo.url);
        if (base64Image) {
          imageMap.set(i, base64Image);
          _successCount++;
        }
      }
    }
    
    return { imageMap };
  };

  const getImageInfo = (prod) => {
    if (prod.cpImage && Array.isArray(prod.cpImage) && prod.cpImage.length > 0) {
      return {
        hasImage: true,
        url: prod.cpImage[0],
        shortUrl: prod.cpImage[0].substring(prod.cpImage[0].lastIndexOf('/') + 1)
      };
    }
    return { hasImage: false, url: '', shortUrl: 'Tidak Ada' };
  };
  
  const getCategoryName = (ccId) => {
    const category = categories.find(cat => cat.ccId === ccId);
    return category ? category.ccName : '-';
  };
  
  const getSubCategoryName = (csId) => {
    const subCategory = subCategories.find(sub => sub.csId === csId);
    return subCategory ? subCategory.csName : '-';
  };
  
  const stripHtml = (htmlString) => {
    if (!htmlString) return "";
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };
  
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    const cleanText = stripHtml(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };
  
  const { imageMap } = await processImagesSequentially(catalogueData);
  
  
  // Prepare table data
  const tableData = catalogueData.map((prod) => {
    const _imageInfo = getImageInfo(prod);
    return [
      getCategoryName(prod.ccId),
      getSubCategoryName(prod.csId),
      prod.cpName || '-',
      truncateText(prod.cpDescription, 40),
      ''
    ];
  });
  
  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Sub Kategori', 'Nama Produk', 'Deskripsi', 'Image']],
    body: tableData,
    theme: 'grid',
    showHead: 'everyPage',
    tableLineColor: [128, 128, 128],
    tableLineWidth: 0.1,
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      minCellHeight: 15
    },
    bodyStyles: {
      fontSize: 9,
      minCellHeight: 25
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    columnStyles: {
      0: { cellWidth: 45 }, // Kategori
      1: { cellWidth: 45 }, // Sub Kategori
      2: { cellWidth: 50 }, // Nama Produk
      3: { cellWidth: 85 }, // Deskripsi
      4: { cellWidth: 32, halign: 'center', valign: 'middle' }  // Image column
    },
    margin: { left: 20, right: 20 },
    showFoot: 'never',
    tableWidth: 'auto',
    didDrawCell: function(data) {
      // Add images to the image column
      if (data.column.index === 4 && data.section === 'body') {
        const rowIndex = data.row.index;
        const base64Image = imageMap.get(rowIndex);
        
        if (base64Image) {
          try {
            const renderSize = 18; 
            const cellX = data.cell.x;
            const cellY = data.cell.y;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            
            const imageX = cellX + (cellWidth - renderSize) / 2;
            const imageY = cellY + (cellHeight - renderSize) / 2;
            
            doc.addImage(base64Image, 'PNG', imageX, imageY, renderSize, renderSize, undefined, 'NONE');
            
            
          } catch {
            // Silently skip image error
          }
        }
      }
    }
  });

  // Add signature section
  addSignatureSection(doc, doc.lastAutoTable.finalY);
  
  const fileName = `Laporan_Katalog_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};


export const generateOrderRecapReport = async (orderData, filterInfo) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Use standard company header for consistency
  let yPos = addCompanyHeader(doc, 'LAPORAN REKAP ORDER');
  
  // Add print info
  yPos = addPrintInfo(doc, yPos + 10);
  
  // Filter info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let filterText = '';
  if (filterInfo.dateRange.startDate && filterInfo.dateRange.endDate) {
    filterText = `Periode: ${format(new Date(filterInfo.dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(filterInfo.dateRange.endDate), 'dd/MM/yyyy')}`;
  }
  
  if (filterInfo.selectedApproval && filterInfo.selectedApproval !== '') {
    const approvalText = filterInfo.selectedApproval === '1' ? 'Menunggu Konfirmasi' :
                        filterInfo.selectedApproval === '2' ? 'Order Dibuat' :
                        filterInfo.selectedApproval === '3' ? 'Order Selesai' :
                        filterInfo.selectedApproval === '4' ? 'Order Ditolak' : '';
    filterText += filterText ? ` | Approval: ${approvalText}` : `Approval: ${approvalText}`;
  }
  
  if (filterInfo.selectedPayment && filterInfo.selectedPayment !== '') {
    const paymentText = filterInfo.selectedPayment === '1' ? 'Belum Dibayar' :
                       filterInfo.selectedPayment === '2' ? 'Bayar DP' :
                       filterInfo.selectedPayment === '3' ? 'Dibayar Lunas' : '';
    filterText += filterText ? ` | Payment: ${paymentText}` : `Payment: ${paymentText}`;
  }
  
  if (!filterText) {
    filterText = 'Semua Data';
  }
  
  doc.text(`${filterText}`, 20, yPos + 10);
  
  yPos += 40;
  
  // Summary calculations
  const totalOrders = orderData.length;
  const approvalCounts = {
    waiting: orderData.filter(order => order.oApprovalStatus === '1').length,
    created: orderData.filter(order => order.oApprovalStatus === '2').length,
    completed: orderData.filter(order => order.oApprovalStatus === '3').length,
    rejected: orderData.filter(order => order.oApprovalStatus === '4').length
  };
  
  const paymentCounts = {
    unpaid: orderData.filter(order => (order.oStatusPayment || order.oPaymentStatus) === '1').length,
    downPayment: orderData.filter(order => (order.oStatusPayment || order.oPaymentStatus) === '2').length,
    fullPaid: orderData.filter(order => (order.oStatusPayment || order.oPaymentStatus) === '3').length
  };
  
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = orderData.reduce((sum, order) => {
    const price = order.ocbpsItem?.ocbpsTotalOff ?? order.oPrice ?? 0;
    return sum + (parseFloat(price) || 0);
  }, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Orders: ${totalOrders}`, 20, yPos);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 120, yPos);
  
  yPos += 8;
  doc.text(`Completed: ${approvalCounts.completed}`, 20, yPos);
  doc.text(`Average Order: ${formatCurrency(averageOrderValue)}`, 120, yPos);
  
  yPos += 8;
  doc.text(`Pending: ${approvalCounts.waiting}`, 20, yPos);
  doc.text(`Rejected: ${approvalCounts.rejected}`, 120, yPos);
  
  yPos += 8;
  doc.text(`Paid: ${paymentCounts.fullPaid}`, 20, yPos);
  doc.text(`Down Payment: ${paymentCounts.downPayment}`, 120, yPos);
  
  yPos += 20;
  
  // Helper functions
  const getApprovalStatusText = (status) => {
    switch (String(status)) {
      case '1': return 'Menunggu Konfirmasi';
      case '2': return 'Order Dibuat';
      case '3': return 'Order Selesai';
      case '4': return 'Order Ditolak';
      default: return '-';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (String(status)) {
      case '1': return 'Belum Dibayar';
      case '2': return 'Bayar DP';
      case '3': return 'Dibayar Lunas';
      default: return '-';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };
  
  const tableData = orderData.map((order) => [
    order.oPoNumber || order.oPo || '-',
    order.oNumber || order.oCode || '-',
    order.oName || order.oCustomerName || '-',
    formatCurrency(order.ocbpsItem?.ocbpsTotalOff ?? order.oPrice ?? 0),
    formatDate(order.oDeadlineAt || order.oDeadline),
    getApprovalStatusText(order.oApprovalStatus),
    getPaymentStatusText(order.oStatusPayment || order.oPaymentStatus),
    order.oPhone || '-',
    order.oAddress ? (order.oAddress.length > 25 ? order.oAddress.substring(0, 25) + '...' : order.oAddress) : '-'
  ]);
  
  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [['No. PO', 'No. Order', 'Nama Pemesan', 'Nilai PO', 'Deadline', 'Status Approval', 'Status Pembayaran', 'Telepon', 'Alamat']],
    body: tableData,
    theme: 'grid',
    showHead: 'everyPage',
    tableLineColor: [128, 128, 128],
    tableLineWidth: 0.1,
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      minCellHeight: 12
    },
    bodyStyles: {
      fontSize: 8,
      minCellHeight: 10
    },
    alternateRowStyles: {
      fillColor: [178, 223, 219]
    },
    columnStyles: {
      0: { cellWidth: 22 }, // No. PO
      1: { cellWidth: 25 }, // No. Order
      2: { cellWidth: 35 }, // Nama Pemesan
      3: { cellWidth: 28 }, // Harga
      4: { cellWidth: 25 }, // Deadline
      5: { cellWidth: 32 }, // Status Approval
      6: { cellWidth: 35 }, // Status Pembayaran
      7: { cellWidth: 25 }, // Telepon
      8: { cellWidth: 30 }  // Alamat
    },
    didParseCell: function(data) {
      if (data.column.index === 5 && data.section === 'body') {
        const status = orderData[data.row.index]?.oApprovalStatus;
        switch (parseInt(status)) {
          case 1:
            data.cell.styles.fillColor = [254, 240, 138];
            data.cell.styles.textColor = [180, 83, 9];
            break;
          case 2:
            data.cell.styles.fillColor = [219, 234, 254];
            data.cell.styles.textColor = [28, 100, 242];
            break;
          case 3:
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 163, 74];
            break;
          case 4:
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [220, 38, 38];
            break;
        }
      }
      
      // Status Pembayaran
      if (data.column.index === 6 && data.section === 'body') {
        const status = orderData[data.row.index]?.oStatusPayment || orderData[data.row.index]?.oPaymentStatus;
        switch (parseInt(status)) {
          case 1: 
            data.cell.styles.fillColor = [254, 226, 226]; 
            data.cell.styles.textColor = [220, 38, 38];   
            break;
          case 2:
            data.cell.styles.fillColor = [255, 237, 213]; 
            data.cell.styles.textColor = [234, 88, 12];   
            break;
          case 3:
            data.cell.styles.fillColor = [220, 252, 231]; 
            data.cell.styles.textColor = [22, 163, 74];   
            break;
        }
      }
    },
    margin: { left: 20, right: 20 },
    pageBreak: 'avoid',
    showFoot: 'never',
    tableWidth: 'auto'
  });

  // Add signature section
  addSignatureSection(doc, doc.lastAutoTable.finalY);

  // Save PDF
  const fileName = `Laporan_Rekap_Order_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

// Function untuk generate disposisi report
export const generateDisposisiReport = (disposisiData) => {
  const { orderData, progressMain, progressItems, stageName, users } = disposisiData;
  
  const doc = new jsPDF('landscape');
  
  let yPos = addCompanyHeader(doc, `DOKUMEN SPK - ${stageName}`);
  
  // Add print info and order info in the same row to save space
  const currentUser = getCurrentUser();
  const currentUserName = currentUser?.name || 'Admin';
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Left side - Print info
  doc.text(`Dicetak oleh: ${currentUserName}`, 20, yPos + 10);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 20, yPos + 18);
  
  // Right side - Order info
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pesanan:', 200, yPos + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Order: ${orderData?.oNumber || orderData?.oCode || '-'}`, 200, yPos + 18);
  if (orderData?.oPoNumber) {
    doc.text(`No. PO: ${orderData.oPoNumber}`, 200, yPos + 26);
    doc.text(`Nama Pemesan: ${orderData?.oName || '-'}`, 200, yPos + 34);
    doc.text(`Deadline: ${orderData?.oDeadlineAt ? format(new Date(orderData.oDeadlineAt), 'dd/MM/yyyy', { locale: id }) : '-'}`, 200, yPos + 42);
    yPos += 50;
  } else {
    doc.text(`Nama Pemesan: ${orderData?.oName || '-'}`, 200, yPos + 26);
    doc.text(`Deadline: ${orderData?.oDeadlineAt ? format(new Date(orderData.oDeadlineAt), 'dd/MM/yyyy', { locale: id }) : '-'}`, 200, yPos + 34);
    yPos += 42;
  }
  
  // Add stage info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Produksi: ${stageName}`, 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Target Total: ${progressMain?.opmAmountTotal || 0} pcs`, 20, yPos + 10);
  doc.text(`Progress ID: ${progressMain?.opmId || '-'}`, 20, yPos + 18);
  
  yPos += 35;
  
  // Helper function untuk get user name
  const getUserName = (uId) => {
    const user = users.find(u => u.uId === uId);
    return user ? user.uName : `User ID: ${uId}`;
  };
  
  if (progressItems && progressItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Assignment Pekerja:', 20, yPos);
    
    yPos += 15;
    
    // Prepare assignment data
    const assignmentData = progressItems.map((progress, index) => [
      `${index + 1}`,
      progress.cpName || '-',
      progress.sName || '-',
      getUserName(progress.uId),
      `${progress.opAmount || 0}`,
      formatCurrency(progress.opFee || 0),
      progress.opDeadlineAt ? format(new Date(progress.opDeadlineAt), 'dd/MM/yyyy') : '-'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Produk', 'Size', 'Pekerja', 'Target', 'Fee/pcs', 'Deadline']],
      body: assignmentData,
      theme: 'grid',
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [178, 223, 219]
      },
      columnStyles: {
        0: { cellWidth: 12 }, // No
        1: { cellWidth: 30 }, // Produk
        2: { cellWidth: 20 }, // Size
        3: { cellWidth: 35 }, // Pekerja
        4: { cellWidth: 20 }, // Target
        5: { cellWidth: 25 }, // Fee
        6: { cellWidth: 25 }  // Deadline
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Belum ada assignment pekerja untuk proses ini', 20, yPos);
    yPos += 25;
  }
  
  // Add single finished items table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Progress Selesai:', 20, yPos);
  
  yPos += 15;
  
  // Single table for finished items tracking
  const emptyRows = [];
  for (let i = 0; i < 8; i++) {
    emptyRows.push([`${i + 1}`, '', '', '', '']);
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [['No', 'Tanggal Selesai', 'Pekerja', 'Jumlah Selesai', 'Keterangan']],
    body: emptyRows,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      minCellHeight: 15
    },
    columnStyles: {
      0: { cellWidth: 15 }, // No
      1: { cellWidth: 30 }, // Tanggal
      2: { cellWidth: 35 }, // Pekerja
      3: { cellWidth: 25 }, // Jumlah
      4: { cellWidth: 80 }  // Keterangan
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add footer info
  yPos = doc.lastAutoTable.finalY + 20;
  
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add signature section
  addSignatureSection(doc, yPos + 20);
  
  const orderNumber = orderData?.oNumber || orderData?.oCode || 'Unknown';
  const fileName = `Laporan_SPK_${stageName}_${orderNumber}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

// Function untuk generate progress lengkap report
export const generateProgressLengkapReport = (progressLengkapData) => {
  const { orderData, orderProgressMain, orderProgressDetails, users, progressMainNames } = progressLengkapData;
  
  const doc = new jsPDF('landscape');
  
  // Add header
  let yPos = addCompanyHeader(doc, `LAPORAN PROGRESS`);
  
  // Add print info using universal function
  yPos = addPrintInfo(doc, yPos + 5);
  
  // Add order info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pesanan:', 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Order: ${orderData?.oNumber || orderData?.oCode || '-'}`, 20, yPos + 10);
  let nextYPos = yPos + 18;
  if (orderData?.oPoNumber) {
    doc.text(`No. PO: ${orderData.oPoNumber}`, 20, nextYPos);
    nextYPos += 8;
  }
  doc.text(`Nama Pemesan: ${orderData?.oName || '-'}`, 20, nextYPos);
  doc.text(`Deadline Order: ${orderData?.oDeadlineAt ? format(new Date(orderData.oDeadlineAt), 'dd MMMM yyyy', { locale: id }) : '-'}`, 20, nextYPos + 8);
  doc.text(`Progress Overall: ${(orderData?.oProgress || 0).toFixed(1)} %`, 200, yPos + 10);
  doc.text(`Total Proses: ${orderProgressMain?.length || 0}`, 200, yPos + 18);
  
  yPos += 40;
  
  // Helper function untuk get user name
  const getUserName = (uId) => {
    const user = users.find(u => u.uId === uId);
    return user ? user.uName : `User ID: ${uId}`;
  };
  
  // Helper function untuk calculate stage progress
  const calculateStageProgress = (progressMain) => {
    const progressItems = orderProgressDetails[progressMain.opmId] || [];
    if (!progressMain.opmAmountTotal || progressMain.opmAmountTotal === 0) return 0;
    
    const totalFinished = progressItems.reduce((total, item) => {
      const details = orderProgressDetails[item.opId] || [];
      const itemFinished = details.reduce((sum, detail) => sum + (detail.opdAmount || 0), 0);
      return total + itemFinished;
    }, 0);
    
    return Math.min(Math.round((totalFinished / progressMain.opmAmountTotal) * 100), 100);
  };
  
  orderProgressMain.forEach((progressMain, index) => {
    const stageName = progressMain.opmName || progressMainNames[index] || `Proses ${index + 1}`;
    const progressItems = orderProgressDetails[progressMain.opmId] || [];
    const stageProgress = calculateStageProgress(progressMain);
    
    if (yPos > 180) {
      doc.addPage('landscape');
      yPos = 20;
    }
    
    // Stage header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${stageName}`, 20, yPos);
    doc.text(`Progress: ${stageProgress} %`, 200, yPos);
    doc.text(`Target: ${progressMain.opmAmountTotal || 0} pcs`, 250, yPos);
    
    yPos += 5;
    
    if (progressItems.length > 0) {
      const stageTableData = [];
      
      progressItems.forEach((progress, pIndex) => {
        const details = orderProgressDetails[progress.opId] || [];
        
        if (details.length > 0) {
          // For each finished item, create one row with all data
          details.forEach((detail, dIndex) => {
            const target = progress.opAmount || 0;
            const qtySelesai = detail.opdAmount || 0;
            const status = qtySelesai === target ? 'FINISHED' : 'NOT FINISHED';
            
            stageTableData.push([
              `Assignment ${pIndex + 1}`,
              progress.cpName || '-',
              progress.sName || '-',
              getUserName(progress.uId),
              `${target}`,
              formatCurrency(progress.opFee || 0),
              progress.opDeadlineAt ? format(new Date(progress.opDeadlineAt), 'dd/MM/yyyy') : '-',
              detail.opdFinishedAt ? format(new Date(detail.opdFinishedAt), 'dd/MM/yyyy') : '-',
              `${qtySelesai}`,
              status
            ]);
          });
        } else {
          // No finished items - show assignment with empty finished data
          stageTableData.push([
            `Assignment ${pIndex + 1}`,
            progress.cpName || '-',
            progress.sName || '-',
            getUserName(progress.uId),
            `${progress.opAmount || 0}`,
            formatCurrency(progress.opFee || 0),
            progress.opDeadlineAt ? format(new Date(progress.opDeadlineAt), 'dd/MM/yyyy') : '-',
            '-',
            '0',
            'NOT FINISHED'
          ]);
        }
      });
      
      // Generate table untuk stage ini
      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Produk', 'Size', 'Pekerja', 'Target', 'Fee/pcs', 'Deadline', 'Tgl Selesai', 'Qty Selesai', 'Type']],
        body: stageTableData,
        theme: 'grid',
        showHead: 'firstPage',
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 35 }, // Item column wider
          1: { cellWidth: 25 },
          2: { cellWidth: 15 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 30, halign: 'center' }, // Tanggal Selesai - center aligned
          8: { cellWidth: 20, halign: 'center' }, // Qty Selesai - center aligned
          9: { cellWidth: 'auto', minCellWidth: 20 }
        },
        alternateRowStyles: {
          fillColor: [178, 223, 219]
        },
        didParseCell: function(data) {
          if (data.section === 'body') {
            const rowData = stageTableData[data.row.index];
            const type = rowData[9];
            
            if (type === 'ASSIGNMENT') {
              data.cell.styles.fillColor = [220, 252, 231];
              data.cell.styles.fontStyle = 'bold';
            } else if (type === 'FINISHED') {
              data.cell.styles.fillColor = [254, 249, 195];
            } else if (type === 'NO_FINISHED') {
              data.cell.styles.fillColor = [254, 226, 226];
              data.cell.styles.fontStyle = 'italic';
            }
          }
        },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Belum ada assignment untuk proses ini', 25, yPos);
      yPos += 20;
    }
  });
  
  // Add footer
  if (yPos > 180) {
    doc.addPage('landscape');
    yPos = 20;
  }
  
  // Add signature section
  addSignatureSection(doc, yPos);
  
  // Save PDF
  const orderNumber = orderData?.oNumber || orderData?.oCode || 'Unknown';
  const fileName = `Laporan_Progress_${orderNumber}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

// Helper function to generate Acuan Order table only
const generateAcuanOrderTable = (doc, chunk, startY) => {
  const acuanOrderHeaders = [
    'KALKULASI',
    ...chunk.map(item => item.productName || 'ITEM'),
    'TOTAL'
  ];

  const sizeRow = [
    'SIZE',
    ...chunk.map(item => item.sizeGroup || '-'),
    ''
  ];

  const qtyRow = [
    'QTY', 
    ...chunk.map(item => item.quantity || 0),
    chunk.reduce((sum, item) => sum + (item.quantity || 0), 0)
  ];

  const acuanOrderData = [sizeRow, qtyRow];

  autoTable(doc, {
    startY: startY,
    head: [acuanOrderHeaders],
    body: acuanOrderData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [20, 184, 166], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      ...Object.fromEntries(
        chunk.map((_, i) => [i + 1, { 
          cellWidth: (240 - 30 - 25) / chunk.length,
          halign: 'center' 
        }])
      ),
      [chunk.length + 1]: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 }
  });

  return doc.lastAutoTable.finalY + 10;
};

// Helper function untuk generate RABP chunk page
const generateRABPChunkPage = (doc, chunk, pageNumber, orderData, isFirstPage) => {
  let yPos;
  
  if (isFirstPage) {
    yPos = addCompanyHeader(doc, 'RENCANA ANGGARAN BIAYA PRODUKSI (RABP)');
    
    // Add print info
    yPos = addPrintInfo(doc, yPos + 10);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA ORDER', 20, yPos);
    
    const orderInfoData = [
      [
        orderData.customerName || '-',
        orderData.orderDate || '-', 
        orderData.deadline || '-',
        orderData.orderNumber || '-',
        orderData.poNumber || '-'
      ]
    ];
    
    autoTable(doc, {
      startY: yPos + 15,
      head: [['NAMA CUSTOMER', 'TANGGAL ORDER', 'DEADLINE', 'ORDER NUMBER', 'PO NUMBER']],
      body: orderInfoData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: {
        fillColor: [36, 81, 86],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },   // NAMA CUSTOMER
        1: { cellWidth: 45 },   // TANGGAL ORDER  
        2: { cellWidth: 40 },   // DEADLINE
        3: { cellWidth: 50 },   // ORDER NUMBER
        4: { cellWidth: 45 }    // PO NUMBER
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  } else {
    // For continuation pages, start with minimal spacing
    yPos = 30;
    
    // Add minimal header for continuation
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`RABP - Lanjutan Halaman ${pageNumber}`, 20, 20);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ACUAN ORDER', 20, yPos);
  yPos += 5;

  const acuanOrderHeaders = [
    'KALKULASI',
    ...chunk.map(item => item.productName || 'ITEM'),
    'TOTAL'
  ];

  const sizeRow = [
    'SIZE',
    ...chunk.map(item => item.sizeGroup || '-'),
    ''
  ];

  const qtyRow = [
    'QTY', 
    ...chunk.map(item => item.quantity || 0),
    chunk.reduce((sum, item) => sum + (item.quantity || 0), 0)
  ];

  const acuanOrderData = [sizeRow, qtyRow];

  autoTable(doc, {
    startY: yPos,
    head: [acuanOrderHeaders],
    body: acuanOrderData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [36, 81, 86], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      ...Object.fromEntries(
        chunk.map((_, i) => [i + 1, { 
          cellWidth: (240 - 30 - 25) / chunk.length,
          halign: 'center' 
        }])
      ),
      [chunk.length + 1]: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 }
  });

  yPos = doc.lastAutoTable.finalY + 10;
  return yPos;
};

// Generate Kalkulasi Bahan
const generateKalkulasiBahanSection = (doc, chunkItems, startY) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KALKULASI BAHAN', 20, startY);
  let yPos = startY + 5;

  // Use chunk items (10 items per chunk)
  const displayItems = chunkItems;

  // Header dengan NAMA PRODUK
  const kalkulasiBahanHeaders = [
    'NAMA PRODUK',
    ...displayItems.map(item => item.productName || 'ITEM'),
    'TOTAL'
  ];

  // Data rows untuk kalkulasi bahan
  const namaBahanRow = [
    'NAMA BAHAN', 
    ...displayItems.map(item => item.materialName || '-'),
    ''
  ];

  const kodeWarnaRow = [
    'KODE WARNA BAHAN',
    ...displayItems.map(item => item.materialCode || '-'), 
    ''
  ];

  const kebKainRow = [
    'KEB. KAIN/M',
    ...displayItems.map(item => (item.materialNeed || 0).toFixed(1)),
    ''
  ];

  const totalMRow = [
    'TOTAL/M',
    ...displayItems.map(item => ((item.materialNeed || 0) * (item.quantity || 0)).toFixed(1)),
    chunkItems.reduce((sum, item) => sum + ((item.materialNeed || 0) * (item.quantity || 0)), 0).toFixed(1)
  ];

  const hargaMRow = [
    'HARGA/M',
    ...displayItems.map(item => formatCurrency(item.materialPrice || 0)),
    ''
  ];

  const totalHargaRow = [
    'TOTAL HARGA',
    ...displayItems.map(item => formatCurrency(((item.materialNeed || 0) * (item.quantity || 0)) * (item.materialPrice || 0))),
    ''
  ];

  const grandTotalRow = [
    'GRAND TOTAL HARGA',
    ...displayItems.map(item => formatCurrency(((item.materialNeed || 0) * (item.quantity || 0)) * (item.materialPrice || 0))),
    formatCurrency(chunkItems.reduce((sum, item) => sum + (((item.materialNeed || 0) * (item.quantity || 0)) * (item.materialPrice || 0)), 0))
  ];

  const kalkulasiBahanData = [
    namaBahanRow, 
    kodeWarnaRow,
    kebKainRow,
    totalMRow,
    hargaMRow,
    totalHargaRow,
    grandTotalRow
  ];

  autoTable(doc, {
    startY: yPos,
    head: [kalkulasiBahanHeaders],
    body: kalkulasiBahanData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [36, 81, 86], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      ...Object.fromEntries(
        displayItems.map((_, i) => [i + 1, { 
          cellWidth: (240 - 30 - 25) / displayItems.length,
          halign: 'center' 
        }])
      ),
      [displayItems.length + 1]: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 },
    showHead: 'firstPage'
  });

  return doc.lastAutoTable.finalY + 10;
};

const generateOperationalSection = (doc, chunk, startY) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KALKULASI JASA OPERASIONAL', 20, startY);
  let yPos = startY + 5;

  const operationalHeaders = [
    'NAMA PRODUK',
    ...chunk.map(item => item.productName || 'ITEM'),
    'TOTAL'
  ];

  const allOperationalServices = new Set();
  chunk.forEach(item => {
    const serviceColumns = item.operationalServices?.columns || [];
    serviceColumns.forEach(service => {
      if (service) allOperationalServices.add(service);
    });
  });

  const operationalServicesList = Array.from(allOperationalServices).sort();
  const operationalData = [];

  operationalServicesList.forEach(service => {
    const row = [service];
    let rowTotal = 0;
    
    chunk.forEach(item => {
      const serviceColumns = item.operationalServices?.columns || [];
      const serviceValues = item.operationalServices?.values || [];
      const serviceIndex = serviceColumns.indexOf(service);
      const value = serviceIndex >= 0 ? (serviceValues[serviceIndex] || 0) : 0;
      
      // Jika tidak ada value
      row.push(value === 0 ? 'Rp 0' : formatCurrency(value));
      rowTotal += value;
    });
    
    // Total per row
    row.push(formatCurrency(rowTotal));
    operationalData.push(row);
  });

  autoTable(doc, {
    startY: yPos,
    head: [operationalHeaders],
    body: operationalData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [36, 81, 86], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      ...Object.fromEntries(
        chunk.map((_, i) => [i + 1, { 
          cellWidth: (240 - 30 - 25) / chunk.length,
          halign: 'right' 
        }])
      ),
      [chunk.length + 1]: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 },
    showHead: 'firstPage'
  });

  return doc.lastAutoTable.finalY + 10;
};

// Generate Kalkulasi Bekakas
const generateUtilitiesSection = (doc, chunk, startY) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KALKULASI BEKAKAS', 20, startY);
  let yPos = startY + 5;

  const bekakasHeaders = [
    'NAMA PRODUK',
    ...chunk.map(item => item.productName || 'ITEM'),
    'TOTAL'
  ];

  // Collect semua utilities/bekakas
  const allUtilities = new Set();
  chunk.forEach(item => {
    const utilityColumns = item.utilities?.columns || [];
    utilityColumns.forEach(utility => {
      if (utility) allUtilities.add(utility);
    });
  });

  const utilitiesList = Array.from(allUtilities).sort();
  const bekakasData = [];

  utilitiesList.forEach(utility => {
    const row = [utility];
    let rowTotal = 0;
    
    chunk.forEach(item => {
      const utilityColumns = item.utilities?.columns || [];
      const utilityValues = item.utilities?.values || [];
      const utilityIndex = utilityColumns.indexOf(utility);
      const value = utilityIndex >= 0 ? (utilityValues[utilityIndex] || 0) : 0;
      
      // Jika tidak ada value
      row.push(value === 0 ? 'Rp 0' : formatCurrency(value));
      rowTotal += value;
    });
    
    // Total per row
    row.push(formatCurrency(rowTotal));
    bekakasData.push(row);
  });

  autoTable(doc, {
    startY: yPos,
    head: [bekakasHeaders],
    body: bekakasData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [36, 81, 86], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      ...Object.fromEntries(
        chunk.map((_, i) => [i + 1, { 
          cellWidth: (240 - 30 - 25) / chunk.length,
          halign: 'right' 
        }])
      ),
      [chunk.length + 1]: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 },
    showHead: 'firstPage'
  });

  return doc.lastAutoTable.finalY + 10;
};

// Generate Kalkulasi HPP & Profit
const generateHPPSection = (doc, chunk, startY) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KALKULASI HPP & PROFIT', 20, startY);
  let yPos = startY + 5;

  const hppHeaders = [
    'NAMA PRODUK',
    ...chunk.map(item => item.productName || 'ITEM'),
    'TOTAL'
  ];

  // Calculate helper functions per item
  const calculateMaterialCost = (item) => (item.materialNeed || 0) * (item.quantity || 0) * (item.materialPrice || 0);
  const calculateOpCost = (item) => (item.operationalServices?.values || []).reduce((sum, val) => sum + (val || 0), 0);
  const calculateUtilCost = (item) => (item.utilities?.values || []).reduce((sum, val) => sum + (val || 0), 0);
  const calculateHPP = (item) => calculateMaterialCost(item) + calculateOpCost(item) + calculateUtilCost(item);
  const calculateTotalOff = (item) => (item.priceOff || 0) * (item.quantity || 0);
  const calculateMargin = (item) => calculateTotalOff(item) - calculateHPP(item);

  // HPP & Profit calculation rows
  const hppRows = [
    ['SIZE', ...chunk.map(item => item.sizeGroup || '-'), ''],
    
    ['QTY', ...chunk.map(item => item.quantity || 0), chunk.reduce((sum, item) => sum + (item.quantity || 0), 0)],
    
    ['PRICE OFF', ...chunk.map(item => (item.priceOff || 0) === 0 ? 'Rp 0' : formatCurrency(item.priceOff)), 
     formatCurrency(chunk.reduce((sum, item) => sum + (item.priceOff || 0), 0))],
    
    ['TOTAL OFF', ...chunk.map(item => calculateTotalOff(item) === 0 ? 'Rp 0' : formatCurrency(calculateTotalOff(item))), 
     formatCurrency(chunk.reduce((sum, item) => sum + calculateTotalOff(item), 0))],
    
    ['HPP', ...chunk.map(item => calculateHPP(item) === 0 ? 'Rp 0' : formatCurrency(calculateHPP(item))), 
     formatCurrency(chunk.reduce((sum, item) => sum + calculateHPP(item), 0))],
    
    ['MARGIN', ...chunk.map(item => calculateMargin(item) === 0 ? 'Rp 0' : formatCurrency(calculateMargin(item))), 
     formatCurrency(chunk.reduce((sum, item) => sum + calculateMargin(item), 0))],
    
    // NOMINAL MARGIN
    ['NOMINAL MARGIN', ...chunk.map(item => {
      const margin = calculateMargin(item);
      const qty = item.quantity || 1;
      const nominalMargin = margin / qty;
      return nominalMargin === 0 ? 'Rp 0' : formatCurrency(nominalMargin);
    }), ''],
    
    // TOTAL MARGIN
    ['TOTAL MARGIN', ...chunk.map(item => calculateMargin(item) === 0 ? 'Rp 0' : formatCurrency(calculateMargin(item))), 
     formatCurrency(chunk.reduce((sum, item) => sum + calculateMargin(item), 0))],
    
    // SISA UNTUNG
    ['SISA UNTUNG', ...chunk.map(() => 'Rp 0'), 'Rp 0'],
    
    // TOTAL SISA UNTUNG
    ['TOTAL SISA UNTUNG', ...chunk.map(() => 'Rp 0'), 'Rp 0'],
    
    // PERCENT row
    ['PERCENT', ...chunk.map(item => {
      const totalOff = calculateTotalOff(item);
      const margin = calculateMargin(item);
      return totalOff > 0 ? `${Math.round((margin / totalOff) * 100)}%` : '0%';
    }), '']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [hppHeaders],
    body: hppRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [36, 81, 86], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      ...Object.fromEntries(
        chunk.map((_, i) => [i + 1, { 
          cellWidth: (240 - 30 - 25) / chunk.length,
          halign: 'right' 
        }])
      ),
      [chunk.length + 1]: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 },
    showHead: 'firstPage'
  });

  return doc.lastAutoTable.finalY + 10;
};

// Generate Final Summary Page
const generateFinalSummaryPage = (doc, totals, summary, profitAllocation, nilaiUntung, totalUntung, selisihUntung, percent) => {
  let yPos = 20;
  
  // Title section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAP RABP - SUMMARY LAPORAN', 20, yPos);
  yPos += 15;
  
  // Rekap RABP Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAP RABP', 20, yPos + 10);

  const rekapRABData = [
    ['TOTAL BAHAN', formatCurrency(totals.totalBahan)],
    ['TOTAL OPERASIONAL', formatCurrency(totals.totalJasaOperasional)],
    ['TOTAL UTILITIES & BEKAKAS', formatCurrency(totals.totalUtilitiesDanBekakas)],
    ['TOTAL UNTUNG', formatCurrency(totalUntung)],
    ['PERCENT', `${Number.isFinite(percent) ? percent.toFixed(2) : 0}%`],
    ['TOTAL MARGIN', formatCurrency(totals.totalMargin)],
    ['TOTAL SISA UNTUNG', formatCurrency(totals.totalSisaUntung)],
    ['NILAI PO', formatCurrency(totals.nilaiPO)],
    ['NILAI UNTUNG', formatCurrency(nilaiUntung)],
    ['SELISIH UNTUNG', selisihUntung === 0 ? 'BALANCE' : formatCurrency(selisihUntung)]
  ];

  const leftColumn = rekapRABData.slice(0, 5);
  const rightColumn = rekapRABData.slice(5);

  autoTable(doc, {
    startY: yPos + 15,
    body: leftColumn,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 45, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  autoTable(doc, {
    startY: yPos + 15,
    body: rightColumn,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 45, halign: 'right' }
    },
    margin: { left: 140, right: 20 }
  });

  yPos = yPos + 15 + (Math.max(leftColumn.length, rightColumn.length) * 12) + 20;

  // Rekap Pembagian Sisa Untung
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAP PEMBAGIAN SISA UNTUNG', 20, yPos);

  const pembagianData = [
    ['BIAYA MAIN & DEVELOP', `${summary.ocbpsSettingMainDevelopPercentage || 0}%`, formatCurrency(profitAllocation.biayaMainDanDevelop)],
    ['BIAYA INSENTIF', `${summary.ocbpsSettingIncentivePercentage || 0}%`, formatCurrency(profitAllocation.biayaInsentif)],
    ['BIAYA MARKETING', `${summary.ocbpsSettingMarketingPercentage || 0}%`, formatCurrency(profitAllocation.biayaMarketing)],
    ['SISA UNTUNG BERSIH', '', formatCurrency(profitAllocation.sisaUntungBersih)]
  ];

  autoTable(doc, {
    startY: yPos + 5,
    body: pembagianData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  yPos = doc.lastAutoTable.finalY + 20;

  // Percent Keuntungan Tergerus - calculated like edit-rab-order.jsx
  const percentageEroded = (summary.ocbpsSettingMainDevelopPercentage || 0) + (summary.ocbpsSettingIncentivePercentage || 0) + (summary.ocbpsSettingMarketingPercentage || 0);
  const percentKeuntunganTergerus = ((totals.totalMargin + profitAllocation.sisaUntungBersih) / (totals.totalBahan + totals.totalJasaOperasional + totals.totalUtilitiesDanBekakas)) * 100;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`PERCENT KEUNTUNGAN TERGERUS: ${percentageEroded.toFixed(2)}%`, 20, yPos);
  doc.text(`PERCENT KEUNTUNGAN AKHIR: ${Number.isFinite(percentKeuntunganTergerus) ? percentKeuntunganTergerus.toFixed(2) : 0}%`, 20, yPos + 10);

  // Add signature section
  addSignatureSection(doc, yPos);

  return yPos;
};

// Main RABP Report function
export const generateRABPReport = async (summary, orderId) => {
  try {
    if (!summary || !summary.ocbpItems || summary.ocbpItems.length === 0) {
      throw new Error("Data RABP tidak tersedia untuk generate laporan");
    }

    const { getOrderDetail } = await import('../api/Order/order');
    
    // Fetch order detail untuk mendapatkan customer name dan data lainnya
    let orderDetailData = null;
    try {
      const orderDetailResponse = await getOrderDetail(orderId);
      orderDetailData = orderDetailResponse?.data?.data;
    } catch {
      // Silently handle error - using summary data only
    }

    // Extract size groupings
    const allSizeGroupings = summary.ocbpItems.map(item => ({
      productName: item.cpName || "Unknown Product",
      sizeGroup: item.sGroup || "Unknown Size", 
      quantity: item.ocbpAmount || 0,
      materialName: item.ocbpMaterialName || "AMERICAN DRILL",
      materialCode: item.ocbpMaterialCode || "AM 325",
      materialNeed: item.ocbpMaterialNeed || 0,
      materialPrice: item.ocbpMaterialPrice || 0,
      operationalServices: {
        columns: item.ocbpOperationalServiceColumn || [],
        values: item.ocbpOperationalServiceValue || []
      },
      utilities: {
        columns: item.ocbpUtilityColumn || [],
        values: item.ocbpUtilityValue || []
      },
      priceOff: item.ocbpPriceOff || 0,
      marginPercentage: item.ocbpSettingMarginPercentage || 0
    }));

    // Prepare order data
    const orderData = {
      customerName: orderDetailData?.oName || summary.oName || summary.oCustomerName || '-',
      orderDate: (orderDetailData?.oCreatedAt || summary.oCreatedAt) ? 
        format(new Date(orderDetailData?.oCreatedAt || summary.oCreatedAt), 'dd MMM yyyy') : 
        format(new Date(), 'dd MMM yyyy'),
      deadline: (orderDetailData?.oDeadlineAt || summary.oDeadlineAt) ? 
        format(new Date(orderDetailData?.oDeadlineAt || summary.oDeadlineAt), 'dd MMM yyyy') : '-',
      orderNumber: orderDetailData?.oNumber || orderDetailData?.oCode || summary.oNumber || summary.oCode || orderId || '-',
      poNumber: orderDetailData?.oPoNumber || summary.oPoNumber || '-'
    };

    // Calculate totals using same logic as edit-rab-order.jsx
    const { calculateRABItemValues } = await import('../utils');
    
    const totals = summary.ocbpItems.reduce(
      (acc, item) => {
        const rabItemValues = calculateRABItemValues(item);
        return {
          totalBahan: acc.totalBahan + rabItemValues.grandTotalHargaBahan,
          totalJasaOperasional: acc.totalJasaOperasional + rabItemValues.totalJasaOperasional,
          totalUtilitiesDanBekakas: acc.totalUtilitiesDanBekakas + rabItemValues.totalUtilitiesDanBekakas,
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
      }
    );

    // Calculate additional values using same formula as edit-rab-order.jsx
    const nilaiUntung = totals.nilaiPO - totals.totalBahan - totals.totalJasaOperasional - totals.totalUtilitiesDanBekakas;
    const totalUntung = totals.totalMargin + totals.totalSisaUntung;
    const selisihUntung = nilaiUntung - totalUntung;
    const percent = (totalUntung / (totals.totalBahan + totals.totalJasaOperasional + totals.totalUtilitiesDanBekakas)) * 100;

    // Calculate profit allocation using same formula as edit-rab-order.jsx
    const biayaMainDanDevelop = ((summary.ocbpsSettingMainDevelopPercentage || 0) * totals.totalSisaUntung) / 100;
    const biayaInsentif = ((summary.ocbpsSettingIncentivePercentage || 0) * totals.totalSisaUntung) / 100;
    const biayaMarketing = ((summary.ocbpsSettingMarketingPercentage || 0) * totals.totalSisaUntung) / 100;
    const sisaUntungBersih = totals.totalSisaUntung - (biayaMainDanDevelop + biayaInsentif + biayaMarketing);

    // Profit allocation object
    const profitAllocation = {
      biayaMainDanDevelop,
      biayaInsentif,
      biayaMarketing,
      sisaUntungBersih
    };

    // Generate PDF
    const doc = new jsPDF("landscape", "mm", "a4");
    const chunkSize = 10;
    let pageNumber = 1;

    // Generate chunks with continuous layout for paper efficiency
    let currentYPos = 0;
    
    for (let i = 0; i < allSizeGroupings.length; i += chunkSize) {
      const chunk = allSizeGroupings.slice(i, i + chunkSize);
      let yPos;
      
      if (i === 0) {
        // First chunk - full header
        yPos = generateRABPChunkPage(doc, chunk, pageNumber, orderData, true);
      } else {
        // Subsequent chunks - continue from current position with spacing
        yPos = currentYPos + 20; // Add spacing between chunks
        
        // Add section header for next chunk
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('ACUAN ORDER', 20, yPos);
        yPos += 5;
        
        // Generate acuan order table for this chunk
        yPos = generateAcuanOrderTable(doc, chunk, yPos);
      }
      
      yPos = generateKalkulasiBahanSection(doc, chunk, yPos);
      
      if (chunk.length > 0) {
        yPos = generateOperationalSection(doc, chunk, yPos);
        yPos = generateUtilitiesSection(doc, chunk, yPos);
        yPos = generateHPPSection(doc, chunk, yPos);
      }
      
      currentYPos = yPos;
      
      // Only add page break if we're running out of space AND there are more chunks
      if (i + chunkSize < allSizeGroupings.length && currentYPos > 200) {
        doc.addPage();
        pageNumber++;
        currentYPos = 20; // Reset position for new page
      }
    }

    // Generate final summary page
    doc.addPage();
    generateFinalSummaryPage(doc, totals, summary, profitAllocation, nilaiUntung, totalUntung, selisihUntung, percent);

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const fileName = `Laporan_RABP_${orderId || 'Order'}_${timestamp}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    throw new Error(`Gagal generate RABP report: ${error.message}`);
  }
};

