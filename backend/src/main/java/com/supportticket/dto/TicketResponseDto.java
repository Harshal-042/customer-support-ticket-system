package com.supportticket.dto;

import com.supportticket.entity.Priority;
import com.supportticket.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TicketResponseDto {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long agentId;
    private String agentName;
    private String agentEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String aiSuggestion;
}
