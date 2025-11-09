import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { getCatalogueCategories } from "../api/Catalogue/catalogueCategory";
import { getCatalogueSubCategories } from "../api/Catalogue/catalogueSubCategory";

export default function Sidebar({ onFilterChange, activeFilter }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, subRes] = await Promise.all([
          getCatalogueCategories({ pageLimit: 100, pageNumber: 1 }),
          getCatalogueSubCategories({ pageLimit: 100, pageNumber: 1 }),
        ]);
        const catList = catRes.data.data.listData || [];
        const subList = subRes.data.data.listData || [];
        // Gabungkan subkategori ke kategori
        const categoriesWithSubs = catList.map((cat) => ({
          ...cat,
          subcategories: subList
            .filter((sub) => sub.ccId === cat.ccId)
            .map((sub) => ({ ...sub, csName: sub.csName })),
        }));
        setCategories(categoriesWithSubs);
      } catch {
        setCategories([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDropdown = (idx) => {
    setOpenDropdown(openDropdown === idx ? null : idx);
  };

  const handleSubcategoryClick = (subcategory) => {
    if (onFilterChange) {
      onFilterChange({
        type: 'subcategory',
        value: subcategory.csId,
        name: subcategory.csName
      });
    }
  };

  const handleCategoryClick = (category) => {
    if (onFilterChange) {
      onFilterChange({
        type: 'category',
        value: category.ccId,
        name: category.ccName
      });
    }
  };

  return (
    <aside className="w-64 bg-gray-100 p-6 rounded-2xl font-montserrat shadow-xl border border-gray-100 h-fit min-w-[220px] max-w-full mb-6 md:mb-0 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-primaryColor mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-primaryColor to-secondaryColor rounded-full"></div>
          Our Products
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
            <span className="ml-3 text-primaryColor font-medium">Loading...</span>
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat, idx) => (
              <li key={cat.ccId} className="group">
                <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white transition-all duration-300 ease-out group-hover:shadow-sm">
                  {/* Area klik untuk filter kategori */}
                  <button
                    className={`flex-1 text-left font-semibold transition-colors duration-300 relative ${
                      activeFilter && activeFilter.type === 'category' && activeFilter.value === cat.ccId 
                        ? 'text-secondaryColor' 
                        : 'text-primaryColor hover:text-secondaryColor'
                    }`}
                    onClick={() => handleCategoryClick(cat)}
                    type="button"
                    title="Klik untuk memfilter berdasarkan kategori ini"
                  >
                    {cat.ccName}
                    {/* Indikator visual untuk area klik */}
                    <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="absolute inset-0 bg-primaryColor/5 rounded-lg"></div>
                    </div>
                  </button>
                  
                  {/* Area klik untuk dropdown (hanya jika ada subkategori) */}
                  {cat.subcategories.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primaryColor/10 text-primaryColor px-2 py-1 rounded-full font-medium">
                        {cat.subcategories.length}
                      </span>
                      <button
                        onClick={() => handleDropdown(idx)}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200 relative group/dropdown"
                        type="button"
                        title="Klik untuk melihat sub kategori"
                      >
                        <ChevronDownIcon
                          className={`w-4 h-4 text-primaryColor transition-all duration-300 ease-out group-hover/dropdown:text-secondaryColor ${
                            openDropdown === idx ? "rotate-180 scale-110" : "rotate-0"
                          }`}
                        />
                        {/* Indikator hover untuk dropdown */}
                        <div className="absolute inset-0 bg-secondaryColor/10 rounded-lg opacity-0 group-hover/dropdown:opacity-100 transition-opacity duration-200"></div>
                      </button>
                    </div>
                  ) : (
                    // Indikator untuk kategori tanpa subkategori
                    <div className="flex items-center">
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full font-medium">
                        Kategori
                      </span>
                    </div>
                  )}
                </div>
                
                {cat.subcategories.length > 0 && (
                  <div className={`overflow-hidden transition-all duration-500 ease-out ${
                    openDropdown === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <ul className="ml-4 mt-2 space-y-1 pb-2">
                      {cat.subcategories.map((sub, subIdx) => (
                        <li key={sub.csId} className="animate-fadeIn" style={{ animationDelay: `${subIdx * 100}ms` }}>
                          <button 
                            className={`text-primaryColor font-medium px-3 py-2 rounded-lg hover:bg-white hover:text-secondaryColor w-full text-left transition-all duration-300 hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-secondaryColor/20 ${
                              activeFilter && activeFilter.type === 'subcategory' && activeFilter.value === sub.csId ? 'bg-secondaryColor/10 text-secondaryColor border-secondaryColor/30' : ''
                            }`}
                            onClick={() => handleSubcategoryClick(sub)}
                          >
                            {sub.csName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {/* Empty state */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No categories available</p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </aside>
  );
} 