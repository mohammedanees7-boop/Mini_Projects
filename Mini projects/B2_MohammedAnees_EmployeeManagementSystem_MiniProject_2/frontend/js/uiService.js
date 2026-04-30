// uiService.js — All DOM rendering. Handles pagination and role-based UI.

const uiService = (() => {
  const deptClass    = { Engineering:'db-engineering', Marketing:'db-marketing', HR:'db-hr', Finance:'db-finance', Operations:'db-operations' };
  const deptBarClass = { Engineering:'bar-engineering', Marketing:'bar-marketing', HR:'bar-hr', Finance:'bar-finance', Operations:'bar-operations' };
  const avatarClasses = ['av-v','av-a','av-e','av-r','av-o','av-p'];

  function initials(f, l) { return (f[0] + l[0]).toUpperCase(); }
  function avatarCls(f)   { return avatarClasses[f.charCodeAt(0) % avatarClasses.length]; }
  function fmtSalary(s)   { return '₹' + Number(s).toLocaleString('en-IN'); }
  function fmtDate(d)     { if (!d) return ''; return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }

  function deptBadge(dept) {
    return `<span class="dept-badge ${deptClass[dept] || ''}">${dept}</span>`;
  }
  function statusBadge(s) {
    return s === 'Active'
      ? `<span class="status-badge sb-active">Active</span>`
      : `<span class="status-badge sb-inactive">Inactive</span>`;
  }

  return {

    renderEmployeeTable(pagedResult) {
      const tbody   = $('#employeeTableBody');
      const isAdmin = authService.isAdmin();
      tbody.empty();

      const employees = pagedResult?.data || [];

      if (!employees || employees.length === 0) {
        tbody.html(`<tr><td colspan="10" style="text-align:center;padding:3rem;color:var(--text-3)">
          <i class="bi bi-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3"></i>
          No employees match your criteria.
        </td></tr>`);
        return;
      }

      employees.forEach((emp, idx) => {
        const ini       = initials(emp.firstName, emp.lastName);
        const av        = avatarCls(emp.firstName);
        const editBtn   = isAdmin ? `<button class="ab ab-edit btn-edit"     data-id="${emp.id}" title="Edit"><i class="bi bi-pencil"></i></button>`   : '';
        const deleteBtn = isAdmin ? `<button class="ab ab-delete btn-delete" data-id="${emp.id}" title="Delete"><i class="bi bi-trash"></i></button>` : '';

        tbody.append(`
          <tr class="${idx % 2 !== 0 ? 'row-alt' : ''}">
            <td><span class="emp-id">#${emp.id}</span></td>
            <td><span class="emp-avatar ${av}">${ini}</span></td>
            <td><strong style="font-size:0.875rem">${emp.firstName} ${emp.lastName}</strong></td>
            <td style="color:var(--text-2);font-size:0.82rem">${emp.email}</td>
            <td>${deptBadge(emp.department)}</td>
            <td style="color:var(--text-2);font-size:0.82rem">${emp.designation}</td>
            <td class="salary-cell">${fmtSalary(emp.salary)}</td>
            <td style="color:var(--text-2);font-size:0.82rem">${fmtDate(emp.joinDate)}</td>
            <td>${statusBadge(emp.status)}</td>
            <td>
              <div class="action-btns">
                <button class="ab ab-view btn-view" data-id="${emp.id}" title="View"><i class="bi bi-eye"></i></button>
                ${editBtn}
                ${deleteBtn}
              </div>
            </td>
          </tr>`);
      });
    },

    renderPagination(pagedResult, onPageChange) {
      const container = $('#paginationBar');
      container.empty();
      if (!pagedResult || pagedResult.totalPages <= 1) return;

      const { page, totalPages, hasPrevPage, hasNextPage } = pagedResult;
      let html = `<nav><ul class="pagination-list">`;

      html += `<li class="page-item">
        <button class="page-btn" data-page="${page - 1}" ${!hasPrevPage ? 'disabled' : ''}>
          <i class="bi bi-chevron-left"></i> Prev
        </button></li>`;

      const delta = 2;
      const startP = Math.max(1, page - delta);
      const endP   = Math.min(totalPages, page + delta);

      if (startP > 1) {
        html += `<li class="page-item"><button class="page-btn" data-page="1">1</button></li>`;
        if (startP > 2) html += `<li class="page-item"><span class="page-ellipsis">…</span></li>`;
      }
      for (let p = startP; p <= endP; p++) {
        html += `<li class="page-item"><button class="page-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button></li>`;
      }
      if (endP < totalPages) {
        if (endP < totalPages - 1) html += `<li class="page-item"><span class="page-ellipsis">…</span></li>`;
        html += `<li class="page-item"><button class="page-btn" data-page="${totalPages}">${totalPages}</button></li>`;
      }

      html += `<li class="page-item">
        <button class="page-btn" data-page="${page + 1}" ${!hasNextPage ? 'disabled' : ''}>
          Next <i class="bi bi-chevron-right"></i>
        </button></li>`;

      html += `</ul></nav>`;
      container.html(html);

      container.find('.page-btn:not([disabled])').on('click', function () {
        const p = parseInt($(this).data('page'));
        if (p >= 1 && p <= totalPages) onPageChange(p);
      });
    },

    applyRoleUI() {
      const isAdmin = authService.isAdmin();
      const role    = authService.getRole();
      if (isAdmin) {
        $('#navAddEmployee, #addEmployeeBtn').show();
        $('#viewerNotice').hide();
      } else {
        $('#navAddEmployee, #addEmployeeBtn').hide();
        $('#viewerNotice').show();
      }
      const badgeClass = isAdmin ? 'role-badge-admin' : 'role-badge-viewer';
      $('#navRoleBadge').text(role).attr('class', `role-badge ${badgeClass}`);
    },

    renderDashboardCards(summary) {
      $('#totalEmployees')   .text(summary.total);
      $('#activeEmployees')  .text(summary.active);
      $('#inactiveEmployees').text(summary.inactive);
      $('#totalDepartments') .text(summary.departments);
    },

    renderDepartmentBreakdown(breakdown) {
      const container = $('#deptBreakdown');
      container.empty();
      if (!breakdown || breakdown.length === 0) return;
      breakdown.forEach(item => {
        const bc = deptBarClass[item.department] || 'bar-engineering';
        container.append(`
          <div class="dept-row">
            <div class="dept-row-top">
              ${deptBadge(item.department)}
              <span><span class="dept-count">${item.count}</span><span class="dept-pct"> (${item.percentage}%)</span></span>
            </div>
            <div class="dept-bar-track">
              <div class="dept-bar-fill ${bc}" style="width:${item.percentage}%"></div>
            </div>
          </div>`);
      });
    },

    renderRecentEmployees(employees) {
      const container = $('#recentEmployeesList');
      container.empty();
      if (!employees || employees.length === 0) {
        container.html('<p style="color:var(--text-3);text-align:center;font-size:0.83rem">No employees yet.</p>');
        return;
      }
      employees.forEach(emp => {
        const ini = initials(emp.firstName, emp.lastName);
        const av  = avatarCls(emp.firstName);
        container.append(`
          <div class="recent-row">
            <span class="emp-avatar ${av}" style="width:36px;height:36px;border-radius:9px;font-size:0.7rem">${ini}</span>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:0.83rem;color:var(--text-1)">${emp.firstName} ${emp.lastName}</div>
              <div style="display:flex;gap:0.4rem;align-items:center;margin-top:3px;flex-wrap:wrap">
                ${deptBadge(emp.department)}
                <span style="color:var(--text-3);font-size:0.7rem">${emp.designation}</span>
              </div>
            </div>
            ${statusBadge(emp.status)}
          </div>`);
      });
    },

    showViewModal(employee) {
      const ini = initials(employee.firstName, employee.lastName);
      const av  = avatarCls(employee.firstName);
      $('#viewModalAvatar')
        .attr('class', `emp-avatar ${av}`)
        .css({ width:'72px', height:'72px', borderRadius:'18px', margin:'0 auto 0.75rem',
               display:'flex', alignItems:'center', justifyContent:'center',
               fontFamily:"'Inter',sans-serif", fontWeight:'700', color:'white', fontSize:'1.35rem' })
        .text(ini);
      $('#viewModalName').html(`<div style="font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text-1);margin-bottom:0.5rem">${employee.firstName} ${employee.lastName}</div>`);
      $('#viewModalDept').attr('class', `dept-badge ${deptClass[employee.department] || ''}`).text(employee.department);
      $('#viewEmail')      .text(employee.email);
      $('#viewPhone')      .text(employee.phone);
      $('#viewDesignation').text(employee.designation);
      $('#viewSalary')     .html(`<span class="dval-salary">${fmtSalary(employee.salary)}</span>`);
      $('#viewJoinDate')   .text(fmtDate(employee.joinDate));
      $('#viewStatus')     .html(statusBadge(employee.status));
      new bootstrap.Modal(document.getElementById('viewEmployeeModal')).show();
    },

    showAddEditModal(employee = null) {
      this.clearForm();
      if (employee) {
        $('#empModalTitle').text('Edit Employee');
        $('#empModalSubmitBtn').text('Update Employee');
        $('#editEmployeeId').val(employee.id);
        $('#empFirstName') .val(employee.firstName);
        $('#empLastName')  .val(employee.lastName);
        $('#empEmail')     .val(employee.email);
        $('#empPhone')     .val(employee.phone);
        $('#empDepartment').val(employee.department);
        $('#empDesignation').val(employee.designation);
        $('#empSalary')    .val(employee.salary);
        $('#empJoinDate')  .val(employee.joinDate ? employee.joinDate.split('T')[0] : '');
        $('#empStatus')    .val(employee.status);
      } else {
        $('#empModalTitle').text('Add Employee');
        $('#empModalSubmitBtn').text('Save Employee');
        $('#editEmployeeId').val('');
      }
      new bootstrap.Modal(document.getElementById('addEditEmployeeModal')).show();
    },

    showDeleteModal(employee) {
      $('#deleteEmployeeName').text(employee.firstName + ' ' + employee.lastName);
      $('#confirmDeleteBtn').data('id', employee.id);
      new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
    },

    showToast(message, type = 'success') {
      const icons = { success:'bi-check-circle-fill', error:'bi-x-circle-fill', warning:'bi-exclamation-triangle-fill', info:'bi-info-circle-fill' };
      const el = $(`<div class="toast-custom toast-${type}"><i class="bi ${icons[type] || icons.success}"></i><span>${message}</span></div>`);
      $('#toastContainer').append(el);
      el.css({ opacity:0, transform:'translateX(110%)' });
      setTimeout(() => el.css({ opacity:1, transform:'translateX(0)', transition:'all 0.35s ease' }), 10);
      setTimeout(() => { el.css({ opacity:0, transform:'translateX(110%)' }); setTimeout(() => el.remove(), 400); }, 3500);
    },

    showInlineErrors(errors) {
      $('.field-error').text('').addClass('d-none');
      $('.form-control, .form-select').removeClass('is-invalid');
      Object.keys(errors).forEach(field => {
        const key = field.charAt(0).toUpperCase() + field.slice(1);
        $(`#emp${key}`).addClass('is-invalid');
        $(`#error-${field}`).text(errors[field]).removeClass('d-none');
      });
    },

    showAuthErrors(errors, prefix = '') {
      $('.field-error').text('').addClass('d-none');
      $('.auth-input').removeClass('is-invalid');
      Object.keys(errors).forEach(field => {
        $(`#${prefix}${field}`).addClass('is-invalid');
        $(`#${prefix}error-${field}`).text(errors[field]).removeClass('d-none');
      });
    },

    clearForm() {
      $('#employeeForm')[0].reset();
      $('#editEmployeeId').val('');
      $('.field-error').text('').addClass('d-none');
      $('.form-control, .form-select').removeClass('is-invalid');
    },

    showLoading() {
      $('#employeeTableBody').html(`<tr><td colspan="10" style="text-align:center;padding:2.5rem;color:var(--text-3)">
        <div style="animation:spin 1s linear infinite;display:inline-block;font-size:1.5rem">⟳</div>
        <div style="margin-top:0.5rem">Loading…</div>
      </td></tr>`);
    }
  };
})();
