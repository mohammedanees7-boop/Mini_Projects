using EMS.API.DTOs;
using EMS.API.Models;

namespace EMS.API.Services
{
    public interface IEmployeeRepository
    {
        Task<PagedResult<EmployeeResponseDto>> GetAllAsync(EmployeeQueryParams q);
        Task<Employee?>                        GetByIdAsync(int id);
        Task<Employee>                         AddAsync(Employee employee);
        Task<Employee?>                        UpdateAsync(int id, Employee updated);
        Task<bool>                             DeleteAsync(int id);
        Task<bool>                             EmailExistsAsync(string email, int? excludeId = null);
        Task<DashboardSummaryDto>              GetDashboardAsync();
    }
}
