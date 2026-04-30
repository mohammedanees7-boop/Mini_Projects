using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Services
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _db;
        public EmployeeRepository(AppDbContext db) { _db = db; }

        private static EmployeeResponseDto MapToDto(Employee e) => new()
        {
            Id          = e.Id,
            FirstName   = e.FirstName,
            LastName    = e.LastName,
            Email       = e.Email,
            Phone       = e.Phone,
            Department  = e.Department,
            Designation = e.Designation,
            Salary      = e.Salary,
            JoinDate    = e.JoinDate,
            Status      = e.Status,
            CreatedAt   = e.CreatedAt,
            UpdatedAt   = e.UpdatedAt
        };

        public async Task<PagedResult<EmployeeResponseDto>> GetAllAsync(EmployeeQueryParams q)
        {
            var query = _db.Employees.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                var term = q.Search.Trim().ToLower();
                query = query.Where(e =>
                    (e.FirstName + " " + e.LastName).ToLower().Contains(term) ||
                    e.Email.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(q.Department))
                query = query.Where(e => e.Department == q.Department);

            if (!string.IsNullOrWhiteSpace(q.Status))
                query = query.Where(e => e.Status == q.Status);

            query = q.SortBy?.ToLower() switch
            {
                "salary"   => q.SortDir == "desc" ? query.OrderByDescending(e => e.Salary)   : query.OrderBy(e => e.Salary),
                "joindate" => q.SortDir == "desc" ? query.OrderByDescending(e => e.JoinDate) : query.OrderBy(e => e.JoinDate),
                _          => q.SortDir == "desc"
                    ? query.OrderByDescending(e => e.LastName).ThenByDescending(e => e.FirstName)
                    : query.OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            };

            var totalCount = await query.CountAsync();
            var pageSize   = Math.Min(Math.Max(q.PageSize, 1), 100);
            var page       = Math.Max(q.Page, 1);
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => MapToDto(e))
                .ToListAsync();

            return new PagedResult<EmployeeResponseDto>
            {
                Data        = data,
                TotalCount  = totalCount,
                Page        = page,
                PageSize    = pageSize,
                TotalPages  = totalPages,
                HasNextPage = page < totalPages,
                HasPrevPage = page > 1
            };
        }

        public async Task<Employee?> GetByIdAsync(int id) => await _db.Employees.FindAsync(id);

        public async Task<Employee> AddAsync(Employee e)
        {
            e.CreatedAt = DateTime.UtcNow;
            e.UpdatedAt = DateTime.UtcNow;
            _db.Employees.Add(e);
            await _db.SaveChangesAsync();
            return e;
        }

        public async Task<Employee?> UpdateAsync(int id, Employee updated)
        {
            var existing = await _db.Employees.FindAsync(id);
            if (existing is null) return null;
            existing.FirstName   = updated.FirstName;
            existing.LastName    = updated.LastName;
            existing.Email       = updated.Email;
            existing.Phone       = updated.Phone;
            existing.Department  = updated.Department;
            existing.Designation = updated.Designation;
            existing.Salary      = updated.Salary;
            existing.JoinDate    = updated.JoinDate;
            existing.Status      = updated.Status;
            existing.UpdatedAt   = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp is null) return false;
            _db.Employees.Remove(emp);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
        {
            var query = _db.Employees.Where(e => e.Email.ToLower() == email.ToLower());
            if (excludeId.HasValue) query = query.Where(e => e.Id != excludeId.Value);
            return await query.AnyAsync();
        }

        public async Task<DashboardSummaryDto> GetDashboardAsync()
        {
            var total    = await _db.Employees.CountAsync();
            var active   = await _db.Employees.CountAsync(e => e.Status == "Active");
            var inactive = await _db.Employees.CountAsync(e => e.Status == "Inactive");
            var depts    = await _db.Employees.Select(e => e.Department).Distinct().CountAsync();

            var breakdown = await _db.Employees
                .GroupBy(e => e.Department)
                .Select(g => new { Department = g.Key, Count = g.Count() })
                .OrderBy(x => x.Department)
                .ToListAsync();

            var deptItems = breakdown.Select(b => new DepartmentBreakdownItem
            {
                Department = b.Department,
                Count      = b.Count,
                Percentage = total > 0 ? (int)Math.Round((double)b.Count / total * 100) : 0
            }).ToList();

            var recent = await _db.Employees
                .OrderByDescending(e => e.CreatedAt).ThenByDescending(e => e.Id)
                .Take(5)
                .Select(e => MapToDto(e))
                .ToListAsync();

            return new DashboardSummaryDto
            {
                Total               = total,
                Active              = active,
                Inactive            = inactive,
                Departments         = depts,
                DepartmentBreakdown = deptItems,
                RecentEmployees     = recent
            };
        }
    }
}
