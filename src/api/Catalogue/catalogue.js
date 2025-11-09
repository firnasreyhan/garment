import api from '../axios';

export const getCatalogueProducts = (params) => {
  return api.get('/api/catalogue-product', { params });
};

export const createCatalogueProduct = (data) => {
  return api.post('/api/catalogue-product', data);
};

export const updateCatalogueProduct = (data) => {
  return api.put('/api/catalogue-product', data);
};

export const deleteCatalogueProduct = (cpId) => {
  return api.delete('/api/catalogue-product', { params: { cpId } });
};

// Endpoint detail untuk mendapatkan produk berdasarkan ID
export const getCatalogueProductById = (cpId) => {
  return api.get('/api/catalogue-product/detail', { params: { cpId } });
};

// Fungsi untuk mendapatkan semua produk (tanpa pagination)
export const getAllCatalogueProducts = () => {
  return api.get('/api/catalogue-product', { params: { pageLimit: 1000, pageNumber: 1 } });
};

// Fungsi khusus untuk upload image
export const uploadCatalogueImages = (formData) => {
  return api.post('/api/catalogue-product/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Fungsi untuk upload multiple images
export const uploadMultipleCatalogueImages = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await uploadCatalogueImages(formData);
    return response;
  });
  
  const responses = await Promise.all(uploadPromises);
  return responses.map(response => response.data.data.url);
};
