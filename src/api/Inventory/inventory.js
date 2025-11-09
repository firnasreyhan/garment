import api from '../axios';

<<<<<<< HEAD
export const getInventories = ({ pageLimit, pageNumber, search = '', orderBy = '', ordering = '', filterIcId, filterIsId, filterIwId }) => {
=======
export const getInventories = ({ pageLimit, pageNumber, search = '', orderBy = '', ordering = '', filterIcId, filterIsId }) => {
>>>>>>> 9c24625fdf49c790ae79b8d6e615c0f5adccfaef
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
<<<<<<< HEAD
  if (filterIwId) params.filterIwId = filterIwId;
=======
>>>>>>> 9c24625fdf49c790ae79b8d6e615c0f5adccfaef
  
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