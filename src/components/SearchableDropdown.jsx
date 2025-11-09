import { useEffect, useRef, useState } from "react";

// export default function SearchableDropdown({
//   data = [],
//   labelKey = "name",
//   valueKey = "id",
//   placeholder = "Cari...",
//   value,
//   onChange,
//   onSelect,
//   required = false,
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Sync searchTerm with value (controllable)
//   useEffect(() => {
//     if (value !== undefined && value !== null) {
//       const selected = data?.find((item) => item[valueKey] === value);
//       setSearchTerm(selected ? selected[labelKey] : "");
//     }
//   }, [value, data, labelKey, valueKey]);

//   // Filter data berdasarkan searchTerm
//   const filteredData = data?.filter((item) =>
//     String(item[labelKey]).toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   // Tutup dropdown kalau klik di luar
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Handle input change
//   const handleInputChange = (e) => {
//     setSearchTerm(e.target.value);
//     setIsOpen(true);
//     if (onChange) onChange(null); // Reset value on typing
//   };

//   // Handle select
//   const handleSelect = (item) => {
//     setIsOpen(false);
//     setSearchTerm(item[labelKey]);
//     if (onChange) onChange(item[valueKey]);
//     if (onSelect) onSelect(item);
//   };

//   return (
//     <div className="relative w-full" ref={dropdownRef}>
//       {/* Input pencarian */}
//       <input
//         type="text"
//         placeholder={placeholder}
//         className="w-full border-b border-gray-300 bg-transparent py-2 pr-8 text-sm focus:outline-none"
//         value={searchTerm}
//         onChange={handleInputChange}
//         onFocus={() => setIsOpen(true)}
//         required={required}
//       />

//       {/* Dropdown hasil pencarian */}
//       {isOpen && (
//         <ul className="absolute z-10 w-full max-h-60 overflow-y-auto border border-gray-300 bg-white shadow-lg rounded-md mt-1">
//           {filteredData.length > 0 ? (
//             filteredData.map((item) => (
//               <li
//                 key={item[valueKey]}
//                 className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
//                 onClick={() => handleSelect(item)}
//               >
//                 {item[valueKey]} - {item[labelKey]}
//               </li>
//             ))
//           ) : (
//             <li className="px-4 py-2 text-gray-500 text-sm">
//               Data tidak ditemukan
//             </li>
//           )}
//         </ul>
//       )}
//     </div>
//   );
// }

export default function SearchableDropdown({
  data = [],
  labelKey = "name",
  valueKey = "id",
  placeholder = "Cari...",
  value,
  onChange,
  onSelect,
  required = false,
  renderItem, // 🔹 optional custom renderer
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sinkronisasi tampilan input dengan value terpilih
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const selected = data?.find((item) => item[valueKey] === value);
      setSearchTerm(selected ? selected[labelKey] : "");
    }
  }, [value, data, labelKey, valueKey]);

  // Filter hasil pencarian
  const filteredData = data?.filter((item) =>
    String(item[labelKey]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (onChange) onChange(null);
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    setSearchTerm(item[labelKey]);
    if (onChange) onChange(item[valueKey]);
    if (onSelect) onSelect(item);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input */}
      {/* <input
        type="text"
        placeholder={placeholder}
        className="w-full border-b border-gray-300 bg-transparent py-2 pr-8 text-sm focus:outline-none"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        required={required}
      /> */}
      {renderItem ? (
        // Jika renderItem tidak ada → tampilan seperti "Progress Amount"
        <input
          type="text"
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          required={required}
        />
      ) : (
        // Jika renderItem ada → tampilan minimalis (seperti "Order Item Size")
        <input
          type="text"
          placeholder={placeholder}
          className="w-full border-b border-gray-300 bg-transparent py-2 pr-8 text-sm focus:outline-none"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          required={required}
        />
      )}


      {/* Dropdown */}
      {isOpen && (
        <ul className="absolute z-10 w-full max-h-60 overflow-y-auto border border-gray-300 bg-white shadow-lg rounded-md mt-1">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <li
                key={item[valueKey]}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                onClick={() => handleSelect(item)}
              >
                {renderItem ? renderItem(item) : (
                  <>
                    {item[valueKey]} - {item[labelKey]}
                  </>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 text-sm">
              Data tidak ditemukan
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
