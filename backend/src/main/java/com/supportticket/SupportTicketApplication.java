package com.supportticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SupportTicketApplication {

    public static void main(String[] args) {
        SpringApplication.run(SupportTicketApplication.class, args);
        System.out.println("Customer Support Ticket System Backend started successfully on port 8080!");
    }
}
