import React from "react";
import { FaAward, FaTrophy } from "react-icons/fa";
import { GiMedal } from "react-icons/gi";
import { getDashboardRankUserOrderData } from "../../../api/dasboard";
import SilverMedal from "../../../assets/rank-2.png";
import GoldMedal from "../../../assets/rank-1.png";
import BronzeMedal from "../../../assets/rank-3.png";

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
        <div className="flex justify-center items-end gap-3 w-full max-w-4xl mx-auto mt-10">
          {/* 🥈 Juara 2 */}
          <div className="flex flex-col items-center flex-1 max-w-[180px] relative">
            <div
              className="relative rounded-2xl shadow-md flex flex-col items-center justify-center w-full p-5 overflow-hidden"
              style={{
                height: "170px",
                backgroundColor: "#CDCACA",
              }}
            >
              {/* 🔹 Bagian atas lebih gelap */}
              <div
                className="absolute top-0 left-0 w-full h-[11px] rounded-t-2xl"
                style={{
                  backgroundColor: "#8C8787",
                }}
              ></div>

              {/* 🔹 Bagian bawah lebih gelap */}
              <div
                className="absolute bottom-0 left-0 w-full h-[11px] rounded-b-2xl"
                style={{
                  backgroundColor: "#8C8787",
                }}
              ></div>

              {/* 🔸 Isi konten card */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="text-2xl mb-1">
                  <img
                    src={SilverMedal}
                    alt="Medali Perak"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <hr className="w-32 border-[#8C8787] mb-2" />
                <p className="font-semibold text-[#8C8787] text-sm text-center">
                  {top3Clients[1]?.name || "Alesco"}
                </p>
                <p className="font-semibold text-[#8C8787] text-sm mt-1 text-center">
                  {top3Clients[1]?.order || "3.133.144.012"}
                </p>
              </div>
            </div>
          </div>
          {/* 🥇 Juara 1 */}
          <div className="flex flex-col items-center flex-1 max-w-[200px] relative">
            <div
              className="relative rounded-2xl shadow-md flex flex-col items-center justify-center w-full p-5 overflow-hidden"
              style={{
                height: "210px",
                backgroundColor: "#FBD15C",
              }}
            >
              {/* 🔹 Bagian atas lebih gelap */}
              <div
                className="absolute top-0 left-0 w-full h-[11px] rounded-t-2xl"
                style={{
                  backgroundColor: "#A97D00",
                }}
              ></div>

              {/* 🔹 Bagian bawah lebih gelap */}
              <div
                className="absolute bottom-0 left-0 w-full h-[11px] rounded-b-2xl"
                style={{
                  backgroundColor: "#A97D00",
                }}
              ></div>

              {/* 🔸 Isi konten card */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="text-2xl mb-1">
                  <img
                    src={GoldMedal}
                    alt="Medali Perak"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <hr className="w-32 border-[#A97D00] mb-2" />
                <p className="font-semibold text-[#A97D00] text-sm text-center">
                  {top3Clients[0]?.name || "Alesco"}
                </p>
                <p className="font-semibold text-[#A97D00] text-sm mt-1 text-center">
                  {top3Clients[0]?.order || "3.233.144.012"}
                </p>
              </div>
            </div>
          </div>

          {/* 🥉 Juara 3 */}
          <div className="flex flex-col items-center flex-1 max-w-[180px] relative">
            <div
              className="relative rounded-2xl shadow-md flex flex-col items-center justify-center w-full p-5 overflow-hidden"
              style={{
                height: "150px",
                backgroundColor: "#CE8946",
              }}
            >
              {/* 🔹 Bagian atas lebih gelap */}
              <div
                className="absolute top-0 left-0 w-full h-[11px] rounded-t-2xl"
                style={{
                  backgroundColor: "#994B00",
                }}
              ></div>

              {/* 🔹 Bagian bawah lebih gelap */}
              <div
                className="absolute bottom-0 left-0 w-full h-[11px] rounded-b-2xl"
                style={{
                  backgroundColor: "#994B00",
                }}
              ></div>

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="text-2xl mb-1">
                  <img
                    src={BronzeMedal}
                    alt="Medali Perak"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <hr className="w-32 border-[#994B00] mb-2" />
                <p className="font-semibold text-[#994B00] text-sm text-center">
                  {top3Clients[2]?.name || "Alesco"}
                </p>
                <p className="font-semibold text-[#994B00] text-sm mt-1 text-center">
                  {top3Clients[2]?.order || "3.033.144.012"}
                </p>
              </div>
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
