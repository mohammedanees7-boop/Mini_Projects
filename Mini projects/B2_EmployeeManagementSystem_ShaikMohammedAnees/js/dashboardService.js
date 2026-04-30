// dashboardService.js — All dashboard computation logic. No DOM operations.

const dashboardService = (() => {
  return {
    getSummary() {
      const all = employeeService.getAll();
      const active = all.filter(e => e.status === 'Active').length;
      const inactive = all.filter(e => e.status === 'Inactive').length;
      const departments = new Set(all.map(e => e.department)).size;
      return { total: all.length, active, inactive, departments };
    },

    getDepartmentBreakdown() {
      const all = employeeService.getAll();
      const breakdown = {};
      all.forEach(e => {
        breakdown[e.department] = (breakdown[e.department] || 0) + 1;
      });
      return breakdown;
    },

    getRecentEmployees(n = 5) {
      const all = employeeService.getAll();
      return all
        .sort((a, b) => b.id - a.id)
        .slice(0, n);
    }
  };
})();
