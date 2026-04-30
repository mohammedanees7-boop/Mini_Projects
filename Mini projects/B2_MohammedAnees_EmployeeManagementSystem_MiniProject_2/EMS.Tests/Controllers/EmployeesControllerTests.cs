using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using EMS.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace EMS.Tests.Controllers
{
    [TestFixture]
    public class EmployeesControllerTests
    {
        private AppDbContext    _db      = null!;
        private EmployeeService _service = null!;

        [SetUp]
        public void Setup()
        {
            var opts = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
            _db = new AppDbContext(opts);

            _db.Employees.AddRange(
                new Employee { Id=1, FirstName="Ravi",    LastName="Shankar", Email="ravi@test.com",    Phone="9812345670", Department="Engineering", Designation="Developer",  Salary=900000, JoinDate=DateTime.UtcNow, Status="Active",   CreatedAt=DateTime.UtcNow, UpdatedAt=DateTime.UtcNow },
                new Employee { Id=2, FirstName="Lakshmi", LastName="Nair",    Email="lakshmi@test.com", Phone="9734561280", Department="HR",          Designation="HR Partner", Salary=680000, JoinDate=DateTime.UtcNow, Status="Active",   CreatedAt=DateTime.UtcNow, UpdatedAt=DateTime.UtcNow },
                new Employee { Id=3, FirstName="Vivek",   LastName="Tiwari",  Email="vivek@test.com",   Phone="9289015432", Department="Marketing",   Designation="SEO Spec",   Salary=530000, JoinDate=DateTime.UtcNow, Status="Inactive", CreatedAt=DateTime.UtcNow, UpdatedAt=DateTime.UtcNow }
            );
            _db.SaveChanges();

            _service = new EmployeeService(new EmployeeRepository(_db));
        }

        [TearDown]
        public void TearDown() => _db.Dispose();

        [Test]
        public async Task AddEmployee_PersistsInDatabase()
        {
            var dto = new EmployeeRequestDto { FirstName="New", LastName="Emp", Email="new@test.com", Phone="9000000001", Department="Finance", Designation="Analyst", Salary=600000, JoinDate=DateTime.UtcNow, Status="Active" };
            var (result, error) = await _service.CreateAsync(dto);
            Assert.That(error,  Is.Null);
            Assert.That(await _db.Employees.CountAsync(), Is.EqualTo(4));
        }

        [Test]
        public async Task DeleteEmployee_RemovesFromDatabase()
        {
            Assert.That(await _service.DeleteAsync(1), Is.True);
            Assert.That(await _db.Employees.CountAsync(), Is.EqualTo(2));
        }

        [Test]
        public async Task CreateEmployee_DuplicateEmail_ReturnsError()
        {
            var dto = new EmployeeRequestDto { FirstName="Dup", LastName="User", Email="ravi@test.com", Phone="9000000002", Department="Operations", Designation="Manager", Salary=700000, JoinDate=DateTime.UtcNow, Status="Active" };
            var (result, error) = await _service.CreateAsync(dto);
            Assert.That(result, Is.Null);
            Assert.That(error,  Does.Contain("already exists"));
        }

        [Test]
        public async Task GetDashboard_ReturnsCorrectCounts()
        {
            var dashboard = await _service.GetDashboardAsync();
            Assert.That(dashboard.Total,    Is.EqualTo(3));
            Assert.That(dashboard.Active,   Is.EqualTo(2));
            Assert.That(dashboard.Inactive, Is.EqualTo(1));
        }

        [Test]
        public async Task GetAll_FilterByStatus_Active()
        {
            var result = await _service.GetAllAsync(new EmployeeQueryParams { Status="Active", Page=1, PageSize=10 });
            Assert.That(result.TotalCount, Is.EqualTo(2));
        }

        [Test]
        public async Task GetAll_SearchByName_ReturnsMatch()
        {
            var result = await _service.GetAllAsync(new EmployeeQueryParams { Search="Ravi", Page=1, PageSize=10 });
            Assert.That(result.TotalCount, Is.EqualTo(1));
        }
    }
}
