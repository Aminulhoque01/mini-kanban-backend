# Mini Kanban Board

A full-stack Mini Kanban Board application built for the Full-Stack Engineering Challenge.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **DevOps:** Docker, Docker Compose
- **Database UI:** pgAdmin
- **Cache/Infrastructure:** Redis

---

## Project Architecture

```mermaid
flowchart TD
    A[Next.js Frontend] -->|HTTP / REST API| B[Express + TypeScript Backend]

    B --> C[Authentication]
    B --> D[Board Module]
    B --> E[Board Member Module]
    B --> F[Column Module]
    B --> G[Task Module]

    C --> H[(PostgreSQL)]
    D --> H
    E --> H
    F --> H
    G --> H

    B -. optional infrastructure .-> I[(Redis)]

    J[pgAdmin] --> H

    H --> K[Prisma ORM]
    K --> B
```

## Kanban Data Model

```mermaid
erDiagram
    USER ||--o{ BOARD : owns
    USER ||--o{ BOARD_MEMBER : joins
    BOARD ||--o{ BOARD_MEMBER : has
    BOARD ||--o{ COLUMN : contains
    BOARD ||--o{ TASK : contains
    COLUMN ||--o{ TASK : contains
    USER ||--o{ TASK : assigned

    USER {
        string id PK
        string name
        string email UK
        string password
        datetime createdAt
        datetime updatedAt
    }

    BOARD {
        string id PK
        string name
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    BOARD_MEMBER {
        string id PK
        string boardId FK
        string userId FK
        datetime createdAt
    }

    COLUMN {
        string id PK
        string name
        string boardId FK
        int position
        datetime createdAt
        datetime updatedAt
    }

    TASK {
        string id PK
        string title
        string description
        string status
        string priority
        string boardId FK
        string columnId FK
        string assigneeId FK
        int position
        datetime createdAt
        datetime updatedAt
    }
```

---

# Local Setup

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd mini-kanban-backend
```

If the repository contains both applications:

```text
mini-kanban/
├── backend/
└── frontend/
```

Run backend commands from the `backend` directory.

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create `.env`

Create a `.env` file in the backend root:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mini_kanban?schema=public"

JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
```

Do not commit `.env` to GitHub.

Create `.env.example`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mini_kanban?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
```

---

# Docker Setup

## 4. Start PostgreSQL

```bash
docker compose up -d postgres
```

Check:

```bash
docker ps
```

PostgreSQL:

```text
localhost:5433
```

Inside Docker, PostgreSQL uses:

```text
postgres:5432
```

---

## 5. Start pgAdmin

```bash
docker compose up -d pgadmin
```

Open:

```text
http://localhost:5050
```

Login:

```text
Email: admin@mini-kanban.local
Password: admin
```

When connecting pgAdmin to the PostgreSQL container, use:

```text
Host: postgres
Port: 5432
Database: mini_kanban
Username: postgres
Password: postgres
```

---

## 6. Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Check migration status:

```bash
npx prisma migrate status
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

For development/new schema changes:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# Run Backend

Development:

```bash
npm run dev
```

Expected:

```text
PostgreSQL database connected
Mini Kanban server running on http://localhost:5000
```

Build:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

---

# Full Docker Run

Build and start all services:

```bash
docker compose up -d --build
```

Check:

```bash
docker ps
```

Expected services:

```text
mini-kanban-postgres
mini-kanban-pgadmin
mini-kanban-backend
mini-kanban-redis
```

Services:

```text
Backend:    http://localhost:5000
PostgreSQL: localhost:5433
pgAdmin:    http://localhost:5050
Redis:      localhost:6379
```

---

# Docker Verification

## Check PostgreSQL container

```bash
docker ps
```

Then:

```bash
docker logs mini-kanban-postgres
```

---

## Check database connection

```bash
docker exec -it mini-kanban-postgres \
psql -U postgres -d mini_kanban -c "\dt"
```

Expected tables include:

```text
Board
BoardMember
Column
Task
User
_prisma_migrations
```

---

## Check Prisma migration

```bash
npx prisma migrate status
```

Expected:

```text
Database schema is up to date!
```

---

## Check PostgreSQL databases

```bash
docker exec -it mini-kanban-postgres \
psql -U postgres -c "\l"
```

Expected:

```text
mini_kanban
template0
template1
```

---

## Check PostgreSQL schema

```bash
docker exec -it mini-kanban-postgres \
psql -U postgres -d mini_kanban -c "\dn"
```

Expected:

```text
public
```

---

## Check migration table

```bash
docker exec -it mini-kanban-postgres \
psql -U postgres -d mini_kanban \
-c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at;"
```

---

# Docker Troubleshooting

If an old container with the same name is running:

```bash
docker ps -a
```

Stop it:

```bash
docker stop mini-kanban-postgres
```

Remove it:

```bash
docker rm mini-kanban-postgres
```

Then:

```bash
docker compose up -d
```

> Do not use `docker compose down -v` unless you intentionally want to delete the local PostgreSQL volume and recreate the database.

---

# API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

Protected routes use:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Boards

Board creation and board access are protected by authentication and board membership/ownership rules.

## Board Members

```text
Add member
Get members
Remove member
```

## Columns

```text
Create column
Get board columns
Update column
Delete column
Reorder columns
```

## Tasks

```text
Create task
Get tasks with pagination
Get single task
Update task
Delete task
Move/reorder task
```

Task movement supports:

- Reordering inside the same column
- Moving to another column
- Moving to a specific position
- Maintaining stable positions

---

# Authorization

A user can access a board only when:

1. They own the board, or
2. They are explicitly added as a board member.

The API also validates board/column relationships to prevent cross-board access.

Examples of protected operations:

```text
Board access
Column access
Task access
Task creation
Task update
Task deletion
Task movement
Column reordering
Board member management
```

---

# Git

Recommended `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

Never commit:

```text
.env
node_modules/
dist/
database credentials
JWT secrets
```

---

# Development Workflow

```text
1. Start Docker
2. Start PostgreSQL
3. Run Prisma migrations
4. Generate Prisma Client
5. Start backend
6. Test APIs
7. Start frontend
8. Connect frontend with REST APIs
9. Implement drag-and-drop Kanban UI
```

---

# Assessment Coverage

| Requirement | Status |
|---|---|
| User Registration | ✅ |
| User Login | ✅ |
| JWT Authentication | ✅ |
| Board Creation | ✅ |
| Board Sharing | ✅ |
| Access Control | ✅ |
| Column CRUD | ✅ |
| Column Reordering | ✅ |
| Task CRUD | ✅ |
| Task Pagination | ✅ |
| Task Assignment | ✅ |
| Task Movement | ✅ |
| Same-column Reordering | ✅ |
| Cross-column Movement | ✅ |
| Position-based Ordering | ✅ |
| PostgreSQL | ✅ |
| Prisma | ✅ |
| Docker | ✅ |
| pgAdmin | ✅ |

---

# Final Docker Verification Checklist

Before submission:

```bash
docker compose up -d --build
docker ps
docker logs mini-kanban-postgres
docker logs mini-kanban-backend
npx prisma migrate status
```

Then verify:

```text
✅ PostgreSQL container running
✅ Backend container running
✅ Database connected
✅ Prisma migrations applied
✅ User table exists
✅ Board table exists
✅ BoardMember table exists
✅ Column table exists
✅ Task table exists
✅ API responds on port 5000
```

---


# Mini Kanban Architecture

```mermaid
flowchart TD
    A[Next.js Frontend] -->|REST API| B[Express TypeScript Backend]
    B --> C[Auth]
    B --> D[Board]
    B --> E[Board Members]
    B --> F[Columns]
    B --> G[Tasks]
    B --> H[Prisma ORM]
    H --> I[(PostgreSQL)]
    J[pgAdmin] --> I
    B -.-> K[(Redis)]
```

## Data Flow

```mermaid
flowchart LR
    U[User] --> FE[Next.js]
    FE --> API[Express API]
    API --> AUTH[JWT Auth]
    AUTH --> SVC[Service Layer]
    SVC --> PRISMA[Prisma]
    PRISMA --> DB[(PostgreSQL)]
```

## Kanban Ordering

```mermaid
flowchart TD
    BOARD[Board]
    BOARD --> C1[Column position 0]
    BOARD --> C2[Column position 1]
    BOARD --> C3[Column position 2]

    C1 --> T1[Task position 0]
    C1 --> T2[Task position 1]
    C1 --> T3[Task position 2]

    C2 --> T4[Task position 0]
    C2 --> T5[Task position 1]

    C3 --> T6[Task position 0]
```

# License

This project was created as a technical assessment project.
