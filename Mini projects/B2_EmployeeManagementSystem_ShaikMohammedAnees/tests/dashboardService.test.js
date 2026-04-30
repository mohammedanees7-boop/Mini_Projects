// tests/dashboardService.test.js

const testData = [
  { id: 1, firstName: 'Priya',  lastName: 'Prabhu',  department: 'Engineering', status: 'Active'   },
  { id: 2, firstName: 'Arjun',  lastName: 'Sharma',  department: 'Marketing',   status: 'Active'   },
  { id: 3, firstName: 'Neha',   lastName: 'Kapoor',  department: 'HR',          status: 'Inactive' },
  { id: 4, firstName: 'Rahul',  lastName: 'Verma',   department: 'Finance',     status: 'Active'   },
  { id: 5, firstName: 'Sneha',  lastName: 'Prasad',  department: 'Operations',  status: 'Active'   },
  { id: 6, firstName: 'Vikram', lastName: 'Raj',     department: 'Engineering', status: 'Inactive' },
  { id: 7, firstName: 'Ananya', lastName: 'Singh',   department: 'Marketing',   status: 'Active'   }
];

// Mock employeeService
const employeeService = {
  getAll: () => testData.map(e => ({ ...e }))
};

// Recreate dashboardService
const dashboardService = (() => ({
  getSummary() {
    const all = employeeService.getAll();
    return {
      total: all.length,
      active: all.filter(e => e.status === 'Active').length,
      inactive: all.filter(e => e.status === 'Inactive').length,
      departments: new Set(all.map(e => e.department)).size
    };
  },
  getDepartmentBreakdown() {
    const all = employeeService.getAll();
    const breakdown = {};
    all.forEach(e => { breakdown[e.department] = (breakdown[e.department] || 0) + 1; });
    return breakdown;
  },
  getRecentEmployees(n = 5) {
    return employeeService.getAll().sort((a, b) => b.id - a.id).slice(0, n);
  }
}))();

describe('dashboardService — getSummary', () => {
  test('total count is correct', () => {
    expect(dashboardService.getSummary().total).toBe(7);
  });
  test('active count is correct', () => {
    expect(dashboardService.getSummary().active).toBe(5);
  });
  test('inactive count is correct', () => {
    expect(dashboardService.getSummary().inactive).toBe(2);
  });
  test('department count is correct', () => {
    expect(dashboardService.getSummary().departments).toBe(5);
  });
});

describe('dashboardService — getDepartmentBreakdown', () => {
  test('Engineering has 2 employees', () => {
    expect(dashboardService.getDepartmentBreakdown()['Engineering']).toBe(2);
  });
  test('Marketing has 2 employees', () => {
    expect(dashboardService.getDepartmentBreakdown()['Marketing']).toBe(2);
  });
  test('HR has 1 employee', () => {
    expect(dashboardService.getDepartmentBreakdown()['HR']).toBe(1);
  });
  test('All 5 departments present', () => {
    const keys = Object.keys(dashboardService.getDepartmentBreakdown());
    expect(keys).toHaveLength(5);
  });
});

describe('dashboardService — getRecentEmployees', () => {
  test('returns last n employees by id', () => {
    const recent = dashboardService.getRecentEmployees(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].id).toBe(7);
    expect(recent[1].id).toBe(6);
    expect(recent[2].id).toBe(5);
  });
  test('default n=5 returns 5', () => {
    expect(dashboardService.getRecentEmployees()).toHaveLength(5);
  });
  test('returns all when n > total', () => {
    expect(dashboardService.getRecentEmployees(20)).toHaveLength(7);
  });
});
