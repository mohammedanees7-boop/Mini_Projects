// app.js — Entry point and event orchestrator. No business logic.

$(document).ready(function () {

  let currentSort    = { field: null, direction: 'asc' };
  let currentFilters = { search: '', dept: 'all', status: 'all' };

  // ─── View Management ─────────────────────────────────────────────────
  function showView(view) {
    $('#authSection, #appSection').hide();
    $('#loginView, #signupView').hide();

    if (view === 'login') {
      $('#authSection').show();
      $('#loginView').show();
    } else if (view === 'signup') {
      $('#authSection').show();
      $('#signupView').show();
    } else {
      if (!authService.isLoggedIn()) { showView('login'); return; }
      $('#appSection').show();

      const user = authService.getCurrentUser();
      $('#navbarUser').text(user);

      if (view === 'dashboard') {
        $('#dashboardSection').show();
        $('#employeeSection').hide();
        $('#navDashboard').addClass('active');
        $('#navEmployees').removeClass('active');
        refreshDashboard();
      } else {
        $('#dashboardSection').hide();
        $('#employeeSection').show();
        $('#navEmployees').addClass('active');
        $('#navDashboard').removeClass('active');
        refreshEmployeeTable();
        uiService.populateDepartmentFilter();
      }
    }
  }

  function refreshDashboard() {
    uiService.renderDashboardCards(dashboardService.getSummary());
    uiService.renderDepartmentBreakdown(dashboardService.getDepartmentBreakdown());
    uiService.renderRecentEmployees(dashboardService.getRecentEmployees(5));
  }

  function refreshEmployeeTable() {
    let emps = employeeService.applyFilters(currentFilters.search, currentFilters.dept, currentFilters.status);
    if (currentSort.field) emps = employeeService.sortBy(emps, currentSort.field, currentSort.direction);
    uiService.renderEmployeeTable(emps);
    uiService.updateEmployeeCount(employeeService.getAll().length, emps.length);
  }

  // ─── Init ─────────────────────────────────────────────────────────────
  authService.isLoggedIn() ? showView('dashboard') : showView('login');

  // ─── Auth ─────────────────────────────────────────────────────────────
  $('#showSignupLink').on('click', e => { e.preventDefault(); showView('signup'); });
  $('#showLoginLink').on('click',  e => { e.preventDefault(); showView('login');  });

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    const data = { username: $('#loginUsername').val().trim(), password: $('#loginPassword').val() };
    const errs = validationService.validateAuthForm(data, false);
    if (Object.keys(errs).length) { uiService.showAuthErrors(errs, 'login'); return; }
    const res = authService.login(data.username, data.password);
    if (res.success) {
      showView('dashboard');
      uiService.showToast('Welcome back, ' + data.username + '!', 'success');
    } else {
      $('#loginGlobalError').text(res.error).removeClass('d-none');
    }
  });

  $('#signupForm').on('submit', function (e) {
    e.preventDefault();
    const data = {
      username:        $('#signupUsername').val().trim(),
      password:        $('#signupPassword').val(),
      confirmPassword: $('#signupConfirmPassword').val()
    };
    const errs = validationService.validateAuthForm(data, true);
    if (Object.keys(errs).length) { uiService.showAuthErrors(errs, 'signup'); return; }
    const res = authService.signup(data.username, data.password);
    if (res.success) {
      uiService.showToast('Account created! Please sign in.', 'success');
      setTimeout(() => showView('login'), 1200);
    } else {
      $('#signupGlobalError').text(res.error).removeClass('d-none');
    }
  });

  $('#loginUsername, #loginPassword').on('input', function () {
    $('#loginGlobalError').addClass('d-none'); $(this).removeClass('is-invalid');
  });
  $('#signupUsername, #signupPassword, #signupConfirmPassword').on('input', function () {
    $('#signupGlobalError').addClass('d-none'); $(this).removeClass('is-invalid');
  });

  // ─── Navbar ───────────────────────────────────────────────────────────
  $('#navDashboard').on('click',                    e => { e.preventDefault(); showView('dashboard'); });
  $('#navEmployees').on('click',                    e => { e.preventDefault(); showView('employees'); });
  $('#navAddEmployee, #addEmployeeBtn').on('click', function () {
    showView('employees');
    uiService.showAddEditModal(null);
  });
  $('#logoutBtn').on('click', function () {
    authService.logout();
    uiService.showToast('Signed out successfully.', 'info');
    setTimeout(() => showView('login'), 700);
  });
  $('#goToEmployeesBtn').on('click', () => showView('employees'));

  // ─── Filters ──────────────────────────────────────────────────────────
  $('#searchInput').on('input', function () {
    currentFilters.search = $(this).val();
    refreshEmployeeTable();
  });
  $('#deptFilter').on('change', function () {
    currentFilters.dept = $(this).val();
    refreshEmployeeTable();
  });
  $('#statusFilter').on('click', 'button', function () {
    $('#statusFilter button').removeClass('active');
    $(this).addClass('active');
    currentFilters.status = $(this).data('status');
    refreshEmployeeTable();
  });
  $(document).on('click', '.sortable-col', function () {
    const field = $(this).data('sort');
    currentSort.direction = (currentSort.field === field && currentSort.direction === 'asc') ? 'desc' : 'asc';
    currentSort.field = field;
    $('.sort-icon').text('↕');
    $(this).find('.sort-icon').text(currentSort.direction === 'asc' ? '↑' : '↓');
    refreshEmployeeTable();
  });

  // ─── CRUD ─────────────────────────────────────────────────────────────
  $(document).on('click', '.btn-view', function () {
    const emp = employeeService.getById(parseInt($(this).data('id')));
    if (emp) uiService.showViewModal(emp);
  });
  $(document).on('click', '.btn-edit', function () {
    const emp = employeeService.getById(parseInt($(this).data('id')));
    if (emp) uiService.showAddEditModal(emp);
  });
  $(document).on('click', '.btn-delete', function () {
    const emp = employeeService.getById(parseInt($(this).data('id')));
    if (emp) uiService.showDeleteModal(emp);
  });

  $('#confirmDeleteBtn').on('click', function () {
    const id   = parseInt($(this).data('id'));
    const emp  = employeeService.getById(id);
    const name = emp ? emp.firstName + ' ' + emp.lastName : 'Employee';
    employeeService.remove(id);
    bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
    refreshEmployeeTable();
    refreshDashboard();
    uiService.populateDepartmentFilter();
    uiService.showToast(`${name} removed successfully.`, 'error');
  });

  $('#empModalSubmitBtn').on('click', function () {
    const editId = $('#editEmployeeId').val();
    const data = {
      firstName:   $('#empFirstName').val().trim(),
      lastName:    $('#empLastName').val().trim(),
      email:       $('#empEmail').val().trim(),
      phone:       $('#empPhone').val().trim(),
      department:  $('#empDepartment').val(),
      designation: $('#empDesignation').val().trim(),
      salary:      $('#empSalary').val().trim(),
      joinDate:    $('#empJoinDate').val(),
      status:      $('#empStatus').val()
    };
    const errs = validationService.validateEmployeeForm(data, editId ? parseInt(editId) : null);
    if (Object.keys(errs).length) { uiService.showInlineErrors(errs); return; }

    const payload = { ...data, salary: Number(data.salary) };
    if (editId) {
      employeeService.update(parseInt(editId), payload);
      uiService.showToast(`${data.firstName} ${data.lastName} updated.`, 'success');
    } else {
      employeeService.add(payload);
      uiService.showToast(`${data.firstName} ${data.lastName} added.`, 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('addEditEmployeeModal')).hide();
    uiService.clearForm();
    refreshEmployeeTable();
    refreshDashboard();
    uiService.populateDepartmentFilter();
  });
});
