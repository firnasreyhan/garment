import api from "../axios";

const OPERATIONAL_UTILITY_TEMPLATE_ENDPOINT = '/api/operational-utility';

export const getOperationalUtilityTemplateList = ({
  pageLimit,
  pageNumber,
  search,
  orderBy,
  ordering,
} = {
  pageLimit: 1,
  pageNumber: 1,
  search: "",
}) => {
  return api.get(OPERATIONAL_UTILITY_TEMPLATE_ENDPOINT, {
    params: {
      pageLimit,
      pageNumber,
      search,
      orderBy,
      ordering
    }
  });
};

export const getOperationalUtilityTemplateDetail = (outId) => {
  return api.get(`${OPERATIONAL_UTILITY_TEMPLATE_ENDPOINT}/detail`, { params: { outId } });
};

export const createOperationalUtilityTemplate = (payload) => {
  return api.post(OPERATIONAL_UTILITY_TEMPLATE_ENDPOINT, payload);
};

export const updateOperationalUtilityTemplate = (payload) => {
  return api.put(`${OPERATIONAL_UTILITY_TEMPLATE_ENDPOINT}`, payload);
};

export const deleteOperationalUtilityTemplate = (outId) => {
  return api.delete(`${OPERATIONAL_UTILITY_TEMPLATE_ENDPOINT}`, {
    params: { outId }
  });
};
