# Hotel Management System (HMS) & Kiosk - Merged Project

This project is a comprehensive Hotel Management System (HMS) integrated with an AI-powered Kiosk UI. It consolidates the backend services, admin dashboard, and kiosk interface into a single managed repository.

## 🏗️ Project Architecture

The project is divided into four main components:

- **[BackEnd](./BackEnd)**: Python FastAPI application handling business logic, database management (Postgres), and AI integration.
- **[FrontEnd](./FrontEnd)**: Next.js admin dashboard for hotel and platform management.
- **[KioskUI](./KioskUI)**: React (Vite) application for the physical kiosk interface, featuring AI/Voice interaction.
- **[shared](./shared)**: Shared TypeScript contracts and documentation used by both the frontend and kiosk applications.

---

## 📂 Directory Structure

```text
ATC_Merged/
├── BackEnd/        # FastAPI, Alembic, Docker
├── FrontEnd/       # Next.js Dashboard
├── KioskUI/        # React + Vite Kiosk Interface
└── shared/         # Shared Contracts & Documentation
```

---

## 🚀 Quick Start

### 1. Backend (API & Database)

The backend is Docker-ready and uses FastAPI.

```powershell
cd BackEnd
# Build and start services (Backend, Postgres, PgAdmin)
docker-compose up --build -d
```

_Note: Ensure Docker Desktop is running before executing._

### 2. Admin FrontEnd (Dashboard)

```powershell
cd FrontEnd
npm install
npm run dev
```

_Accessible at: `http://localhost:3000`_

### 3. Kiosk UI

```powershell
cd KioskUI
npm install
npm run dev
```

_Accessible at: `http://localhost:5173`_

---

## 📜 Documentation & Contracts

For detailed information on the communication protocol between the UI and Backend, refer to the [Shared Documentation](./shared/SHARED_DOCUMENTATION.md).

- **UI State Contract**: Defines the states of the Kiosk flow (IDLE, WELCOME, AI_CHAT, etc.).
- **Event Contract**: Defines user intents (CHECK_IN_SELECTED, ROOM_SELECTED, etc.).
- **Architecture Principles**: Describes the separation of concerns between "Brain" (Backend) and "Renderer" (Frontend).

---

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL.
- **Frontend**: Next.js (Dashboard), React + Vite (Kiosk).
- **Styling**: TailwindCSS, CSS Variables.
- **Infrastructure**: Docker, Docker Compose.
