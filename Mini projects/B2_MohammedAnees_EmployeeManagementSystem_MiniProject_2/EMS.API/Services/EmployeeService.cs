using EMS.API.DTOs;
using EMS.API.Models;

namespace EMS.API.Services
{
    public class EmployeeService
    {
        private readonly IEmployeeRepository _repo;
        public EmployeeService(IEmployeeRepository repo) { _repo = repo; }

        public Task<PagedResult<EmployeeResponseDto>> GetAllAsync(EmployeeQueryParams q) => _repo.GetAllAsync(q);

        public async Task<EmployeeResponseDto?> GetByIdAsync(int id)
        {
            var emp = await _repo.GetByIdAsync(id);
            if (emp is null) return null;
            return MapToDto(emp);
        }

        public async Task<(EmployeeResponseDto? result, string? error)> CreateAsync(EmployeeRequestDto dto)
        {
            if (await _repo.EmailExistsAsync(dto.Email))
                return (null, "An employee with this email already exists.");

            var emp = new Employee
            {
                FirstName   = dto.FirstName.Trim(),
                LastName    = dto.LastName.Trim(),
                Email       = dto.Email.Trim(),
                Phone       = dto.Phone.Trim(),
                Department  = dto.Department,
                Designation = dto.Designation.Trim(),
                Salary      = dto.Salary,
                JoinDate    = dto.JoinDate.ToUniversalTime(),
                Status      = dto.Status
            };
            var created = await _repo.AddAsync(emp);
            return (MapToDto(created), null);
        }

        public async Task<(EmployeeResponseDto? result, string? error)> UpdateAsync(int id, EmployeeRequestDto dto)
        {
            if (await _repo.EmailExistsAsync(dto.Email, excludeId: id))
                return (null, "An employee with this email already exists.");

            var emp = new Employee
            {
                FirstName   = dto.FirstName.Trim(),
                LastName    = dto.LastName.Trim(),
                Email       = dto.Email.Trim(),
                Phone       = dto.Phone.Trim(),
                Department  = dto.Department,
                Designation = dto.Designation.Trim(),
                Salary      = dto.Salary,
                JoinDate    = dto.JoinDate.ToUniversalTime(),
                Status      = dto.Status
            };
            var updated = await _repo.UpdateAsync(id, emp);
            if (updated is null) return (null, "Employee not found.");
            return (MapToDto(updated), null);
        }

        public Task<bool>             DeleteAsync(int id)    => _repo.DeleteAsync(id);
        public Task<DashboardSummaryDto> GetDashboardAsync() => _repo.GetDashboardAsync();

        private static EmployeeResponseDto MapToDto(Employee e) => new()
        {
            Id=e.Id, FirstName=e.FirstName, LastName=e.LastName, Email=e.Email,
            Phone=e.Phone, Department=e.Department, Designation=e.Designation,
            Salary=e.Salary, JoinDate=e.JoinDate, Status=e.Status,
            CreatedAt=e.CreatedAt, UpdatedAt=e.UpdatedAt
        };
    }
}
