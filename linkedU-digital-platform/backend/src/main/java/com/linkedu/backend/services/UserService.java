package com.linkedu.backend.services;

import com.linkedu.backend.entities.User;
import com.linkedu.backend.entities.enums.Role;
import com.linkedu.backend.repositories.AgentProfileRepository;
import com.linkedu.backend.repositories.ChatMessageRepository;
import com.linkedu.backend.repositories.DocumentRepository;
import com.linkedu.backend.repositories.EmailVerificationTokenRepository;
import com.linkedu.backend.repositories.FeedbackRepository;
import com.linkedu.backend.repositories.GuestProfileRepository;
import com.linkedu.backend.repositories.PasswordResetTokenRepository;
import com.linkedu.backend.repositories.ProgressRepository;
import com.linkedu.backend.repositories.QuizAttemptRepository;
import com.linkedu.backend.repositories.StudentAnswerRepository;
import com.linkedu.backend.repositories.StudentProfileRepository;
import com.linkedu.backend.repositories.StudentQuizAssignmentRepository;
import com.linkedu.backend.repositories.TicketRepository;
import com.linkedu.backend.repositories.TicketResponseRepository;
import com.linkedu.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final GuestProfileRepository guestProfileRepository;
    private final DocumentRepository documentRepository;
    private final ProgressRepository progressRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentQuizAssignmentRepository studentQuizAssignmentRepository;
    private final TicketResponseRepository ticketResponseRepository;
    private final TicketRepository ticketRepository;
    private final FeedbackRepository feedbackRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User createUser(String firstName, String lastName, String email,
                           String password, Role role) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public void assignRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllAgents() {
        return userRepository.findByRole(Role.AGENT);
    }

    public List<User> getAllStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Break self-reference first: students assigned to this agent.
        List<User> assignedStudents = userRepository.findByAssignedAgent(user);
        for (User student : assignedStudents) {
            student.setAssignedAgent(null);
        }
        userRepository.saveAll(assignedStudents);

        // Remove direct profile rows.
        studentProfileRepository.findByUserId(userId).ifPresent(studentProfileRepository::delete);
        agentProfileRepository.findByUserId(userId).ifPresent(agentProfileRepository::delete);
        guestProfileRepository.findByUserId(userId).ifPresent(guestProfileRepository::delete);

        // Remove tokens tied by user id column.
        passwordResetTokenRepository.deleteByUserId(userId);
        emailVerificationTokenRepository.findByUserIdAndVerifiedAtIsNull(userId)
                .ifPresent(emailVerificationTokenRepository::delete);

        // Remove user-linked functional data.
        documentRepository.deleteAll(documentRepository.findByStudent(user));
        progressRepository.deleteAll(progressRepository.findByStudent(user));
        studentAnswerRepository.deleteAll(studentAnswerRepository.findByStudent(user));
        studentQuizAssignmentRepository.deleteAll(studentQuizAssignmentRepository.findByStudentId(userId));
        studentQuizAssignmentRepository.deleteAll(studentQuizAssignmentRepository.findByAssignedBy(user));

        ticketResponseRepository.deleteAll(ticketResponseRepository.findByAgent(user));
        ticketRepository.deleteAll(ticketRepository.findByStudentId(userId));
        ticketRepository.deleteAll(ticketRepository.findByAgentIdAndStatus(userId, com.linkedu.backend.entities.enums.TicketStatus.PENDING));
        ticketRepository.deleteAll(ticketRepository.findByAgentIdAndStatus(userId, com.linkedu.backend.entities.enums.TicketStatus.ACCEPTED));
        ticketRepository.deleteAll(ticketRepository.findByAgentIdAndStatus(userId, com.linkedu.backend.entities.enums.TicketStatus.REJECTED));

        feedbackRepository.deleteAll(feedbackRepository.findByStudent(user));
        feedbackRepository.deleteAll(feedbackRepository.findByAgent(user));

        chatMessageRepository.deleteAll(chatMessageRepository.findBySenderAndReceiverOrderByTimestampAsc(user, user));
        chatMessageRepository.deleteAll(chatMessageRepository.findByReceiverAndSenderOrderByTimestampAsc(user, user));
        for (User other : userRepository.findAll()) {
            if (!other.getId().equals(userId)) {
                chatMessageRepository.deleteAll(chatMessageRepository.findConversation(user, other));
            }
        }

        // Remove quiz attempts where user is student or reviewer.
        quizAttemptRepository.deleteAll(quizAttemptRepository.findByStudent(user));
        quizAttemptRepository.deleteAll(quizAttemptRepository.findByReviewedBy(user));

        // Finally remove user.
        userRepository.delete(user);
    }
}
