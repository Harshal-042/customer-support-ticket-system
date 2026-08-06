\# Nexoraa Support Portal



A full-stack Customer Support Ticket Management System developed using \*\*Java Spring Boot\*\*, \*\*React.js\*\*, and \*\*MySQL\*\*. This application allows customers to create support tickets, support agents to manage and respond to tickets, and administrators to monitor and assign support requests.



\---



\# Project Overview



The Nexoraa Support Portal is designed to simplify customer support management through a role-based system.



The application provides three user roles:



\- Customer

\- Support Agent

\- Administrator



Customers can submit support requests, track ticket progress, and communicate with support agents. Agents can manage assigned tickets, update ticket status, and reply to customers. Administrators can monitor all tickets, assign tickets to agents, and view ticket statistics.



The project follows a layered architecture using Spring Boot REST APIs and React for the frontend.



\---



\# Features



\## Customer



\- User Registration

\- Secure Login using JWT Authentication

\- Create Support Ticket

\- View My Tickets

\- View Ticket Details

\- Add Comments

\- Track Ticket Status

\- Keyword-based Response Suggestions while creating tickets



\## Support Agent



\- Login

\- View Assigned Tickets

\- Reply to Customer Tickets

\- Update Ticket Status

\- View Ticket Conversation



\## Administrator



\- Login

\- View All Tickets

\- Assign Tickets to Support Agents

\- View Dashboard Statistics



\---



\# Ticket Status



\- OPEN

\- IN\_PROGRESS

\- RESOLVED

\- CLOSED



\---



\# Priority Levels



\- LOW

\- MEDIUM

\- HIGH



\---



\# Tech Stack



\## Backend



\- Java 21

\- Spring Boot 3

\- Spring Security

\- JWT Authentication

\- Spring Data JPA

\- Hibernate

\- MySQL

\- Maven

\- Lombok

\- Bean Validation



\## Frontend



\- React.js (Vite)

\- React Router

\- Axios

\- Plain CSS



\---



\# Project Structure



```

customer-support-system/



backend/

│

├── controller/

├── service/

├── repository/

├── entity/

├── dto/

├── config/

├── security/

├── exception/



src/

│

├── components/

├── pages/

├── services/

├── App.tsx

└── main.tsx

```



\---



\# Database Tables



The project uses MySQL with the following tables.



\### users



\- id

\- name

\- email

\- password

\- role



\### tickets



\- id

\- title

\- description

\- priority

\- status

\- customer\_id

\- agent\_id

\- created\_at

\- updated\_at



\### comments



\- id

\- ticket\_id

\- user\_id

\- message

\- created\_at



\---



\# REST API



\## Authentication



POST /api/auth/register



POST /api/auth/login



\---



\## Customer



POST /api/tickets



GET /api/tickets/my



GET /api/tickets/{id}



POST /api/tickets/{id}/comments



\---



\## Support Agent



GET /api/agent/tickets



PUT /api/agent/tickets/{id}/status



POST /api/agent/tickets/{id}/reply



\---



\## Administrator



GET /api/admin/tickets



PUT /api/admin/tickets/{id}/assign



GET /api/admin/dashboard



\---



\# Test Accounts



| Role | Email | Password |

|------|-------|----------|

| Customer | harshal@example.com | password123 |

| Support Agent | agent@example.com | password123 |

| Support Agent | agent2@example.com | password123 |

| Administrator | admin@example.com | password123 |



\---



\# How to Run



\## Backend



Create the MySQL database.



```sql

CREATE DATABASE support\_portal;

```



Navigate to the backend folder.



```bash

cd backend

```



Update the database username and password in:



```

src/main/resources/application.properties

```



Run the Spring Boot application.



```bash

mvn spring-boot:run

or

Directly from STS Run

```



Backend will start at:



```

http://localhost:8080

```



\---



\## Frontend



Install dependencies.



```bash

npm install

```



Start the application.



```bash

npm run dev

```



Frontend will run at:



```

http://localhost:3000

```



\---



\# Screenshots



Add screenshots of the following pages:



\- Login Page

\- Customer Dashboard

\- Create Ticket

\- Ticket Details

\- Agent Dashboard

\- Admin Dashboard



\---



\# Future Improvements



\- Email Notifications

\- File Attachments

\- Advanced Ticket Search

\- Dashboard Charts

\- Real AI Integration



\---



\# Author



\*\*Harshal Bachhav\*\*



MCA Student



Java Full Stack Developer

