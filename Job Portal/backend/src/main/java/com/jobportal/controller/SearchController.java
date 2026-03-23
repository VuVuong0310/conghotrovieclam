package com.jobportal.controller;

import com.jobportal.entity.JobPost;
import com.jobportal.service.JobSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SearchController {

    @Autowired
    private JobSearchService jobSearchService;

    @GetMapping("/jobs")
    public ResponseEntity<?> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) String employmentType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        try {
            Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<JobPost> result = jobSearchService.searchJobs(keyword, location, minSalary, maxSalary, employmentType, pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching jobs: " + e.getMessage());
        }
    }

    @GetMapping("/category")
    public ResponseEntity<?> searchByCategory(
            @RequestParam String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<JobPost> result = jobSearchService.searchByCategory(category, pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching by category: " + e.getMessage());
        }
    }

    @GetMapping("/related/{jobId}")
    public ResponseEntity<?> getRelatedJobs(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            return ResponseEntity.ok(jobSearchService.getRelatedJobs(jobId, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving related jobs: " + e.getMessage());
        }
    }
}
