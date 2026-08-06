package com.supportticket.dto;

import com.supportticket.entity.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusDto {

    @NotNull(message = "Status is required")
    private Status status;
}
