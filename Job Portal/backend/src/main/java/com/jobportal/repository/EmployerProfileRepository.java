package com.jobportal.repository;

import com.jobportal.entity.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUser_Id(Long userId);
}
