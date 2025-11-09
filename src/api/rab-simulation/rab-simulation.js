import api from "../axios";

export const getDummyOrderCostBudgetPlanSummaryList = () => {
  return api.get('/dummy-order-cost-budget-plan-summary');
}

export const getDummyOrderCostBudgetPlanSummaryDetail = (docbpsId) => {
  return api.get('/dummy-order-cost-budget-plan-summary/detail', { params: { docbpsId } });
}

export const deleteDummyOrderCostBudgetPlanSummary = (docbpsId) => {
  return api.delete('/dummy-order-cost-budget-plan-summary', { params: { docbpsId } });
}

export const createDummyOrderCostBudgetPlanSummary = () => {
  return api.post('/dummy-order-cost-budget-plan-summary');
}

export const createDummyOrderCostBudgetPlan = (data) => {
  return api.post('/dummy-order-cost-budget-plan', data);
}

export const updateDummyOrderCostBudgetPlan = (data) => {
  return api.put('/dummy-order-cost-budget-plan', data);
}

export const deleteDummyOrderCostBudgetPlanByDocbpId = (docbpId) => {
  return api.delete(`/dummy-order-cost-budget-plan`, {data: {docbpId}});
}

export const updateDummyOrderCostBudgetPlanSummarySettingPercentage = (data) => {
  return api.put('/dummy-order-cost-budget-plan-summary/setting-percentage', data);
}