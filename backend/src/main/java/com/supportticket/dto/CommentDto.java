package com.supportticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private String userRole;
    
    @NotBlank(message = "Comment message cannot be blank")
    private String message;
    
    private LocalDateTime createdAt;
}
