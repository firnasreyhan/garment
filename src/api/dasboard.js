import api from "./axios";

export const getDashboardDataAuto = (params) => {
  return api.get("/api/dashboard/get-auto", { params });
};

export const getDashboardRankUserOrderData = (params) => {
  return api.get("/api/dashboard/rank-user-order", { params });
};

export const getCatalogueCategoryResume = (params) => {
  return api.get("/api/dashboard/get-catalogue-category-resume", { params });
};
