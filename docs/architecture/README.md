# Tech Marketplace Architecture

## Overview

Tech Marketplace is a technology-focused freelance marketplace connecting
clients with developers, QA engineers, DevOps engineers, AI professionals,
and other IT specialists.

## Architecture

The application uses a Next.js full-stack architecture.

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js server-side functionality
- API routes
- Server actions
- Domain services

### Database

- PostgreSQL
- Supabase

### Testing

- Unit tests
- Integration tests
- End-to-end tests
- Playwright

## Main Domains

- Users
- Freelancer Profiles
- Clients
- Jobs
- Applications
- Messaging
- Contracts
- Payments
- Reviews
- Notifications

## Architecture Principle

Keep presentation, business logic, data access, and external integrations
separated so that individual parts can evolve without unnecessarily
affecting the rest of the application.