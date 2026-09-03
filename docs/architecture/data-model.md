# Tech Marketplace Data Model

## Overview

The marketplace uses Supabase Auth for authentication and PostgreSQL
for application data.

## Core Entities

### Profiles

Stores marketplace information for authenticated users.

Relationship:

auth.users 1 ─── 1 profiles

### Freelancer Profiles

Stores freelancer-specific information.

Relationship:

profiles 1 ─── 0..1 freelancer_profiles

### Client Profiles

Stores client-specific information.

Relationship:

profiles 1 ─── 0..1 client_profiles

### Skills

Stores technology skills available on the platform.

Examples:

- JavaScript
- TypeScript
- Python
- Java
- Playwright
- Selenium
- API Testing
- SQL
- AWS
- Azure
- React
- Next.js

### Freelancer Skills

Many-to-many relationship between freelancers and skills.

Relationship:

freelancer_profiles 1 ─── * freelancer_skills * ─── 1 skills

### Jobs

Jobs are created by clients.

Relationship:

client_profiles 1 ─── * jobs

### Applications

Freelancers submit applications to jobs.

Relationship:

freelancer_profiles 1 ─── * applications
jobs 1 ─── * applications

A freelancer should only be able to submit one active application
to the same job.

## Initial Marketplace Flow

1. User registers.
2. User profile is created.
3. User chooses freelancer or client role.
4. Freelancer completes freelancer profile.
5. Client completes client profile.
6. Client creates a job.
7. Freelancer discovers the job.
8. Freelancer submits an application.
9. Client reviews applications.
10. Client accepts an application.
11. Application becomes a contract.
12. Contract can later generate payments and reviews.

## Future Entities

The following will be implemented after the MVP foundation:

- Contracts
- Payments
- Reviews
- Messages
- Notifications
- Saved Jobs
- Saved Freelancers
- Technical Assessments
- Skill Verification
- Disputes
- Escrow