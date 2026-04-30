// app.js — Entry point and event orchestrator. Full async/await with pagination state.

$(document).ready(function () {

  const _state = {
    page:    1,
    pageSize: PAGE_SIZE,
    search:  '',
    dept:    '',
    status:  '',
    sortBy:  'name',
    sortDir: 'asc'
  };

  let _searchTimer = null;

  // ── View Management ────────────────────────────────────────────────────────
  function showView(view) {
    $('#authSection, #appSection').hide();
    $('#loginView, #signupView').hide();

    if (view === 'login') {
      $('#authSection').show(); $('#loginView').show();
    } else if (view === 'signup') {
      $('#authSection').show(); $('#signupView').show();
    } else {
      if (!authService.isLoggedIn()) { showView('login'); return; }
      $('#appSection').show();
      $('#navbarUser').text(authService.getCurrentUser());
      uiService.applyRoleUI();

      if (view === 'dashboard') {
        $('#dashboardSection').show(); $('#employeeSection').hide();
        $('#navDashboard').addClass('active'); $('#navEmployees').removeClass('active');
        loadDashboard();
      } else {
        $('#dashboardSection').hide(); $('#employeeSection').show();
        $('#navEmployees').addClass('active'); $('#navDashboard').removeClass('active');
        _state.page = 1;
        loadEmployees();
      }
    }
  }

  // ── Load dashboard ─────────────────────────────────────────────────────────
  async function loadDashboard() {
    try {
      const data = await dashboardService.getSummary();
      uiService.renderDashboardCards(data);
      uiService.renderDepartmentBreakdown(data.departmentBreakdown);
      uiService.renderRecentEmployees(data.recentEmployees);
    } catch (err) {
      uiService.showToast('Could not load dashboard. Is the API running?', 'error');
    }
  }

  // ── Load employees ─────────────────────────────────────────────────────────
  async function loadEmployees() {
    uiService.showLoading();
    try {
      const result = await employeeService.getAll({
        search:     _state.search,
        department: _state.dept,
        status:     _state.status,
        sortBy:     _state.sortBy,
        sortDir:    _state.sortDir,
        page:       _state.page,
        pageSize:   _state.pageSize
      });

      uiService.renderEmployeeTable(result);
      uiService.renderPagination(result, (newPage) => {
        _state.page = newPage;
        loadEmployees();
      });

      if (result) {
        const start = (result.page - 1) * result.pageSize + 1;
        const end   = Math.min(result.page * result.pageSize, result.totalCount);
        $('#employeeCountText').text(
          result.totalCount === 0 ? 'No employees found' : `Showing ${start}–${end} of ${result.totalCount} employees`
        );
      }
    } catch (err) {
      uiService.showToast('Could not load employees. Is the API running?', 'error');
      uiService.renderEmployeeTable({ data: [] });
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  authService.isLoggedIn() ? showView('dashboard') : showView('login');

  // ── Auth events ────────────────────────────────────────────────────────────
  $('#showSignupLink').on('click', e => { e.preventDefault(); showView('signup'); });
  $('#showLoginLink') .on('click', e => { e.preventDefault(); showView('login');  });

  $('#loginForm').on('submit', async function (e) {
    e.preventDefault();
    const data = { username: $('#loginUsername').val().trim(), password: $('#loginPassword').val() };
    const errs = validationService.validateAuthForm(data, false);
    if (Object.keys(errs).length) { uiService.showAuthErrors(errs, 'login'); return; }

    const $btn = $(this).find('button[type=submit]').prop('disabled', true).text('Signing in…');
    const res  = await authService.login(data.username, data.password);
    $btn.prop('disabled', false).html('<i class="bi bi-box-arrow-in-right me-2"></i>Sign In');

    if (res.success) {
      showView('dashboard');
      uiService.showToast('Welcome back, ' + data.username + '!', 'success');
    } else {
      $('#loginGlobalError').text(res.error).removeClass('d-none');
    }
  });

  $('#signupForm').on('submit', async function (e) {
    e.preventDefault();
    const data = {
      username:        $('#signupUsername').val().trim(),
      password:        $('#signupPassword').val(),
      confirmPassword: $('#signupConfirmPassword').val()
    };
    const errs = validationService.validateAuthForm(data, true);
    if (Object.keys(errs).length) { uiService.showAuthErrors(errs, 'signup'); return; }

    const role = $('#signupRole').val() || 'Viewer';
    const $btn = $(this).find('button[type=submit]').prop('disabled', true).text('Creating…');
    const res  = await authService.signup(data.username, data.password, role);
    $btn.prop('disabled', false).html('<i class="bi bi-person-plus me-2"></i>Create Account');

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

  // ── Navbar ─────────────────────────────────────────────────────────────────
  $('#navDashboard').on('click', e => { e.preventDefault(); showView('dashboard'); });
  $('#navEmployees').on('click', e => { e.preventDefault(); showView('employees'); });

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

  // ── Search (debounced 350ms) ───────────────────────────────────────────────
  $('#searchInput').on('input', function () {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      _state.search = $(this).val().trim();
      _state.page   = 1;
      loadEmployees();
    }, 350);
  });

  // ── Department filter ──────────────────────────────────────────────────────
  $('#deptFilter').on('change', function () {
    _state.dept = $(this).val() === 'all' ? '' : $(this).val();
    _state.page = 1;
    loadEmployees();
  });

  // ── Status filter ──────────────────────────────────────────────────────────
  $('#statusFilter').on('click', 'button', function () {
    $('#statusFilter button').removeClass('active');
    $(this).addClass('active');
    const val    = $(this).data('status');
    _state.status = (val === 'all') ? '' : val;
    _state.page   = 1;
    loadEmployees();
  });

  // ── Sort ───────────────────────────────────────────────────────────────────
  $(document).on('click', '.sortable-col', function () {
    const field = $(this).data('sort');
    if (_state.sortBy === field) {
      _state.sortDir = _state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      _state.sortBy  = field;
      _state.sortDir = 'asc';
    }
    _state.page = 1;
    $('.sort-icon').text('↕');
    $(this).find('.sort-icon').text(_state.sortDir === 'asc' ? '↑' : '↓');
    loadEmployees();
  });

  // ── View ───────────────────────────────────────────────────────────────────
  $(document).on('click', '.btn-view', async function () {
    try {
      const emp = await employeeService.getById(parseInt($(this).data('id')));
      if (emp) uiService.showViewModal(emp);
    } catch (err) { uiService.showToast('Could not load employee.', 'error'); }
  });

  // ── Edit ───────────────────────────────────────────────────────────────────
  $(document).on('click', '.btn-edit', async function () {
    try {
      const emp = await employeeService.getById(parseInt($(this).data('id')));
      if (emp) uiService.showAddEditModal(emp);
    } catch (err) { uiService.showToast('Could not load employee.', 'error'); }
  });

  // ── Delete ─────────────────────────────────────────────────────────────────
  $(document).on('click', '.btn-delete', async function () {
    try {
      const emp = await employeeService.getById(parseInt($(this).data('id')));
      if (emp) uiService.showDeleteModal(emp);
    } catch (err) { uiService.showToast('Could not load employee.', 'error'); }
  });

  $('#confirmDeleteBtn').on('click', async function () {
    const id = parseInt($(this).data('id'));
    try {
      await employeeService.remove(id);
      bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
      uiService.showToast('Employee removed successfully.', 'error');
      if (_state.page > 1) _state.page--;
      loadEmployees();
      loadDashboard();
    } catch (err) { uiService.showToast('Delete failed: ' + err.message, 'error'); }
  });

  // ── Save / Update ──────────────────────────────────────────────────────────
  $('#empModalSubmitBtn').on('click', async function () {
    const editId = $('#editEmployeeId').val();
    const data   = {
      firstName:   $('#empFirstName') .val().trim(),
      lastName:    $('#empLastName')  .val().trim(),
      email:       $('#empEmail')     .val().trim(),
      phone:       $('#empPhone')     .val().trim(),
      department:  $('#empDepartment').val(),
      designation: $('#empDesignation').val().trim(),
      salary:      $('#empSalary')    .val().trim(),
      joinDate:    $('#empJoinDate')  .val(),
      status:      $('#empStatus')    .val()
    };

    const clientErrs = validationService.validateEmployeeForm(data);
    if (Object.keys(clientErrs).length) { uiService.showInlineErrors(clientErrs); return; }

    const payload = { ...data, salary: Number(data.salary) };
    const $btn    = $(this).prop('disabled', true).text('Saving…');

    try {
      if (editId) {
        await employeeService.update(parseInt(editId), payload);
        uiService.showToast(`${data.firstName} ${data.lastName} updated successfully.`, 'success');
      } else {
        await employeeService.add(payload);
        uiService.showToast(`${data.firstName} ${data.lastName} added successfully.`, 'success');
      }
      bootstrap.Modal.getInstance(document.getElementById('addEditEmployeeModal')).hide();
      uiService.clearForm();
      _state.page = 1;
      loadEmployees();
      loadDashboard();
    } catch (err) {
      if (err.status === 409) {
        uiService.showInlineErrors(validationService.mapServerErrors(err));
      } else {
        uiService.showToast('Save failed: ' + err.message, 'error');
      }
    } finally {
      $btn.prop('disabled', false).text(editId ? 'Update Employee' : 'Save Employee');
    }
  });
});
