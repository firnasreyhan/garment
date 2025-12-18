import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { getInventoryDetail, updateInventory } from '../../../api/Inventory/inventory';
import { getInventoryCategories } from '../../../api/Inventory/inventoryCategory';
import { getInventorySubCategories } from '../../../api/Inventory/inventorySubCategory';
import { getWarehouses } from '../../../api/Inventory/inventoryWarehouse';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import CustomDropdown from '../../components/CustomDropdown';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const EditInventory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [oldInventory, setOldInventory] = useState(null);
  const [unitCategory, setUnitCategory] = useState('');
  const [unitAdd, setUnitAdd] = useState('');
  const [unitSubtract, setUnitSubtract] = useState('');
  const unitOptions = {
    panjang: [
      { label: 'Meter', value: 'meter', factor: 1 },
      { label: 'Yard', value: 'yard', factor: 0.9144 },
      { label: 'Kilometer', value: 'kilometer', factor: 1000 }
    ],
    banyak: [
      { label: 'Biji', value: 'biji', factor: 1 },
      { label: 'Lusin', value: 'lusin', factor: 12 },
      { label: 'Rim', value: 'rim', factor: 500 },
      { label: 'Gross', value: 'gross', factor: 144 },
      { label: 'Mass', value: 'mass', factor: 1440 },
      { label: 'Kodi', value: 'kodi', factor: 20 }
    ]
  };
  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editedInventory, setEditedInventory] = useState({
    icId: '',
    isId: '',
    iwId: '',
    iCode: '',
    iDescription: '',
    iAmount: '',
    iUnit: ''
  });

  const [tambahJumlah, setTambahJumlah] = useState('');
  const [kurangiJumlah, setKurangiJumlah] = useState('');
  const [kategoriSatuanLabel, setKategoriSatuanLabel] = useState('');

  // Ambil data detail dan dropdown saat mount
  useEffect(() => {
    const fetchAll = async () => {
      setInitialLoading(true);
      
      if (!id) {
        setFormError('ID inventory tidak ditemukan');
        setInitialLoading(false);
        return;
      }
      
      try {
        // 1. Ambil semua inventory dan filter berdasarkan ID
        const resDetail = await getInventoryDetail(id);
        
        // Extract data dengan struktur yang benar berdasarkan response yang diberikan
        let allInventoryData = [];
        if (resDetail.data && resDetail.data.data && resDetail.data.data.listData) {
          // Jika ada listData array (seperti response yang diberikan)
          allInventoryData = Array.isArray(resDetail.data.data.listData) ? resDetail.data.data.listData : [];
        } else if (resDetail.data && resDetail.data.data) {
          // Jika ada nested data langsung
          allInventoryData = Array.isArray(resDetail.data.data) ? resDetail.data.data : [resDetail.data.data];
        } else if (resDetail.data && Array.isArray(resDetail.data)) {
          // Jika response langsung array
          allInventoryData = resDetail.data;
        } else if (resDetail.data) {
          // Jika response langsung object
          allInventoryData = [resDetail.data];
        }
        
        // Filter berdasarkan ID yang dipilih
        const inventoryData = allInventoryData.find(item => item.iId === Number(id));
        
        if (!inventoryData) {
          setFormError('Data inventory tidak ditemukan. Silakan cek ID inventory.');
          setInitialLoading(false);
          return;
        }
        
        setOldInventory(inventoryData); // simpan data lama
        
        // 2. Ambil semua kategori, sub kategori, gudang
        const [categoriesRes, subCategoriesRes, warehousesRes] = await Promise.all([
          getInventoryCategories({ pageLimit: -1 }),
          getInventorySubCategories({ pageLimit: -1 }),
          getWarehouses({ pageLimit: -1 }),
        ]);
        
        // Extract categories data
        let categoriesData = [];
        if (categoriesRes.data && categoriesRes.data.data && categoriesRes.data.data.listData) {
          categoriesData = Array.isArray(categoriesRes.data.data.listData) ? categoriesRes.data.data.listData : [];
        } else if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data;
        }
        setCategories(categoriesData);
        
        // Extract sub categories data
        let allSubCategories = [];
        if (subCategoriesRes.data && subCategoriesRes.data.data && subCategoriesRes.data.data.listData) {
          allSubCategories = Array.isArray(subCategoriesRes.data.data.listData) ? subCategoriesRes.data.data.listData : [];
        } else if (subCategoriesRes.data && Array.isArray(subCategoriesRes.data)) {
          allSubCategories = subCategoriesRes.data;
        }
        
        // Filter sub kategori sesuai kategori dari detail
        const filteredSubCategories = allSubCategories.filter(sub => sub.icId === inventoryData.icId);
        setSubCategories(filteredSubCategories);
        
        // Extract warehouses data
        let warehousesData = [];
        if (warehousesRes.data && warehousesRes.data.data && warehousesRes.data.data.listData) {
          warehousesData = Array.isArray(warehousesRes.data.data.listData) ? warehousesRes.data.data.listData : [];
        } else if (warehousesRes.data && Array.isArray(warehousesRes.data)) {
          warehousesData = warehousesRes.data;
        }
        setWarehouses(warehousesData);
        
        // Set form edit dengan data yang benar
        const formData = {
          icId: inventoryData.icId || '',
          isId: inventoryData.isId || '',
          iwId: inventoryData.iwId || '',
          iCode: inventoryData.iCode || '',
          iDescription: inventoryData.iDescription || '',
          iAmount: inventoryData.iAmount || '',
          iUnit: inventoryData.iUnit || ''
        };
        setEditedInventory(formData);
        
        // Set unitCategory berdasarkan satuan yang ada
        let kategoriSatuan = '';
        if (['meter', 'yard', 'kilometer'].includes((inventoryData.iUnit || '').toLowerCase())) {
          kategoriSatuan = 'Panjang';
        } else if (['biji', 'lusin', 'rim', 'gross', 'mass', 'kodi'].includes((inventoryData.iUnit || '').toLowerCase())) {
          kategoriSatuan = 'Banyak';
        }
        setUnitCategory(kategoriSatuan.toLowerCase());
        setKategoriSatuanLabel(kategoriSatuan);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        let errorMessage = 'Gagal memuat data inventory';
        if (error.response?.data?.remark) {
          errorMessage += ': ' + error.response.data.remark;
        } else if (error.message) {
          errorMessage += ': ' + error.message;
        }
        
        setFormError(errorMessage);
      }
      setInitialLoading(false);
    };
    fetchAll();
  }, [id]);

  // Filter subCategories setiap kali kategori berubah oleh user
  useEffect(() => {
    if (!editedInventory.icId) {
      setSubCategories([]);
      return;
    }
    const fetchAndFilterSubCategories = async () => {
      try {
        const res = await getInventorySubCategories({ pageLimit: -1 });
        
        // Extract sub categories data dengan struktur yang benar
        let allSubCategories = [];
        if (res.data && res.data.data && res.data.data.listData) {
          allSubCategories = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
        } else if (res.data && Array.isArray(res.data)) {
          allSubCategories = res.data;
        }
        
        const filteredSubCategories = allSubCategories.filter(sub => sub.icId === editedInventory.icId);
        setSubCategories(filteredSubCategories);
      } catch (error) {
        console.error('Error fetching sub categories:', error);
        setSubCategories([]);
      }
    };
    fetchAndFilterSubCategories();
  }, [editedInventory.icId]);

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      // Validasi deskripsi inventory wajib
      if (
        (editedInventory.iDescription === undefined || editedInventory.iDescription === "") &&
        (!oldInventory || oldInventory.iDescription === undefined || oldInventory.iDescription === "")
      ) {
        setFormError("Deskripsi inventory tidak boleh kosong.");
        setLoading(false);
        return;
      }

      // Hitung jumlah akhir berdasarkan penambahan dan pengurangan
      let currentAmount = Number(editedInventory.iAmount) || 0;
      let addAmount = 0;
      let subtractAmount = 0;
      
      // Hitung jumlah yang ditambahkan
      if (tambahJumlah && unitAdd && unitCategory) {
        const selectedAdd = unitOptions[unitCategory]?.find(opt => opt.value === unitAdd);
        if (selectedAdd) {
          addAmount = Number(tambahJumlah) * selectedAdd.factor;
          addAmount = unitAdd === 'yard' && unitCategory === 'panjang' ? Number(addAmount.toFixed(1)) : Math.round(addAmount);
        }
      }
      
      // Hitung jumlah yang dikurangi
      if (kurangiJumlah && unitSubtract && unitCategory) {
        const selectedSubtract = unitOptions[unitCategory]?.find(opt => opt.value === unitSubtract);
        if (selectedSubtract) {
          subtractAmount = Number(kurangiJumlah) * selectedSubtract.factor;
          subtractAmount = unitSubtract === 'yard' && unitCategory === 'panjang' ? Number(subtractAmount.toFixed(1)) : Math.round(subtractAmount);
        }
      }

      // Hitung jumlah akhir: Jumlah saat ini + tambah - kurangi
      const finalAmount = Math.max(0, currentAmount + addAmount - subtractAmount);

      const payload = {
        iId: Number(id),
        isId: editedInventory.isId || (oldInventory && oldInventory.isId),
        iwId: editedInventory.iwId || (oldInventory && oldInventory.iwId),
        iCode: editedInventory.iCode || (oldInventory && oldInventory.iCode),
        iDescription:
          editedInventory.iDescription && editedInventory.iDescription.trim() !== ""
            ? editedInventory.iDescription
            : oldInventory && oldInventory.iDescription
              ? oldInventory.iDescription
              : "Deskripsi default",
        iAmount: Math.round(finalAmount),
        iUnit: editedInventory.iUnit || (oldInventory && oldInventory.iUnit) || ''
      };
      await updateInventory(id, payload);
      navigate('/admin/inventory/list');
    } catch (err) {
      setFormError(err.response?.data?.remark || 'Gagal mengubah inventory');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1">
          <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (formError) {
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
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center py-8 text-red-500 font-semibold">{formError}</div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto py-10 px-4">
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
            <h1 className="text-3xl font-bold text-center text-primaryColor mb-2">EDIT INVENTORY</h1>
            <p className="text-center text-gray-500 mb-8">Silakan edit data inventory di bawah ini.</p>

            <form onSubmit={handleUpdateInventory} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Kode <span className="text-red-500 ml-1">*</span></span>
                  <input
                    id="iCode"
                    type="text"
                    placeholder="e.g., ABC123"
                    value={editedInventory.iCode || ""}
                    onChange={(e) => setEditedInventory({...editedInventory, iCode: e.target.value})}
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                    required
                  />
                </div>
                <div className="flex w-full">
                  <CustomDropdown
                    label="Kategori"
                    options={categories.map(cat => ({ value: cat.icId, label: cat.icName }))}
                    value={editedInventory.icId}
                    onChange={val => setEditedInventory({...editedInventory, icId: val, isId: ''})}
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
                    value={editedInventory.isId}
                    onChange={val => setEditedInventory({...editedInventory, isId: val})}
                    placeholder="Pilih Sub Kategori"
                    searchPlaceholder="Cari sub kategori..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Gudang <span className="text-red-500 ml-1">*</span></span>
                  <input
                    id="iwId"
                    type="text"
                    disabled
                    placeholder="Nama Gudang"
                    value={(() => {
                      const selectedWarehouse = warehouses.find(wh => wh.iwId === editedInventory.iwId);
                      return selectedWarehouse ? selectedWarehouse.iwName : '';
                    })()}
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                    required
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Kategori Satuan<span className="text-red-500 ml-1">*</span></span>
                  <input
                    type="text"
                    disabled
                    value={kategoriSatuanLabel}
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Jumlah <span className="text-red-500 ml-1">*</span></span>
                  <input
                    id="iAmount"
                    type="text"
                    disabled
                    placeholder="0.0"
                    value={editedInventory.iAmount !== undefined && editedInventory.iAmount !== null ? Number(editedInventory.iAmount).toFixed(1) : ""}
                    onChange={(e) => setEditedInventory({...editedInventory, iAmount: e.target.value})}
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                    required
                  />
                </div>
                <div className="flex w-full">
                  <span className="w-1/2 px-4 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor border-r-0 flex items-center justify-center h-[44px]">Satuan<span className="text-red-500 ml-1">*</span></span>
                  <input
                    type="text"
                    disabled
                    value={editedInventory.iUnit || ''}
                    className="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
              </div>
              <div className="w-full flex flex-col gap-2 mt-6">
                <span className="px-4 py-2 bg-primaryColor text-white font-bold rounded-xl border border-primaryColor flex items-center justify-center h-[44px] w-full">Deskripsi <span className="text-red-500 ml-1">*</span></span>
                <textarea
                  id="iDescription"
                  placeholder="Deskripsi inventory"
                  value={editedInventory.iDescription || ""}
                  onChange={(e) => setEditedInventory({...editedInventory, iDescription: e.target.value})}
                  className="w-full px-4 py-3 border border-primaryColor rounded-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor focus:border-transparent h-[88px] resize-none placeholder:text-[#BDBDBD] placeholder:font-semibold"
                  rows="4"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor h-[44px] flex items-center text-sm">+ TAMBAH JUMLAH ITEM</span>
                  <input
                    type="number"
                    min="0"
                    className="w-16 px-2 py-2 border border-primaryColor border-l-0 rounded-r-xl text-center font-semibold h-[44px] focus:outline-none text-sm"
                    value={tambahJumlah || ''}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={e => setTambahJumlah(e.target.value)}
                  />
                </div>
                <div className="w-56">
                  <CustomDropdown
                    label="Satuan"
                    options={unitCategory ? unitOptions[unitCategory].map(opt => ({ value: opt.value, label: opt.label })) : []}
                    value={unitAdd}
                    onChange={val => setUnitAdd(val)}
                    placeholder="Pilih Satuan"
                    searchPlaceholder="Cari satuan..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-primaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex items-center">
                  <span className="px-6 py-2 bg-primaryColor text-white font-bold rounded-l-xl border border-primaryColor h-[44px] flex items-center">{unitCategory === 'panjang' ? 'Meter' : unitCategory === 'banyak' ? 'Biji' : ''}</span>
                  <input
                    type="text"
                    readOnly
                    className="w-20 px-4 py-2 border border-primaryColor border-l-0 rounded-r-xl text-center font-semibold h-[44px] bg-gray-100"
                    value={(() => {
                      if (!unitCategory || !unitAdd || !tambahJumlah) return '';
                      const selected = unitOptions[unitCategory].find(opt => opt.value === unitAdd);
                      if (!selected) return '';
                      const result = Number(tambahJumlah) * selected.factor;
                      return result.toFixed(1);
                    })()}
                    tabIndex={-1}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-secondaryColor text-white font-bold rounded-l-xl border border-secondaryColor h-[44px] flex items-center text-sm">- KURANGI JUMLAH ITEM</span>
                  <input
                    type="number"
                    min="0"
                    className="w-16 px-2 py-2 border border-secondaryColor border-l-0 rounded-r-xl text-center font-semibold h-[44px] focus:outline-none text-sm"
                    value={kurangiJumlah || ''}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={e => setKurangiJumlah(e.target.value)}
                  />
                </div>
                <div className="w-56">
                  <CustomDropdown
                    label="Satuan"
                    options={unitCategory ? unitOptions[unitCategory].map(opt => ({ value: opt.value, label: opt.label })) : []}
                    value={unitSubtract}
                    onChange={val => setUnitSubtract(val)}
                    placeholder="Pilih Satuan"
                    searchPlaceholder="Cari satuan..."
                    containerClassName="flex w-full"
                    labelClassName="w-1/2 px-4 py-2 h-[44px] flex items-center justify-center"
                    dropdownClassName="w-1/2"
                    buttonClassName="w-1/2 px-4 py-2 border border-secondaryColor border-l-0 bg-gray-100 text-black font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[44px]"
                  />
                </div>
                <div className="flex items-center">
                  <span className="px-6 py-2 bg-secondaryColor text-white font-bold rounded-l-xl border border-secondaryColor h-[44px] flex items-center">{unitCategory === 'panjang' ? 'Meter' : unitCategory === 'banyak' ? 'Biji' : ''}</span>
                  <input
                    type="text"
                    readOnly
                    className="w-20 px-4 py-2 border border-secondaryColor border-l-0 rounded-r-xl text-center font-semibold h-[44px] bg-gray-100"
                    value={(() => {
                      if (!unitCategory || !unitSubtract || !kurangiJumlah) return '';
                      const selected = unitOptions[unitCategory].find(opt => opt.value === unitSubtract);
                      if (!selected) return '';
                      const result = Number(kurangiJumlah) * selected.factor;
                      return result.toFixed(1);
                    })()}
                    tabIndex={-1}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-6 pt-8">
                <button
                  type="submit"
                  className="px-10 py-3 rounded-lg bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold text-lg transition-colors disabled:opacity-50"
                  disabled={loading}
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

export default EditInventory;