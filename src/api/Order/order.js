import api from '../axios';

/**
 * Get all orders with pagination, search, and filters
 * @param {Object} params - Query parameters for filtering orders
 * @returns {Promise} API response containing orders data
 */
export const getOrders = async (params) => {
  try {
    console.log('API Request params:', params);
    const response = await api.get('/api/order', {
      params,
      paramsSerializer: params => {
        return Object.entries(params)
          .filter(([, value]) => value !== null && value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get single order detail
 * @param {string|number} oId - Order ID
 * @returns {Promise} API response containing order detail
 */
export const getOrderDetail = async (oId) => {
  try {
    const response = await api.get(`/api/order/detail`, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

/**
 * Create new order
 * @param {Object} data - Order data to be created
 * @returns {Promise} API response containing created order
 */
export const createOrder = async (data) => {
  try {
    const response = await api.post('/api/order', data);
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Upload mockup image for order
 * @param {File} file - Image file to be uploaded
 * @returns {Promise} API response containing uploaded image URL
 */
export const uploadOrderMockupImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/order/upload-mockup-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading mockup image:', error);
    throw error;
  }
};

export const lockProgress = async (oId) => {
  try {
    const response = await api.put('/api/order/lock-progress', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error lock progress:', error);
    throw error;
  }
};

export const unlockProgress = async (oId) => {
  try {
    const response = await api.put('/api/order/unlock-progress', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error lock progress:', error);
    throw error;
  }
};

export const generateReportOrder = async (oId) => {
  try {
    const response = await api.post('/api/order/generate-report', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error generate report:', error);
    throw error;
  }
};

/**
 * Approve order
 * @param {string|number} oId - Order ID to approve
 * @returns {Promise} API response
 */
export const approveOrder = async (oId) => {
  try {
    const response = await api.put('/api/order/approve', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error approving order:', error);
    throw error;
  }
};

/**
 * Update order price
 * @param {Object} data - Price update data
 * @returns {Promise} API response
 */
export const updateOrderPrice = async (data) => {
  try {
    const response = await api.put('/api/order/update-price', data);
    return response;
  } catch (error) {
    console.error('Error updating order price:', error);
    throw error;
  }
};

/**
 * Mark order as done
 * @param {string|number} oId - Order ID to mark as done
 * @returns {Promise} API response
 */
export const markOrderDone = async (oId) => {
  try {
    const response = await api.put('/api/order/done', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error marking order as done:', error);
    throw error;
  }
};

/**
 * Reject order
 * @param {string|number} oId - Order ID to reject
 * @param {string} oApprovalNotes - Reason for rejection
 * @returns {Promise} API response
 */
export const rejectOrder = async (oId, oApprovalNotes) => {
  try {
    const response = await api.put('/api/order/reject', null, { params: { oId, oApprovalNotes } });
    return response;
  } catch (error) {
    console.error('Error rejecting order:', error);
    throw error;
  }
};

/**
 * Set order to down payment status
 * @param {string|number} oId - Order ID
 * @returns {Promise} API response
 */
export const setOrderDownPayment = async (oId) => {
  try {
    const response = await api.put('/api/order/down-payment', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error setting order to down payment:', error);
    throw error;
  }
};

/**
 * Set order to settlement status
 * @param {string|number} oId - Order ID
 * @returns {Promise} API response
 */
export const setOrderSettlement = async (oId) => {
  try {
    const response = await api.put('/api/order/settlement', null, { params: { oId } });
    return response;
  } catch (error) {
    console.error('Error setting order to settlement:', error);
    throw error;
  }
};

// ========== RAB (ORDER COST BUDGET PLAN) FUNCTIONS ==========

// Operational services are included in RAB response

// Get order cost budget plan detail
export const getOrderCostBudgetPlanDetail = (ocbpId) => {
  return api.get('/order-cost-budget-plan/detail', { params: { ocbpId } });
};

// Update order cost budget plan (batch)
export const updateOrderCostBudgetPlan = (data) => {
  return api.put('/order-cost-budget-plan', data);
};

// Get order cost budget plan summary
export const getOrderCostBudgetPlanSummary = (oId) => {
  return api.get('/order-cost-budget-plan-summary/detail', { params: { oId } });
};

// Update order cost budget plan summary percentage settings
export const updateOrderCostBudgetPlanSummaryPercentage = (data) => {
  return api.put('/order-cost-budget-plan-summary/setting-percentage', data);
};

// ========== ORDER ITEM AND SIZE FUNCTIONS ==========

// Get order item sizes
export const getOrderItemSizes = (filterOId) => {
  return api.get('/api/order-item-size', { params: { filterOId } });
};

// ========== ORDER PROGRESS FUNCTIONS ==========

// Get order progress main by order ID (READ ONLY - no create/update/delete available)
export const getOrderProgressMain = (filterOId) => {
  return api.get('/api/order-progress-main', { params: { filterOId } });
};

// Get order progress main detail (READ ONLY)
export const getOrderProgressMainDetail = (opmId) => {
  return api.get('/api/order-progress-main/detail', { params: { opmId } });
};

// Get order progress by progress main ID
export const getOrderProgressByMain = (filterOpmId) => {
  return api.get('/api/order-progress', { params: { filterOpmId } });
};

// Get order progress detail
export const getOrderProgressDetail = (opId) => {
  return api.get('/api/order-progress/detail', { params: { opId } });
};

// Get order progress detail items by progress ID
export const getOrderProgressDetailItems = (filterOpId) => {
  return api.get('/api/order-progress-detail', { params: { filterOpId } });
};

// Get single order progress detail item
export const getOrderProgressDetailItem = (opdId) => {
  return api.get('/api/order-progress-detail/detail', { params: { opdId } });
};

// Create order progress (batch)
export const createOrderProgress = async (data) => {
  console.log('Creating order progress with data:', data);
  try {
    // Format data sesuai dengan API example
    const formattedData = {
      opmId: parseInt(data.opmId),
      opItems: data.opItems.map(item => ({
        oisId: parseInt(item.oisId),
        uId: item.uId,
        opAmount: parseInt(item.opAmount),
        opFee: parseInt(item.opFee),
        // Format datetime sesuai dengan example (dengan Z di akhir)
        opDeadlineAt: item.opDeadlineAt.endsWith('Z') ?
          item.opDeadlineAt :
          new Date(item.opDeadlineAt).toISOString()
      }))
    };

    console.log('Formatted data:', formattedData);

    const response = await api.post('/api/order-progress', formattedData);

    if (response?.data?.status === 'error' || response?.status === 500) {
      throw new Error(response?.data?.remark || 'Failed to create progress');
    }

    console.log('Order progress created:', response);
    return response;
  } catch (error) {
    console.error('Error creating order progress:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Delete order progress
export const deleteOrderProgress = (opId) => {
  return api.delete('/api/order-progress', { params: { opId } });
};

// Create order progress detail (finished items) - batch
export const createOrderProgressDetail = (data) => {
  return api.post('/api/order-progress-detail', data);
};

// Update order progress detail - batch
export const updateOrderProgressDetail = (data) => {
  return api.put('/api/order-progress-detail', data);
};

// Delete order progress detail
export const deleteOrderProgressDetail = (opdId) => {
  return api.delete('/api/order-progress-detail', { params: { opdId } });
};

// ========== UTILITY FUNCTIONS FOR DROPDOWNS ==========

// Get all users for dropdown
export const getUsers = () => {
  return api.get('/user', {
    params: {
      pageLimit: 1000,
      pageNumber: 1
    }
  });
};

// Get catalogue products for dropdown
export const getCatalogueProducts = () => {
  return api.get('/api/catalogue-product', {
    params: {
      pageLimit: 1000,
      pageNumber: 1
    }
  });
};

// Get inventory stocks for dropdown
export const getInventoryStocks = () => {
  return api.get('/api/inventory', {
    params: {
      pageLimit: 1000,
      pageNumber: 1
    }
  });
};

export const getInventorySubcategories = () => {
  return api.get('/api/inventory-subcategory', {
    params: {
      pageLimit: 1000,
      pageNumber: 1,
    }
  })
}

// Get sizes for dropdown
export const getSizes = () => {
  return api.get('/api/size', {
    params: {
      pageLimit: 1000,
      pageNumber: 1
    }
  });
};

// End of API functions