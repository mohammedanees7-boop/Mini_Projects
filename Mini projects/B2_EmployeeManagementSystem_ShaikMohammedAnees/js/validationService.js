// validationService.js — All client-side validation. Returns field-level error objects. No DOM ops.

const validationService = (() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return {
    validateEmployeeForm(data, editId = null) {
      const errors = {};
      if (!data.firstName || data.firstName.trim() === '') errors.firstName = 'First name is required.';
      if (!data.lastName || data.lastName.trim() === '') errors.lastName = 'Last name is required.';

      if (!data.email || data.email.trim() === '') {
        errors.email = 'Email is required.';
      } else if (!emailRegex.test(data.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      } else if (employeeService.emailExists(data.email.trim(), editId)) {
        errors.email = 'This email is already registered.';
      }

      if (!data.phone || data.phone.trim() === '') {
        errors.phone = 'Phone number is required.';
      } else if (!/^\d{10}$/.test(data.phone.trim())) {
        errors.phone = 'Phone must be exactly 10 digits.';
      }

      if (!data.department || data.department === '') errors.department = 'Department is required.';
      if (!data.designation || data.designation.trim() === '') errors.designation = 'Designation is required.';

      if (!data.salary || data.salary === '') {
        errors.salary = 'Salary is required.';
      } else if (isNaN(Number(data.salary)) || Number(data.salary) <= 0) {
        errors.salary = 'Salary must be a positive number.';
      }

      if (!data.joinDate || data.joinDate === '') errors.joinDate = 'Join date is required.';
      if (!data.status || data.status === '') errors.status = 'Status is required.';

      return errors;
    },

    validateAuthForm(data, isSignup = false) {
      const errors = {};
      if (!data.username || data.username.trim() === '') errors.username = 'Username is required.';
      if (!data.password || data.password === '') {
        errors.password = 'Password is required.';
      } else if (isSignup && data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }
      if (isSignup) {
        if (!data.confirmPassword || data.confirmPassword === '') {
          errors.confirmPassword = 'Please confirm your password.';
        } else if (data.password !== data.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match.';
        }
      }
      return errors;
    }
  };
})();
