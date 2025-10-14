import React from "react";
import { FaAward, FaTrophy } from "react-icons/fa";
import { GiMedal } from "react-icons/gi";
import { getDashboardRankUserOrderData } from "../../../api/dasboard";

export function TopMostOrderedClients({ filterDateStart, filterDateEnd }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);

  const fetchData = async ({ filterDateStart, filterDateEnd }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getDashboardRankUserOrderData({
          filterDateStart,
          filterDateEnd,
        });
      console.debug("Dashboard Data:", response.data.data);

      setData(response.data.data);
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

  if (!data || data.length === 0) {
    return <div>Tidak ada data tersedia</div>;
  }

  const topClientsTable = data
    ?.map((client, index) => ({
      rank: index + 1,
      name: client.uName,
      order: client.totOrder,
    }))
    .slice(3); //

  const top3Clients = data
    .map((client, index) => ({
      rank: index + 1,
      name: client.uName,
      order: client.totOrder,
    }))
    .slice(0, 3); // Get top 3 clients

  return (
    <div className="bg-gray-100 rounded-xl shadow p-6 mb-8 bg">
      <h2 className="text-2xl font-bold text-primaryColor text-center mb-8 tracking-wide font-montserrat">
        TOP KLIEN TERBANYAK ORDER
      </h2>
      <div className="flex flex-col lg:flex-row gap-8 items-end justify-center w-full mb-8">
        {/* 3 Top Clients */}
        <div className="flex flex-1 justify-center gap-4 md:gap-8 lg:w-2/3 items-end">
          {/* Card Kiri */}
          <div className="flex flex-col items-center flex-1 max-w-xs">
            <div className="font-semibold text-xs md:text-base text-center bg-primaryColor text-white rounded-lg px-2 py-1 mb-2 shadow">
              {top3Clients[0].name}
            </div>
            <div
              className="bg-orange-400 rounded-xl shadow flex flex-col items-center justify-center px-8 py-6 md:py-8 min-w-[110px]"
              style={{ height: "150px" }}
            >
              <FaAward className="w-10 h-10 text-white mb-2" />
              <span className="text-3xl font-bold text-white">
                {top3Clients[0].order}
              </span>
              <span className="text-lg font-semibold text-white">Order</span>
            </div>
          </div>
          {/* Card Tengah (Juara 1) */}
          <div className="flex flex-col items-center flex-1 max-w-xs z-10">
            <div className="font-semibold text-xs md:text-base text-center bg-primaryColor text-white rounded-lg px-2 py-1 mb-2 shadow">
              {top3Clients[1].name}
            </div>
            <div
              className="bg-yellow-600 rounded-xl shadow flex flex-col items-center justify-center px-10 py-10 md:py-14 min-w-[120px]"
              style={{ height: "220px" }}
            >
              <FaTrophy className="w-10 h-10 text-white mb-2" />
              <span className="text-4xl font-bold text-white">
                {top3Clients[1].order}
              </span>
              <span className="text-xl font-semibold text-white">Order</span>
            </div>
          </div>
          {/* Card Kanan */}
          <div className="flex flex-col items-center flex-1 max-w-xs">
            <div className=" font-semibold text-xs md:text-base text-center bg-primaryColor text-white rounded-lg px-2 py-1 mb-2 shadow">
              {top3Clients[2].name}
            </div>
            <div
              className="bg-gray-300 rounded-xl shadow flex flex-col items-center justify-center px-8 py-6 md:py-8 min-w-[110px]"
              style={{ height: "150px" }}
            >
              <GiMedal className="w-10 h-10 text-white mb-2" />
              <span className="text-3xl font-bold text-white">
                {top3Clients[2].order}
              </span>
              <span className="text-lg font-semibold text-white">Order</span>
            </div>
          </div>
        </div>
        {/* Table 4-10 */}
        <div className="w-full max-w-lg lg:w-1/3">
          <table className="min-w-full text-sm font-poppins">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="py-2 px-4">Rank</th>
                <th className="py-2 px-4">Nama Klien</th>
                <th className="py-2 px-4">Order</th>
              </tr>
            </thead>
            <tbody>
              {topClientsTable.map((row) => (
                <tr key={row.rank} className="border-t">
                  <td className="py-2 px-4 font-semibold text-gray-700">
                    {row.rank}
                  </td>
                  <td className="py-2 px-4 text-gray-700">{row.name}</td>
                  <td className="py-2 px-4 font-bold text-green-700">
                    {row.order}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
