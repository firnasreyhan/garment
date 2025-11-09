// src/components/SummaryCard.jsx

import { ChevronUp } from "lucide-react"; // Import ikon panah
import { useState } from "react";
import { formatCurrency } from "../../../utils";

// Definisikan skema warna agar mudah diperluas
const colorSchemes = {
  indigo: {
    bg: "bg-indigo-500",
    text: "text-indigo-600",
    iconBg: "bg-indigo-100",
    border: "border-indigo-500",
  },
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
    border: "border-blue-500",
  },
  green: {
    bg: "bg-green-500",
    text: "text-green-600",
    iconBg: "bg-green-100",
    border: "border-green-500",
  },
  red: {
    bg: "bg-red-500",
    text: "text-red-600",
    iconBg: "bg-red-100",
    border: "border-red-500",
  },
  yellow: {
    bg: "bg-yellow-500",
    text: "text-yellow-600",
    iconBg: "bg-yellow-100",
    border: "border-yellow-500",
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
    border: "border-orange-500",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    iconBg: "bg-amber-100",
    border: "border-amber-500",
  },
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    iconBg: "bg-emerald-100",
    border: "border-emerald-500",
  },
  violet: {
    bg: "bg-violet-500",
    text: "text-violet-600",
    iconBg: "bg-violet-100",
    border: "border-violet-500",
  },
  teal: {
    bg: "bg-teal-500",
    text: "text-teal-600",
    iconBg: "bg-teal-100",
    border: "border-teal-500",
  },
  cyan: {
    bg: "bg-cyan-500",
    text: "text-cyan-600",
    iconBg: "bg-cyan-100",
    border: "border-cyan-500",
  },
  "deep-purple": {
    bg: "bg-deep-purple-700",
    text: "text-deep-purple-800",
    iconBg: "bg-deep-purple-100",
    border: "border-deep-purple-700",
  },
};

const SummaryCard = ({
  title,
  value,
  icon,
  details = [],
  color = "purple",
  isCurrency = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen); // Default terbuka sesuai gambar
  const scheme = colorSchemes[color] || colorSchemes.indigo; // Fallback ke purple jika warna tidak ditemukan

  const Icon = icon; // Pastikan ikon diterima sebagai komponen React

  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-xl shadow-lg p-5">
      {/* Bagian Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 font-poppins">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1 font-montserrat">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${scheme.iconBg}`}>
          <Icon className={`h-7 w-7 ${scheme.text}`} />
        </div>
      </div>

      {/* Tombol Toggle Dropdown */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center mt-4 text-base font-medium cursor-pointer`}
      >
        <ChevronUp
          className={`h-5 w-5 mr-1 transform transition-transform duration-300 ${isOpen ? "" : "rotate-180"} ${scheme.text}`}
        />
        <span className="font-poppins">Periksa Detail</span>
      </div>

      {/* Konten Dropdown/Detail */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-screen mt-4" : "max-h-0"}`}
      >
        <div className="space-y-3 font-poppins">
          {details.map((item, index) => (
            <div key={index}>
              <div
                className={`w-full text-center text-white text-sm font-semibold p-2 rounded-t-md ${scheme.bg}`}
              >
                {item.label}
              </div>
              <div
                className={`w-full text-center text-gray-700 font-bold p-2 border rounded-b-md ${scheme.border} border-t-0`}
              >
                {isCurrency ? formatCurrency(item.value) : item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
