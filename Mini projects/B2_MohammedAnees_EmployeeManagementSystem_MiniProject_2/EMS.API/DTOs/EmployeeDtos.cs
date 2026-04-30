using System.ComponentModel.DataAnnotations;

namespace EMS.API.DTOs
{
    public class EmployeeRequestDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required.")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone must be exactly 10 digits.")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Department is required.")]
        public string Department { get; set; } = string.Empty;

        [Required(ErrorMessage = "Designation is required.")]
        [MaxLength(100)]
        public string Designation { get; set; } = string.Empty;

        [Required(ErrorMessage = "Salary is required.")]
        [Range(1, double.MaxValue, ErrorMessage = "Salary must be a positive number.")]
        public decimal Salary { get; set; }

        [Required(ErrorMessage = "Join date is required.")]
        public DateTime JoinDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public string Status { get; set; } = string.Empty;
    }

    public class EmployeeResponseDto
    {
        public int      Id          { get; set; }
        public string   FirstName   { get; set; } = string.Empty;
        public string   LastName    { get; set; } = string.Empty;
        public string   Email       { get; set; } = string.Empty;
        public string   Phone       { get; set; } = string.Empty;
        public string   Department  { get; set; } = string.Empty;
        public string   Designation { get; set; } = string.Empty;
        public decimal  Salary      { get; set; }
        public DateTime JoinDate    { get; set; }
        public string   Status      { get; set; } = string.Empty;
        public DateTime CreatedAt   { get; set; }
        public DateTime UpdatedAt   { get; set; }
    }

    public class PagedResult<T>
    {
        public IEnumerable<T> Data        { get; set; } = Enumerable.Empty<T>();
        public int            TotalCount  { get; set; }
        public int            Page        { get; set; }
        public int            PageSize    { get; set; }
        public int            TotalPages  { get; set; }
        public bool           HasNextPage { get; set; }
        public bool           HasPrevPage { get; set; }
    }

    public class EmployeeQueryParams
    {
        public string? Search     { get; set; }
        public string? Department { get; set; }
        public string? Status     { get; set; }
        public string  SortBy     { get; set; } = "name";
        public string  SortDir    { get; set; } = "asc";
        public int     Page       { get; set; } = 1;
        public int     PageSize   { get; set; } = 10;
    }

    public class DashboardSummaryDto
    {
        public int                           Total               { get; set; }
        public int                           Active              { get; set; }
        public int                           Inactive            { get; set; }
        public int                           Departments         { get; set; }
        public List<DepartmentBreakdownItem> DepartmentBreakdown { get; set; } = new();
        public List<EmployeeResponseDto>     RecentEmployees     { get; set; } = new();
    }

    public class DepartmentBreakdownItem
    {
        public string Department { get; set; } = string.Empty;
        public int    Count      { get; set; }
        public int    Percentage { get; set; }
    }

    public class AuthRequestDto
    {
        [Required] public string Username { get; set; } = string.Empty;
        [Required] public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Viewer";
    }

    public class AuthResponseDto
    {
        public bool   Success  { get; set; }
        public string Message  { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role     { get; set; } = string.Empty;
        public string Token    { get; set; } = string.Empty;
    }
}
