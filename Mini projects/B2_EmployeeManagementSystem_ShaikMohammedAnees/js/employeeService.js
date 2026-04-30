// employeeService.js — All employee business logic. No DOM operations.

const employeeService = (() => {
  return {
    getAll() {
      return storageService.getAll();
    },

    getById(id) {
      return storageService.getById(id);
    },

    add(data) {
      const id = storageService.nextId();
      const employee = { id, ...data };
      storageService.add(employee);
      return employee;
    },

    update(id, data) {
      return storageService.update(id, data);
    },

    remove(id) {
      return storageService.remove(id);
    },

    search(query) {
      if (!query || query.trim() === '') return this.getAll();
      const q = query.trim().toLowerCase();
      return this.getAll().filter(e => {
        const fullName = (e.firstName + ' ' + e.lastName).toLowerCase();
        return fullName.includes(q) || e.email.toLowerCase().includes(q);
      });
    },

    filterByDepartment(dept) {
      if (!dept || dept === 'all') return this.getAll();
      return this.getAll().filter(e => e.department === dept);
    },

    filterByStatus(status) {
      if (!status || status === 'all') return this.getAll();
      return this.getAll().filter(e => e.status === status);
    },

    applyFilters(search, dept, status) {
      let results = this.getAll();
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        results = results.filter(e => {
          const fullName = (e.firstName + ' ' + e.lastName).toLowerCase();
          return fullName.includes(q) || e.email.toLowerCase().includes(q);
        });
      }
      if (dept && dept !== 'all') {
        results = results.filter(e => e.department === dept);
      }
      if (status && status !== 'all') {
        results = results.filter(e => e.status === status);
      }
      return results;
    },

    sortBy(employees, field, direction) {
      const sorted = [...employees];
      sorted.sort((a, b) => {
        let valA, valB;
        if (field === 'name') {
          valA = a.lastName.toLowerCase();
          valB = b.lastName.toLowerCase();
          return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (field === 'salary') {
          valA = a.salary;
          valB = b.salary;
          return direction === 'asc' ? valA - valB : valB - valA;
        } else if (field === 'joinDate') {
          valA = new Date(a.joinDate);
          valB = new Date(b.joinDate);
          return direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
      return sorted;
    },

    getUniqueDepartments() {
      const all = this.getAll();
      return [...new Set(all.map(e => e.department))].sort();
    },

    emailExists(email, excludeId = null) {
      return this.getAll().some(e =>
        e.email.toLowerCase() === email.toLowerCase() && e.id !== excludeId
      );
    }
  };
})();
