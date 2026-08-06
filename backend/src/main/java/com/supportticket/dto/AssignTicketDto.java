package com.supportticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTicketDto {

    @NotNull(message = "Agent ID is required")
    private Long agentId;
}
