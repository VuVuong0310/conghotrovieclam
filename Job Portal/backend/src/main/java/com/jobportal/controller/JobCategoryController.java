package com.jobportal.controller;

import com.jobportal.entity.JobCategory;
import com.jobportal.repository.JobCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class JobCategoryController {

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @GetMapping
    public List<JobCategory> listAll() {
        return jobCategoryRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public JobCategory create(@RequestBody JobCategory category) {
        return jobCategoryRepository.save(category);
    }
}