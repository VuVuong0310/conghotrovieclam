package com.jobportal.config;

import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.JobCategory;
import com.jobportal.repository.RoleRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.JobCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize default roles if they don't exist
        Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE").orElse(null);
        if (candidateRole == null) {
            candidateRole = new Role();
            candidateRole.setName("ROLE_CANDIDATE");
            roleRepository.save(candidateRole);
        }

        Role employerRole = roleRepository.findByName("ROLE_EMPLOYER").orElse(null);
        if (employerRole == null) {
            employerRole = new Role();
            employerRole.setName("ROLE_EMPLOYER");
            roleRepository.save(employerRole);
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
        if (adminRole == null) {
            adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);
        }

        // Create admin user if it doesn't exist
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("Admin user created: admin/admin123");
        }

        // Create specific admin user for vuvanvuong2004@gmail.com
        if (userRepository.findByUsername("vuvanvuong2004@gmail.com").isEmpty()) {
            User specialAdmin = new User();
            specialAdmin.setUsername("vuvanvuong2004@gmail.com");
            specialAdmin.setPassword(passwordEncoder.encode("admin123"));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            specialAdmin.setRoles(roles);

            userRepository.save(specialAdmin);
            System.out.println("Special admin user created: vuvanvuong2004@gmail.com/admin123");
        }

        // Create test employer
        if (userRepository.findByUsername("employer").isEmpty()) {
            User employer = new User();
            employer.setUsername("employer");
            employer.setPassword(passwordEncoder.encode("employer123"));

            Set<Role> roles = new HashSet<>();
            roles.add(employerRole);
            employer.setRoles(roles);

            userRepository.save(employer);
            System.out.println("Employer user created: employer/employer123");
        }

        // Create test candidate
        if (userRepository.findByUsername("candidate").isEmpty()) {
            User candidate = new User();
            candidate.setUsername("candidate");
            candidate.setPassword(passwordEncoder.encode("candidate123"));

            Set<Role> roles = new HashSet<>();
            roles.add(candidateRole);
            candidate.setRoles(roles);

            userRepository.save(candidate);
            System.out.println("Candidate user created: candidate/candidate123");
        }

        // Create sample job categories and jobs
        createSampleJobsAndCategories(employerRole);
    }

    private void createSampleJobsAndCategories(Role employerRole) {
        // Get or create test employer for jobs
        Optional<User> testEmployer = userRepository.findByUsername("employer");
        if (testEmployer.isEmpty()) return;

        User employer = testEmployer.get();

        // Create sample categories if they don't exist
        if (jobCategoryRepository.findAll().isEmpty()) {
            createCategory("IT & Phần mềm", "Công nghệ thông tin, lập trình, phần mềm");
            createCategory("Marketing", "Marketing, quảng cáo, truyền thông");
            createCategory("Nhân sự", "Quản lý nhân sự, tuyển dụng");
            createCategory("Tài chính", "Ngân hàng, kế toán, tài chính");
            createCategory("Kinh doanh", "Bán hàng, kinh doanh, phát triển thị trường");
            System.out.println("Sample job categories created!");
        }

        // Create sample jobs if they don't exist
        if (jobPostRepository.findAll().isEmpty()) {
            JobCategory itCategory = jobCategoryRepository.findAll().stream()
                    .filter(c -> c.getName().contains("IT")).findFirst().orElse(null);
            JobCategory marketingCategory = jobCategoryRepository.findAll().stream()
                    .filter(c -> c.getName().contains("Marketing")).findFirst().orElse(null);
            JobCategory hrCategory = jobCategoryRepository.findAll().stream()
                    .filter(c -> c.getName().contains("Nhân sự")).findFirst().orElse(null);

            // Job 1
            JobPost job1 = new JobPost();
            job1.setTitle("Senior Java Developer");
            job1.setDescription("We are looking for experienced Java developers with Spring Boot expertise. " +
                    "5+ years of experience required. Work with modern technologies and lead development teams.");
            job1.setEmployer(employer);
            job1.setLocation("Ho Chi Minh City");
            job1.setSalary(50000000.0);
            job1.setEmploymentType("Full-time");
            job1.setCreatedAt(LocalDateTime.now());
            job1.setStatus(JobPost.JobStatus.APPROVED);
            job1.setCategory(itCategory);
            jobPostRepository.save(job1);

            // Job 2
            JobPost job2 = new JobPost();
            job2.setTitle("Frontend Engineer - React");
            job2.setDescription("Join our team as a React developer. Build beautiful, responsive web applications. " +
                    "Work with modern JavaScript frameworks and collaborate with UX/UI designers.");
            job2.setEmployer(employer);
            job2.setLocation("Da Nang");
            job2.setSalary(40000000.0);
            job2.setEmploymentType("Full-time");
            job2.setCreatedAt(LocalDateTime.now());
            job2.setStatus(JobPost.JobStatus.APPROVED);
            job2.setCategory(itCategory);
            jobPostRepository.save(job2);

            // Job 3
            JobPost job3 = new JobPost();
            job3.setTitle("Digital Marketing Specialist");
            job3.setDescription("Help us grow our digital presence. Plan and execute digital marketing campaigns. " +
                    "Work with SEO, SEM, social media, and content marketing strategies.");
            job3.setEmployer(employer);
            job3.setLocation("Ha Noi");
            job3.setSalary(30000000.0);
            job3.setEmploymentType("Full-time");
            job3.setCreatedAt(LocalDateTime.now());
            job3.setStatus(JobPost.JobStatus.APPROVED);
            job3.setCategory(marketingCategory);
            jobPostRepository.save(job3);

            // Job 4
            JobPost job4 = new JobPost();
            job4.setTitle("HR Manager");
            job4.setDescription("Lead our Human Resources team. Manage recruitment, employee relations, and organizational development. " +
                    "Minimum 3 years of HR management experience.");
            job4.setEmployer(employer);
            job4.setLocation("Ho Chi Minh City");
            job4.setSalary(35000000.0);
            job4.setEmploymentType("Full-time");
            job4.setCreatedAt(LocalDateTime.now());
            job4.setStatus(JobPost.JobStatus.APPROVED);
            job4.setCategory(hrCategory);
            jobPostRepository.save(job4);

            // Job 5
            JobPost job5 = new JobPost();
            job5.setTitle("Full Stack Developer");
            job5.setDescription("Looking for a full stack developer who can work on both frontend and backend. " +
                    "Experience with Java/Spring Boot and React is a plus. Salary up to 45 million VND.");
            job5.setEmployer(employer);
            job5.setLocation("Da Nang");
            job5.setSalary(45000000.0);
            job5.setEmploymentType("Full-time");
            job5.setCreatedAt(LocalDateTime.now());
            job5.setStatus(JobPost.JobStatus.APPROVED);
            job5.setCategory(itCategory);
            jobPostRepository.save(job5);

            System.out.println("Sample job posts created successfully!");
        }
    }

    private void createCategory(String name, String description) {
        JobCategory cat = new JobCategory();
        cat.setName(name);
        cat.setDescription(description);
        jobCategoryRepository.save(cat);
    }
}
