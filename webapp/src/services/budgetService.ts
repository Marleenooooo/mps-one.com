export const budgetService = {
  getDepartments: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: [] };
  },
  
  getDepartmentBudgets: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: [] };
  },
  
  getBudgetCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: [] };
  }
};