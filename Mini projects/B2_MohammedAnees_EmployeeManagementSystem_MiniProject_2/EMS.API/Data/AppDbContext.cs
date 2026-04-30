using EMS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<AppUser>  AppUsers  => Set<AppUser>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email).IsUnique();

            modelBuilder.Entity<AppUser>()
                .HasIndex(u => u.Username).IsUnique();

            // ── Seed Users ──────────────────────────────────────────────────
            modelBuilder.Entity<AppUser>().HasData(
                new AppUser
                {
                    Id           = 1,
                    Username     = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role         = "Admin",
                    CreatedAt    = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new AppUser
                {
                    Id           = 2,
                    Username     = "viewer",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("viewer123"),
                    Role         = "Viewer",
                    CreatedAt    = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // ── Seed 15 Employees ───────────────────────────────────────────
            modelBuilder.Entity<Employee>().HasData(
                new Employee { Id=1,  FirstName="Ravi",      LastName="Shankar",     Email="ravi.shankar@zynapse.com",    Phone="9812345670", Department="Engineering", Designation="Full Stack Developer",   Salary=920000,  JoinDate=new DateTime(2021,5,10,0,0,0,DateTimeKind.Utc),  Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=2,  FirstName="Lakshmi",   LastName="Nair",        Email="lakshmi.nair@zynapse.com",    Phone="9734561280", Department="HR",          Designation="HR Business Partner",    Salary=680000,  JoinDate=new DateTime(2019,8,22,0,0,0,DateTimeKind.Utc),  Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=3,  FirstName="Siddharth", LastName="Menon",       Email="siddharth.menon@zynapse.com", Phone="9645321870", Department="Finance",     Designation="Senior Accountant",      Salary=790000,  JoinDate=new DateTime(2020,2,14,0,0,0,DateTimeKind.Utc),  Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=4,  FirstName="Tanvi",     LastName="Desai",       Email="tanvi.desai@zynapse.com",     Phone="9556432190", Department="Marketing",   Designation="Digital Marketing Lead", Salary=740000,  JoinDate=new DateTime(2022,3,1,0,0,0,DateTimeKind.Utc),   Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=5,  FirstName="Amrit",     LastName="Chauhan",     Email="amrit.chauhan@zynapse.com",   Phone="9467893210", Department="Operations",  Designation="Process Manager",        Salary=870000,  JoinDate=new DateTime(2018,11,17,0,0,0,DateTimeKind.Utc), Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=6,  FirstName="Deepika",   LastName="Rao",         Email="deepika.rao@zynapse.com",     Phone="9378904321", Department="Engineering", Designation="Cloud Architect",        Salary=1250000, JoinDate=new DateTime(2016,7,30,0,0,0,DateTimeKind.Utc),  Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=7,  FirstName="Vivek",     LastName="Tiwari",      Email="vivek.tiwari@zynapse.com",    Phone="9289015432", Department="Marketing",   Designation="SEO Specialist",         Salary=530000,  JoinDate=new DateTime(2023,5,15,0,0,0,DateTimeKind.Utc),  Status="Inactive", CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=8,  FirstName="Harini",    LastName="Subramaniam", Email="harini.sub@zynapse.com",      Phone="9190126543", Department="Finance",     Designation="Treasury Analyst",       Salary=830000,  JoinDate=new DateTime(2021,9,8,0,0,0,DateTimeKind.Utc),   Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=9,  FirstName="Pranav",    LastName="Kulkarni",    Email="pranav.kulkarni@zynapse.com", Phone="9071237654", Department="Operations",  Designation="Logistics Coordinator",  Salary=610000,  JoinDate=new DateTime(2022,12,20,0,0,0,DateTimeKind.Utc), Status="Inactive", CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=10, FirstName="Swathi",    LastName="Krishnan",    Email="swathi.krishnan@zynapse.com", Phone="8982348765", Department="Engineering", Designation="ML Engineer",            Salary=1080000, JoinDate=new DateTime(2020,6,3,0,0,0,DateTimeKind.Utc),   Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=11, FirstName="Gaurav",    LastName="Saxena",      Email="gaurav.saxena@zynapse.com",   Phone="8893459876", Department="HR",          Designation="Talent Manager",         Salary=720000,  JoinDate=new DateTime(2019,4,25,0,0,0,DateTimeKind.Utc),  Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=12, FirstName="Ishaan",    LastName="Malik",       Email="ishaan.malik@zynapse.com",    Phone="8754560987", Department="Marketing",   Designation="Growth Hacker",          Salary=660000,  JoinDate=new DateTime(2023,1,9,0,0,0,DateTimeKind.Utc),   Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=13, FirstName="Chandana",  LastName="Hegde",       Email="chandana.hegde@zynapse.com",  Phone="8665671098", Department="Finance",     Designation="Investment Analyst",     Salary=960000,  JoinDate=new DateTime(2018,3,19,0,0,0,DateTimeKind.Utc),  Status="Inactive", CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=14, FirstName="Nitin",     LastName="Pandey",      Email="nitin.pandey@zynapse.com",    Phone="8576782109", Department="Operations",  Designation="QA Lead",                Salary=750000,  JoinDate=new DateTime(2021,11,30,0,0,0,DateTimeKind.Utc), Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) },
                new Employee { Id=15, FirstName="Revathi",   LastName="Pillai",      Email="revathi.pillai@zynapse.com",  Phone="8487893210", Department="Engineering", Designation="Backend Engineer",       Salary=890000,  JoinDate=new DateTime(2022,7,18,0,0,0,DateTimeKind.Utc),  Status="Active",   CreatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc), UpdatedAt=new DateTime(2024,1,1,0,0,0,DateTimeKind.Utc) }
            );
        }
    }
}
