using EMS.API.DTOs;
using EMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authSvc;
        public AuthController(AuthService authSvc) { _authSvc = authSvc; }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _authSvc.RegisterAsync(dto);
            if (!result.Success) return Conflict(new { message = result.Message });
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _authSvc.LoginAsync(dto);
            if (!result.Success) return Unauthorized(new { message = result.Message });
            return Ok(result);
        }
    }
}
