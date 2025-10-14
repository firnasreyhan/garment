import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

function CustomDropdown({ label, options, value, onChange, placeholder, searchPlaceholder = 'Cari...', className = '', containerClassName = '', labelClassName = '', dropdownClassName = '', buttonClassName = '', height = '44px', labelMinWidth = '70px' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);
  
  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className={`flex items-center w-auto ${containerClassName} ${className}`} style={{ height }}>
      <span
        className={`bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 text-base flex items-center justify-center ${labelClassName}`}
        style={{ minWidth: labelMinWidth, height, paddingLeft: '20px', paddingRight: '20px' }}
      >
        {label}<span className="text-red-500 ml-1">*</span>
      </span>
      <div className={`relative ${dropdownClassName}`} style={{ height }}>
        <button
          ref={btnRef}
          type="button"
          className={`appearance-none w-full px-3 py-2 border border-primaryColor border-l-0 bg-gray-100 text-[#BDBDBD] font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor text-sm flex items-center justify-between ${buttonClassName}`}
          style={{ height }}
          onClick={() => setOpen(o => !o)}
        >
          <span className={value ? 'text-black truncate' : 'text-[#BDBDBD]'}>
            {value ? selectedOption?.label : placeholder}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-[#BDBDBD] ml-2" />
        </button>
        {open && (
          <div ref={dropdownRef} className="absolute z-10 mt-1 w-full bg-gray-100 border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto focus:outline-none">
            <div className="p-2 sticky top-0 bg-gray-100 z-10">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none text-sm"
                autoFocus
              />
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-400 text-sm">Tidak ditemukan</div>
            )}
            {filteredOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-4 py-2 cursor-pointer ${String(opt.value) === String(value) ? 'bg-secondaryColor/10 text-black' : 'text-black'} hover:bg-secondaryColor/20`}
                onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomDropdown; 