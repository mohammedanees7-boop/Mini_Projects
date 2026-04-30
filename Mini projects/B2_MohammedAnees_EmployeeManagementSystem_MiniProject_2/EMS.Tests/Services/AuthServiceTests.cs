using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using EMS.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace EMS.Tests.Services
{
    [TestFixture]
    public class AuthServiceTests
    {
        private AppDbContext   _db      = null!;
        private AuthService    _service = null!;

        [SetUp]
        public void Setup()
        {
            var opts = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
            _db = new AppDbContext(opts);

            var mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(c => c["Jwt:Key"])         .Returns("TestSecretKey_32Chars_ForNUnit!!");
            mockConfig.Setup(c => c["Jwt:Issuer"])      .Returns("EMS.API");
            mockConfig.Setup(c => c["Jwt:Audience"])    .Returns("EMS.Client");
            mockConfig.Setup(c => c["Jwt:ExpiryHours"]).Returns("8");

            _service = new AuthService(_db, mockConfig.Object);
        }

        [TearDown]
        public void TearDown() => _db.Dispose();

        [Test]
        public async Task RegisterAsync_NewUser_ReturnsSuccess()
        {
            var result = await _service.RegisterAsync(new AuthRequestDto { Username="newuser", Password="pass123", Role="Viewer" });
            Assert.That(result.Success, Is.True);
            Assert.That(result.Token,   Is.Not.Empty);
        }

        [Test]
        public async Task RegisterAsync_DuplicateUsername_ReturnsFailure()
        {
            _db.AppUsers.Add(new AppUser { Username="existing", PasswordHash=BCrypt.Net.BCrypt.HashPassword("pass"), Role="Viewer" });
            await _db.SaveChangesAsync();

            var result = await _service.RegisterAsync(new AuthRequestDto { Username="existing", Password="pass123" });
            Assert.That(result.Success, Is.False);
            Assert.That(result.Message, Does.Contain("already exists"));
        }

        [Test]
        public async Task RegisterAsync_ShortPassword_ReturnsFailure()
        {
            var result = await _service.RegisterAsync(new AuthRequestDto { Username="user", Password="abc" });
            Assert.That(result.Success, Is.False);
        }

        [Test]
        public async Task LoginAsync_ValidCredentials_ReturnsToken()
        {
            _db.AppUsers.Add(new AppUser { Username="admin", PasswordHash=BCrypt.Net.BCrypt.HashPassword("admin123"), Role="Admin" });
            await _db.SaveChangesAsync();

            var result = await _service.LoginAsync(new AuthRequestDto { Username="admin", Password="admin123" });
            Assert.That(result.Success, Is.True);
            Assert.That(result.Role,    Is.EqualTo("Admin"));
            Assert.That(result.Token,   Is.Not.Empty);
        }

        [Test]
        public async Task LoginAsync_WrongPassword_ReturnsFailure()
        {
            _db.AppUsers.Add(new AppUser { Username="admin", PasswordHash=BCrypt.Net.BCrypt.HashPassword("admin123"), Role="Admin" });
            await _db.SaveChangesAsync();

            var result = await _service.LoginAsync(new AuthRequestDto { Username="admin", Password="wrongpass" });
            Assert.That(result.Success, Is.False);
        }

        [Test]
        public void GenerateToken_ReturnsValidJwtFormat()
        {
            var user  = new AppUser { Id=1, Username="admin", Role="Admin" };
            var token = _service.GenerateToken(user);
            Assert.That(token.Split('.').Length, Is.EqualTo(3));
        }
    }
}
