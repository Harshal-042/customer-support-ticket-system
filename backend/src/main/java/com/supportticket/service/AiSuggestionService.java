package com.supportticket.service;

import org.springframework.stereotype.Service;

@Service
public class AiSuggestionService {

    public String getSuggestion(String description) {
        if (description == null || description.isBlank()) {
            return "Thank you for submitting your issue. A support representative will assist you shortly.";
        }
        
        String lower = description.toLowerCase();
        if (lower.contains("password") || lower.contains("forgot") || lower.contains("reset")) {
            return "Please try resetting your password using the Forgot Password option on the login page or check your spam directory.";
        }
        if (lower.contains("payment") || lower.contains("upi") || lower.contains("card") || lower.contains("deducted") || lower.contains("bank")) {
            return "Please verify your transaction reference with your bank. Failed transaction amounts are automatically refunded within 24-48 hours.";
        }
        if (lower.contains("invoice") || lower.contains("receipt") || lower.contains("tax") || lower.contains("gst")) {
            return "Official tax invoices are generated automatically after payment completion and sent to your registered email.";
        }
        if (lower.contains("slow") || lower.contains("lag") || lower.contains("cache") || lower.contains("loading")) {
            return "Please clear your browser cache and cookies or test the site in Chrome Incognito mode.";
        }
        if (lower.contains("login") || lower.contains("auth") || lower.contains("access")) {
            return "Please verify your caps lock status and ensure your email address matches your profile record.";
        }

        return "Thank you for contacting customer support. We have routed your request to our team.";
    }
}
