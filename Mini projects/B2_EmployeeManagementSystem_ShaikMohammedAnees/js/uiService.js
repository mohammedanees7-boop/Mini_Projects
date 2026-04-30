// uiService.js — All DOM rendering and UI feedback. No business logic.

const uiService = (() => {
  const deptClass = {
    Engineering: 'db-engineering',
    Marketing:   'db-marketing',
    HR:          'db-hr',
    Finance:     'db-finance',
    Operations:  'db-operations'
  };

  const deptBarClass = {
    Engineering: 'bar-engineering',
    Marketing:   'bar-marketing',
    HR:          'bar-hr',
    Finance:     'bar-finance',
    Operations:  'bar-operations'
  };

  const avatarClasses = ['av-v','av-a','av-e','av-r','av-o','av-p'];

  function initials(f, l) { return (f[0] + l[0]).toUpperCase(); }
  function avatarCls(f)   { return avatarClasses[f.charCodeAt(0) % avatarClasses.length]; }
  function fmtSalary(s)   { return '₹' + Number(s).toLocaleString('en-IN'); }
  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }
  function deptBadge(dept) {
    return `<span class="dept-badge ${deptClass[dept] || ''}">${dept}</span>`;
  }
  function statusBadge(s) {
    return s === 'Active'
      ? `<span class="status-badge sb-active">Active</span>`
      : `<span class="status-badge sb-inactive">Inactive</span>`;
  }

  return {
    renderEmployeeTable(employees) {
      const tbody = $('#employeeTableBody');
      tbody.empty();
      if (!employees || employees.length === 0) {
        tbody.html(`<tr><td colspan="10" style="text-align:center;padding:3rem 1rem;color:var(--text-3)">
          <i class="bi bi-search" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3"></i>
          No employees match your search criteria.
        </td></tr>`);
        return;
      }
      employees.forEach((emp, idx) => {
        const ini = initials(emp.firstName, emp.lastName);
        const av  = avatarCls(emp.firstName);
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
                <button class="ab ab-edit btn-edit" data-id="${emp.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="ab ab-delete btn-delete" data-id="${emp.id}" title="Delete"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>`);
      });
    },

    renderDashboardCards(summary) {
      $('#totalEmployees').text(summary.total);
      $('#activeEmployees').text(summary.active);
      $('#inactiveEmployees').text(summary.inactive);
      $('#totalDepartments').text(summary.departments);
    },

    renderDepartmentBreakdown(breakdown) {
      const container = $('#deptBreakdown');
      container.empty();
      const total = Object.values(breakdown).reduce((a,b) => a+b, 0);
      ['Engineering','Marketing','HR','Finance','Operations'].forEach(dept => {
        const count = breakdown[dept] || 0;
        const pct   = total > 0 ? Math.round((count/total)*100) : 0;
        const bc    = deptBarClass[dept] || 'bar-engineering';
        container.append(`
          <div class="dept-row">
            <div class="dept-row-top">
              ${deptBadge(dept)}
              <span><span class="dept-count">${count}</span><span class="dept-pct">(${pct}%)</span></span>
            </div>
            <div class="dept-bar-track">
              <div class="dept-bar-fill ${bc}" style="width:${pct}%"></div>
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
      $('#viewModalAvatar').attr('class', `emp-avatar ${av}`).css({width:'72px',height:'72px',borderRadius:'18px',margin:'0 auto 0.75rem',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontWeight:'800',color:'white',fontSize:'1.35rem'}).text(ini);
      $('#viewModalName').html(`<div style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:var(--text-1);margin-bottom:0.5rem">${employee.firstName} ${employee.lastName}</div>`);
      $('#viewModalDept').attr('class', `dept-badge ${deptClass[employee.department] || ''}`).text(employee.department);
      $('#viewEmail').text(employee.email);
      $('#viewPhone').text(employee.phone);
      $('#viewDesignation').text(employee.designation);
      $('#viewSalary').html(`<span class="dval-salary">${fmtSalary(employee.salary)}</span>`);
      $('#viewJoinDate').text(fmtDate(employee.joinDate));
      $('#viewStatus').html(statusBadge(employee.status));
      new bootstrap.Modal(document.getElementById('viewEmployeeModal')).show();
    },

    showAddEditModal(employee = null) {
      this.clearForm();
      if (employee) {
        $('#empModalTitle').text('Edit Employee');
        $('#empModalSubmitBtn').text('Update Employee');
        $('#editEmployeeId').val(employee.id);
        $('#empFirstName').val(employee.firstName);
        $('#empLastName').val(employee.lastName);
        $('#empEmail').val(employee.email);
        $('#empPhone').val(employee.phone);
        $('#empDepartment').val(employee.department);
        $('#empDesignation').val(employee.designation);
        $('#empSalary').val(employee.salary);
        $('#empJoinDate').val(employee.joinDate);
        $('#empStatus').val(employee.status);
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
      const el = $(`<div class="toast-custom toast-${type}" role="alert"><i class="bi ${icons[type] || icons.success}"></i><span>${message}</span></div>`);
      $('#toastContainer').append(el);
      el.css({ opacity:0, transform:'translateX(110%)' });
      setTimeout(() => el.css({ opacity:1, transform:'translateX(0)', transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }), 10);
      setTimeout(() => {
        el.css({ opacity:0, transform:'translateX(110%)' });
        setTimeout(() => el.remove(), 400);
      }, 3500);
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
      $('.auth-input, .form-control').removeClass('is-invalid');
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

    updateEmployeeCount(total, shown) {
      $('#employeeCountText').text(`Showing ${shown} of ${total}`);
    },

    populateDepartmentFilter() {
      const depts = employeeService.getUniqueDepartments();
      const select = $('#deptFilter');
      select.find('option:not(:first)').remove();
      depts.forEach(d => select.append(`<option value="${d}">${d}</option>`));
    }
  };
})();
