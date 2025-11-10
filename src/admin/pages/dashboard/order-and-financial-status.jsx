import { LucidePackage, ShoppingCart, Wallet } from "lucide-react";
import React from "react";
import {
  getCatalogueCategoryResume,
  getDashboardDataAuto,
} from "../../../api/dasboard";
import { formatCurrency } from "../../../utils";
import { CategoryRecapCard } from "./category-recap-card";
import SummaryCard from "./summary-card";

const getOrderDetails = (data) => {
  return [
    { label: "Menunggu Konfirmasi", value: data?.orderPendingTotal || 0 },
    { label: "Dibuat", value: data?.orderProgressTotal || 0 },
    { label: "Ditolak", value: (data?.orderTotal || 0) - (data?.orderPendingTotal || 0) - (data?.orderProgressTotal || 0) },
    { label: "Belum Lunas", value: data?.orderNotFullyPaidTotal || 0 },
    { label: "Lunas", value: data?.orderFullyPaidTotal || 0 },
  ];
};

const getRevenueDetails = (data) => {
  return [
    { label: "Total Sudah Dibayar", value: data?.orderPaidTotal || 0 },
    { label: "Total HPP (COGS)", value: data?.orderCogsTotal || 0 },
    { label: "Total Margin", value: data?.orderMarginTotal || 0 },
    { label: "Total Sisa Untung", value: data?.orderProfitRemainingTotalDonePayment || 0 },
    { label: "Total Piutang", value: data?.orderReceivablesTotal || 0 },
    { label: "Total DP", value: data?.orderDownPaymentTotal || 0 },
  ];
};

const getProfitDetails = (data) => {
  return [
    { label: "Maintenance - Develop", value: data?.orderMainDevelopTotal || 0 },
    { label: "Bonus Insentif", value: data?.orderIncentiveTotal || 0 },
    { label: "Pendapatan Marketing", value: data?.orderMarketingTotal || 0 },
    { label: "Sisa Untung Bersih", value: data?.orderProfitNetTotal || 0 },
  ];
};

export function OrderAndFinancialStatus({ filterDateStart, filterDateEnd, onDataLoaded, onCategoryDataLoaded }) {
  const [dashboardAutoData, setDashboardAutoData] = React.useState(null);
  const [catalogueCategoryResume, setCatalogueCategoryResume] =
    React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchData = async ({ filterDateStart, filterDateEnd }) => {
    try {
      setIsLoading(true);
      setError(null);

      const [dashboardResponse, catalogueCategoryResume] = await Promise.all([
        getDashboardDataAuto({
          filterDateStart,
          filterDateEnd,
        }),
        getCatalogueCategoryResume({
          filterDateStart,
          filterDateEnd,
        }),
      ]);

      console.debug("Dashboard Auto Data:", dashboardResponse.data.data);

      console.debug("Rekap Kategori Data:", catalogueCategoryResume.data.data);

      setDashboardAutoData(dashboardResponse.data.data);
      setCatalogueCategoryResume(catalogueCategoryResume.data.data);
      
      if (onDataLoaded) onDataLoaded(dashboardResponse.data.data);
      if (onCategoryDataLoaded) onCategoryDataLoaded(catalogueCategoryResume.data.data);
    } catch (error) {
      setError("Gagal memuat data dashboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData({
      filterDateStart,
      filterDateEnd,
    });
  }, [filterDateStart, filterDateEnd]);

  if (isLoading) {
    return <div>Memuat data...</div>;
  }

  if (error) {
    return <div>Gagal memuat data</div>;
  }

  if (!dashboardAutoData || !catalogueCategoryResume) {
    return <div>Tidak ada data tersedia</div>;
  }

  const rekapKategoriDetails = catalogueCategoryResume?.map((category) => ({
    categoryTitle: category.ccName,
    stats: [
      { label: "Jumlah", value: category.amount },
      { label: "Pendapatan", value: category.totalOff },
      { label: "HPP", value: category.cogs },
    ],
  }));

  return (
    <div className="bg-gray-100 rounded-xl shadow p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 grid items-start">
      <SummaryCard
        title="Total Pesanan"
        value={dashboardAutoData?.orderTotal || 0}
        icon={LucidePackage}
        details={getOrderDetails(dashboardAutoData)}
        color="deep-purple"
      />

      <SummaryCard
        title="Total Pemasukan"
        value={formatCurrency(dashboardAutoData?.orderPriceTotal || 0)}
        icon={Wallet}
        details={getRevenueDetails(dashboardAutoData)}
        color="amber"
        isCurrency
      />

      <SummaryCard
        title="Total Sisa Untung"
        value={formatCurrency(
          dashboardAutoData?.orderProfitRemainingTotalDoneProgress || 0,
        )}
        icon={ShoppingCart}
        details={getProfitDetails(dashboardAutoData)}
        color="teal"
        isCurrency
      />

      <CategoryRecapCard
        title="Rekap Kategori"
        details={rekapKategoriDetails}
        color="orange"
        icon={LucidePackage}
        value={`${rekapKategoriDetails?.length || 0} Kategori`}
      />
    </div>
  );
}
