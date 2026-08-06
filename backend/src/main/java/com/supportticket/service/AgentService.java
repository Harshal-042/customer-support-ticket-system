package com.supportticket.service;

import com.supportticket.dto.CommentDto;
import com.supportticket.dto.TicketResponseDto;
import com.supportticket.entity.Comment;
import com.supportticket.entity.Status;
import com.supportticket.entity.Ticket;
import com.supportticket.entity.User;
import com.supportticket.exception.ResourceNotFoundException;
import com.supportticket.repository.CommentRepository;
import com.supportticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgentService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TicketService ticketService;

    public List<TicketResponseDto> getAssignedTickets(User agent) {
        return ticketRepository.findByAssignedAgentOrderByCreatedAtDesc(agent)
                .stream()
                .map(t -> ticketService.mapToDto(t, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponseDto updateStatus(Long ticketId, Status status, User agent) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        ticket.setStatus(status);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // System log comment
        Comment systemLog = Comment.builder()
                .ticket(updatedTicket)
                .user(agent)
                .message("[System Update] Ticket status updated to " + status.name())
                .build();
        commentRepository.save(systemLog);

        return ticketService.mapToDto(updatedTicket, null);
    }

    @Transactional
    public CommentDto replyToTicket(Long ticketId, String message, Status statusUpdate, User agent) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        if (ticket.getAssignedAgent() == null) {
            ticket.setAssignedAgent(agent);
        }

        if (statusUpdate != null) {
            ticket.setStatus(statusUpdate);
        } else if (ticket.getStatus() == Status.OPEN) {
            ticket.setStatus(Status.IN_PROGRESS);
        }

        ticketRepository.save(ticket);

        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(agent)
                .message(message)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return CommentDto.builder()
                .id(savedComment.getId())
                .ticketId(ticket.getId())
                .userId(agent.getId())
                .userName(agent.getName())
                .userRole(agent.getRole().name())
                .message(savedComment.getMessage())
                .createdAt(savedComment.getCreatedAt())
                .build();
    }
}
