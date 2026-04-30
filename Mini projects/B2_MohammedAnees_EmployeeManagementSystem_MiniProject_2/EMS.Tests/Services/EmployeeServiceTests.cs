using EMS.API.DTOs;
using EMS.API.Models;
using EMS.API.Services;
using Moq;
using NUnit.Framework;

namespace EMS.Tests.Services
{
    [TestFixture]
    public class EmployeeServiceTests
    {
        private Mock<IEmployeeRepository> _repoMock = null!;
        private EmployeeService           _service  = null!;

        [SetUp]
        public void Setup()
        {
            _repoMock = new Mock<IEmployeeRepository>();
            _service  = new EmployeeService(_repoMock.Object);
        }

        [Test]
        public async Task GetByIdAsync_ValidId_ReturnsMappedDto()
        {
            var fakeEmp = new Employee
            {
                Id=1, FirstName="Ravi", LastName="Shankar",
                Email="ravi@test.com", Phone="9812345670",
                Department="Engineering", Designation="Developer",
                Salary=900000, JoinDate=DateTime.UtcNow, Status="Active"
            };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(fakeEmp);

            var result = await _service.GetByIdAsync(1);

            Assert.That(result,            Is.Not.Null);
            Assert.That(result!.FirstName, Is.EqualTo("Ravi"));
            _repoMock.Verify(r => r.GetByIdAsync(1), Times.Once);
        }

        [Test]
        public async Task GetByIdAsync_NonExistentId_ReturnsNull()
        {
            _repoMock.Setup(r => r.GetByIdAsync(9999)).ReturnsAsync((Employee?)null);
            var result = await _service.GetByIdAsync(9999);
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task CreateAsync_NewEmail_CallsAddAsync()
        {
            var dto = new EmployeeRequestDto
            {
                FirstName="Test", LastName="User", Email="test@test.com",
                Phone="9000000001", Department="Finance", Designation="Analyst",
                Salary=500000, JoinDate=DateTime.UtcNow, Status="Active"
            };
            _repoMock.Setup(r => r.EmailExistsAsync(dto.Email, null)).ReturnsAsync(false);
            _repoMock.Setup(r => r.AddAsync(It.IsAny<Employee>()))
                     .ReturnsAsync((Employee e) => { e.Id = 99; return e; });

            var (result, error) = await _service.CreateAsync(dto);

            Assert.That(error,  Is.Null);
            Assert.That(result, Is.Not.Null);
            _repoMock.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Once);
        }

        [Test]
        public async Task CreateAsync_DuplicateEmail_ReturnsError()
        {
            var dto = new EmployeeRequestDto
            {
                FirstName="Dup", LastName="User", Email="ravi@test.com",
                Phone="9000000002", Department="HR", Designation="Manager",
                Salary=600000, JoinDate=DateTime.UtcNow, Status="Active"
            };
            _repoMock.Setup(r => r.EmailExistsAsync(dto.Email, null)).ReturnsAsync(true);

            var (result, error) = await _service.CreateAsync(dto);

            Assert.That(result, Is.Null);
            Assert.That(error,  Does.Contain("already exists"));
            _repoMock.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Never);
        }

        [Test]
        public async Task DeleteAsync_ExistingId_ReturnsTrue()
        {
            _repoMock.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);
            Assert.That(await _service.DeleteAsync(1), Is.True);
            _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
        }

        [Test]
        public async Task DeleteAsync_NonExistentId_ReturnsFalse()
        {
            _repoMock.Setup(r => r.DeleteAsync(999)).ReturnsAsync(false);
            Assert.That(await _service.DeleteAsync(999), Is.False);
        }
    }
}
