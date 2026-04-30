using EMS.API.DTOs;
using EMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _svc;
        public EmployeesController(EmployeeService svc) { _svc = svc; }

        [HttpGet]
        [Authorize(Roles = "Admin,Viewer")]
        public async Task<IActionResult> GetAll([FromQuery] EmployeeQueryParams q)
            => Ok(await _svc.GetAllAsync(q));

        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin,Viewer")]
        public async Task<IActionResult> GetDashboard()
            => Ok(await _svc.GetDashboardAsync());

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Viewer")]
        public async Task<IActionResult> GetById(int id)
        {
            var emp = await _svc.GetByIdAsync(id);
            if (emp is null) return NotFound(new { message = $"Employee with ID {id} not found." });
            return Ok(emp);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] EmployeeRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var (result, error) = await _svc.CreateAsync(dto);
            if (error is not null) return Conflict(new { message = error });
            return CreatedAtAction(nameof(GetById), new { id = result!.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var (result, error) = await _svc.UpdateAsync(id, dto);
            if (error == "Employee not found.") return NotFound(new { message = error });
            if (error is not null) return Conflict(new { message = error });
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _svc.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = $"Employee with ID {id} not found." });
            return Ok(new { message = "Employee deleted successfully." });
        }
    }
}
