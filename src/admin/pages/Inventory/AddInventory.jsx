import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { createInventory } from '../../../api/Inventory/inventory';
import { getInventoryCategories } from '../../../api/Inventory/inventoryCategory';
import { getInventorySubCategories } from '../../../api/Inventory/inventorySubCategory';
import { getWarehouses } from '../../../api/Inventory/inventoryWarehouse';
import { getInventories } from '../../../api/Inventory/inventory';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import CustomDropdown from '../../components/CustomDropdown';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const AddInventory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [unitCategory, setUnitCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [newInventory, setNewInventory] = useState({
    icId: '',
    isId: '',
    iwId: '',
    iCode: '',
    iDescription: '',
    iAmount: '',
    iUnit: ''
  });

  const unitOptions = {
    panjang: [
      { label: 'Meter', value: 'Meter', factor: 1 },
      { label: 'Yard', value: 'Yard', factor: 0.9144 },
      { label: 'Kilometer', value: 'Kilometer', factor: 1000 }
    ],
    banyak: [
      { label: 'Biji', value: 'Biji', factor: 1 },
      { label: 'Lusin', value: 'Lusin', factor: 12 },
      { label: 'Rim', value: 'Rim', factor: 500 },
      { label: 'Gross', value: 'Gross', factor: 144 },
      { label: 'Mass', value: 'Mass', factor: 1440 },
      { label: 'Kodi', value: 'Kodi', factor: 20 }
    ]
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesRes, subCategoriesRes, warehousesRes] = await Promise.all([
          getInventoryCategories({ pageLimit: -1 }),
          getInventorySubCategories({ pageLimit: -1 }),
          getWarehouses({ pageLimit: -1 }),
        ]);

        // Handle inconsistent API response structures
        setCategories(Array.isArray(categoriesRes.data.data.listData) ? categoriesRes.data.data.listData : []);
        setSubCategories(Array.isArray(subCategoriesRes.data.data.listData) ? subCategoriesRes.data.data.listData : []);
        setWarehouses(Array.isArray(warehousesRes.data.data.listData) ? warehousesRes.data.data.listData : []);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setFormError('Gagal memuat data untuk dropdown.');
      }
    };
    
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!newInventory.icId) return;
  
      try {
        const res = await getInventorySubCategories({ pageLimit: -1 });
        const list = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
  
        // Filter manual berdasarkan icId yang dipilih
        const filtered = list.filter(sub => sub.icId === newInventory.icId);
        setSubCategories(filtered);
      } catch (err) {
        console.error('Gagal memuat sub-kategori:', err);
        setSubCategories([]);
      }
    };
  
    fetchSubCategories();
  }, [newInventory.icId]);

  // Function to validate if code already exists
  const validateCode = async (code) => {
    if (!code || code.trim() === '') {
      setCodeError('');
      return true;
    }
    
    try {
      const res = await getInventories({ 
        pageLimit: 1, 
        pageNumber: 1, 
        search: code.trim() 
      });
      
      const existingInventory = res.data.data.listData.find(
        inv => inv.iCode.toLowerCase() === code.trim().toLowerCase()
      );
      
      if (existingInventory) {
        setCodeError(`Kode "${code}" sudah ada dalam sistem. Silakan gunakan kode yang berbeda.`);
        return false;
      } else {
        setCodeError('');
        return true;
      }
    } catch {
      // If validation fails, allow submission and let server handle it
      setCodeError('');
      return true;
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    setCodeError('');
    
    // Validate code before submitting
    const isCodeValid = await validateCode(newInventory.iCode);
    if (!isCodeValid) {
      setLoading(false);
      return;
    }
    
    try {
      let convertedAmount = newInventory.iAmount === '' ? 0 : Number(newInventory.iAmount);
      let baseUnit = unitCategory === 'panjang' ? 'Meter' : unitCategory === 'banyak' ? 'Biji' : '';
      if (unitCategory && unit) {
        const selected = unitOptions[unitCategory].find(opt => opt.value === unit);
        if (selected) {
          convertedAmount = (newInventory.iAmount === '' ? 0 : Number(newInventory.iAmount)) * selected.factor;
        }
      }
      const payload = {
        ...newInventory,
        iAmount: convertedAmount.toFixed(1),
        iUnit: baseUnit
      };
      console.log('Payload yang dikirim ke backend:', payload);
      await createInventory(payload);
      // Ambil page terakhir dari API list inventory
      const res = await getInventories({ pageLimit: 10, pageNumber: 1 }); // 10 = PAGE_LIMIT di InventoryList.jsx
      const lastPage = res.data.pagination?.pageLast || 1;
      navigate(`/admin/inventory/list?page=${lastPage}`);
    } catch (err) {
      // Handle specific error for duplicate iCode
      if (err.response?.data?.remark) {
        const errorMessage = err.response.data.remark;
        if (errorMessage.toLowerCase().includes('duplicate') || 
            errorMessage.toLowerCase().includes('sudah ada') ||
            errorMessage.toLowerCase().includes('exists') ||
            errorMessage.toLowerCase().includes('kode')) {
          setFormError(`Kode inventory "${newInventory.iCode}" sudah ada dalam sistem. Silakan gunakan kode yang berbeda.`);
        } else {
          setFormError(errorMessage);
        }
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menambah inventory. Silakan coba lagi.');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
        opacity: 1
      }}
    >
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
        <div className="max-w-4xl mx-auto py-10 px-4 font-montserrat">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/inventory/list')}
              className="flex items-center gap-2 text-primaryColor hover:text-primaryColor/80"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-8 font-montserrat">
            <h1 className="text-3xl font-bold text-center text-primaryColor mb-2">TAMBAH INVENTORY</h1>
            <p className="text-center text-gray-500 mb-8">Silakan isi form di bawah ini untuk menambah inventory baru.</p>

            <form onSubmit={handleAddInventory} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex w-full flex-col">
                  <div className="flex w-full">
                    <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Kode<span className="text-red-500 ml-1">*</span></span>
                    <input
                      id="iCode"
                      type="text"
                      placeholder="e.g., ABC123"
                      value={newInventory.iCode}
                      onChange={async (e) => {
                        const newCode = e.target.value;
                        setNewInventory({...newInventory, iCode: newCode});
                        // Clear error when user starts typing
                        if (codeError) {
                          setCodeError('');
                        }
                        // Validate code after user stops typing (debounce)
                        if (newCode.trim()) {
                          setTimeout(() => validateCode(newCode), 500);
                        }
                      }}
                      className={`w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px] ${codeError ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {codeError && (
                    <div className="text-red-500 text-sm mt-1 px-4">
                      {codeError}
                    </div>
                  )}
                </div>
                <div className="flex w-full">
                  <CustomDropdown
                    label="Kategori"
                    options={categories.map(cat => ({ value: cat.icId, label: cat.icName }))}
                    value={newInventory.icId}
                    onChange={val => setNewInventory({...newInventory, icId: val, isId: ''})}
                    placeholder="Pilih Kategori"
                    searchPlaceholder="Cari kategori..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <CustomDropdown
                    label="Sub Kategori"
                    options={subCategories.map(sub => ({ value: sub.isId, label: sub.isName }))}
                    value={newInventory.isId}
                    onChange={val => setNewInventory({...newInventory, isId: val})}
                    placeholder="Pilih Sub Kategori"
                    searchPlaceholder="Cari sub kategori..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <CustomDropdown
                    label="Gudang"
                    options={warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))}
                    value={newInventory.iwId}
                    onChange={val => setNewInventory({...newInventory, iwId: val})}
                    placeholder="Pilih Gudang"
                    searchPlaceholder="Cari gudang..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <CustomDropdown
                    label="Kategori Satuan"
                    options={[
                      { value: 'panjang', label: 'Panjang' },
                      { value: 'banyak', label: 'Banyak' }
                    ]}
                    value={unitCategory}
                    onChange={val => { setUnitCategory(val); setUnit(''); }}
                    placeholder="Pilih Kategori"
                    searchPlaceholder="Cari kategori satuan..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <CustomDropdown
                    label="Satuan"
                    options={unitCategory ? unitOptions[unitCategory].map(opt => ({ value: opt.value, label: opt.label })) : []}
                    value={unit}
                    onChange={val => setUnit(val)}
                    placeholder="Pilih Satuan"
                    searchPlaceholder="Cari satuan..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Jumlah <span className="text-red-500 ml-1">*</span></span>
                  <input
                    id="iAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newInventory.iAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewInventory({ ...newInventory, iAmount: val === '' ? '' : val });
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                    required
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Satuan Dasar</span>
                  <input
                    id="iUnit"
                    type="text"
                    value={unitCategory === 'panjang' ? 'Meter' : unitCategory === 'banyak' ? 'Biji' : ''}
                    readOnly
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Hasil Konversi</span>
                  <input
                    type="text"
                    readOnly
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl h-[44px]"
                    value={(() => {
                      if (!unitCategory || !unit || newInventory.iAmount === '') return '';
                      const selected = unitOptions[unitCategory].find(opt => opt.value === unit);
                      if (!selected) return '';
                      const result = Number(newInventory.iAmount) * selected.factor;
                      const baseUnit = unitCategory === 'panjang' ? 'Meter' : unitCategory === 'banyak' ? 'Biji' : '';
                      if (unit === 'Yard' && baseUnit === 'Meter') {
                        const rounded = Number(result.toFixed(1));
                        if (Number.isInteger(rounded)) {
                          return `${rounded.toFixed(0)} ${baseUnit}`;
                        } else {
                          return `${rounded.toFixed(1)} ${baseUnit}`;
                        }
                      } else {
                        return `${Math.round(result)} ${baseUnit}`;
                      }
                    })()}
                    tabIndex={-1}
                  />
                </div>
              </div>
              <div className="w-full flex flex-col gap-2">
                <span className="px-4 py-2 bg-primaryColor text-white font-bold rounded-xl border border-primaryColor flex items-center justify-center h-[44px] w-full">Deskripsi <span className="text-red-500 ml-1">*</span></span>
                <textarea
                  id="iDescription"
                  placeholder="Deskripsi inventory"
                  value={newInventory.iDescription}
                  onChange={(e) => setNewInventory({...newInventory, iDescription: e.target.value})}
                  className="w-full px-4 py-3 border border-primaryColor rounded-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor focus:border-transparent h-[88px] resize-none placeholder:text-[#BDBDBD] placeholder:font-semibold"
                  rows="4"
                  required
                />
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}
              <div className="flex justify-center gap-6 pt-8">
                <button
                  type="submit"
                  className="px-10 py-3 rounded-lg bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold text-lg transition-colors disabled:opacity-50"
                  disabled={loading || !!codeError}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/inventory/list')}
                  className="px-10 py-3 rounded-lg bg-[#FB5C5C] hover:bg-[#e04a4a] text-white font-bold text-lg transition-colors"
                  disabled={loading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventory; 