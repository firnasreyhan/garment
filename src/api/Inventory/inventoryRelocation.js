import api from '../axios';

export const createInventoryRelocation = (data) => {
  console.log('Sending inventory relocation request with data:', data);
  // Coba beberapa variasi endpoint
  return api.post('/api/inventory-relocation', data);
  // Alternatif jika endpoint di atas tidak berhasil:
  // return api.post('/api/inventory-relocations', data);
  // return api.post('/api/inventory/relocation', data);
};

export const getInventoryRelocations = (params) => {
  return api.get('/api/inventory-relocation', { params });
};

export const approveInventoryRelocation = (irId, irReceivedBy) => {
  return api.put('/api/inventory-relocation/approve', { irId, irReceivedBy });
};

export const rejectInventoryRelocation = (irId) => {
  return api.put('/api/inventory-relocation/reject', { irId });
}; 