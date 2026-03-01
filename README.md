# Admission-management

A comprehensive web-based Admission Management System designed to handle student applications, seat allocations, document verifications, fee tracking, and admission confirmations for academic institutions.

## 🚀 Features

- **Dashboard & Analytics**: Real-time overview of seat statuses, applicant counts, quotas, and admission progress.
- **Applicant Management**: Comprehensive management of applicant details including personal info, category, quota type, entry type, and comprehensive tracking of documents and fee statuses.
- **Interactive Seat Allocation**: Dynamic allocation system that maps applicants to specific institutions, campuses, and programs based on availability and quota checks.
- **Quota Validation**: Automatic checks to prevent over-allocation of seats per quota (e.g., KCET, COMEDK, Management).
- **Admission Confirmation**: Streamlined workflow to confirm seats only after document verification, fee payment, and initial seat allocation are successfully validated, automatically generating a unique immutable admission number.
- **Masters & Configuration Setup**: Easy configuration of Institutions, Campuses, Departments, Programs, Program Quotas, and Academic Years.
- **Role-based Authentication**: Secure user management for different access levels (e.g., Administrator, Admission Officer).
- **Responsive UI/UX**: Premium, dark-mode styling with intuitive navigation, toast notifications, responsive data tables, and dynamic visual indicators for statuses.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with comprehensive CSS Variables for theming.

### Backend
- **Platform**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM / Database**: TypeORM with PostgreSQL
- **Security / Auth**: JSON Web Tokens (JWT) & bcryptjs
- **Other utilities**: CORS, dotenv, reflect-metadata

## 📂 Project Structure

```text
admission management/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API Request Handlers
│   │   ├── entities/         # TypeORM Database Entities (Models)
│   │   ├── middlewares/      # Auth, Error Handling, etc.
│   │   ├── routes/           # Express API Routes
│   │   ├── services/         # Business Logic Layer
│   │   ├── data-source.ts    # TypeORM Configuration & DB Connection
│   │   └── index.ts          # Express Application Entry Point
│   ├── tsconfig.json
│   ├── package.json
│   └── .env                  # Backend Environment Variables
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React UI Components (Layout, Sidebar, etc.)
│   │   ├── lib/              # Utilities (API Client, etc.)
│   │   ├── pages/            # Feature Pages (Dashboard, Allocation, ApplicantsList, etc.)
│   │   ├── App.tsx           # React Application Router Configuration
│   │   ├── index.css         # Global Styles & Theme Variables
│   │   └── main.tsx          # React DOM Render Entry
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md                 # Project Documentation
```

## ⚙️ Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database running locally or remotely

### 1. Database Configuration
Ensure your PostgreSQL server is running. Create a database for the application (e.g., `admission_db`).

Configure the database credentials in `backend/.env`:
```env
PORT=4000
DATABASE_URL="postgres://<username>:<password>@localhost:5432/<database_name>"
JWT_SECRET="your_secure_random_jwt_secret"
```

### 2. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the development server.

```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:4000` (or the port specified in `.env`), and TypeORM will automatically synchronize the database structure.

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend` directory, install dependencies, and start the Vite development server.

```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`. Make sure the frontend `lib/api.ts` file points to your backend URL correctly.

## 🔑 Key Workflows

### 1. Masters Configuration
Admins must first navigate to **Masters Setup** to define the structural hierarchy: Data flows from Academic Year → Institution → Campus → Department → Program → Quotas.

### 2. Applicant Flow
- Click **New Applicant** and fill in details.
- From the **Applicants List** page, update document and fee statuses.
- Use the **Allocate** / **Confirm** action buttons to move to the **Seat Allocation** workflow.

### 3. Allocation & Confirmation Workflow
- **Validation**: Check Document / Fee status buttons before proceeding.
- **Seat Allocation**: Select Institution, Campus, Program, and Quota. The form shows real-time total, used, and remaining seats. 
- **Confirmation**: After an applicant's seat is allocated, clicking "Confirm Admission" generates their unique admission number which becomes locked indefinitely.
