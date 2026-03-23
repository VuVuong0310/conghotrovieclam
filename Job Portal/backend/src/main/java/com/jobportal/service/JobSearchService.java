package com.jobportal.service;

import com.jobportal.entity.JobPost;
import com.jobportal.repository.JobPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
public class JobSearchService {

    @Autowired
    private JobPostRepository jobPostRepository;

    public Page<JobPost> searchJobs(String keyword, String location, Double minSalary, 
                                     Double maxSalary, String employmentType, Pageable pageable) {
        Specification<JobPost> spec = buildSpecification(keyword, location, minSalary, maxSalary, employmentType);
        return jobPostRepository.findAll(spec, pageable);
    }

    public Page<JobPost> searchByCategory(String category, Pageable pageable) {
        Specification<JobPost> spec = (root, query, cb) -> 
            cb.and(
                cb.equal(root.get("status"), JobPost.JobStatus.APPROVED),
                cb.like(cb.lower(root.get("description")), "%" + category.toLowerCase() + "%")
            );
        return jobPostRepository.findAll(spec, pageable);
    }

    private Specification<JobPost> buildSpecification(String keyword, String location, 
                                                       Double minSalary, Double maxSalary, 
                                                       String employmentType) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only return APPROVED jobs
            predicates.add(cb.equal(root.get("status"), JobPost.JobStatus.APPROVED));

            if (keyword != null && !keyword.isEmpty()) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + keyword.toLowerCase() + "%")
                ));
            }

            if (location != null && !location.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }

            if (minSalary != null && minSalary > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salary"), minSalary));
            }

            if (maxSalary != null && maxSalary > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salary"), maxSalary));
            }

            if (employmentType != null && !employmentType.isEmpty()) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public List<JobPost> getRelatedJobs(Long jobId, int limit) {
        return jobPostRepository.findByStatus(JobPost.JobStatus.APPROVED).stream()
            .filter(job -> !job.getId().equals(jobId))
            .limit(limit)
            .toList();
    }
}