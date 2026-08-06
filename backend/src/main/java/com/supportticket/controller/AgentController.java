package com.supportticket.controller;

import com.supportticket.dto.CommentDto;
import com.supportticket.dto.TicketResponseDto;
import com.supportticket.dto.UpdateStatusDto;
import com.supportticket.entity.Status;
import com.supportticket.entity.User;
import com.supportticket.service.AgentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@PreAuthorize("hasAnyRole('ROLE_AGENT', 'ROLE_ADMIN')")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponseDto>> getAssignedTickets(@AuthenticationPrincipal User agent) {
        List<TicketResponseDto> tickets = agentService.getAssignedTickets(agent);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<TicketResponseDto> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusDto dto,
            @AuthenticationPrincipal User agent) {
        TicketResponseDto ticket = agentService.updateStatus(id, dto.getStatus(), agent);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/tickets/{id}/reply")
    public ResponseEntity<CommentDto> replyToTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User agent) {
        String message = body.get("message");
        String statusStr = body.get("updateStatusTo");
        Status status = statusStr != null ? Status.valueOf(statusStr) : null;

        CommentDto reply = agentService.replyToTicket(id, message, status, agent);
        return new ResponseEntity<>(reply, HttpStatus.CREATED);
    }
}
