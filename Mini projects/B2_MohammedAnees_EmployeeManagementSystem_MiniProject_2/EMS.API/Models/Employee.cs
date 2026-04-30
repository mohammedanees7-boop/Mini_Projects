using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.API.Models
{
    public class Employee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required][MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required][MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required][MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required][MaxLength(15)]
        public string Phone { get; set; } = string.Empty;

        [Required][MaxLength(50)]
        public string Department { get; set; } = string.Empty;

        [Required][MaxLength(100)]
        public string Designation { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Salary { get; set; }

        [Required]
        public DateTime JoinDate { get; set; }

        [Required][MaxLength(10)]
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
