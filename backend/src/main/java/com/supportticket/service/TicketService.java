package com.supportticket.service;

import com.supportticket.dto.CommentDto;
import com.supportticket.dto.TicketRequestDto;
import com.supportticket.dto.TicketResponseDto;
import com.supportticket.entity.Comment;
import com.supportticket.entity.Ticket;
import com.supportticket.entity.User;
import com.supportticket.exception.ResourceNotFoundException;
import com.supportticket.repository.CommentRepository;
import com.supportticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AiSuggestionService aiSuggestionService;

    @Transactional
    public TicketResponseDto createTicket(TicketRequestDto request, User customer) {
        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .customer(customer)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        // Save initial comment
        Comment initialComment = Comment.builder()
                .ticket(savedTicket)
                .user(customer)
                .message(request.getDescription())
                .build();
        commentRepository.save(initialComment);

        String aiSuggestion = aiSuggestionService.getSuggestion(request.getDescription());

        return mapToDto(savedTicket, aiSuggestion);
    }

    public List<TicketResponseDto> getCustomerTickets(User customer) {
        return ticketRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(t -> mapToDto(t, null))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getTicketDetails(Long ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        List<CommentDto> commentDtos = commentRepository.findByTicketOrderByCreatedAtAsc(ticket)
                .stream()
                .map(c -> CommentDto.builder()
                        .id(c.getId())
                        .ticketId(c.getTicket().getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .userRole(c.getUser().getRole().name())
                        .message(c.getMessage())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        String aiSuggestion = aiSuggestionService.getSuggestion(ticket.getDescription());

        Map<String, Object> response = new HashMap<>();
        response.put("ticket", mapToDto(ticket, aiSuggestion));
        response.put("comments", commentDtos);
        response.put("aiSuggestion", aiSuggestion);
        return response;
    }

    @Transactional
    public CommentDto addComment(Long ticketId, String message, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(user)
                .message(message)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return CommentDto.builder()
                .id(savedComment.getId())
                .ticketId(ticket.getId())
                .userId(user.getId())
                .userName(user.getName())
                .userRole(user.getRole().name())
                .message(savedComment.getMessage())
                .createdAt(savedComment.getCreatedAt())
                .build();
    }

    public TicketResponseDto mapToDto(Ticket ticket, String aiSuggestion) {
        return TicketResponseDto.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .customerId(ticket.getCustomer().getId())
                .customerName(ticket.getCustomer().getName())
                .customerEmail(ticket.getCustomer().getEmail())
                .agentId(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getId() : null)
                .agentName(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getName() : null)
                .agentEmail(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getEmail() : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .aiSuggestion(aiSuggestion)
                .build();
    }
}
