// dashboardService.js — Single API call returns all dashboard data from server.

const dashboardService = (() => {
  return {
    async getSummary() {
      return storageService.getDashboard();
    }
  };
})();
