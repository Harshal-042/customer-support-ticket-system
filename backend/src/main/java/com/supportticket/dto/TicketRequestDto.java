package com.supportticket.dto;

import com.supportticket.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Priority priority = Priority.MEDIUM;
}
