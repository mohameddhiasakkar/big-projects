package com.linkedu.backend.repositories;

import com.linkedu.backend.entities.TicketResponse;
import com.linkedu.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketResponseRepository extends JpaRepository<TicketResponse, Long> {
    List<TicketResponse> findByTicketId(Long ticketId);
    List<TicketResponse> findByAgent(User agent);
}
