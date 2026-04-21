using System.Data.Entity;
using ContosoUniversity.WebForms.Models;

namespace ContosoUniversity.WebForms.Data
{
    public class SchoolContext : DbContext
    {
        public SchoolContext() : base("SchoolContext") { }

        public DbSet<Student> Students { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Instructor> Instructors { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<OfficeAssignment> OfficeAssignments { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Course>()
                .HasMany(c => c.Instructors)
                .WithMany(i => i.Courses);
        }
    }

    public class SchoolInitializer : DropCreateDatabaseIfModelChanges<SchoolContext>
    {
        protected override void Seed(SchoolContext context)
        {
            var students = new[]
            {
                new Student { FirstMidName = "Carson", LastName = "Alexander",
                    EnrollmentDate = System.DateTime.Parse("2019-09-01") },
                new Student { FirstMidName = "Meredith", LastName = "Alonso",
                    EnrollmentDate = System.DateTime.Parse("2017-09-01") },
                new Student { FirstMidName = "Arturo", LastName = "Anand",
                    EnrollmentDate = System.DateTime.Parse("2018-09-01") },
            };
            foreach (var s in students) context.Students.Add(s);
            context.SaveChanges();

            var departments = new[]
            {
                new Department { Name = "English", Budget = 350000,
                    StartDate = System.DateTime.Parse("2007-09-01") },
                new Department { Name = "Mathematics", Budget = 100000,
                    StartDate = System.DateTime.Parse("2007-09-01") },
                new Department { Name = "Engineering", Budget = 550000,
                    StartDate = System.DateTime.Parse("2007-09-01") },
            };
            foreach (var d in departments) context.Departments.Add(d);
            context.SaveChanges();
        }
    }
}
