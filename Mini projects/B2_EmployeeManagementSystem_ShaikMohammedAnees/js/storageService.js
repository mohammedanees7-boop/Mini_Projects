// storageService.js — In-memory data store interface. All data access flows through here.

const storageService = (() => {
  let employees = initialEmployees.map(e => ({ ...e }));
  let adminCredentials = { ...initialAdmin };

  return {
    getAll() {
      return employees.map(e => ({ ...e }));
    },
    getById(id) {
      const emp = employees.find(e => e.id === id);
      return emp ? { ...emp } : null;
    },
    add(employee) {
      employees.push({ ...employee });
    },
    update(id, data) {
      const idx = employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        employees[idx] = { ...employees[idx], ...data };
        return true;
      }
      return false;
    },
    remove(id) {
      const idx = employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        employees.splice(idx, 1);
        return true;
      }
      return false;
    },
    nextId() {
      if (employees.length === 0) return 1;
      return Math.max(...employees.map(e => e.id)) + 1;
    },
    getAdminCredentials() {
      return { ...adminCredentials };
    },
    addAdmin(username, password) {
      adminCredentials = { username, password };
    }
  };
})();
