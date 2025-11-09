import api from '../axios';

export const getWarehouses = ({ pageLimit, pageNumber, search = '', orderBy = '', ordering = '' }) => {
  const params = {};

  if (pageLimit !== undefined && pageLimit !== null && pageLimit !== null) {
    params.pageLimit = pageLimit;
  }
  if (pageNumber !== undefined && pageNumber !== null && pageLimit !== null) {
    params.pageNumber = pageNumber;
  }
  if (search) params.search = search;
  if (orderBy) params.orderBy = orderBy;
  if (ordering) params.ordering = ordering;
  return api.get('/api/inventory-warehouse', { params });
};

export const createWarehouse = (data) => {
  console.log('POST warehouse data:', data);
  return api.post('/api/inventory-warehouse', data);
};

export const updateWarehouse = (iwId, data) => {
  return api.put('/api/inventory-warehouse', { iwId, ...data });
};

export const deleteWarehouse = (iwId) => {
  return api.delete('/api/inventory-warehouse', { params: { iwId } });
}; 