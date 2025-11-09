import api from '../axios';

export const getInventoryCategories = ({ pageLimit, pageNumber, search = '', orderBy = '', ordering = '' }) => {
  const params = {};
  
  // Only add pageLimit and pageNumber if they are provided, valid, and not -1
  if (pageLimit !== undefined && pageLimit !== null && pageLimit !== null) {
    params.pageLimit = pageLimit;
  }
  if (pageNumber !== undefined && pageNumber !== null && pageLimit !== null) {
    params.pageNumber = pageNumber;
  }
  if (search) params.search = search;
  if (orderBy) params.orderBy = orderBy;
  if (ordering) params.ordering = ordering;
  
  return api.get('/api/inventory-category', { params });
};

export const createInventoryCategory = (data) => {
  return api.post('/api/inventory-category', data);
};

export const updateInventoryCategory = (icId, data) => {
  return api.put('/api/inventory-category', { icId, ...data });
};

export const deleteInventoryCategory = (icId) => {
  return api.delete('/api/inventory-category', { params: { icId } });
}; 