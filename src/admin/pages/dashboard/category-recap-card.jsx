// src/components/CategoryRecapCard.jsx

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../../utils";

// Skema warna yang sama, kita tambahkan 'orange' sesuai gambar
const colorSchemes = {
  peach: {
    bg: "bg-peach-500",
    text: "text-peach-600",
    iconBg: "bg-peach-100",
    border: "border-peach-500",
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
    border: "border-orange-500",
  },
};

export const CategoryRecapCard = ({
  title,
  value,
  icon,
  details = [],
  color = "orange",
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const scheme = colorSchemes[color] || colorSchemes.orange;

  const Icon = icon;

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-xl shadow-lg p-5">
      {/* Bagian Header - Sama seperti sebelumnya */}
      <div className="flex justify-between items-start font-montserrat">
        <div>
          <p className="text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${scheme.iconBg}`}>
          <Icon className={`h-7 w-7 ${scheme.text}`} />
        </div>
      </div>

      {/* Tombol Toggle Dropdown - Sama seperti sebelumnya */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center mt-4 text-sm font-medium cursor-pointer`}
      >
        <ChevronUp
          className={`h-5 w-5 mr-1 transform transition-transform duration-300 ${isOpen ? "" : "rotate-180"} ${scheme.text}`}
        />
        <span className="font-poppins">Periksa Detail</span>
      </div>

      {/* Konten Dropdown/Detail - INI BAGIAN YANG BERUBAH */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-screen mt-4" : "max-h-0"}`}
      >
        <div className="space-y-4">
          {details.map((category, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden ${scheme.border}`}
            >
              {/* Header Kartu Kategori */}
              <div
                className={`p-2 text-center font-semibold text-white ${scheme.bg} font-montserrat`}
              >
                {category.categoryTitle}
              </div>

              {/* Body Kartu Kategori berisi statistik */}
              <div className="p-3 bg-white space-y-2 font-poppins">
                {category.stats.map((stat, statIndex) => (
                  <div
                    key={statIndex}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600">{stat.label}</span>
                    {stat.label === "Jumlah" ? (
                      <span className="font-medium text-gray-800">
                        {formatNumber(stat.value)}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-800">
                        {formatCurrency(stat.value)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
