package com.supportticket.service;

import com.supportticket.dto.TicketResponseDto;
import com.supportticket.dto.TicketStatsDto;
import com.supportticket.entity.Role;
import com.supportticket.entity.Status;
import com.supportticket.entity.Ticket;
import com.supportticket.entity.User;
import com.supportticket.exception.BadRequestException;
import com.supportticket.exception.ResourceNotFoundException;
import com.supportticket.repository.TicketRepository;
import com.supportticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketService ticketService;

    public List<TicketResponseDto> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(t -> ticketService.mapToDto(t, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponseDto assignTicket(Long ticketId, Long agentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        if (agent.getRole() != Role.ROLE_AGENT) {
            throw new BadRequestException("Target user is not a Support Agent.");
        }

        ticket.setAssignedAgent(agent);
        if (ticket.getStatus() == Status.OPEN) {
            ticket.setStatus(Status.IN_PROGRESS);
        }

        Ticket saved = ticketRepository.save(ticket);
        return ticketService.mapToDto(saved, null);
    }

    public Map<String, Object> getDashboardStats() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(Status.OPEN);
        long inProgress = ticketRepository.countByStatus(Status.IN_PROGRESS);
        long resolved = ticketRepository.countByStatus(Status.RESOLVED);
        long closed = ticketRepository.countByStatus(Status.CLOSED);

        TicketStatsDto stats = TicketStatsDto.builder()
                .totalTickets(total)
                .openTickets(open)
                .inProgressTickets(inProgress)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .build();

        List<User> agents = userRepository.findByRole(Role.ROLE_AGENT);

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("agents", agents.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("name", a.getName());
            m.put("email", a.getEmail());
            return m;
        }).collect(Collectors.toList()));

        return response;
    }
}
