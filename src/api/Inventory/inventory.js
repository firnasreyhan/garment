import api from '../axios';

export const getInventories = ({ pageLimit, pageNumber, search = '', orderBy = '', ordering = '', filterIcId, filterIsId }) => {
  const params = {};
  
  if (pageLimit !== undefined && pageLimit !== null) {
    params.pageLimit = pageLimit;
  }
  if (pageNumber !== undefined && pageNumber !== null) {
    params.pageNumber = pageNumber;
  }
  if (search) params.search = search;
  if (orderBy) params.orderBy = orderBy;
  if (ordering) params.ordering = ordering;
  if (filterIcId) params.filterIcId = filterIcId;
  if (filterIsId) params.filterIsId = filterIsId;
  
  return api.get('/api/inventory', { params });
};

export const getInventoryDetail = () => {
  return api.get('/api/inventory', { params: { pageLimit: -1 } });
};

export const createInventory = (data) => {
  return api.post('/api/inventory', data);
};

export const updateInventory = (iId, data) => {
  return api.put('/api/inventory', { iId, ...data });
};

export const deleteInventory = (iId) => {
  return api.delete('/api/inventory', { params: { iId } });
}; 