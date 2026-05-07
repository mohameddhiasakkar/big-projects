## LinkedU Digital Platform

A full-stack web platform designed to digitalize and centralize the student study-abroad journey, built during an academic internship at LinkedU.

This platform connects students, agents, and administrators in a structured environment with real-time communication, progress tracking, and AI-powered assistance.

---

## Key Features

### Multi-User System

* Role-based access: Student / Agent / Admin / Guest
* Secure authentication using JWT
* Profile management for all users

---

### Student Progress Tracking

* Full workflow tracking:

  * Orientation → Application → Visa → Arrival
* Real-time updates by agents
* Transparent student dashboard

---

### Real-Time Communication

* One-to-one chat (WebSockets)
* Message history and notifications
* Ticketing system for structured support

---

### Document Management

* Upload CV, passport, ID
* Agent verification (approve/reject)
* Document status tracking and history

---

### Quiz and Evaluation System

* Language and academic quizzes
* Automatic scoring and agent review
* Results integrated into progress tracking

---

### Admin Dashboard

* User and activity monitoring
* Agent performance tracking
* Reports and analytics

---

## AI Features (Powered by Groq)

### AI Chatbot

* Integrated chatbot for student assistance
* Helps answer questions about:

  * Study abroad
  * Application steps
  * Platform usage

---

### AI CV Review

* CV analysis using Groq API
* Feedback on:

  * Structure
  * Content quality
  * Improvements

---

### Machine Learning Prediction (Coming Soon)

* Python-based ML model
* Predicts:

  * Student success probability
  * Admission chances
* Will be integrated via API

---

## Tech Stack

### Backend

* Spring Boot (Java)
* RESTful API
* JWT Authentication
* WebSockets (real-time chat)

### Frontend

* Angular
* TypeScript
* Tailwind CSS

### Database

* PostgreSQL

### DevOps

* Docker and Docker Compose

### AI and ML

* Groq API (Chatbot and CV Review)
* Python (ML Model - upcoming)

---

## Architecture

The application follows a multi-tier architecture:

1. Frontend (Angular) – UI/UX
2. Backend (Spring Boot) – Business logic
3. Database (PostgreSQL) – Data persistence
4. AI Services (Groq + Python ML) – Intelligent features

---

## Security

* JWT-based authentication
* Role-based access control
* Encrypted passwords (bcrypt)
* Protection against:

  * SQL Injection
  * XSS
  * CSRF

---

## Installation and Setup

### Clone the repository

```bash
git clone https://github.com/your-username/linkedu-digital-platform.git
cd linkedu-digital-platform
```

### Run with Docker

```bash
docker-compose up --build
```

### Access the application

* Frontend: http://localhost:4200
* Backend API: http://localhost:8080

---

## API Overview

The backend exposes 55+ REST endpoints, including:

* Auth (/api/auth)
* Users and Roles (/api/admin/users)
* Chat (/api/chat)
* Documents (/api/documents)
* Progress (/api/progress)
* Quizzes (/api/quizzes)
* Tickets (/api/tickets)

---

## Methodology

* Agile Scrum
* Iterative development (8 sprints)
* Continuous testing and feedback cycles

---

## Project Goals

* Centralize student guidance process
* Improve communication efficiency
* Automate evaluation and tracking
* Provide scalable and secure architecture

---

## Future Improvements

* ML prediction integration (Python)
* Mobile application version
* Multi-language support
* Cloud deployment (AWS / Azure)

---

## Author

Rahmouni Haytham
Mohamed Dhia Sakkar

---

## License

This project is for academic and demonstration purposes.
