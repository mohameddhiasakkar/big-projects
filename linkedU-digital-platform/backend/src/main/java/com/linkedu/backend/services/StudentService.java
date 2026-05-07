package com.linkedu.backend.services;

import com.linkedu.backend.entities.User;
import com.linkedu.backend.entities.enums.Role;
import com.linkedu.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.linkedu.backend.repositories.AgentProfileRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;
    private final AgentProfileRepository agentProfileRepository;

    public User assignAgentToStudent(Long studentId, Long agentId) {
        User student = userRepository.findById(studentId).orElseThrow();
        User agent = userRepository.findById(agentId).orElseThrow();

        if (student.getRole() != Role.STUDENT || agent.getRole() != Role.AGENT) {
            throw new IllegalArgumentException("Invalid roles for assignment");
        }

        student.setAssignedAgent(agent);
        return userRepository.save(student);
    }

    public List<User> getStudentsByAgent(Long agentId) {
        User agent = userRepository.findById(agentId).orElseThrow();
        return userRepository.findByAssignedAgent(agent);
    }

    public java.util.Map<String, Object> getAssignedAgent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        User agent = student.getAssignedAgent();
        if (agent == null) {
            return java.util.Map.of("hasAgent", false);
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("hasAgent", true);
        result.put("id", agent.getId());
        result.put("firstName", agent.getFirstName());
        result.put("lastName", agent.getLastName());
        result.put("email", agent.getEmail());
        result.put("username", agent.getUsername());
        result.put("phoneNumber", agent.getPhoneNumber());
        result.put("role", agent.getRole());

        // Include agent profile data if exists
        agentProfileRepository.findByUserId(agent.getId()).ifPresent(profile -> {
            result.put("bio", profile.getBio());
            result.put("avatar", profile.getAvatar());
            result.put("address", profile.getAddress());
            result.put("contactName", profile.getContactName());
            result.put("contactEmail", profile.getEmail());
            result.put("availabilityTime", profile.getAvailabilityTime());
            result.put("onlineStatus", profile.getOnlineStatus() != null
                    ? profile.getOnlineStatus().name() : "OFFLINE");
            result.put("dateOfBirth", profile.getDateOfBirth() != null
                    ? profile.getDateOfBirth().toString() : null);
        });

        return result;
    }
}
