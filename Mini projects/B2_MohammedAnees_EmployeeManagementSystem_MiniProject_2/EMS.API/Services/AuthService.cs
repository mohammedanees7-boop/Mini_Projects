using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EMS.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(AuthRequestDto dto)
        {
            if (dto.Password.Length < 6)
                return new AuthResponseDto { Success = false, Message = "Password must be at least 6 characters." };

            var exists = await _db.AppUsers
                .AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower());

            if (exists)
                return new AuthResponseDto { Success = false, Message = "Username already exists." };

            var role = (dto.Role == "Admin" || dto.Role == "Viewer") ? dto.Role : "Viewer";

            var user = new AppUser
            {
                Username = dto.Username.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = role,
                CreatedAt = DateTime.UtcNow
            };

            _db.AppUsers.Add(user);
            await _db.SaveChangesAsync();

            return new AuthResponseDto
            {
                Success = true,
                Message = "Account created successfully.",
                Username = user.Username,
                Role = user.Role,
                Token = GenerateToken(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(AuthRequestDto dto)
        {
            var user = await _db.AppUsers
                .FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return new AuthResponseDto { Success = false, Message = "Invalid credentials." };

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful.",
                Username = user.Username,
                Role = user.Role,
                Token = GenerateToken(user)
            };
        }

        public string GenerateToken(AppUser user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var keyString = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(keyString))
                throw new Exception("JWT Key is missing in configuration");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expiryHours = double.TryParse(_config["Jwt:ExpiryHours"], out var hours) ? hours : 8;

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}