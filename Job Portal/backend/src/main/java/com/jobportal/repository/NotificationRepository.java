package com.jobportal.repository;

import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    Long countByUserAndIsRead(User user, Boolean isRead);
}