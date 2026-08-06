package com.supportticket.controller;

import com.supportticket.dto.AssignTicketDto;
import com.supportticket.dto.TicketResponseDto;
import com.supportticket.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponseDto>> getAllTickets() {
        List<TicketResponseDto> tickets = adminService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/tickets/{id}/assign")
    public ResponseEntity<TicketResponseDto> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketDto dto) {
        TicketResponseDto ticket = adminService.assignTicket(id, dto.getAgentId());
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> dashboardData = adminService.getDashboardStats();
        return ResponseEntity.ok(dashboardData);
    }
}
