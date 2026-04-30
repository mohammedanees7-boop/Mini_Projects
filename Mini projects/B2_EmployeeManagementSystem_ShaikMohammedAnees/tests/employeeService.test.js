// tests/employeeService.test.js

// Minimal in-memory stubs to isolate employeeService
const mockEmployees = [
  { id: 1, firstName: 'Priya', lastName: 'Prabhu', email: 'priya@test.com', phone: '9876543210', department: 'Engineering', designation: 'Engineer', salary: 800000, joinDate: '2021-03-15', status: 'Active' },
  { id: 2, firstName: 'Arjun', lastName: 'Sharma', email: 'arjun@test.com', phone: '9123456780', department: 'Marketing', designation: 'Executive', salary: 600000, joinDate: '2020-07-01', status: 'Active' },
  { id: 3, firstName: 'Neha', lastName: 'Kapoor', email: 'neha@test.com', phone: '9988776655', department: 'HR', designation: 'HR Exec', salary: 500000, joinDate: '2019-11-20', status: 'Inactive' }
];

let store;

const storageService = {
  getAll: () => store.map(e => ({ ...e })),
  getById: (id) => { const e = store.find(x => x.id === id); return e ? { ...e } : null; },
  add: (emp) => { store.push({ ...emp }); },
  update: (id, data) => { const i = store.findIndex(x => x.id === id); if (i !== -1) { store[i] = { ...store[i], ...data }; return true; } return false; },
  remove: (id) => { const i = store.findIndex(x => x.id === id); if (i !== -1) { store.splice(i, 1); return true; } return false; },
  nextId: () => store.length === 0 ? 1 : Math.max(...store.map(e => e.id)) + 1
};

// Recreate employeeService with the stub storageService
const employeeService = (() => {
  return {
    getAll: () => storageService.getAll(),
    getById: (id) => storageService.getById(id),
    add: (data) => { const id = storageService.nextId(); const emp = { id, ...data }; storageService.add(emp); return emp; },
    update: (id, data) => storageService.update(id, data),
    remove: (id) => storageService.remove(id),
    search: (query) => {
      if (!query || !query.trim()) return storageService.getAll();
      const q = query.trim().toLowerCase();
      return storageService.getAll().filter(e => (e.firstName + ' ' + e.lastName).toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
    },
    filterByDepartment: (dept) => {
      if (!dept || dept === 'all') return storageService.getAll();
      return storageService.getAll().filter(e => e.department === dept);
    },
    filterByStatus: (status) => {
      if (!status || status === 'all') return storageService.getAll();
      return storageService.getAll().filter(e => e.status === status);
    },
    applyFilters: (search, dept, status) => {
      let r = storageService.getAll();
      if (search && search.trim()) { const q = search.trim().toLowerCase(); r = r.filter(e => (e.firstName + ' ' + e.lastName).toLowerCase().includes(q) || e.email.toLowerCase().includes(q)); }
      if (dept && dept !== 'all') r = r.filter(e => e.department === dept);
      if (status && status !== 'all') r = r.filter(e => e.status === status);
      return r;
    },
    sortBy: (employees, field, direction) => {
      const sorted = [...employees];
      sorted.sort((a, b) => {
        if (field === 'name') return direction === 'asc' ? a.lastName.localeCompare(b.lastName) : b.lastName.localeCompare(a.lastName);
        if (field === 'salary') return direction === 'asc' ? a.salary - b.salary : b.salary - a.salary;
        if (field === 'joinDate') return direction === 'asc' ? new Date(a.joinDate) - new Date(b.joinDate) : new Date(b.joinDate) - new Date(a.joinDate);
        return 0;
      });
      return sorted;
    },
    emailExists: (email, excludeId = null) => storageService.getAll().some(e => e.email.toLowerCase() === email.toLowerCase() && e.id !== excludeId)
  };
})();

beforeEach(() => {
  store = mockEmployees.map(e => ({ ...e }));
});

describe('employeeService — getAll', () => {
  test('returns all employees', () => {
    expect(employeeService.getAll()).toHaveLength(3);
  });
});

describe('employeeService — getById', () => {
  test('returns correct employee by id', () => {
    const emp = employeeService.getById(1);
    expect(emp.firstName).toBe('Priya');
  });
  test('returns null for non-existent id', () => {
    expect(employeeService.getById(999)).toBeNull();
  });
});

describe('employeeService — add', () => {
  test('adds a new employee and auto-increments id', () => {
    const newEmp = { firstName: 'Test', lastName: 'User', email: 'test@test.com', phone: '9000000000', department: 'Finance', designation: 'Analyst', salary: 500000, joinDate: '2024-01-01', status: 'Active' };
    const added = employeeService.add(newEmp);
    expect(added.id).toBe(4);
    expect(employeeService.getAll()).toHaveLength(4);
  });
});

describe('employeeService — update', () => {
  test('updates an existing employee', () => {
    employeeService.update(1, { designation: 'Senior Engineer' });
    expect(employeeService.getById(1).designation).toBe('Senior Engineer');
  });
  test('returns false for non-existent id', () => {
    expect(employeeService.update(999, { designation: 'X' })).toBe(false);
  });
});

describe('employeeService — remove', () => {
  test('removes employee by id', () => {
    employeeService.remove(2);
    expect(employeeService.getAll()).toHaveLength(2);
    expect(employeeService.getById(2)).toBeNull();
  });
  test('returns false for non-existent id', () => {
    expect(employeeService.remove(999)).toBe(false);
  });
});

describe('employeeService — search', () => {
  test('finds by first name', () => {
    expect(employeeService.search('priya')).toHaveLength(1);
  });
  test('finds by email', () => {
    expect(employeeService.search('arjun@test.com')).toHaveLength(1);
  });
  test('is case-insensitive', () => {
    expect(employeeService.search('NEHA')).toHaveLength(1);
  });
  test('empty query returns all', () => {
    expect(employeeService.search('')).toHaveLength(3);
  });
});

describe('employeeService — filterByDepartment', () => {
  test('filters by Engineering', () => {
    expect(employeeService.filterByDepartment('Engineering')).toHaveLength(1);
  });
  test('all returns all', () => {
    expect(employeeService.filterByDepartment('all')).toHaveLength(3);
  });
});

describe('employeeService — filterByStatus', () => {
  test('filters Active employees', () => {
    expect(employeeService.filterByStatus('Active')).toHaveLength(2);
  });
  test('filters Inactive employees', () => {
    expect(employeeService.filterByStatus('Inactive')).toHaveLength(1);
  });
});

describe('employeeService — applyFilters', () => {
  test('combines search and status filter', () => {
    const results = employeeService.applyFilters('priya', 'all', 'Active');
    expect(results).toHaveLength(1);
    expect(results[0].firstName).toBe('Priya');
  });
  test('returns empty when no match', () => {
    expect(employeeService.applyFilters('xyz', 'all', 'all')).toHaveLength(0);
  });
});

describe('employeeService — sortBy', () => {
  test('sorts by salary ascending', () => {
    const all = employeeService.getAll();
    const sorted = employeeService.sortBy(all, 'salary', 'asc');
    expect(sorted[0].salary).toBeLessThanOrEqual(sorted[1].salary);
  });
  test('sorts by name descending', () => {
    const all = employeeService.getAll();
    const sorted = employeeService.sortBy(all, 'name', 'desc');
    expect(sorted[0].lastName >= sorted[1].lastName).toBe(true);
  });
  test('sorts by joinDate newest first', () => {
    const all = employeeService.getAll();
    const sorted = employeeService.sortBy(all, 'joinDate', 'desc');
    expect(new Date(sorted[0].joinDate) >= new Date(sorted[1].joinDate)).toBe(true);
  });
});

describe('employeeService — emailExists', () => {
  test('detects existing email', () => {
    expect(employeeService.emailExists('priya@test.com')).toBe(true);
  });
  test('excludes own id on edit', () => {
    expect(employeeService.emailExists('priya@test.com', 1)).toBe(false);
  });
  test('returns false for new email', () => {
    expect(employeeService.emailExists('brand.new@test.com')).toBe(false);
  });
});
