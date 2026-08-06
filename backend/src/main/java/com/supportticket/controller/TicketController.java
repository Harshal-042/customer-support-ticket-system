package com.supportticket.controller;

import com.supportticket.dto.CommentDto;
import com.supportticket.dto.TicketRequestDto;
import com.supportticket.dto.TicketResponseDto;
import com.supportticket.entity.User;
import com.supportticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponseDto> createTicket(
            @Valid @RequestBody TicketRequestDto request,
            @AuthenticationPrincipal User customer) {
        TicketResponseDto response = ticketService.createTicket(request, customer);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDto>> getMyTickets(@AuthenticationPrincipal User customer) {
        List<TicketResponseDto> tickets = ticketService.getCustomerTickets(customer);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        Map<String, Object> response = ticketService.getTicketDetails(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String message = body.get("message");
        CommentDto comment = ticketService.addComment(id, message, user);
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }
}
